import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import { deriveActionCenterRouteGovernanceSignals } from '@/lib/action-center-governance'
import { buildActionCenterReviewOversightSummary } from '@/lib/action-center-review-oversight'
import {
  getActionCenterEnabledRouteDefaults,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'
import {
  buildDefaultActionCenterReviewRhythmConfig,
  classifyActionCenterReviewRhythmStatus,
  normalizeActionCenterReviewRhythmConfig,
  type ActionCenterReviewRhythmConfig,
} from '@/lib/action-center-review-rhythm'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionCenterReviewRhythmConfigRow = {
  route_id: string | null
  cadence_days: number | null
  reminder_lead_days: number | null
  escalation_lead_days: number | null
  reminders_enabled: boolean | null
}

type GovernanceMergedAttentionItem = ReturnType<typeof buildActionCenterReviewOversightSummary>['attentionItems'][number] & {
  governanceSignals?: NonNullable<ReturnType<typeof deriveActionCenterRouteGovernanceSignals>>['signals']
}

function getReviewRhythmRouteId(item: Pick<ActionCenterPreviewItem, 'coreSemantics'>) {
  return item.coreSemantics.route.routeId
}

function normalizeConfigRow(row: ActionCenterReviewRhythmConfigRow): ActionCenterReviewRhythmConfig | null {
  if (!row.route_id) {
    return null
  }

  return normalizeActionCenterReviewRhythmConfig({
    cadence_days: row.cadence_days,
    reminder_lead_days: row.reminder_lead_days,
    escalation_lead_days: row.escalation_lead_days,
    reminders_enabled: row.reminders_enabled,
  })
}

function sortOversightAttentionItems(items: GovernanceMergedAttentionItem[]) {
  const priority = (state: GovernanceMergedAttentionItem['state']) => {
    if (state === 'escalation-sensitive') return 0
    if (state === 'stale') return 1
    return 2
  }

  return items
    .slice()
    .sort((left, right) => {
      const stateDiff = priority(left.state) - priority(right.state)
      if (stateDiff !== 0) {
        return stateDiff
      }

      return left.scopeLabel.localeCompare(right.scopeLabel)
    })
    .slice(0, 5)
}

function mergeGovernanceIntoOversight(args: {
  items: ActionCenterPreviewItem[]
  oversight: ReturnType<typeof buildActionCenterReviewOversightSummary>
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
  now: Date
}) {
  const governanceByRouteId = new Map(
    args.items
      .map((item) =>
        deriveActionCenterRouteGovernanceSignals({
          item,
          scanType: args.routeScanTypeByRouteId[getReviewRhythmRouteId(item)],
          now: args.now,
        }),
      )
      .filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot))
      .map((snapshot) => [snapshot.routeId, snapshot] as const),
  )

  const mergedAttentionItems: GovernanceMergedAttentionItem[] = args.oversight.attentionItems.map((item) => {
    const governance = governanceByRouteId.get(item.routeId)
    if (!governance) {
      return item
    }

    return {
      ...item,
      governanceSignals: governance.signals,
    }
  })

  const existingRouteIds = new Set(mergedAttentionItems.map((item) => item.routeId))

  for (const item of args.items) {
    const routeId = getReviewRhythmRouteId(item)
    const governance = governanceByRouteId.get(routeId)
    if (!governance || existingRouteIds.has(routeId)) {
      continue
    }

    mergedAttentionItems.push({
      routeId,
      state: 'stale',
      scopeLabel: governance.scopeLabel,
      sourceLabel: governance.sourceLabel,
      reviewDateLabel: governance.reviewDateLabel,
      governanceSignals: governance.signals,
    })
  }

  return {
    ...args.oversight,
    attentionItems: sortOversightAttentionItems(mergedAttentionItems),
  }
}

export async function getActionCenterReviewRhythmData(args: {
  items: ActionCenterPreviewItem[]
  now: Date
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
}) {
  const eligibleItems = args.items.filter((item) =>
    getActionCenterEnabledRouteDefaults(args.routeScanTypeByRouteId[getReviewRhythmRouteId(item)]) !== null,
  )
  const routeIds = eligibleItems.map((item) => getReviewRhythmRouteId(item))
  const admin = createAdminClient()

  const { data, error } =
    routeIds.length > 0
      ? await admin
          .from('action_center_review_rhythm_configs')
          .select('route_id, cadence_days, reminder_lead_days, escalation_lead_days, reminders_enabled')
          .in('route_id', routeIds)
      : { data: [] }

  if (error) {
    throw new Error(error.message ?? 'Action Center review rhythm config query failed.')
  }

  const persistedConfigByRouteId = ((data ?? []) as ActionCenterReviewRhythmConfigRow[]).reduce<
    Record<string, ActionCenterReviewRhythmConfig>
  >((acc, row) => {
    const config = normalizeConfigRow(row)
    if (row.route_id && config) {
      acc[row.route_id] = config
    }
    return acc
  }, {})
  const configByRouteId = Object.fromEntries(
    eligibleItems.map((item) => {
      const routeId = getReviewRhythmRouteId(item)
      return [routeId, persistedConfigByRouteId[routeId] ?? buildDefaultActionCenterReviewRhythmConfig()]
    }),
  )

  const summary = eligibleItems.reduce(
    (acc, item) => {
      const routeId = getReviewRhythmRouteId(item)
      const boundedConfig = configByRouteId[routeId] ?? buildDefaultActionCenterReviewRhythmConfig()
      const health = classifyActionCenterReviewRhythmStatus({
        reviewDate: item.reviewDate,
        now: args.now,
        config: boundedConfig,
        itemStatus: item.status,
      })

      if (health === 'stale') acc.staleCount += 1
      if (health === 'overdue') acc.overdueCount += 1
      if (health === 'upcoming') acc.upcomingCount += 1
      if (health !== 'completed' && boundedConfig.remindersEnabled) acc.reminderManagedCount += 1

      return acc
    },
    {
      staleCount: 0,
      overdueCount: 0,
      upcomingCount: 0,
      reminderManagedCount: 0,
    },
  )
  const oversight = buildActionCenterReviewOversightSummary({
    items: eligibleItems,
    configByRouteId,
    routeScanTypeByRouteId: args.routeScanTypeByRouteId,
    now: args.now,
  })
  const governanceAwareOversight = mergeGovernanceIntoOversight({
    items: eligibleItems,
    oversight,
    routeScanTypeByRouteId: args.routeScanTypeByRouteId,
    now: args.now,
  })

  return {
    configByRouteId,
    summary,
    oversight: governanceAwareOversight,
  }
}
