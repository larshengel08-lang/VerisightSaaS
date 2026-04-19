import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
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
  'Dashboard + rapport',
  'Bestuurlijke handoff',
  'Eerste read binnen weken',
] as const

const painCards = [
  {
    title: 'Signalen komen versnipperd binnen',
    body: 'Losse exit-, team- en behoudssignalen geven nog geen bestuurlijke lijn.',
  },
  {
    title: 'Behoudsdruk wordt vaak te laat scherp',
    body: 'Zonder vroeg groepsbeeld reageert management te vaak op incidenten.',
  },
  {
    title: 'Management wil richting, geen survey-output',
    body: 'Er is behoefte aan prioriteiten, niet aan losse survey-output.',
  },
] as const

const coreRoutes = [
  {
    name: 'ExitScan',
    badge: 'Kernroute',
    title: 'Voor vertrekduiding wanneer terugkerende uitstroomvragen bestuurlijke aandacht vragen.',
    opens: 'Maakt zichtbaar welk vertrekbeeld terugkeert en welke werkfactoren eerst getoetst moeten worden.',
    timing: 'Logisch wanneer uitstroom snel naar een eerste managementgesprek vertaald moet worden.',
    href: '/producten/exitscan',
  },
  {
    name: 'RetentieScan',
    badge: 'Kernroute',
    title: 'Voor vroegsignalering wanneer behoud onder druk lijkt te staan.',
    opens: 'Maakt zichtbaar waar actieve populaties nu een eerste verificatiespoor of interventie vragen.',
    timing: 'Logisch wanneer behoud eerder bestuurlijk scherp moet worden.',
    href: '/producten/retentiescan',
  },
] as const

const expansionRoutes = [
  {
    name: 'TeamScan',
    badge: 'Aanvullende route',
    opens: 'Voor lokale verificatie nadat een breder people-signaal eerst zichtbaar is.',
    timing: 'Gericht vervolg wanneer een team of onderdeel nader bekeken moet worden.',
    href: '/producten/teamscan',
  },
  {
    name: 'Onboarding 30-60-90',
    badge: 'Aanvullende route',
    opens: 'Voor vroege lifecycle-checks rond landing, frictie en onboardingkwaliteit.',
    timing: 'Gericht vervolg wanneer nieuwe medewerkers bestuurlijk aandacht vragen.',
    href: '/producten/onboarding-30-60-90',
  },
] as const

const supportRoutes = [
  {
    name: 'Pulse',
    body: 'Compacte reviewroute na een eerste baseline of managementread.',
    href: '/producten/pulse',
  },
  {
    name: 'Leadership Scan',
    body: 'Begrensde managementcontext na een bestaand people-signaal.',
    href: '/producten/leadership-scan',
  },
] as const

const outcomeCards = [
  {
    title: 'Dashboard voor eerste managementread',
    body: 'Rustige kernmetrics en focuspunten die het eerste bestuurlijke beeld openen.',
  },
  {
    title: 'Rapport met prioriteiten en verificatievragen',
    body: 'Leesbare rapportlaag die helpt prioriteren en vragen te toetsen.',
  },
  {
    title: 'Bestuurlijke handoff en eerste route',
    body: 'Heldere handoff: wat speelt nu, waarom telt dit en wat eerst besproken moet worden.',
  },
  {
    title: 'Eerste managementgesprek en vervolgadvies',
    body: 'Eerste gesprek over prioriteiten, eigenaarschap en logische vervolgrichting.',
  },
] as const

const processSteps = [
  {
    step: '1',
    title: 'Routekeuze',
    body: 'We bepalen eerst welke vraag nu het meest telt.',
  },
  {
    step: '2',
    title: 'Intake en setup',
    body: 'Doelgroep, timing en privacygrenzen worden strak gezet.',
  },
  {
    step: '3',
    title: 'Eerste output',
    body: 'Dashboard, rapport en handoff landen in een heldere managementlijn.',
  },
  {
    step: '4',
    title: 'Managementbespreking',
    body: 'We vertalen de output naar prioriteiten en een logische vervolgstap.',
  },
] as const

