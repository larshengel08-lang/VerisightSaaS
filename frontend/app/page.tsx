import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ContactForm } from '@/components/marketing/contact-form'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import {
  comparisonCards,
  faqSchema,
  homepageComparisonRows,
  homepageProductRoutes,
  homepageProofSignals,
  homepageUtilityLinks,
  outcomeCards,
  processHighlights,
  statCards,
  trustItems,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export const metadata: Metadata = {
  title: 'ExitScan en RetentieScan voor HR-teams',
  description:
    'Kies eerst de juiste route voor HR-teams: ExitScan voor vertrekduiding en verloopanalyse, RetentieScan voor vroegsignalering op behoud, of een bewuste combinatie van beide.',
  alternates: {
    canonical: '/',
  },
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight | ExitScan en RetentieScan voor HR-teams',
    description:
      'Kies eerst de juiste route: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud, of een bewuste combinatie van beide.',
    url: 'https://www.verisight.nl/',
    inLanguage: 'nl-NL',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ExitScan',
          url: 'https://www.verisight.nl/producten/exitscan',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'RetentieScan',
          url: 'https://www.verisight.nl/producten/retentiescan',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Combinatie',
          url: 'https://www.verisight.nl/producten/combinatie',
        },
      ],
    },
  }

  const primaryRoutes = homepageProductRoutes.slice(0, 2)
  const combinationRoute = homepageProductRoutes[2]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <MarketingPageShell
        theme="neutral"
        pageType="home"
        heroIntro={
          <MarketingHeroIntro>
            <div className="flex max-w-full flex-wrap items-center gap-2 rounded-[1.4rem] border border-white/70 bg-white/88 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:w-fit">
              <span className="text-blue-600">Verisight voor HR-teams</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span>ExitScan eerst</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span>RetentieScan gericht aanvullend</span>
            </div>

            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-slate-950">
              Eerst de juiste route. Daarna pas de analyse.
            </h1>
            <p className="marketing-hero-copy text-slate-600">
              Verisight helpt HR sneller kiezen tussen vertrekduiding en vroegsignalering op behoud. Je krijgt geen
              losse survey-output, maar een eerste traject met dashboard, managementrapport en bestuurlijke handoff in
              dezelfde taal.
            </p>

            <div className="marketing-hero-actions">
              <div className="marketing-hero-cta-row">
                <a
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero' })}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Plan kennismaking
                </a>
                <Link
                  href="/producten"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk de routes
                </Link>
              </div>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage>
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="marketing-stage-tag bg-blue-400/12 text-blue-100">Routekeuze</span>
                <span className="marketing-stage-tag border border-white/10 bg-white/5 text-slate-300">
                  Een hoofdvraag tegelijk
                </span>
              </div>
              <h2 className="marketing-stage-title font-display text-white">
                Kies eerst de managementvraag die nu bestuurlijk telt.
              </h2>
              <p className="marketing-stage-copy text-slate-300">
                De bovenkant van de site hoeft niet alles tegelijk te bewijzen. Eerst landt de keuze tussen vertrek
                begrijpen en behoud eerder signaleren. Daarna volgt pas de prooflaag.
              </p>

              <div className="grid gap-3">
                {primaryRoutes.map((route, index) => (
                  <Link
                    key={route.name}
                    href={route.href}
                    className="rounded-[1.55rem] border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/8 text-[11px] font-bold uppercase tracking-[0.12em] text-white ring-1 ring-white/10">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">{route.chip}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{route.title}</p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{route.body}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href={combinationRoute.href}
                className="block rounded-[1.45rem] border border-white/10 bg-white/5 px-5 py-5 transition-colors hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                      {combinationRoute.chip}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{combinationRoute.title}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Secundair
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{combinationRoute.body}</p>
              </Link>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="grid gap-4">
              <div className="marketing-pill-stack">
                {homepageProofSignals.map((signal) => (
                  <span
                    key={signal}
                    className="marketing-pill border border-white/70 bg-white/92 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    {signal}
                  </span>
                ))}
              </div>

              <div className="overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/90 shadow-[0_22px_48px_rgba(15,23,42,0.08)] backdrop-blur">
                {statCards.map((item, index) => (
                  <div
                    key={item.label}
                    className={`grid gap-2 px-5 py-4 md:grid-cols-[8rem_1fr_auto] md:items-center ${
                      index !== 0 ? 'border-t border-slate-200/80' : ''
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="text-sm leading-7 text-slate-600">{item.detail}</p>
                    <p className="text-2xl font-semibold text-slate-950 md:text-right">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="marketing-support-note text-sm leading-7 text-slate-600">
                Trust blijft hier bewust compact: genoeg reassurance om de route geloofwaardig te maken, maar niet zo
                breed dat pricing, proof en contactflow al boven de vouw concurreren.
              </div>
              <div className="marketing-link-grid">
                {homepageUtilityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                  >
                    <span className="block font-semibold text-slate-950">{link.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{link.body}</span>
                  </Link>
                ))}
              </div>
            </div>
          </MarketingHeroSupport>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="surface">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <div>
                <SectionHeading
                  eyebrow="Deliverable-proof"
                  title="Laat direct zien wat management terugkrijgt."
                  description="Preview en evidence horen direct na de routekeuze te landen. Daardoor voelt proof als bevestiging van de gekozen vraag en niet als concurrerende hero-inhoud."
                />

                <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-7">
                  <PreviewSlider variant="portfolio" />
                </div>
                <PreviewEvidenceRail className="mt-6" variant="portfolio" />
              </div>

              <div className="grid gap-5">
                {exitSampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="ExitScan-proof"
                    title="De primaire showcase-route begint bij ExitScan."
                    body="Gebruik het voorbeeldrapport om te laten zien hoe vertrekduiding, werkfactoren en bestuurlijke handoff samenkomen in een eerste managementrapport."
                    asset={exitSampleAsset}
                    linkLabel="Open ExitScan-voorbeeldrapport"
                  />
                ) : null}
                {retentionSampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="RetentieScan-proof"
                    title="RetentieScan blijft verification-first."
                    body="Voor buyers met een actieve behoudsvraag laat dit voorbeeldrapport zien wat de route oplevert, zonder MTO- of predictorframing."
                    asset={retentionSampleAsset}
                    linkLabel="Open RetentieScan-voorbeeldrapport"
                  />
                ) : null}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Waarom dit werkt"
              title="Meer dan een nette surveylaag of losse onderzoeksoutput."
              description="De meerwaarde zit in de route, de managementleeslijn en de manier waarop proof, pricing en trust elkaar versterken."
              align="center"
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {comparisonCards.map((card) => (
                <div key={card.title} className="marketing-panel-soft p-7">
                  <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{card.description}</p>
                  <p className="mt-5 rounded-2xl border border-white bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                    {card.outcome}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Vergelijking"
                  title="Kies de route in een minuut."
                  description="Hier zie je snel welke vraag, deliverable en vervolgstap bij welke route horen."
                />

                <div className="mt-8 space-y-4">
                  {homepageUtilityLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="marketing-panel block p-5 transition-colors hover:border-slate-300"
                    >
                      <p className="text-base font-semibold text-slate-950">{link.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{link.body}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <MarketingComparisonTable
                columns={['Situatie', 'Beste route', 'Wat je krijgt']}
                rows={homepageComparisonRows}
              />
            </div>
          </MarketingSection>

          <MarketingSection tone="dark">
            <SectionHeading
              eyebrow="Voor wie dit landt"
              title="Een gedeelde managementtaal voor HR, MT en directie."
              description="De site moet niet alleen uitleggen wat Verisight doet, maar ook voelbaar maken waarom de output intern doorvertelbaar en bespreekbaar is."
              light
              align="center"
            />

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {processHighlights.map(({ title, text }) => (
                <div key={title} className="marketing-panel-dark border-white/10 bg-white/5 p-7">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">{title}</p>
                  <p className="mt-4 text-base leading-8 text-slate-200">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {outcomeCards.slice(0, 3).map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-base font-semibold text-white">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <TrustStrip items={trustItems} tone="dark" />
            </div>
          </MarketingSection>

          <MarketingSection tone="plain" containerClassName="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <MarketingCalloutBand
              eyebrow="Na kennismaking"
              title="Eerst route en intake scherp. Daarna pas livegang en eerste waarde."
              body="In het eerste gesprek toetsen we welke managementvraag eerst telt, welke databasis nodig is en of een baseline of vervolgvorm nu logisch is. Daarna begeleidt Verisight setup, respondentimport en uitnodigingen, zodat de eerste signalen geloofwaardig en frictiearm landen."
              primaryHref="/aanpak"
              primaryLabel="Bekijk aanpak"
              secondaryHref="/tarieven"
              secondaryLabel="Bekijk tarieven"
              className="self-start"
            />

            <div id="kennismaking" className="marketing-panel p-7 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Plan kennismaking</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Vertel kort welke managementvraag nu speelt.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                In circa 20 minuten krijg je helderheid over productkeuze, aanpak, timing, privacy en prijs.
              </p>
              <div className="mt-6">
                <Suspense
                  fallback={
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
                      Het kennismakingsformulier wordt geladen.
                    </div>
                  }
                >
                  <ContactForm surface="light" />
                </Suspense>
              </div>
            </div>
          </MarketingSection>
        </div>
      </MarketingPageShell>
    </>
  )
}
