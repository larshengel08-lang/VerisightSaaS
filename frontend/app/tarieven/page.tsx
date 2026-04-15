import type { Metadata } from 'next'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  pricingAddOns,
  pricingCards,
  pricingChoiceGuide,
  pricingFaqs,
  pricingFollowOnRoutes,
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
  alternates: {
    canonical: '/tarieven',
  },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor eerste trajecten, vervolgvormen, add-ons en de combinatieroute van Verisight.',
    url: 'https://www.verisight.nl/tarieven',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Verisight tarieven voor ExitScan en RetentieScan',
      },
    ],
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
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.verisight.nl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tarieven',
        item: 'https://www.verisight.nl/tarieven',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        eyebrow="Tarieven"
        title="Heldere prijsankers voor eerste trajecten en logische vervolgvormen."
        description="Verisight verkoopt duidelijke productvormen met dashboard, rapportage, bestuurlijke handoff en begeleiding. Geen licentieconstructie met losse modules, geen planmatrix en geen open eind aan consultancy-uren."
        contextTitle="Gebruik pricing om kooprust te geven, niet om het gesprek ingewikkelder te maken."
        contextBody="De prijslaag moet eerst laten zien wat het eerste traject is, daarna welke vervolgvormen logisch worden en pas daarna welke verdieping eventueel meerwaarde heeft."
        ctaHref="#kennismaking"
      >
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

        {exitSampleAsset && retentionSampleAsset ? (
          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            <SampleShowcaseCard
              eyebrow="ExitScan-proof"
              title="Pricing wordt sterker wanneer de deliverable zichtbaar klopt."
              body="Gebruik het actuele ExitScan-voorbeeldrapport om te laten zien wat dashboard, managementrapport en bestuurlijke handoff in de praktijk betekenen voordat pricing verder wordt uitgediept."
              asset={exitSampleAsset}
              linkLabel="Open ExitScan-voorbeeldrapport"
            />
            <SampleShowcaseCard
              eyebrow="RetentieScan-proof"
              title="RetentieScan houdt een eigen proofrol binnen pricing."
              body="Voor buyers met een expliciete behoudsvraag op groepsniveau laat dit voorbeeldrapport zien wat de route werkelijk oplevert, zonder bredere MTO- of predictorclaim."
              asset={retentionSampleAsset}
              linkLabel="Open RetentieScan-voorbeeldrapport"
            />
          </div>
        ) : null}

        <div className="mt-16 marketing-panel-soft p-8 md:p-10">
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

        <div className="mt-16 marketing-panel p-8 md:p-10">
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

        <div className="mt-16 marketing-panel-soft p-8 md:p-10">
          <SectionHeading
            eyebrow="Wat hierna gebeurt"
            title="Gebruik pricing als kooprust, niet als losse prijslijst."
            description="Na een kennismaking bevestigen we eerst welke route nu past, welke databasis beschikbaar is en of een baseline of vervolgvorm echt logisch is."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              'Eerst route en eerste betaalde stap bevestigen, niet meteen een losse bundel verkopen.',
              'Daarna intake op databasis, segmenten, timing en privacygrenzen voordat een campaign live gaat.',
              'Vervolgens begeleidt Verisight setup, uitnodigingen, dashboard en eerste managementread in dezelfde leeslijn.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
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

        <div className="mt-16 marketing-panel p-8 md:p-10">
          <SectionHeading
            eyebrow="Add-ons en route-uitbreiding"
            title="Breid alleen uit waar het inhoudelijk klopt."
            description="Zo blijft verdieping een bewuste keuze, blijft combinatie een portfolioroute en voelt geen enkele vervolglaag als verkapte planmatrix."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricingAddOns.map(([title, price, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-sm font-bold text-blue-700">{price}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 marketing-panel-soft p-8 md:p-10">
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

        <div className="mt-16">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over pricing en productfit"
            body="Beschrijf kort welke route nu het meest logisch lijkt. Dan toetsen we of jullie beter starten met ExitScan Baseline, RetentieScan Baseline of een gerichte vervolgvorm, en welke timing daarbij past."
            defaultRouteInterest="exitscan"
            defaultCtaSource="pricing_form"
          />
        </div>

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Wil je bepalen welk prijsanker nu past?"
          body="In een kort gesprek kijken we wat nu jullie eerste route is, wanneer een vervolgvorm logisch wordt en of segment deep dive of een combinatieroute echt meerwaarde heeft."
          primaryHref="#kennismaking"
          primaryLabel="Plan kennismaking"
          secondaryHref="/aanpak"
          secondaryLabel="Bekijk aanpak"
        />
      </MarketingPageShell>
    </>
  )
}
