import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  trustHubAnswerCards,
  trustItems,
  trustQuickLinks,
  trustReadingRows,
  trustSupportCards,
  trustVerificationCards,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Methodiek, privacy en rapportlezing van Verisight. Publieke due-diligence laag met heldere claimsgrenzen voor de buyer-facing kernroutes.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Publieke due-diligence laag met heldere claimsgrenzen voor de buyer-facing kernroutes.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Publieke due-diligence laag met heldere claimsgrenzen voor de buyer-facing kernroutes.',
    images: ['/opengraph-image'],
  },
}

export default function VertrouwenPage() {
  const privacyAnswerCards = trustHubAnswerCards.filter((card) =>
    ['Waar draait de data?', 'Wat ziet management precies?', 'Hoe voorkom je schijnprecisie?'].includes(card.title),
  )
  const supportAnswerCards = trustHubAnswerCards.filter((card) =>
    [
      'Welke juridische basis is publiek beschikbaar?',
      'Wat voor productvorm koop je?',
      'Heeft elke route een publiek voorbeeldrapport?',
    ].includes(card.title),
  )

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Vertrouwen', item: 'https://www.verisight.nl/vertrouwen' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <MarketingPageShell
        theme="support"
        pageType="support"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[var(--teal)]">Vertrouwen</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[var(--ink)]">
              Methodiek, privacy en rapportgrenzen in gewone managementtaal.
            </h1>
            <p className="marketing-hero-copy text-[var(--text)]">
              Verisight laat publiek zien hoe methodiek, privacy, rapportlezing en formele basis zijn ingericht nadat
              de routevraag al helder is. Deze trustlaag helpt een buyer toetsen wat de output wel en niet belooft,
              zonder van vertrouwen een nieuwe route- of prijspagina te maken.
            </p>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="space-y-4">
              <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">
                Due diligence na productfit
              </span>
              {trustItems.slice(0, 4).map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            {trustQuickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="marketing-link-card transition-colors hover:border-[#3C8D8A]"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Publieke basis
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--ink)]">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text)]">{link.body}</p>
              </Link>
            ))}
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Wat deze pagina wel en niet doet"
            title="Deze pagina bevestigt grenzen, geen nieuwe route of prijs."
            description="Gebruik deze trustlaag om publiek te toetsen wat Verisight wel en niet claimt. Dit is due diligence na productfit, geen nieuwe routekeuze of prijsvergelijking."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustVerificationCards.map((item) => (
              <div key={item.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[var(--ink)]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{item.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                Privacy en datamodel
              </p>
              <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[var(--ink)]">
                Privacy en zorgvuldigheid moeten publiek toetsbaar zijn voordat een traject start.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text)]">
                De trustlaag maakt zichtbaar hoe Verisight met groepsinzichten, minimale n-grenzen en terughoudende
                rapportlezing omgaat. Zo wordt privacy geen losse bijlage, maar een controleerbaar onderdeel van de
                productvorm.
              </p>
              <div className="mt-4 space-y-3">
                {privacyAnswerCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[1.15rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                  >
                    <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text)]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">
                Zorgvuldige interpretatie
              </p>
              <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
                Bruikbare inzichten, zonder schijnzekerheid.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
                Verisight werkt met geaggregeerde uitkomsten en benoemt bewust wat wel en niet geconcludeerd kan
                worden. Deze trustlaag bevestigt de zorgvuldigheid achter de bestaande routes, zonder die routes hier
                opnieuw open te trekken.
              </p>
              <div className="mt-6 space-y-3">
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-[rgba(247,245,241,0.82)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Hoe u de output leest"
            title="Lees dashboard en rapport als managementduiding, niet als diagnose."
            description="De publieke reading guide moet dezelfde interpretatiegrenzen laten zien als rapport en dashboard, zodat management weet wat wel bruikbaar is en wat niet."
          />
          <div className="mt-10">
            <MarketingComparisonTable
              columns={['Thema', 'Wat u wel ziet', 'Wat u er niet van moet maken']}
              rows={trustReadingRows}
            />
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Formele basis en support"
            title="De formele basis moet de trustlaag kunnen dragen."
            description="Privacybeleid, DPA, voorwaarden en productvorm moeten publiek beschikbaar zijn om due diligence te ondersteunen, zonder dat deze pagina zelf een nieuwe commerciele ingang wordt."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {supportAnswerCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {trustSupportCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="marketing-feature-card transition-colors hover:border-[#3C8D8A]"
              >
                <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--teal)]">Bekijken</p>
              </Link>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Wilt u de trustbasis toetsen naast uw gekozen route?"
            body="Gebruik deze pagina als publieke basis voor methodiek, privacy en rapportlezing. In een kort gesprek toetsen we daarna of de al gekozen route klopt met uw managementvraag, timing en due-diligence eisen."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/privacy"
            secondaryLabel="Bekijk privacybeleid"
          />
        </MarketingSection>

        <MarketingSection tone="surface">
          <MarketingInlineContactPanel
            eyebrow="Plan kennismaking"
            title="Vertel kort welke due-diligencevraag nu speelt."
            body="In circa 20 minuten krijgt u helderheid over methodiek, privacy, rapportlezing en de fit tussen uw managementvraag en de al gekozen route."
            defaultRouteInterest="exitscan"
            defaultCtaSource="trust_form"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
