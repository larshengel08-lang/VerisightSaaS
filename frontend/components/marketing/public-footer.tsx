import Link from 'next/link'
import { marketingLegalLinks } from '@/components/marketing/site-content'
import { Wordmark } from '@/components/marketing/wordmark'

export function PublicFooter() {
  const productLinks = [
    { href: '/producten#loep-vertrek', label: 'Loep Vertrek' },
    { href: '/producten#loep-behoud', label: 'Loep Behoud' },
    { href: '/producten#loep-start', label: 'Loep Start' },
  ]

  const navLinks = [
    { href: '/producten#tarieven', label: 'Tarieven' },
    { href: '/vertrouwen', label: 'Vertrouwen' },
    { href: '/examples/voorbeeldrapport_loep.pdf', label: 'Voorbeeldrapport' },
  ]

  return (
    <footer className="marketing-footer">
      <div className="marketing-shell marketing-footer-grid">
        <div>
          <Wordmark size="sm" showTagline={false} light />
          <p className="mt-2 text-[8px] font-bold tracking-[0.18em] uppercase text-[rgba(247,245,241,0.32)]">
            Scherper zien wat telt
          </p>
          <p className="marketing-footer-copy mt-4 max-w-sm text-sm leading-7">
            Loep helpt organisaties sneller zien wat speelt, wat eerst aandacht vraagt en hoe eerste opvolging concreet
            wordt.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[rgba(247,245,241,0.5)]">
            Voor organisaties met 100+ medewerkers
          </p>
          <div className="marketing-footer-chip mt-6">Van eerste inzicht naar concrete opvolging</div>
        </div>

        <div>
          <p className="marketing-footer-title">Producten</p>
          <div className="flex flex-col gap-2.5 text-sm">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="marketing-footer-link">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="marketing-footer-title mt-6">Navigatie</p>
          <div className="flex flex-col gap-2.5 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="marketing-footer-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="marketing-footer-title">Legal en contact</p>
          <div className="flex flex-col gap-2.5 text-sm">
            {marketingLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={link.href === '/login' ? false : undefined}
                className="marketing-footer-link"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <a href="mailto:hallo@getloep.nl" className="marketing-footer-link mt-6 block text-sm">
            hallo@getloep.nl
          </a>
        </div>
      </div>

      <div className="border-t border-[rgba(247,245,241,0.08)]">
        <div className="marketing-shell flex flex-col gap-2 py-5 text-xs text-[rgba(247,245,241,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Loep. Alle rechten voorbehouden.</p>
          <p>Geen trackingcookies op de marketingsite.</p>
        </div>
      </div>
    </footer>
  )
}
