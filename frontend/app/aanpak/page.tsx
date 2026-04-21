import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Van intake tot eerste actie: de Verisight-aanpak in een vaste route met voorspelbare doorlooptijd.',
  alternates: { canonical: '/aanpak' },
}

const steps = [
  {
    n: '01',
    t: 'Intake',
    d: 'We bepalen samen de vraag, scope en doelgroep. Wat moet het rapport het management laten doen?',
    result: 'Vraag en scope zijn scherp.',
  },
  {
    n: '02',
    t: 'Setup',
    d: 'Verisight zet de route klaar, inclusief planning, uitnodiging en aansluiting op het HR-proces.',
    result: 'Uitvraag staat klaar.',
  },
  {
    n: '03',
    t: 'Datacollectie',
    d: 'Begeleide uitvraag met aandacht voor respons, anonimiteit en het juiste moment in het jaar.',
    result: 'Respons bouwt gecontroleerd op.',
  },
  {
    n: '04',
    t: 'Analyse en rapportage',
    d: 'We duiden patronen in managementtaal: wat speelt, waarom telt dit en wat eerst te doen.',
    result: 'Rapport en dashboard zijn leesbaar.',
  },
  {
    n: '05',
    t: 'Eerste actie',
    d: 'In een gesprek vertalen we prioriteiten naar concrete vervolgstappen en eigenaarschap.',
    result: 'Er ligt een eerste agenda.',
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
              Een vaste route, ondersteund door software en begeleiding.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight beweegt richting een SaaS-hybride model, maar de commerciële kern blijft begeleid: een vaste
              route, een aanspreekpunt en een voorspelbare doorlooptijd in plaats van een open traject.
            </p>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Vaste route"
            title="Zo loopt een traject van intake tot eerste actie."
            description="De tooling versnelt voorbereiding, uitvraag en rapportopbouw. De begeleiding blijft zichtbaar in intake, duiding en de eerste managementactie."
          />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6]">
            {steps.map((step) => (
              <li
                key={step.n}
                className="grid gap-6 bg-[#FFFCF7] p-7 md:grid-cols-12 md:items-start"
              >
                <div className="md:col-span-2">
                  <p className="text-[12px] font-medium tracking-[0.16em] text-[#3C8D8A]">STAP {step.n}</p>
                  <p className="mt-2 text-[20px] font-medium text-[#132033]">{step.t}</p>
                </div>
                <p className="text-[15px] leading-relaxed text-[#4A5563] md:col-span-7">{step.d}</p>
                <div className="md:col-span-3 md:border-l md:border-[#E5E0D6] md:pl-6">
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#234B57]">Resultaat</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#132033]">{step.result}</p>
                </div>
              </li>
            ))}
          </ol>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-10 md:grid-cols-2">
            <SectionHeading
              eyebrow="SaaS-hybride"
              title="Software waar het sneller kan, begeleiding waar het verschil maakt."
              description="Zo blijft de ervaring lichter dan consultancy, maar zwaarder en bruikbaarder dan een self-service tool."
            />
            <div className="marketing-panel-soft p-7">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#234B57]">Doorlooptijd</p>
              <p className="mt-3 text-[17px] leading-relaxed text-[#132033]">
                Een eerste scan loopt doorgaans in <strong>3 tot 4 weken</strong> van intake tot bespreking.
                Programma&apos;s lopen langer door, maar blijven in dezelfde ritmiek.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel-dark p-10 text-[#F7F5F1] md:p-12">
            <h2 className="max-w-2xl text-[28px] leading-tight md:text-[36px]">
              Liever eerst zien hoe output eruitziet dan lang over proces praten?
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_report_cta' })} className="marketing-button-primary">
                Vraag voorbeeldrapport aan
              </Link>
            </div>
          </div>
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
