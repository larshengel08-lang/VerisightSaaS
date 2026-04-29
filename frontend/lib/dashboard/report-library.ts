import type { ActionCenterEntryStage } from '@/lib/action-center-route-contract'
import {
  loadHrDemoPilotArtifact,
  prioritizeHrDemoCampaigns,
} from '@/lib/dashboard/hr-demo-pilot-artifact'
import { getHrBridgePresentation } from '@/lib/dashboard/hr-bridge-state'
import { FIRST_DASHBOARD_THRESHOLD } from '@/lib/response-activation'
import { buildBridgeAssessmentTruth, resolveHrBridgeState } from '@/lib/dashboard/hr-bridge-state'
import { SCAN_TYPE_LABELS, getCampaignAverageSignalScore, type CampaignStats, type ScanType } from '@/lib/types'

export type ReportLibraryCategory = 'all' | 'management' | 'module' | 'cohort'

export interface ReportLibraryEntry {
  campaignId: string
  campaignName: string
  scanType: ScanType
  category: Exclude<ReportLibraryCategory, 'all'>
  categoryLabel: string
  title: string
  summary: string
  metaLeft: string
  metaRight: string
  recommended: boolean
  bridgeState: 'attention' | 'candidate' | 'active'
}

export interface FeaturedReportEntry {
  campaignId: string
  campaignName: string
  scanType: ScanType
  bridgeState: 'attention' | 'candidate' | 'active'
  title: string
  subtitle: string
  description: string
  stats: Array<{ label: string; value: string }>
}

export interface BuildReportLibraryEntriesOptions {
  routeEntryStageByCampaignId?: Partial<Record<string, ActionCenterEntryStage | null>>
  routeOpenableByCampaignId?: Partial<Record<string, boolean>>
}

const MANAGEMENT_SCAN_TYPES: ScanType[] = ['exit', 'retention', 'leadership']
const MODULE_SCAN_TYPES: ScanType[] = ['pulse', 'team']

function formatDutchDate(dateLike: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateLike))
}

function formatDutchQuarter(dateLike: string) {
  const date = new Date(dateLike)
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1
  return `Q${quarter} ${date.getUTCFullYear()}`
}

function getCategory(scanType: ScanType): Exclude<ReportLibraryCategory, 'all'> {
  if (scanType === 'onboarding') return 'cohort'
  if (MANAGEMENT_SCAN_TYPES.includes(scanType)) return 'management'
  if (MODULE_SCAN_TYPES.includes(scanType)) return 'module'
  return 'module'
}

function getCategoryLabel(category: Exclude<ReportLibraryCategory, 'all'>) {
  switch (category) {
    case 'management':
      return 'Managementsamenvatting'
    case 'cohort':
      return 'Cohortrapport'
    case 'module':
    default:
      return 'Modulerapport'
  }
}

function getEntrySummary(campaign: CampaignStats, category: Exclude<ReportLibraryCategory, 'all'>) {
  const signalDisplay = getCampaignAverageSignalScore(campaign)
  const signalText = signalDisplay !== null ? `${signalDisplay.toFixed(1)}/10 signaal` : 'signaal volgt na voldoende respons'

  if (category === 'management') {
    return `${SCAN_TYPE_LABELS[campaign.scan_type]} voor eerste samenvatting, vervolgstap en reviewmoment.`
  }

  if (category === 'cohort') {
    return `${SCAN_TYPE_LABELS[campaign.scan_type]} als cohortoverzicht, met nadruk op checkpoint en opvolging.`
  }

  return `${SCAN_TYPE_LABELS[campaign.scan_type]} als verdiepende modulelaag, met ${signalText.toLowerCase()}.`
}

function getEntryTitle(campaign: CampaignStats, category: Exclude<ReportLibraryCategory, 'all'>) {
  if (category === 'cohort') {
    return campaign.campaign_name || `${SCAN_TYPE_LABELS[campaign.scan_type]} cohort ${formatDutchQuarter(campaign.created_at)}`
  }

  return campaign.campaign_name || `${SCAN_TYPE_LABELS[campaign.scan_type]} ${formatDutchQuarter(campaign.created_at)}`
}

function getPriority(campaign: CampaignStats) {
  const base =
    campaign.scan_type === 'exit'
      ? 6
      : campaign.scan_type === 'retention'
        ? 5
        : campaign.scan_type === 'leadership'
          ? 4
          : campaign.scan_type === 'pulse'
            ? 3
            : campaign.scan_type === 'team'
              ? 2
              : 1

  return base * 1000 + campaign.total_completed
}

