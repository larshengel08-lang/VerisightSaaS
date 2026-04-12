'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wordmark } from '@/components/marketing/wordmark'

const navLinks = [
  { href: '/product', label: 'Product' },
  { href: '/aanpak', label: 'Aanpak' },
  { href: '/tarieven', label: 'Tarieven' },
] as const

interface PublicHeaderProps {
  ctaHref?: string
  ctaLabel?: string
}

export function PublicHeader({
  ctaHref = '/#kennismaking',
  ctaLabel = 'Plan mijn gesprek',
}: PublicHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Wordmark size="md" />
        <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-1 lg:flex">
          {navLinks.map((link) => (
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
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:inline-flex"
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
      </div>
    </header>
  )
}
