import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Van eerste gesprek naar dashboard en rapport in enkele weken, via een vaste en begeleide route.',
  alternates: { canonical: '/aanpak' },
}

const steps = [
  {
    n: '01',
    t: 'Kennismaking',
    d: 'We bespreken welke route nu het best past en wat u van de eerste uitkomst wilt kunnen gebruiken.',
  },
  {
    n: '02',
    t: 'Inrichten',
    d: 'Verisight zet de route klaar, plant het moment en zorgt dat de uitvraag goed aansluit op de organisatie.',
  },
  {
    n: '03',
    t: 'Inzicht ophalen',
    d: 'We halen de signalen op en bouwen toe naar een leesbaar beeld dat op groepsniveau bruikbaar is.',
  },
  {
    n: '04',
    t: 'Bespreken wat eerst telt',
    d: 'Dashboard en rapport worden vertaald naar wat nu opvalt, wat eerst besproken moet worden en wat daarna logisch is.',
  },
] as const

const outputs = [
  {
    title: 'Dashboard',
    body: 'Een compact overzicht waarmee u snel ziet waar aandacht nodig is.',
  },
  {
    title: 'Samenvatting',
    body: 'Een korte managementread met wat opvalt en wat eerst telt.',
  },
  {
    title: 'Rapport',
    body: 'Een leesbaar document dat HR, MT en directie intern kunnen bespreken.',
  },
] as const

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
        theme="support"
        pageType="approach"
        ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_primary_cta' })}
        ctaLabel="Plan een kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Aanpak</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Van eerste gesprek naar dashboard en rapport in enkele weken.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              U doorloopt een vaste, begeleide route. Zo weet u snel waar u aan toe bent en wat u daarna in handen heeft.
            </p>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Vaste route"
            title="Zo loopt het traject."
            description="Kort, begeleid en gericht op wat u binnen enkele weken kunt gebruiken."
          />

          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n} className="relative rounded-[1.08rem] border border-[#E5E0D6] bg-[#FFFCF7] px-6 py-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">Stap {step.n}</p>
                <h2 className="mt-3 text-[1.18rem] font-medium tracking-[-0.02em] text-[#132033]">{step.t}</h2>
                <p className="mt-3 text-[14px] leading-7 text-[#4A5563]">{step.d}</p>
              </li>
            ))}
          </ol>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Uitkomst"
            title="Wat u daarna in handen heeft"
            description="Dit is waar de route op uitkomt: iets dat intern meteen bruikbaar is."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {outputs.map((output) => (
              <div
                key={output.title}
                className="rounded-[1.18rem] border border-[#DCEFEA] bg-[#F7FBFA] px-7 py-7 shadow-[0_28px_60px_-44px_rgba(19,32,51,0.24)]"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">{output.title}</p>
                <p className="mt-4 text-[1.22rem] font-medium tracking-[-0.03em] text-[#132033]">{output.title}</p>
                <p className="mt-3 text-[14px] leading-7 text-[#4A5563]">{output.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionHeading
              eyebrow="Werkwijze"
              title="Begeleid waar dat nodig is. Efficiënt waar dat kan."
              description="Verisight houdt het traject overzichtelijk: begeleiding bij de keuze en duiding, snelheid in de uitvoering."
            />

            <div className="rounded-[1.08rem] border border-[#E5E0D6] bg-[#FFFCF7] p-7 md:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#234B57]">Doorlooptijd</p>
              <p className="mt-3 text-[16px] leading-7 text-[#132033]">
                Een eerste route loopt vaak in <strong>enkele weken</strong> van kennismaking naar dashboard en rapport.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="rounded-[1.08rem] border border-[rgba(255,255,255,0.08)] bg-[#132033] p-8 text-[#F7F5F1] md:p-10">
            <h2 className="max-w-2xl text-[28px] leading-tight tracking-[-0.03em] md:text-[34px]">
              Eerst zien wat u krijgt?
            </h2>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/#voorbeeldoutput" className="marketing-button-primary">
                Bekijk voorbeeldoutput
              </Link>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Plan een kennismaking"
            body="Dan bespreken we wat voor uw situatie logisch is."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
