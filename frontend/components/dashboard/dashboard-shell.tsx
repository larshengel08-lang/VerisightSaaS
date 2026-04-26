'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LogoutButton } from '@/components/ui/logout-button'
import {
  buildDashboardShellNavigation,
  getDashboardShellCurrentLabel,
  normalizeDashboardPortfolioView,
  type DashboardPortfolioView,
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
  const searchParams = useSearchParams()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const currentCampaignPath = pathname.startsWith('/campaigns/') ? pathname : null
  const activePortfolioView = normalizeDashboardPortfolioView(searchParams.get('view') ?? undefined)
  const navigation = useMemo(
    () =>
      buildDashboardShellNavigation({
        isAdmin,
        currentCampaignPath,
        portfolioCounts,
      }),
    [currentCampaignPath, isAdmin, portfolioCounts],
  )

  return (
    <div className="dashboard-shell min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden w-[var(--dashboard-sidebar-width)] shrink-0 border-r border-white/[0.06] bg-[color:var(--ink)] lg:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col overflow-y-auto py-5">

            {/* Brand */}
            <Link
              href="/dashboard"
              className="mx-4 mb-6 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--teal)]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 4h10M3 8h7M3 12h4" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[-0.02em] text-white">Verisight</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">Dashboard</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-6">
              <SidebarSection
                title="Navigatie"
                items={navigation.primary}
                pathname={pathname}
                activePortfolioView={activePortfolioView}
                onNavigate={() => {}}
              />
              <SidebarSection
                title="Portfolio"
                items={navigation.portfolio}
                pathname={pathname}
                activePortfolioView={activePortfolioView}
                onNavigate={() => {}}
                showBadge
              />
              {navigation.admin.length > 0 ? (
                <SidebarSection
                  title="Beheer"
                  items={navigation.admin}
                  pathname={pathname}
                  activePortfolioView={activePortfolioView}
                  onNavigate={() => {}}
                />
              ) : null}
            </nav>

            {/* Account */}
            <div className="mx-3 mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
              <p className="truncate text-[13px] font-medium text-white/80">{userEmail}</p>
              <p className="mt-0.5 text-xs text-white/38">
                {isAdmin ? 'Verisight beheer' : 'Klantdashboard'}
              </p>
              <div className="mt-3">
                <LogoutButton className="w-full justify-center rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:bg-white/[0.09] hover:text-white/90" />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Content Column ── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Topbar */}
          <header className="sticky top-0 z-40 border-b border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar-strong)] backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6">

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white text-[color:var(--ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--teal)] lg:hidden"
                aria-label="Navigatie openen"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>

              {/* Page title */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-semibold tracking-[-0.025em] text-[color:var(--ink)]">
                    {getDashboardShellCurrentLabel(pathname)}
                  </h1>
                  <span className="hidden rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--dashboard-muted)] sm:inline-flex">
                    {pathname.startsWith('/campaigns/') ? 'Verdieping' : 'Overview-first'}
                  </span>
                </div>
              </div>

              {/* Desktop account */}
              <div className="hidden items-center gap-3 lg:flex">
                <span className="max-w-[200px] truncate text-sm text-[color:var(--dashboard-muted)]">{userEmail}</span>
                <LogoutButton className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-3.5 py-1.5 text-sm font-semibold text-[color:var(--ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--teal)]" />
              </div>
            </div>

            {/* Mobile nav drawer */}
            {mobileNavOpen ? (
              <div className="border-t border-[color:var(--dashboard-frame-border)] bg-[color:var(--ink)] px-3 py-4 lg:hidden">
                <div className="space-y-5">
                  <SidebarSection
                    title="Navigatie"
                    items={navigation.primary}
                    pathname={pathname}
                    activePortfolioView={activePortfolioView}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                  <SidebarSection
                    title="Portfolio"
                    items={navigation.portfolio}
                    pathname={pathname}
                    activePortfolioView={activePortfolioView}
                    onNavigate={() => setMobileNavOpen(false)}
                    showBadge
                  />
                  {navigation.admin.length > 0 ? (
                    <SidebarSection
                      title="Beheer"
                      items={navigation.admin}
                      pathname={pathname}
                      activePortfolioView={activePortfolioView}
                      onNavigate={() => setMobileNavOpen(false)}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </header>

          {/* Main content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            {acceptedCount > 0 ? (
              <div className="mb-5 rounded-xl border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-4 py-3 text-sm text-[color:var(--dashboard-accent-strong)]">
                Uw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
                Het juiste klantdashboard en de bijbehorende rapportages zijn automatisch geladen.
              </div>
            ) : null}
            {children}
          </main>

          <footer className="border-t border-[color:var(--dashboard-frame-border)] px-4 py-3 text-xs text-[color:var(--dashboard-muted)] sm:px-6">
            Verisight · Overview-first dashboard
          </footer>
        </div>
      </div>
    </div>
  )
}

function SidebarSection({
  title,
  items,
  pathname,
  activePortfolioView,
  onNavigate,
  showBadge = false,
}: {
  title: string
  items: Array<{ label: string; detail: string; href: string | null; disabled: boolean; key?: DashboardPortfolioView }>
  pathname: string
  activePortfolioView: DashboardPortfolioView
  onNavigate: () => void
  showBadge?: boolean
}) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = isActiveShellItem({ pathname, activePortfolioView, item })
          const count = showBadge ? extractCountFromDetail(item.detail) : null

          if (!item.href || item.disabled) {
            return (
              <div
                key={`${title}-${item.label}`}
                className="dash-nav-item dash-nav-item-disabled"
              >
                <span className="truncate">{item.label}</span>
                {count !== null ? (
                  <span className="dash-nav-badge opacity-40">{count}</span>
                ) : null}
              </div>
            )
          }

          return (
            <Link
              key={`${title}-${item.label}`}
              href={item.href}
              onClick={onNavigate}
              className={`dash-nav-item ${active ? 'dash-nav-item-active' : 'dash-nav-item-inactive'}`}
            >
              <span className="truncate">{item.label}</span>
              {count !== null ? (
                <span className={`dash-nav-badge ${active ? 'dash-nav-badge-active' : ''}`}>
                  {count}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function extractCountFromDetail(detail: string): number | null {
  const match = detail.match(/^(\d+)\s+campagne/)
  return match ? parseInt(match[1], 10) : null
}

function isActiveShellItem({
  pathname,
  activePortfolioView,
  item,
}: {
  pathname: string
  activePortfolioView: DashboardPortfolioView
  item: { href: string | null; key?: DashboardPortfolioView; label: string }
}) {
  if (!item.href) return false
  if (item.label === 'Huidige campagne') return pathname.startsWith('/campaigns/')
  if (item.label === 'Overview') return pathname === '/dashboard' && !item.key
  if (item.key) return pathname === '/dashboard' && activePortfolioView === item.key

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
