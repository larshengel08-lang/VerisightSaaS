import type { CampaignStats, ScanType } from '@/lib/types'
import { isReportReleaseReady } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { normalizeReminderConfig } from '@/lib/launch-controls'
import { resolveInvitedDenominator, type InvitedDenominator } from '@/lib/dashboard/invited-denominator'

/**
 * Eén statusvocabulaire voor de lijst "Al je metingen" op /dashboard en de
 * rijen op /reports (spec 2026-09-16 par. 6.1 en 6.2). De kaart blijft het
 * domein van resolveDashboardState; deze afgeleide gebruikt dezelfde
 * primitieven (rapportdrempel, gelanceerd = bevestigd én noemer > 0,
 * sluitdatum voorbij, herinneringsdag) en is met een pariteitstest aan de
 * resolver vastgeklonken, zodat lijst en kaart nooit iets anders zeggen.
 */
export type CampaignStatusKey = 'setup' | 'running' | 'action' | 'closed_no_report' | 'report_ready'

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatusKey, string> = {
  setup: 'Nog in te richten',
  running: 'Loopt',
  action: 'Actie nodig',
  closed_no_report: 'Gesloten, geen rapport',
  report_ready: 'Rapport beschikbaar',
}

export interface CampaignStatusInput {
  isActive: boolean
  scanType: ScanType
  totalCompleted: number
  /** Effectieve noemer (resolveInvitedDenominator), 0 als onbekend. */
  totalInvited: number
  launchConfirmedAt: string | null
  launchDate: string | null
  closesAt: string | null
  reminderEnabled: boolean
  reminderAfterDays: number
  /** created_at van het laatste send_reminders-event (verstuurd of overgeslagen), of null. */
  reminderHandledAt: string | null
  /** YYYY-MM-DD, meegegeven zodat tests deterministisch zijn. */
  today: string
}

export function deriveCampaignStatus(input: CampaignStatusInput): CampaignStatusKey {
  const reportReady = isReportReleaseReady(input.totalCompleted, { scanType: input.scanType })
  if (!input.isActive) return reportReady ? 'report_ready' : 'closed_no_report'

  const launched = Boolean(input.launchConfirmedAt) && input.totalInvited > 0
  if (!launched) return 'setup'

  // closes_at is inclusief (spec 4.3a): pas de dag ná de sluitdatum vraagt de meting om actie.
  const expired = input.closesAt !== null && input.today.slice(0, 10) > input.closesAt.slice(0, 10)
  if (expired) return 'action'

  const reminderDue =
    input.reminderEnabled &&
    isReminderDue({
      launchDate: input.launchDate,
      delayDays: input.reminderAfterDays,
      today: input.today,
      alreadySentAt: input.reminderHandledAt,
    })
  if (reminderDue) return 'action'

  if (reportReady) return 'action'
  return 'running'
}

export interface CampaignDeliveryLite {
  launchConfirmedAt: string | null
  launchDate: string | null
  invitedCount: number | null
  reminderConfig: unknown
}

export interface CampaignStatusContext {
  deliveryByCampaign: ReadonlyMap<string, CampaignDeliveryLite>
  /** created_at van het meest recente send_reminders-event (outcome completed) per campagne. */
  lastReminderEventAtByCampaign: ReadonlyMap<string, string>
  today: string
}

/**
 * De noemer van één meting uit campaign_stats plus context. Eén helper voor de
 * status (statusInputFor) en de tekst "X van Y" (report-library), zodat die
 * twee nooit een andere noemer kunnen gebruiken.
 */
export function denominatorFor(campaign: CampaignStats, context: CampaignStatusContext): InvitedDenominator {
  return resolveInvitedDenominator({
    invitedCount: context.deliveryByCampaign.get(campaign.campaign_id)?.invitedCount ?? null,
    respondentRows: campaign.total_invited,
  })
}

export function statusInputFor(campaign: CampaignStats, context: CampaignStatusContext): CampaignStatusInput {
  const delivery = context.deliveryByCampaign.get(campaign.campaign_id)
  const reminderConfig = normalizeReminderConfig(delivery?.reminderConfig ?? null)
  const denominator = denominatorFor(campaign, context)
  return {
    isActive: campaign.is_active,
    scanType: campaign.scan_type,
    totalCompleted: campaign.total_completed,
    totalInvited: denominator.known ? denominator.value : 0,
    launchConfirmedAt: delivery?.launchConfirmedAt ?? null,
    launchDate: delivery?.launchDate ?? null,
    closesAt: campaign.closes_at ?? null,
    reminderEnabled: reminderConfig.enabled,
    reminderAfterDays: reminderConfig.firstReminderAfterDays,
    reminderHandledAt: context.lastReminderEventAtByCampaign.get(campaign.campaign_id) ?? null,
    today: context.today,
  }
}

export function deriveCampaignStatusFor(campaign: CampaignStats, context: CampaignStatusContext): CampaignStatusKey {
  return deriveCampaignStatus(statusInputFor(campaign, context))
}
