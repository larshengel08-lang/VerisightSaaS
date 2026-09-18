// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'
import { buildCampaignTimeline, type CampaignTimeline } from '@/lib/dashboard/campaign-timeline'
import { canExtendCampaign, extensionsLeft, MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'

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
  /** Aantal delivery_lifecycle_changed-events met metadata.extension = true. */
  extensionCount: number
  /** isReportReleaseReady(total_completed, { scanType }): 10 ingevuld (30 bij culture_assessment). */
  reportReady: boolean
  /** Injected YYYY-MM-DD for deterministic tests. */
  today: string
}

export type DashboardCtaKind = 'link' | 'copy_reminder' | 'close_campaign' | 'extend'
export type DashboardSecondaryActionKind = 'link' | 'close_campaign' | 'extend' | 'skip_reminder'

export interface DashboardSecondaryAction {
  label: string
  /** 'link' renders an anchor; the others are handled by the client island. */
  kind: DashboardSecondaryActionKind
  href?: string
}

export interface DashboardState {
  kind: DashboardStateKind
  actionVariant: DashboardActionVariant | null
  processingVariant: DashboardProcessingVariant | null
  campaignId: string | null
  /** Naam van de meting; null in State 0. De kaart noemt hem, want met meer metingen is "Vandaag: stuur de herinnering" anders onbenoemd. */
  campaignName: string | null
  primaryMessage: string
  subtext: string
  tone: DashboardStateTone
  ctaLabel: string | null
  ctaHref: string | null
  /** copy_reminder, close_campaign en extend worden door het client-eiland afgehandeld. */
  ctaKind: DashboardCtaKind | null
  secondaryActions: DashboardSecondaryAction[]
  showProgress: boolean
  progressPct: number
  closeDateLabel: string
  /** Tijdlijn met datums (spec 2026-09-16 par. 4.2); alleen voor een gelanceerde, lopende meting. */
  timeline: CampaignTimeline | null
  /** Voor de sluitdialoog (spec par. 4.3): X van Y, en of er bij sluiting een rapport is. */
  totalCompleted: number
  totalInvited: number
  reportReady: boolean
  reportThreshold: number
  canExtend: boolean
  extensionsLeft: number
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
  campaignName: null,
  ctaLabel: null,
  ctaHref: null,
  ctaKind: null,
  secondaryActions: [],
  showProgress: false,
  progressPct: 0,
  closeDateLabel: 'Sluitdatum: nog niet ingesteld',
  timeline: null,
  totalCompleted: 0,
  totalInvited: 0,
  reportReady: false,
  reportThreshold: 0,
  canExtend: false,
  extensionsLeft: 0,
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
  const counts = `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%)`
  const base = {
    campaignId: campaign.id,
    campaignName: campaign.name,
    totalCompleted: campaign.totalCompleted,
    totalInvited: campaign.totalInvited,
    reportReady: input.reportReady,
    reportThreshold: thresholds.insightMin,
    closeDateLabel: close.label,
  }

  // Priority 1 & 2 — closed campaign: report_ready beats processing
  if (!campaign.isActive) {
    if (input.reportReady) {
      return {
        ...EMPTY_STATE,
        ...base,
        kind: 'report_ready',
        primaryMessage: 'Je rapport is beschikbaar',
        subtext: `${campaign.totalCompleted} respondenten · Gesloten ${formatDutchDate(campaign.closedAt) ?? 'recent'}`,
        tone: 'neutral',
        ctaLabel: 'Open rapport',
        ctaHref: `/campaigns/${campaign.id}`,
        ctaKind: 'link',
        degraded: close.degraded,
      }
    }

    const enough = campaign.totalCompleted >= thresholds.insightMin
    if (enough) {
      return {
        ...EMPTY_STATE,
        ...base,
        kind: 'processing',
        processingVariant: 'generating',
        primaryMessage: 'Rapport wordt voorbereid',
        subtext: 'Je ontvangt een e-mail zodra het rapport gereed is. Dit duurt doorgaans minder dan een dag.',
        tone: 'neutral',
        degraded: true, // no async processing/failed signal exists yet
      }
    }

    // Eindtoestand (spec 2026-09-16 par. 4.5): geen belofte van een e-mail die
    // niet komt; wel de weg naar een nieuwe meting. Die weg is de mailknop uit
    // blok G (RequestNewMeasurement onder de kaart), dus de kaart zelf heeft
    // geen CTA: één mailactie, niet twee.
    return {
      ...EMPTY_STATE,
      ...base,
      kind: 'processing',
      processingVariant: 'insufficient_response',
      primaryMessage: 'Gesloten zonder rapport',
      subtext: `Deze meting is gesloten met ${campaign.totalCompleted} ingevulde vragenlijsten. Voor een rapport zijn er minimaal ${thresholds.insightMin} nodig. Wil je opnieuw meten? Mail Loep.`,
      tone: 'neutral',
      degraded: true,
    }
  }

