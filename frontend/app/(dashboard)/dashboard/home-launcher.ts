import { getScanDefinition } from '@/lib/scan-definitions'
import type { CampaignStats } from '@/lib/types'

export type DashboardHomeBucket = 'open_now' | 'building' | 'closed' | 'archive'
export type DashboardHomeEmptyState = 'no_campaigns' | 'has_campaigns'
export type HomeActionKind = 'dashboard' | 'pdf' | 'setup' | 'none'
export type HomeTone = 'slate' | 'blue' | 'emerald' | 'amber'

export type HomeActionModel = {
  kind: HomeActionKind
  label: string
  description: string
  available: boolean
  href: string | null
  reason?: string
}

export type HomeMetricModel = {
  label: string
  value: string
}

export type HomeCampaignCardModel = {
  campaign: CampaignStats
  bucket: DashboardHomeBucket
  title: string
  periodLabel: string
  statusLabel: string
  statusTone: HomeTone
  managementSummary: string
  actionSummary: string
  metrics: HomeMetricModel[]
  primaryAction: HomeActionModel
  secondaryAction?: HomeActionModel
}

export type HomeGroupModel = {
  bucket: DashboardHomeBucket
  title: string
  description: string
  campaigns: HomeCampaignCardModel[]
  defaultOpen: boolean
}

export type HomeRecommendationModel = {
  campaign: CampaignStats
  title: string
  reason: string
  primaryAction: HomeActionModel
  secondaryAction?: HomeActionModel
  dashboardChoiceDescription: string
  pdfChoiceDescription: string
}

export type DashboardHomeModel = {
  recommendation: HomeRecommendationModel | null
  groups: HomeGroupModel[]
  sections: Array<'recommendation' | 'portfolio' | 'support'>
  emptyState: DashboardHomeEmptyState
  counts: Record<DashboardHomeBucket, number>
}

const GROUP_ORDER: DashboardHomeBucket[] = ['open_now', 'building', 'closed', 'archive']

const GROUP_METADATA: Record<
  DashboardHomeBucket,
  { title: string; description: string; defaultOpen: boolean }
> = {
  open_now: {
    title: 'Nu openen',
    description: 'Campagnes die nu het meest klaar zijn voor interactieve lezing, prioritering en follow-up.',
    defaultOpen: true,
  },
  building: {
    title: 'Nog in opbouw',
    description: 'Campagnes die al lopen, maar waar respons of livegang nog eerst verder moet worden opgebouwd.',
    defaultOpen: true,
  },
  closed: {
    title: 'Gesloten / rapport beschikbaar',
    description: 'Recent gesloten campagnes die nu vooral dienen voor rapportgebruik, follow-up en vervolgbesluit.',
    defaultOpen: true,
  },
  archive: {
    title: 'Archief',
    description: 'Oudere gesloten campagnes die beschikbaar blijven voor terugblik, vergelijking en naslag.',
    defaultOpen: false,
  },
}

export function buildDashboardHomeModel(args: {
  campaigns: CampaignStats[]
  isAdmin: boolean
}): DashboardHomeModel {
  const sortedCampaigns = [...args.campaigns].sort(compareCampaignRecency)
  const cardModels = sortedCampaigns.map((campaign) => buildCampaignCardModel(campaign, sortedCampaigns, args.isAdmin))

  const groups = GROUP_ORDER.map((bucket) => ({
    bucket,
    title: GROUP_METADATA[bucket].title,
    description: GROUP_METADATA[bucket].description,
    defaultOpen: GROUP_METADATA[bucket].defaultOpen,
    campaigns: cardModels.filter((campaign) => campaign.bucket === bucket),
  })).filter((group) => group.campaigns.length > 0)

  return {
    recommendation: buildRecommendation(cardModels, args.isAdmin),
    groups,
    sections: ['recommendation', 'portfolio', 'support'],
    emptyState: sortedCampaigns.length === 0 ? 'no_campaigns' : 'has_campaigns',
    counts: GROUP_ORDER.reduce(
      (result, bucket) => {
        result[bucket] = groups.find((group) => group.bucket === bucket)?.campaigns.length ?? 0
        return result
      },
      {
        open_now: 0,
        building: 0,
        closed: 0,
        archive: 0,
      } as Record<DashboardHomeBucket, number>,
    ),
  }
}

