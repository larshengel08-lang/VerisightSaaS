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
    'Verisight helpt HR, directie en MT snel zien waar vertrek of behoud begint te knellen, met een dashboard, samenvatting en rapport.',
  alternates: {
    canonical: '/',
  },
}

const heroProofSignals = [
  'Helder groepsbeeld',
  'Rapport met prioriteiten',
  'Snel klaar voor gesprek',
] as const

const painCards = [
  {
    title: 'U hoort veel, maar ziet nog geen patroon',
    body: 'Losse signalen uit teams, exitgesprekken en behoud geven samen nog geen duidelijke richting.',
  },
  {
    title: 'Vaak is het te laat voor het echt scherp wordt',
    body: 'Zonder vroeg groepsbeeld wordt pas laat duidelijk waar vertrek of behoud begint te schuiven.',
  },
  {
    title: 'Een los overzicht helpt het gesprek niet verder',
    body: 'U wilt weten wat opvalt, wat eerst besproken moet worden en welke stap logisch volgt.',
  },
] as const

const coreRoutes = [
  {
    name: 'ExitScan',
    badge: 'Kernroute',
    title: 'Kies deze scan als u wilt begrijpen waarom mensen vertrekken.',
    opens: 'U ziet welke patronen terugkomen, wat opvalt en welke onderwerpen eerst besproken moeten worden.',
    timing: 'U krijgt sneller duidelijk waar u moet doorvragen en welke stap daarna logisch is.',
    href: '/producten/exitscan',
  },
  {
    name: 'RetentieScan',
    badge: 'Kernroute',
    title: 'Kies deze scan als u eerder wilt zien waar behoud onder druk staat.',
    opens: 'U ziet waar in groepen of teams nu extra aandacht nodig is en welke signalen het zwaarst wegen.',
    timing: 'U krijgt sneller houvast voor een gesprek over risico, prioriteiten en een eerste vervolgstap.',
    href: '/producten/retentiescan',
  },
] as const

const expansionRoutes = [
  {
    name: 'TeamScan',
    badge: 'Aanvullende route',
    opens: 'Voor een extra check in een team of onderdeel.',
    timing: 'Past als u na een eerste scan lokaal verder wilt kijken.',
    href: '/producten/teamscan',
  },
  {
    name: 'Onboarding 30-60-90',
    badge: 'Aanvullende route',
    opens: 'Voor een vroege check in de eerste maanden van nieuwe medewerkers.',
    timing: 'Past als u onboarding sneller wilt aanscherpen.',
    href: '/producten/onboarding-30-60-90',
  },
] as const

const supportRoutes = [
  {
    name: 'Pulse',
    body: 'Korte vervolgmeting na de eerste scan.',
    href: '/producten/pulse',
  },
  {
    name: 'Leadership Scan',
    body: 'Extra duiding als leiderschap nadrukkelijk meespeelt.',
    href: '/producten/leadership-scan',
  },
] as const

const outcomeCards = [
  {
    title: 'Dashboard',
    body: 'In een oogopslag zien wat nu speelt.',
  },
  {
    title: 'Samenvatting',
    body: 'Kort overzicht van wat opvalt en waarom dat telt.',
  },
  {
    title: 'Prioriteiten',
    body: 'Duidelijk wat eerst besproken en getoetst moet worden.',
  },
  {
    title: 'Vervolgstap',
    body: 'Een logische eerste stap na het gesprek.',
  },
] as const

const processSteps = [
  {
    step: '1',
    title: 'Routekeuze',
    body: 'We bepalen samen welke scan nu het best past.',
  },
  {
    step: '2',
    title: 'Intake en setup',
    body: 'We zetten doelgroep, planning en randvoorwaarden scherp.',
  },
  {
    step: '3',
    title: 'Eerste uitkomst',
    body: 'U krijgt snel een dashboard, samenvatting en rapport.',
  },
  {
    step: '4',
    title: 'Bespreking',
    body: 'We bespreken wat opvalt en wat u als eerste kunt doen.',
  },
] as const

