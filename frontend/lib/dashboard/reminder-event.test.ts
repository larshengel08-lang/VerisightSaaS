import { describe, expect, it } from 'vitest'
import { isReminderHandled, isSkippedReminderEvent } from './reminder-event'

describe('isSkippedReminderEvent', () => {
  it('herkent een door de klant overgeslagen herinnering', () => {
    expect(isSkippedReminderEvent({ metadata: { channel: 'skipped_by_customer' } })).toBe(true)
  })

  it('telt een verstuurde herinnering of ontbrekende metadata niet als overgeslagen', () => {
    expect(isSkippedReminderEvent({ metadata: { channel: 'manual_copy' } })).toBe(false)
    expect(isSkippedReminderEvent({ metadata: null })).toBe(false)
    expect(isSkippedReminderEvent({})).toBe(false)
    expect(isSkippedReminderEvent(null)).toBe(false)
    expect(isSkippedReminderEvent(undefined)).toBe(false)
    expect(isSkippedReminderEvent({ metadata: 'skipped_by_customer' })).toBe(false)
  })
})

describe('isReminderHandled (zelfde regel als isReminderDue)', () => {
  const launch = { launchDate: '2026-09-16', delayDays: 5 }

  it('telt een event vóór de herinneringsdag niet mee', () => {
    expect(isReminderHandled({ ...launch, handledAt: '2026-09-20T23:00:00Z' })).toBe(false)
  })

  it('telt een event op of na de herinneringsdag wel mee', () => {
    expect(isReminderHandled({ ...launch, handledAt: '2026-09-21T09:30:00Z' })).toBe(true)
    expect(isReminderHandled({ ...launch, handledAt: '2026-09-25T09:30:00Z' })).toBe(true)
  })

  it('is niet afgehandeld zonder event of zonder startdatum', () => {
    expect(isReminderHandled({ ...launch, handledAt: null })).toBe(false)
    expect(isReminderHandled({ launchDate: null, delayDays: 5, handledAt: '2026-09-25T09:30:00Z' })).toBe(false)
  })
})