export function getCampaignHomeBucket(
  campaign: CampaignStats,
  allCampaigns: CampaignStats[],
): DashboardHomeBucket {
  if (campaign.is_active) {
    return campaign.total_completed >= 10 ? 'open_now' : 'building'
  }

  const latestClosedByScanType = new Map<string, string>()
  for (const candidate of [...allCampaigns].filter((item) => !item.is_active).sort(compareCampaignRecency)) {
    if (!latestClosedByScanType.has(candidate.scan_type)) {
      latestClosedByScanType.set(candidate.scan_type, candidate.campaign_id)
    }
  }

  return latestClosedByScanType.get(campaign.scan_type) === campaign.campaign_id ? 'closed' : 'archive'
}

function buildCampaignCardModel(
  campaign: CampaignStats,
  allCampaigns: CampaignStats[],
  isAdmin: boolean,
): HomeCampaignCardModel {
  const bucket = getCampaignHomeBucket(campaign, allCampaigns)
  const scanDefinition = getScanDefinition(campaign.scan_type)
  const primaryAction = buildDashboardAction(campaign, bucket, isAdmin)
  const secondaryAction = buildPdfAction(campaign, bucket)

  return {
    campaign,
    bucket,
    title: campaign.campaign_name,
    periodLabel: formatCampaignPeriod(campaign.created_at),
    statusLabel: getStatusLabel(bucket, campaign),
    statusTone: getStatusTone(bucket, campaign),
    managementSummary: getManagementSummary(bucket, campaign, scanDefinition.productName),
    actionSummary: getActionSummary(bucket, primaryAction, secondaryAction),
    metrics: [
      { label: 'Respons', value: `${campaign.completion_rate_pct ?? 0}%` },
      { label: 'Ingevuld', value: `${campaign.total_completed}` },
      { label: 'Uitgenodigd', value: `${campaign.total_invited}` },
      {
        label: scanDefinition.signalLabel,
        value: campaign.avg_risk_score !== null ? `${campaign.avg_risk_score.toFixed(1)}/10` : '-',
      },
    ],
    primaryAction,
    secondaryAction,
  }
}

function buildRecommendation(
  campaigns: HomeCampaignCardModel[],
  isAdmin: boolean,
): HomeRecommendationModel | null {
  const sorted = [...campaigns].sort((left, right) => compareRecommendationPriority(left, right))
  const top = sorted[0]

  if (!top) return null

  const preferredPrimaryAction =
    top.bucket === 'closed' || top.bucket === 'archive' ? top.secondaryAction : top.primaryAction
  const fallbackPrimaryAction =
    preferredPrimaryAction?.available
      ? preferredPrimaryAction
      : top.primaryAction.available
        ? top.primaryAction
        : top.secondaryAction?.available
          ? top.secondaryAction
          : top.primaryAction
  const primaryAction = fallbackPrimaryAction
  const secondaryAction =
    primaryAction.kind === top.primaryAction.kind ? top.secondaryAction : top.primaryAction

  return {
    campaign: top.campaign,
    title: buildRecommendationTitle(top, isAdmin),
    reason: buildRecommendationReason(top, isAdmin),
    primaryAction,
    secondaryAction,
    dashboardChoiceDescription:
      'Dashboard = lezen, prioriteren en direct bepalen wat nu aandacht vraagt.',
    pdfChoiceDescription:
      'PDF = delen, bespreken en meenemen als compacte managementsamenvatting.',
  }
}

