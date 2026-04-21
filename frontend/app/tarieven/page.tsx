import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  included,
  pricingAddOns,
  pricingCards,
  pricingFollowOnRoutes,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Transparante prijsankers voor de eerste kooproute en rust in de vervolgstappen. ExitScan en RetentieScan blijven de twee kernankers; bounded vervolglogica volgt pas daarna.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Transparante prijsankers voor de eerste kooproute en rust in de vervolgstappen. ExitScan en RetentieScan blijven de twee kernankers; bounded vervolglogica volgt pas daarna.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Transparante prijsankers voor de eerste kooproute en rust in de vervolgstappen. ExitScan en RetentieScan blijven de twee kernankers; bounded vervolglogica volgt pas daarna.',
    images: ['/opengraph-image'],
  },
}

const coreAnchorNotes = [
  {
    title: 'ExitScan baseline',
    focus: 'De standaard eerste koop wanneer vertrekduiding nu het echte startpunt is.',
  },
  {
    title: 'RetentieScan baseline',
    focus: 'De eerste koop wanneer behoudsdruk in de actieve populatie eerder zichtbaar moet worden.',
  },
] as const

const buyingCalmCards = [
  {
    title: 'Geen licenties of vlakke planmatrix',
    body: 'Verisight wordt geprijsd als begeleide productroute met vaste output, niet als generieke seats, tiers of alles-in-een bundels.',
  },
  {
    title: 'Eerst de kernroute, dan pas vervolg',
    body: 'De eerste offerte moet vooral duidelijk maken welke kernroute nu logisch is. Combinatie, ritmeroutes en bounded vervolgwerk blijven ondergeschikt aan die eerste keuze.',
  },
  {
    title: 'Scope voor kooprust',
    body: 'Prijsrust ontstaat wanneer scope, deliverables en verwachtingen expliciet zijn. Niet wanneer alle routes commercieel gelijk worden getrokken.',
  },
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
              Transparante prijsankers voor de eerste kooproute en rust in de vervolgstappen.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              U koopt een gerichte eerste route met vaste output, geen licentie of vlakke planmatrix. ExitScan en RetentieScan blijven de twee kernankers; bounded vervolglogica volgt pas daarna.
            </p>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="grid gap-4 sm:grid-cols-2">
              {pricingCards.map((item) => (
                <div key={item.eyebrow} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">
                    {item.eyebrow}
                  </p>
                  <p className="mt-3 text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-white">{item.price}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Geen licenties
              </p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Elke route heeft een heldere scope per traject, niet per seat of softwarepakket.
              </p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Bounded blijft kleiner
              </p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Vervolg- en supportroutes blijven bewust kleiner dan een nieuwe eerste kerninstap.
              </p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Kernankers"
            title="De eerste koop blijft helder met twee kernankers."
            description="ExitScan en RetentieScan zijn de twee buyer-facing kernproducten. De pricingpagina moet de eerste route verduidelijken, niet het hele portfolio commercieel gelijk trekken."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {pricingCards.map((item, index) => (
              <div key={item.eyebrow} className="marketing-route-card">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
                  {item.eyebrow}
                </p>
                <p className="mt-4 text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.03em] text-[#132033]">
                  {item.price}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{item.description}</p>
                <div className="mt-5 rounded-[1.15rem] border border-[#E5E0D6] bg-[#F7F5F1] px-4 py-4">
                  <p className="text-sm font-semibold text-[#132033]">{coreAnchorNotes[index]?.focus}</p>
                </div>
                <div className="mt-5 space-y-2">
                  {item.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-3 text-sm leading-7 text-[#4A5563]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
                <Link
                  href={index === 0 ? '/producten/exitscan' : '/producten/retentiescan'}
                  className="mt-6 inline-flex text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]"
                >
                  Meer over deze route
                </Link>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Inbegrepen scope"
            title="Wat in het eerste traject inbegrepen is."
            description="De eerste prijsankers horen bij een begeleide productvorm met setup, dashboard, rapport, bestuurlijke handoff en uitleg. Niet bij een kale survey of losse softwarelaag."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {included.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[#4A5563]">{item}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Vervolg en add-ons"
            title="Bounded vervolglogica komt pas na de eerste kooproute."
            description="Ritmeroutes, segment deep dive en andere bounded vervolgvormen bestaan publiek, maar horen pas in beeld te komen nadat de eerste kernroute en baseline logisch zijn geworden."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pricingFollowOnRoutes.map((route) => (
              <div key={route.title} className="marketing-feature-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[#132033]">{route.title}</p>
                    <p className="mt-1 text-sm font-medium text-[#3C8D8A]">{route.fit}</p>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4A5563]">{route.price}</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#4A5563]">{route.description}</p>
                <div className="mt-4 space-y-2">
                  {route.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-3 text-sm leading-7 text-[#4A5563]"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pricingAddOns.map(([title, price, body]) => (
              <div key={title} className="rounded-[1.25rem] border border-[#D7D2C6] bg-white px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-semibold text-[#132033]">{title}</p>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4A5563]">{price}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Kooprust"
            title="Prijsrust komt uit scope, niet uit pakket-theater."
            description="De pricinglaag moet helpen om een eerste traject kleiner, helderder en beter verdedigbaar te maken. Niet om ieder vervolgspoor al als gelijkwaardige instap mee te verkopen."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {buyingCalmCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <MarketingCalloutBand
            eyebrow="Prijs in context"
            title="Twijfelt u welke eerste route commercieel en inhoudelijk past?"
            body="Gebruik het kennismakingsgesprek om eerst de kernroute, timing en scope logisch te bepalen. Pas daarna kijken we of een combinatie of bounded vervolgvorm echt nodig is."
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
