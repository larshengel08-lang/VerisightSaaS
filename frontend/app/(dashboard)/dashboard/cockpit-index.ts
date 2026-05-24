import {
  getCampaignCompositionState,
  type CampaignCompositionState,
} from '@/lib/dashboard/dashboard-state-composition'
import { buildHrReportDownloadRows } from '@/lib/dashboard/report-library'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

export type CockpitActionKind = 'results' | 'pdf' | 'settings'

export type CockpitAction = {
  kind: CockpitActionKind
  label: 'Open resultaten' | 'Download PDF' | 'Instellingen'
  href: string
}

export type CockpitRow = {
  campaign: CampaignStats
  productLabel: string
  periodLabel: string
  responseValue: string
  statusLabel: string
  factualLine: string
  primaryAction: CockpitAction
  secondaryActions: CockpitAction[]
}

export function buildCockpitIndexRows(args: {
  campaigns: CampaignStats[]
  invitesNotSentByCampaign: Map<string, number>
}) {
  const availablePdfCampaignIds = new Set(
    buildHrReportDownloadRows(args.campaigns).availableRows.map((row) => row.campaignId),
  )

  return [...args.campaigns]
    .map((campaign) =>
      buildCockpitRow({
        campaign,
        invitesNotSent: args.invitesNotSentByCampaign.get(campaign.campaign_id) ?? 0,
        pdfAvailable: availablePdfCampaignIds.has(campaign.campaign_id),
      }),
    )
    .sort(compareCockpitRows)
}

export function buildCockpitSummary(rows: CockpitRow[]) {
  return {
    total: rows.length,
    resultsAvailable: rows.filter((row) => row.primaryAction.kind === 'results').length,
    pdfAvailable: rows.filter(
      (row) =>
        row.primaryAction.kind === 'pdf' || row.secondaryActions.some((action) => action.kind === 'pdf'),
    ).length,
    attentionNeeded: rows.filter((row) => row.primaryAction.kind === 'settings').length,
  }
}

function buildCockpitRow(args: {
  campaign: CampaignStats
  invitesNotSent: number
  pdfAvailable: boolean
}): CockpitRow {
  const { campaign, invitesNotSent, pdfAvailable } = args
  const state = getCampaignCompositionState({
    isActive: campaign.is_active,
    totalInvited: campaign.total_invited,
    totalCompleted: campaign.total_completed,
    invitesNotSent,
    incompleteScores: 0,
    hasMinDisplay: campaign.total_completed >= 5,
    hasEnoughData: campaign.total_completed >= 10,
  })
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const actions = buildCockpitActions({ campaign, state, pdfAvailable })

  return {
    campaign,
    productLabel: scanDefinition.productName,
    periodLabel: formatCampaignPeriod(campaign),
    responseValue: Number.isFinite(campaign.completion_rate_pct) ? `${campaign.completion_rate_pct}%` : '—',
    statusLabel: getStatusLabel(state),
    factualLine: getFactualLine(state, pdfAvailable),
    primaryAction: actions[0]!,
    secondaryActions: actions.slice(1),
  }
}

function buildCockpitActions(args: {
  campaign: CampaignStats
  state: CampaignCompositionState
  pdfAvailable: boolean
}): CockpitAction[] {
  const { campaign, state, pdfAvailable } = args
  const settingsAction: CockpitAction = {
    kind: 'settings',
    label: 'Instellingen',
    href: `/campaigns/${campaign.campaign_id}/beheer`,
  }
  const resultsAction: CockpitAction = {
    kind: 'results',
    label: 'Open resultaten',
    href: `/campaigns/${campaign.campaign_id}`,
  }
  const pdfAction: CockpitAction = {
    kind: 'pdf',
    label: 'Download PDF',
    href: `/api/campaigns/${campaign.campaign_id}/report`,
  }

  if (state === 'full' || state === 'partial') {
    return pdfAvailable ? [resultsAction, pdfAction, settingsAction] : [resultsAction, settingsAction]
  }

  if (state === 'closed') {
    return pdfAvailable ? [resultsAction, pdfAction] : [resultsAction]
  }

  return [settingsAction]
}

function getStatusLabel(state: CampaignCompositionState) {
  if (state === 'full') return 'Leesbaar'
  if (state === 'partial') return 'Deels zichtbaar'
  if (state === 'closed') return 'Afgerond'
  if (state === 'setup') return 'Nog niet live'
  return 'Nog in opbouw'
}

function getFactualLine(state: CampaignCompositionState, pdfAvailable: boolean) {
  if (state === 'full') return 'Resultaten beschikbaar'
  if (state === 'partial') return 'Eerste resultaten beschikbaar'
  if (state === 'closed') return pdfAvailable ? 'Resultaten en PDF beschikbaar' : 'Resultaten beschikbaar'
  if (state === 'ready_to_launch') return 'Uitnodiging nog niet verstuurd'
  if (state === 'setup') return 'Doelgroep of livegang ontbreekt nog'
  return 'Nog onvoldoende respons'
}

function compareCockpitRows(left: CockpitRow, right: CockpitRow) {
  const rank = (row: CockpitRow) => {
    if (row.primaryAction.kind === 'results' && row.secondaryActions.some((action) => action.kind === 'pdf')) return 0
    if (row.primaryAction.kind === 'results') return 1
    if (row.primaryAction.kind === 'pdf') return 2
    if (row.primaryAction.kind === 'settings') return 3
    return 4
  }

  const rankDelta = rank(left) - rank(right)
  if (rankDelta !== 0) return rankDelta

  const dateDelta = new Date(right.campaign.created_at).getTime() - new Date(left.campaign.created_at).getTime()
  if (dateDelta !== 0) return dateDelta

  return left.campaign.campaign_name.localeCompare(right.campaign.campaign_name, 'nl')
}

function formatCampaignPeriod(campaign: CampaignStats) {
  const quarterMatch = campaign.campaign_name.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, ' ')

  return new Intl.DateTimeFormat('nl-NL', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(campaign.created_at))
}
