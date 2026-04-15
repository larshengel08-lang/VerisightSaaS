'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SolutionsDropdown } from '@/components/marketing/solutions-dropdown'
import { marketingNavLinks, marketingPrimaryCta } from '@/components/marketing/site-content'
import { Wordmark } from '@/components/marketing/wordmark'

interface PublicHeaderProps {
  ctaHref?: string
  ctaLabel?: string
}

export function PublicHeader({
  ctaHref = marketingPrimaryCta.href,
  ctaLabel = marketingPrimaryCta.label,
}: PublicHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const secondaryNavLinks = marketingNavLinks.filter((link) => link.href !== '/' && link.href !== '/producten')

  function closeMenu() {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="marketing-shell py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Wordmark size="md" />
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 xl:inline-flex">
              Vanaf circa 200 medewerkers
            </span>
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex">
            <div className="px-2">
              <SolutionsDropdown />
            </div>
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Inloggen
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              {ctaLabel}
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:text-slate-950 lg:hidden"
          >
            <span className="sr-only">Open menu</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen ? (
          <div
            id="public-mobile-menu"
            className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:hidden"
          >
            <div className="space-y-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <SolutionsDropdown />
              </div>
              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Vanaf circa 200 medewerkers
              </p>
              <Link
                href="/producten"
                onClick={closeMenu}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === '/producten'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                Alle producten
              </Link>
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                Inloggen
              </Link>
              <Link
                href={ctaHref}
                onClick={closeMenu}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-colors hover:bg-blue-700"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
