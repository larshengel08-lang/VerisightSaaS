import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
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

export const metadata: Metadata = {
  title: 'Vertrouwen',
  description:
    'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
  alternates: {
    canonical: '/vertrouwen',
  },
  openGraph: {
    title: 'Vertrouwen | Verisight',
    description:
      'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Verisight',
    description:
      'Publieke trustlaag van Verisight: methodiek, privacy, rapportlezing, DPA en buyer-facing vertrouwen voor ExitScan en RetentieScan.',
    images: ['/og-image.png'],
  },
}

export default function VertrouwenPage() {
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
        name: 'Vertrouwen',
        item: 'https://www.verisight.nl/vertrouwen',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingPageShell
        eyebrow="Vertrouwen"
        title="Publieke trustlaag voor methodiek, privacy en rapportage."
        description="Deze pagina bundelt wat een eerste koper publiek moet kunnen verifieren voordat er een demo of kennismaking plaatsvindt: productgrenzen, privacybasis, rapportlezing en formele supportlagen."
        highlightItems={['Methodiek', 'Privacy', 'Rapportlezing', 'DPA beschikbaar']}
        contextTitle="Wat je hier publiek kunt verifieren"
        contextBody="Geen losse trustclaims, maar een buyer-facing overzicht van hoe Verisight methodiek, privacy, gegroepeerde output, bestuurlijke handoff en juridische basis zichtbaar organiseert. Dat betekent ook: geen individuele voorspelling, geen individuele signalen naar management en geen persoonsgerichte managementoutput."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {trustSignalHighlights.map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
            <SectionHeading
              eyebrow="Buyer confidence"
              title="Wat je nu al publiek kunt verifieren"
              description="Verisight laat publiek zien hoe productkeuze, begeleide uitvoering, outputgrenzen en privacybasis zijn ingericht, zonder te doen alsof alles al formeel zwaarder is dan het nu aantoonbaar is."
            />
            <div className="mt-8 grid gap-4">
              {trustVerificationCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
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

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
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

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
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

        <div className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
          <SectionHeading
            eyebrow="Publieke supportlaag"
            title="De formele en publieke basis staat op meerdere plekken"
            description="Deze pagina vervangt de juridische detailpagina\'s niet, maar bundelt ze in een buyer-facing volgorde die sneller vertrouwen geeft."
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

        <MarketingCalloutBand
          className="mt-16"
          eyebrow="Volgende stap"
          title="Wil je daarna toetsen welke route voor jullie logisch is?"
          body="Gebruik deze trustlaag als publieke basis. In een kort gesprek vertalen we dat vervolgens naar ExitScan, RetentieScan of een combinatie, inclusief aanpak, timing en prijs."
          primaryHref="/#kennismaking"
          primaryLabel="Plan mijn gesprek"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingPageShell>
    </>
  )
}
