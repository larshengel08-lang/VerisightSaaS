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
        <aside className="hidden w-[280px] shrink-0 border-r border-[color:var(--border)] bg-[color:var(--ink)] text-[color:var(--bg)] lg:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col px-6 py-7">
            <Link href="/dashboard" className="rounded-[26px] border border-white/10 bg-white/[0.04] px-5 py-5 transition-colors hover:bg-white/[0.07]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Verisight dashboard</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Overview-first</p>
              <p className="mt-3 text-sm leading-6 text-white/72">
                De rail geeft richting. Home leest eerst als overzicht, daarna pas als verdieping.
              </p>
            </Link>

            <nav className="mt-8 flex-1 space-y-8">
              <DashboardShellSection
                title="Navigatie"
                items={navigation.primary}
                pathname={pathname}
                activePortfolioView={activePortfolioView}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <DashboardShellSection
                title="Portfolio-navigatie"
                items={navigation.portfolio}
                pathname={pathname}
                activePortfolioView={activePortfolioView}
                onNavigate={() => setMobileNavOpen(false)}
              />
              {navigation.admin.length > 0 ? (
                <DashboardShellSection
                  title="Beheer"
                  items={navigation.admin}
                  pathname={pathname}
                  activePortfolioView={activePortfolioView}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              ) : null}
            </nav>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Account</p>
              <p className="mt-2 truncate text-sm text-white">{userEmail}</p>
              <p className="mt-1 text-xs text-white/62">{isAdmin ? 'Verisight beheer' : 'Klantdashboard'}</p>
              <div className="mt-4">
                <LogoutButton className="w-full justify-center rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white hover:bg-white/14 hover:text-white" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink)] transition-colors hover:border-[#d6e4e8] hover:text-[#234B57] lg:hidden"
                aria-label="Navigatie openen"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  {isAdmin ? 'Verisight beheer' : 'Klantdashboard'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--ink)]">
                    {getDashboardShellCurrentLabel(pathname)}
                  </h1>
                  <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] sm:inline-flex">
                    {pathname.startsWith('/campaigns/') ? 'Verdieping via tabs' : 'Overview-first'}
                  </span>
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <span className="max-w-[220px] truncate text-sm text-[color:var(--text)]">{userEmail}</span>
                <LogoutButton className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] hover:border-[#d6e4e8] hover:text-[#234B57]" />
              </div>
            </div>

            {mobileNavOpen ? (
              <div className="border-t border-[color:var(--border)] px-4 py-4 sm:px-6 lg:hidden">
                <div className="space-y-6 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_18px_40px_rgba(19,32,51,0.08)]">
                  <DashboardShellSection
                    title="Navigatie"
                    items={navigation.primary}
                    pathname={pathname}
                    activePortfolioView={activePortfolioView}
                    onNavigate={() => setMobileNavOpen(false)}
                    mobile
                  />
                  <DashboardShellSection
                    title="Portfolio-navigatie"
                    items={navigation.portfolio}
                    pathname={pathname}
                    activePortfolioView={activePortfolioView}
                    onNavigate={() => setMobileNavOpen(false)}
                    mobile
                  />
                  {navigation.admin.length > 0 ? (
                    <DashboardShellSection
                      title="Beheer"
                      items={navigation.admin}
                      pathname={pathname}
                      activePortfolioView={activePortfolioView}
                      onNavigate={() => setMobileNavOpen(false)}
                      mobile
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </header>

          <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6">
            {acceptedCount > 0 ? (
              <div className="mb-6 rounded-[20px] border border-[#d2e6e0] bg-[#eef7f4] px-4 py-3 text-sm text-[#234B57]">
                Jouw account is gekoppeld aan {acceptedCount} organisatie{acceptedCount === 1 ? '' : 's'}.
                Je ziet nu automatisch het juiste klantdashboard en de bijbehorende rapportages.
              </div>
            ) : null}
            {children}
          </main>

          <footer className="border-t border-[color:var(--border)] px-4 py-4 text-xs text-[color:var(--muted)] sm:px-6">
            Verisight dashboard · vaste rail, centrale overview, bounded verdieping
          </footer>
        </div>
      </div>
    </div>
  )
}

function DashboardShellSection({
  title,
  items,
  pathname,
  activePortfolioView,
  onNavigate,
  mobile = false,
}: {
  title: string
  items: Array<{ label: string; detail: string; href: string | null; disabled: boolean; key?: DashboardPortfolioView }>
  pathname: string
  activePortfolioView: DashboardPortfolioView
  onNavigate: () => void
  mobile?: boolean
}) {
  if (items.length === 0) return null

  return (
    <div>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${mobile ? 'text-[color:var(--muted)]' : 'text-white/58'}`}>
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const active = isActiveShellItem({
            pathname,
            activePortfolioView,
            item,
          })
          const classes = mobile
            ? active
              ? 'border-[#d6e4e8] bg-[#f3f8f8] text-[#234B57]'
              : item.disabled
                ? 'border-dashed border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--muted)]'
                : 'border-transparent bg-[color:var(--bg)] text-[color:var(--text)] hover:border-[color:var(--border)] hover:text-[color:var(--ink)]'
            : active
              ? 'border-white/10 bg-white text-[color:var(--ink)]'
              : item.disabled
                ? 'border-white/8 border-dashed bg-white/[0.02] text-white/42'
                : 'border-transparent bg-transparent text-white/78 hover:border-white/8 hover:bg-white/8'

          const labelClasses = mobile
            ? active
              ? 'text-[#234B57]'
              : item.disabled
                ? 'text-[color:var(--muted)]'
                : 'text-[color:var(--ink)]'
            : active
              ? 'text-[#234B57]'
              : item.disabled
                ? 'text-white/42'
                : 'text-white/50'

          const detailClasses = mobile
            ? active
              ? 'text-[#234B57]'
              : item.disabled
                ? 'text-[color:var(--muted)]'
                : 'text-[color:var(--text)]'
            : active
              ? 'text-[color:var(--text)]'
              : item.disabled
                ? 'text-white/42'
                : 'text-white/66'

          const content = (
            <>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${labelClasses}`}>{item.label}</p>
              <p className={`mt-2 text-sm leading-6 ${detailClasses}`}>{item.detail}</p>
            </>
          )

          if (!item.href || item.disabled) {
            return (
              <div key={`${title}-${item.label}`} className={`rounded-[20px] border px-4 py-3 ${classes}`}>
                {content}
              </div>
            )
          }

          return (
            <Link
              key={`${title}-${item.label}`}
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-[20px] border px-4 py-3 transition-colors ${classes}`}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
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
