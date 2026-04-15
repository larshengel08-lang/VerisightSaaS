import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/marketing/contact-form'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
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
  trustQuickLinks,
} from '@/components/marketing/site-content'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Kies eerst de juiste route: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud, of een bewuste combinatie van beide.',
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
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <PublicHeader />

      <main id="hoofdinhoud">
        <MarketingSection
          tone="plain"
          className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_24%),linear-gradient(180deg,#f9fbff_0%,#eef5ff_38%,#ffffff_100%)]"
          containerClassName="grid gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-start"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Verisight voor HR-teams</p>
            <h1 className="font-display mt-5 text-balance text-[3.35rem] leading-[0.96] text-slate-950 md:text-[5.25rem]">
              Eerst de juiste managementroute. Daarna pas de analyse.
            </h1>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-8 text-slate-600">
              Verisight helpt HR sneller kiezen tussen vertrekduiding en vroegsignalering op behoud. Je krijgt
              geen losse survey-output, maar een eerste traject met dashboard, managementrapport en bestuurlijke
              handoff in dezelfde taal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#kennismaking"
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

            <div className="mt-8 flex flex-wrap gap-2.5">
              {homepageProofSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <MarketingProofStrip
                items={statCards.map((item) => ({
                  title: item.value,
                  body: `${item.label}. ${item.detail}`,
                }))}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm leading-7 text-slate-600">
                Trust is hier reassurance, geen openingspitch. Daarom blijft de route helder en is de due-diligence
                laag publiek bereikbaar zodra een buyer wil verifieren hoe methodiek, privacy en rapportlezing werken.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
              {trustQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="marketing-glow-blue right-[-4rem] top-[-2rem] h-44 w-44" />
            <div className="marketing-glow-emerald bottom-[-2rem] right-[3rem] h-40 w-40" />
            <div className="marketing-panel relative overflow-hidden p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Waar begin je?</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">Kies eerst de vraag die nu bestuurlijk telt.</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">2 live routes</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {primaryRoutes.map((route) => (
                  <Link
                    key={route.name}
                    href={route.href}
                    className={`rounded-[1.75rem] border p-6 transition-transform hover:-translate-y-0.5 ${route.accent}`}
                  >
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200">
                      {route.chip}
                    </span>
                    <p className="mt-4 text-xl font-semibold text-slate-950">{route.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{route.body}</p>
                    <p className="mt-5 text-sm font-semibold text-slate-900">Bekijk {route.name}</p>
                  </Link>
                ))}
              </div>

              <Link
                href={combinationRoute.href}
                className={`mt-4 block rounded-[1.5rem] border px-5 py-5 transition-colors hover:border-slate-300 ${combinationRoute.accent}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{combinationRoute.chip}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{combinationRoute.title}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200">
                    Secundair
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">{combinationRoute.body}</p>
              </Link>

              <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Voorbeeld van de managementweergave</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Fictieve data in dezelfde managementstructuur, bestuurlijke handoff en trustnotities als echte output.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Deliverable-proof
                  </span>
                </div>
                <div className="mt-5">
                  <PreviewSlider variant="portfolio" />
                </div>
              </div>
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
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
            <div>
              <SectionHeading
                eyebrow="Deliverable-proof"
                title="Laat eerst zien wat management echt terugkrijgt."
                description="Preview en voorbeeldrapporten moeten de route geloofwaardig maken. Ze horen niet naast de propositie te staan, maar erin."
              />

              <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-7">
                <PreviewSlider variant="portfolio" />
              </div>
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
                  title="RetentieScan blijft expliciet verification-first."
                  body="Voor buyers met een actieve behoudsvraag laat dit voorbeeldrapport zien wat de route oplevert, zonder MTO- of predictorframing."
                  asset={retentionSampleAsset}
                  linkLabel="Open RetentieScan-voorbeeldrapport"
                />
              ) : null}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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

        <MarketingSection tone="plain" className="pt-0" containerClassName="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Binnen een kort gesprek weet je welke route nu het best past."
            body="Deel kort je organisatieomvang en of je nu vooral vertrek wilt duiden, behoud eerder wilt signaleren of beide bewust wilt combineren. Daarna weet je snel welk eerste traject logisch is."
            primaryHref="/producten"
            primaryLabel="Bekijk de routes"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
            className="self-start"
          />

          <div id="kennismaking" className="marketing-panel p-7 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Plan kennismaking</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Vertel kort welke managementvraag nu speelt.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              In circa 20 minuten krijg je helderheid over productkeuze, aanpak, timing, privacy en prijs.
            </p>
            <div className="mt-6">
              <ContactForm surface="light" />
            </div>
          </div>
        </MarketingSection>
      </main>

      <PublicFooter />
    </div>
  )
}
