import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ContactForm } from '@/components/marketing/contact-form'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SectionHeading } from '@/components/marketing/section-heading'
import { trustItems, processHighlights, faqSchema } from '@/components/marketing/site-content'
import { buildContactHref } from '@/lib/contact-funnel'

export const metadata: Metadata = {
  title: 'ExitScan en RetentieScan voor HR-teams',
  description:
    'Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen aandacht vragen — zodat prioriteiten duidelijk worden.',
  alternates: {
    canonical: '/',
  },
}

export default function LandingPage() {
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Verisight | ExitScan en RetentieScan voor HR-teams',
    description:
      'Verisight helpt HR en management scherp zien welke vertrek- en retentiesignalen aandacht vragen — zodat prioriteiten duidelijk worden.',
    url: 'https://www.verisight.nl/',
    inLanguage: 'nl-NL',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ExitScan', url: 'https://www.verisight.nl/producten/exitscan' },
        { '@type': 'ListItem', position: 2, name: 'RetentieScan', url: 'https://www.verisight.nl/producten/retentiescan' },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#132033] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Ga naar de inhoud
      </a>

      <div className="min-h-screen bg-white">
        <PublicHeader />
        <main id="hoofdinhoud">

          {/* 1 — Hero */}
          <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
            <div className="marketing-shell grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                  Exit- &amp; retentie-analyse
                </p>
                <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,2.75rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
                  Krijg scherp zicht op{' '}
                  <strong className="font-semibold">vertrek- en retentiesignalen</strong>
                </h1>
                <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-[#4A5563]">
                  Verisight helpt HR en management scherp zien welke patronen spelen en waar gerichte actie nodig is.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_hero' })}
                    className="inline-flex rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                  >
                    Plan een kennismaking
                  </Link>
                  <Link
                    href="/producten"
                    className="text-sm font-medium text-[#4A5563] transition-colors hover:text-[#132033]"
                  >
                    Bekijk de producten →
                  </Link>
                </div>
                <p className="mt-6 text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Voor organisaties met 200+ medewerkers
                </p>
              </div>

              <div>
                <p className="mb-2 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">
                  Voorbeeld van rapportopbouw
                </p>
                <div className="overflow-hidden rounded-xl border border-[#E5E0D6] bg-white shadow-[0_8px_30px_rgba(19,32,51,0.06)]">
                  <PreviewSlider variant="portfolio" />
                </div>
              </div>
            </div>
          </section>

          {/* 2 — Herkenbaar probleem */}
          <MarketingSection tone="tint">
            <SectionHeading
              eyebrow="Herkent u dit?"
              title="Signalen zijn er — het patroon nog niet"
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Exitsignalen komen versnipperd binnen',
                'Retentierisico\'s worden te laat zichtbaar',
                'Er zijn signalen, maar geen patroon',
                'Stuurinformatie voor MT ontbreekt',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-5"
                >
                  <p className="text-sm leading-relaxed text-[#132033]">{item}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 3 — Productkeuze */}
          <MarketingSection tone="dark">
            <SectionHeading
              eyebrow="Twee scans, één richting"
              title="Kies de scan die past bij uw vraagstuk"
              light
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {[
                {
                  name: 'ExitScan',
                  chip: 'Uitstroom',
                  title: 'Begrijp waarom medewerkers vertrekken',
                  body: 'Breng vertrekpatronen in beeld. Beschikbaar als retrospectieve analyse of live scan.',
                  href: '/producten/exitscan',
                },
                {
                  name: 'RetentieScan',
                  chip: 'Behoud',
                  title: 'Zie waar behoud onder druk staat',
                  body: 'Vroegtijdig inzicht in retentiesignalen. Beschikbaar als live meting of momentopname.',
                  href: '/producten/retentiescan',
                },
              ].map((product) => (
                <div
                  key={product.name}
                  className="flex flex-col rounded-xl border border-[rgba(247,245,241,0.12)] bg-[rgba(247,245,241,0.06)] p-7"
                >
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">
                    {product.chip}
                  </p>
                  <h3 className="mt-3 text-xl font-medium text-[#F7F5F1]">{product.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[rgba(247,245,241,0.65)]">{product.body}</p>
                  <Link
                    href={product.href}
                    className="mt-6 inline-flex self-start rounded-md bg-white px-4 py-2 text-sm font-medium text-[#132033] transition-colors hover:bg-[#F7F5F1]"
                  >
                    Meer over {product.name} →
                  </Link>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 4 — Wat het oplevert */}
          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Wat het oplevert"
              title="Van signalen naar bruikbare stuurinformatie"
            />
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                { title: 'Patronen zichtbaar', body: 'Geen losse signalen meer, maar een herkenbaar beeld van terugkerende thema\'s.' },
                { title: 'Beïnvloedbare factoren', body: 'Zicht op waar actie waarschijnlijk het meeste effect heeft.' },
                { title: 'Stuurinformatie voor MT', body: 'Direct deelbare inzichten voor bespreking met management en directie.' },
              ].map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-2">
                  <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 5 — Hoe het werkt */}
          <MarketingSection tone="tint">
            <SectionHeading
              eyebrow="Hoe het werkt"
              title="Operationeel binnen enkele weken"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: '01', title: 'Scan kiezen en inrichten', body: 'We bepalen samen welke scan en variant past bij uw managementvraag.' },
                { step: '02', title: 'De juiste doelgroep uitnodigen', body: 'Verisight begeleidt respondentimport en het versturen van uitnodigingen.' },
                { step: '03', title: 'Dashboard en rapport ontvangen', body: 'U ontvangt dashboard, managementrapport en toelichting in dezelfde leeslijn.' },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex flex-col gap-3">
                  <span className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">{step}</span>
                  <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#9CA3AF]">Gemiddeld binnen 3 weken operationeel.</p>
          </MarketingSection>

          {/* 6 — Preview */}
          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Voorbeeld van rapportopbouw"
              title="Zo ziet de output eruit"
              description="Dashboard, managementsamenvatting en factoranalyse in dezelfde leeslijn — direct deelbaar met HR, MT en directie."
            />
            <div className="mt-10 overflow-hidden rounded-xl border border-[#E5E0D6] bg-white shadow-[0_8px_30px_rgba(19,32,51,0.06)]">
              <PreviewSlider variant="portfolio" />
            </div>
          </MarketingSection>

          {/* 7 — Voor wie */}
          <MarketingSection tone="tint">
            <SectionHeading
              eyebrow="Voor wie"
              title="Een gedeelde managementtaal voor HR, MT en directie"
              align="center"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {processHighlights.map(({ title, text }) => (
                <div key={title} className="rounded-lg border border-[#E5E0D6] bg-white p-6">
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">{title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5563]">{text}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          {/* 8 — Methodiek & vertrouwen */}
          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Methodiek en vertrouwen"
              title="Bruikbare inzichten, heldere grenzen"
              description="Verisight werkt met geaggregeerde uitkomsten en benoemt bewust wat wel en niet geconcludeerd kan worden."
            />
            <ul className="mt-8 space-y-3">
              {trustItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#4A5563]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/vertrouwen" className="mt-6 block text-sm text-[#3C8D8A] hover:underline">
              Meer over methodiek en vertrouwelijkheid →
            </Link>
          </MarketingSection>

          {/* 9 — Afsluitende CTA + contactform */}
          <MarketingSection tone="tint">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <SectionHeading
                  eyebrow="Kennismaking"
                  title="Benieuwd welke signalen in uw organisatie zichtbaar worden?"
                  description="Plan een kort gesprek. We kijken samen welke scan past, hoe de aanpak eruitziet en wat u kunt verwachten."
                />
                <div className="mt-8 space-y-3">
                  <Link
                    href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'homepage_closing_cta' })}
                    className="inline-flex rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
                  >
                    Plan een kennismaking
                  </Link>
                  <p>
                    <a
                      href="/examples/voorbeeldrapport_verisight.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#4A5563] hover:text-[#132033] hover:underline"
                    >
                      Bekijk voorbeeldrapport →
                    </a>
                  </p>
                </div>
              </div>

              <div id="kennismaking" className="rounded-xl border border-[#E5E0D6] bg-white p-7">
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Plan kennismaking</p>
                <h2 className="mt-3 text-xl font-medium text-[#132033]">Vertel kort welke managementvraag nu speelt.</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#4A5563]">
                  In circa 20 minuten krijgt u helderheid over productkeuze, aanpak, timing, privacy en prijs.
                </p>
                <div className="mt-5">
                  <Suspense
                    fallback={
                      <div className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-5 text-sm text-[#4A5563]">
                        Het kennismakingsformulier wordt geladen.
                      </div>
                    }
                  >
                    <ContactForm surface="light" />
                  </Suspense>
                </div>
              </div>
            </div>
          </MarketingSection>

        </main>
        <PublicFooter />
      </div>
    </>
  )
}
