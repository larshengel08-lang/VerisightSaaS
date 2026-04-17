import Link from 'next/link'
import { marketingLegalLinks } from '@/components/marketing/site-content'
import { Wordmark } from '@/components/marketing/wordmark'

export function PublicFooter() {
  const productLinks = [
    { href: '/producten/exitscan', label: 'ExitScan' },
    { href: '/producten/retentiescan', label: 'RetentieScan' },
  ]

  const navLinks = [
    { href: '/aanpak', label: 'Aanpak' },
    { href: '/tarieven', label: 'Tarieven' },
    { href: '/vertrouwen', label: 'Vertrouwen' },
  ]

  return (
    <footer className="bg-[#132033] text-[#F7F5F1]">
      <div className="marketing-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">

        {/* Kolom 1 — merk */}
        <div>
          <Wordmark size="sm" showTagline={false} light />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[rgba(247,245,241,0.65)]">
            Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen
            aandacht vragen — zodat prioriteiten duidelijk worden.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[rgba(247,245,241,0.5)]">
            Voor organisaties met 200+ medewerkers
          </p>
        </div>

        {/* Kolom 2 — producten + navigatie */}
        <div>
          <p className="mb-4 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
            Producten
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#F7F5F1]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mb-4 mt-6 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
            Navigatie
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#F7F5F1]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Kolom 3 — legal + contact */}
        <div>
          <p className="mb-4 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
            Legal &amp; contact
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
            {marketingLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.href === '/login' ? false : undefined}
                className="transition-colors hover:text-[#F7F5F1]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <a
            href="mailto:hallo@verisight.nl"
            className="mt-6 block text-sm text-[rgba(247,245,241,0.65)] transition-colors hover:text-[#F7F5F1]"
          >
            hallo@verisight.nl
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(247,245,241,0.08)]">
        <div className="marketing-shell flex flex-col gap-2 py-5 text-xs text-[rgba(247,245,241,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Verisight. Alle rechten voorbehouden.</p>
          <p>Geen trackingcookies op de marketing-site.</p>
        </div>
      </div>
    </footer>
  )
}
