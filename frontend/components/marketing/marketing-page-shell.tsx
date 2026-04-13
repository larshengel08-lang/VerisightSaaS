import Link from 'next/link'
import type { ReactNode } from 'react'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems } from '@/components/marketing/site-content'

type MarketingPageTheme = 'neutral' | 'exit' | 'retention' | 'combination' | 'coming-soon'

interface MarketingPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  trustTone?: 'light' | 'dark'
  theme?: MarketingPageTheme
  highlightItems?: readonly string[]
  contextEyebrow?: string
  contextTitle?: string
  contextBody?: string
}

const defaultHighlights = [
  'Duidelijke productkeuze',
  'Dashboard en rapport',
  'Geschikt voor HR, MT en directie',
] as const

const themeMap: Record<
  MarketingPageTheme,
  {
    heroBg: string
    accentText: string
    glowClass: string
    panelClass: string
    chipClass: string
  }
> = {
  neutral: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'bg-blue-200/55',
    panelClass: 'border-blue-100 bg-blue-50',
    chipClass: 'bg-blue-100 text-blue-800',
  },
  exit: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#e2e8f0_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eff6ff_46%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'bg-blue-200/60',
    panelClass: 'border-blue-100 bg-blue-50',
    chipClass: 'bg-blue-100 text-blue-800',
  },
  retention: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dbeafe_0%,transparent_32%),linear-gradient(180deg,#f6fefb_0%,#ecfdf5_44%,#ffffff_100%)]',
    accentText: 'text-emerald-700',
    glowClass: 'bg-emerald-200/60',
    panelClass: 'border-emerald-100 bg-emerald-50',
    chipClass: 'bg-emerald-100 text-emerald-800',
  },
  combination: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f0fdf4_45%,#ffffff_100%)]',
    accentText: 'text-sky-700',
    glowClass: 'bg-sky-200/55',
    panelClass: 'border-sky-100 bg-sky-50',
    chipClass: 'bg-sky-100 text-sky-800',
  },
  'coming-soon': {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#e2e8f0_0%,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_45%,#ffffff_100%)]',
    accentText: 'text-slate-600',
    glowClass: 'bg-slate-200/70',
    panelClass: 'border-slate-200 bg-slate-50',
    chipClass: 'bg-slate-200 text-slate-700',
  },
}

export function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
  trustTone = 'light',
  theme = 'neutral',
  highlightItems = defaultHighlights,
  contextEyebrow = 'Wat je hier ziet',
  contextTitle = 'Een productpagina in een schaalbare portfolio-structuur.',
  contextBody = 'Deze pagina hangt binnen een productportfolio waarin elk product een eigen managementbelofte heeft, maar dezelfde basis houdt van dashboard, rapport en begeleiding.',
}: MarketingPageShellProps) {
  const themeStyle = themeMap[theme]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />
      <main>
        <section className={`overflow-hidden border-b border-slate-200 py-20 md:py-24 ${themeStyle.heroBg}`}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
              <div className="max-w-2xl">
                <p className={`text-xs font-bold uppercase tracking-[0.22em] ${themeStyle.accentText}`}>{eyebrow}</p>
                <h1 className="font-display mt-5 text-balance text-[3rem] leading-[1.02] text-slate-950 md:text-[4.4rem]">
                  {title}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{description}</p>

                <div className="mt-8 flex flex-wrap gap-3">
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

                <div className="mt-8 flex flex-wrap gap-2">
                  {highlightItems.map((item) => (
                    <span
                      key={item}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${themeStyle.chipClass}`}
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-10">
                  <TrustStrip items={trustItems} tone={trustTone} />
                </div>
              </div>

              <div className="grid gap-5">
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className={`absolute right-[-3rem] top-[-3rem] h-36 w-36 rounded-full blur-3xl ${themeStyle.glowClass}`} />
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{contextEyebrow}</p>
                    <h2 className="mt-4 max-w-xl text-3xl font-semibold text-slate-950">{contextTitle}</h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{contextBody}</p>
                  </div>
                  <div className="relative mt-8 grid gap-4 md:grid-cols-2">
                    <div className={`rounded-[1.5rem] border p-5 ${themeStyle.panelClass}`}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Wat management krijgt</p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        Een compacte managementstructuur die helpt kiezen, prioriteren en doorpakken zonder dat de analyse verzandt in losse survey-antwoorden.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Hoe je verder leest</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          Eerst: past dit product bij de vraag?
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          Daarna: wat krijgt management terug?
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                          Tot slot: wanneer kies je een andere route?
                        </div>
                      </div>
                    </div>
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
