import type { Metadata } from 'next'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Heldere tarieven voor een eerste route, met ruimte om later uit te breiden of te combineren.',
  alternates: { canonical: '/tarieven' },
}

const mainRoutes = [
  {
    name: 'ExitScan',
    price: 'Vanaf EUR 2.950',
    note: 'eerste traject',
    gets: 'Dashboard, samenvatting en rapport.',
    fit: 'Past als u wilt begrijpen waarom mensen vertrekken.',
  },
  {
    name: 'RetentieScan',
    price: 'Vanaf EUR 2.950',
    note: 'eerste traject',
    gets: 'Dashboard, samenvatting en rapport.',
    fit: 'Past als u eerder wilt zien waar behoud onder druk staat.',
  },
  {
    name: 'Onboarding 30-60-90',
    price: 'Op aanvraag',
    note: 'lifecycle-hoofdroute',
    gets: 'Dashboard, samenvatting en rapport.',
    fit: 'Past als de eerste vraag draait om de startfase van nieuwe medewerkers.',
  },
] as const

const lowerRoutes = [
  ['Pulse', 'Compacte vervolgstap na een eerste diagnose of actie.'],
  ['Leadership Scan', 'Verdieping op managementcontext na een bestaand signaal.'],
  ['Combinatie', 'Portfolioroute zodra twee echte managementvragen tegelijk spelen.'],
] as const

const faqItems = [
  {
    q: 'Is dit een licentie of seatmodel?',
    a: 'Nee. U start met een begeleide route, niet met een self-service licentie.',
  },
  {
    q: 'Waarom staat Onboarding 30-60-90 op aanvraag?',
    a: 'Omdat scope en checkpoint-opzet vaker afhangen van doelgroep en context.',
  },
  {
    q: 'Wanneer wordt Combinatie logisch?',
    a: 'Pas wanneer vertrekduiding en behoud tegelijk bestuurlijke aandacht vragen.',
  },
  {
    q: 'Waar vallen Pulse en Leadership onder?',
    a: 'Dat blijven lichtere vervolgroutes, niet de eerste stap.',
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
              Heldere tarieven voor een eerste route.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              U start met één duidelijke route. Uitbreiden of combineren kan later.
            </p>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Starten"
            title="Drie routes waarmee u kunt starten."
            description="Kies eerst de route die nu het duidelijkst past. Breder opzetten kan later nog."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mainRoutes.map((route) => (
              <div key={route.name} className="rounded-[1.08rem] border border-[#E5E0D6] bg-[#FFFCF7] p-8 md:p-9">
                <p className="text-[14px] font-medium text-[#132033]">{route.name}</p>
                <p className="mt-4 text-[2rem] font-medium tracking-[-0.04em] text-[#132033]">{route.price}</p>
                <p className="mt-1 text-[12.5px] uppercase tracking-[0.14em] text-[#667085]">{route.note}</p>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7A8698]">Wat u krijgt</p>
                    <p className="mt-1.5 text-[14px] leading-7 text-[#132033]">{route.gets}</p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7A8698]">Wanneer dit past</p>
                    <p className="mt-1.5 text-[14px] leading-7 text-[#4A5563]">{route.fit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="marketing-panel p-8 md:p-9">
              <SectionHeading
                eyebrow="Later uitbreiden"
                title="Begin klein. Breid later uit."
                description="Pulse en Leadership blijven lichtere vervolgstappen. Combinatie opent pas als twee echte vragen tegelijk op tafel liggen."
              />
              <div className="mt-8 grid gap-px overflow-hidden rounded-[1rem] border border-[#E5E0D6] bg-[#E5E0D6]">
                {lowerRoutes.map(([title, body]) => (
                  <div key={title} className="bg-[#FFFCF7] px-6 py-5">
                    <p className="text-[15px] font-medium text-[#132033]">{title}</p>
                    <p className="mt-2 text-[14px] leading-7 text-[#4A5563]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.08rem] border border-[rgba(255,255,255,0.08)] bg-[#132033] p-7 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9FD1CB]">Eerste stap</p>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,2.6vw,2.55rem)] text-white">
                Begin klein. Breid later uit.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-slate-300">
                Start met één route. Breid later uit als dat nodig is.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading eyebrow="Veelgestelde vragen" title="Wat u vooraf wilt weten." />
          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="bg-[#FFFCF7] p-7">
                <p className="text-[15.5px] font-medium text-[#132033]">{item.q}</p>
                <p className="mt-2 text-[14px] leading-7 text-[#4A5563]">{item.a}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Plan een kennismaking"
            body="Dan kijken we welke route het best past."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/producten"
            secondaryLabel="Bekijk producten"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
