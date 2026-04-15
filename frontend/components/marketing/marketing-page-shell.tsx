import Link from 'next/link'
import type { ReactNode } from 'react'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { marketingPrimaryCta, trustItems, trustQuickLinks } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

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
  heroNote?: string
  ctaHref?: string
  ctaLabel?: string
}

const defaultHighlights = [
  'Duidelijke productkeuze',
  'Dashboard, rapport en bestuurlijke handoff',
  'Geschikt voor HR, MT en directie',
] as const

const themeMap: Record<
  MarketingPageTheme,
  {
    heroBg: string
    accentText: string
    glowClass: string
    chipClass: string
    stageAccentClass: string
    stageNumberClass: string
    stageTagClass: string
  }
> = {
  neutral: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'marketing-glow-blue',
    chipClass: 'bg-blue-100 text-blue-800',
    stageAccentClass: 'from-blue-400/24 via-blue-500/10 to-transparent',
    stageNumberClass: 'bg-blue-400/15 text-blue-100 ring-1 ring-blue-300/25',
    stageTagClass: 'bg-blue-400/12 text-blue-100',
  },
  exit: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#e2e8f0_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eff6ff_46%,#ffffff_100%)]',
    accentText: 'text-blue-600',
    glowClass: 'marketing-glow-blue',
    chipClass: 'bg-blue-100 text-blue-800',
    stageAccentClass: 'from-blue-400/26 via-blue-500/10 to-transparent',
    stageNumberClass: 'bg-blue-400/15 text-blue-100 ring-1 ring-blue-300/25',
    stageTagClass: 'bg-blue-400/12 text-blue-100',
  },
  retention: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#d1fae5_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dbeafe_0%,transparent_32%),linear-gradient(180deg,#f6fefb_0%,#ecfdf5_44%,#ffffff_100%)]',
    accentText: 'text-emerald-700',
    glowClass: 'marketing-glow-emerald',
    chipClass: 'bg-emerald-100 text-emerald-800',
    stageAccentClass: 'from-emerald-400/24 via-emerald-500/10 to-transparent',
    stageNumberClass: 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/25',
    stageTagClass: 'bg-emerald-400/12 text-emerald-100',
  },
  combination: {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_24%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#f0fdf4_45%,#ffffff_100%)]',
    accentText: 'text-sky-700',
    glowClass: 'marketing-glow-sky',
    chipClass: 'bg-sky-100 text-sky-800',
    stageAccentClass: 'from-sky-400/22 via-sky-500/10 to-transparent',
    stageNumberClass: 'bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/25',
    stageTagClass: 'bg-sky-400/12 text-sky-100',
  },
  'coming-soon': {
    heroBg:
      'bg-[radial-gradient(circle_at_top_left,#e2e8f0_0%,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_45%,#ffffff_100%)]',
    accentText: 'text-slate-600',
    glowClass: 'marketing-glow-blue',
    chipClass: 'bg-slate-200 text-slate-700',
    stageAccentClass: 'from-slate-300/16 via-slate-400/8 to-transparent',
    stageNumberClass: 'bg-slate-300/15 text-slate-100 ring-1 ring-slate-300/25',
    stageTagClass: 'bg-slate-300/12 text-slate-100',
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
  contextTitle = 'Gebruik deze pagina om de juiste route, output en vervolgstap te toetsen.',
  contextBody = 'Deze pagina helpt eerst bepalen of de route inhoudelijk klopt. Daarna laat Verisight zien wat management terugkrijgt, welke proof daarbij hoort en wanneer een gesprek logisch wordt.',
  heroNote = 'Verisight blijft een begeleide productvorm: trust ondersteunt de route, maar verdringt de productkeuze niet.',
  ctaHref = marketingPrimaryCta.href,
  ctaLabel = marketingPrimaryCta.label,
}: MarketingPageShellProps) {
  const themeStyle = themeMap[theme]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader ctaHref={ctaHref} ctaLabel={ctaLabel} />
      <main>
        <MarketingSection
          tone="plain"
          className={`overflow-hidden border-b border-slate-200 ${themeStyle.heroBg}`}
          containerClassName="marketing-hero-grid"
        >
          <div className="marketing-hero-column">
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${themeStyle.accentText}`}>{eyebrow}</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display mt-5 text-slate-950">
              {title}
            </h1>
            <p className="marketing-hero-copy mt-6 text-[1.02rem] leading-8 text-slate-600 md:text-[1.05rem]">
              {description}
            </p>

            <div className="marketing-hero-cta-row mt-8">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {ctaLabel}
              </Link>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk de routes
              </Link>
            </div>

            <div className="mt-8 max-w-2xl">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
                {highlightItems.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm text-slate-700 ${
                      index !== 0 ? 'border-t border-slate-200/80' : ''
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ${themeStyle.chipClass}`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <TrustStrip items={trustItems} tone={trustTone} />
            </div>

            <div className="marketing-hero-support-grid mt-5">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 px-5 py-4 text-sm leading-7 text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                {heroNote}
              </div>

              <div className="marketing-hero-link-grid">
                {trustQuickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="marketing-hero-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="marketing-hero-stage-column relative">
            <div className={`${themeStyle.glowClass} right-[-4rem] top-[-3rem] h-40 w-40`} />
            <div className="marketing-stage p-6 md:p-8">
              <div className={`absolute right-0 top-0 h-56 w-56 bg-gradient-to-bl ${themeStyle.stageAccentClass}`} />
              <div className="marketing-hero-stage-grid relative">
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${themeStyle.stageTagClass}`}>
                    {contextEyebrow}
                  </span>
                  <h2 className="marketing-stage-title font-display mt-5 text-white">
                    {contextTitle}
                  </h2>
                  <p className="mt-5 max-w-xl text-[0.98rem] leading-8 text-slate-300 md:text-base">{contextBody}</p>

                  <div className="mt-7 space-y-3">
                    {[
                      'Past de route inhoudelijk bij de managementvraag?',
                      'Laat de deliverable eerder zien dan de uitleg.',
                      'Gebruik trust en pricing pas nadat de route landt.',
                    ].map((item, index) => (
                      <div key={item} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                        <span
                          className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-[0.12em] ${themeStyle.stageNumberClass}`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm leading-7 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="rounded-[1.55rem] border border-white/10 bg-white p-5 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Waarom dit anders oogt</p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">Niet nog een productgrid, maar een routecanvas.</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Deze hero is bedoeld om eerst de bestuurlijke vraag te kaderen, daarna de output te tonen en pas
                      dan de vervolgstap te openen.
                    </p>
                  </div>

                  <div className="rounded-[1.55rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Snelle routecheck</p>
                    <div className="mt-4 grid gap-3">
                      <Link
                        href="/producten"
                        className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white"
                      >
                        Producten vergelijken
                      </Link>
                      <Link
                        href="/tarieven"
                        className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white"
                      >
                        Pricing en vervolgvormen
                      </Link>
                      <Link
                        href="/vertrouwen"
                        className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/8 hover:text-white"
                      >
                        Trust, privacy en DPA
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[1.55rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Na kennismaking</p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                        We bevestigen eerst route, timing, databasis en wat de eerste betaalde stap hoort te zijn.
                      </div>
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                        Daarna richt Verisight campaign, respondentimport en uitnodigingen begeleid in.
                      </div>
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3">
                        Eerste signalen landen na de eerste responses; een steviger patroonbeeld volgt pas bij voldoende respons.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
