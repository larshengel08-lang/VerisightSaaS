import { FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { getReminderDueDate } from '@/lib/dashboard/reminder-due'

export interface CampaignTimelineItem {
  key: 'start' | 'reminder' | 'close'
  label: string
  value: string
  done: boolean
}

export interface CampaignTimeline {
  items: CampaignTimelineItem[]
  reportNote: string
}

export const TIMELINE_REPORT_NOTE = `Rapport downloaden zodra de meting gesloten is met minimaal ${FIRST_INSIGHT_THRESHOLD} ingevulde vragenlijsten.`

export interface CampaignTimelineInput {
  launchDate: string | null
  launchConfirmedAt: string | null
  reminderEnabled: boolean
  reminderAfterDays: number
  /** created_at van het meest recente send_reminders-event, of null. */
  reminderHandledAt: string | null
  /** Dat event had metadata.channel = 'skipped_by_customer'. */
  reminderSkipped: boolean
  closesAt: string | null
}

/**
 * De tijdlijn met datums die op elke kaart van een lopende meting staat en
 * als vooruitblik in stap 3 van de wizard (spec 2026-09-16 par. 4.2). Pure
 * functie; ontbrekende data wordt eerlijk benoemd ("Nog niet ingesteld"),
 * nooit ingevuld met een gok.
 */
export function buildCampaignTimeline(input: CampaignTimelineInput): CampaignTimeline {
  const launched = Boolean(input.launchConfirmedAt)
  const start: CampaignTimelineItem = {
    key: 'start',
    label: launched ? 'Uitnodiging verstuurd' : 'Start',
    value: formatDutchDate(input.launchDate) ?? 'Nog niet gepland',
    done: launched,
  }

  let reminder: CampaignTimelineItem
  if (!input.reminderEnabled) {
    reminder = { key: 'reminder', label: 'Herinnering', value: 'Geen herinnering', done: false }
  } else if (input.reminderHandledAt) {
    reminder = {
      key: 'reminder',
      label: 'Herinnering',
      value: input.reminderSkipped
        ? 'Overgeslagen'
        : `Verstuurd op ${formatDutchDate(input.reminderHandledAt) ?? 'onbekende datum'}`,
      done: true,
    }
  } else {
    const dueDate = getReminderDueDate(input.launchDate, input.reminderAfterDays)
    reminder = {
      key: 'reminder',
      label: 'Herinnering',
      value: formatDutchDate(dueDate) ?? 'Nog niet gepland',
      done: false,
    }
  }

  const close: CampaignTimelineItem = {
    key: 'close',
    label: 'Meting sluit',
    value: formatDutchDate(input.closesAt) ?? 'Nog niet ingesteld',
    done: false,
  }

  return { items: [start, reminder, close], reportNote: TIMELINE_REPORT_NOTE }
}
