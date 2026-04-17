import Link from 'next/link'
import { marketingLegalLinks } from '@/components/marketing/site-content'
import { Wordmark } from '@/components/marketing/wordmark'

export function PublicFooter() {
  const productLinks = [
    { href: '/producten/exitscan', label: 'ExitScan' },
    { href: '/producten/retentiescan', label: 'RetentieScan' },
    { href: '/producten/pulse', label: 'Pulse' },
    { href: '/producten/teamscan', label: 'TeamScan' },
    { href: '/producten/onboarding-30-60-90', label: 'Onboarding 30-60-90' },
  ]

  const navLinks = [
    { href: '/aanpak', label: 'Aanpak' },
    { href: '/tarieven', label: 'Tarieven' },
    { href: '/vertrouwen', label: 'Vertrouwen' },
  ]

  return (
    <footer className="border-t border-[#20344d] bg-[linear-gradient(180deg,#132033_0%,#16263c_100%)] text-[#F7F5F1]">
      <div className="marketing-shell grid gap-10 py-16 lg:grid-cols-[1.25fr_0.95fr_0.9fr]">
        <div>
          <Wordmark size="sm" showTagline={false} light />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[rgba(247,245,241,0.65)]">
            Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen aandacht vragen, zodat
            prioriteiten duidelijk worden.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.12em] text-[rgba(247,245,241,0.5)]">
            Voor organisaties met 200+ medewerkers
          </p>
          <div className="mt-6 inline-flex rounded-full border border-[rgba(247,245,241,0.12)] bg-[rgba(247,245,241,0.05)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(247,245,241,0.7)]">
            Boardroom-ready dashboards en rapporten
          </div>
        </div>

        <div>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Producten</p>
          <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#F7F5F1]">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mb-4 mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
            Navigatie
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-[rgba(247,245,241,0.65)]">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#F7F5F1]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
            Legal en contact
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

      <div className="border-t border-[rgba(247,245,241,0.08)]">
        <div className="marketing-shell flex flex-col gap-2 py-5 text-xs text-[rgba(247,245,241,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Verisight. Alle rechten voorbehouden.</p>
          <p>Geen trackingcookies op de marketing-site.</p>
        </div>
      </div>
    </footer>
  )
}
