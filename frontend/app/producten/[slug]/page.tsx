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
    product.status === 'live'
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
      {slug === 'combinatie' ? <CombinatiePage /> : null}
      {!['retentiescan', 'exitscan', 'combinatie'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
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
              Begrijp waarom medewerkers vertrekken
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
              Beschikbaar als retrospectieve analyse of live scan.
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

        {/* 2 — Retrospectief vs. live */}
        <MarketingSection tone="tint">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Varianten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Retrospectief of live?</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              {
                label: 'Retrospectief',
                points: [
                  'Analyse van vertrek in de afgelopen 12 maanden',
                  'Geschikt als er al vertrek heeft plaatsgevonden',
                  'Geen actieve respondenten nodig — ex-medewerkers',
                ],
              },
              {
                label: 'Live',
                points: [
                  'Real-time inzicht bij lopend verloop',
                  'Geschikt als u patroonvorming vroeg wilt signaleren',
                  'Respondenten vullen in op het moment van vertrek',
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
                'Managementrapport voor HR, MT en directie',
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
              Zie waar behoud en werkfrictie onder druk staan
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-[#4A5563]">
              Beschikbaar als live meting of gerichte momentopname.
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
              'Bij behoefte aan MT-rapportage over retentierisico\'s',
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

        {/* 5 — Live vs. momentopname */}
        <MarketingSection tone="surface">
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[#3C8D8A]">Varianten</p>
          <h2 className="mt-3 text-xl font-medium text-[#132033]">Live meting of momentopname?</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {[
              {
                label: 'Live meting',
                points: [
                  'Actuele signalen bij actieve medewerkers',
                  'Geschikt voor doorlopend inzicht in retentierisico\'s',
                  'Sterk als u trends wilt volgen over tijd',
                ],
              },
              {
                label: 'Momentopname',
                points: [
                  'Gerichte baseline voor een specifiek moment',
                  'Geschikt als startpunt voor gerichte opvolging',
                  'Sneller op te zetten, helder afgebakend',
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
                'Managementrapport voor HR, MT en directie',
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
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
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
            <span className="marketing-stage-tag bg-sky-400/12 text-sky-100">Portfolioroute</span>
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
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
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
