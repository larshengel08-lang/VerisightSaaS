import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { homepageProductRoutes, faqSchema } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight helpt HR en management snel zien waar vertrek of behoud echt begint te knellen — met een rapport dat u intern direct kunt gebruiken.',
  alternates: {
    canonical: '/',
  },
}

const problemSignals = [
  'U weet wie er weg is. Niet waarom.',
  'Behoudsdruk is pas zichtbaar als mensen al bijna weg zijn.',
  'MT wil richting — geen rapport dat eerst uitleg vraagt.',
] as const

const outputItems = [
  {
    title: 'Dashboard',
    body: 'Zie de eerste patronen zodra reacties binnenkomen — geen wachten op een eindrapport.',
  },
  {
    title: 'Managementrapport',
    body: 'Topfactoren en prioriteiten. Zelfstandig leesbaar, klaar om intern te delen.',
  },
  {
    title: 'Samenvatting voor directie',
    body: 'Eén pagina. Klaar voor de volgende MT-vergadering.',
  },
] as const

const compactApproachSteps = [
  {
    number: '01',
    title: 'Kennismaking',
    body: 'We bepalen samen welke scan nu past, bespreken scope, timing en privacy, en plannen de eerste stap.',
  },
  {
    number: '02',
    title: 'Inrichting',
    body: 'Verisight regelt de volledige setup. HR hoeft geen tool in te richten of te beheren.',
  },
  {
    number: '03',
    title: 'Uitvoering',
    body: 'De scan draait, deelnemers ontvangen uitnodigingen en u volgt de voortgang via het dashboard.',
  },
  {
    number: '04',
    title: 'Output en gesprek',
    body: 'U ontvangt het rapport, de samenvatting voor directie en een eerste sessie om prioriteiten te bespreken.',
  },
] as const

