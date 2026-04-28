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

  function isActive(href: string) {
    if (href.startsWith('/#')) {
      return pathname === '/'
    }

    return pathname === href
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
      <div className="marketing-shell py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <Wordmark size="md" showTagline={false} />
              <span className="pl-px text-[8px] font-bold tracking-[0.18em] uppercase text-[rgba(22,20,18,0.32)] [font-family:var(--font-ibm-plex-sans)]">
                People, Patterns, Priorities
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <div className="px-2">
              <SolutionsDropdown />
            </div>
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`marketing-nav-link ${isActive(link.href) ? 'marketing-nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" prefetch={false} className="marketing-topbar-link">
              Inloggen
            </Link>
            <Link href={ctaHref} className="marketing-button-primary">
              {ctaLabel}
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
            className="marketing-icon-button lg:hidden"
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
          <div id="public-mobile-menu" className="marketing-mobile-menu lg:hidden">
            <div className="space-y-1">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <SolutionsDropdown />
              </div>
              <Link
                href="/producten"
                onClick={closeMenu}
                className={`marketing-mobile-nav-link ${pathname === '/producten' ? 'marketing-mobile-nav-link-active' : ''}`}
              >
                Alle producten
              </Link>
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`marketing-mobile-nav-link ${isActive(link.href) ? 'marketing-mobile-nav-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <Link href="/login" prefetch={false} onClick={closeMenu} className="marketing-mobile-nav-link">
                Inloggen
              </Link>
              <Link href={ctaHref} onClick={closeMenu} className="marketing-button-primary mt-3 w-full">
                {ctaLabel}
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
