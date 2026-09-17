// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { buildCampaignTimeline, type CampaignTimeline } from '@/lib/dashboard/campaign-timeline'

export type DashboardStateKind =
  | 'no_campaign'
  | 'setup'
  | 'running'
  | 'action'
  | 'processing'
  | 'report_ready'

export type DashboardActionVariant = 'reminder' | 'sufficient_response' | 'expired'
export type DashboardProcessingVariant = 'generating' | 'insufficient_response'
export type DashboardStateTone = 'neutral' | 'calm' | 'positive' | 'attention'

export interface DashboardStateCampaign {
  id: string
  name: string
  scanType: ScanType
  isActive: boolean
  totalInvited: number
  totalCompleted: number
  completionRatePct: number
  closedAt: string | null
}

export interface DashboardReminderConfig {
  enabled: boolean
  firstReminderAfterDays: number
  maxReminderCount: number
}

export interface DashboardStateInput {
  campaign: DashboardStateCampaign | null
  launchConfirmedAt: string | null
  launchDate: string | null
  /** campaigns.closes_at (date). Null bij metingen van vóór de wizard-sluitdatum: dan geen expired-trigger en een eerlijk "nog niet ingesteld". */
  closesAt: string | null
  reminderConfig: DashboardReminderConfig
  /** created_at van het meest recente send_reminders-event (verstuurd of overgeslagen), of null. */
  reminderAlreadySentAt: string | null
  /** Dat event had metadata.channel = 'skipped_by_customer'. */
  reminderSkipped: boolean
  /** isReportReleaseReady(total_completed, { scanType }) — 10 ingevuld (30 bij culture_assessment). */
  reportReady: boolean
  /** Injected YYYY-MM-DD for deterministic tests. */
  today: string
}

export interface DashboardSecondaryAction {
  label: string
  /** 'link' renders an anchor; the others are handled by the client island. */
  kind: 'link' | 'close_without_report' | 'extend' | 'skip_reminder'
  href?: string
}

export interface DashboardState {
  kind: DashboardStateKind
  actionVariant: DashboardActionVariant | null
  processingVariant: DashboardProcessingVariant | null
  campaignId: string | null
  primaryMessage: string
  subtext: string
  tone: DashboardStateTone
  ctaLabel: string | null
  ctaHref: string | null
  /** For State 3 reminder: signals the client island to show the copy→confirm flow. */
  ctaKind: 'link' | 'copy_reminder' | 'close_campaign' | null
  secondaryActions: DashboardSecondaryAction[]
  showProgress: boolean
  progressPct: number
  closeDateLabel: string
  /** Tijdlijn met datums (spec 2026-09-16 par. 4.2); alleen voor een gelanceerde, lopende meting. */
  timeline: CampaignTimeline | null
  /** Set true where a real backend field is missing and the value is derived/degraded. */
  degraded: boolean
}

function buildCloseDateLabel(closesAt: string | null): { label: string; degraded: boolean } {
  const formatted = formatDutchDate(closesAt)
  if (!formatted) return { label: 'Sluitdatum: nog niet ingesteld', degraded: true }
  return { label: `Sluit ${formatted}`, degraded: false }
}

const EMPTY_STATE: Omit<DashboardState, 'kind' | 'primaryMessage' | 'subtext' | 'tone'> = {
  actionVariant: null,
  processingVariant: null,
  campaignId: null,
  ctaLabel: null,
  ctaHref: null,
  ctaKind: null,
  secondaryActions: [],
  showProgress: false,
  progressPct: 0,
  closeDateLabel: 'Sluitdatum: nog niet ingesteld',
  timeline: null,
  degraded: false,
}

