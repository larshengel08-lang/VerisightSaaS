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
  | 'culture_assessment'
  | 'reports'
  | 'action_center'

export type DashboardCategoryModuleKey = Exclude<
  DashboardModuleKey,
  'overview' | 'reports' | 'action_center'
>

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

export function normalizeDashboardPortfolioView(view: string | undefined): DashboardPortfolioView {
  if (view === 'building' || view === 'setup' || view === 'closed') {
    return view
  }

  return 'ready'
}

const DASHBOARD_MODULE_SCAN_TYPES: Record<DashboardCategoryModuleKey, ScanType> = {
  exit: 'exit',
  retention: 'retention',
  onboarding: 'onboarding',
  pulse: 'pulse',
  leadership: 'leadership',
  culture_assessment: 'culture_assessment',
}

const DASHBOARD_MODULE_LABELS: Record<DashboardCategoryModuleKey, string> = {
  exit: 'ExitScan',
  retention: 'RetentieScan',
  onboarding: 'Onboarding 30-60-90',
  pulse: 'Pulse',
  leadership: 'Leadership Scan',
  culture_assessment: 'Loep Culture Assessment',
}

export function getScanTypeForDashboardModule(moduleKey: DashboardCategoryModuleKey): ScanType {
  return DASHBOARD_MODULE_SCAN_TYPES[moduleKey]
}

export function getDashboardModuleHref(moduleKey: DashboardCategoryModuleKey) {
  return `/dashboard?module=${moduleKey}`
}

export function getDashboardModuleLabel(moduleKey: DashboardCategoryModuleKey) {
  return DASHBOARD_MODULE_LABELS[moduleKey]
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
    culture_assessment: 'culture_assessment',
  }

  return moduleKeyByScanType[scanType]
}

export function getDashboardModuleKeyForScanType(
  scanType: Exclude<ScanType, 'team'>,
): DashboardCategoryModuleKey {
  return getModuleKeyForScanType(scanType) as DashboardCategoryModuleKey
}

export function normalizeDashboardModuleFilter(
  value: string | undefined,
): DashboardCategoryModuleKey | null {
  if (
    value === 'exit' ||
    value === 'retention' ||
    value === 'onboarding' ||
    value === 'pulse' ||
    value === 'leadership' ||
    value === 'culture_assessment'
  ) {
    return value
  }

  return null
}

export function getActiveModuleFromLocation(
  pathname: string,
  moduleFilter: string | null,
  campaigns: DashboardShellCampaignRef[],
): DashboardModuleKey {
  if (pathname.startsWith('/reports')) return 'reports'
  if (pathname.startsWith('/action-center')) return 'action_center'
  if (!pathname.startsWith('/campaigns/')) {
    return normalizeDashboardModuleFilter(moduleFilter ?? undefined) ?? 'overview'
  }

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

  const modules: DashboardModuleNavItem[] = [
    {
      key: 'overview',
      label: 'Overzicht',
      href: '/dashboard',
      disabled: false,
    },
    {
      key: 'reports',
      label: 'Rapporten',
      href: '/reports',
      disabled: false,
    },
  ]

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
          detail: 'Klantlessen, opvolging en closeout-signalen.',
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
  { href: '/action-center?view=actions', label: 'Acties' },
  { href: '/action-center?view=reviews', label: 'Reviewmomenten' },
  { href: '/action-center?view=managers', label: 'Managers' },
  { href: '/action-center?view=teams', label: 'Mijn teams' },
] as const

export type ActionCenterNavItem = (typeof ACTION_CENTER_NAV)[number]

export function getDashboardShellCurrentLabel(pathname: string) {
  if (pathname.startsWith('/reports')) return 'Rapporten'
  if (pathname.startsWith('/action-center')) return 'Action Center'
  if (pathname.startsWith('/campaigns/')) return 'Campagnedetail'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Learnings'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'

  return 'Overzicht'
}

export type ClosedCampaignNavItem = {
  campaignId: string
  href: string
  scanType: ScanType
  periodLabel: string
}

export function buildClosedCampaignNavItems(campaigns: DashboardShellCampaignRef[]): ClosedCampaignNavItem[] {
  return campaigns
    .filter((campaign) => !campaign.is_active)
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .map((campaign) => ({
      campaignId: campaign.campaign_id,
      href: `/campaigns/${campaign.campaign_id}`,
      scanType: campaign.scan_type,
      periodLabel: new Intl.DateTimeFormat('nl-NL', { month: 'short', year: 'numeric' }).format(new Date(campaign.created_at)),
    }))
}
