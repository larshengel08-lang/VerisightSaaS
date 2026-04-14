import type { Metadata } from 'next'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  pricingAddOns,
  pricingCards,
  pricingChoiceGuide,
  pricingFaqs,
  retentionPackages,
  trustItems,
} from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
  alternates: {
    canonical: '/tarieven',
  },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
    url: 'https://www.verisight.nl/tarieven',
    images: [
      {
        url: '/og-image.png',
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
      'Bekijk de prijsankers voor ExitScan, RetentieScan en de combinatie, inclusief baseline, deep dive en periodieke opvolging.',
    images: ['/og-image.png'],
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
        title="Heldere prijsankers per product, zonder dat ExitScan en RetentieScan elkaar kannibaliseren."
        description="Verisight verkoopt duidelijke productvormen met dashboard, rapportage en begeleiding. Geen licentieconstructie met losse modules en geen open eind aan consultancy-uren."
      >
        <div className="grid items-start gap-6 xl:grid-cols-3">
        {pricingCards.map((card) => (
          <div
            key={card.eyebrow}
            className="marketing-panel-dark border-slate-900 bg-[#0d1b2e] p-8 md:p-10"
          >
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

      <div className="mt-16 marketing-panel p-8 md:p-10">
        <SectionHeading
          eyebrow="RetentieScan pakketten"
          title="Drie logische productvormen voor behoudssignalering."
          description="Zo blijft RetentieScan een eigen product met een eigen opbouw, in plaats van een afgeleide feature van ExitScan."
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

      <div className="mt-16 marketing-panel p-8 md:p-10">
        <SectionHeading
          eyebrow="Add-ons en vervolg"
          title="Breid uit waar het inhoudelijk klopt."
          description="Zo blijft RetentieScan geen goedkope algemene variant van ExitScan, maar een eigen product met een eigen prijslogica."
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
          eyebrow="Keuzehulp"
          title="Welke productvorm past bij jouw vraag?"
          description="Zo houd je ExitScan en RetentieScan inhoudelijk zuiver en commercieel goed uitlegbaar."
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

      <div className="mt-16 marketing-panel-soft p-8 md:p-10">
        <SectionHeading
          eyebrow="Sales FAQ"
          title="Veelgestelde commerciële vragen"
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

      <div className="mt-16 marketing-panel-dark p-8 md:p-10">
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

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Wil je bepalen welk prijsanker nu past?"
          body="In een kort gesprek kijken we of ExitScan, RetentieScan of een combinatie logisch is, wanneer een herhaalmeting zinvol wordt en of de segment deep dive echt meerwaarde heeft."
          primaryHref="/#kennismaking"
          primaryLabel="Plan mijn gesprek"
          secondaryHref="/aanpak"
          secondaryLabel="Bekijk aanpak"
        />
      </MarketingPageShell>
    </>
  )
}
