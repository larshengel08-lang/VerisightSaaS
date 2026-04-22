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
import {
  homepageCoreProductRoutes,
  homepagePortfolioRoute,
  productOverviewComparisonRows,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Producten',
  description:
    'Kies de route die past bij uw vraagstuk: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud en een bewuste portfolioroute voor combinatie of bounded vervolgstappen.',
  alternates: {
    canonical: '/producten',
  },
  openGraph: {
    title: 'Producten | Verisight',
    description:
      'Kies de route die past bij uw vraagstuk: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud en een bewuste portfolioroute voor combinatie of bounded vervolgstappen.',
    url: 'https://www.verisight.nl/producten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten | Verisight',
    description:
      'Kies de route die past bij uw vraagstuk: ExitScan voor vertrekduiding, RetentieScan voor vroegsignalering op behoud en een bewuste portfolioroute voor combinatie of bounded vervolgstappen.',
    images: ['/opengraph-image'],
  },
}

const followOnRoutes = [
  {
    title: 'Pulse',
    label: 'Vervolgroute',
    body: 'Compacte reviewroute na een eerdere managementread. Bedoeld voor bounded herijking, niet als derde brede instap.',
    href: '/producten/pulse',
  },
  {
    title: 'TeamScan',
    label: 'Lokalisatie',
    body: 'Bounded lokale verdieping nadat een breder signaal al zichtbaar is en een eerste lokale vraag openstaat.',
    href: '/producten/teamscan',
  },
  {
    title: 'Onboarding 30-60-90',
    label: 'Lifecycle-check',
    body: 'Gerichte assisted checkpointread voor vroege landing van nieuwe medewerkers wanneer die vraag echt centraal staat.',
    href: '/producten/onboarding-30-60-90',
  },
  {
    title: 'Leadership Scan',
    label: 'Managementcontext',
    body: 'Begrensde group-level managementread wanneer een bestaand people-signaal eerst duiding of verificatie in de leidingcontext vraagt.',
    href: '/producten/leadership-scan',
  },
] as const

const portfolioProofCards = [
  {
    title: 'Twee kernroutes, geen vlakke catalogus',
    body: 'De overview opent eerst ExitScan en RetentieScan als de twee buyer-facing kernroutes. Daarmee blijft de eerste koop helder.',
  },
  {
    title: 'Combinatie blijft een portfolioroute op aanvraag',
    body: 'Combinatie bestaat om twee kernroutes bewust te verbinden nadat de eerste route duidelijk is, niet om als derde kernproduct mee te wedgen.',
  },
  {
    title: 'Bounded vervolg blijft echt kleiner',
    body: 'Pulse, TeamScan, onboarding en Leadership Scan horen pas na een eerste managementread zichtbaar te worden als kleinere vervolglogica.',
  },
] as const

