import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingHeroIntro } from '@/components/marketing/marketing-hero'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Methodologische helderheid, privacy by design en groepsgewijze rapportage. Hoe Verisight zorgvuldig omgaat met mensen en data.',
  alternates: { canonical: '/vertrouwen' },
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3.5V12c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6.5L12 3Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a3 3 0 0 1 0 5.74" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M6 16V9" />
      <path d="M12 16V5" />
      <path d="M18 16v-6" />
      <path d="m5.5 10.5 5-4 3.5 2 4.5-3" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M7 7h10" />
      <path d="m7 7-3 5h6l-3-5Z" />
      <path d="m17 7-3 5h6l-3-5Z" />
      <path d="M5 21h14" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

const pillars = [
  {
    title: 'Privacy by design',
    body: 'Antwoorden zijn herleidbaar tot groep, nooit tot persoon. Kleine teams blijven afgeschermd als anonimiteit niet goed geborgd kan worden.',
    icon: ShieldIcon,
  },
  {
    title: 'Groepsgewijze rapportage',
    body: 'Rapportages werken op team-, afdelings- of organisatieniveau. Individuele antwoorden gaan niet terug naar leidinggevenden of HR.',
    icon: UsersIcon,
  },
  {
    title: 'Methodologisch onderbouwd',
    body: 'Vragen, weging en duiding zijn gebaseerd op relevante kennis rond vertrek, behoud en betrokkenheid.',
    icon: ChartIcon,
  },
  {
    title: 'Interpretatie met grenzen',
    body: 'We rapporteren wat de data laat zien en zijn expliciet over wat het niet laat zien. Geen schijnzekerheid rond kleine verschillen.',
    icon: ScaleIcon,
  },
  {
    title: 'Transparantie naar medewerkers',
    body: 'Medewerkers zien waarom een scan loopt, wat er met antwoorden gebeurt en op welk niveau wordt teruggekoppeld.',
    icon: EyeIcon,
  },
  {
    title: 'Veilige verwerking',
    body: 'Data wordt veilig verwerkt binnen de EU, conform AVG. We delen geen ruwe data met derden.',
    icon: LockIcon,
  },
] as const

export default function VertrouwenPage() {
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
            <p className="marketing-hero-eyebrow text-[#3C8D8A]">Vertrouwen en methodiek</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[#132033]">
              Zorgvuldig met mensen, helder voor management.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Een people-insight product is alleen iets waard als het binnen de organisatie wordt vertrouwd. Daarom
              zijn privacy, rapportgrenzen en methodiek geen bijlage, maar het fundament.
            </p>
          </MarketingHeroIntro>
        }
      >
        <MarketingSection tone="tint">
          <div className="grid gap-px overflow-hidden rounded-[1.08rem] border border-[#E5E0D6] bg-[#E5E0D6] md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-[#FFFCF7] p-8">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[0.58rem] border border-[#E5E0D6] bg-[#EEF7F3] text-[#132033]">
                  <pillar.icon />
                </div>
                <h2 className="mt-5 text-[18px] font-medium text-[#132033]">{pillar.title}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#4A5563]">{pillar.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-10 md:grid-cols-2">
            <SectionHeading
              eyebrow="Methodologische uitgangspunten"
              title="Wat u hiervan wel en niet mag verwachten."
            />
            <div className="space-y-6 text-[15px] leading-relaxed text-[#4A5563]">
              <p>
                <strong className="text-[#132033]">Wat de scan goed kan:</strong> patronen zichtbaar maken,
                prioriteiten ordenen en gespreksstof leveren voor HR, MT en teamleads.
              </p>
              <p>
                <strong className="text-[#132033]">Wat de scan niet doet:</strong> individuele beoordelingen
                vervangen, voorspellingen op persoonsniveau doen of besluiten nemen die om menselijk oordeel vragen.
              </p>
              <p>
                We zijn expliciet over deze grenzen in elk rapport, omdat dat het verschil maakt tussen een bruikbaar
                managementinstrument en een data-experiment.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel-soft p-10 md:p-12">
            <h2 className="max-w-2xl text-[28px] leading-tight text-[#132033] md:text-[36px]">
              Ook geschikt om samen met OR, privacy of security door te nemen.
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-[#4A5563]">
              Dat doen we vaker. We nemen graag de tijd om methode en privacy-aanpak rustig door te nemen, voordat er
              ook maar een vraag wordt uitgestuurd.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_cta_primary' })} className="marketing-button-primary">
                Plan een kennismaking
              </Link>
              <Link href="/aanpak" className="marketing-button-secondary">
                Bekijk de aanpak
              </Link>
            </div>
          </div>
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
