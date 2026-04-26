export type DashboardPortfolioView = 'ready' | 'building' | 'setup' | 'closed'

type PortfolioCounts = Record<DashboardPortfolioView, number>

type DashboardShellNavItem = {
  label: string
  detail: string
  href: string | null
  disabled: boolean
}

export type DashboardModuleKey = 'overview' | 'exitscan' | 'retentiescan' | 'onboarding' | 'pulse' | 'leadership'

export type DashboardModuleNavItem = {
  key: DashboardModuleKey
  label: string
  href: string
  section: 'modules' | 'support'
}

export const DASHBOARD_MODULE_NAV: DashboardModuleNavItem[] = [
  { key: 'overview',     label: 'Overzicht',           href: '/dashboard',              section: 'modules' },
  { key: 'exitscan',    label: 'ExitScan',             href: '/dashboard/exitscan',     section: 'modules' },
  { key: 'retentiescan', label: 'RetentieScan',        href: '/dashboard/retentiescan', section: 'modules' },
  { key: 'onboarding',  label: 'Onboarding 30-60-90',  href: '/dashboard/onboarding',   section: 'modules' },
  { key: 'pulse',       label: 'Pulse',                href: '/dashboard/pulse',        section: 'support' },
  { key: 'leadership',  label: 'Leadership Scan',      href: '/dashboard/leadership',   section: 'support' },
]

export function getActiveModuleFromPathname(pathname: string): DashboardModuleKey {
  if (pathname.startsWith('/dashboard/exitscan') || pathname.startsWith('/campaigns/')) return 'exitscan'
  if (pathname.startsWith('/dashboard/retentiescan')) return 'retentiescan'
  if (pathname.startsWith('/dashboard/onboarding')) return 'onboarding'
  if (pathname.startsWith('/dashboard/pulse')) return 'pulse'
  if (pathname.startsWith('/dashboard/leadership')) return 'leadership'
  return 'overview'
}

export type DashboardShellNavigation = {
  modules: DashboardModuleNavItem[]
  support: DashboardModuleNavItem[]
  admin: DashboardShellNavItem[]
}

export function normalizeDashboardPortfolioView(view: string | undefined): DashboardPortfolioView {
  if (view === 'building' || view === 'setup' || view === 'closed') {
    return view
  }

  return 'ready'
}

export function buildDashboardShellNavigation({
  isAdmin,
  currentCampaignPath,
  portfolioCounts,
}: {
  isAdmin: boolean
  currentCampaignPath: string | null
  portfolioCounts: PortfolioCounts
}): DashboardShellNavigation {
  void currentCampaignPath
  void portfolioCounts

  const modules = DASHBOARD_MODULE_NAV.filter((item) => item.section === 'modules')
  const support = DASHBOARD_MODULE_NAV.filter((item) => item.section === 'support')

  const admin: DashboardShellNavItem[] = isAdmin
    ? [
        {
          label: 'Rapporten',
          detail: 'Organisaties, campaignsetup en launchdiscipline.',
          href: '/beheer',
          disabled: false,
        },
        {
          label: 'Nieuwe campagne',
          detail: 'Sales-to-delivery context en contactaanvragen.',
          href: '/beheer/contact-aanvragen',
          disabled: false,
        },
        {
          label: 'Action Center',
          detail: 'Admin-first follow-through, reviewdruk en bounded dossieropvolging.',
          href: '/beheer/klantlearnings',
          disabled: false,
        },
      ]
    : []

  return {
    modules,
    support,
    admin,
  }
}

export function getDashboardShellCurrentLabel(pathname: string) {
  if (pathname.startsWith('/campaigns/')) return 'Campagneread'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Action Center'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'

  return 'Dashboardoverzicht'
}
