'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LogoutButton } from '@/components/ui/logout-button'
import {
  buildDashboardShellNavigation,
  getDashboardShellCurrentLabel,
  DASHBOARD_MODULE_NAV,
  ACTION_CENTER_NAV,
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
  const isActionCenter = pathname.startsWith('/action-center')
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
  const mobileItems = isActionCenter
    ? ACTION_CENTER_NAV
    : [...navigation.modules, ...navigation.support]

  const activeModuleLabel = isActionCenter
    ? 'Action Center'
    : (DASHBOARD_MODULE_NAV.find((m) => m.key === activeModule)?.label ?? 'Overzicht')
  const currentLabel = getDashboardShellCurrentLabel(pathname)
  const orgName = userEmail.split('@')[1]?.split('.')[0] ?? 'Dashboard'
  const orgDisplay = orgName.charAt(0).toUpperCase() + orgName.slice(1)
  const activeAcItem = ACTION_CENTER_NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))?.href ?? '/action-center'

  return (
    <div
      className="min-h-screen text-[color:var(--ink)]"
      style={{ backgroundColor: 'var(--dashboard-canvas)' }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        {/* Sidebar */}
        <aside
          className="hidden w-[260px] shrink-0 lg:flex"
          style={{ backgroundColor: 'var(--dashboard-rail)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="sticky top-0 flex h-screen w-full flex-col py-7">
            {/* Wordmark */}
            <div className="px-5 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href="/dashboard" className="flex items-center gap-2">
                <span
                  className="text-[14px] font-semibold tracking-[-0.01em]"
                  style={{ color: 'rgba(246,241,233,0.95)' }}
                >
                  Verisight
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: 'rgba(246,241,233,0.35)' }}>
                  People Insight
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 pt-5">
              {isActionCenter ? (
                /* Action Center sub-nav */
                <ActionCenterNav activeHref={activeAcItem} />
              ) : (
                /* Main module nav */
                <>
                  <SidebarSection label="Modules" items={navigation.modules} activeModule={activeModule} />
                  <SidebarSection label="Support" items={navigation.support} activeModule={activeModule} className="mt-5" />
                  {navigation.admin.length > 0 && (
                    <div className="mt-5">
                      <SidebarLabel>Beheer</SidebarLabel>
                      {navigation.admin.map((item) => (
                        <SidebarPlainLink key={item.label} href={item.href ?? '/dashboard'} label={item.label} />
                      ))}
                    </div>
                  )}
                  {/* Reports + Action Center as bottom links */}
                  <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <SidebarPlainLink href="/reports" label="Rapporten" isActive={pathname.startsWith('/reports')} />
                    <SidebarPlainLink href="/action-center" label="Action Center" isActive={pathname.startsWith('/action-center')} />
                  </div>
                </>
              )}
            </nav>

            {/* Account footer */}
            <div className="px-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="rounded-lg px-3 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="truncate text-[0.75rem]" style={{ color: 'rgba(246,241,233,0.50)' }}>
                  {userEmail}
                </p>
                <div className="mt-1.5">
                  <LogoutButton className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.72rem] font-medium text-[rgba(246,241,233,0.65)] transition-colors hover:bg-white/[0.10]" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header
            className="sticky top-0 z-40 backdrop-blur-md"
            style={{
              background: 'rgba(248,244,238,0.90)',
              borderBottom: '1px solid rgba(19,32,51,0.07)',
            }}
          >
            <div className="mx-auto flex w-full items-center gap-4 px-6 py-2.5">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors lg:hidden"
                style={{ border: '1px solid var(--dashboard-frame-border)', color: 'var(--dashboard-ink)' }}
                aria-label={mobileNavOpen ? 'Sluiten' : 'Menu'}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>

              {/* Context */}
              <div className="min-w-0 flex-1">
                {isActionCenter ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--dashboard-ink)' }}>
                    Action Center
                  </p>
                ) : (
                  <>
                    <p className="text-[0.72rem]" style={{ color: 'var(--dashboard-muted)' }}>
                      Account · {orgDisplay}
                    </p>
                    <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--dashboard-ink)' }}>
                      {activeModuleLabel === 'Overzicht' ? currentLabel : activeModuleLabel}
                    </p>
                  </>
                )}
              </div>

              {/* Topbar actions */}
              <div className="flex shrink-0 items-center gap-2">
                {isActionCenter ? (
                  <Link
                    href="/action-center/acties/nieuw"
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--dashboard-ink)' }}
                  >
                    Actie aanmaken
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/reports"
                      className="rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors"
                      style={{
                        borderColor: 'var(--dashboard-frame-border)',
                        color: 'var(--dashboard-text)',
                        background: 'transparent',
                      }}
                    >
                      Rapporten
                    </Link>
                    <Link
                      href="/action-center"
                      className="rounded-full px-3 py-1.5 text-[0.8rem] font-medium text-white transition-opacity hover:opacity-90"
                      style={{ background: 'var(--dashboard-ink)' }}
                    >
                      Action Center
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileNavOpen && (
              <div
                className="border-t px-4 py-3 lg:hidden"
                style={{ borderColor: 'var(--dashboard-frame-border)', background: 'var(--dashboard-surface)' }}
              >
                <div className="space-y-0.5">
                  {mobileItems.map((item) => {
                    const isActive = 'key' in item
                      ? item.key === activeModule
                      : pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
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

          <main className="mx-auto flex-1 w-full max-w-7xl px-6 py-7">
            {acceptedCount > 0 && !isActionCenter ? (
              <div
                className="mb-5 rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(46,124,109,0.07)',
                  border: '1px solid rgba(46,124,109,0.15)',
                  color: '#2E7C6D',
                }}
              >
                Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
              </div>
            ) : null}
            {children}
          </main>

          <footer
            className="px-6 py-3 text-[0.72rem]"
            style={{ borderTop: '1px solid var(--dashboard-frame-border)', color: 'var(--dashboard-muted)' }}
          >
            Verisight · {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  )
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-1.5 px-3 text-[0.60rem] font-medium uppercase"
      style={{ color: 'rgba(246,241,233,0.35)', letterSpacing: '0.18em' }}
    >
      {children}
    </p>
  )
}

function SidebarPlainLink({ href, label, isActive = false }: { href: string; label: string; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center rounded-lg px-3 py-2 text-[0.875rem] transition-colors"
      style={{
        color: isActive ? 'rgba(246,241,233,1)' : 'rgba(246,241,233,0.60)',
        background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
        fontWeight: isActive ? 500 : 400,
      }}
    >
      {label}
    </Link>
  )
}

function SidebarSection({
  label,
  items,
  activeModule,
  className = '',
}: {
  label: string
  items: DashboardModuleNavItem[]
  activeModule: string
  className?: string
}) {
  return (
    <div className={className}>
      <SidebarLabel>{label}</SidebarLabel>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = item.key === activeModule
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex w-full items-center justify-between rounded-lg px-3 py-[0.4rem] text-[0.875rem] transition-colors"
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: isActive ? 'rgba(246,241,233,1)' : 'rgba(246,241,233,0.65)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
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

function ActionCenterNav({ activeHref }: { activeHref: string }) {
  return (
    <div>
      <SidebarLabel>Werkruimte</SidebarLabel>
      <div className="space-y-0.5">
        {ACTION_CENTER_NAV.map((item) => {
          const isActive = activeHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex w-full items-center justify-between rounded-lg px-3 py-[0.4rem] text-[0.875rem] transition-colors"
              style={{
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                color: isActive ? 'rgba(246,241,233,1)' : 'rgba(246,241,233,0.65)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--brand-accent-mid)' }} />
              )}
            </Link>
          )
        })}
      </div>
      <div className="mt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
        <Link
          href="/dashboard"
          className="flex w-full items-center rounded-lg px-3 py-2 text-[0.8rem] transition-colors"
          style={{ color: 'rgba(246,241,233,0.45)' }}
        >
          ← Terug naar dashboard
        </Link>
      </div>
    </div>
  )
}
