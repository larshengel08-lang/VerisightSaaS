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
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { approachSteps, included } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Van eerste gesprek tot bruikbare output zonder los implementatietraject. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
  alternates: { canonical: '/aanpak' },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Van eerste gesprek tot bruikbare output zonder los implementatietraject. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    url: 'https://www.verisight.nl/aanpak',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Van eerste gesprek tot bruikbare output zonder los implementatietraject. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    images: ['/opengraph-image'],
  },
}

const routeFitCards = [
  {
    title: 'Na routebegrip, niet in plaats daarvan',
    body: 'Deze pagina helpt wanneer ExitScan of RetentieScan inhoudelijk al logisch voelt en u vooral wilt weten hoe het traject loopt, wat het vraagt en wanneer de eerste managementread komt.',
  },
  {
    title: 'Proces, timing en eigenaarschap',
    body: 'U hoeft hier geen productvergelijking meer te maken. De vraag is nu hoe intake, inrichting, uitvoering en handoff voorspelbaar genoeg worden voor planning en besluitvorming.',
  },
  {
    title: 'Geen losse surveytool',
    body: 'Verisight regelt setup, uitnodigingen, dashboard en rapportage binnen een begeleide productvorm. U hoeft geen extra toolbeheer of open consultancytraject te organiseren.',
  },
] as const

const firstValueNotes = [
  'First value is snel, maar nooit sneller dan de responsbasis toelaat.',
  'De eerste responses laten zien dat het traject loopt, maar we lezen nog terughoudend zolang het patroonbeeld beperkt is.',
  'Zodra de responsbasis bruikbaar wordt, kantelt het traject naar een eerste managementread met prioriteiten, hypotheses en een logische vervolgconversatie.',
] as const

const handoffItems = [
  {
    title: 'Dashboard, managementrapport en bestuurlijke handoff',
    body: 'U krijgt geen losse outputs naast elkaar, maar een vaste leeslijn van dashboard naar rapport en bestuurlijke handoff.',
  },
  {
    title: 'Eerste managementread',
    body: 'De eerste bespreking vertaalt signalen naar prioriteiten, verificatievragen en logische vervolgstappen voor HR, sponsor, MT of directie.',
  },
  {
    title: 'Heldere deliverables',
    body: 'Het traject eindigt niet bij een export of datadump, maar bij uitlegbare output die intern doorverteld en besproken kan worden.',
  },
] as const

const reassuranceCards = [
  {
    title: 'Tempo met grenzen',
    body: 'First value is snel, maar nooit sneller dan de responsbasis toelaat.',
  },
  {
    title: 'Heldere rolverdeling',
    body: 'U bevestigt route, timing, doelgroep en contactpersoon. Verisight beheert vervolgens setup, respondentflow, dashboard en rapportage.',
  },
  {
    title: 'Begrensde interpretatie',
    body: 'De eerste managementread is bedoeld voor prioritering en gesprek. Niet voor absolute zekerheid, diagnose of een open eind aan aanvullende analyses.',
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
              Van eerste gesprek tot bruikbare output zonder los implementatietraject.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight is een begeleide productroute van kennismaking en intake naar dashboard, managementrapport en bestuurlijke handoff. Geen losse surveytool en geen open consultancytraject.
            </p>
            <div className="marketing-hero-cta-row marketing-hero-actions">
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_hero_primary' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </Link>
              <Link
                href="/tarieven"
                className="inline-flex items-center justify-center rounded-full border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-semibold text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
              >
                Bekijk tarieven
              </Link>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="space-y-4">
              <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">
                Begeleide productvorm
              </span>
              {[
                ['Week 1', 'Kennismaking, intake en setup'],
                ['Week 2', 'Uitnodigingen, responses en gecontroleerde opbouw'],
                ['Week 3', 'Dashboard, rapport en eerste managementread'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#DCEFEA]">{title}</p>
                  <p className="mt-2 text-base font-semibold text-white">{body}</p>
                </div>
              ))}
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Tempo met grenzen
              </p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                First value is snel, maar nooit sneller dan de responsbasis toelaat.
              </p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Geen open eind
              </p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                De route stopt niet bij het rapport, maar bij de eerste bestuurlijke opvolging en de logische volgende stap.
              </p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Toepassingskader"
            title="Deze pagina helpt zodra de route helder is en u vooral zekerheid zoekt over het traject."
            description="De aanpakpagina is bedoeld om delivery-risk te verlagen: hoe het traject beweegt, wat het van u vraagt en hoe eerste waarde en handoff eruitzien."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {routeFitCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Procesroute"
            title="Hoe een Verisight-route beweegt van intake naar eerste managementread."
            description="De volgorde moet voorspelbaar genoeg voelen voor planning en compact genoeg blijven om momentum vast te houden."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approachSteps.map(({ title, body }) => (
              <div key={title} className="marketing-process-card">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                  {title.split('.')[0].trim()}
                </p>
                <h2 className="mt-4 text-lg font-semibold text-[#132033]">{title.replace(/^\d+\.\s*/, '')}</h2>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="First value en handoff"
            title="Wanneer eerste waarde zichtbaar wordt en wat u daarna in handen heeft."
            description="Het traject beweegt van eerste zichtbaarheid naar bruikbare managementoutput in een vaste leeslijn van dashboard, managementrapport en bestuurlijke handoff."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
                Wanneer first value zichtbaar wordt
              </p>
              <div className="mt-4 space-y-3">
                {firstValueNotes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-4 text-sm leading-7 text-[#4A5563]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">
                Wat de handoff oplevert
              </p>
              <div className="mt-4 space-y-4">
                {handoffItems.map((item) => (
                  <div key={item.title} className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-4">
                    <p className="text-base font-semibold text-[#132033]">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#4A5563]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="tint">
          <SectionHeading
            eyebrow="Altijd inbegrepen"
            title="Een duidelijke productvorm met vaste output."
            description="Wat u koopt is niet alleen een vragenlijst, maar een complete managementroute met setup, dashboard, rapport, leeswijzer en eerste opvolging."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {included.map((item) => (
              <div key={item} className="marketing-feature-card">
                <p className="text-sm leading-7 text-[#4A5563]">{item}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Geruststelling"
            title="Voorspelbaar genoeg voor planning. Begrensd genoeg voor vertrouwen."
            description="Procesvertrouwen komt hier niet uit theater, maar uit een leesbare volgorde, heldere rolverdeling en expliciete grenzen aan wat de eerste output wel en niet doet."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reassuranceCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[#132033]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{card.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Benieuwd hoe een traject voor uw organisatie eruitziet?"
            body="In een kort gesprek kijken we samen welke route nu logisch is, hoe het traject beweegt en wat u kunt verwachten qua timing, output en eerste handoff."
            primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
          />
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingInlineContactPanel
            eyebrow="Plan kennismaking"
            title="Vertel kort welke managementvraag nu speelt."
            body="In circa 20 minuten krijgt u helderheid over routekeuze, aanpak, timing, privacy en prijs."
            defaultRouteInterest="exitscan"
            defaultCtaSource="approach_form"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