const trustPoints = [
  'Uitkomsten op groepsniveau — nooit op persoonsniveau',
  'AVG-conform, EU-dataopslag',
  'Geen diagnose, geen causaliteitsclaim — wel bruikbare richting',
  'Begeleide aanpak — niets te installeren',
] as const

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight',
    description:
      'Verisight helpt HR en management snel zien waar vertrek of behoud echt begint te knellen — met een rapport dat u intern direct kunt gebruiken.',
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
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">ExitScan &amp; RetentieScan</p>
            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
              Zie snel waar vertrek of behoud echt begint te knellen.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight brengt vertrek- en retentiepatronen in beeld op groepsniveau — met een rapport dat u intern direct kunt gebruiken.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </Link>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
              >
                Bekijk de producten
              </Link>
            </div>
            {/* Proof bullets onder CTA */}
            <div className="mt-2 space-y-2">
              {[
                'Dashboard, rapport en samenvatting voor directie',
                'Eerste inzichten binnen weken — begeleide aanpak',
                'AVG-conform, niets te installeren of beheren',
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3C8D8A]" />
                  <p className="text-sm text-[#4A5563]">{bullet}</p>
                </div>
              ))}
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          /* Dashboard-preview visual — ondersteunend, niet als tweede contentsectie */
          <div className="relative">
            {/* Floating proof badge */}
            <div className="absolute -right-1 -top-3.5 z-10 rounded-full border border-[#E5E0D6] bg-white px-3 py-1.5 shadow-[0_4px_14px_rgba(19,32,51,0.1)] text-[0.63rem] font-semibold uppercase tracking-[0.16em] text-[#4A5563]">
              Illustratief voorbeeld
            </div>

            {/* Dashboard mockup */}
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/60 bg-slate-950 shadow-[0_28px_72px_rgba(19,32,51,0.22)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-black/30 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 rounded-full bg-white/[0.07] px-3 py-0.5 text-[0.65rem] text-slate-400">
                  verisight.nl/dashboard
                </span>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-2 p-4 pb-2">
                {[
                  ['Hoofdsignaal', '5,4', 'Aandacht gewenst'],
                  ['Respons', '68%', 'Representatief'],
                  ['Prioriteit', 'Groei', 'Sterkste patroon'],
                  ['Advies', 'Bespreken', 'MT + HR'],
                ].map(([label, value, sub]) => (
                  <div key={label} className="rounded-[1rem] border border-white/[0.07] bg-white/[0.05] px-3 py-2.5">
                    <p className="text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-[1.05rem] font-bold text-white">{value}</p>
                    <p className="text-[0.58rem] text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Factor bars */}
              <div className="mx-4 mb-4 mt-2 rounded-[1rem] border border-white/[0.07] bg-white/[0.05] px-3 py-3">
                <p className="text-[0.58rem] font-semibold uppercase tracking-wide text-slate-500">
                  Top werkfactoren
                </p>
                <div className="mt-3 space-y-2.5">
                  {[
                    ['Groei en ontwikkeling', '78%', 'bg-red-400'],
                    ['Werkdruk', '62%', 'bg-amber-400'],
                    ['Leiderschap', '54%', 'bg-amber-400'],
                    ['Samenwerking', '38%', 'bg-emerald-500'],
                  ].map(([label, width, color]) => (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between">
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
            </div>
          </div>
        }
      >
        <div id="hoofdinhoud">

          {/* 1. Probleemstrip — scherp en kort */}
          <MarketingSection tone="plain">
            <div className="grid gap-px md:grid-cols-3">
              {problemSignals.map((signal, i) => (
                <div
                  key={signal}
                  className={[
                    'py-2 text-[1.02rem] font-[500] leading-7 text-[#132033]',
                    i > 0 ? 'md:border-l md:border-[#E5E0D6] md:pl-8' : '',
                    i < problemSignals.length - 1 ? 'border-b border-[#E5E0D6] pb-6 md:border-b-0 md:pb-2' : 'pt-6 md:pt-2',
                  ].join(' ')}
                >
                  {signal}
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 2. Output proof — sterkste verkoopsectie */}
          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Wat u ontvangt"
              title="Een rapport dat HR en management direct kunnen gebruiken."
              description="Dashboard, managementrapport en samenvatting voor directie volgen dezelfde lijn — zodat u intern snel op één pagina staat."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {outputItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-[#E5E0D6] bg-white p-7 shadow-[0_8px_32px_rgba(19,32,51,0.06)]"
                >
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#DCEFEA]">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#3C8D8A]" />
                  </div>
                  <p className="text-lg font-semibold text-[#132033]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#4A5563]">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="marketing-proof-frame mt-12 p-5 md:p-8">
              <PreviewSlider variant="portfolio" />
            </div>
            <div className="mt-8">
              <PreviewEvidenceRail variant="portfolio" />
            </div>
          </MarketingSection>

          {/* 3. Routekeuze — lichter dan proof */}
          <MarketingSection tone="tint">
            <SectionHeading
              eyebrow="ExitScan of RetentieScan?"
              title="Kies de scan die bij uw vraag past."
              description="Beide scans zijn zelfstandige producten. U start met één — de combinatie komt pas later als de eerste vraag helder staat."
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {homepageProductRoutes.map((route) => (
                <div
                  key={route.name}
                  className="flex flex-col rounded-[1.5rem] border border-[#E5E0D6] bg-white p-6 shadow-[0_4px_16px_rgba(19,32,51,0.04)]"
                >
                  <span className="inline-flex self-start rounded-full border border-[#E5E0D6] bg-[#F7F5F1] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#4A5563]">
                    {route.chip}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[#132033]">{route.name}</h3>
                  <p className="mt-2 text-base font-medium leading-7 text-[#132033]">{route.title}</p>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[#4A5563]">{route.body}</p>
                  <Link
                    href={route.href}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                  >
                    Meer over {route.name} <span aria-hidden>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 4. Aanpak */}
          <MarketingSection tone="plain">
            <div className="grid gap-10 xl:grid-cols-[0.88fr_1.12fr]">
              <div>
                <SectionHeading
                  eyebrow="Hoe het werkt"
                  title="Van eerste gesprek tot bruikbare output. Binnen weken."
                  description="Verisight begeleidt het hele traject — u hoeft niets zelf in te richten of te beheren."
                />
                <div className="mt-8">
                  <MarketingCalloutBand
                    eyebrow="Laagdrempelig begin"
                    title="Eerst uw vraag helder. Dan pas de rest."
                    body="Het eerste gesprek duurt circa 20 minuten. We bespreken welke scan past, wat de aanpak inhoudt en wat u kunt verwachten qua timing, privacy en prijs."
                    primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_mid_callout' })}
                    primaryLabel="Plan een kennismaking"
                    secondaryHref="/aanpak"
                    secondaryLabel="Bekijk de aanpak"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {compactApproachSteps.map((step) => (
                  <div key={step.number} className="marketing-process-card">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                      Stap {step.number}
                    </p>
                    <h3 className="mt-4 text-lg font-semibold text-[#132033]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#4A5563]">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          {/* 5. Trust — compact en concreet */}
          <MarketingSection tone="surface">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="lg:max-w-[22rem]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#3C8D8A]">
                  Methodiek en privacy
                </p>
                <h2 className="mt-4 font-display text-[clamp(1.4rem,2.8vw,2rem)] font-light leading-[1.1] tracking-[-0.02em] text-[#132033]">
                  Bruikbare inzichten. Heldere grenzen.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#4A5563]">
                  Geen diagnose, geen individuele voorspellingen. De output is bedoeld als gespreksinput — niet als laatste woord.
                </p>
                <Link
                  href="/vertrouwen"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3C8D8A] transition-colors hover:text-[#2d6e6b]"
                >
                  Meer over methodiek en privacy <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:flex-1 lg:max-w-2xl">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-[1rem] border border-[#E5E0D6] bg-[#F7F5F1] px-5 py-4"
                  >
                    <div className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#3C8D8A]" />
                    <p className="text-sm leading-6 text-[#4A5563]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          {/* 6. CTA — laagdrempelig */}
          <MarketingSection tone="plain">
            <div className="space-y-8">
              <div className="max-w-2xl">
                <SectionHeading
                  eyebrow="Eerste gesprek"
                  title="Kies een moment dat u past."
                  description="Wij bespreken samen welke scan nu het meest logisch is — in circa 20 minuten."
                />
              </div>
              <MarketingInlineContactPanel
                eyebrow="Plan kennismaking"
                title="Van eerste vraag naar een heldere aanpak."
                body="Gebruik dit formulier voor ExitScan, RetentieScan of de combinatieroute. We helpen u eerst bepalen welke scan nu logisch is."
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
