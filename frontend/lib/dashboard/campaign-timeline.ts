import type { ScanType } from '@/lib/types'
import { FIRST_INSIGHT_THRESHOLD, getResponseActivationThresholds } from '@/lib/response-activation'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { getReminderDueDate } from '@/lib/dashboard/reminder-due'
import { isReminderHandled } from '@/lib/dashboard/reminder-event'

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

function buildReportNote(threshold: number): string {
  return `Rapport downloaden zodra de meting gesloten is met minimaal ${threshold} ingevulde vragenlijsten.`
}

/** De rapportregel bij de standaarddrempel (10). Gebruik scanType voor de drempel van een specifieke scan. */
export const TIMELINE_REPORT_NOTE = buildReportNote(FIRST_INSIGHT_THRESHOLD)

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
  /** Bepaalt de rapportdrempel (isReportReleaseReady): 10, of 30 bij culture_assessment. */
  scanType?: ScanType
  /** YYYY-MM-DD. Een startdatum na vandaag heet "gepland", ook als de lancering al bevestigd is. */
  today?: string
}

/**
 * De tijdlijn met datums die op elke kaart van een lopende meting staat en
 * als vooruitblik in stap 3 van de wizard (spec 2026-09-16 par. 4.2). Pure
 * functie; ontbrekende data wordt eerlijk benoemd ("Nog niet ingesteld"),
 * nooit ingevuld met een gok.
 */
export function buildCampaignTimeline(input: CampaignTimelineInput): CampaignTimeline {
  const confirmed = Boolean(input.launchConfirmedAt)
  const startInFuture =
    input.today !== undefined && input.launchDate !== null && input.launchDate.slice(0, 10) > input.today.slice(0, 10)
  const start: CampaignTimelineItem = {
    key: 'start',
    label: confirmed ? (startInFuture ? 'Uitnodiging gepland' : 'Uitnodiging verstuurd') : 'Start',
    value: formatDutchDate(input.launchDate) ?? 'Nog niet gepland',
    done: confirmed && !startInFuture,
  }

  let reminder: CampaignTimelineItem
  const handled = isReminderHandled({
    launchDate: input.launchDate,
    delayDays: input.reminderAfterDays,
    handledAt: input.reminderHandledAt,
  })
  if (!input.reminderEnabled) {
    reminder = { key: 'reminder', label: 'Herinnering', value: 'Geen herinnering', done: false }
  } else if (handled && input.reminderHandledAt) {
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

  const reportNote = buildReportNote(getResponseActivationThresholds(input.scanType).insightMin)
  return { items: [start, reminder, close], reportNote }
}
