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
  | 'team'
  | 'pulse'
  | 'reports'

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

const MODULE_LABELS: Array<{ key: DashboardModuleKey; label: string; scanType?: ScanType }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'exit', label: 'ExitScan', scanType: 'exit' },
  { key: 'retention', label: 'RetentieScan', scanType: 'retention' },
  { key: 'onboarding', label: 'Onboarding 30-60-90', scanType: 'onboarding' },
  { key: 'team', label: 'TeamScan', scanType: 'team' },
  { key: 'pulse', label: 'Pulse', scanType: 'pulse' },
  { key: 'reports', label: 'Reports' },
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

function getModuleKeyForScanType(scanType: ScanType): Exclude<DashboardModuleKey, 'overview' | 'reports'> {
  const moduleKeyByScanType = {
    exit: 'exit',
    retention: 'retention',
    onboarding: 'onboarding',
    team: 'team',
    pulse: 'pulse',
    leadership: 'team',
  } as const satisfies Record<ScanType, Exclude<DashboardModuleKey, 'overview' | 'reports'>>

  return moduleKeyByScanType[scanType]
}

export function getActiveModuleFromPathname(
  pathname: string,
  campaigns: DashboardShellCampaignRef[],
): DashboardModuleKey {
  if (!pathname.startsWith('/campaigns/')) return 'overview'

  const [, , campaignId] = pathname.split('/')
  if (!campaignId) return 'overview'

  const campaign = campaigns.find((entry) => entry.campaign_id === campaignId)
  return campaign ? getModuleKeyForScanType(campaign.scan_type) : 'overview'
}

export function buildDashboardShellNavigation({
  isAdmin,
  currentCampaignPath,
  campaigns,
  portfolioCounts,
}: {
  isAdmin: boolean
  currentCampaignPath: string | null
  campaigns: DashboardShellCampaignRef[]
  portfolioCounts: PortfolioCounts
}): DashboardShellNavigation {
  void currentCampaignPath
  void portfolioCounts

  const modules = MODULE_LABELS.map((item) => {
    if (item.key === 'overview') {
      return {
        key: item.key,
        label: item.label,
        href: '/dashboard',
        disabled: false,
      }
    }

    if (item.key === 'reports') {
      return {
        key: item.key,
        label: item.label,
        href: '/dashboard#reports',
        disabled: false,
      }
    }

    const campaign = item.scanType ? pickRepresentativeCampaign(campaigns, item.scanType) : null
    const href = getCampaignHref(campaign)

    return {
      key: item.key,
      label: item.label,
      href,
      disabled: href === null,
    }
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
          label: 'Learnings',
          detail: 'Klantlearnings en bounded closeoutdiscipline.',
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

export function getDashboardShellCurrentLabel(pathname: string) {
  if (pathname.startsWith('/campaigns/')) return 'Campagneread'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Learning workbench'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'

  return 'Dashboard overview'
}