const trustPoints = [
  'Alleen groepsinzichten',
  'Minimale groepsgroottes',
  'AVG-conform met opslag in de EU',
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
      'Verisight helpt HR, directie en MT snel zien waar vertrek of behoud begint te knellen, met een dashboard, samenvatting en rapport.',
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
              Zie binnen weken waar vertrek of behoud echt begint te knellen.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight maakt van losse signalen een duidelijk groepsbeeld met dashboard, samenvatting en rapport. Zo weet u sneller wat eerst besproken moet worden.
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
                    Binnen weken bruikbaar
                  </span>
                  <span className="marketing-chip-dark">Voor uw eerste gesprek</span>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(18rem,0.98fr)]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:rounded-[1.7rem] sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-3 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Dashboard
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Vertrekbeeld', '5,8/10', 'Patroon vraagt gesprek'],
                        ['Behoudsdruk', '5,6/10', 'Vroeg signaal zichtbaar'],
                      ].map(([label, value, detail]) => (
                        <div key={label} className="rounded-[1rem] border border-white/10 bg-white/5 p-3 sm:rounded-[1.2rem] sm:p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-[11px] sm:text-slate-200">{label}</p>
                          <p className="mt-2 text-lg font-semibold text-white sm:mt-3 sm:text-xl">{value}</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-300 sm:text-[11px] sm:leading-5 sm:text-slate-200">{detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/5 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-[11px] sm:text-slate-200">Wat valt op</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ['Leiderschap', '63%'],
                          ['Groei', '61%'],
                          ['Werkbelasting', '56%'],
                        ].map(([label, width]) => (
                          <div key={label} className="grid grid-cols-[minmax(0,5.8rem)_1fr] items-center gap-2.5 sm:grid-cols-[minmax(0,7rem)_1fr] sm:gap-3">
                            <span className="text-xs text-slate-200 sm:text-sm">{label}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-[#3C8D8A]" style={{ width }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.45rem] border border-[#DCEFEA]/20 bg-[#F7F5F1] p-4 text-[#132033] shadow-[0_18px_50px_rgba(15,23,42,0.26)] sm:rounded-[1.6rem] sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Samenvatting</p>
                    <p className="mt-3 text-xl font-semibold">Van losse signalen naar een duidelijk gesprek</p>
                    <div className="mt-4 space-y-3">
                      {[
                        'Wat speelt nu het meest',
                        'Wat eerst besproken moet worden',
                        'Welke stap daarna logisch is',
                      ].map((item) => (
                        <div key={item} className="rounded-[1rem] border border-[#E5E0D6] bg-white px-3 py-3 text-sm leading-6 text-[#4A5563]">
                          {item}
                        </div>
                      ))}
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
                    <p className="text-sm font-semibold text-[#132033]">{card.title}</p>
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
                  title="Zie eerst wat u straks op tafel krijgt."
                  description="Geen losse uitkomsten, maar een duidelijk overzicht van wat speelt, wat opvalt en wat eerst besproken moet worden."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {outcomeCards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-[1.4rem] border border-[#DCEFEA] bg-white px-4 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]"
                    >
                      <p className="text-sm font-semibold text-[#132033]">{card.title}</p>
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
                    eyebrow="ExitScan voorbeeldrapport"
                    title="Voor als vertrek de vraag is"
                    body="Laat zien welke patronen terugkomen, wat opvalt en wat eerst besproken moet worden."
                    asset={exitSampleAsset}
                  />
                ) : null}
                {retentionSampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="RetentieScan voorbeeldrapport"
                    title="Voor als behoud de vraag is"
                    body="Laat zien waar behoud onder druk staat en welke punten als eerste aandacht vragen."
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
              title="Kies daarna de scan die nu past."
              description="Meestal begint het met een simpele keuze: wilt u vertrek beter begrijpen of behoud eerder in beeld krijgen?"
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
                  <p className="mt-3 text-sm leading-7 text-[#4A5563]"><span className="font-semibold text-[#132033]">Wat wordt zichtbaar:</span> {route.opens}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]"><span className="font-semibold text-[#132033]">Wat levert het op:</span> {route.timing}</p>
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
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Kleinere vervolgroutes</p>
                  <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                    {supportRoutes[0].name} en {supportRoutes[1].name} volgen meestal pas na de eerste scan. Combinatie past wanneer vertrek en behoud tegelijk spelen.
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
                  title="Snel gestart, duidelijk in stappen."
                  description="Eerst kiezen we de juiste scan. Daarna volgt de start, de eerste uitkomst en het gesprek daarover."
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
                    Duidelijk over privacy en grenzen.
                  </h2>
                  <p className="mt-3 max-w-[42rem] text-sm leading-7 text-[#4A5563]">
                    U ziet alleen groepsinzichten. We werken met minimale groepsgroottes en doen geen uitspraken over individuen.
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
                    Plan een eerste gesprek.
                  </h2>
                  <p className="max-w-[34rem] text-[1rem] leading-8 text-[rgba(247,245,241,0.78)]">
                    Ontdek snel welke scan past en wat u als eerste kunt verwachten.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Snel duidelijk welke scan past',
                      'Heldere eerste stap zonder lang voortraject',
                      'Direct te koppelen aan voorbeeldoutput',
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
