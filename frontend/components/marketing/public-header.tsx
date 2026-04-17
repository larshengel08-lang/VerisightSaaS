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
    <header className="sticky top-0 z-50 border-b border-[#E5E0D6] bg-[rgba(255,255,255,0.92)] backdrop-blur-md">
      <div className="marketing-shell py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Wordmark size="md" />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <div className="px-2">
              <SolutionsDropdown />
            </div>
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-[#F7F5F1] font-medium text-[#132033]'
                    : 'text-[#4A5563] hover:bg-[#F7F5F1] hover:text-[#132033]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              prefetch={false}
              className="text-sm font-medium text-[#4A5563] transition-colors hover:text-[#132033]"
            >
              Inloggen
            </Link>
            <Link
              href={ctaHref}
              className="inline-flex rounded-full bg-[#3C8D8A] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(60,141,138,0.16)] transition-colors hover:bg-[#2d6e6b]"
            >
              {ctaLabel}
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E0D6] bg-white text-[#4A5563] transition-colors hover:text-[#132033] lg:hidden"
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
            className="mt-4 rounded-xl border border-[#E5E0D6] bg-white p-4 shadow-[0_24px_60px_rgba(19,32,51,0.08)] lg:hidden"
          >
            <div className="space-y-1">
              <div className="rounded-2xl border border-[#E5E0D6] bg-[#F7F5F1] px-4 py-3">
                <SolutionsDropdown />
              </div>
              <Link
                href="/producten"
                onClick={closeMenu}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === '/producten'
                    ? 'bg-[#F7F5F1] text-[#132033]'
                    : 'text-[#4A5563] hover:bg-[#F7F5F1] hover:text-[#132033]'
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
                      ? 'bg-[#F7F5F1] text-[#132033]'
                      : 'text-[#4A5563] hover:bg-[#F7F5F1] hover:text-[#132033]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-[#E5E0D6] pt-3">
              <Link
                href="/login"
                prefetch={false}
                onClick={closeMenu}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4A5563] transition-colors hover:bg-[#F7F5F1] hover:text-[#132033]"
              >
                Inloggen
              </Link>
              <Link
                href={ctaHref}
                onClick={closeMenu}
                className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
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
