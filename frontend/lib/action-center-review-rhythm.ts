import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'
import {
  getActionCenterEnabledRouteDefaults,
  type ActionCenterRouteDefaultsEnabledScanType,
} from '@/lib/action-center-route-defaults'

export type ActionCenterReviewRhythmSupportedScanType = ActionCenterRouteDefaultsEnabledScanType
export interface ActionCenterReviewRhythmConfig {
  cadenceDays: 7 | 14 | 30
  reminderLeadDays: 1 | 3 | 5
  escalationLeadDays: 3 | 7 | 14
  remindersEnabled: boolean
}

export type ActionCenterReviewRhythmHealth = 'upcoming' | 'overdue' | 'stale' | 'completed'

function toCadenceDays(value: number): ActionCenterReviewRhythmConfig['cadenceDays'] {
  return value === 7 || value === 30 ? value : 14
}

function toReminderLeadDays(value: number): ActionCenterReviewRhythmConfig['reminderLeadDays'] {
  return value === 1 || value === 5 ? value : 3
}

function toEscalationLeadDays(value: number): ActionCenterReviewRhythmConfig['escalationLeadDays'] {
  return value === 3 || value === 14 ? value : 7
}

function isDateOnlyValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function parseReviewDate(value: string) {
  const parsed = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getUtcCalendarDayDiff(reviewDate: string, now: Date) {
  const [year, month, day] = reviewDate.split('-').map((value) => Number(value))
  if (!year || !month || !day) return null

  const reviewDay = Date.UTC(year, month - 1, day)
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return Math.round((nowDay - reviewDay) / 86_400_000)
}

export function isActionCenterReviewRhythmSupportedScanType(
  scanType: string | null | undefined,
): scanType is ActionCenterReviewRhythmSupportedScanType {
  return getActionCenterEnabledRouteDefaults(scanType) !== null
}

export function buildDefaultActionCenterReviewRhythmConfig(): ActionCenterReviewRhythmConfig {
  const defaults = getActionCenterEnabledRouteDefaults('exit')
  if (!defaults) {
    throw new Error('Action Center route defaults lost the enabled baseline route.')
  }

  return {
    cadenceDays: toCadenceDays(defaults.cadenceDays),
    reminderLeadDays: toReminderLeadDays(defaults.reminderLeadDays),
    escalationLeadDays: toEscalationLeadDays(defaults.escalationLeadDays),
    remindersEnabled: defaults.remindersEnabled,
  }
}

export function normalizeActionCenterReviewRhythmConfig(input: {
  cadence_days?: number | null
  reminder_lead_days?: number | null
  escalation_lead_days?: number | null
  reminders_enabled?: boolean | null
}): ActionCenterReviewRhythmConfig {
  const defaults = buildDefaultActionCenterReviewRhythmConfig()

  return {
    cadenceDays: toCadenceDays(input.cadence_days ?? defaults.cadenceDays),
    reminderLeadDays: toReminderLeadDays(input.reminder_lead_days ?? defaults.reminderLeadDays),
    escalationLeadDays: toEscalationLeadDays(input.escalation_lead_days ?? defaults.escalationLeadDays),
    remindersEnabled: input.reminders_enabled ?? defaults.remindersEnabled,
  }
}

export function validateActionCenterReviewRhythmInput(
  config: ActionCenterReviewRhythmConfig,
  scanType: string | null | undefined = 'exit',
) {
  if (!isActionCenterReviewRhythmSupportedScanType(scanType)) {
    return { ok: false as const, reason: 'unsupported-scan-type' as const }
  }

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

  const diffDays = isDateOnlyValue(args.reviewDate)
    ? getUtcCalendarDayDiff(args.reviewDate, args.now)
    : Math.floor((args.now.getTime() - scheduled.getTime()) / 86_400_000)

  if (diffDays === null) {
    return 'stale'
  }

  if (diffDays > args.config.cadenceDays) {
    return 'stale'
  }

  if (diffDays > 0) {
    return 'overdue'
  }

  return 'upcoming'
}
