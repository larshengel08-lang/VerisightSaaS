import type { CampaignStats, ScanType } from '@/lib/types'

export type DashboardPortfolioView = 'ready' | 'building' | 'setup' | 'closed'

type PortfolioCounts = Record<DashboardPortfolioView, number>

type DashboardShellNavItem = {
  label: string
  detail: string
  href: string | null
  disabled: boolean
}

export type DashboardModuleKey =
  | 'overview'
  | 'exit'
  | 'retention'
  | 'onboarding'
  | 'pulse'
  | 'leadership'
  | 'reports'
  | 'action_center'

export type DashboardModuleNavItem = {
  key: DashboardModuleKey
  label: string
  href: string | null
  disabled: boolean
}

export type DashboardShellCampaignRef = Pick<
  CampaignStats,
  'campaign_id' | 'scan_type' | 'is_active' | 'created_at' | 'total_completed'
>

export type DashboardShellNavigation = {
  modules: DashboardModuleNavItem[]
  admin: DashboardShellNavItem[]
}

export type DashboardShellMode = 'full' | 'action_center_only'

const MODULE_LABELS: Array<{ key: DashboardModuleKey; label: string; scanType?: ScanType }> = [
  { key: 'overview', label: 'Overzicht' },
  { key: 'exit', label: 'ExitScan', scanType: 'exit' },
  { key: 'retention', label: 'RetentieScan', scanType: 'retention' },
  { key: 'onboarding', label: 'Onboarding 30-60-90', scanType: 'onboarding' },
  { key: 'pulse', label: 'Pulse', scanType: 'pulse' },
  { key: 'leadership', label: 'Leadership Scan', scanType: 'leadership' },
  { key: 'reports', label: 'Rapporten' },
  { key: 'action_center', label: 'Action Center' },
]

export function normalizeDashboardPortfolioView(view: string | undefined): DashboardPortfolioView {
  if (view === 'building' || view === 'setup' || view === 'closed') {
    return view
  }

  return 'ready'
}

function pickRepresentativeCampaign(
  campaigns: DashboardShellCampaignRef[],
  scanType: ScanType,
): DashboardShellCampaignRef | null {
  const matches = campaigns.filter((campaign) => campaign.scan_type === scanType)
  if (matches.length === 0) return null

  return [...matches].sort((left, right) => {
    if (left.is_active !== right.is_active) return left.is_active ? -1 : 1
    const completionDelta = (right.total_completed ?? 0) - (left.total_completed ?? 0)
    if (completionDelta !== 0) return completionDelta
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })[0] ?? null
}

function getCampaignHref(campaign: DashboardShellCampaignRef | null) {
  return campaign ? `/campaigns/${campaign.campaign_id}` : null
}

function getModuleKeyForScanType(scanType: ScanType): DashboardModuleKey {
  if (scanType === 'team') {
    return 'overview'
  }

  const moduleKeyByScanType: Record<
    Exclude<ScanType, 'team'>,
    Exclude<DashboardModuleKey, 'overview' | 'reports' | 'action_center'>
  > = {
    exit: 'exit',
    retention: 'retention',
    onboarding: 'onboarding',
    pulse: 'pulse',
    leadership: 'leadership',
  }

  return moduleKeyByScanType[scanType]
}

export function getActiveModuleFromPathname(
  pathname: string,
  campaigns: DashboardShellCampaignRef[],
): DashboardModuleKey {
  if (pathname.startsWith('/reports')) return 'reports'
  if (pathname.startsWith('/action-center')) return 'action_center'
  if (!pathname.startsWith('/campaigns/')) return 'overview'

  const [, , campaignId] = pathname.split('/')
  if (!campaignId) return 'overview'

  const campaign = campaigns.find((entry) => entry.campaign_id === campaignId)
  return campaign ? getModuleKeyForScanType(campaign.scan_type) : 'overview'
}

export function buildDashboardShellNavigation({
  isAdmin,
  shellMode = 'full',
  currentCampaignPath,
  campaigns,
  portfolioCounts,
}: {
  isAdmin: boolean
  shellMode?: DashboardShellMode
  currentCampaignPath: string | null
  campaigns: DashboardShellCampaignRef[]
  portfolioCounts: PortfolioCounts
}): DashboardShellNavigation {
  void currentCampaignPath
  void portfolioCounts

  if (shellMode === 'action_center_only') {
    return {
      modules: [
        {
          key: 'action_center',
          label: 'Action Center',
          href: '/action-center',
          disabled: false,
        },
      ],
      admin: [],
    }
  }

  const modules = MODULE_LABELS.flatMap((item) => {
    if (item.key === 'overview') {
      return [
        {
          key: item.key,
          label: item.label,
          href: '/dashboard',
          disabled: false,
        },
      ]
    }

    if (item.key === 'reports') {
      return [
        {
          key: item.key,
          label: item.label,
          href: '/reports',
          disabled: false,
        },
      ]
    }

    if (item.key === 'action_center') {
      return [
        {
          key: item.key,
          label: item.label,
          href: '/action-center',
          disabled: false,
        },
      ]
    }

    const campaign = item.scanType ? pickRepresentativeCampaign(campaigns, item.scanType) : null
    const href = getCampaignHref(campaign)

    if (href === null) {
      return []
    }

    return [
      {
        key: item.key,
        label: item.label,
        href,
        disabled: false,
      },
    ]
  })

  const admin: DashboardShellNavItem[] = isAdmin
    ? [
        {
          label: 'Setup',
          detail: 'Organisaties, campaignsetup en launchdiscipline.',
          href: '/beheer',
          disabled: false,
        },
        {
          label: 'Leads',
          detail: 'Sales-to-delivery context en contactaanvragen.',
          href: '/beheer/contact-aanvragen',
          disabled: false,
        },
        {
          label: 'Action Center bron',
          detail: 'Broncampagnes en opvolging beheren.',
          href: '/beheer/klantlearnings',
          disabled: false,
        },
      ]
    : []

  return {
    modules,
    admin,
  }
}

export const ACTION_CENTER_NAV = [
  { href: '/action-center', label: 'Overzicht' },
  { href: '/action-center/acties', label: 'Acties' },
  { href: '/action-center/reviewmomenten', label: 'Reviewmomenten' },
  { href: '/action-center/managers', label: 'Managers' },
  { href: '/action-center/mijn-teams', label: 'Mijn teams' },
] as const

export type ActionCenterNavItem = (typeof ACTION_CENTER_NAV)[number]

export function getDashboardShellCurrentLabel(pathname: string) {
  if (pathname.startsWith('/reports')) return 'Rapporten'
  if (pathname.startsWith('/action-center')) return 'Action Center'
  if (pathname.startsWith('/campaigns/')) return 'Campagnedetail'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Action Center'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'

  return 'Overzicht'
}
