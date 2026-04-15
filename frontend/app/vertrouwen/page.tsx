import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TrustStrip } from '@/components/marketing/trust-strip'
import {
  trustHubAnswerCards,
  trustItems,
  trustQuickLinks,
  trustReadingRows,
  trustSignalHighlights,
  trustSupportCards,
  trustVerificationCards,
} from '@/components/marketing/site-content'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Vertrouwen | Verisight',
    description:
      'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Verisight',
    description:
      'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
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
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-slate-600">Vertrouwen</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">
              Publieke trustlaag voor methodiek, privacy en rapportage.
            </h1>
            <p className="marketing-hero-copy text-slate-600">
              Deze pagina bundelt wat een eerste koper publiek moet kunnen verifieren voordat er een demo of
              kennismaking plaatsvindt: productgrenzen, privacybasis, rapportlezing en formele supportlagen.
            </p>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage>
            <div className="space-y-5">
              <span className="marketing-stage-tag bg-white/10 text-slate-200">Trusthub</span>
              <h2 className="marketing-stage-title font-display text-white">Wat je hier publiek kunt verifieren.</h2>
              <p className="marketing-stage-copy text-slate-300">
                Geen losse trustclaims, maar een buyer-facing overzicht van hoe Verisight methodiek, privacy,
                gegroepeerde output, bestuurlijke handoff en juridische basis zichtbaar organiseert.
              </p>
              <div className="marketing-stage-list">
                {[
                  'Geen individuele voorspelling of individuele signalen naar management.',
                  'Groepsinzichten met minimale n-grenzen en duidelijke interpretatiekaders.',
                  'Publieke routes voor trust, privacy, voorwaarden en DPA.',
                ].map((item) => (
                  <div key={item} className="marketing-stage-list-item text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note text-sm leading-7 text-slate-600">
              Deze pagina is parity-only: dezelfde shellregels als de commerciële pagina’s, maar met trust als
              hoofdtaak in plaats van productkeuze of pricing.
            </div>
            <div className="marketing-link-grid">
              {trustQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="plain">
          <div className="grid gap-5 lg:grid-cols-3">
            {trustSignalHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
              <SectionHeading
                eyebrow="Buyer confidence"
                title="Wat je nu al publiek kunt verifieren"
                description="Verisight laat publiek zien hoe productkeuze, begeleide uitvoering, outputgrenzen en privacybasis zijn ingericht, zonder te doen alsof alles al formeel zwaarder is dan het nu aantoonbaar is."
              />
              <div className="mt-8 grid gap-4">
                {trustVerificationCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                    <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <SectionHeading
                eyebrow="Wat de trustlaag draagt"
                title="Zichtbare signalen die buyer twijfel moeten verlagen."
                description="De trustlaag draait hier niet om badges of zware enterprise-taal, maar om publieke verificatie van productgrenzen, privacy en de manier waarop output bedoeld is."
                light
              />
              <div className="mt-8">
                <TrustStrip items={trustItems} tone="dark" />
              </div>
              <div className="mt-8 grid gap-3">
                {trustQuickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200 transition-colors hover:border-white/20 hover:bg-white/10"
                  >
                    <span className="font-semibold text-white">{link.label}</span>
                    <span className="mt-2 block text-slate-300">{link.body}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
            <SectionHeading
              eyebrow="Privacy en due diligence"
              title="Snelle antwoorden op voorspelbare buyer-vragen"
              description="Dit is de compacte publieke answer layer voor organisaties die willen weten hoe Verisight data, rapportage en managementgrenzen inricht voordat er een traject start."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {trustHubAnswerCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
            <SectionHeading
              eyebrow="Hoe je output leest"
              title="Wat Verisight wel en niet probeert te zijn"
              description="Zo blijven ExitScan en RetentieScan bestuurlijk bruikbaar zonder dat management de output leest als diagnose, individueel risicomodel of absolute waarheid."
            />
            <MarketingComparisonTable
              className="mt-8"
              columns={['Thema', 'Wat je wel ziet', 'Wat je er niet van moet maken']}
              rows={trustReadingRows}
            />
          </div>
        </MarketingSection>

        {exitSampleAsset && retentionSampleAsset ? (
          <MarketingSection tone="plain">
            <div className="grid gap-5 lg:grid-cols-2">
              <SampleShowcaseCard
                eyebrow="Voorbeeld lezen"
                title="ExitScan laat publiek zien wat management werkelijk leest."
                body="Dit buyer-facing voorbeeldrapport gebruikt fictieve data, maar dezelfde managementstructuur, claimsgrenzen en privacyframing als de live output. Daardoor werkt het als trustproof zonder vertrouwelijke klantlaag."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
              <SampleShowcaseCard
                eyebrow="Verification-first"
                title="RetentieScan blijft ook in de showcase begrensd."
                body="Gebruik dit voorbeeldrapport om te zien hoe RetentieScan groepsduiding, verificatie en opvolging toont zonder individuele predictor of performance-instrument te worden."
                asset={retentionSampleAsset}
                linkLabel="Open RetentieScan-voorbeeldrapport"
              />
            </div>
          </MarketingSection>
        ) : null}

        <MarketingSection tone="plain">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
            <SectionHeading
              eyebrow="Publieke supportlaag"
              title="De formele en publieke basis staat op meerdere plekken"
              description="Deze pagina vervangt de juridische detailpagina's niet, maar bundelt ze in een buyer-facing volgorde die sneller vertrouwen geeft."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {trustSupportCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Wil je daarna toetsen welke route voor jullie logisch is?"
            body="Gebruik deze trustlaag als publieke basis. In een kort gesprek vertalen we dat vervolgens naar ExitScan, RetentieScan of een combinatie, inclusief aanpak, timing en prijs."
            primaryHref="/#kennismaking"
            primaryLabel="Plan mijn gesprek"
            secondaryHref="/producten"
            secondaryLabel="Bekijk producten"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
