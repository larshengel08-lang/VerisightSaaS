import { describe, expect, it } from 'vitest'
import {
  CLOSE_DEFAULT_DAYS,
  CLOSE_MAX_DAYS,
  CLOSE_MIN_DAYS,
  DEFAULT_REMINDER_AFTER_DAYS,
  REMINDER_CHOICES,
  addDays,
  defaultClosesAt,
  isDateOnly,
  readReminderChoice,
  reminderConfigFromChoice,
  validateSchedule,
} from './campaign-schedule'

const TODAY = '2026-09-16'

describe('campaign-schedule constanten (spec 2026-09-16 par. 4.1)', () => {
  it('sluitdatum standaard +21, minimaal +7, maximaal +90; herinnering standaard 5', () => {
    expect(CLOSE_DEFAULT_DAYS).toBe(21)
    expect(CLOSE_MIN_DAYS).toBe(7)
    expect(CLOSE_MAX_DAYS).toBe(90)
    expect(DEFAULT_REMINDER_AFTER_DAYS).toBe(5)
    expect(REMINDER_CHOICES.map((c) => c.value)).toEqual([3, 5, 7, 'none'])
  })
})

describe('addDays / defaultClosesAt / isDateOnly', () => {
  it('telt dagen op over een maandgrens', () => {
    expect(addDays('2026-09-25', 7)).toBe('2026-10-02')
    expect(defaultClosesAt('2026-09-16')).toBe('2026-10-07')
  })

  it('herkent alleen echte datums', () => {
    expect(isDateOnly('2026-09-16')).toBe(true)
    expect(isDateOnly('2026-13-01')).toBe(false)
    expect(isDateOnly('2026-02-30')).toBe(false)
    expect(isDateOnly('16-09-2026')).toBe(false)
    expect(isDateOnly(null)).toBe(false)
  })
})

describe('validateSchedule', () => {
  const valid = { launchDate: '2026-09-20', closesAt: '2026-10-11', reminderChoice: 5 as const, today: TODAY }

  it('accepteert de standaardplanning en levert de reminder_config', () => {
    expect(validateSchedule(valid)).toEqual({
      ok: true,
      value: {
        launchDate: '2026-09-20',
        closesAt: '2026-10-11',
        reminderConfig: { enabled: true, firstReminderAfterDays: 5, maxReminderCount: 1 },
      },
    })
  })

  it('eist een startdatum vanaf vandaag, in het Nederlands', () => {
    expect(validateSchedule({ ...valid, launchDate: '' })).toEqual({ ok: false, error: 'Vul een startdatum in.' })
    expect(validateSchedule({ ...valid, launchDate: '2026-09-15' })).toEqual({ ok: false, error: 'Kies een startdatum vanaf vandaag.' })
    expect(validateSchedule({ ...valid, launchDate: TODAY, closesAt: '2026-10-07' }).ok).toBe(true)
    expect(validateSchedule({ ...valid, launchDate: 'gisteren' })).toEqual({ ok: false, error: 'De startdatum is geen geldige datum.' })
  })

  it('houdt de sluitdatum tussen start + 7 en start + 90 en noemt de grens als datum', () => {
    expect(validateSchedule({ ...valid, closesAt: '' })).toEqual({ ok: false, error: 'Vul een sluitdatum in.' })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-26' })).toEqual({
      ok: false,
      error: 'Kies een sluitdatum van minimaal 7 dagen na de start, dus op of na 27 september 2026.',
    })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 3 }).ok).toBe(true)
    expect(validateSchedule({ ...valid, closesAt: '2026-12-19' }).ok).toBe(true)
    expect(validateSchedule({ ...valid, closesAt: '2026-12-20' })).toEqual({
      ok: false,
      error: 'Kies een sluitdatum van uiterlijk 90 dagen na de start, dus op of voor 19 december 2026.',
    })
  })

  it('eist dat de herinnering voor de sluitdatum valt', () => {
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 7 })).toEqual({
      ok: false,
      error: 'De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.',
    })
    expect(validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 'none' }).ok).toBe(true)
  })

  it('zet "geen herinnering" om naar enabled: false met de standaardvertraging', () => {
    const result = validateSchedule({ ...valid, reminderChoice: 'none' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.reminderConfig).toEqual({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })
    }
  })

  it('wijst een onbekende herinneringskeuze af (de server vertrouwt de client niet)', () => {
    const result = validateSchedule({ ...valid, reminderChoice: 4 as unknown as 5 })
    expect(result).toEqual({ ok: false, error: 'Kies een herinnering van 3, 5 of 7 dagen na de start, of geen herinnering.' })
  })

  it('bevat geen em- of en-dashes in de meldingen', () => {
    const results = [
      validateSchedule({ ...valid, closesAt: '2026-09-26' }),
      validateSchedule({ ...valid, closesAt: '2026-12-20' }),
      validateSchedule({ ...valid, closesAt: '2026-09-27', reminderChoice: 7 }),
    ]
    for (const r of results) {
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).not.toMatch(/[—–]/)
    }
  })
})

describe('readReminderChoice / reminderConfigFromChoice', () => {
  it('geeft null als er nooit iets is opgeslagen (kolomdefault {} of null)', () => {
    expect(readReminderChoice(null)).toBeNull()
    expect(readReminderChoice({})).toBeNull()
    expect(readReminderChoice('x')).toBeNull()
  })

  it('leest een opgeslagen keuze terug', () => {
    expect(readReminderChoice({ enabled: true, firstReminderAfterDays: 7, maxReminderCount: 1 })).toBe(7)
    expect(readReminderChoice({ enabled: false, firstReminderAfterDays: 5, maxReminderCount: 1 })).toBe('none')
    expect(readReminderChoice({ enabled: true, firstReminderAfterDays: 99 })).toBe(5)
  })

  it('is de inverse van reminderConfigFromChoice', () => {
    for (const choice of [3, 5, 7, 'none'] as const) {
      expect(readReminderChoice(reminderConfigFromChoice(choice))).toBe(choice)
    }
  })
})
