import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  approachSteps,
  homepageComparisonRows,
  homepageProductRoutes,
  homepageProofSignals,
  homepageUtilityLinks,
  trustItems,
  faqSchema,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'ExitScan en RetentieScan voor HR-teams',
  description:
    'Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen aandacht vragen, zodat prioriteiten duidelijk worden.',
  alternates: {
    canonical: '/',
  },
}

const heroSignals = [
  ['Kernproducten', '2 scans', 'ExitScan en RetentieScan blijven de eerste route'],
  ['Managementoutput', '1 leeslijn', 'Dashboard, rapport en bestuurlijke handoff sluiten op elkaar aan'],
  ['Eerste waarde', 'Binnen weken', 'Van intake naar eerste managementread in een begeleide productvorm'],
] as const

const problemCards = [
  {
    title: 'Vertreksignalen komen versnipperd binnen',
    body: 'Gesprekken, anekdotes en losse exitsignalen bestaan wel, maar leveren nog geen bestuurlijk patroon op.',
  },
  {
    title: 'Behoudsdruk wordt vaak te laat scherp',
    body: 'Zonder vroeg groepsbeeld verschuift de managementreactie naar incidenten in plaats van prioriteiten.',
  },
  {
    title: 'MT wil richting, geen losse survey-output',
    body: 'Het verschil zit niet alleen in meten, maar in hoe rapport, dashboard en eerste acties in dezelfde taal landen.',
  },
] as const

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight | ExitScan en RetentieScan voor HR-teams',
    description:
      'Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen aandacht vragen, zodat prioriteiten duidelijk worden.',
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
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Exit- en retentie-analyse</p>
            <h1 className="marketing-hero-title marketing-hero-title-home font-display text-[#132033]">
              Krijg scherper zicht op vertrek, behoud en de eerste logische managementroute.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight helpt HR en management scherp zien welke patronen spelen, waar gerichte actie logisch wordt en
              welke eerste productroute nu het meeste bestuurlijke rendement geeft.
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
                Bekijk de productroutes
              </Link>
            </div>
            <div className="marketing-pill-stack">
              <span className="marketing-chip">2 kernproducten</span>
              <span className="marketing-chip">1 bewuste portfolioroute</span>
              <span className="marketing-chip">Voor organisaties met 200+ medewerkers</span>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">
                  Product-led management preview
                </span>
                <span className="marketing-chip-dark">Boardroom-waardige output</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroSignals.map(([label, value, detail]) => (
                  <div key={label} className="marketing-stat-card">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-3 text-[clamp(1.4rem,3vw,2.1rem)] font-semibold text-white">{value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">
                  Welke managementroute past nu het best?
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ['ExitScan', 'Waarom vertrekken mensen en waar zit beinvloedbare frictie?', 'Eerste route'],
                    ['RetentieScan', 'Waar staat behoud nu onder druk in de actieve populatie?', 'Specifieke route'],
                    ['Combinatie', 'Wanneer beide managementvragen tegelijk echt centraal staan.', 'Pas daarna'],
                  ].map(([title, body, tag]) => (
                    <div
                      key={title}
                      className="flex flex-col gap-2 rounded-[1.15rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
                      </div>
                      <span className="marketing-chip-dark whitespace-nowrap">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            {homepageUtilityLinks.slice(0, 2).map((link) => (
              <Link key={link.href} href={link.href} className="marketing-link-card transition-colors hover:border-[#3C8D8A]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Snelle route</p>
                <p className="mt-2 text-base font-semibold text-[#132033]">{link.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#4A5563]">{link.body}</p>
              </Link>
            ))}
          </MarketingHeroSupport>
        }
      >
        <div id="hoofdinhoud">
          <MarketingSection tone="plain">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <div>
                <div className="marketing-divider-title">Waarom deze scans bestaan</div>
                <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.05] tracking-[-0.03em] text-[#132033]">
                  Het probleem is zelden het ontbreken van signalen, maar het ontbreken van een leesbare lijn.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {problemCards.map((card) => (
                  <div key={card.title} className="marketing-feature-card">
                    <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="dark">
            <SectionHeading
              eyebrow="Productkeuze en portfolioroute"
              title="Begin met de route die de bestuurlijke vraag echt opent."
              description="ExitScan en RetentieScan blijven de twee kernproducten. De combinatie en vervolgroutes bestaan, maar openen pas wanneer de eerste managementvraag helder is."
              light
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {homepageProductRoutes.map((route) => (
                <div key={route.name} className="marketing-route-card-dark">
                  <span className="marketing-chip-dark">{route.chip}</span>
                  <h3 className="mt-4 text-2xl font-semibold text-[#F7F5F1]">{route.name}</h3>
                  <p className="mt-3 text-lg leading-8 text-white/90">{route.title}</p>
                  <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.68)]">{route.body}</p>
                  <Link
                    href={route.href}
                    className="mt-6 inline-flex items-center rounded-full border border-[rgba(247,245,241,0.12)] bg-white px-5 py-2.5 text-sm font-semibold text-[#132033] transition-colors hover:bg-[#F7F5F1]"
                  >
                    Meer over {route.name}
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.75rem] border border-[rgba(247,245,241,0.12)] bg-[rgba(247,245,241,0.06)] p-6 md:p-7">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Vervolgroutes blijven bounded</p>
              <p className="mt-3 max-w-[64ch] text-sm leading-7 text-[rgba(247,245,241,0.72)]">
                Pulse, TeamScan en onboarding blijven bewust kleinere vervolgroutes. Zo blijft de eerste koop scherp,
                de eerste managementread duidelijk en de volgende stap kleiner dan een nieuwe brede meting.
              </p>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Waarom de output bestuurlijk werkt"
              title="Geen rapport-export in webvorm, maar een gedeelde managementleeslijn."
              description="Verisight koppelt dashboard, rapport en eerste managementroute aan dezelfde executive volgorde. Daardoor is de uitkomst intern makkelijker te bespreken en commercieel beter te plaatsen."
            />
            <div className="mt-10">
              <MarketingProofStrip
                items={homepageProofSignals.map((signal) => ({
                  title: signal,
                  body: 'Dezelfde managementlogica keert terug in dashboard, rapport, sample preview en eerste gesprek.',
                }))}
              />
            </div>
            <div className="marketing-proof-frame mt-10 p-5 md:p-7">
              <PreviewSlider variant="portfolio" />
            </div>
            <div className="mt-8">
              <PreviewEvidenceRail variant="portfolio" />
            </div>
          </MarketingSection>

          <MarketingSection tone="tint">
            <div className="grid gap-10 xl:grid-cols-[0.88fr_1.12fr]">
              <div>
                <SectionHeading
                  eyebrow="Hoe de route verloopt"
                  title="Van routekeuze naar eerste managementwaarde in een begeleide productvorm."
                  description="De aanpak is strak genoeg voor tempo, maar expliciet genoeg voor vertrouwen, eigenaarschap en privacy."
                />
                <div className="mt-8">
                  <MarketingCalloutBand
                    eyebrow="Conversie zonder drukte"
                    title="Eerst routekeuze, dan pas de rest van de inrichting."
                    body="We gebruiken het eerste gesprek om managementvraag, productvorm, timing en privacygrenzen te duiden. Niet om alles tegelijk te verkopen."
                    primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_mid_callout' })}
                    primaryLabel="Plan een kennismaking"
                    secondaryHref="/aanpak"
                    secondaryLabel="Bekijk de aanpak"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {approachSteps.slice(0, 6).map(({ title, body }) => (
                  <div key={title} className="marketing-process-card">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                      {title.split('.')[0].trim()}
                    </p>
                    <h3 className="mt-4 text-lg font-semibold text-[#132033]">{title.replace(/^\d+\.\s*/, '')}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#4A5563]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Trust en begrenzing"
              title="Bruikbare stuurinformatie, met heldere methodische en privacygrenzen."
              description="Verisight verkoopt geen schijnzekerheid. De site moet dus net zo gecontroleerd uitleggen wat management wel en niet uit de output mag lezen."
            />
            <div className="mt-10">
              <MarketingComparisonTable
                columns={['Managementvraag', 'Route', 'Wat u krijgt']}
                rows={homepageComparisonRows}
              />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {trustItems.map((item) => (
                <div key={item} className="marketing-feature-card">
                  <p className="text-sm leading-7 text-[#4A5563]">{item}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div className="space-y-8">
              <div className="max-w-3xl">
                <SectionHeading
                  eyebrow="Kennismaking"
                  title="Vertel kort welke managementvraag nu speelt."
                  description="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs. Het gesprek begint bij de eerste route, niet bij een open implementatielijst."
                />
              </div>
              <MarketingInlineContactPanel
                eyebrow="Plan kennismaking"
                title="Van eerste vraag naar een heldere route-inschatting."
                body="Gebruik dit formulier voor ExitScan, RetentieScan of de combinatieroute. We helpen eerst bepalen welk kernproduct en welke eerste productroute logisch zijn, en pas daarna hoe intake, uitvoering, livegang en eerste waarde eruit moeten zien."
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
