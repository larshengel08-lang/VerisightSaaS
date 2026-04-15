import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  expansionTriggerCards,
  pricingAddOns,
  pricingCards,
  pricingChoiceGuide,
  pricingFaqs,
  pricingFollowOnRoutes,
  pricingLifecycleLadder,
  retentionPackages,
  trustItems,
} from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Bekijk de prijsankers voor eerste trajecten, vervolgvormen, add-ons en de combinatieroute van Verisight, zonder premature SaaS-planlogica.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor eerste trajecten, vervolgvormen, add-ons en de combinatieroute van Verisight.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor eerste trajecten, vervolgvormen, add-ons en de combinatieroute van Verisight.',
    images: ['/opengraph-image'],
  },
}

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
        theme="neutral"
        pageType="pricing"
        ctaHref="#kennismaking"
        heroIntro={
          <MarketingHeroIntro>
            <p className="marketing-hero-eyebrow text-blue-600">Tarieven</p>
            <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">
              Heldere prijsankers voor eerste trajecten en logische vervolgvormen.
            </h1>
            <p className="marketing-hero-copy text-slate-600">
              Verisight verkoopt duidelijke productvormen met dashboard, rapportage, bestuurlijke handoff en
              begeleiding. Geen licentieconstructie met losse modules, geen planmatrix en geen open eind aan
              consultancy-uren.
            </p>
            <div className="marketing-hero-actions">
              <div className="marketing-hero-cta-row">
                <a
                  href="#kennismaking"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Plan kennismaking
                </a>
                <Link
                  href="/aanpak"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk aanpak
                </Link>
              </div>
            </div>
          </MarketingHeroIntro>
        }
        heroStage={
          <MarketingHeroStage>
            <div className="space-y-5">
              <span className="marketing-stage-tag bg-blue-400/12 text-blue-100">Pricing-first</span>
              <h2 className="marketing-stage-title font-display text-white">
                Gebruik pricing om kooprust te geven, niet om het gesprek ingewikkelder te maken.
              </h2>
              <p className="marketing-stage-copy text-slate-300">
                De prijslaag moet eerst laten zien wat het eerste traject is, daarna welke vervolgvormen logisch
                worden en pas daarna welke verdieping eventueel meerwaarde heeft.
              </p>
              <div className="grid gap-3">
                {pricingCards.map((card) => (
                  <div key={card.eyebrow} className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200">{card.eyebrow}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{card.price}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </MarketingHeroStage>
        }
        heroSupport={
          <MarketingHeroSupport>
            <div className="marketing-support-note text-sm leading-7 text-slate-600">
              Pricing hoeft hier niet alle trust en sample-output tegelijk te dragen. De taak boven de vouw is: eerste
              prijsanker, wat inbegrepen is en welke route logisch volgt.
            </div>
            <div className="marketing-link-grid">
              <Link
                href="/producten/exitscan"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk ExitScan
              </Link>
              <Link
                href="/producten/retentiescan"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk RetentieScan
              </Link>
              <Link
                href="/vertrouwen"
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk trustlaag
              </Link>
            </div>
          </MarketingHeroSupport>
        }
      >
        <MarketingSection tone="plain">
          <div className="grid items-start gap-6 xl:grid-cols-2">
            {pricingCards.map((card) => (
              <div key={card.eyebrow} className="marketing-panel-dark border-slate-900 bg-[#0d1b2e] p-8 md:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">{card.eyebrow}</p>
                <h2 className="font-display mt-4 text-5xl text-white md:text-6xl">{card.price}</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{card.description}</p>
                <div className="mt-8 grid gap-3">
                  {card.bullets.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div>
              <SectionHeading
                eyebrow="Proof onder pricing"
                title="De deliverable moet pricing bevestigen, niet verdringen."
                description="Sample-output en preview horen direct na het prijsanker te landen, zodat de buyer ziet wat het eerste traject werkelijk oplevert."
              />
              <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6">
                <PreviewSlider variant="portfolio" />
              </div>
              <PreviewEvidenceRail className="mt-6" variant="portfolio" />
            </div>

            <div className="grid gap-5">
              {exitSampleAsset ? (
                <SampleShowcaseCard
                  eyebrow="ExitScan-proof"
                  title="Pricing wordt sterker wanneer de deliverable zichtbaar klopt."
                  body="Gebruik het actuele ExitScan-voorbeeldrapport om te laten zien wat dashboard, managementrapport en bestuurlijke handoff in de praktijk betekenen voordat pricing verder wordt uitgediept."
                  asset={exitSampleAsset}
                  linkLabel="Open ExitScan-voorbeeldrapport"
                />
              ) : null}
              {retentionSampleAsset ? (
                <SampleShowcaseCard
                  eyebrow="RetentieScan-proof"
                  title="RetentieScan houdt een eigen proofrol binnen pricing."
                  body="Voor buyers met een expliciete behoudsvraag op groepsniveau laat dit voorbeeldrapport zien wat de route werkelijk oplevert, zonder bredere MTO- of predictorclaim."
                  asset={retentionSampleAsset}
                  linkLabel="Open RetentieScan-voorbeeldrapport"
                />
              ) : null}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel-soft p-8 md:p-10">
            <SectionHeading
              eyebrow="Keuzehulp"
              title="Wat is je eerste route?"
              description="Kies eerst het juiste betaalde eerste traject. Voeg pas daarna een vervolgvorm, add-on of combinatieroute toe."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {pricingChoiceGuide.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="marketing-panel p-8 md:p-10">
              <SectionHeading
                eyebrow="Lifecycle"
                title="Van eerste koop naar logisch vervolg"
                description="Pricing moet eerst laten zien wat de eerste koop is per route, daarna wat de vaste vervolgvorm is en pas daarna waar expansion geloofwaardig wordt."
              />
              <div className="mt-10 grid gap-4">
                {pricingLifecycleLadder.map((route) => (
                  <div key={route.route} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm font-semibold text-slate-950">{route.route}</p>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">Eerste koop:</span> {route.firstSale}
                      </div>
                      <div className="rounded-xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">Logisch vervolg:</span> {route.nextStep}
                      </div>
                      <div className="rounded-xl border border-white bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">Expansion:</span> {route.expansion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-panel-soft p-8 md:p-10">
              <SectionHeading
                eyebrow="Expansiongrenzen"
                title="Breid pas uit als de eerste route al waarde heeft geleverd."
                description="Zo blijft geen enkele vervolgstap voelen als losse upsell of verkapte planmatrix."
              />
              <div className="mt-10 grid gap-4">
                {expansionTriggerCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="marketing-panel p-8 md:p-10">
              <SectionHeading
                eyebrow="Vervolgvormen"
                title="Zo groeit een eerste traject door naar een logisch vervolg."
                description="ExitScan Live blijft een quote-only vervolgroute. RetentieScan ritme blijft de vaste buyer-facing vervolgvorm na een baseline."
              />
              <div className="mt-10 grid gap-5 lg:grid-cols-2">
                {pricingFollowOnRoutes.map((route) => (
                  <div key={route.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{route.title}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{route.fit}</p>
                      </div>
                      <p className="text-sm font-bold text-blue-700">{route.price}</p>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{route.description}</p>
                    <div className="mt-5 grid gap-2">
                      {route.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-xl border border-white bg-white px-3 py-3 text-sm leading-6 text-slate-700">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-panel-dark p-8 md:p-10">
              <SectionHeading
                eyebrow="Trustlaag"
                title="Een duidelijke prijs, een begeleid proces en output met expliciete claimsgrenzen."
                description="Voor een eerste traject is vertrouwen vaak belangrijker dan maximale productbreedte. Daarom blijft Verisight bewust compact, begeleid, privacybewust en methodisch helder opgezet."
                light
              />
              <div className="mt-8">
                <TrustStrip items={trustItems} tone="dark" />
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="marketing-panel p-8 md:p-10">
              <SectionHeading
                eyebrow="RetentieScan-opbouw"
                title="Drie logische vormen binnen dezelfde retentie-route."
                description="Zo blijft RetentieScan een eigen product met een eigen opbouw, zonder dat een compacte vervolgmeting als parallel eerste pakket gaat voelen."
              />
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {retentionPackages.map((pkg) => (
                  <div key={pkg.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm font-semibold text-slate-950">{pkg.title}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{pkg.fit}</p>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{pkg.body}</p>
                    <div className="mt-5 grid gap-2">
                      {pkg.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-xl border border-white bg-white px-3 py-3 text-sm leading-6 text-slate-700">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marketing-panel-soft p-8 md:p-10">
              <SectionHeading
                eyebrow="Add-ons en route-uitbreiding"
                title="Breid alleen uit waar het inhoudelijk klopt."
                description="Zo blijft verdieping een bewuste keuze, blijft combinatie een portfolioroute en voelt geen enkele vervolglaag als verkapte planmatrix."
              />
              <div className="mt-10 grid gap-5 lg:grid-cols-1">
                {pricingAddOns.map(([title, price, body]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm font-bold text-blue-700">{price}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="marketing-panel-soft p-8 md:p-10">
            <SectionHeading
              eyebrow="Sales FAQ"
              title="Veelgestelde commerciele vragen"
              description="Deze antwoorden helpen de productkeuze en prijsuitleg zuiver te houden."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {pricingFaqs.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-950">{question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over pricing en productfit"
            body="Beschrijf kort welke route nu het meest logisch lijkt. Dan toetsen we of jullie beter starten met ExitScan Baseline, RetentieScan Baseline of een gerichte vervolgvorm, en welke timing daarbij past."
            defaultRouteInterest="exitscan"
            defaultCtaSource="pricing_form"
          />
        </MarketingSection>

        <MarketingSection tone="plain">
          <MarketingCalloutBand
            eyebrow="Volgende stap"
            title="Wil je bepalen welk prijsanker nu past?"
            body="In een kort gesprek kijken we wat nu jullie eerste route is, wanneer een vervolgvorm logisch wordt en of segment deep dive of een combinatieroute echt meerwaarde heeft."
            primaryHref="#kennismaking"
            primaryLabel="Plan kennismaking"
            secondaryHref="/aanpak"
            secondaryLabel="Bekijk aanpak"
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
