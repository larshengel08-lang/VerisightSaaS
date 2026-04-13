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

export const metadata: Metadata = {
  title: 'Verisight',
  description:
    'Kies tussen ExitScan, RetentieScan en een bewuste combinatie. Verisight helpt HR-teams met dashboard, rapport en managementduiding in één commerciële flow.',
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
      'Kies tussen ExitScan, RetentieScan en een bewuste combinatie. Verisight helpt HR-teams met dashboard, rapport en managementduiding in één commerciële flow.',
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
          className="overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_22%),radial-gradient(circle_at_bottom_right,#dcfce7_0%,transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_40%,#ffffff_100%)]"
          containerClassName="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Verisight voor HR-teams</p>
            <h1 className="font-display mt-5 text-balance text-[3.2rem] leading-[0.98] text-slate-950 md:text-[5.2rem]">
              ExitScan en RetentieScan in één heldere commerciële lijn.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Kies eerst de juiste route: begrijpen waarom mensen gingen, eerder zien waar behoud schuift, of beide bewust combineren. Daarna krijg je dashboard, rapport en managementduiding in dezelfde taal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#kennismaking"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Plan mijn gesprek
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {homepageProofSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200"
                >
                  {signal}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <TrustStrip items={trustItems} />
            </div>
          </div>

          <div className="relative">
            <div className="marketing-glow-blue right-[-4rem] top-[-2rem] h-40 w-40" />
            <div className="marketing-glow-emerald bottom-[-3rem] right-[4rem] h-44 w-44" />
            <div className="marketing-panel relative overflow-hidden p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Snelle productkeuze</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">Lees in 30 seconden welke route nu past.</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">2 live producten</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {homepageProductRoutes.map((route) => (
                  <Link
                    key={route.name}
                    href={route.href}
                    className={`rounded-[1.5rem] border p-5 transition-transform hover:-translate-y-0.5 ${route.accent}`}
                  >
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 ring-1 ring-slate-200">
                      {route.chip}
                    </span>
                    <p className="mt-4 text-lg font-semibold text-slate-950">{route.name}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{route.body}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Voorbeeld van de managementweergave</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Fictieve data in dezelfde commerciële structuur als echte output.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Demo
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
            eyebrow="Kies je product"
            title="Twee live producten en één bewuste combinatieroute."
            description="Geen generieke surveyverpakking, maar drie duidelijke routes die elk een eigen managementgesprek oproepen."
            align="center"
          />

          <MarketingProofStrip
            className="mt-14"
            items={statCards.map((item) => ({
              title: `${item.value} - ${item.label}`,
              body: item.detail,
            }))}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {comparisonCards.map((card) => (
              <div key={card.title} className="marketing-panel-soft p-7">
                <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{card.description}</p>
                <p className="mt-4 rounded-2xl border border-white bg-white px-4 py-4 text-sm leading-7 text-slate-700">
                  {card.outcome}
                </p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Vergelijking"
                title="Lees de productkeuze in een minuut."
                description="Hier zie je direct welke route past bij welke managementvraag en wat je daarvan terugkrijgt."
              />

              <div className="mt-8 space-y-4">
                {homepageUtilityLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="marketing-panel p-5 transition-colors hover:border-slate-300">
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
            eyebrow="Waarom Verisight"
            title="Meer managementwaarde dan een generieke survey of losse export."
            description="De meerwaarde zit niet alleen in meten, maar in hoe snel HR, MT en directie snappen wat aandacht vraagt."
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
        </MarketingSection>

        <MarketingSection tone="plain" className="pt-0" containerClassName="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Binnen een kort gesprek weet je welke scan nu het best past."
            body="Deel kort je organisatieomvang en of je nu vooral vertrek wilt duiden, behoud eerder wilt signaleren of beide wilt combineren. Daarna weet je snel welke productvorm logisch is."
            primaryHref="/producten"
            primaryLabel="Bekijk producten"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
            className="self-start"
          />

          <div id="kennismaking" className="marketing-panel p-7 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Plan gesprek</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Vertel kort welke route je nu onderzoekt.</h2>
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
