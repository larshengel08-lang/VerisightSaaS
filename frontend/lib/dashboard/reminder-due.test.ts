import { describe, expect, it } from 'vitest'
import { getReminderDueDate, isReminderDue } from './reminder-due'

describe('reminder-due helpers', () => {
  it('returns null when there is no launch date', () => {
    expect(getReminderDueDate(null, 5)).toBeNull()
  })

  it('adds the reminder delay (in days) to the launch date', () => {
    expect(getReminderDueDate('2026-06-01', 5)).toBe('2026-06-06')
  })

  it('is not due before the reminder date', () => {
    expect(isReminderDue({ launchDate: '2026-06-01', delayDays: 5, today: '2026-06-05', alreadySentAt: null })).toBe(false)
  })

  it('is due on and after the reminder date when nothing was sent yet', () => {
    expect(isReminderDue({ launchDate: '2026-06-01', delayDays: 5, today: '2026-06-06', alreadySentAt: null })).toBe(true)
    expect(isReminderDue({ launchDate: '2026-06-01', delayDays: 5, today: '2026-06-09', alreadySentAt: null })).toBe(true)
  })

  it('is not due once a reminder was sent on or after the due date', () => {
    expect(isReminderDue({ launchDate: '2026-06-01', delayDays: 5, today: '2026-06-09', alreadySentAt: '2026-06-07T10:00:00Z' })).toBe(false)
  })

  it('ignores a stale reminder sent before the current due date', () => {
    expect(isReminderDue({ launchDate: '2026-06-01', delayDays: 5, today: '2026-06-09', alreadySentAt: '2026-06-03T10:00:00Z' })).toBe(true)
  })

  it('returns null for a non-finite delay', () => {
    expect(getReminderDueDate('2026-06-01', Number.NaN)).toBeNull()
  })

  it('handles month rollover when adding the delay', () => {
    expect(getReminderDueDate('2026-06-28', 5)).toBe('2026-07-03')
  })

  it('is not due when there is no launch date', () => {
    expect(isReminderDue({ launchDate: null, delayDays: 5, today: '2026-06-09', alreadySentAt: null })).toBe(false)
  })
})