  // Priority 6 (lowest) — setup: active but not launched
  const launched = Boolean(input.launchConfirmedAt) && campaign.totalInvited > 0
  if (!launched) {
    return {
      ...EMPTY_STATE,
      ...base,
      kind: 'setup',
      primaryMessage: 'Stap 1: stel de startdatum in',
      subtext: 'Vul de startdatum en het aantal deelnemers in, en kopieer de uitnodigingstekst.',
      tone: 'calm',
      ctaLabel: 'Start de setup →',
      ctaHref: `/campaigns/${campaign.id}/setup`,
      ctaKind: 'link',
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
  const canExtend = canExtendCampaign(input.extensionCount)
  const running = {
    ...base,
    timeline,
    canExtend,
    extensionsLeft: extensionsLeft(input.extensionCount),
    showProgress: true,
    progressPct,
    degraded: close.degraded,
  }
  const closeAction: DashboardSecondaryAction = { label: 'Meting sluiten', kind: 'close_campaign' }
  const extendAction: DashboardSecondaryAction = { label: 'Twee weken verlengen', kind: 'extend' }

  // Priority 3 — expired (close date reached). Disabled while closesAt is null.
  // Compare date-only portions so a full ISO closesAt timestamp still fires on the close day.
  const expired = input.closesAt !== null && input.today.slice(0, 10) >= input.closesAt.slice(0, 10)
  if (expired) {
    if (input.reportReady) {
      return {
        ...EMPTY_STATE,
        ...running,
        kind: 'action',
        actionVariant: 'expired',
        primaryMessage: 'De sluitdatum is bereikt',
        subtext: `${counts}. Sluit de meting, dan staat het rapport klaar.`,
        tone: 'attention',
        ctaLabel: 'Meting sluiten',
        ctaKind: 'close_campaign',
        secondaryActions: canExtend ? [extendAction] : [],
      }
    }
    if (canExtend) {
      return {
        ...EMPTY_STATE,
        ...running,
        kind: 'action',
        actionVariant: 'expired',
        primaryMessage: 'De sluitdatum is bereikt',
        subtext: `${counts}. Voor een rapport zijn minimaal ${thresholds.insightMin} antwoorden nodig. Verleng met twee weken of sluit zonder rapport.`,
        tone: 'attention',
        ctaLabel: 'Twee weken verlengen',
        ctaKind: 'extend',
        secondaryActions: [{ label: 'Toch sluiten', kind: 'close_campaign' }],
      }
    }
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'expired',
      primaryMessage: 'De sluitdatum is bereikt',
      subtext: `${counts}. Voor een rapport zijn minimaal ${thresholds.insightMin} antwoorden nodig. Je hebt de meting al ${MAX_EXTENSIONS} keer verlengd; je kunt hem alleen nog sluiten.`,
      tone: 'attention',
      ctaLabel: 'Meting sluiten',
      ctaKind: 'close_campaign',
      secondaryActions: [],
    }
  }

  // Priority 4 — reminder day (spec 4.4: de kaart verschijnt pas op die dag)
  const reminderDue = isReminderDue({
    launchDate: input.launchDate,
    delayDays: input.reminderConfig.firstReminderAfterDays,
    today: input.today,
    alreadySentAt: input.reminderAlreadySentAt,
  })
  if (input.reminderConfig.enabled && reminderDue) {
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'reminder',
      primaryMessage: 'Vandaag: stuur de herinnering',
      subtext: counts,
      tone: 'attention',
      ctaLabel: 'Ik heb de herinnering verstuurd',
      ctaKind: 'copy_reminder',
      secondaryActions: [{ label: 'Geen herinnering versturen', kind: 'skip_reminder' }, closeAction],
    }
  }

  // Priority 4b (within State 3) — rapportdrempel gehaald (indicator, sluiten optioneel)
  if (input.reportReady) {
    return {
      ...EMPTY_STATE,
      ...running,
      kind: 'action',
      actionVariant: 'sufficient_response',
      primaryMessage: 'Voldoende respons voor een rapport',
      subtext: `Je kunt de meting sluiten of nog even open laten. ${counts}`,
      tone: 'attention',
      ctaLabel: 'Meting sluiten',
      ctaKind: 'close_campaign',
      secondaryActions: [],
    }
  }

  // Priority 5 — running normally; sluiten blijft altijd bereikbaar (spec 4.3)
  return {
    ...EMPTY_STATE,
    ...running,
    kind: 'running',
    primaryMessage: 'Campagne loopt',
    subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld`,
    tone: 'positive',
    secondaryActions: [closeAction],
  }
}
