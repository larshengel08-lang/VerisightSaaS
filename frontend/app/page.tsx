import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  faqSchema,
  homepageCoreProductRoutes,
  homepagePortfolioRoute,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight brengt vertrekpatronen en behoudsdruk in beeld — met dashboard, managementrapport en samenvatting voor directie.',
  alternates: { canonical: '/' },
}

const trustPoints = [
  'Uitkomsten op groepsniveau — nooit op persoonsniveau',
  'AVG-conform, EU-dataopslag',
  'Geen diagnose, geen causaliteitsclaim — wel bruikbare richting',
  'Begeleide aanpak — niets te installeren',
] as const

function HeroDashboardVisual() {
  return (
    <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-slate-200/50 bg-slate-950 shadow-[0_32px_80px_rgba(19,32,51,0.18)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-black/40 px-4 py-2.5 sm:px-5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-3 rounded-full bg-white/[0.07] px-3 py-0.5 text-[0.65rem] text-slate-400">
          verisight.nl/dashboard
        </span>
        <span className="ml-auto hidden text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:block">
          Illustratief voorbeeld
        </span>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-2 p-4 pb-0 sm:grid-cols-4">
        {(
          [
            ['Hoofdsignaal', '5,4', 'Aandacht gewenst'],
            ['Respons', '68%', 'Representatief'],
            ['Prioriteit', 'Groei', 'Sterkste factor'],
            ['Advies', 'Bespreken', 'MT + HR'],
          ] as const
        ).map(([label, value, sub]) => (
          <div key={label} className="rounded-[1rem] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-[1.05rem] font-bold text-white">{value}</p>
            <p className="text-[0.58rem] text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main panels */}
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {/* Factor bars */}
        <div className="rounded-[1rem] border border-white/[0.07] bg-white/[0.04] px-3 py-3">
          <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">
            Top werkfactoren
          </p>
          <div className="space-y-2.5">
            {(
              [
                ['Groei en ontwikkeling', '78%', 'bg-red-400'],
                ['Werkdruk', '62%', 'bg-amber-400'],
                ['Leiderschap', '54%', 'bg-amber-400'],
                ['Samenwerking', '38%', 'bg-emerald-500'],
                ['Autonomie', '30%', 'bg-emerald-500'],
              ] as const
            ).map(([label, width, color]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[0.65rem] text-slate-300">{label}</p>
                  <p className="text-[0.6rem] text-slate-500">{width}</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${color}`} style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Samenvatting + wat valt op + volgende stap */}
        <div className="flex flex-col gap-2.5">
          <div className="flex-1 rounded-[1rem] border border-white/[0.07] bg-white/[0.04] px-3 py-3">
            <p className="mb-2 text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">
              Samenvatting
            </p>
            <p className="text-[0.75rem] leading-[1.7] text-slate-300">
              De data toont een consistent patroon rond{' '}
              <span className="font-semibold text-amber-300">groei en ontwikkeling</span>. Dit thema
              keert terug als dominante vertrekreden, ongeacht afdeling of functieniveau.
            </p>
          </div>
          <div className="rounded-[1rem] border border-amber-400/20 bg-amber-400/[0.05] px-3 py-3">
            <p className="mb-1.5 text-[0.58rem] font-semibold uppercase tracking-wide text-amber-400/80">
              Wat valt op
            </p>
            <p className="text-[0.75rem] leading-[1.65] text-slate-300">
              4 van 5 respondenten noemen gebrek aan loopbaanperspectief als hoofdreden voor vertrek.
            </p>
          </div>
          <div className="rounded-[1rem] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
            <p className="text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">
              Volgende stap
            </p>
            <p className="mt-1 text-[0.72rem] font-medium text-[#3C8D8A]">
              Managementrapport klaar om intern te delen →
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight',
    description:
      'Verisight brengt vertrekpatronen en behoudsdruk in beeld — met dashboard, managementrapport en samenvatting voor directie.',
    url: 'https://www.verisight.nl/',
    inLanguage: 'nl-NL',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ExitScan', url: 'https://www.verisight.nl/producten/exitscan' },
        { '@type': 'ListItem', position: 2, name: 'RetentieScan', url: 'https://www.verisight.nl/producten/retentiescan' },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#132033] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <MarketingPageShell
        theme="combination"
        pageType="home"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            {/* ── Eyebrow ── */}
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">ExitScan · RetentieScan</p>

            {/* ── Headline ── */}
            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
              Weet waarom mensen vertrekken. Zie eerder waar behoud onder druk staat.
            </h1>

            {/* ── Subcopy ── */}
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight levert een dashboard, managementrapport en samenvatting voor directie —
              klaar om intern te delen, binnen weken na de eerste scan.
            </p>

            {/* ── CTAs ── */}
            <div className="marketing-hero-cta-row marketing-hero-actions">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                className="marketing-button-primary"
              >
                Plan een kennismaking
              </Link>
              <Link
                href="#voorbeeldoutput"
                className="marketing-button-secondary"
              >
                Bekijk voorbeeldoutput
              </Link>
            </div>

            {/* ── Wide dashboard visual ── */}
            <HeroDashboardVisual />
          </MarketingHeroIntro>
        }
      >
        <div id="hoofdinhoud">

          {/* ── 1. Voorbeeld van wat u krijgt ─────────────────────────── */}
          <MarketingSection tone="surface">
            <div id="voorbeeldoutput" className="scroll-mt-20">
              <SectionHeading
                eyebrow="Wat u ontvangt"
                title="Dashboard, samenvatting en rapport — in één lijn."
              />
              <div className="marketing-proof-frame mt-10 p-5 md:p-8">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
          </MarketingSection>

          {/* ── 2. Routekeuze ─────────────────────────────────────────── */}
          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Welke route past nu?"
              title="Kies de route die aansluit op de vraag die nu het meest dringt."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {homepageCoreProductRoutes.map((route) => (
                <div
                  key={route.name}
                  className={`flex h-full flex-col rounded-[1.5rem] border p-6 ${route.accent}`}
                >
                  <span className="inline-flex self-start rounded-full border border-[#D7D2C6] bg-white px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#4A5563]">
                    {route.chip}
                  </span>
                  <h2 className="mt-4 text-[1.25rem] font-semibold tracking-[-0.02em] text-[#132033]">
                    {route.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-7 text-[#132033]">{route.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-7 text-[#4A5563]">{route.body}</p>
                  <Link
                    href={route.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                  >
                    Meer over {route.name} <span aria-hidden>{'->'}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Portfolio strip */}
            <div className="mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-dashed border-[#D7D2C6] bg-[#F7F5F1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#4A5563]">
                  {homepagePortfolioRoute.label}
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#132033]">{homepagePortfolioRoute.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#4A5563]">{homepagePortfolioRoute.body}</p>
              </div>
              <Link
                href={homepagePortfolioRoute.href}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#4A5563] transition-colors hover:text-[#132033]"
              >
                Meer info <span aria-hidden>{'->'}</span>
              </Link>
            </div>

            <div className="mt-7 flex justify-center">
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-6 py-2.5 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
              >
                Bekijk de routes
              </Link>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-[#E5E0D6] bg-white px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#4A5563]">
                Begrensde peer-exceptie
              </p>
              <p className="mt-2 text-sm font-medium text-[#132033]">
                Onboarding 30-60-90 openen we alleen wanneer de lifecycle-vraag rond nieuwe medewerkers nu echt centraal
                staat.
              </p>
              <p className="mt-1 text-sm leading-6 text-[#4A5563]">
                Pulse en Leadership Scan blijven vervolgroutes na een eerste managementread. TeamScan openen we niet als
                buyer-facing eerste routekeuze.
              </p>
            </div>
          </MarketingSection>

          {/* ── 3. Vertrouwen en privacy ──────────────────────────────── */}
          <MarketingSection tone="surface">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:max-w-[18rem]">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#3C8D8A]">
                  Methodiek en privacy
                </p>
                <p className="mt-3 text-[clamp(1.25rem,2.4vw,1.65rem)] font-light leading-[1.2] tracking-[-0.02em] text-[#132033]">
                  Bruikbare inzichten. Heldere grenzen.
                </p>
                <Link
                  href="/vertrouwen"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                >
                  Meer over privacy en methodiek <span aria-hidden>{'->'}</span>
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:max-w-2xl lg:flex-1">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-[0.875rem] border border-[#E5E0D6] bg-white px-4 py-3"
                  >
                    <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#3C8D8A]" />
                    <p className="text-sm leading-6 text-[#4A5563]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          {/* ── 4. Kennismaking / CTA ─────────────────────────────────── */}
          <MarketingSection tone="plain">
            <div className="mx-auto max-w-2xl space-y-6">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#3C8D8A]">
                  Eerste gesprek
                </p>
                <p className="mt-3 text-[clamp(1.35rem,2.8vw,1.9rem)] font-light leading-[1.18] tracking-[-0.02em] text-[#132033]">
                  Vertel welke vraag nu het meest dringt.
                </p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">
                  We bespreken samen welke scan past en wat u kunt verwachten — in circa 20 minuten.
                </p>
              </div>
              <MarketingInlineContactPanel
                eyebrow="Plan kennismaking"
                title="Welke managementvraag speelt nu?"
                body="Gebruik dit formulier voor ExitScan, RetentieScan of bij een expliciete lifecycle-vraag Onboarding 30-60-90. Combinatie en bounded vervolg toetsen we pas daarna."
                badge="Vrijblijvend"
                defaultRouteInterest="exitscan"
                defaultCtaSource="homepage_form"
              />
            </div>
          </MarketingSection>

        </div>
      </MarketingPageShell>
    </>
  )
}
