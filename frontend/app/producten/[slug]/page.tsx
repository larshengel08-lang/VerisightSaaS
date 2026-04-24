import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingComparisonTable } from '@/components/marketing/marketing-comparison-table'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { buildContactHref } from '@/lib/contact-funnel'
import {
  ALL_MARKETING_PRODUCTS,
  type MarketingProduct,
  getMarketingProductBySlug,
  isActiveMarketingProduct,
  isCoreMarketingProduct,
} from '@/lib/marketing-products'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

type Props = { params: Promise<{ slug: string }> }

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)
  if (!product) return {}

  const description = product.description
  const url = `https://www.verisight.nl${product.href}`
  const imageAlt =
    isActiveMarketingProduct(product)
      ? product.ogAlt ?? `${product.label} productpagina van Verisight`
      : `${product.label} als gereserveerde future route bij Verisight`
  const imageUrl = `${product.href}/opengraph-image`

  return {
    title: product.seoTitle ?? `${product.label} | Verisight`,
    description,
    alternates: {
      canonical: product.href,
    },
    openGraph: {
      type: 'website',
      url,
      title: product.seoTitle ?? `${product.label} | Verisight`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle ?? `${product.label} | Verisight`,
      description,
      images: [imageUrl],
    },
  } satisfies Metadata
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = getMarketingProductBySlug(slug)

  if (!product) notFound()

  const structuredData = getProductStructuredData(product)

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={`${product.slug}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {slug === 'retentiescan' ? <RetentionScanPage /> : null}
      {slug === 'exitscan' ? <ExitScanPage /> : null}
      {slug === 'pulse' ? <PulsePage /> : null}
      {slug === 'teamscan' ? <TeamScanPage /> : null}
      {slug === 'onboarding-30-60-90' ? <OnboardingPage /> : null}
      {slug === 'leadership-scan' ? <LeadershipScanPage /> : null}
      {slug === 'combinatie' ? <CombinatiePage /> : null}
      {!['retentiescan', 'exitscan', 'pulse', 'teamscan', 'onboarding-30-60-90', 'leadership-scan', 'combinatie'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
    </>
  )
}

function getProductStructuredData(product: MarketingProduct) {
  const fullUrl = `https://www.verisight.nl${product.href}`
  const imageUrl = `https://www.verisight.nl${product.href}/opengraph-image`

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: product.seoTitle ?? `${product.label} | Verisight`,
    description: product.description,
    url: fullUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Verisight',
      url: 'https://www.verisight.nl',
    },
    primaryImageOfPage: imageUrl,
    inLanguage: 'nl-NL',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.verisight.nl/producten' },
      { '@type': 'ListItem', position: 3, name: product.label, item: fullUrl },
    ],
  }

  if (!isCoreMarketingProduct(product)) {
    return [webpageSchema, breadcrumbSchema]
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: product.label,
    serviceType: product.serviceType ?? product.label,
    description: product.description,
    url: fullUrl,
    image: imageUrl,
    provider: {
      '@type': 'Organization',
      name: 'Verisight',
      url: 'https://www.verisight.nl',
    },
    areaServed: { '@type': 'Country', name: 'Nederland' },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: product.serviceAudience ?? 'HR-teams en directies',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${product.label} output`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: product.serviceOutput ?? 'Dashboard en managementrapport' },
        },
      ],
    },
  }

  return [webpageSchema, breadcrumbSchema, serviceSchema]
}

function ExitScanPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>

        {/* 1 — Hero */}
        <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
          <div className="marketing-shell py-14">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">ExitScan</p>
            <h1 className="mt-3 max-w-[22ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
              Breng vertrekduiding scherp in beeld
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
              Voor terugkijkende vertrekduiding op groepsniveau, eerst als baseline en daarna eventueel als ritmeroute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#kennismaking"
                className="inline-flex rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </a>
              <Link
                href="/tarieven"
                className="text-sm font-medium text-[#4A5563] transition-colors hover:text-[#132033]"
              >
                Bekijk tarieven →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#4A5563]">
              <span>Verdiep de managementvraag eerst?</span>
              <Link
                href="/inzichten/waarom-medewerkers-vertrekken"
                className="font-medium text-[#132033] transition-colors hover:text-[#3C8D8A]"
              >
                Waarom medewerkers vertrekken
              </Link>
              <Link
                href="/inzichten/welke-signalen-gaan-aan-verloop-vooraf"
                className="font-medium text-[#132033] transition-colors hover:text-[#3C8D8A]"
              >
                Welke signalen gaan aan verloop vooraf
              </Link>
            </div>
          </div>
        </section>

        {/* 2 — Baseline vs. ritmeroute */}
        <MarketingSection tone="tint">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Varianten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Baseline of ritmeroute?</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              {
                label: 'Baseline',
                points: [
                  'Analyse van recent vertrek, bijvoorbeeld over de afgelopen 12 maanden',
                  'Geschikt als er al voldoende vertrekinput beschikbaar is',
                  'Geen actieve respondenten nodig — ex-medewerkers',
                ],
              },
              {
                label: 'Ritmeroute',
                points: [
                  'Doorlopende vervolgroute nadat baseline, proces en eigenaar al staan',
                  'Geschikt als u actuele uitstroomsignalen wilt blijven volgen',
                  'Respondenten vullen in rond het moment van vertrek',
                ],
              },
            ].map(({ label, points }) => (
              <div key={label} className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-6">
                <p className="text-sm font-medium text-[#132033]">{label}</p>
                <ul className="mt-3 space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 3 — Wanneer relevant */}
        <MarketingSection tone="surface">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wanneer relevant</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">ExitScan is logisch in deze situaties</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              'Bij structureel verloop dat u wilt begrijpen',
              'Bij voorbereiding op een MT-bespreking over uitstroom',
              'Bij behoefte aan scherpere stuurinformatie voor HR en management',
              'Na een reorganisatie of fusie',
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[#E5E0D6] bg-white p-5">
                <p className="text-sm leading-relaxed text-[#132033]">{item}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 4 — Wat zichtbaar wordt */}
        <MarketingSection tone="tint">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wat zichtbaar wordt</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Inzichten in uw eigen taal</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Waar signalen terugkomen', body: 'Terugkerende thema\'s uit vertrekgesprekken en werkfactoren in een vergelijkbaar beeld.' },
              { title: 'Waar frictie zichtbaar is', body: 'Leiderschap, werkbelasting, groei en rolhelderheid die doorlopend worden genoemd.' },
              { title: 'Waar actie het meeste effect heeft', body: 'Prioriteiten op basis van signaalsterkte, niet op basis van aannames.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 5 — Uitkomsten */}
        <MarketingSection tone="surface">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Uitkomsten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Wat u ermee kunt doen</h2>
          <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-[#4A5563]">
            De leesrichting blijft compact en bestuurlijk: eerst cover en respons, daarna de bestuurlijke handoff,
            vervolgens de eerste managementvraag, het eerste verificatiespoor en pas daarna de eerste logische stap.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Patronen zichtbaar maken', body: 'Geef management een herkenbaar beeld van terugkerende uitstroomthema\'s.' },
              { title: 'Focus aanbrengen in vervolg', body: 'Prioriteer acties op basis van signaalsterkte in plaats van aannames.' },
              { title: 'Gesprekken onderbouwen', body: 'Gebruik de uitkomsten in bespreking met HR, sponsor, MT en directie.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 6 — Wat u ontvangt */}
        <section className="bg-[#132033]">
          <div className="marketing-shell marketing-section">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wat u ontvangt</p>
            <h2 className="mt-3 max-w-[24ch] text-xl font-medium text-[#F7F5F1]">Dashboard, rapport en toelichting in dezelfde leeslijn</h2>
            <ul className="mt-6 space-y-2">
              {[
                'Dashboard met prioriteiten en factoranalyse',
                'Managementrapport voor HR, MT en directie met een eerste managementsessie als vaste vervolgstap',
                'Toelichting op de uitkomsten en vervolgstappen',
                'AVG-conforme dataverwerking',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[rgba(247,245,241,0.75)]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#kennismaking"
              className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-medium text-[#132033] transition-colors hover:bg-[#F7F5F1]"
            >
              Plan een kennismaking
            </a>

            {/* 7 — Segment Deep Dive add-on */}
            <div id="segment-deep-dive" className="mt-8 rounded-lg border border-[rgba(247,245,241,0.12)] bg-[rgba(247,245,241,0.06)] p-5">
              <span className="text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[#9CA3AF]">Add-on</span>
              <h3 className="mt-1 text-base font-medium text-[#F7F5F1]">Segment Deep Dive</h3>
              <p className="mt-1 text-sm text-[rgba(247,245,241,0.65)]">Verdieping op een specifieke afdeling, functiegroep of locatie. Beschikbaar als er voldoende respondenten en metadata voor zijn.</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#4A5563]">
              <span>Verdiep de managementvraag eerst?</span>
              <Link
                href="/inzichten/waar-staat-behoud-onder-druk"
                className="font-medium text-[#132033] transition-colors hover:text-[#3C8D8A]"
              >
                Waar staat behoud onder druk
              </Link>
              <Link
                href="/inzichten"
                className="font-medium text-[#132033] transition-colors hover:text-[#3C8D8A]"
              >
                Bekijk alle inzichten
              </Link>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <MarketingSection tone="tint">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over ExitScan"
            body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan de juiste eerste stap is en hoe de aanpak eruitziet."
            defaultRouteInterest="exitscan"
            defaultCtaSource="product_exit_form"
          />
        </MarketingSection>

      </main>
      <PublicFooter />
    </div>
  )
}

function RetentionScanPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>

        {/* 1 — Hero */}
        <section className="bg-[#F7F5F1] border-b border-[#E5E0D6]">
          <div className="marketing-shell py-14">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">RetentieScan</p>
            <h1 className="mt-3 max-w-[22ch] font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-light leading-[1.15] tracking-[-0.02em] text-[#132033]">
              Zie eerder waar behoud onder druk staat
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
              Voor vroegsignalering op behoud op groeps- en segmentniveau, als baseline of ritmeroute.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#kennismaking"
                className="inline-flex rounded-md bg-[#3C8D8A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </a>
              <Link
                href="/tarieven"
                className="text-sm font-medium text-[#4A5563] transition-colors hover:text-[#132033]"
              >
                Bekijk tarieven →
              </Link>
            </div>
          </div>
        </section>

        {/* 2 — Wanneer relevant */}
        <MarketingSection tone="tint">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wanneer relevant</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">RetentieScan is logisch in deze situaties</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              'Vroeg signaleren voordat sprake is van verloop',
              'Na een verandertraject of reorganisatie',
              'Bij behoefte aan MT-rapportage over behoudsdruk en retentiesignalen',
            ].map((item) => (
              <div key={item} className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-5">
                <p className="text-sm leading-relaxed text-[#132033]">{item}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 3 — Wat de scan meet */}
        <MarketingSection tone="surface">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wat de scan meet</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Inzichten in uw eigen taal</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Waar frictie zichtbaar wordt', body: 'Signalen over werkbelasting, leiderschap, groei en rolhelderheid op groepsniveau.' },
              { title: 'Welke factoren behoud beïnvloeden', body: 'Werkfactoren die betrokkenheid, stay-intent en vertrekintentie mede bepalen.' },
              { title: 'Waar risico\'s het grootst zijn', body: 'Prioriteiten voor HR en management op basis van signaalsterkte.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 4 — Uitkomsten */}
        <MarketingSection tone="tint">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Uitkomsten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Wat u ermee kunt doen</h2>
          <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-[#4A5563]">
            Ook hier blijft de managementopbouw compact: eerst cover, daarna een gecombineerde bestuurlijke read met
            respons, handoff, eerste managementsessie en eerste verificatiespoor, en pas daarna de eerste logische stap
            rond retentiesignaal en opvolging.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: 'Risico\'s vroegtijdig zichtbaar', body: 'Geef management een beeld van waar behoud nu aandacht vraagt.' },
              { title: 'Focus aanbrengen in vervolg', body: 'Prioriteer op basis van signaalsterkte, niet op aannames.' },
              { title: 'Gesprekken onderbouwen', body: 'Gebruik de uitkomsten in bespreking met HR, sponsor, MT en directie.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="text-base font-medium text-[#132033]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#4A5563]">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 5 — Ritmeroute vs. compacte hercheck */}
        <MarketingSection tone="surface">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Varianten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Baseline of ritmeroute?</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              {
                label: 'Baseline',
                points: [
                  'Gerichte eerste read voor actieve medewerkers',
                  'Geschikt om behoudsdruk en retentiesignalen eerst scherp te krijgen',
                  'Sterk als startpunt voor verificatie en prioritering',
                ],
              },
              {
                label: 'Ritmeroute',
                points: [
                  'Herhaalvorm nadat baseline en eerste opvolging al staan',
                  'Geschikt om verschuiving in retentiesignaal en topfactoren te volgen',
                  'Bewust kleiner dan opnieuw een brede eerste scan',
                ],
              },
            ].map(({ label, points }) => (
              <div key={label} className="rounded-lg border border-[#E5E0D6] bg-[#F7F5F1] p-6">
                <p className="text-sm font-medium text-[#132033]">{label}</p>
                <ul className="mt-3 space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-[#4A5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* 6 — Wat u ontvangt */}
        <section className="bg-[#132033]">
          <div className="marketing-shell marketing-section">
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Wat u ontvangt</p>
            <h2 className="mt-3 max-w-[24ch] text-xl font-medium text-[#F7F5F1]">Dashboard, rapport en toelichting in dezelfde leeslijn</h2>
            <ul className="mt-6 space-y-2">
              {[
                'Dashboard met retentiesignaal en factoranalyse',
                'Managementrapport voor HR, MT en directie met een eerste managementsessie als vaste vervolgstap',
                'Toelichting op de uitkomsten en vervolgstappen',
                'Geen individuele signalen — groepsduiding',
                'AVG-conforme dataverwerking',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[rgba(247,245,241,0.75)]">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#kennismaking"
              className="mt-8 inline-flex rounded-md bg-white px-5 py-3 text-sm font-medium text-[#132033] transition-colors hover:bg-[#F7F5F1]"
            >
              Plan een kennismaking
            </a>
          </div>
        </section>

        {/* Contact form */}
        <MarketingSection tone="tint">
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title="Plan een gesprek over RetentieScan"
            body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan de juiste eerste stap is en hoe de aanpak eruitziet."
            defaultRouteInterest="retentiescan"
            defaultCtaSource="product_retention_form"
          />
        </MarketingSection>

      </main>
      <PublicFooter />
    </div>
  )
}

function PulsePage() {
  return (
    <MarketingPageShell
      theme="neutral"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_hero' })}
      ctaLabel="Bespreek Pulse"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Pulse</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Houd na een eerste scan kort en gericht zicht op wat nu verschuift.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Pulse is een compacte vervolgroute na een eerste baseline, bestuurlijke read of eerste actie. Je gebruikt het product voor een
            korte managementreview: wat laat de huidige snapshot zien, welk werkspoor vraagt nu bespreking en wanneer
            is een volgende check logisch.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(217,119,6,0.22)] transition-all hover:-translate-y-0.5 hover:bg-amber-700"
              >
                Bespreek Pulse
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-amber-400/15 text-amber-100">Vervolgroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              Pulse is geen nieuwe eerste koop, maar een compacte hercheck na een eerdere bestuurlijke read.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De route blijft bewust smal: actuele groepssnapshot, begrensde vergelijking met de vorige vergelijkbare
              Pulse en een expliciet reviewmoment.
            </p>
            <div className="marketing-stage-list">
              {[
                'Start na een eerste baseline, managementread of eerste actie.',
                'Lees wat nu verschuift zonder direct opnieuw een brede meting te openen.',
                'Gebruik Pulse voor review en hercheck, niet als brede trendmachine.',
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
            RetentieScan ritmeroute blijft de bredere herhaalvorm na baseline. Pulse is kleiner en wordt pas logisch als de
            vraag vooral om een compacte reviewlaag vraagt.
          </div>
          <div className="marketing-link-grid">
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
              Bekijk trustgrenzen
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <MarketingProofStrip
          items={[
            {
              title: 'Compacte snapshot',
              body: 'Pulse laat op groepsniveau zien hoe de huidige werkbeleving en gekozen prioriteitsfactoren er nu voor staan.',
            },
            {
              title: 'Begrensde vergelijking',
              body: 'Vergelijking blijft bewust beperkt tot de vorige vergelijkbare Pulse met voldoende data.',
            },
            {
              title: 'Managementhandoff',
              body: 'De output eindigt bij prioriteit nu, eerste eigenaar en een expliciet afgesproken hercheckmoment.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Na een eerste baseline',
              body: 'Pulse wordt logisch zodra management na ExitScan, RetentieScan of een eerste actieplan niet opnieuw breed wil meten, maar wel gericht wil herchecken.',
            },
            {
              title: 'Na eerste acties',
              body: 'Gebruik Pulse om zichtbaar te maken of een gekozen correctie, ontlasting of gesprek het beeld kort daarna anders maakt.',
            },
            {
              title: 'Bij een smalle reviewvraag',
              body: 'Pulse past wanneer de vraag vooral gaat over review, bijsturing en het volgende checkmoment, niet over een nieuwe brede eerste scan.',
            },
          ].map((card) => (
            <div key={card.title} className="marketing-panel p-7">
              <h2 className="text-xl font-semibold text-slate-950">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <MarketingComparisonTable
            columns={['Thema', 'Pulse', 'RetentieScan ritmeroute']}
            rows={[
              [
                'Startpunt',
                'Na een eerste baseline, managementread of eerste actie wanneer een compacte hercheck logisch is.',
                'Na RetentieScan Baseline als bredere herhaalvorm op behoud.',
              ],
              [
                'Wat je leest',
                'Huidige snapshot, topfactoren en alleen een begrensde vergelijking met de vorige Pulse.',
                'Breder trendbeeld op retentiesignaal, stay-intent en opvolging over meerdere meetmomenten.',
              ],
              [
                'Waar het voor dient',
                'Korte review, koerscorrectie en expliciet hercheckmoment.',
                'Structurelere opvolging van behoudsvragen in dezelfde signaallogica.',
              ],
              [
                'Niet bedoeld als',
                'Nieuwe eerste instap, brede MTO of hard effectbewijs.',
                'Parallel hoofdpackage naast baseline zonder duidelijke eigenaar of opvolging.',
              ],
            ]}
          />

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat Pulse wel belooft</p>
            <h2 className="mt-4 font-display text-4xl text-white">Een bounded managementread, geen brede trendclaim.</h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Pulse verkoopt geen nieuwe brede eerste scan. Het product helpt vooral om na een eerste managementread sneller te
              zien waar review, beperkte correctie of een volgende check nu het meest logisch is.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Geen individuele signalen of persoonsgerichte actieroutes.',
                'Geen brede trendmachine of effectclaim over meerdere lagen tegelijk.',
                'Wel een compacte route om management, HR en leidinggevende sneller op een lijn te krijgen.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Toets of Pulse als vervolgroute nu echt logisch is."
          body="Beschrijf kort welke eerste baseline, managementread of actie al loopt en wat je nu vooral wilt herchecken. Dan bepalen we of Pulse past of dat een bredere vervolgroute logischer is."
          defaultRouteInterest="nog-onzeker"
          defaultCtaSource="product_pulse_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Portfoliohelderheid"
          title="Twijfel je tussen Pulse en een bredere vervolgronde?"
          body="We helpen je kiezen tussen een compacte Pulse-hercheck, RetentieScan ritmeroute of een andere vervolgroute. Zo blijft de volgende stap scherp in plaats van breder dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'nog-onzeker', ctaSource: 'product_pulse_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function TeamScanPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_hero' })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-700">TeamScan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Lokaliseer waar een bestaand signaal eerst verificatie vraagt.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            TeamScan is geen nieuwe eerste hoofdroute, maar een bounded lokalisatieroute nadat een breder organisatie- of
            groepssignaal al zichtbaar is. De route helpt bepalen welke afdeling eerst een lokaal gesprek, verificatie
            of begrensde eerste actie vraagt.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan kennismaking
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-[#3C8D8A]/10 text-[#DCEFEA]">Lokalisatieroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              TeamScan helpt bepalen waar eerst lokaal gesprek of verificatie nodig is, niet wie gelijk heeft.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De route blijft bewust smal: department-first lokale read, bounded prioritering, eerste
              eigenaar en een begrensde eerste actie zonder manager ranking of brede teamscorekaart.
            </p>
            <div className="marketing-stage-list">
              {[
                'Start pas nadat een breder signaal al zichtbaar is.',
                'Lees veilige afdelingsuitsplitsing als verificatiehulp, niet als bewijs van teamoorzaak.',
                'Gebruik TeamScan om de eerste lokale managementhuddle te richten.',
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
            Segment Deep Dive blijft een add-on binnen bestaande scans. TeamScan is een eigen vervolgroute met een
            compacte survey, lokale prioriteitslogica en expliciete managementhandoff.
          </div>
          <div className="marketing-link-grid">
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
              Bekijk trustgrenzen
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <MarketingProofStrip
          items={[
            {
              title: 'Bestaand signaal eerst',
              body: 'TeamScan start pas nadat een breder organisatie- of groepssignaal al zichtbaar is in een eerste baseline, managementread of vervolgmeting.',
            },
            {
              title: 'Lokale prioriteit',
              body: 'De route laat zien welke afdelingen eerst verificatie vragen, met suppressie-aware lokale uitsplitsing en duidelijke grenzen.',
            },
            {
              title: 'Managementhandoff',
              body: 'De output eindigt bij eerste eigenaar, begrensde eerste actie en expliciete reviewgrens voor de volgende lokale stap.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Na een eerste baseline of managementread',
              body: 'TeamScan wordt logisch zodra management niet opnieuw breed wil meten, maar wel scherper wil weten waar het beeld lokaal het eerst onderzocht moet worden.',
            },
            {
              title: 'Bij lokale verificatievraag',
              body: 'Gebruik TeamScan wanneer de vraag vooral gaat over welke afdeling eerst een gesprek, verificatie of begrensde actie verdient.',
            },
            {
              title: 'Niet als brede teamscan',
              body: 'TeamScan is geen generieke cultuur- of leiderschapsscan, geen managerbeoordeling en geen vervanging van een beschrijvende Segment Deep Dive.',
            },
          ].map((card) => (
            <div key={card.title} className="marketing-panel p-7">
              <h2 className="text-xl font-semibold text-slate-950">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <MarketingComparisonTable
            columns={['Thema', 'TeamScan', 'Segment Deep Dive']}
            rows={[
              [
                'Startpunt',
                'Na een bestaand signaal wanneer een lokale managementvraag openstaat.',
                'Na ExitScan of RetentieScan als beschrijvende add-on op afdeling of functieniveau.',
              ],
              [
                'Wat je leest',
                'Veilige afdelingsuitsplitsing, bounded prioriteit, eerste eigenaar en begrensde eerste actie.',
                'Extra segmentbeeld binnen de bestaande scanoutput, zonder eigen handoffroute.',
              ],
              [
                'Waar het voor dient',
                'Eerste lokale verificatie, managementhuddle en begrensde vervolgactie.',
                'Beschrijvende verdieping zodra bestaande metadata en minimale n dat dragen.',
              ],
              [
                'Niet bedoeld als',
                'Brede teamscan, manager ranking of causale teambewijslijn.',
                'Zelfstandige productroute met eigen lokalisatie- en actielogica.',
              ],
            ]}
          />

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Wat TeamScan wel belooft</p>
            <h2 className="mt-4 font-display text-4xl text-white">
              Een veilige lokale handoff, geen oordeel over teams of managers.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              TeamScan verkoopt geen brede teamscan als nieuwe hoofdroute. Het product helpt vooral om na een eerste managementread sneller
              te zien waar lokale verificatie, eigenaarschap en een begrensde eerste actie het meest logisch zijn.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Geen individuele signalen of managerbeoordeling.',
                'Geen location- of multi-boundary belofte in deze wave.',
                'Wel een lokale route om HR, sponsor en afdelingsleider sneller op een lijn te krijgen.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Toets of TeamScan als lokale vervolgronde nu echt logisch is."
          body="Beschrijf kort welk bredere signaal al zichtbaar is en waar de lokale onzekerheid nu zit. Dan bepalen we of TeamScan past of dat een bredere route of add-on logischer blijft."
          defaultRouteInterest="teamscan"
          defaultCtaSource="product_team_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Lokalisatiegrens"
          title="Twijfel je tussen TeamScan en een andere vervolgronde?"
          body="We helpen je kiezen tussen TeamScan, Segment Deep Dive of terug naar een bredere kernroute. Zo blijft de vervolgstap lokaal scherp in plaats van diffuser dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function OnboardingPage() {
  return (
    <MarketingPageShell
      theme="neutral"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })}
      ctaLabel="Bespreek onboarding"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Onboarding 30-60-90</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Toets vroeg hoe nieuwe medewerkers in een checkpoint landen.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Onboarding 30-60-90 is geen client onboarding-tool en geen brede journey-suite. Het is een bounded
            lifecycle-route voor een assisted single-checkpoint managementread: hoe landen nieuwe medewerkers nu in rol,
            leiding, team en werkcontext, wie trekt de eerste handoff en welke kleine borg- of correctiestap hoort daar
            direct bij.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(217,119,6,0.18)] transition-all hover:-translate-y-0.5 hover:bg-amber-700"
              >
                Plan kennismaking
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-amber-500/10 text-amber-100">Lifecycle-check</span>
            <h2 className="marketing-stage-title font-display text-white">
              Lees vroege landingssignalen zonder daarvan meteen een volledige 30-60-90 suite te maken.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De buyer-facing belofte blijft bewust smal: precies een checkpoint per campaign, een assisted
              managementread, eerste eigenaar, begrensde eerste actie en een expliciete reviewgrens.
            </p>
            <div className="marketing-stage-list">
              {[
                'Gebruik onboarding voor een vroeg checkpoint, niet voor volledige journey-automation.',
                'Lees alleen groepssignalen over landing in rol, leiding, team en werkcontext.',
                'Gebruik de route om een eerste managementhuddle te richten, niet om individuen te beoordelen.',
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
            In de huidige wave blijft onboarding assisted en single-checkpoint. Geen hire-date engine, geen cohortmodel
            en geen brede client onboarding-layer.
          </div>
          <div className="marketing-link-grid">
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
              Bekijk trustgrenzen
            </Link>
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <MarketingProofStrip
          items={[
            {
              title: 'Vroeg checkpoint',
              body: 'Onboarding opent alleen als de vraag echt gaat over de eerste landing van nieuwe medewerkers in deze fase, niet als brede people-suite.',
            },
            {
              title: 'Assisted handoff',
              body: 'De output eindigt bij eerste eigenaar, eerste kleine actie en expliciete reviewgrens in plaats van een open eindeloze actielijst.',
            },
            {
              title: 'Methodische grens',
              body: 'De route blijft een groepsread van een enkel checkpoint en claimt geen latere retentie-uitkomst, manageroordeel of volledige journeyanalyse.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Wanneer deze route logisch wordt',
              body: 'Gebruik onboarding wanneer management vroeg wil toetsen hoe nieuwe medewerkers nu landen en die vraag smaller is dan een bredere retentiescan of teamscan.',
            },
            {
              title: 'Wat je nu krijgt',
              body: 'Een assisted single-checkpoint read met vroege lifecycle-signalen, eerste eigenaar, begrensde eerste actie en een heldere reviewgrens.',
            },
            {
              title: 'Wat het nadrukkelijk niet is',
              body: 'Geen client onboarding-tool, geen journey-engine, geen performance-instrument en geen brede employee lifecycle-suite.',
            },
          ].map((card) => (
            <div key={card.title} className="marketing-panel p-7">
              <h2 className="text-xl font-semibold text-slate-950">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <MarketingComparisonTable
            columns={['Thema', 'Onboarding 30-60-90', 'Client onboarding']}
            rows={[
              [
                'Startpunt',
                'Wanneer een vroege managementvraag openstaat over hoe nieuwe medewerkers nu landen in een checkpoint.',
                'Wanneer Verisight een klant technisch en operationeel live helpt gaan.',
              ],
              [
                'Wat je leest',
                'Groepssignalen, eerste eigenaar, eerste kleine actie en reviewgrens op dit meetmoment.',
                'Implementatievoortgang, adoptie, support en deliveryafstemming.',
              ],
              [
                'Waar het voor dient',
                'Vroege lifecycle-duiding en eerste managementhuddle voor nieuwe instroom.',
                'Zorgen dat de klant goed gestart is met de dienst en eerste waarde bereikt.',
              ],
              [
                'Niet bedoeld als',
                'Volledige 30-60-90 suite, retentiepredictie of brede journey-automation.',
                'Employee lifecycle-meetproduct of surveyroute voor nieuwe medewerkers.',
              ],
            ]}
          />

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat onboarding wel belooft</p>
            <h2 className="mt-4 font-display text-4xl text-white">
              Een vroege checkpoint-read met owner en eerste actie, geen brede onboardingmachine.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Onboarding 30-60-90 verkoopt geen volledige employee journey. Het product helpt vooral om vroeg te zien
              hoe nieuwe medewerkers nu landen, welke frictie of borging als eerste aandacht vraagt en wie daar de
              eerste handoff op pakt.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Geen hire-date engine of multi-checkpoint orchestration in deze wave.',
                'Geen individuele onboardingbeoordeling of manageroordeel.',
                'Wel een compacte route om HR, onboarding-owner en leiding sneller op een lijn te krijgen.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Toets of onboarding als lifecycle-vervolgronde nu echt logisch is."
          body="Beschrijf kort welke vraag nu speelt rond nieuwe medewerkers en of het gaat om een vroeg checkpoint, een bredere retentievraag of juist client onboarding. Dan bepalen we welke route past."
          defaultRouteInterest="onboarding"
          defaultCtaSource="product_onboarding_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Lifecyclegrens"
          title="Twijfel je tussen onboarding, RetentieScan of client onboarding?"
          body="We helpen je kiezen tussen een vroege onboardingcheck, een bredere retentie- of teamroute of terug naar implementatiebegeleiding. Zo blijft de vervolgstap kleiner en eerlijker dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function LeadershipScanPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_hero' })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-700">Leadership Scan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Begrensde managementread na een bestaand people-signaal.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Leadership Scan helpt bepalen welke managementcontext nu als eerste duiding of verificatie vraagt, zonder
            named leaders, 360-logica of performanceframing te openen.
          </p>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-white/10 text-slate-200">Bounded follow-on route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Gebruik Leadership Scan pas nadat een breder signaal al zichtbaar is.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              De waarde zit in een groepsniveau-managementread: welke context vraagt eerst gesprek, verificatie of
              een kleine correctie, zonder named leaders of hierarchy-output.
            </p>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            Deze route blijft group-level only: geen 360-tool, geen performance-instrument en geen oordeel over
            individuele leidinggevenden.
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <MarketingProofStrip
          items={[
            {
              title: 'Managementcontext eerst',
              body: 'De route helpt bepalen waar leidingcontext als eerste bounded verificatie vraagt na een bestaand people-signaal.',
            },
            {
              title: 'Groepsniveau blijft leidend',
              body: 'Output blijft geaggregeerd, suppressie-aware en zonder named leader readouts.',
            },
            {
              title: 'Kleine vervolgstap',
              body: 'De eerste uitkomst is een eigenaar, een eerste managementcheck en een reviewgrens, niet een brede leadership-suite.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Wanneer deze route logisch wordt',
              body: 'Na een bestaand signaal uit ExitScan, RetentieScan, TeamScan of onboarding, wanneer de vraag verschuift naar managementcontext en eerste verificatie.',
            },
            {
              title: 'Wat je nu krijgt',
              body: 'Een bounded managementread met groepssignaal, eerste eigenaar, eerste verificatievraag en duidelijke reviewgrens.',
            },
            {
              title: 'Wat het nadrukkelijk niet is',
              body: 'Geen named leader report, geen hierarchy-model, geen 360-beoordeling en geen performance-instrument.',
            },
          ].map((card) => (
            <div key={card.title} className="marketing-panel p-7">
              <h2 className="text-xl font-semibold text-slate-950">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Toets of Leadership Scan nu de logische vervolgronde is."
          body="Beschrijf kort welk bestaand signaal nu speelt en waarom de vraag verschuift naar managementcontext. Dan bepalen we of Leadership Scan echt de juiste bounded follow-on route is."
          defaultRouteInterest="leadership"
          defaultCtaSource="product_leadership_form"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function CombinatiePage() {
  return (
    <MarketingPageShell
      theme="combination"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-sky-700">Combinatie</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Gebruik ExitScan en RetentieScan als bewuste portfolioroute.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            De combinatie is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen
            signaleren waar behoud nu onder druk staat, zonder daarvan een bundel of standaardpakket te maken. Het is
            geen derde kernproduct.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan kennismaking
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-[#3C8D8A]/10 text-[#DCEFEA]">Portfolioroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              De combinatie is geen verplichte instap, maar een route voor twee echte managementvragen.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze pagina moet duidelijk maken dat het portfolio pas sterker wordt zodra beide vragen bestaan en de
              eerste route al scherp staat.
            </p>
            <div className="marketing-stage-list">
              {[
                'Stap 1: duid vertrek met ExitScan.',
                'Stap 2: signaleer behoud met RetentieScan.',
                'Stap 3: stuur in een gedeelde managementtaal.',
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
            Combinatie betekent niet meer features, maar twee gerichte routes die pas logisch naast elkaar komen te
            staan wanneer de eerste keuze al landt.
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
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="surface">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <div className="marketing-panel p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Portfolio-proof</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de gedeelde managementweergave pas na de keuze zien.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De combinatie gebruikt dezelfde previewstructuur, maar de echte sample-output blijft via ExitScan en
                RetentieScan publiek verifieerbaar.
              </p>
              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <PreviewSlider variant="portfolio" />
              </div>
            </div>
            <PreviewEvidenceRail className="mt-6" variant="portfolio" />
          </div>

          <div className="grid gap-5">
            {exitSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="ExitScan-proof"
                title="ExitScan blijft de eerste sample-anchor."
                body="Gebruik de ExitScan-showcase om de primaire wedge te bewijzen voordat de portfolio-aanpak in beeld komt."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
            ) : null}
            {retentionSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="RetentieScan-proof"
                title="RetentieScan bevestigt de tweede route."
                body="Gebruik de RetentieScan-showcase om te laten zien hoe vroegsignalering op behoud aansluit zodra de actieve behoudsvraag echt bestaat."
                asset={retentionSampleAsset}
                linkLabel="Open RetentieScan-voorbeeldrapport"
              />
            ) : null}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingProofStrip
          items={[
            {
              title: 'Stap 1: duid vertrek',
              body: 'Gebruik ExitScan om vertrekpatronen en terugkerende werkfactoren achteraf scherp te krijgen.',
            },
            {
              title: 'Stap 2: signaleer behoud',
              body: 'Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema\'s nu nog doorwerken in actieve teams.',
            },
            {
              title: 'Stap 3: stuur in een lijn',
              body: 'Gebruik een gedeelde managementtaal voor prioritering, opvolging en herhaalmeting.',
            },
          ]}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <MarketingComparisonTable
            columns={['Routevraag', 'Betekenis']}
            rows={[
              ['Hoofdvraag', 'Hoe verbinden we vertrekduiding en vroegsignalering in dezelfde lijn?'],
              ['Leesrichting', 'Achteraf begrijpen en vooruit kijken'],
              ['Managementoutput', 'Twee gerichte scans in een gedeeld portfolio'],
              ['Niet bedoeld als', 'Een algemene survey waar alles tegelijk in wordt gepropt'],
            ]}
          />

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-300">Hoe je het verkoopt</p>
            <h2 className="font-display mt-4 text-4xl text-white">
              Start vaak met een product, maar houd de tweede route bewust klaar.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              De combinatie is geen verplichte instap. Het is een koopreden voor organisaties die beide vragen tegelijk
              serieus willen adresseren in dezelfde managementtaal.
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingInlineContactPanel
          eyebrow="Kennismaking"
          title="Plan een gesprek over de combinatieroute"
          body="Beschrijf kort of jullie vooral met een product willen starten of dat beide managementvragen nu al tegelijk spelen. Dan bepalen we welke route logisch is."
          defaultRouteInterest="combinatie"
          defaultCtaSource="product_combination_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title="Wil je bepalen of de combinatie logisch is?"
          body="In een kort gesprek kijken we of jullie vooral met een product moeten starten of dat beide managementvragen pas na de eerste route genoeg onderbouwd zijn voor een portfolio-aanpak."
          primaryHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_callout' })}
          primaryLabel="Plan kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk producten"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

function UpcomingProductPage({ slug }: { slug: string }) {
  const product = getMarketingProductBySlug(slug)
  if (!product) notFound()
  return (
    <MarketingPageShell
      theme="support"
      pageType="support"
      ctaHref={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_hero` })}
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-600">Bewust nog niet actief</p>
          <h1 className="marketing-hero-title marketing-hero-title-page font-display text-slate-950">{product.label}</h1>
          <p className="marketing-hero-copy text-slate-600">{product.description}</p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'exitscan', ctaSource: `upcoming_${slug}_contact` })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Neem contact op
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Terug naar producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-white/10 text-slate-200">Gereserveerde future route</span>
            <h2 className="marketing-stage-title font-display text-white">
              Deze productroute blijft ondersteunend zolang ExitScan en RetentieScan de live propositie dragen.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Zo kan het portfolio later groeien zonder dat de huidige publieke navigatie of verkoopflow
              productverwarring krijgt.
            </p>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            Deze route is bewust nog geen onderdeel van de actieve publieke kernportfolio.
          </div>
        </MarketingHeroSupport>
      }
    >
      <MarketingSection tone="plain">
        <div className="marketing-panel p-8 text-center md:p-12">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">
            Bewust nog niet actief
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-slate-950">{product.tagline}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Deze productpagina is bewust gereserveerd binnen de bredere productstructuur. Daardoor kan Verisight later
            groeien zonder dat de huidige kernportfolio opnieuw op de schop hoeft of nu al productverwarring krijgt.
          </p>
        </div>
      </MarketingSection>
    </MarketingPageShell>
  )
}
