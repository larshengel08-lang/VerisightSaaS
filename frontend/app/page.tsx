import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { faqSchema } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Verisight helpt HR, directie en MT sneller zien waar vertrek, behoud of onboarding bestuurlijke aandacht vraagt, met begeleide scans, dashboard en managementrapport.',
  alternates: {
    canonical: '/',
  },
}

const heroProofSignals = [
  'Boardroom-ready rapportage',
  'Privacy-first groepsinzichten',
  'Eerste managementread binnen weken',
] as const

const painCards = [
  {
    title: 'Signalen komen versnipperd binnen',
    body: 'Exitgesprekken, teamgeluid en losse signalen stapelen zich op, maar geven nog geen bestuurlijke richting.',
  },
  {
    title: 'Behoudsdruk wordt vaak te laat scherp',
    body: 'Zonder vroeg groepsbeeld reageert management op incidenten in plaats van op prioriteiten.',
  },
  {
    title: 'Management wil richting, geen survey-output',
    body: 'De vraag is niet alleen wat er gemeten is, maar wat nu eerst besproken en getoetst moet worden.',
  },
] as const

const coreRoutes = [
  {
    name: 'ExitScan',
    badge: 'Kernroute',
    title: 'Brengt vertrekduiding terug naar een bestuurlijke lijn.',
    opens: 'Opent de vraag welk vertrekbeeld terugkeert en welke werkfactoren daarin meewegen.',
    timing: 'Logisch wanneer uitstroom achteraf geduid moet worden en er snel bestuurlijke prioritering nodig is.',
    href: '/producten/exitscan',
  },
  {
    name: 'RetentieScan',
    badge: 'Kernroute',
    title: 'Laat eerder zien waar behoud onder druk staat.',
    opens: 'Opent de vraag waar actieve populaties nu een eerste verificatiespoor of interventie vragen.',
    timing: 'Logisch wanneer vroegsignalering op behoud voor teams, MT of directie centraal staat.',
    href: '/producten/retentiescan',
  },
] as const

const expansionRoutes = [
  {
    name: 'TeamScan',
    badge: 'Aanvullende route',
    opens: 'Opent lokale verificatie na een breder people-signaal.',
    timing: 'Logisch nadat eerst duidelijk is in welk team, onderdeel of segment het signaal verder onderzocht moet worden.',
    href: '/producten/teamscan',
  },
  {
    name: 'Onboarding 30-60-90',
    badge: 'Aanvullende route',
    opens: 'Opent een vroege lifecycle-check voor nieuwe medewerkers.',
    timing: 'Logisch wanneer vroege landing, eerste frictie of onboarding-kwaliteit bestuurlijk aandacht vraagt.',
    href: '/producten/onboarding-30-60-90',
  },
] as const

const supportRoutes = [
  {
    name: 'Pulse',
    body: 'Compacte reviewroute na een eerste baseline, handoff of managementread.',
    href: '/producten/pulse',
  },
  {
    name: 'Leadership Scan',
    body: 'Begrensde managementread na een bestaand people-signaal dat extra context vraagt.',
    href: '/producten/leadership-scan',
  },
] as const

const outcomeCards = [
  {
    title: 'Dashboard met bestuurlijke read',
    body: 'Een rustig managementbeeld met kernmetrics, focuspunten en het eerste signaal dat bestuurlijke aandacht vraagt.',
  },
  {
    title: 'Rapport met prioriteiten en verificatievragen',
    body: 'Geen losse export, maar een leesbare rapportlaag die helpt om intern richting te kiezen en vragen te toetsen.',
  },
  {
    title: 'Bestuurlijke handoff en eerste route',
    body: 'De uitkomst landt in dezelfde lijn als het gesprek: wat speelt nu, waarom telt dit en wat moet eerst gebeuren.',
  },
  {
    title: 'Eerste managementgesprek en vervolgadvies',
    body: 'De scan stopt niet bij de output, maar bij het eerste gesprek over prioriteiten, eigenaarschap en vervolgrichting.',
  },
] as const