function compareRecommendationPriority(left: HomeCampaignCardModel, right: HomeCampaignCardModel) {
  const recommendationOrder: DashboardHomeBucket[] = ['open_now', 'closed', 'building', 'archive']
  const bucketRank = recommendationOrder.indexOf(left.bucket) - recommendationOrder.indexOf(right.bucket)
  if (bucketRank !== 0) return bucketRank

  const responseRank = (right.campaign.completion_rate_pct ?? 0) - (left.campaign.completion_rate_pct ?? 0)
  if (responseRank !== 0) return responseRank

  const completedRank = right.campaign.total_completed - left.campaign.total_completed
  if (completedRank !== 0) return completedRank

  const signalRank = (right.campaign.avg_risk_score ?? -1) - (left.campaign.avg_risk_score ?? -1)
  if (signalRank !== 0) return signalRank

  return compareCampaignRecency(left.campaign, right.campaign)
}

function compareCampaignRecency(left: CampaignStats, right: CampaignStats) {
  return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
}

function buildDashboardAction(
  campaign: CampaignStats,
  bucket: DashboardHomeBucket,
  isAdmin: boolean,
): HomeActionModel {
  if (campaign.total_invited === 0) {
    if (isAdmin) {
      return {
        kind: 'setup',
        label: 'Beheer route',
        description: 'Open de werktafel om doelgroep, communicatie en livegang af te ronden.',
        available: true,
        href: `/campaigns/${campaign.campaign_id}/beheer`,
      }
    }

    return {
      kind: 'dashboard',
      label: 'Wacht op livegang',
      description: 'Nog niet leesbaar. Eerst livegang en eerste respons, daarna pas dashboardkeuze.',
      available: false,
      href: null,
      reason: 'Nog niet leesbaar: wacht op livegang en eerste respons voordat dashboard of PDF zinvol worden.',
    }
  }

  return {
    kind: 'dashboard',
    label: bucket === 'archive' ? 'Open archiefdashboard' : 'Open dashboard',
    description:
      bucket === 'closed' || bucket === 'archive'
        ? 'Gebruik het dashboard voor interactieve terugblik, follow-up en het terughalen van prioriteiten.'
        : 'Gebruik het dashboard voor interactieve lezing, prioritering en vervolgstappen.',
    available: true,
    href: `/campaigns/${campaign.campaign_id}`,
  }
}

function buildPdfAction(campaign: CampaignStats, bucket: DashboardHomeBucket): HomeActionModel {
  if (campaign.scan_type === 'pulse') {
    return {
      kind: 'pdf',
      label: 'PDF niet beschikbaar',
      description: 'Pulse gebruikt in deze fase het dashboard als primaire managementoutput.',
      available: false,
      href: null,
      reason: 'Pulse ondersteunt in deze fase nog geen formeel PDF-rapport.',
    }
  }

  const reportReady = bucket === 'closed' || bucket === 'archive' || campaign.total_completed >= 10
  if (!reportReady) {
    return {
      kind: 'pdf',
      label: 'PDF volgt later',
      description: 'Het rapport wordt pas zinvol zodra de campaign voldoende respons heeft voor een leesbare managementsamenvatting.',
      available: false,
      href: null,
      reason: 'Rapport volgt zodra de campaign voldoende respons heeft voor een leesbare managementsamenvatting.',
    }
  }

  return {
    kind: 'pdf',
    label: 'Bekijk PDF',
    description:
      bucket === 'closed' || bucket === 'archive'
        ? 'Gebruik het rapport voor delen, bespreking en boardroom-ready follow-up.'
        : 'Gebruik het rapport voor delen, bespreking en een boardroom-ready samenvatting naast het dashboard.',
    available: true,
    href: null,
  }
}

function getStatusLabel(bucket: DashboardHomeBucket, campaign: CampaignStats) {
  if (bucket === 'open_now') return 'Nu openen'
  if (bucket === 'archive') return 'Archief'
  if (bucket === 'closed') return 'Rapport beschikbaar'
  if (campaign.total_invited === 0) return 'Wachten op livegang'
  return 'Nog in opbouw'
}

function getStatusTone(bucket: DashboardHomeBucket, campaign: CampaignStats): HomeTone {
  if (bucket === 'open_now') return 'blue'
  if (bucket === 'closed') return 'emerald'
  if (bucket === 'archive') return 'slate'
  return campaign.total_invited === 0 ? 'amber' : 'amber'
}

