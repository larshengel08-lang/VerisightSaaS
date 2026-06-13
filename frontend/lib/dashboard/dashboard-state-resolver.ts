// frontend/lib/dashboard/dashboard-state-resolver.ts
import type { ScanType } from '@/lib/types'
import { getResponseActivationThresholds } from '@/lib/response-activation'
import { isReminderDue } from '@/lib/dashboard/reminder-due'

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
  /** Not sourced yet (subsystem 2). Always null today → expired trigger disabled, close label degraded. */
  closesAt: string | null
  reminderConfig: DashboardReminderConfig
  /** Most recent manual reminder confirmation (from audit events), or null. */
  reminderAlreadySentAt: string | null
  /** isDashboardReleaseReady(total_completed, { scanType, isActive: false }). */
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
  /** Set true where a real backend field is missing and the value is derived/degraded. */
  degraded: boolean
}

function formatDutchDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(date)
}

function buildCloseDateLabel(closesAt: string | null): { label: string; degraded: boolean } {
  const formatted = formatDutchDate(closesAt)
  if (!formatted) return { label: 'Sluitdatum: nog niet gepland', degraded: true }
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
  closeDateLabel: 'Sluitdatum: nog niet gepland',
  degraded: false,
}

export function resolveDashboardState(input: DashboardStateInput): DashboardState {
  const { campaign } = input

  // State 0 — no campaign
  if (!campaign) {
    return {
      ...EMPTY_STATE,
      kind: 'no_campaign',
      primaryMessage: 'Er staat momenteel geen scan voor u klaar',
      subtext: 'Loep richt uw campagne in. U ontvangt een bericht wanneer u kunt beginnen.',
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
        primaryMessage: 'Uw rapport is beschikbaar',
        subtext: `${campaign.totalCompleted} respondenten · Gesloten ${formatDutchDate(campaign.closedAt) ?? 'recent'}`,
        tone: 'neutral',
        ctaLabel: 'Open rapport',
        ctaHref: `/campaigns/${campaign.id}`,
        ctaKind: 'link',
        closeDateLabel: close.label,
        degraded: close.degraded,
      }
    }

    const enough = campaign.totalCompleted >= thresholds.dashboardMin
    return {
      ...EMPTY_STATE,
      kind: 'processing',
      processingVariant: enough ? 'generating' : 'insufficient_response',
      campaignId: campaign.id,
      primaryMessage: enough ? 'Rapport wordt voorbereid' : 'Rapport nog niet beschikbaar',
      subtext: enough
        ? 'U ontvangt een e-mail zodra het rapport gereed is. Dit duurt doorgaans minder dan een dag.'
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
      primaryMessage: 'Uw campagne staat klaar',
      subtext: 'Controleer de planning en bereid de uitnodiging voor.',
      tone: 'calm',
      ctaLabel: 'Campagne klaarzetten →',
      ctaHref: `/campaigns/${campaign.id}/setup`,
      ctaKind: 'link',
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

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
      closeDateLabel: close.label,
      degraded: close.degraded,
    }
  }

  // Priority 4b (within State 3) — sufficient response reached (indicator, optional close)
  if (input.reportReady) {
    return {
      ...EMPTY_STATE,
      kind: 'action',
      actionVariant: 'sufficient_response',
      campaignId: campaign.id,
      primaryMessage: 'Voldoende respons — sluit de campagne',
      subtext: `Voldoende respons voor patroonduiding · ${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld (${progressPct}%) · ${close.label}`,
      tone: 'attention',
      ctaLabel: 'Campagne sluiten',
      ctaKind: 'close_campaign',
      showProgress: true,
      progressPct,
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
    subtext: `${campaign.totalCompleted} van ${campaign.totalInvited} ingevuld · ${close.label}`,
    tone: 'positive',
    showProgress: true,
    progressPct,
    closeDateLabel: close.label,
    degraded: close.degraded,
  }
}
