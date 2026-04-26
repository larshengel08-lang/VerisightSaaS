'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LogoutButton } from '@/components/ui/logout-button'
import {
  buildDashboardShellNavigation,
  getDashboardShellCurrentLabel,
  DASHBOARD_MODULE_NAV,
  getActiveModuleFromPathname,
  type DashboardPortfolioView,
  type DashboardModuleNavItem,
} from '@/lib/dashboard/shell-navigation'

type PortfolioCounts = Record<DashboardPortfolioView, number>

export function DashboardShellFrame({
  isAdmin,
  userEmail,
  acceptedCount,
  portfolioCounts,
  children,
}: {
  isAdmin: boolean
  userEmail: string
  acceptedCount: number
  portfolioCounts: PortfolioCounts
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const currentCampaignPath = pathname.startsWith('/campaigns/') ? pathname : null
  const activeModule = getActiveModuleFromPathname(pathname)
  const navigation = useMemo(
    () =>
      buildDashboardShellNavigation({
        isAdmin,
        currentCampaignPath,
        portfolioCounts,
      }),
    [currentCampaignPath, isAdmin, portfolioCounts],
  )
  const mobileItems = [...navigation.modules, ...navigation.support]

  const activeModuleLabel = DASHBOARD_MODULE_NAV.find((m) => m.key === activeModule)?.label ?? 'Overzicht'
  const currentLabel = getDashboardShellCurrentLabel(pathname)
  const orgName = userEmail.split('@')[1]?.split('.')[0] ?? 'Dashboard'
  const orgDisplay = orgName.charAt(0).toUpperCase() + orgName.slice(1)

  return (
    <div
      className="min-h-screen text-[color:var(--ink)]"
      style={{ backgroundColor: 'var(--dashboard-canvas)' }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className="hidden w-[280px] shrink-0 lg:flex"
          style={{ backgroundColor: 'var(--dashboard-rail)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="sticky top-0 flex h-screen w-full flex-col py-7">
            {/* Wordmark */}
            <div className="px-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href="/dashboard" className="block">
                <span
                  className="text-[15px] font-semibold tracking-[-0.01em]"
                  style={{ color: 'rgba(246,241,233,0.95)' }}
                >
                  Verisight
                </span>
              </Link>
            </div>

            {/* Module navigation */}
            <nav className="flex-1 overflow-y-auto px-4 pt-6">
              <SidebarSection label="Modules" items={navigation.modules} activeModule={activeModule} onNavigate={() => {}} />
              <SidebarSection
                label="Support"
                items={navigation.support}
                activeModule={activeModule}
                onNavigate={() => {}}
                className="mt-6"
              />
              {navigation.admin.length > 0 && (
                <div className="mt-6">
                  <p
                    className="mb-2 px-3 text-[0.60rem] font-medium uppercase"
                    style={{ color: 'rgba(246,241,233,0.38)', letterSpacing: '0.18em' }}
                  >
                    Beheer
                  </p>
                  {navigation.admin.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href ?? '/dashboard'}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                      style={{ color: 'rgba(246,241,233,0.70)' }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {/* Account footer */}
            <div
              className="mx-4 rounded-xl px-4 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="truncate text-xs" style={{ color: 'rgba(246,241,233,0.55)' }}>
                {userEmail}
              </p>
              <div className="mt-2">
                <LogoutButton className="w-full justify-center rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-[rgba(246,241,233,0.80)] transition-colors hover:bg-white/[0.12]" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header
            className="sticky top-0 z-40 backdrop-blur-md"
            style={{
              background: 'rgba(248,244,238,0.88)',
              borderBottom: '1px solid rgba(19,32,51,0.08)',
            }}
          >
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 py-3">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:hidden"
                style={{ border: '1px solid var(--dashboard-frame-border)', color: 'var(--dashboard-ink)' }}
                aria-label={mobileNavOpen ? 'Navigatie sluiten' : 'Navigatie openen'}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>

              {/* Context label */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--dashboard-ink)' }}>
                  <span style={{ color: 'var(--dashboard-muted)' }}>{orgDisplay}</span>
                  <span className="mx-1.5" style={{ color: 'var(--dashboard-frame-border)' }}>·</span>
                  <span>{activeModuleLabel}</span>
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                  {currentLabel}
                </p>
              </div>

            </div>

            {/* Mobile nav */}
            {mobileNavOpen && (
              <div
                className="border-t px-4 py-4 lg:hidden"
                style={{ borderColor: 'var(--dashboard-frame-border)', background: 'var(--dashboard-surface)' }}
              >
                <div className="space-y-1">
                  {mobileItems.map((item) => {
                    const isActive = item.key === activeModule
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                        style={{
                          background: isActive ? 'rgba(19,32,51,0.06)' : 'transparent',
                          color: isActive ? 'var(--dashboard-ink)' : 'var(--dashboard-text)',
                        }}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </header>

          <main className="mx-auto flex-1 w-full max-w-7xl px-6 py-8">
            {acceptedCount > 0 ? (
              <div
                className="mb-6 rounded-[16px] px-4 py-3 text-sm"
                style={{
                  background: 'rgba(46,124,109,0.08)',
                  border: '1px solid rgba(46,124,109,0.18)',
                  color: '#2E7C6D',
                }}
              >
                Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
                Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.
              </div>
            ) : null}
            {children}
          </main>

          <footer
            className="px-6 py-4 text-xs"
            style={{ borderTop: '1px solid var(--dashboard-frame-border)', color: 'var(--dashboard-muted)' }}
          >
            Verisight · {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  )
}

function SidebarSection({
  label,
  items,
  activeModule,
  onNavigate,
  className = '',
}: {
  label: string
  items: DashboardModuleNavItem[]
  activeModule: string
  onNavigate: () => void
  className?: string
}) {
  return (
    <div className={className}>
      <p
        className="mb-2 px-3 text-[0.60rem] font-medium uppercase"
        style={{ color: 'rgba(246,241,233,0.38)', letterSpacing: '0.18em' }}
      >
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = item.key === activeModule
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: isActive ? 'rgba(246,241,233,1)' : 'rgba(246,241,233,0.70)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--brand-accent-mid)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