const trustPoints = [
  'Geaggregeerde rapportage',
  'Minimale n-grenzen',
  'AVG-conform met primaire opslag in een EU-regio',
  'Methodisch onderbouwde vraagblokken',
  'Geen individuele voorspeller of diagnose',
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
        ctaLabel="Plan een eerste gesprek"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">
              Voor HR, directie en MT in organisaties met 200-1.000 medewerkers
            </p>
            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
              Zie sneller waar vertrek of behoud nu managementaandacht vraagt.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Begeleide scans, dashboard en managementrapport maken snel zichtbaar welke eerste managementroute logisch
              is.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions sm:flex-row sm:items-center">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero_primary' })}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(60,141,138,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b] sm:w-auto"
              >
                Plan een eerste gesprek
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
                  <span className="marketing-chip-dark">Sneller naar eerste managementread</span>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(17rem,0.92fr)]">
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
                        ['Eerste read', 'Binnen weken', 'Van intake naar bestuur'],
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
                          Eerste read
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Leiderschap', '63%', 'Bestuurlijke read'],
                          ['Groei', '61%', 'Prioriteit'],
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

                  <div className="rounded-[1.45rem] border border-[#DCEFEA]/20 bg-[#F7F5F1] p-4 text-[#132033] shadow-[0_18px_50px_rgba(15,23,42,0.26)] sm:rounded-[1.6rem] sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Bestuurlijke handoff</p>
                    <p className="mt-3 text-xl font-semibold">Van signaal naar eerste gesprek</p>
                    <div className="mt-4 space-y-3">
                      {[
                        'Wat speelt nu',
                        'Waarom telt dit bestuurlijk',
                        'Welke vraag eerst getoetst moet worden',
                      ].map((item) => (
                        <div key={item} className="rounded-[1rem] border border-[#E5E0D6] bg-white px-3 py-3 text-sm leading-6 text-[#4A5563]">
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[1rem] border border-[#E5E0D6] bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">Waarom dit werkt</p>
                      <p className="mt-1 text-sm leading-6 text-[#4A5563]">
                        Geen losse survey-output, maar een rustige managementread die direct naar een eerste gesprek leidt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MarketingHeroStage>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="plain" className="pt-0 pb-8 sm:pb-10">
            <div className="rounded-[1.75rem] border border-[#E5E0D6] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(15,23,42,0.05)] sm:px-6 sm:py-5">
              <div className="grid gap-3 md:grid-cols-3">
                {painCards.map((card) => (
                  <div key={card.title} className="rounded-[1.2rem] border border-[#EDE7DC] bg-[#FCFBF9] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">Herkenbaar probleem</p>
                    <p className="mt-2 text-sm font-semibold text-[#132033]">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#4A5563]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface" className="pt-0" containerClassName="relative">
            <div id="voorbeeldoutput" className="space-y-6 sm:space-y-8">
              <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr] xl:items-end">
                <SectionHeading
                  eyebrow="Voorbeeldoutput"
                  title="Zie eerst de output die het gesprek moet openen."
                  description="De sterkste verkooplaag van Verisight is het bewijs van dashboard, handoff en rapport in dezelfde rustige managementlijn."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {outcomeCards.map((card, index) => (
                    <div
                      key={card.title}
                      className="rounded-[1.4rem] border border-[#DCEFEA] bg-white px-4 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Proof {index + 1}</p>
                      <p className="mt-2 text-sm font-semibold text-[#132033]">{card.title}</p>
                      <p className="mt-2 text-sm leading-6 text-[#4A5563]">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.1rem] border border-[#183142]/10 bg-[linear-gradient(180deg,#183142_0%,#132033_100%)] p-4 shadow-[0_34px_90px_rgba(19,32,51,0.16)] sm:p-6">
                <div className="rounded-[1.8rem] border border-white/10 bg-white p-4 shadow-[0_26px_70px_rgba(15,23,42,0.08)] sm:p-6">
                  <PreviewSlider variant="portfolio" />
                </div>
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

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_proof_primary' })}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#3C8D8A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2d6e6b] sm:w-auto"
                >
                  Plan een eerste gesprek
                </Link>
                <Link
                  href={exitSampleAsset?.publicHref ?? '#kennismaking'}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-5 py-3 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033] sm:w-auto"
                >
                  Bekijk volledige voorbeeldoutput
                </Link>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain" className="pb-10 pt-10 sm:pb-12 sm:pt-12">
            <SectionHeading
              eyebrow="Routekeuze"
              title="Kies daarna de route die nu het meest logisch is."
              description="De productlaag helpt kiezen. Het zwaarste bewijs staat hierboven al in de output."
            />

            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {coreRoutes.map((route) => (
                <div
                  key={route.name}
                  className="flex h-full flex-col rounded-[1.7rem] border border-[#E5E0D6] bg-white p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="marketing-chip">{route.badge}</span>
                    <p className="text-lg font-semibold text-[#132033]">{route.name}</p>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-7 text-[#132033]">{route.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#4A5563]">{route.opens}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">{route.timing}</p>
                  <Link href={route.href} className="mt-5 inline-flex text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]">
                    Meer over {route.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {expansionRoutes.map((route) => (
                <div
                  key={route.name}
                  className="rounded-[1.4rem] border border-[#E5E0D6] bg-[#FBFAF8] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#132033]">{route.name}</p>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">{route.badge}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4A5563]">{route.opens}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">{route.timing}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.55rem] border border-[#E5E0D6] bg-[#F7F5F1] px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Support en portfolio</p>
                  <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                    {supportRoutes[0].name} en {supportRoutes[1].name} blijven begrensde vervolgroutes. Combinatie blijft een portfolioroute wanneer vertrekduiding en vroegsignalering tegelijk bestuurlijk relevant zijn.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {supportRoutes.map((route) => (
                    <Link
                      key={route.name}
                      href={route.href}
                      className="rounded-full border border-[#E5E0D6] bg-white px-4 py-2 text-sm font-semibold text-[#132033] transition-colors hover:border-[#3C8D8A] hover:text-[#3C8D8A]"
                    >
                      {route.name}
                    </Link>
                  ))}
                  <Link
                    href="/producten/combinatie"
                    className="rounded-full border border-[#DCEFEA] bg-[#F3FAF7] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:bg-white"
                  >
                    Meer over Combinatie
                  </Link>
                </div>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="tint" className="pb-8 pt-8 sm:pb-10 sm:pt-10">
            <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
              <div>
                <SectionHeading
                  eyebrow="Aanpak"
                  title="Kort, voorspelbaar en gericht op eerste waarde."
                  description="Eerst routekeuze, dan intake, output en managementbespreking. Geen zwaar projectverhaal."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="h-full rounded-[1.45rem] border border-[#E5E0D6] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
                  >
                    <span className="rounded-full border border-[#DCEFEA] bg-[#F3FAF7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                      Stap {step.step}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-[#132033]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4A5563]">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface" className="pb-8 pt-0 sm:pb-10">
            <div className="rounded-[1.9rem] border border-[#E5E0D6] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5f1_100%)] p-5 shadow-[0_22px_54px_rgba(15,23,42,0.06)] md:p-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Trust en begrenzing</p>
                  <h2 className="mt-3 font-display text-[clamp(1.8rem,3.8vw,2.7rem)] font-light leading-[1.06] tracking-[-0.03em] text-[#132033]">
                    Methodisch helder. Privacy-first. Zonder overclaim.
                  </h2>
                  <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#4A5563]">
                    Verisight blijft expliciet over wat de output ondersteunt en wat niet. Dat maakt vertrouwen onderdeel van de productkwaliteit.
                  </p>
                </div>
                <Link href="/vertrouwen" className="inline-flex items-center text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]">
                  Lees trust en privacy
                </Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {trustPoints.map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-3 text-sm leading-6 text-[#4A5563]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain" className="pt-0">
            <div className="rounded-[2.2rem] border border-[#132033]/10 bg-[linear-gradient(135deg,#183142_0%,#132033_100%)] p-5 shadow-[0_28px_72px_rgba(19,32,51,0.12)] sm:p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
                <div className="space-y-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#DCEFEA]">Korte kennismaking</p>
                  <h2 className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-white">
                    Plan een eerste gesprek en ontvang snel een route-inschatting.
                  </h2>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[rgba(247,245,241,0.78)]">
                    We reageren meestal binnen 1 werkdag met de meest logische eerste route en welke output daarbij past.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Snelle route-inschatting op basis van uw managementvraag',
                      'Duidelijke eerste stap in plaats van een open intake',
                      'Desgewenst direct gekoppeld aan voorbeeldoutput',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/6 px-4 py-3.5 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
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
                      Plan een eerste gesprek
                    </Link>
                    <Link
                      href={exitSampleAsset?.publicHref ?? '#voorbeeldoutput'}
                      className="inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/12 sm:w-auto"
                    >
                      Bekijk voorbeeldoutput
                    </Link>
                  </div>
                </div>

                <div id="kennismaking" className="rounded-[1.9rem] border border-white/10 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.16)] sm:p-5 md:p-6">
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
