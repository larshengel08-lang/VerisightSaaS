import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
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
    'Methodiek, privacy en rapportlezing van Verisight. Geen individuele signalen naar management — groepsinzichten met heldere claimsgrenzen.',
  alternates: { canonical: '/vertrouwen' },
  openGraph: {
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Geen individuele signalen naar management — groepsinzichten met heldere claimsgrenzen.',
    url: 'https://www.verisight.nl/vertrouwen',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vertrouwen | Verisight',
    description:
      'Methodiek, privacy en rapportlezing van Verisight. Geen individuele signalen naar management — groepsinzichten met heldere claimsgrenzen.',
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

      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main>

          {/* Hero */}
          <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
            <div className="marketing-shell py-14">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Vertrouwen
              </p>
              <h1 className="mt-3 max-w-[28ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
                Methodiek en vertrouwelijkheid
              </h1>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
                Hoe Verisight methodiek, privacy, rapportgrenzen en formele basis publiek organiseert — zodat u dat kunt toetsen voordat een traject start.
              </p>
            </div>
          </section>

          {/* Vijf signalen */}
          <MarketingSection tone="tint">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trustSignalHighlights.map((item) => (
                <div key={item.title} className="rounded-xl border border-[#E5E0D6] bg-white p-6">
                  <p className="text-sm font-medium text-[#132033]">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5563]">{item.body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* Wat u kunt verifieren + trustItems */}
          <MarketingSection tone="surface">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-xl font-medium text-[#132033]">Wat u publiek kunt verifieren</h2>
                <div className="mt-6 space-y-4">
                  {trustVerificationCards.map((card) => (
                    <div key={card.title} className="rounded-lg border border-[#E5E0D6] bg-white p-5">
                      <p className="text-sm font-medium text-[#132033]">{card.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#4A5563]">{card.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-[#132033] p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                  Methodiek en vertrouwen
                </p>
                <h2 className="mt-3 text-xl font-medium text-[#F7F5F1]">
                  Bruikbare inzichten, heldere grenzen
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(247,245,241,0.65)]">
                  Verisight werkt met geaggregeerde uitkomsten en benoemt bewust wat wel en niet geconcludeerd kan worden.
                </p>
                <ul className="mt-6 space-y-3">
                  {trustItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[rgba(247,245,241,0.8)]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-2">
                  {trustQuickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-lg border border-[rgba(247,245,241,0.1)] bg-[rgba(247,245,241,0.05)] px-4 py-4 text-sm transition-colors hover:bg-[rgba(247,245,241,0.1)]"
                    >
                      <span className="font-medium text-[#F7F5F1]">{link.label}</span>
                      <span className="mt-1 block text-[rgba(247,245,241,0.55)]">{link.body}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </MarketingSection>

          {/* Privacy en due diligence Q&A */}
          <MarketingSection tone="tint">
            <h2 className="text-xl font-medium text-[#132033]">Privacy en due diligence</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Snelle antwoorden op voorspelbare vragen — zodat u dit kunt toetsen voordat er een gesprek plaatsvindt.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trustHubAnswerCards.map((card) => (
                <div key={card.title} className="rounded-lg border border-[#E5E0D6] bg-white p-5">
                  <p className="text-sm font-medium text-[#132033]">{card.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5563]">{card.body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* Hoe u de output leest */}
          <MarketingSection tone="surface">
            <h2 className="text-xl font-medium text-[#132033]">Hoe u de output leest</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Wat Verisight wel en niet probeert te zijn — zodat management de output leest als gespreksinput, niet als diagnose.
            </p>
            <div className="mt-8 overflow-hidden rounded-xl border border-[#E5E0D6]">
              {/* Desktop header */}
              <div className="hidden grid-cols-3 border-b border-[#E5E0D6] bg-[#F7F5F1] md:grid">
                {['Thema', 'Wat u wel ziet', 'Wat u er niet van moet maken'].map((col) => (
                  <div key={col} className="px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
                    {col}
                  </div>
                ))}
              </div>
              {trustReadingRows.map((row) => (
                <div key={row[0]} className="border-b border-[#E5E0D6] last:border-b-0">
                  {/* Mobile */}
                  <div className="space-y-3 p-5 md:hidden">
                    {row.map((cell, index) => (
                      <div key={`${row[0]}-${index}`}>
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
                          {['Thema', 'Wat u wel ziet', 'Wat u er niet van moet maken'][index]}
                        </p>
                        <p className={`mt-1 text-sm leading-relaxed ${index === 1 ? 'font-medium text-[#132033]' : 'text-[#4A5563]'}`}>
                          {cell}
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Desktop */}
                  <div className="hidden grid-cols-3 md:grid">
                    {row.map((cell, index) => (
                      <div
                        key={`${row[0]}-${index}`}
                        className={`px-5 py-5 text-sm leading-relaxed ${index === 1 ? 'font-medium text-[#132033]' : 'text-[#4A5563]'}`}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* Publieke supportlaag */}
          <MarketingSection tone="tint">
            <h2 className="text-xl font-medium text-[#132033]">Publieke documentatie</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              De formele en publieke basis staat op meerdere plekken — gebundeld in een buyer-facing volgorde.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {trustSupportCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl border border-[#E5E0D6] bg-white p-6 transition-colors hover:border-[#3C8D8A]"
                >
                  <p className="text-sm font-medium text-[#132033]">{card.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5563]">{card.body}</p>
                  <p className="mt-3 text-xs font-medium text-[#3C8D8A]">Bekijken →</p>
                </Link>
              ))}
            </div>
          </MarketingSection>

          {/* Closing CTA */}
          <MarketingSection tone="surface">
            <div className="text-center">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Volgende stap
              </p>
              <h2 className="mt-3 max-w-[32ch] mx-auto font-display text-[clamp(1.4rem,3vw,2rem)] font-light leading-[1.2] tracking-[-0.02em] text-[#132033]">
                Klaar om te toetsen welke route voor uw organisatie logisch is?
              </h2>
              <p className="mt-4 max-w-[48ch] mx-auto text-sm leading-relaxed text-[#4A5563]">
                Gebruik deze pagina als publieke basis. In een kort gesprek vertalen we dat naar ExitScan, RetentieScan of een combinatie — inclusief aanpak, timing en prijs.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'trust_closing_cta' })}
                  className="inline-flex rounded-md bg-[#3C8D8A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                >
                  Plan een kennismaking
                </Link>
                <Link
                  href="/producten"
                  className="inline-flex rounded-md border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-medium text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
                >
                  Bekijk de producten
                </Link>
              </div>
            </div>
          </MarketingSection>

          {/* Contact form */}
          <MarketingSection tone="tint">
            <MarketingInlineContactPanel
              eyebrow="Plan kennismaking"
              title="Vertel kort welke managementvraag nu speelt."
              body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs."
              defaultRouteInterest="exitscan"
              defaultCtaSource="trust_form"
            />
          </MarketingSection>

        </main>
        <PublicFooter />
      </div>
    </>
  )
}