function getReportBridgeState(args: {
  campaign: CampaignStats
  routeEntryStage: ActionCenterEntryStage | null
  routeOpenable: boolean
}): ReportLibraryEntry['bridgeState'] {
  const { campaign, routeEntryStage, routeOpenable } = args
  const isReportReady = campaign.total_completed >= FIRST_DASHBOARD_THRESHOLD
  const assessment = buildBridgeAssessmentTruth({
    sourceType: 'report',
    sourceId: campaign.campaign_id,
    signalReadable: isReportReady,
    managementMeaningClear: isReportReady,
    plausibleFollowUpExists: isReportReady && routeOpenable,
    assessedAt: campaign.created_at,
  })

  return resolveHrBridgeState({
    routeEntryStage,
    assessment,
  })
}

export function getReportEntryBridge(entry: Pick<ReportLibraryEntry, 'campaignId' | 'bridgeState'>) {
  const bridge = getHrBridgePresentation({
    bridgeState: entry.bridgeState,
    surface: 'reports',
  })

  return {
    bridge,
    href: bridge.ctaKind === 'open' ? '/action-center' : `/campaigns/${entry.campaignId}`,
  }
}

export function buildReportLibraryEntries(campaigns: CampaignStats[], options: BuildReportLibraryEntriesOptions = {}) {
  const readyCampaigns = campaigns
    .filter((campaign) => campaign.total_completed >= FIRST_DASHBOARD_THRESHOLD)
    .sort((left, right) => {
      const createdDiff = new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
      if (createdDiff !== 0) return createdDiff
      return right.total_completed - left.total_completed
    })

  const demoArtifact = loadHrDemoPilotArtifact()
  const prioritizedReadyCampaigns = prioritizeHrDemoCampaigns(
    [...readyCampaigns]
      .filter((campaign) => campaign.total_completed >= 10)
      .sort((left, right) => getPriority(right) - getPriority(left))
      .map((campaign) => ({
        campaignId: campaign.campaign_id,
        campaign,
      })),
    demoArtifact ? { campaignId: demoArtifact.campaignId } : null,
  )

  const featuredCandidate = prioritizedReadyCampaigns[0]?.campaign ?? null

  const entries: ReportLibraryEntry[] = readyCampaigns.map((campaign) => {
    const category = getCategory(campaign.scan_type)

    return {
      campaignId: campaign.campaign_id,
      campaignName: campaign.campaign_name,
      scanType: campaign.scan_type,
      category,
      categoryLabel: getCategoryLabel(category),
      title: getEntryTitle(campaign, category),
      summary: getEntrySummary(campaign, category),
      metaLeft: `${campaign.total_completed} responses`,
      metaRight: formatDutchDate(campaign.created_at),
      recommended: featuredCandidate?.campaign_id === campaign.campaign_id,
      bridgeState: getReportBridgeState({
        campaign,
        routeEntryStage: options.routeEntryStageByCampaignId?.[campaign.campaign_id] ?? null,
        routeOpenable: options.routeOpenableByCampaignId?.[campaign.campaign_id] === true,
      }),
    }
  })

  const featured: FeaturedReportEntry | null = featuredCandidate
    ? {
        campaignId: featuredCandidate.campaign_id,
        campaignName: featuredCandidate.campaign_name,
        scanType: featuredCandidate.scan_type,
        bridgeState: getReportBridgeState({
          campaign: featuredCandidate,
          routeEntryStage: options.routeEntryStageByCampaignId?.[featuredCandidate.campaign_id] ?? null,
          routeOpenable: options.routeOpenableByCampaignId?.[featuredCandidate.campaign_id] === true,
        }),
        title:
          featuredCandidate.campaign_name ||
          `${SCAN_TYPE_LABELS[featuredCandidate.scan_type]} ${formatDutchQuarter(featuredCandidate.created_at)}`,
        subtitle: `${SCAN_TYPE_LABELS[featuredCandidate.scan_type]} · ${formatDutchQuarter(featuredCandidate.created_at)}`,
        description:
          'Gebruik dit rapport als eerste samenvatting: wat speelt nu, wat vraagt verificatie en welke eigenaar, eerste stap en reviewmoment horen daarna vastgelegd te worden.',
        stats: [
          { label: 'Responses', value: String(featuredCandidate.total_completed) },
          {
            label: 'Signaal',
            value: `${(getCampaignAverageSignalScore(featuredCandidate) ?? 0).toFixed(1)}/10`,
          },
          { label: 'Route', value: SCAN_TYPE_LABELS[featuredCandidate.scan_type] },
        ],
      }
    : null

  return {
    entries,
    featured,
  }
}

export function filterReportLibraryEntries(entries: ReportLibraryEntry[], category: ReportLibraryCategory) {
  if (category === 'all') return entries
  return entries.filter((entry) => entry.category === category)
}
