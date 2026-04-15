import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  approachRoutes,
  approachSteps,
  customerLifecycleStages,
  included,
  trustItems,
} from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
  alternates: { canonical: '/aanpak' },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    url: 'https://www.verisight.nl/aanpak',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight aanpak voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    images: ['/opengraph-image'],
  },
}

export default function AanpakPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Aanpak', item: 'https://www.verisight.nl/aanpak' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        theme="neutral"
        pageType="approach"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_hero' })}
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-blue-600">Aanpak</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">
              Een begeleide productvorm die kooprust en uitvoerbaarheid combineert.
            </h1>
            <p className="marketing-hero-copy text-slate-600">
              Verisight is geen losse surveytool en ook geen zwaar consultancytraject. Je koopt een duidelijke route
              van intake en uitvoering naar rapport, bestuurlijke handoff en eerste opvolging.
            </p>
            <div className="marketing-hero-actions">
              <div className="marketing-hero-cta-row">
                <a
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_hero' })}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Plan kennismaking
                </a>
                <Link
                  href="/tarieven"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage>
            <div className="space-y-5">
              <span className="marketing-stage-tag bg-blue-400/12 text-blue-100">Proces-first</span>
              <h2 className="marketing-stage-title font-display text-white">
                Gebruik de aanpakpagina om voorspelbaarheid te toetsen, niet om een los procesplaatje te bekijken.
              </h2>
              <p className="marketing-stage-copy text-slate-300">
                Na productkeuze moet snel duidelijk worden hoe een traject loopt, wat inbegrepen is en waar begeleiding
                het verschil maakt. Deze pagina moet die kooprust geven.
              </p>
              <div className="marketing-stage-list">
                {approachSteps.slice(0, 3).map((step) => (
                  <div key={step.title} className="marketing-stage-list-item">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note text-sm leading-7 text-slate-600">
              Trust zit hier in proceszekerheid: heldere rolverdeling, begeleide setup en een geloofwaardige uitleg van
              wanneer de eerste managementread echt bruikbaar wordt.
            </div>
            <div className="marketing-link-grid">
              <Link
                href="/producten"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
              <Link
                href="/vertrouwen"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk trustlaag
              </Link>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="plain">
          <div className="grid gap-5 lg:grid-cols-4">
            {approachSteps.map(({ title, body }) => (
              <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
              <SectionHeading
                eyebrow="Na akkoord"
                title="Wat de klant zelf doet en wat Verisight begeleidt."
                description="Zo blijft de handoff van sales naar delivery voorspelbaar: de klant levert input, Verisight beheert setup, importcontrole en activatie, en daarna start het eerste managementgebruik."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  'De klant bevestigt route, timing, doelgroep en contactpersoon.',
                  'Verisight zet organisatie en campaign op en controleert het respondentbestand.',
                  'Verisight start uitnodigingen en activeert daarna het juiste dashboard voor de klant.',
                  'De klant gebruikt dashboard en rapport voor de eerste managementread en het eerste vervolggesprek.',
                ].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Stap {index + 1}</p>
                    <p className="mt-3">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
              <SectionHeading
                eyebrow="Eerste waarde"
                title="Van eerste respons naar eerste managementread."
                description="Verisight verkoopt geen instant inzicht zonder responsbasis. Daarom hoort ook first value voorspelbaar en geloofwaardig te worden uitgelegd."
              />
              <div className="mt-8 grid gap-4">
                {[
                  'Na de eerste responses zie je dat de campaign op gang komt, maar lezen we nog terughoudend.',
                  'Vanaf ongeveer 5 responses ontstaat de eerste bruikbare detailweergave in dashboard en rapport.',
                  'Vanaf ongeveer 10 responses ontstaat een steviger patroonbeeld voor prioritering, managementduiding en eerste besluiten.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
              <SectionHeading
                eyebrow="Wat standaard inbegrepen is"
                title="Je koopt een route van scan-keuze tot rapportage."
                description="Geen losse tool en geen open eind aan consultancy-uren, maar een duidelijke productvorm met vaste output, expliciete leeswijzers en productspecifieke trustgrenzen."
              />
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      +
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {approachRoutes.map((route) => (
                <div key={route.title} className={`rounded-[2rem] border p-8 ${route.shellClass}`}>
                  <p className={`text-xs font-bold uppercase tracking-[0.22em] ${route.eyebrowClass}`}>{route.eyebrow}</p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-950">{route.title}</h2>
                  <p className={`mt-4 text-sm leading-7 ${route.bodyClass}`}>{route.body}</p>
                  <ul className={`mt-6 space-y-3 text-sm leading-7 ${route.bodyClass}`}>
                    {route.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel-soft p-8 md:p-10">
            <SectionHeading
              eyebrow="Customer lifecycle"
              title="De route stopt niet bij het rapport."
              description="De assisted aanpak moet ook duidelijk maken wat de eerste koop is, wanneer dezelfde route logisch terugkomt en wanneer een tweede product pas geloofwaardig wordt."
            />
            <div className="mt-10 grid gap-4 xl:grid-cols-5">
              {customerLifecycleStages.map((stage) => (
                <div key={stage.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">{stage.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{stage.body}</p>
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="dark">
          <div className="rounded-[2rem] border border-white/10 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
            <SectionHeading
              eyebrow="Proceszekerheid"
              title="Trust zit in de productvorm, niet in extra theater."
              description="Voor organisaties vanaf circa 200 medewerkers is niet alleen de analyse belangrijk, maar ook dat de route netjes, voorspelbaar, privacybewust en methodisch uitlegbaar blijft."
              light
            />
            <div className="mt-8">
              <TrustStrip items={trustItems} tone="dark" />
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Wil je bepalen welke vorm nu het best past?"
            body="In een kort gesprek bepalen we of jullie beter starten met ExitScan Baseline, RetentieScan Baseline of een combinatieroute, en wanneer een vervolgvorm of segment deep dive logisch wordt."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_callout' })}
            primaryLabel="Plan kennismaking"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
