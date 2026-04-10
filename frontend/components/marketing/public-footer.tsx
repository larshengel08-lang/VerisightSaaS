import Link from 'next/link'

const legalLinks = [
  { href: '/privacy', label: 'Privacybeleid' },
  { href: '/voorwaarden', label: 'Algemene voorwaarden' },
  { href: '/dpa', label: 'Verwerkersovereenkomst' },
  { href: '/login', label: 'Voor klanten: inloggen' },
]

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <p className="text-lg font-bold tracking-tight text-blue-700">Verisight</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
            Begeleide uitstroomanalyse voor HR-teams die vertrekredenen beter willen begrijpen en vertaalbaar
            willen maken naar concrete acties.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Navigatie</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/" className="transition-colors hover:text-slate-950">
              Home
            </Link>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              E-mail:{' '}
              <a href="mailto:hallo@verisight.nl" className="underline transition-colors hover:text-slate-950">
                hallo@verisight.nl
              </a>
            </p>
            <p>Reactie meestal binnen 1 werkdag</p>
            <p>Data gehost in Europa</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-slate-200 px-5 pt-6 text-xs text-slate-500 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Verisight. Publieke informatie voor orientatie en kennismaking.</p>
          <p>Geen trackingcookies op de marketing-site.</p>
        </div>
      </div>
    </footer>
  )
}
