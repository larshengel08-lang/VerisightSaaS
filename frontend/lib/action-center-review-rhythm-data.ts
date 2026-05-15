import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
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

function isExitRouteItem(item: Pick<ActionCenterPreviewItem, 'sourceLabel'>) {
  return item.sourceLabel === 'ExitScan'
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
}) {
  const exitItems = args.items.filter(isExitRouteItem)
  const routeIds = exitItems.map((item) => item.id)
  const admin = createAdminClient()

  const { data } =
    routeIds.length > 0
      ? await admin
          .from('action_center_review_rhythm_configs')
          .select('route_id, cadence_days, reminder_lead_days, escalation_lead_days, reminders_enabled')
          .in('route_id', routeIds)
      : { data: [] }

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
    exitItems.map((item) => [item.id, persistedConfigByRouteId[item.id] ?? buildDefaultActionCenterReviewRhythmConfig()]),
  )

  const summary = exitItems.reduce(
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

  return {
    configByRouteId,
    summary,
  }
}
