import type { Metadata } from 'next'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { SectionHeading } from '@/components/marketing/section-heading'
import { approachRoutes, approachSteps, included, trustItems } from '@/components/marketing/site-content'
import { TrustStrip } from '@/components/marketing/trust-strip'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
  alternates: {
    canonical: '/aanpak',
  },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    url: 'https://www.verisight.nl/aanpak',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Verisight aanpak voor ExitScan en RetentieScan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Bekijk hoe Verisight eerste trajecten, vervolgvormen en combinatieroutes opbouwt van intake en uitnodiging tot dashboard, rapport en opvolging.',
    images: ['/og-image.png'],
  },
}

export default function AanpakPage() {
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
        name: 'Aanpak',
        item: 'https://www.verisight.nl/aanpak',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        eyebrow="Aanpak"
        title="Een duidelijke aanpak zonder dat ExitScan en RetentieScan door elkaar gaan lopen."
        description="Verisight is geen losse surveytool en ook geen zwaar consultancytraject. Je koopt een begeleide productvorm met duidelijke keuze tussen eerste traject, vervolgvorm, add-on en portfolioroute."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {approachSteps.map(({ title, body }) => (
            <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {approachRoutes.map((route) => (
            <div
              key={route.title}
              className={`rounded-[2rem] border p-8 ${route.shellClass}`}
            >
              <p className={`text-xs font-bold uppercase tracking-[0.22em] ${route.eyebrowClass}`}>
                {route.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">{route.title}</h2>
              <p className={`mt-4 text-sm leading-7 ${route.bodyClass}`}>{route.body}</p>
              <ul className={`mt-6 space-y-3 text-sm leading-7 ${route.bodyClass}`}>
                {route.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
          <SectionHeading
            eyebrow="Trustlaag"
            title="Duidelijk proces, gegroepeerde output en trust die in het productverhaal zit."
            description="Voor organisaties vanaf circa 200 medewerkers is niet alleen de analyse belangrijk, maar ook dat de productvorm netjes, voorspelbaar, privacybewust en methodisch uitlegbaar blijft."
            light
          />
          <div className="mt-8">
            <TrustStrip items={trustItems} tone="dark" />
          </div>
        </div>

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
          <SectionHeading
            eyebrow="Wat standaard inbegrepen is"
            title="Een traject van scan-keuze tot rapportage."
            description="Je koopt geen losse tool en geen open eind aan consultancy-uren, maar een duidelijke productvorm met vaste output, expliciete leeswijzers en productspecifieke trustgrenzen."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                  +
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Wil je weten welke vorm nu het best past?"
          body="In een kort gesprek bepalen we of jullie beter starten met ExitScan Baseline, RetentieScan Baseline of een combinatieroute, en wanneer een vervolgvorm of segment deep dive logisch wordt."
          primaryHref="/#kennismaking"
          primaryLabel="Plan mijn gesprek"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingPageShell>
    </>
  )
}
