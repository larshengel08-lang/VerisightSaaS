export type DashboardPortfolioView = 'ready' | 'building' | 'setup' | 'closed'

type PortfolioCounts = Record<DashboardPortfolioView, number>

type DashboardShellNavItem = {
  label: string
  detail: string
  href: string | null
  disabled: boolean
}

type DashboardShellPortfolioItem = DashboardShellNavItem & {
  key: DashboardPortfolioView
}

export type DashboardShellNavigation = {
  primary: DashboardShellNavItem[]
  portfolio: DashboardShellPortfolioItem[]
  admin: DashboardShellNavItem[]
}

const PORTFOLIO_ITEM_LABELS: Record<DashboardPortfolioView, string> = {
  ready: 'Management-ready',
  building: 'In opbouw',
  setup: 'Setup of launch',
  closed: 'Afgerond',
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
  const primary: DashboardShellNavItem[] = [
    {
      label: 'Overview',
      detail: 'Kerncijfers, trend en waar eerst kijken.',
      href: '/dashboard',
      disabled: false,
    },
  ]

  if (currentCampaignPath) {
    primary.push({
      label: 'Huidige campagne',
      detail: 'Verdieping via tabs en bounded uitvoer.',
      href: currentCampaignPath,
      disabled: false,
    })
  }

  const portfolio: DashboardShellPortfolioItem[] = (Object.keys(PORTFOLIO_ITEM_LABELS) as DashboardPortfolioView[]).map(
    (key) => {
      const count = portfolioCounts[key]

      return {
        key,
        label: PORTFOLIO_ITEM_LABELS[key],
        detail: count > 0 ? `${count} campagne(s)` : 'Nog niet actief in deze omgeving',
        href: count > 0 ? `/dashboard?view=${key}#portfolio` : null,
        disabled: count === 0,
      }
    },
  )

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
    primary,
    portfolio,
    admin,
  }
}

export function getDashboardShellCurrentLabel(pathname: string) {
  if (pathname.startsWith('/campaigns/')) return 'Campaign detail'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Learning workbench'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'

  return 'Dashboard overview'
}