const processSteps = [
  {
    step: '1',
    title: 'Routekeuze',
    body: 'We bepalen eerst of vertrekduiding, vroegsignalering, teamverificatie of onboardingcheck de juiste eerste route is.',
  },
  {
    step: '2',
    title: 'Intake en setup',
    body: 'Doelgroep, timing, datagrondslag en privacygrenzen worden scherp gezet voordat de uitvoering start.',
  },
  {
    step: '3',
    title: 'Eerste output',
    body: 'Dashboard, rapport en bestuurlijke handoff landen in een managementlijn zodra de responsbasis dat draagt.',
  },
  {
    step: '4',
    title: 'Managementbespreking',
    body: 'We vertalen de output naar een eerste gesprek over prioriteiten, verificatie en de logische vervolgstap.',
  },
] as const

const trustPoints = [
  'Rapportage op geaggregeerd niveau',
  'Minimale n-grenzen en suppressie waar nodig',
  'AVG-conform met primaire opslag in een EU-regio',
  'Methodisch onderbouwde vraagblokken',
  'Geen individuele voorspeller of diagnose',
] as const

const heroRouteSignals = [
  ['ExitScan', 'Terugkijkende vertrekduiding voor terugkerende uitstroomvragen'],
  ['RetentieScan', 'Vroegsignalering op behoud wanneer actieve populaties aandacht vragen'],
  ['TeamScan', 'Lokale verificatie nadat een breder signaal eerst zichtbaar is'],
  ['Onboarding 30-60-90', 'Vroege lifecycle-check voor de eerste landing van nieuwe medewerkers'],
] as const

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight',
    description:
      'Verisight helpt HR, directie en MT sneller zien waar vertrek, behoud of onboarding bestuurlijke aandacht vraagt, met begeleide scans, dashboard en managementrapport.',
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
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">
              Voor HR, directie en MT in organisaties met 200-1.000 medewerkers
            </p>
            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
              Van vertrek- en behoudssignalen{' '}
              <span className="md:block">naar een eerste </span>
              <span className="md:block">managementbesluit in weken.</span>
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight helpt sneller zien waar uitstroom, behoud of onboarding bestuurlijke aandacht vraagt, met
              begeleide scans, dashboard en managementrapport in een professionele productvorm.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions sm:flex-row sm:items-center">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(60,141,138,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b] sm:w-auto"
              >
                Plan een kennismaking
              </Link>
              <Link
                href="#voorbeeldoutput"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#4A5563] transition-all hover:-translate-y-0.5 hover:border-[#3C8D8A] hover:text-[#132033] sm:w-auto"
              >
                Bekijk voorbeeldoutput
              </Link>
            </div>
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              {heroProofSignals.map((signal) => (
                <div
                  key={signal}
                  className="min-h-[4.5rem] rounded-[1.15rem] border border-[#E5E0D6] bg-white/90 px-4 py-3 text-sm font-semibold text-[#132033] shadow-[0_14px_32px_rgba(19,32,51,0.05)] sm:min-h-0"
                >
                  {signal}
                </div>
              ))}
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(220,239,234,0.18),transparent_32%),linear-gradient(180deg,#132033_0%,#16283e_100%)] p-4 shadow-[0_32px_80px_rgba(19,32,51,0.32)] sm:rounded-[2rem] sm:p-5 xl:p-6">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(220,239,234,0.22),transparent_70%)]" />
              <div className="relative z-10 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="marketing-stage-tag border border-white/12 bg-white/8 text-[#DCEFEA]">
                    Begeleide productvorm
                  </span>
                  <span className="marketing-chip-dark">Dashboard + rapport + handoff</span>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.88fr)]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:rounded-[1.7rem] sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Dashboard preview
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        ['Vertrekbeeld', '5,8/10', 'Vergt bestuurlijke duiding'],
                        ['Behoudsdruk', '5,6/10', 'Vraagt eerste verificatie'],
                        ['Eerste route', 'Binnen weken', 'Van intake naar managementread'],
                      ].map(([label, value, detail]) => (
                        <div key={label} className="rounded-[1rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.2rem] sm:p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-[11px] sm:text-slate-200">{label}</p>
                          <p className="mt-2 text-sm font-semibold text-white sm:mt-3 sm:text-xl">{value}</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-300 sm:text-[11px] sm:leading-5 sm:text-slate-200">{detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-[11px] sm:text-slate-200">Managementprioriteiten</p>
                        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                          Boardroom-ready
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Leiderschap', '63%', 'Bestuurlijke read'],
                          ['Groei', '61%', 'Prioriteiten'],
                          ['Werkbelasting', '56%', 'Verificatie'],
                        ].map(([label, width, band]) => (
                          <div key={label} className="grid grid-cols-[minmax(0,5.5rem)_1fr_auto] items-center gap-2.5 sm:grid-cols-[minmax(0,7rem)_1fr_auto] sm:gap-3">
                            <span className="text-xs text-slate-200 sm:text-sm">{label}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-[#3C8D8A]" style={{ width }} />
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 sm:text-slate-200">{band}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.45rem] border border-[#DCEFEA]/20 bg-[#F7F5F1] p-4 text-[#132033] shadow-[0_18px_50px_rgba(15,23,42,0.26)] transition-transform duration-300 hover:-translate-y-0 sm:translate-y-2 sm:rounded-[1.6rem] sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Bestuurlijke handoff</p>
                      <p className="mt-3 text-base font-semibold">Van signaal naar eerste managementroute</p>
                      <div className="mt-4 space-y-3">
                        {[
                          'Wat speelt nu',
                          'Waarom telt dit bestuurlijk',
                          'Welke vraag moet eerst getoetst worden',
                        ].map((item) => (
                          <div key={item} className="rounded-[1rem] border border-[#E5E0D6] bg-white px-3 py-3 text-sm leading-6 text-[#4A5563]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.45rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 sm:-translate-x-3 sm:rounded-[1.6rem] sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Actieve routes</p>
                      <div className="mt-4 space-y-3">
                        {heroRouteSignals.map(([title, body]) => (
                          <div key={title} className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-3">
                            <p className="text-sm font-semibold text-white">{title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">{body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Geen generieke surveytool</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Verisight verkoopt geen self-serve vragenlijst, maar een begeleide people-insight route met vaste output.
              </p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Sneller naar waarde</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Eerst routekeuze, dan pas inrichting. Zo blijft de eerste stap klein, professioneel en bestuurlijk bruikbaar.
              </p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="plain">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <SectionHeading
                  eyebrow="Herkenbaar probleem"
                  title="Veel organisaties zien de signalen wel, maar missen de bestuurlijke lijn."
                  description="Verisight maakt sneller duidelijk welk managementprobleem nu echt aandacht vraagt en welke eerste route logisch is."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {painCards.map((card) => (
                  <div
                    key={card.title}
                    className="h-full rounded-[1.5rem] border border-[#E5E0D6] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-1"
                  >
                    <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="dark">
            <SectionHeading
              eyebrow="Kies de managementvraag die nu telt"
              title="Begin bij de route die de eerste managementvraag echt opent."
              description="ExitScan en RetentieScan blijven de twee sterkste eerste routes. TeamScan en Onboarding 30-60-90 zijn zichtbaar, maar kleiner en bedoeld als gerichte vervolgstap of aanvullende route."
              light
            />

            <div className="mt-12 grid gap-5 xl:grid-cols-2">
              {coreRoutes.map((route) => (
                <div
                  key={route.name}
                  className="flex h-full flex-col rounded-[1.9rem] border border-white/12 bg-[rgba(247,245,241,0.06)] p-5 shadow-[0_20px_50px_rgba(2,6,23,0.18)] sm:p-6"
                >
                  <span className="marketing-chip-dark">{route.badge}</span>
                  <h3 className="mt-5 text-[clamp(1.75rem,3vw,2.3rem)] font-semibold text-[#F7F5F1]">{route.name}</h3>
                  <p className="mt-3 text-lg leading-8 text-white/92">{route.title}</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">Wat dit opent</p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(247,245,241,0.78)]">{route.opens}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">Wanneer logisch</p>
                      <p className="mt-2 text-sm leading-7 text-[rgba(247,245,241,0.78)]">{route.timing}</p>
                    </div>
                  </div>
                  <Link
                    href={route.href}
                    className="mt-6 inline-flex items-center self-start rounded-full border border-[rgba(247,245,241,0.14)] bg-white px-5 py-2.5 text-sm font-semibold text-[#132033] transition-colors hover:bg-[#F7F5F1]"
                  >
                    Meer over {route.name}
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {expansionRoutes.map((route) => (
                <div
                  key={route.name}
                  className="flex h-full flex-col rounded-[1.6rem] border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">
                      {route.badge}
                    </span>
                    <p className="text-sm font-semibold text-white">{route.name}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">{route.opens}</p>
                  <p className="mt-3 text-sm leading-7 text-[rgba(247,245,241,0.62)]">{route.timing}</p>
                  <Link href={route.href} className="mt-auto inline-flex pt-5 text-sm font-semibold text-[#DCEFEA] hover:text-white">
                    Meer over {route.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-[rgba(247,245,241,0.12)] bg-[rgba(247,245,241,0.06)] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Support routes</p>
                  <p className="mt-3 text-sm leading-7 text-[rgba(247,245,241,0.74)]">
                    Pulse en Leadership Scan blijven bewust begrensde vervolgroutes. Ze ondersteunen ritme, review of extra managementcontext nadat de eerste route al helder is.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {supportRoutes.map((route) => (
                    <Link
                      key={route.name}
                      href={route.href}
                      className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                    >
                      {route.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.7rem] border border-[#DCEFEA]/20 bg-[linear-gradient(90deg,rgba(220,239,234,0.12),rgba(255,255,255,0.05))] p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Combinatie</p>
                  <p className="mt-3 text-base leading-8 text-white/88">
                    Combinatie blijft een portfolioroute voor organisaties waar vertrekduiding en vroegsignalering tegelijk bestuurlijk relevant zijn. Het is bewust geen derde hoofdproduct.
                  </p>
                </div>
                <Link
                  href="/producten/combinatie"
                  className="inline-flex items-center rounded-full border border-white/12 bg-white px-5 py-2.5 text-sm font-semibold text-[#132033] transition-colors hover:bg-[#F7F5F1]"
                >
                  Meer over Combinatie
                </Link>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Wat u krijgt"
              title="Concrete output die bestuur, HR en management echt kunnen gebruiken."
              description="Verisight verkoopt geen losse meting, maar een samenhangende productvorm die sneller richting geeft aan prioritering en managementgesprek."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {outcomeCards.map((card, index) => (
                <div
                  key={card.title}
                  className="h-full rounded-[1.7rem] border border-[#E5E0D6] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-6"
                >
                  <div className="mb-4 h-1.5 w-14 rounded-full bg-[#3C8D8A]" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Output {index + 1}</p>
                  <h3 className="mt-4 text-xl font-semibold text-[#132033]">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="plain" className="bg-[#F7F5F1]" containerClassName="relative">
            <div id="voorbeeldoutput" className="space-y-6 sm:space-y-8">
              <SectionHeading
                eyebrow="Voorbeeldoutput"
                title="Laat dashboard, handoff en rapport de verkoop mee doen."
                description="Deze sectie gebruikt voorbeeldoutput als productbewijs: rustig genoeg voor vertrouwen, visueel genoeg voor commerciele overtuiging."
              />

              <div className="rounded-[2rem] border border-[#E5E0D6] bg-white p-4 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-5 md:p-7">
                <PreviewSlider variant="portfolio" />
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {exitSampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="ExitScan voorbeeld"
                    title="Volledig buyer-facing ExitScan-rapport"
                    body="Gebruik dit voorbeeld als deliverable-proof wanneer de vraag primair over vertrekduiding gaat."
                    asset={exitSampleAsset}
                  />
                ) : null}
                {retentionSampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="RetentieScan voorbeeld"
                    title="Volledig buyer-facing RetentieScan-rapport"
                    body="Gebruik dit voorbeeld wanneer vroegsignalering op behoud in de actieve populatie centraal staat."
                    asset={retentionSampleAsset}
                  />
                ) : null}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="tint">
            <div className="grid gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
              <div>
                <SectionHeading
                  eyebrow="Aanpak"
                  title="Eerst routekeuze, dan pas de rest van de inrichting."
                  description="De aanpak blijft kort en voorspelbaar: van routekeuze naar eerste output en managementbespreking zonder onnodige projectfrictie."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="h-full rounded-[1.6rem] border border-[#E5E0D6] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#DCEFEA] bg-[#F3FAF7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                        Stap {step.step}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-[#132033]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#4A5563]">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div className="rounded-[2rem] border border-[#E5E0D6] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5f1_100%)] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] md:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
                <div>
                  <SectionHeading
                    eyebrow="Trust en begrenzing"
                    title="Vertrouwen is hier onderdeel van de productkwaliteit."
                    description="Compact uitgelegd, zonder verdedigingstoon: Verisight blijft methodisch scherp, privacy-first en expliciet over wat de output niet claimt."
                  />
                  <div className="mt-6">
                    <Link href="/vertrouwen" className="inline-flex items-center text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]">
                      Lees trust en privacy
                    </Link>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {trustPoints.map((item) => (
                    <div key={item} className="h-full rounded-[1.4rem] border border-[#E5E0D6] bg-white px-4 py-4 text-sm leading-7 text-[#4A5563]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <div className="rounded-[2.2rem] border border-[#E5E0D6] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf8_100%)] p-5 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
                <div className="space-y-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#3C8D8A]">Kennismaking</p>
                  <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-[#132033]">
                    Van eerste vraag naar een heldere route-inschatting.
                  </h2>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[#4A5563]">
                    In een eerste gesprek bepalen we welke route nu het best past, welke output logisch is en hoe snel
                    een eerste managementread haalbaar is.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Snelle check op managementvraag, omvang en timing',
                      'Heldere eerste route in plaats van een open projectverhaal',
                      'Desgewenst direct door naar voorbeeldoutput',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-[#E5E0D6] bg-[#F7F5F1] px-4 py-3.5 text-sm leading-7 text-[#4A5563]">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#3C8D8A]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                    <Link
                      href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_bottom_primary' })}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#3C8D8A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2d6e6b] sm:w-auto"
                    >
                      Plan een kennismaking
                    </Link>
                    <Link
                      href={exitSampleAsset?.publicHref ?? '#voorbeeldoutput'}
                      className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-5 py-3 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033] sm:w-auto"
                    >
                      Bekijk voorbeeldoutput
                    </Link>
                  </div>
                </div>

                <div id="kennismaking" className="rounded-[1.9rem] border border-[#E5E0D6] bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.06)] sm:p-5 md:p-6">
                  <Suspense
                    fallback={
                      <div className="rounded-[1.6rem] border border-[#E5E0D6] bg-[#F7F5F1] p-5 text-sm leading-7 text-[#4A5563]">
                        Het kennismakingsformulier wordt geladen.
                      </div>
                    }
                  >
                    <ContactForm
                      surface="light"
                      mode="compact"
                      defaultRouteInterest="exitscan"
                      defaultCtaSource="homepage_compact_form"
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </MarketingSection>
        </div>
      </MarketingPageShell>
    </>
  )
}
