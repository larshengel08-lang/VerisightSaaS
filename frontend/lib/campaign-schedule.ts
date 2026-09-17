import {
  REMINDER_DELAY_PRESETS,
  type ReminderConfig,
  type ReminderDelayPreset,
} from '@/lib/launch-controls'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'

/**
 * Planning van een meting zoals de klant die in stap 1 van de wizard instelt
 * (spec 2026-09-16 par. 4.1). Eén validator voor client en server: de wizard
 * geeft dezelfde melding als saveLaunchSetupAction, en de server vertrouwt
 * de client niet.
 */
export const CLOSE_DEFAULT_DAYS = 21
export const CLOSE_MIN_DAYS = 7
export const CLOSE_MAX_DAYS = 90
export const DEFAULT_REMINDER_AFTER_DAYS: ReminderDelayPreset = 5

/** Keuze in de wizard: 3, 5 of 7 dagen na de start, of geen herinnering. */
export type ReminderChoice = ReminderDelayPreset | 'none'

export const REMINDER_CHOICES: ReadonlyArray<{ value: ReminderChoice; label: string }> = [
  { value: 3, label: '3 dagen na de start' },
  { value: 5, label: '5 dagen na de start' },
  { value: 7, label: '7 dagen na de start' },
  { value: 'none', label: 'Geen herinnering' },
]

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function defaultClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_DEFAULT_DAYS)
}

export function minClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_MIN_DAYS)
}

export function maxClosesAt(launchDate: string): string {
  return addDays(launchDate, CLOSE_MAX_DAYS)
}

export function isReminderChoice(value: unknown): value is ReminderChoice {
  return value === 'none' || REMINDER_DELAY_PRESETS.some((preset) => preset === value)
}

/** Opslagvorm in campaign_delivery_records.reminder_config (spec par. 4.1). */
export function reminderConfigFromChoice(choice: ReminderChoice): ReminderConfig {
  return {
    enabled: choice !== 'none',
    firstReminderAfterDays: choice === 'none' ? DEFAULT_REMINDER_AFTER_DAYS : choice,
    maxReminderCount: 1,
  }
}

/**
 * Leest een opgeslagen reminder_config terug naar de wizardkeuze. Null als er
 * nog nooit iets is opgeslagen (de kolom heeft '{}' als default), zodat de
 * wizard de standaard (5 dagen) voorstelt in plaats van te doen alsof de klant
 * al gekozen heeft.
 */
export function readReminderChoice(value: unknown): ReminderChoice | null {
  if (!value || typeof value !== 'object' || !('enabled' in value)) return null
  const config = value as Partial<ReminderConfig>
  if (config.enabled === false) return 'none'
  const preset = REMINDER_DELAY_PRESETS.find((p) => p === config.firstReminderAfterDays)
  return preset ?? DEFAULT_REMINDER_AFTER_DAYS
}

export interface ScheduleInput {
  launchDate: string
  closesAt: string
  reminderChoice: ReminderChoice
  /** YYYY-MM-DD; wordt meegegeven zodat tests deterministisch zijn. */
  today: string
}

export interface ValidSchedule {
  launchDate: string
  closesAt: string
  reminderConfig: ReminderConfig
}

export interface ScheduleOptions {
  /**
   * De startdatum die al op het delivery record staat. Zolang de meting nog
   * niet gestart is, mag de klant precies die datum laten staan, ook als hij
   * inmiddels in het verleden ligt (stap 1 gisteren opgeslagen, vandaag pas
   * verstuurd). Een andere datum in het verleden blijft verboden.
   */
  storedLaunchDate?: string | null
}

export type ScheduleValidation = { ok: true; value: ValidSchedule } | { ok: false; error: string }

export function validateSchedule(input: ScheduleInput, options: ScheduleOptions = {}): ScheduleValidation {
  const fail = (error: string): ScheduleValidation => ({ ok: false, error })

  if (!input.launchDate) return fail('Vul een startdatum in.')
  if (!isDateOnly(input.launchDate)) return fail('De startdatum is geen geldige datum.')
  const keepsStoredDate = Boolean(options.storedLaunchDate) && input.launchDate === options.storedLaunchDate
  if (input.launchDate < input.today && !keepsStoredDate) return fail('Kies een startdatum vanaf vandaag.')

  if (!input.closesAt) return fail('Vul een sluitdatum in.')
  if (!isDateOnly(input.closesAt)) return fail('De sluitdatum is geen geldige datum.')
  const min = minClosesAt(input.launchDate)
  const max = maxClosesAt(input.launchDate)
  if (input.closesAt < min) {
    return fail(`Kies een sluitdatum van minimaal ${CLOSE_MIN_DAYS} dagen na de start, dus op of na ${formatDutchDate(min)}.`)
  }
  if (input.closesAt > max) {
    return fail(`Kies een sluitdatum van uiterlijk ${CLOSE_MAX_DAYS} dagen na de start, dus op of voor ${formatDutchDate(max)}.`)
  }

  if (!isReminderChoice(input.reminderChoice)) {
    return fail('Kies een herinnering van 3, 5 of 7 dagen na de start, of geen herinnering.')
  }
  if (input.reminderChoice !== 'none') {
    const reminderDate = addDays(input.launchDate, input.reminderChoice)
    if (reminderDate >= input.closesAt) {
      return fail('De herinnering valt op of na de sluitdatum. Kies een eerdere herinnering of een latere sluitdatum.')
    }
  }

  return {
    ok: true,
    value: {
      launchDate: input.launchDate,
      closesAt: input.closesAt,
      reminderConfig: reminderConfigFromChoice(input.reminderChoice),
    },
  }
}