export default function ProductenPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.verisight.nl/producten' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <MarketingPageShell
        theme="combination"
        pageType="overview"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Portfolio-overzicht</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Kies eerst welke kernroute de managementvraag nu opent.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              ExitScan en RetentieScan blijven de twee buyer-facing kernroutes. Combinatie en bounded vervolgroutes
              horen pas daarna in beeld te komen, zodat deze pagina routekeuze ondersteunt zonder een platte
              productcatalogus te worden.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_hero_primary' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </Link>
              <Link
                href="/tarieven"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
              >
                Bekijk de prijsankers
              </Link>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">
                  Twee kernroutes eerst
                </span>
                <span className="marketing-chip-dark">Geen derde kernproduct</span>
              </div>
              {[
                ['ExitScan', 'Vertrekduiding, werkfactoren en bestuurlijke handoff'],
                ['RetentieScan', 'Vroegsignalering, groepsbeeld en managementprioriteiten'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-base font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                </div>
              ))}
              <div className="rounded-[1.2rem] border border-dashed border-white/20 bg-white/[0.03] px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">
                  {homepagePortfolioRoute.label}
                </p>
                <p className="mt-3 text-base font-semibold text-white">{homepagePortfolioRoute.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{homepagePortfolioRoute.body}</p>
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Kernroutes eerst</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Buyer-facing blijft Verisight draaien om ExitScan en RetentieScan als de twee eerste routekeuzes.
              </p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Wat later komt</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                Combinatie en bounded vervolgroutes volgen pas nadat de eerste managementvraag en eerste kooproute helder zijn.
              </p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Kernproducten"
            title="ExitScan en RetentieScan blijven de twee kernroutes van de eerste koop."
            description="De overview moet eerst laten zien welke managementvraag nu openligt. Daarom staan de twee kernroutes vooraan en wordt de eerste koop niet vlakgetrokken met kleinere vervolglogica."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {homepageCoreProductRoutes.map((route) => (
              <div key={route.name} className="marketing-route-card">
                <span className="marketing-chip">{route.chip}</span>
                <h2 className="mt-4 text-2xl font-semibold text-[#132033]">{route.name}</h2>
                <p className="mt-3 text-lg leading-8 text-[#132033]">{route.title}</p>
                <p className="mt-4 text-sm leading-7 text-[#4A5563]">{route.body}</p>
                <Link
                  href={route.href}
                  className="mt-6 inline-flex items-center rounded-full border border-[#E5E0D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#132033] transition-colors hover:border-[#3C8D8A]"
                >
                  Meer over {route.name}
                </Link>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Portfoliologica"
            title="Combinatie hoort pas na een heldere eerste route."
            description="Combinatie is een portfolioroute op aanvraag. De rol van deze laag is twee kernroutes bewust verbinden nadat de eerste route begrijpelijk is, niet om als zelfstandig kernproduct te lezen."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
                {homepagePortfolioRoute.label}
              </p>
              <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#132033]">
                {homepagePortfolioRoute.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4A5563]">{homepagePortfolioRoute.body}</p>
              <p className="mt-4 text-sm leading-7 text-[#4A5563]">
                Deze laag helpt alleen wanneer vertrekduiding en behoudsignalering bewust in dezelfde managementlijn
                moeten landen. Daardoor blijft Combinatie zichtbaar, maar ondergeschikt aan de eerste kooproute.
              </p>
              <Link
                href={homepagePortfolioRoute.href}
                className="mt-6 inline-flex items-center rounded-full border border-[#E5E0D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#132033] transition-colors hover:border-[#3C8D8A]"
              >
                Meer over Combinatie
              </Link>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Eerst kiezen, daarna verbinden
              </p>
              <div className="mt-4">
                <MarketingComparisonTable
                  columns={['Route', 'Rol', 'Managementvraag', 'Wanneer logisch']}
                  rows={productOverviewComparisonRows}
                />
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Bewuste vervolgroutes"
            title="Bounded vervolgroutes horen na de eerste managementread."
            description="Pulse, TeamScan, onboarding en Leadership Scan zijn geen extra wedge-producten naast ExitScan en RetentieScan. Ze bestaan om het vervolg kleiner, gerichter en bestuurlijk logisch te houden."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {followOnRoutes.map((route) => (
              <div key={route.title} className="marketing-feature-card">
                <span className="marketing-chip">{route.label}</span>
                <h3 className="mt-4 text-xl font-semibold text-[#132033]">{route.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{route.body}</p>
                <Link href={route.href} className="mt-5 inline-flex text-sm font-semibold text-[#3C8D8A] hover:text-[#132033]">
                  Meer over {route.title}
                </Link>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Portfolio-proof"
            title="De portfoliohiërarchie moet ook publiek geloofwaardig blijven."
            description="Deze overview moet dezelfde waarheid vertellen als homepage, pricing en trust: twee kernroutes eerst, portfolioroute bewust later en bounded vervolglogica zichtbaar kleiner."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {portfolioProofCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <MarketingCalloutBand
            eyebrow="Route-inschatting"
            title="Twijfelt u welke route nu eerst telt?"
            body="In een eerste gesprek bepalen we welke kernroute nu logisch is, hoe de productvorm eruitziet en welke combinatie- of vervolgstap bewust later moet blijven."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'products_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/vertrouwen"
            secondaryLabel="Lees trust en privacy"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
