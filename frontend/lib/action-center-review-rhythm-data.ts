import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
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

export async function getActionCenterReviewRhythmData(args: {
  items: ActionCenterPreviewItem[]
  now: Date
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
}) {
  const eligibleItems = args.items.filter((item) =>
    getActionCenterEnabledRouteDefaults(args.routeScanTypeByRouteId[item.id]) !== null,
  )
  const routeIds = eligibleItems.map((item) => item.id)
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
    eligibleItems.map((item) => [item.id, persistedConfigByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig()]),
  )

  const summary = eligibleItems.reduce(
    (acc, item) => {
      const config = configByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig()
      const health = classifyActionCenterReviewRhythmStatus({
        reviewDate: item.reviewDate,
        now: args.now,
        config,
        itemStatus: item.status,
      })

      if (health === 'stale') acc.staleCount += 1
      if (health === 'overdue') acc.overdueCount += 1
      if (health === 'upcoming') acc.upcomingCount += 1
      if (health !== 'completed' && config.remindersEnabled) acc.reminderManagedCount += 1

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

  return {
    configByRouteId,
    summary,
    oversight,
  }
}
