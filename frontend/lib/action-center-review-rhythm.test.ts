import { describe, expect, it } from 'vitest'
import {
  buildDefaultActionCenterReviewRhythmConfig,
  classifyActionCenterReviewRhythmStatus,
  isActionCenterReviewRhythmSupportedScanType,
  normalizeActionCenterReviewRhythmConfig,
  validateActionCenterReviewRhythmInput,
} from './action-center-review-rhythm'

describe('action center review rhythm contract', () => {
  it('provides the bounded default config for ExitScan routes', () => {
    expect(buildDefaultActionCenterReviewRhythmConfig()).toEqual({
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
  })

  it('normalizes persisted payloads and falls back to defaults when values are missing', () => {
    expect(
      normalizeActionCenterReviewRhythmConfig({
        cadence_days: null,
        reminder_lead_days: 5,
        escalation_lead_days: null,
        reminders_enabled: null,
      }),
    ).toEqual({
      cadenceDays: 14,
      reminderLeadDays: 5,
      escalationLeadDays: 7,
      remindersEnabled: true,
    })
  })

  it('rejects invalid cadence and escalation combinations', () => {
    expect(
      validateActionCenterReviewRhythmInput({
        cadenceDays: 7,
        reminderLeadDays: 7,
        escalationLeadDays: 5,
        remindersEnabled: true,
      }),
    ).toEqual({
      ok: false,
      reason: 'invalid-reminder-window',
    })
  })

  it('rejects non-exit scan types in the shared contract layer', () => {
    expect(isActionCenterReviewRhythmSupportedScanType('exit')).toBe(true)
    expect(isActionCenterReviewRhythmSupportedScanType('pulse')).toBe(false)
    expect(
      validateActionCenterReviewRhythmInput(
        {
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          remindersEnabled: true,
        },
        'pulse',
      ),
    ).toEqual({
      ok: false,
      reason: 'unsupported-scan-type',
    })
  })

  it('classifies stale routes when the review date is far behind the cadence window', () => {
    const status = classifyActionCenterReviewRhythmStatus({
      reviewDate: '2026-05-01',
      now: new Date('2026-05-28T12:00:00.000Z'),
      config: {
        cadenceDays: 14,
        reminderLeadDays: 3,
        escalationLeadDays: 7,
        remindersEnabled: true,
      },
      itemStatus: 'reviewbaar',
    })

    expect(status).toBe('stale')
  })

  it('treats date-only review dates by a deterministic UTC calendar day instead of host-local time', () => {
    const sameInstantWithConflictingLocalDay = {
      getTime: () => new Date('2026-05-16T00:30:00.000Z').getTime(),
      getUTCFullYear: () => 2026,
      getUTCMonth: () => 4,
      getUTCDate: () => 16,
      getFullYear: () => 2026,
      getMonth: () => 4,
      getDate: () => 15,
    } as Date

    const status = classifyActionCenterReviewRhythmStatus({
      reviewDate: '2026-05-15',
      now: sameInstantWithConflictingLocalDay,
      config: {
        cadenceDays: 14,
        reminderLeadDays: 3,
        escalationLeadDays: 7,
        remindersEnabled: true,
      },
      itemStatus: 'reviewbaar',
    })

    expect(status).toBe('overdue')
  })
})
