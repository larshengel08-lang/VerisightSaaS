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
  trustSignalHighlights,
  trustSupportCards,
  trustVerificationCards,
} from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Methodiek, privacy en rapportlezing van Verisight. Groepsinzichten met heldere claimsgrenzen voor ExitScan, RetentieScan, Pulse, TeamScan, onboarding en Leadership Scan.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Groepsinzichten met heldere claimsgrenzen voor ExitScan, RetentieScan, Pulse, TeamScan, onboarding en Leadership Scan.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Groepsinzichten met heldere claimsgrenzen voor ExitScan, RetentieScan, Pulse, TeamScan, onboarding en Leadership Scan.',
    images: ['/opengraph-image'],
  },
}

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
            <p className="marketing-hero-eyebrow text-[var(--teal)]">Vertrouwen</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-[var(--ink)]">
              Methodiek, privacy en rapportgrenzen in gewone managementtaal.
            </h1>
            <p className="marketing-hero-copy text-[var(--text)]">
              Verisight laat publiek zien hoe methodiek, privacy, rapportlezing en formele basis zijn ingericht.
              Deze publieke trustlaag maakt toetsbaar wat de output wel en niet belooft, zodat u dit kunt verifiëren
              voordat een traject start.
            </p>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage className="h-full">
            <div className="space-y-4">
              <span className="marketing-stage-tag border border-white/12 bg-white/6 text-[#DCEFEA]">Heldere grenzen</span>
              {trustItems.slice(0, 4).map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            {trustQuickLinks.slice(0, 2).map((link) => (
              <Link key={link.href} href={link.href} className="marketing-link-card transition-colors hover:border-[#3C8D8A]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Publieke basis</p>
                <p className="mt-2 text-base font-semibold text-[var(--ink)]">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text)]">{link.body}</p>
              </Link>
            ))}
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Waar vertrouwen vandaan komt"
            title="De trustlaag moet hetzelfde vertellen als het product werkelijk levert."
            description="Deze pagina maakt expliciet wat Verisight wel en niet claimt, hoe privacy is ingebouwd en hoe management de output moet lezen."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trustSignalHighlights.map((item) => (
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
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Wat u publiek kunt verifieren</p>
              <div className="mt-4 space-y-3">
                {trustVerificationCards.map((card) => (
                  <div key={card.title} className="rounded-[1.15rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                    <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text)]">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Methodiek en vertrouwen</p>
              <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
                Bruikbare inzichten, zonder schijnzekerheid.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
                Verisight werkt met geaggregeerde uitkomsten en benoemt bewust wat wel en niet geconcludeerd kan
                worden, inclusief de grens tussen Leadership Scan, TeamScan, named leaders en 360-verwachtingen.
              </p>
              <div className="mt-6 space-y-3">
                {trustItems.map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
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
            title="Gebruik Verisight als gespreksinput, niet als diagnose."
            description="De publieke reading guide moet dezelfde interpretatiegrenzen laten zien als rapport en dashboard."
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
            eyebrow="Privacy en due diligence"
            title="Snelle antwoorden op voorspelbare vragen."
            description="Zo kan een buyer de basis toetsen voordat er een gesprek plaatsvindt, inclusief privacybasis, DPA beschikbaar en due-diligencevragen."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trustHubAnswerCards.map((card) => (
              <div key={card.title} className="marketing-feature-card">
                <p className="text-base font-semibold text-[var(--ink)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text)]">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {trustSupportCards.map((card) => (
              <Link key={card.href} href={card.href} className="marketing-feature-card transition-colors hover:border-[#3C8D8A]">
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
          title="Klaar om te toetsen welke route voor uw organisatie logisch is?"
          body="Gebruik deze pagina als publieke basis. In een kort gesprek vertalen we dat naar ExitScan, RetentieScan of een kleinere vervolgronde zoals Pulse, TeamScan, onboarding of Leadership Scan, inclusief aanpak, timing en prijs."
          primaryHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_closing_cta' })}
            primaryLabel="Plan een kennismaking"
            secondaryHref="/producten"
            secondaryLabel="Bekijk de producten"
          />
        </MarketingSection>

        <MarketingSection tone="surface">
          <MarketingInlineContactPanel
            eyebrow="Plan kennismaking"
            title="Vertel kort welke managementvraag nu speelt."
            body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs."
            defaultRouteInterest="exitscan"
            defaultCtaSource="trust_form"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
