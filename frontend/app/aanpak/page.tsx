import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { approachSteps, included } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'Aanpak',
  description:
    'Van kennismaking tot bruikbaar managementinzicht — in gemiddeld drie weken. Heldere stappen, vaste deliverables, geen open eind.',
  alternates: { canonical: '/aanpak' },
  openGraph: {
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht — in gemiddeld drie weken. Heldere stappen, vaste deliverables, geen open eind.',
    url: 'https://www.verisight.nl/aanpak',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aanpak | Verisight',
    description:
      'Van kennismaking tot bruikbaar managementinzicht — in gemiddeld drie weken. Heldere stappen, vaste deliverables, geen open eind.',
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

      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main>

          {/* Hero */}
          <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
            <div className="marketing-shell py-14">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Aanpak
              </p>
              <h1 className="mt-3 max-w-[28ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
                Van eerste contact tot bruikbaar inzicht
              </h1>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
                Geen losse surveytool en geen zwaar consultancytraject. U koopt een duidelijke route van intake en uitvoering naar rapport, bestuurlijke handoff en eerste opvolging.
              </p>
            </div>
          </section>

          {/* Processtappen */}
          <MarketingSection tone="tint">
            <h2 className="text-xl font-medium text-[#132033]">Hoe een traject verloopt</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Van kennismaking tot eerste managementread — gemiddeld binnen drie weken operationeel.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {approachSteps.map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-3 rounded-xl border border-[#E5E0D6] bg-white p-6">
                  <span className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                    {title.split('.')[0].trim()}
                  </span>
                  <h3 className="text-base font-medium text-[#132033]">
                    {title.replace(/^\d+\.\s*/, '')}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#9CA3AF]">Gemiddeld binnen 3 weken operationeel.</p>
          </MarketingSection>

          {/* Wat u zelf doet */}
          <MarketingSection tone="surface">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-xl font-medium text-[#132033]">Wat u zelf doet</h2>
                <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-[#4A5563]">
                  Verisight begeleidt de setup en uitvoering. Uw bijdrage is beperkt en voorspelbaar — zo blijft de doorlooptijd kort.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { step: '01', title: 'Route bevestigen', body: 'U bevestigt scan, variant, timing, doelgroep en contactpersoon na akkoord.' },
                    { step: '02', title: 'Respondentbestand aanleveren', body: 'U levert het respondentbestand aan — Verisight controleert de import en zet uitnodigingen klaar.' },
                    { step: '03', title: 'Dashboard en rapport ontvangen', body: 'U ontvangt dashboard, managementrapport en toelichting en gebruikt dit voor de eerste managementread en het vervolgesprek.' },
                  ].map(({ step, title, body }) => (
                    <div key={step} className="flex gap-4">
                      <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A] tabular-nums">{step}</span>
                      <div>
                        <p className="text-sm font-medium text-[#132033]">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#4A5563]">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-medium text-[#132033]">Eerste waarde</h2>
                <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-[#4A5563]">
                  Verisight verkoopt geen instant inzicht zonder responsbasis. Daarom wordt ook first value voorspelbaar uitgelegd.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Na de eerste responses is de campaign zichtbaar op gang, maar lezen we nog terughoudend.',
                    'Vanaf ongeveer 5 responses ontstaat de eerste bruikbare detailweergave in dashboard en rapport.',
                    'Vanaf ongeveer 10 responses ontstaat een steviger patroonbeeld voor prioritering, managementduiding en eerste besluiten.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 rounded-lg border border-[#E5E0D6] bg-white p-4 text-sm leading-relaxed text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MarketingSection>

          {/* Wat altijd inbegrepen is */}
          <MarketingSection tone="tint">
            <h2 className="text-xl font-medium text-[#132033]">Wat altijd inbegrepen is</h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-[#4A5563]">
              Een duidelijke productvorm met vaste output, expliciete leeswijzers en heldere grenzen.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
          </MarketingSection>

          {/* Closing CTA */}
          <MarketingSection tone="surface">
            <div className="text-center">
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                Kennismaking
              </p>
              <h2 className="mt-3 max-w-[32ch] mx-auto font-display text-[clamp(1.4rem,3vw,2rem)] font-light leading-[1.2] tracking-[-0.02em] text-[#132033]">
                Benieuwd hoe een traject voor uw organisatie eruitziet?
              </h2>
              <p className="mt-4 max-w-[48ch] mx-auto text-sm leading-relaxed text-[#4A5563]">
                In een kort gesprek kijken we samen welke scan nu het meest logisch is, hoe de aanpak eruitziet en wat u kunt verwachten.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'approach_closing_cta' })}
                  className="inline-flex rounded-md bg-[#3C8D8A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                >
                  Plan een kennismaking
                </Link>
                <Link
                  href="/tarieven"
                  className="inline-flex rounded-md border border-[#E5E0D6] bg-white px-6 py-3 text-sm font-medium text-[#4A5563] transition-colors hover:border-[#3C8D8A] hover:text-[#132033]"
                >
                  Bekijk tarieven
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
              defaultCtaSource="approach_form"
            />
          </MarketingSection>

        </main>
        <PublicFooter />
      </div>
    </>
  )
}
