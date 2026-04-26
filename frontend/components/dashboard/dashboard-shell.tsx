'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { LogoutButton } from '@/components/ui/logout-button'
import {
  buildDashboardShellNavigation,
  getActiveModuleFromPathname,
  getDashboardShellCurrentLabel,
  type DashboardModuleKey,
  type DashboardModuleNavItem,
  type DashboardPortfolioView,
  type DashboardShellCampaignRef,
  type DashboardShellMode,
} from '@/lib/dashboard/shell-navigation'

type PortfolioCounts = Record<DashboardPortfolioView, number>

export function DashboardShellFrame({
  isAdmin,
  shellMode,
  userEmail,
  acceptedCount,
  portfolioCounts,
  campaigns,
  children,
}: {
  isAdmin: boolean
  shellMode: DashboardShellMode
  userEmail: string
  acceptedCount: number
  portfolioCounts: PortfolioCounts
  campaigns: DashboardShellCampaignRef[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const currentCampaignPath = pathname.startsWith('/campaigns/') ? pathname : null
  const activeModule = getActiveModuleFromPathname(pathname, campaigns)
  const navigation = useMemo(
    () =>
      buildDashboardShellNavigation({
        isAdmin,
        shellMode,
        currentCampaignPath,
        campaigns,
        portfolioCounts,
      }),
    [campaigns, currentCampaignPath, isAdmin, portfolioCounts, shellMode],
  )
  const currentLabel = getDashboardShellCurrentLabel(pathname)
  const accountLabel = userEmail.split('@')[1]?.split('.')[0] ?? 'Verisight'
  const accountName = accountLabel.charAt(0).toUpperCase() + accountLabel.slice(1)
  const mobileItems = [...navigation.modules, ...navigation.admin]
  const showReportsQuickLink = shellMode === 'full'

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-[316px] shrink-0 border-r border-white/8 bg-[#101418] text-[#f3efe8] lg:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col px-4 py-5">
            <div className="px-3 pb-8">
              <Link href="/dashboard" className="flex items-start gap-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#71c8b5] text-sm font-semibold text-[#101418]">
                  V
                </span>
                <span className="block">
                  <span className="block font-serif text-[1.1rem] leading-5 text-[#f5f2eb]">Verisight</span>
                  <span className="mt-0.5 block text-[0.72rem] uppercase tracking-[0.24em] text-[#94a3b8]">
                    People Insight
                  </span>
                </span>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <SidebarSection
                label="Modules"
                items={navigation.modules}
                activeModule={activeModule}
                onNavigate={() => setMobileNavOpen(false)}
              />
              {navigation.admin.length > 0 ? (
                <div className="mt-6 space-y-2 px-2">
                  <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#66758a]">
                    Beheer
                  </p>
                  {navigation.admin.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href ?? '/dashboard'}
                      className="block rounded-2xl border border-white/6 px-4 py-3 text-sm text-[#dbe3ec] transition-colors hover:border-white/12 hover:bg-white/4"
                    >
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[#8fa1b3]">{item.detail}</p>
                    </Link>
                  ))}
                </div>
              ) : null}
            </nav>

            <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.04] px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7e8b9a]">Account</p>
              <p className="mt-2 truncate text-sm text-[#f5f2eb]">{userEmail}</p>
              <p className="mt-1 text-xs text-[#8fa1b3]">{acceptedCount > 0 ? `${acceptedCount} gekoppelde organisatie${acceptedCount === 1 ? '' : 's'}` : accountName}</p>
              <div className="mt-4">
                <LogoutButton className="w-full justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#f5f2eb] transition-colors hover:bg-white/[0.1]" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[color:var(--dashboard-frame-border)] bg-[color:var(--surface)]/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--dashboard-frame-border)] bg-white text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] lg:hidden"
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

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                    Account
                  </span>
                  <span className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                    {accountName}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--dashboard-text)]">{currentLabel}</p>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                {showReportsQuickLink ? (
                  <Link
                    href="/reports"
                    className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]"
                  >
                    Reports
                  </Link>
                ) : null}
                <Link
                  href="/action-center"
                  className="rounded-full border border-[color:var(--dashboard-ink)] bg-[color:var(--dashboard-ink)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45]"
                >
                  Action Center
                </Link>
              </div>
            </div>

            {mobileNavOpen ? (
              <div className="border-t border-[color:var(--dashboard-frame-border)] px-4 py-4 sm:px-6 lg:hidden">
                <div className="space-y-2 rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--surface)] p-4 shadow-[0_18px_40px_rgba(19,32,51,0.08)]">
                  {mobileItems.map((item) => {
                    const href = 'key' in item ? item.href : item.href
                    const disabled = 'key' in item ? item.disabled : item.disabled
                    const isActive = 'key' in item && item.key === activeModule

                    if (!href || disabled) {
                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3 text-sm text-[color:var(--dashboard-muted)]"
                        >
                          {item.label}
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.label}
                        href={href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`block rounded-2xl border px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] text-[color:var(--dashboard-accent-strong)]'
                            : 'border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] text-[color:var(--dashboard-text)]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </header>

          <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
            {acceptedCount > 0 && shellMode === 'full' ? (
              <div className="mb-6 rounded-[20px] border border-[#d2e6e0] bg-[#eef7f4] px-4 py-3 text-sm text-[#234B57]">
                Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
                Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.
              </div>
            ) : null}
            {children}
          </main>

          <footer className="border-t border-[color:var(--dashboard-frame-border)] px-4 py-4 text-xs text-[color:var(--dashboard-muted)] sm:px-6">
            {shellMode === 'action_center_only'
              ? 'Verisight Action Center · manager-only workspace binnen dezelfde suite-shell'
              : 'Verisight dashboard · preview-adoptie op bestaande routes'}
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
}: {
  label: string
  items: DashboardModuleNavItem[]
  activeModule: DashboardModuleKey
  onNavigate: () => void
}) {
  return (
    <div className="space-y-2 px-2">
      <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#66758a]">{label}</p>
      {items.map((item) => {
        if (!item.href || item.disabled) {
          return (
            <div
              key={item.key}
              className="rounded-2xl border border-dashed border-white/8 px-4 py-3 text-sm text-[#66758a]"
            >
              {item.label}
            </div>
          )
        }

        const isActive = item.key === activeModule

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors ${
              isActive
                ? 'bg-white/[0.08] text-[#f5f2eb]'
                : 'text-[#c8d2dd] hover:bg-white/[0.04] hover:text-[#f5f2eb]'
            }`}
          >
            <span className="font-medium">{item.label}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#71c8b5]' : 'bg-transparent'}`} />
          </Link>
        )
      })}
    </div>
  )
}