export function resolveDashboardState(input: DashboardStateInput): DashboardState {
  const { campaign } = input

  // State 0 — no campaign
  if (!campaign) {
    return {
      ...EMPTY_STATE,
      kind: 'no_campaign',
      primaryMessage: 'Er staat momenteel geen scan voor je klaar',
      subtext: 'Loep richt je campagne in. Je ontvangt een bericht wanneer je kunt beginnen.',
      tone: 'neutral',
    }
  }

  const close = buildCloseDateLabel(input.closesAt)
  const thresholds = getResponseActivationThresholds(campaign.scanType)
  const progressPct = Number.isFinite(campaign.completionRatePct) ? campaign.completionRatePct : 0

  // Priority 1 & 2 — closed campaign: report_ready beats processing
  if (!campaign.isActive) {
    if (input.reportReady) {
      return {
        ...EMPTY_STATE,
        kind: 'report_ready',
        campaignId: campaign.id,
        primaryMessage: 'Je rapport is beschikbaar',
        subtext: `${campaign.totalCompleted} respondenten · Gesloten ${formatDutchDate(campaign.closedAt) ?? 'recent'}`,
        tone: 'neutral',
        ctaLabel: 'Open rapport',
        ctaHref: `/campaigns/${campaign.id}`,
        ctaKind: 'link',
        closeDateLabel: close.label,
        degraded: close.degraded,
      }
    }

    const enough = campaign.totalCompleted >= thresholds.insightMin
    return {
      ...EMPTY_STATE,
      kind: 'processing',
      processingVariant: enough ? 'generating' : 'insufficient_response',
      campaignId: campaign.id,
      primaryMessage: enough ? 'Rapport wordt voorbereid' : 'Rapport nog niet beschikbaar',
      subtext: enough
        ? 'Je ontvangt een e-mail zodra het rapport gereed is. Dit duurt doorgaans minder dan een dag.'
        : `Deze campagne is gesloten met ${campaign.totalCompleted} ingevulde reacties. Dat is te weinig voor een veilig rapport.`,
      tone: 'neutral',
      closeDateLabel: close.label,
      degraded: true, // no async processing/failed signal exists yet
    }
  }

  // Priority 6 (lowest) — setup: active but not launched
  const launched = Boolean(input.launchConfirmedAt) && campaign.totalInvited > 0
  if (!launched) {
    return {
      ...EMPTY_STATE,
      kind: 'setup',
      campaignId: campaign.id,
      primaryMessage: 'Stap 1: stel de startdatum in',
      subtext: 'Vul de startdatum en het aantal deelnemers in, en kopieer de uitnodigingstekst.',
      tone: 'calm',
      ctaLabel: 'Start de setup →',
      ctaHref: `/campaigns/${campaign.id}/setup`,
      ctaKind: 'link',
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

  const timeline = buildCampaignTimeline({
    launchDate: input.launchDate,
    launchConfirmedAt: input.launchConfirmedAt,
    reminderEnabled: input.reminderConfig.enabled,
    reminderAfterDays: input.reminderConfig.firstReminderAfterDays,
    reminderHandledAt: input.reminderAlreadySentAt,
    reminderSkipped: input.reminderSkipped,
    closesAt: input.closesAt,
    scanType: campaign.scanType,
    today: input.today,
  })

  // Priority 3 — expired (close date reached). Disabled while closesAt is null.
  // Compare date-only portions so a full ISO closesAt timestamp still fires on the close day.
  const expired = input.closesAt !== null && input.today.slice(0, 10) >= input.closesAt.slice(0, 10)
  if (expired) {
    const enough = campaign.totalCompleted >= thresholds.dashboardMin
    return {
      ...EMPTY_STATE,
      kind: 'action',
      actionVariant: 'expired',
      campaignId: campaign.id,
      primaryMessage: 'Campagne is verlopen — sluit nu af',
      subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%)`,
      tone: 'attention',
      ctaLabel: 'Campagne sluiten',
      ctaKind: 'close_campaign',
      secondaryActions: enough
        ? []
        : [
            { label: 'Campagne verlengen', kind: 'extend' },
            { label: 'Sluiten zonder rapport', kind: 'close_without_report' },
          ],
      showProgress: true,
      progressPct,
      timeline,
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

  // Priority 4 — reminder day
  const reminderDue = isReminderDue({
    launchDate: input.launchDate,
    delayDays: input.reminderConfig.firstReminderAfterDays,
    today: input.today,
    alreadySentAt: input.reminderAlreadySentAt,
  })
  if (input.reminderConfig.enabled && reminderDue) {
    return {
      ...EMPTY_STATE,
      kind: 'action',
      actionVariant: 'reminder',
      campaignId: campaign.id,
      primaryMessage: 'Vandaag: stuur de herinnering',
      subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%) · ${close.label}`,
      tone: 'attention',
      ctaLabel: 'Kopieer herinneringstekst',
      ctaKind: 'copy_reminder',
      secondaryActions: [{ label: 'Geen herinnering versturen', kind: 'skip_reminder' }],
      showProgress: true,
      progressPct,
      timeline,
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

  // Priority 4b (within State 3) — rapportdrempel gehaald (indicator, sluiten optioneel)
  if (input.reportReady) {
    return {
      ...EMPTY_STATE,
      kind: 'action',
      actionVariant: 'sufficient_response',
      campaignId: campaign.id,
      primaryMessage: 'Voldoende respons voor een rapport',
      subtext: `Je kunt de campagne sluiten of nog even open laten. ${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%) · ${close.label}`,
      tone: 'attention',
      ctaLabel: 'Campagne sluiten',
      ctaKind: 'close_campaign',
      showProgress: true,
      progressPct,
      timeline,
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

  // Priority 5 — running normally
  return {
    ...EMPTY_STATE,
    kind: 'running',
    campaignId: campaign.id,
    primaryMessage: 'Campagne loopt',
    subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld`,
    tone: 'positive',
    showProgress: true,
    progressPct,
    timeline,
    closeDateLabel: close.label,
    degraded: close.degraded,
  }
}
