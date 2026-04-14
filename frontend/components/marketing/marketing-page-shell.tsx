import Link from 'next/link'
import type { ReactNode } from 'react'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { MarketingSpotlight } from '@/components/marketing/marketing-spotlight'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { trustItems, trustQuickLinks } from '@/components/marketing/site-content'

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
    chipClass: string
  }
> = {
  neutral: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'marketing-glow-blue',
    chipClass: 'bg-blue-100 text-blue-800',
  },
  exit: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#e2e8f0_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eff6ff_46%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'marketing-glow-blue',
    chipClass: 'bg-blue-100 text-blue-800',
  },
  retention: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dbeafe_0%,transparent_32%),linear-gradient(180deg,#f6fefb_0%,#ecfdf5_44%,#ffffff_100%)]',
    accentText: 'text-emerald-700',
    glowClass: 'marketing-glow-emerald',
    chipClass: 'bg-emerald-100 text-emerald-800',
  },
  combination: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f0fdf4_45%,#ffffff_100%)]',
    accentText: 'text-sky-700',
    glowClass: 'marketing-glow-sky',
    chipClass: 'bg-sky-100 text-sky-800',
  },
  'coming-soon': {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#e2e8f0_0%,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_45%,#ffffff_100%)]',
    accentText: 'text-slate-600',
    glowClass: 'marketing-glow-blue',
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
        <MarketingSection
          tone="plain"
          className={`overflow-hidden border-b border-slate-200 ${themeStyle.heroBg}`}
          containerClassName="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-start"
        >
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

            <div className="mt-4 flex flex-wrap gap-3">
              {trustQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className={`${themeStyle.glowClass} right-[-4rem] top-[-3rem] h-40 w-40`} />
            <MarketingSpotlight
              eyebrow={contextEyebrow}
              title={contextTitle}
              body={contextBody}
              aside={
                <div className="space-y-4">
                  <div className="marketing-panel-dark p-5">
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

                  <MarketingProofStrip
                    items={[
                      {
                        title: 'Alle producten',
                        body: 'Bekijk hoe ExitScan, RetentieScan en de combinatie zich tot elkaar verhouden.',
                      },
                      {
                        title: 'Aanpak en ritme',
                        body: 'Zie wanneer een baseline, deep dive of herhaalmeting het meest logisch wordt.',
                      },
                      {
                        title: 'Prijs en pakket',
                        body: 'Bekijk de prijsankers per productvorm zonder productverwarring.',
                      },
                      {
                        title: 'Trust & privacy',
                        body: 'Bekijk de publieke trustlaag, privacybasis en DPA voordat je een gesprek plant.',
                      },
                    ]}
                  />
                </div>
              }
            />
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          {children}
        </MarketingSection>
      </main>
      <PublicFooter />
    </div>
  )
}
