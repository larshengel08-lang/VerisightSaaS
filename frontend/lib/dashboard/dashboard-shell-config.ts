export type DashboardShellMode = 'buyer' | 'admin'

export type DashboardNavItem = {
  href: string
  label: string
  detail: string
}

export type DashboardShellConfig = {
  mode: DashboardShellMode
  accountLabel: string
  modeLabel: string
  currentLabel: string
  bannerText: string | null
  navigation: DashboardNavItem[]
  userEmail: string
}

type DashboardShellConfigArgs = {
  isAdmin: boolean
  pathname: string
  acceptedCount: number
  userEmail: string
}

const BUYER_NAVIGATION: DashboardNavItem[] = [
  {
    href: '/dashboard',
    label: 'Cockpit',
    detail: 'Campaignstatus, managementduiding en rapportdiscipline.',
  },
]

const ADMIN_NAVIGATION: DashboardNavItem[] = [
  {
    href: '/dashboard',
    label: 'Cockpit',
    detail: 'Buyer-facing waarheid, bewaakt vanuit operations.',
  },
  {
    href: '/beheer',
    label: 'Setup',
    detail: 'Organisaties, campagnes en launchdiscipline.',
  },
  {
    href: '/beheer/contact-aanvragen',
    label: 'Leads',
    detail: 'Sales-to-delivery context en overdracht.',
  },
  {
    href: '/beheer/klantlearnings',
    label: 'Learnings',
    detail: 'Deliverylessen, repeat-signalen en closeout.',
  },
]

export function getDashboardShellConfig({
  isAdmin,
  pathname,
  acceptedCount,
  userEmail,
}: DashboardShellConfigArgs): DashboardShellConfig {
  const mode: DashboardShellMode = isAdmin ? 'admin' : 'buyer'

  return {
    mode,
    accountLabel: isAdmin ? 'Loep beheer' : 'Klantdashboard',
    modeLabel: isAdmin ? 'Beheerweergave · sobere operationslaag' : 'Klantweergave · premium begeleide uitvoering',
    currentLabel: getDashboardCurrentLabel(pathname),
    bannerText:
      acceptedCount > 0
        ? `Jouw account is gekoppeld aan ${acceptedCount} organisatie${acceptedCount === 1 ? '' : 's'}. Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.`
        : null,
    navigation: isAdmin ? ADMIN_NAVIGATION : BUYER_NAVIGATION,
    userEmail,
  }
}

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname.startsWith('/campaigns/')
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getDashboardCurrentLabel(pathname: string) {
  if (pathname.startsWith('/campaigns/')) return 'Campagnedetail'
  if (pathname.startsWith('/beheer/contact-aanvragen')) return 'Leadcontext'
  if (pathname.startsWith('/beheer/klantlearnings')) return 'Learningoverzicht'
  if (pathname.startsWith('/beheer')) return 'Setup en beheer'
  return 'Campagneoverzicht'
}
