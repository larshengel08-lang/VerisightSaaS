import Link from 'next/link'
import { marketingFooterLinks, marketingLegalLinks, trustQuickLinks } from '@/components/marketing/site-content'
import { Wordmark } from '@/components/marketing/wordmark'

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.95fr]">
        <div>
          <Wordmark size="sm" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Verisight helpt organisaties kiezen tussen ExitScan en RetentieScan: terugkijken naar vertrek,
            eerder signaleren op behoud, of beide bewust combineren in een gedeelde managementtaal.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Nederlandse dienst', 'EU-primary data', 'DPA beschikbaar', 'Geen trackingcookies'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-2 text-sm text-slate-600">
            {trustQuickLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href} className="font-medium text-slate-700 transition-colors hover:text-slate-950">
                  {link.label}
                </Link>
                <p className="mt-1 max-w-sm leading-6 text-slate-500">{link.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Waar start je?</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            {marketingFooterLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact en juridisch</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              E-mail:{' '}
              <a href="mailto:hallo@verisight.nl" className="underline transition-colors hover:text-slate-950">
                hallo@verisight.nl
              </a>
            </p>
            <p>Voor organisaties vanaf circa 200 medewerkers</p>
            <p>Publieke trustlaag voor methodiek, privacy en rapportlezing</p>
            <div className="pt-2">
              {marketingLegalLinks.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-slate-950">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-200 px-5 pt-6 text-xs text-slate-500 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Verisight. Publieke informatie voor orientatie en kennismaking.</p>
          <p>Geen trackingcookies op de marketing-site.</p>
        </div>
      </div>
    </footer>
  )
}
