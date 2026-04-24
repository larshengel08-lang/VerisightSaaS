'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogoutButton } from '@/components/ui/logout-button'
import {
  getDashboardShellConfig,
  isDashboardNavActive,
} from '@/lib/dashboard/dashboard-shell-config'

export function DashboardShellFrame({
  isAdmin,
  userEmail,
  acceptedCount,
  children,
}: {
  isAdmin: boolean
  userEmail: string
  acceptedCount: number
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const config = getDashboardShellConfig({
    isAdmin,
    pathname,
    acceptedCount,
    userEmail,
  })

  return (
    <div
      className={`dashboard-shell-root dashboard-mode-${config.mode} min-h-screen bg-[color:var(--dashboard-canvas)] text-[color:var(--dashboard-ink)]`}
      data-shell-mode={config.mode}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-[318px] shrink-0 border-r border-[color:var(--dashboard-rail-border)] bg-[color:var(--dashboard-rail)] text-[color:var(--dashboard-rail-text)] lg:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col px-6 py-7">
            <Link
              href="/dashboard"
              className="rounded-[28px] border border-white/10 bg-white/[0.06] px-5 py-5 transition-colors hover:bg-white/10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.58]">Verisight suite</p>
              <p className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] text-white">Dashboard shell</p>
              <p className="mt-3 text-sm leading-6 text-white/[0.72]">
                Premium rust aan de buyer-kant, sobere controle aan de admin-kant. De execution-flow blijft zichtbaar en eerlijk.
              </p>
            </Link>

            <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-white/[0.06] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.58]">Mode</p>
              <p className="mt-3 text-base font-semibold text-white">{config.accountLabel}</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">{config.modeLabel}</p>
            </div>

            <nav className="mt-8 flex-1 space-y-2">
              {config.navigation.map((item) => {
                const active = isDashboardNavActive(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-[24px] border px-4 py-4 transition-all ${
                      active
                        ? 'border-white/[0.12] bg-white text-[color:var(--dashboard-ink)] shadow-[0_18px_36px_rgba(15,23,42,0.24)]'
                        : 'border-transparent bg-transparent text-white/[0.82] hover:border-white/[0.08] hover:bg-white/[0.08]'
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                        active ? 'text-[color:var(--dashboard-accent-strong)]' : 'text-white/[0.5]'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        active ? 'text-[color:var(--dashboard-text)]' : 'text-white/[0.68]'
                      }`}
                    >
                      {item.detail}
                    </p>
                  </Link>
                )
              })}
            </nav>

            <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.06] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/[0.5]">Account</p>
              <p className="mt-2 truncate text-sm font-medium text-white">{config.userEmail}</p>
              <div className="mt-4">
                <LogoutButton className="w-full justify-center rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.14]" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-topbar)] backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1360px] items-center gap-3 px-4 py-4 sm:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] text-[color:var(--dashboard-ink)] shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)] lg:hidden"
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                  {config.accountLabel}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--dashboard-ink)]">
                    {config.currentLabel}
                  </h1>
                  <span className="hidden rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--dashboard-text)] sm:inline-flex">
                    {config.modeLabel}
                  </span>
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <span className="max-w-[220px] truncate text-sm text-[color:var(--dashboard-text)]">
                  {config.userEmail}
                </span>
                <LogoutButton className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] hover:border-[color:var(--dashboard-accent-soft-border)] hover:text-[color:var(--dashboard-accent-strong)]" />
              </div>
            </div>

            {mobileNavOpen ? (
              <div className="border-t border-[color:var(--dashboard-frame-border)] px-4 py-4 sm:px-6 lg:hidden">
                <div className="space-y-3 rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-3 shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
                  {config.navigation.map((item) => {
                    const active = isDashboardNavActive(pathname, item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`block rounded-[22px] border px-4 py-3 ${
                          active
                            ? 'border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)]'
                            : 'border-transparent bg-[color:var(--dashboard-soft)]'
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--dashboard-text)]">{item.detail}</p>
                      </Link>
                    )
                  })}
                  <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
                      Account
                    </p>
                    <p className="mt-2 truncate text-sm font-medium text-[color:var(--dashboard-ink)]">
                      {config.userEmail}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </header>

          <main className="flex-1">
            <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-5 px-4 py-5 sm:px-6 xl:px-8">
              {config.bannerText ? (
                <div className="rounded-[26px] border border-[color:var(--dashboard-accent-soft-border)] bg-[color:var(--dashboard-accent-soft)] px-5 py-4 text-sm leading-6 text-[color:var(--dashboard-accent-strong)] shadow-[0_18px_38px_rgba(31,41,55,0.07)]">
                  {config.bannerText}
                </div>
              ) : null}

              <div className="dashboard-content-frame min-w-0 rounded-[34px] border border-[color:var(--dashboard-frame-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,250,244,0.86)_100%)] p-4 shadow-[0_30px_70px_rgba(17,24,39,0.08)] sm:p-5 xl:p-6">
                {children}
              </div>
            </div>
          </main>

          <footer className="border-t border-[color:var(--dashboard-frame-border)] px-4 py-4 text-xs text-[color:var(--dashboard-muted)] sm:px-6 xl:px-8">
            <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-3">
              <span>Verisight-dashboardfamilie</span>
              <span>Buyer premium, admin sober, canoniek begrensd</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
