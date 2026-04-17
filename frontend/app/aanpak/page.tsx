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
    'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
  alternates: { canonical: '/aanpak' },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    url: 'https://www.verisight.nl/aanpak',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht in gemiddeld drie weken. Heldere stappen, vaste deliverables en een begeleide route zonder open eind.',
    images: ['/opengraph-image'],
  },
}

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
              Van eerste contact tot bruikbaar managementinzicht zonder losse eindes.
            </h1>
            <p className="marketing-hero-copy text-[#4A5563]">
              Verisight verkoopt geen losse surveytool en ook geen zwaar consultancytraject. U koopt een begeleide
              route van intake en uitvoering naar rapport, bestuurlijke handoff en eerste opvolging.
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
              <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Begeleide productvorm</span>
              {[
                ['Week 1', 'Routekeuze, intake en setup'],
                ['Week 2', 'Uitnodiging, responses en gecontroleerde opbouw'],
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
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Tempo met grenzen</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                First value is snel, maar nooit sneller dan de responsbasis toelaat.
              </p>
            </div>
            <div className="marketing-support-note">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Geen open eind</p>
              <p className="mt-2 text-sm leading-7 text-[#4A5563]">
                De route stopt niet bij het rapport, maar bij de eerste bestuurlijke opvolging.
              </p>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Procesroute"
            title="Hoe een traject verloopt."
            description="Van eerste gesprek naar de eerste managementread in een ritme dat voorspelbaar genoeg is voor planning en snel genoeg voor momentum."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approachSteps.map(({ title, body }) => (
              <div key={title} className="marketing-process-card">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3C8D8A]">
                  {title.split('.')[0].trim()}
                </p>
                <h3 className="mt-4 text-lg font-semibold text-[#132033]">{title.replace(/^\d+\.\s*/, '')}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Wat u zelf doet</p>
              <div className="mt-4 space-y-4">
                {[
                  ['Route bevestigen', 'U bevestigt scan, variant, timing, doelgroep en contactpersoon na akkoord.'],
                  ['Respondentbestand aanleveren', 'U levert het bestand aan; Verisight controleert de import en zet uitnodigingen klaar.'],
                  ['Dashboard en rapport ontvangen', 'U ontvangt dashboard, managementrapport en toelichting in dezelfde leeslijn.'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-4">
                    <p className="text-base font-semibold text-[#132033]">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-[#4A5563]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-feature-card">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Eerste waarde</p>
              <div className="mt-4 space-y-3">
                {[
                  'Na de eerste responses is de campaign zichtbaar op gang, maar lezen we nog terughoudend.',
                  'Vanaf ongeveer 5 responses ontstaat de eerste bruikbare detailweergave in dashboard en rapport.',
                  'Vanaf ongeveer 10 responses ontstaat een steviger patroonbeeld voor prioritering, managementduiding en eerste besluiten.',
                ].map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-[#E5E0D6] bg-white px-4 py-4 text-sm leading-7 text-[#4A5563]">
                    {item}
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
            description="Wat u koopt is niet alleen een vragenlijst, maar een complete managementroute met dashboard, rapport, leeswijzer en opvolgingsgesprek."
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
          <MarketingCalloutBand
            eyebrow="Kennismaking"
            title="Benieuwd hoe een traject voor uw organisatie eruitziet?"
            body="In een kort gesprek kijken we samen welke scan nu het meest logisch is, hoe de aanpak eruitziet en wat u kunt verwachten."
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
            body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs."
            defaultRouteInterest="exitscan"
            defaultCtaSource="approach_form"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
