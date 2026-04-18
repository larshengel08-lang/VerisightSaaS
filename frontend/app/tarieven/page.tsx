import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450 en bounded vervolgroutes alleen wanneer die echt logisch worden.',
    images: ['/opengraph-image'],
  },
}

const corePricing = [
  {
    label: 'ExitScan retrospectief',
    price: 'EUR 2.950',
    body: 'De standaard eerste instap voor een betrouwbaar organisatiebeeld en een professioneel managementrapport over uitstroom.',
    bullets: [
      'Inrichting exit-campagne en respondentflow',
      'Dashboard en managementrapport',
      'Toelichting op de uitkomsten',
      'Bestuurlijke handoff inbegrepen',
    ],
    href: '/producten/exitscan',
  },
  {
    label: 'RetentieScan momentopname',
    price: 'EUR 3.450',
    body: 'Gerichte baseline om behoudsdruk eerder zichtbaar te maken, met extra nadruk op privacy en groepsduiding.',
    bullets: [
      'Retentiesignaal, stay-intent en vertrekintentie',
      'Dashboard en managementrapport',
      'Gerichte managementduiding',
      'Geen individuele signalen naar management',
    ],
    href: '/producten/retentiescan',
  },
] as const

const comparisonRows = [
  ['ExitScan live', 'Op aanvraag', 'Logisch vervolg na eerste retrospectieve analyse wanneer proces en eigenaarschap al staan.'],
  ['RetentieScan live', 'Op aanvraag', 'Doorlopende route wanneer vroegsignalering structureel onderdeel van de managementcyclus wordt.'],
  ['Segment Deep Dive', 'EUR 950', 'Extra segmentanalyse als metadata en minimale respondentengroep dat dragen.'],
  ['Pulse', 'Op aanvraag', 'Compacte reviewlaag na een eerste kernroute of baseline, geen nieuwe eerste instap.'],
  ['TeamScan', 'Op aanvraag', 'Bounded lokale verdieping nadat een breder signaal al zichtbaar is.'],
  ['Onboarding 30-60-90', 'Op aanvraag', 'Gerichte lifecycle-check wanneer vroege landing van nieuwe medewerkers centraal staat.'],
  ['Leadership Scan', 'Op aanvraag', 'Begrensde managementread nadat een bestaand people-signaal eerst duiding of verificatie vraagt.'],
] as const

export default function TarievenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Tarieven', item: 'https://www.verisight.nl/tarieven' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <MarketingPageShell
        theme="support"
        pageType="pricing"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Tarieven</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Transparante prijsankers, heldere scope en bewuste vervolgroutes.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              U koopt een gerichte route met vaste output, geen licentie. ExitScan en RetentieScan vormen de twee
              kerninstappen; combinatie en bounded vervolgtrajecten openen alleen als ze inhoudelijk echt logisch zijn.
            </p>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="grid gap-4 sm:grid-cols-2">
              {corePricing.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">{item.label}</p>
                  <p className="mt-3 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-white">{item.price}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Geen licenties</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">Elke route heeft een heldere scope per traject.</p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Geen prijs theater</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">Quote-only routes blijven bewust kleiner dan een nieuwe brede instap of vlakke routecatalogus.</p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Kernproducten"
            title="De eerste koop blijft helder."
            description="ExitScan en RetentieScan zijn de twee buyer-facing kernproducten. De prijsopbouw is bedoeld om de eerste route duidelijk te houden, niet om het portfolio kunstmatig op te blazen."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {corePricing.map((item) => (
              <div key={item.label} className="marketing-route-card">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">{item.label}</p>
                <p className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.03em] text-[#132033]">{item.price}</p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{item.body}</p>
                <div className="mt-5 space-y-2">
                  {item.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-[1.15rem] border border-[#E5E0D6] bg-[#F7F5F1] px-4 py-3 text-sm leading-7 text-[#4A5563]">
                      {bullet}
                    </div>
                  ))}
                </div>
                <Link href={item.href} className="mt-6 inline-flex text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]">
                  Meer over deze route
                </Link>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Vervolg en add-ons"
            title="Kleinere routes na de eerste kernroute."
            description="De vervolglaag blijft bewust bounded. Zo blijven vervolgprijzen logisch in verhouding tot de eerste managementvraag en niet gelijkgeschakeld aan de kerninstap."
          />
          <div className="mt-10">
            <MarketingComparisonTable
              columns={['Route', 'Prijsanker', 'Wanneer logisch']}
              rows={comparisonRows}
            />
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <MarketingCalloutBand
            eyebrow="Prijs in context"
            title="Twijfelt u welke eerste route commercieel en inhoudelijk het best past?"
            body="Gebruik het kennismakingsgesprek om eerst de kernroute, timing en privacygrenzen logisch te bepalen. Pas daarna kijken we of een combinatie of bounded vervolgvorm echt nodig is. Zo blijft de offerte kleiner, helderder en beter verdedigbaar."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/aanpak"
            secondaryLabel="Bekijk de aanpak"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
