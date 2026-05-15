import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'

export interface ActionCenterReviewRhythmConfig {
  cadenceDays: 7 | 14 | 30
  reminderLeadDays: 1 | 3 | 5
  escalationLeadDays: 3 | 7 | 14
  remindersEnabled: boolean
}

export type ActionCenterReviewRhythmHealth = 'upcoming' | 'overdue' | 'stale' | 'completed'

const DEFAULT_ACTION_CENTER_REVIEW_RHYTHM_CONFIG: ActionCenterReviewRhythmConfig = {
  cadenceDays: 14,
  reminderLeadDays: 3,
  escalationLeadDays: 7,
  remindersEnabled: true,
}

function parseReviewDate(value: string) {
  const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function buildDefaultActionCenterReviewRhythmConfig(): ActionCenterReviewRhythmConfig {
  return { ...DEFAULT_ACTION_CENTER_REVIEW_RHYTHM_CONFIG }
}

export function normalizeActionCenterReviewRhythmConfig(input: {
  cadence_days?: number | null
  reminder_lead_days?: number | null
  escalation_lead_days?: number | null
  reminders_enabled?: boolean | null
}): ActionCenterReviewRhythmConfig {
  const defaults = buildDefaultActionCenterReviewRhythmConfig()

  return {
    cadenceDays:
      input.cadence_days === 7 || input.cadence_days === 30 ? input.cadence_days : defaults.cadenceDays,
    reminderLeadDays:
      input.reminder_lead_days === 1 || input.reminder_lead_days === 5
        ? input.reminder_lead_days
        : defaults.reminderLeadDays,
    escalationLeadDays:
      input.escalation_lead_days === 3 || input.escalation_lead_days === 14
        ? input.escalation_lead_days
        : defaults.escalationLeadDays,
    remindersEnabled: input.reminders_enabled ?? defaults.remindersEnabled,
  }
}

export function validateActionCenterReviewRhythmInput(config: ActionCenterReviewRhythmConfig) {
  if (config.remindersEnabled && config.reminderLeadDays >= config.cadenceDays) {
    return { ok: false as const, reason: 'invalid-reminder-window' as const }
  }

  if (config.escalationLeadDays <= config.reminderLeadDays) {
    return { ok: false as const, reason: 'invalid-escalation-window' as const }
  }

  return { ok: true as const, reason: null }
}

export function classifyActionCenterReviewRhythmStatus(args: {
  reviewDate: string | null
  now: Date
  config: ActionCenterReviewRhythmConfig
  itemStatus: ActionCenterPreviewStatus
}): ActionCenterReviewRhythmHealth {
  if (args.itemStatus === 'afgerond' || args.itemStatus === 'gestopt') {
    return 'completed'
  }

  if (!args.reviewDate) {
    return 'stale'
  }

  const scheduled = parseReviewDate(args.reviewDate)
  if (!scheduled) {
    return 'stale'
  }

  const diffDays = Math.floor((args.now.getTime() - scheduled.getTime()) / 86_400_000)

  if (diffDays > args.config.cadenceDays) {
    return 'stale'
  }

  if (diffDays > 0) {
    return 'overdue'
  }

  return 'upcoming'
}