function getManagementSummary(bucket: DashboardHomeBucket, campaign: CampaignStats, productName: string) {
  if (bucket === 'open_now') {
    return `${productName} heeft nu genoeg respons om echt te lezen, te prioriteren en het vervolggesprek te richten.`
  }

  if (bucket === 'building') {
    if (campaign.total_invited === 0) {
      return `${productName} is nog niet live genoeg om te lezen; de eerstvolgende waarde zit nu in launch en respondentactivatie.`
    }

    return `${productName} bouwt nog op. Lees dit nu vooral als tussenstand en gebruik de output nog niet als vol patroonbeeld.`
  }

  if (bucket === 'closed') {
    return `${productName} is gesloten en blijft nu vooral relevant voor rapportgebruik, follow-up en bestuurlijke terugkoppeling.`
  }

  return `${productName} blijft beschikbaar als archieflaag voor terugblik, vergelijking en het ophalen van eerdere managementkeuzes.`
}

function getActionSummary(
  bucket: DashboardHomeBucket,
  primaryAction: HomeActionModel,
  secondaryAction?: HomeActionModel,
) {
  if (bucket === 'open_now') {
    return 'Dashboard eerst voor duiding en prioritering; rapport alleen als secundaire samenvatting of deelstuk.'
  }

  if (bucket === 'building') {
    return primaryAction.available
      ? 'Gebruik vooral het dashboard om te zien hoe deze campaign opbouwt; rapport blijft nog bewust secundair.'
      : primaryAction.reason ?? primaryAction.description
  }

  if (bucket === 'closed') {
    return secondaryAction?.available
      ? 'Gebruik rapport en dashboard als duo: rapport voor bespreking, dashboard voor interactieve terugblik.'
      : 'Deze gesloten campaign levert nu vooral waarde als follow-updocument en terugblik.'
  }

  return 'Archiefcampagnes blijven beschikbaar zonder te concurreren met de huidige eerstvolgende campaignkeuze.'
}

function buildRecommendationTitle(card: HomeCampaignCardModel, isAdmin: boolean) {
  if (card.bucket === 'open_now') return 'Aanbevolen campagne om nu te openen'
  if (card.bucket === 'building' && card.campaign.total_invited === 0 && isAdmin) {
    return 'Aanbevolen campagne om nu live te zetten'
  }
  if (card.bucket === 'building') return 'Aanbevolen campagne om nu te volgen'
  if (card.bucket === 'closed') return 'Aanbevolen campagne om nu terug te lezen'
  return 'Aanbevolen campaign uit het archief'
}

function buildRecommendationReason(card: HomeCampaignCardModel, isAdmin: boolean) {
  if (card.bucket === 'open_now') {
    return `${card.campaign.campaign_name} heeft nu het stevigste leesniveau in je actieve portfolio en is daardoor de beste eerste managementroute om nu te openen.`
  }

  if (card.bucket === 'building' && card.campaign.total_invited === 0) {
    return isAdmin
      ? `${card.campaign.campaign_name} staat het dichtst bij livegang. Rond eerst setup en launch af voordat de rest van de portfolio gaat concurreren om aandacht.`
      : `${card.campaign.campaign_name} is nog niet live genoeg om te lezen. Wacht op activatie en eerste respons voordat dashboard of rapport de juiste volgende stap worden.`
  }

  if (card.bucket === 'building') {
    return `${card.campaign.campaign_name} bouwt nu het snelst op. Open het dashboard alleen om respons en eerste richting te volgen, nog niet voor een definitieve lezing.`
  }

  if (card.bucket === 'closed') {
    return `${card.campaign.campaign_name} is nu de meest recente rapportklare campaign en dus de meest rapportklaar leesbare follow-up voor delen, bespreken en teruglezen.`
  }

  return `${card.campaign.campaign_name} blijft het meest relevante archiefpunt als je een oudere campaign opnieuw wilt raadplegen.`
}

function formatCampaignPeriod(value: string) {
  return new Intl.DateTimeFormat('nl-NL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}
