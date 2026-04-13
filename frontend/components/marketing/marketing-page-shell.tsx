import Link from 'next/link'
import type { ReactNode } from 'react'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'

interface MarketingPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  trustTone?: 'light' | 'dark'
}

const shellSignals = [
  'Duidelijke productkeuze',
  'Dashboard en rapport',
  'Geschikt voor HR, MT en directie',
] as const

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
  trustTone = 'light',
}: MarketingPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />
      <main>
        <section className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)] py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</p>
                <h1 className="font-display mt-4 text-balance text-4xl text-slate-950 md:text-6xl">{title}</h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{description}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/#kennismaking"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Plan mijn gesprek
                  </Link>
                  <Link
                    href="/tarieven"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk tarieven
                  </Link>
                </div>
                <div className="mt-10">
                  <TrustStrip items={trustItems} tone={trustTone} />
                </div>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Wat je hier ziet</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {shellSignals.map((signal) => (
                      <div key={signal} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">{signal}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-900">Portfolio-context</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      Deze pagina hangt binnen een schaalbare productstructuur. Daardoor kan Verisight meerdere producten naast elkaar aanbieden zonder dat live propositie, navigatie of managementtaal door elkaar gaan lopen.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Link
                    href="/producten"
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300"
                  >
                    <p className="text-sm font-semibold text-slate-950">Alle producten</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Bekijk hoe ExitScan, RetentieScan en de combinatie zich tot elkaar verhouden.
                    </p>
                  </Link>
                  <Link
                    href="/aanpak"
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300"
                  >
                    <p className="text-sm font-semibold text-slate-950">Aanpak en ritme</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Zie wanneer een baseline, deep dive of herhaalmeting het meest logisch wordt.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">{children}</div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
