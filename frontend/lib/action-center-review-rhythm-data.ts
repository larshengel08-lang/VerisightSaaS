import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import { deriveActionCenterRouteGovernanceSignals } from '@/lib/action-center-governance'
import { buildActionCenterGovernanceQueue } from '@/lib/action-center-governance-queues'
import { buildActionCenterMeasurementReadback } from '@/lib/action-center-measurement-readback'
import { buildActionCenterReviewOversightSummary } from '@/lib/action-center-review-oversight'
import {
  getActionCenterEnabledRouteDefaults,
  getActionCenterRouteFamilyLabel,
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

function toReviewRhythmConfigFromRouteDefaults(
  routeDefaults: NonNullable<ReturnType<typeof getActionCenterEnabledRouteDefaults>>,
): ActionCenterReviewRhythmConfig {
  return normalizeActionCenterReviewRhythmConfig({
    cadence_days: routeDefaults.cadenceDays,
    reminder_lead_days: routeDefaults.reminderLeadDays,
    escalation_lead_days: routeDefaults.escalationLeadDays,
    reminders_enabled: routeDefaults.remindersEnabled,
  })
}

function normalizeConfigRow(args: {
  row: ActionCenterReviewRhythmConfigRow
  routeDefaultConfig: ActionCenterReviewRhythmConfig
}): ActionCenterReviewRhythmConfig | null {
  if (!args.row.route_id) {
    return null
  }

  return normalizeActionCenterReviewRhythmConfig({
    cadence_days: args.row.cadence_days ?? args.routeDefaultConfig.cadenceDays,
    reminder_lead_days: args.row.reminder_lead_days ?? args.routeDefaultConfig.reminderLeadDays,
    escalation_lead_days:
      args.row.escalation_lead_days ?? args.routeDefaultConfig.escalationLeadDays,
    reminders_enabled: args.row.reminders_enabled ?? args.routeDefaultConfig.remindersEnabled,
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

function getCanonicalRouteFamilySourceLabel(args: {
  routeId: string
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
  fallbackLabel: string
}) {
  return getActionCenterRouteFamilyLabel(args.routeScanTypeByRouteId[args.routeId]) ?? args.fallbackLabel
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
    const sourceLabel = getCanonicalRouteFamilySourceLabel({
      routeId: item.routeId,
      routeScanTypeByRouteId: args.routeScanTypeByRouteId,
      fallbackLabel: item.sourceLabel,
    })

    if (!governance) {
      return {
        ...item,
        sourceLabel,
      }
    }

    return {
      ...item,
      sourceLabel,
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
      sourceLabel: getCanonicalRouteFamilySourceLabel({
        routeId,
        routeScanTypeByRouteId: args.routeScanTypeByRouteId,
        fallbackLabel: governance.sourceLabel,
      }),
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
    const enabledRouteDefaults = getActionCenterEnabledRouteDefaults(
      args.routeScanTypeByRouteId[row.route_id ?? ''],
    )
    const routeDefaultConfig = enabledRouteDefaults
      ? toReviewRhythmConfigFromRouteDefaults(enabledRouteDefaults)
      : buildDefaultActionCenterReviewRhythmConfig()
    const config = normalizeConfigRow({
      row,
      routeDefaultConfig,
    })
    if (row.route_id && config) {
      acc[row.route_id] = config
    }
    return acc
  }, {})
  const configByRouteId = Object.fromEntries(
    eligibleItems.map((item) => {
      const routeId = getReviewRhythmRouteId(item)
      const enabledRouteDefaults = getActionCenterEnabledRouteDefaults(
        args.routeScanTypeByRouteId[routeId],
      )
      const routeDefaultConfig = enabledRouteDefaults
        ? toReviewRhythmConfigFromRouteDefaults(enabledRouteDefaults)
        : buildDefaultActionCenterReviewRhythmConfig()

      return [routeId, persistedConfigByRouteId[routeId] ?? routeDefaultConfig]
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
  const governanceQueue = buildActionCenterGovernanceQueue({
    items: eligibleItems,
    now: args.now,
    routeScanTypeByRouteId: args.routeScanTypeByRouteId,
  })
  const measurementReadback = buildActionCenterMeasurementReadback({
    items: eligibleItems,
    governanceQueue,
    routeScanTypeByRouteId: args.routeScanTypeByRouteId,
    now: args.now,
  })

  return {
    configByRouteId,
    summary,
    oversight: governanceAwareOversight,
    governanceQueue,
    measurementReadback,
  }
}
