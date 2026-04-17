import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Tarieven',
  description:
    'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450. Geen licenties, heldere scope per traject.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450. Geen licenties, heldere scope per traject.',
    url: 'https://www.verisight.nl/tarieven',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Verisight tarieven voor ExitScan en RetentieScan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarieven | Verisight',
    description:
      'Vaste tarieven per scanvorm. ExitScan vanaf EUR 2.950, RetentieScan vanaf EUR 3.450. Geen licenties, heldere scope per traject.',
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

      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main>

          {/* Hero */}
          <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
            <div className="marketing-shell py-14">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Tarieven
              </p>
              <h1 className="mt-3 max-w-[28ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
                Transparante tarieven, heldere scope
              </h1>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
                Vaste tarieven per scanvorm. Geen licenties, heldere scope per traject.
              </p>
            </div>
          </section>

          {/* ExitScan groep */}
          <MarketingSection tone="tint">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
              Uitstroom
            </p>
            <h2 className="mt-3 text-2xl font-medium text-[#132033]">ExitScan</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Begrijp waarom medewerkers vertrekken. Beschikbaar als retrospectieve analyse of doorlopende live scan.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {/* Retrospectief */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Retrospectief
                </p>
                <p className="mt-3 text-3xl font-light text-[#132033]">EUR 2.950</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5563]">
                  Analyse van vertrek in een afgebakende periode. De standaard eerste instap voor een betrouwbaar organisatiebeeld en professioneel managementrapport over uitstroom.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    'Inrichting exit-campagne en respondentflow',
                    'Dashboard en managementrapport',
                    'Toelichting op de uitkomsten',
                    'Bestuurlijke handoff inbegrepen',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Live */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Live
                </p>
                <p className="mt-3 text-3xl font-light text-[#132033]">Op aanvraag</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5563]">
                  Doorlopende scan bij nieuwe vertrekkers. Logisch vervolg na een eerste retrospectieve analyse, wanneer proces, volume en eigenaarschap al staan.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    'Uitbreidbaar na eerste retrospectief traject',
                    'Actuele uitstroomsignalen doorlopend gevolgd',
                    'Begeleide vervolgroute, geen self-serve laag',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Segment Deep Dive add-on */}
            <div className="mt-5 rounded-xl border border-dashed border-[#E5E0D6] bg-[#F7F5F1] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                    Add-on
                  </p>
                  <p className="mt-1 text-base font-medium text-[#132033]">Segment Deep Dive</p>
                  <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
                    Extra segmentanalyse voor scherpere uitsplitsing naar afdeling of functieniveau — wanneer metadata en minimale respondentengroep dat dragen.
                  </p>
                </div>
                <p className="text-xl font-light text-[#132033]">EUR 950</p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/producten/exitscan"
                className="text-sm font-medium text-[#3C8D8A] hover:underline"
              >
                Meer over ExitScan →
              </Link>
            </div>
          </MarketingSection>

          {/* RetentieScan groep */}
          <MarketingSection tone="surface">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
              Behoud
            </p>
            <h2 className="mt-3 text-2xl font-medium text-[#132033]">RetentieScan</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Zie waar behoud onder druk staat. Beschikbaar als live meting of momentopname.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {/* Momentopname */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Momentopname
                </p>
                <p className="mt-3 text-3xl font-light text-[#132033]">EUR 3.450</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5563]">
                  Gerichte baseline om retentierisico&#39;s in kaart te brengen. Met extra nadruk op privacy, groepsduiding en een gerichte managementscan in plaats van een brede MTO.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    'Retentiesignaal, stay-intent en vertrekintentie in managementrapport',
                    'Geen individuele signalen naar management',
                    'Basis voor gerichte opvolging of vervolgmeting',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Live */}
              <div className="flex flex-col rounded-xl border border-[#E5E0D6] bg-white p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Live
                </p>
                <p className="mt-3 text-3xl font-light text-[#132033]">Vanaf EUR 4.950</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5563]">
                  Voor organisaties die retentie als terugkerend stuurthema benaderen. Met herhaalmeting, trendduiding en betere opvolging van acties na de eerste baseline.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    'Herhaalmeting per kwartaal of halfjaar',
                    'Trendbeeld op retentiesignaal en bevlogenheid',
                    'Logische vervolgvorm na eerste momentopname',
                  ].map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/producten/retentiescan"
                className="text-sm font-medium text-[#3C8D8A] hover:underline"
              >
                Meer over RetentieScan →
              </Link>
            </div>
          </MarketingSection>

          {/* Wat altijd inbegrepen is */}
          <MarketingSection tone="tint">
            <h2 className="text-xl font-medium text-[#132033]">Wat altijd inbegrepen is</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4A5563]">
              Elke scan — ongeacht variant — bevat onderstaande deliverables. Geen losse modules, geen verborgen kosten.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Dashboard', body: 'Interactief dashboard met resultaten per factor en segment.' },
                { title: 'Managementrapport', body: 'Leesbaar rapport met patronen, prioriteiten en focusvragen.' },
                { title: 'Toelichting op de uitkomsten', body: 'Begeleid gesprek over wat de uitkomsten betekenen en wat u kunt verwachten.' },
                { title: 'AVG-conforme dataverwerking', body: 'Primaire dataopslag in EU. Geen koppeling aan individuen in rapportage.' },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-lg border border-[#E5E0D6] bg-white p-5">
                  <p className="flex items-center gap-2 text-sm font-medium text-[#132033]">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5563]">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* Closing CTA */}
          <MarketingSection tone="surface">
            <div className="text-center">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Kennismaking
              </p>
              <h2 className="mt-3 max-w-[32ch] mx-auto font-display text-[clamp(1.4rem,3vw,2rem)] font-light leading-[1.2] tracking-[-0.02em] text-[#132033]">
                Benieuwd welke scan en variant bij uw vraagstuk past?
              </h2>
              <p className="mt-4 max-w-[48ch] mx-auto text-sm leading-relaxed text-[#4A5563]">
                In een kort gesprek kijken we samen welke scan en variant nu het meest logisch is en welke timing daarbij past.
              </p>
              <Link
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'pricing_closing_cta' })}
                className="mt-6 inline-flex rounded-md bg-[#3C8D8A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </Link>
            </div>
          </MarketingSection>

          {/* Contact form */}
          <MarketingSection tone="tint">
            <MarketingInlineContactPanel
              eyebrow="Plan kennismaking"
              title="Vertel kort welke managementvraag nu speelt."
              body="In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs."
              defaultRouteInterest="exitscan"
              defaultCtaSource="pricing_form"
            />
          </MarketingSection>

        </main>
        <PublicFooter />
      </div>
    </>
  )
}
