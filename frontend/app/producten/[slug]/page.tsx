import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
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

// Pulse, Leadership Scan en Combinatie zijn uit het publieke portfolio gehaald
// (portfolio-cleanup spec). De pagina-functies blijven bestaan — hun technische
// verwijdering is een apart traject — maar de routes mogen voor bezoekers niet
// meer zichtbaar zijn, dus ze geven 404 en staan niet meer in sitemap/static params.
const PUBLICLY_REMOVED_PRODUCT_SLUGS = new Set(['pulse', 'leadership-scan', 'combinatie'])

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.filter(
    (product) => !PUBLICLY_REMOVED_PRODUCT_SLUGS.has(product.slug),
  ).map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  if (PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) return {}
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
    ...(slug === 'cultuurbeeld' ? { robots: { index: false, follow: false } } : {}),
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
  if (PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) notFound()

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
      {slug === 'cultuurbeeld' ? <CultureAssessmentPage /> : null}
      {slug === 'onboarding-30-60-90' ? <OnboardingModernPage /> : null}
      {!['retentiescan', 'exitscan', 'cultuurbeeld', 'onboarding-30-60-90'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
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

function CultureAssessmentPage() {
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFCF8', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)',
    violet: 'oklch(0.48 0.20 290)', violetSoft: 'oklch(0.95 0.045 290)', violetFaint: 'oklch(0.975 0.018 290)',
  }
  const FF = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'culture_assessment', ctaSource: 'product_culture_assessment_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Toets Loep Cultuurbeeld" />
      <main>
        {/* ── Hero ── */}
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${T.violetFaint} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase' as const, color: T.violet }}>Loep Cultuurbeeld</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '14ch' }}>
                  Wij brengen cultuur en engagement in beeld. U weet wat bestuurlijk aandacht vraagt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Loep voert de jaarlijkse cultuur- en engagementbaseline uit, analyseert de uitkomsten en levert een board-read met eerste aandachtspunten. Geen survey-platform — een begeleid traject.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.violet }}>
                    Toets Loep Cultuurbeeld
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.violetFaint, border: `1px solid ${T.violetSoft}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 16 }}>vanaf €6.500 {'•'} Baseline</div>
                  {[
                    'Board-read rapport met Loep Culture Index en domeinanalyse',
                    'Begeleide directie-read sessie (60–90 min)',
                    'Top/bottom items en bestuurlijke aandachtspunten',
                    'AVG-conforme dataverwerking en minimum-n-waarborgen',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.violetSoft}` : 'none', fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: T.violet, flexShrink: 0, marginTop: 4 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wanneer logisch ── */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 16 }}>Wanneer Loep Cultuurbeeld nu de juiste stap is</div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  'De vraag gaat organisatiebreed over cultuur, engagement of werkbeleving — niet over één team of één factor',
                  'Directie of board wil een eerste patroonlezing voordat er interventies worden gestart',
                  'Er is geen actueel breed medewerkeronderzoek en de vraag is: waar moeten we het gesprek beginnen?',
                  'U wil snel een eerste beeld zonder een groot MTO-traject op te starten',
                ].map((text) => (
                  <div key={text} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '18px 20px' }}>
                    <div style={{ width: 6, height: 6, background: T.violet, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 28 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 14 }}>Baseline of herhaalritme</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft, marginBottom: 26, maxWidth: '54ch' }}>
                Kies eerst of u een eerste organisatiebreed cultuurbeeld nodig heeft, of een terugkerend ritme om cultuur en engagement structureel te volgen.
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[
                  {
                    label: 'Baseline',
                    accent: T.violet,
                    points: [
                      'Eerste brede read van cultuur, engagement en werkbeleving op organisatieniveau',
                      'Geschikt als er nog geen recent breed cultuurbeeld is',
                      'Levert board-read met aandachtspunten en eerste prioritering',
                    ],
                  },
                  {
                    label: 'Herhaalritme',
                    accent: T.inkMuted,
                    points: [
                      'Voor organisaties die cultuur en engagement structureel willen blijven volgen',
                      'Logisch als baseline al staat en directie jaarlijks wil toetsen wat verandert',
                      'Zelfde vragenlijst — zo zijn metingen vergelijkbaar over de tijd',
                    ],
                  },
                ].map(({ label, accent, points }) => (
                  <div key={label} style={{ padding: '28px', background: T.white, border: `1px solid ${T.rule}`, borderTop: `3px solid ${accent}` }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 16 }}>{label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                      {points.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
                          <div style={{ width: 4, height: 4, background: accent, flexShrink: 0, marginTop: 5 }} />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Wat u ontvangt ── */}
        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Loep levert het volgende — allemaal inbegrepen, niets los te bestellen:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {[
                    'Board-read rapport met Loep Culture Index, domeinprofiel en bestuurlijke aandachtspunten',
                    'Begeleide directie-read sessie (60–90 min): samen de eerste managementvraag kiezen',
                    'Top/bottom itemranking en sterktes & aandachtspunten per domein',
                    'Segmentinzicht per afdeling waar respons dat toelaat (boven minimum-n)',
                    'HR-bijlage met itemscores per domein voor HR-partner',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.paperSoft, border: `1px solid ${T.rule}`, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: T.violet, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 22, padding: '18px 20px', border: `1px solid ${T.rule}`, background: T.white }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.inkFaint, marginBottom: 8 }}>Wat bewust begrensd blijft</div>
                  <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                    Geen benchmarking met externe normen in v1 · Geen named manager detail standaard · Geen individuele voorspellingen · Geen automatische interventie · Geen self-serve platform.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.violet, whiteSpace: 'nowrap' as const }}>
                  Toets Loep Cultuurbeeld
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, whiteSpace: 'nowrap' as const }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Vergelijking ── */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '52ch', marginBottom: 32 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 14 }}>Loep Cultuurbeeld versus de alternatieven</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Wat maakt Loep Cultuurbeeld anders dan een groot MTO-traject of een generiek survey-platform?
              </p>
            </div>
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.white, borderBottom: `2px solid ${T.rule}` }}>
                    {['Thema', 'Loep Cultuurbeeld', 'Groot MTO-bureau', 'DIY survey-platform'].map((col, i) => (
                      <th key={col} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: i === 1 ? T.violet : T.inkMuted }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Doorlooptijd', '5 werkdagen na sluiting', '6–12 weken', 'Onbepaald — u doet het zelf'],
                    ['Begeleiding', 'Inbegrepen — board-read sessie door Loep', 'Consultancydag apart geprijsd', 'Geen — u interpreteert zelf'],
                    ['Vragenlijst', 'Vaste 40-item enterprise-baseline', 'Op maat, lang traject', 'Zelf bouwen, geen validatie'],
                    ['Governance', 'Minimum-n hardcoded, manager detail standaard locked', 'Afhankelijk van afspraken', 'Niet ingebouwd'],
                    ['Prijs', 'Vanaf €6.500', '€25.000–€100.000+', 'Laag instap, hoge tijdsinvestering'],
                    ['Geschikt voor', 'MKB 50–1000 fte, directie als koper', 'Enterprise 1000+ fte', 'Teams die zelf willen bouwen'],
                  ].map(([thema, ...cols]) => (
                    <tr key={thema} style={{ borderBottom: `1px solid ${T.rule}`, background: T.white }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: T.ink, verticalAlign: 'top' }}>{thema}</td>
                      {cols.map((c, i) => (
                        <td key={i} style={{ padding: '12px 14px', color: i === 0 ? T.inkSoft : T.inkMuted, verticalAlign: 'top', fontWeight: i === 0 ? 500 : 400 }}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: 'culture_assessment', ctaSource: 'product_culture_assessment_form' })}
          showSectionMark={false}
          backdropNumber={null}
          title="Toets of Loep Cultuurbeeld"
          accentTitle="nu de juiste eerste stap is."
          body="Beschrijf kort welke cultuur- of engagementvraag nu speelt. Dan toetsen we of Loep Cultuurbeeld past en wanneer een board-read de meeste waarde geeft."
          buttonLabel="Toets Loep Cultuurbeeld"
          note="U krijgt eerst een route-inschatting, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function ExitScanPage() {
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFCF8', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)',
  }
  const AC = { deep: 'oklch(0.45 0.18 50)', mid: 'oklch(0.76 0.14 53)', soft: 'oklch(0.95 0.045 50)' }
  const FF = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Bespreek of deze scan past" />
      <main>
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: AC.deep }}>ExitScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Wij brengen vertrekpatronen scherp in beeld. U weet wat u als eerste kunt aanpakken.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Loep voert de ExitScan uit, analyseert de uitkomsten en begeleidt u naar één eerste managementkeuze. U hoeft niets zelf in te richten.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Bespreek of deze scan past
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>vanaf €4.500 {'\u2022'} Baseline</div>
                  {[
                    'Managementrapport met factoranalyse en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste keuze en vervolgrichting vastgesteld',
                    'AVG-conforme dataverwerking',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.rule}` : 'none', fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 4 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Dit is het juiste moment voor ExitScan</div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  'Vertrek is zichtbaar maar de reden is onduidelijk',
                  'Management vraagt om een onderbouwd beeld',
                  'U wilt van losse exitgesprekken naar een structureel patroon',
                  'U wilt een eerste keuze, geen breed onderzoeksproject',
                ].map((text) => (
                  <div key={text} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '18px 20px' }}>
                    <div style={{ width: 6, height: 6, background: AC.deep, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Loep levert het volgende:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Intake en scopebepaling',
                    'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',
                    'Respons monitoren op campagneniveau',
                    'Managementrapport met patronen en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste vervolgrichting vastgelegd',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.paperSoft, border: `1px solid ${T.rule}`, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div id="segment-deep-dive" style={{ marginTop: 22, padding: '18px 20px', border: `1px solid ${T.rule}`, background: T.white }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Afdelings- of segmentverdieping waar relevant</div>
                  <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                    Waar voldoende respons en metadata beschikbaar zijn, kan ExitScan het vertrekbeeld ook op afdelings-, functiegroep- of locatieniveau verdiepen.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.ink, whiteSpace: 'nowrap' }}>
                  Bespreek of deze scan past
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_form' })}
          showSectionMark={false}
          backdropNumber={null}
          title="Toets of ExitScan"
          accentTitle="nu de juiste eerste stap is."
          body="Beschrijf kort welk vertrekvraagstuk nu speelt. Dan toetsen we of ExitScan past, welke variant logisch is en wat u als eerste terugkrijgt."
          buttonLabel="Bespreek of deze scan past"
          note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function RetentionScanPage() {
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFCF8', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)',
    teal: 'oklch(0.50 0.12 188)', tealSoft: 'oklch(0.94 0.04 185)', tealFaint: 'oklch(0.972 0.018 185)',
  }
  const FF = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Bespreek of deze scan past" />
      <main>
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.teal }}>RetentieScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Wij laten zien waar behoud onder druk staat, voordat uitstroom zichtbaar wordt. U weet wat u als eerste kunt aanpakken.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Loep voert de RetentieScan uit bij uw actieve medewerkers, levert het rapport en begeleidt u naar één eerste managementkeuze.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Bespreek of deze scan past
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.tealFaint, border: `1px solid ${T.tealSoft}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>vanaf €4.500 {'\u2022'} Baseline</div>
                  {[
                    'Managementrapport met retentiesignaal en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Geen individuele signalen — alleen groepsniveau',
                    'AVG-conforme dataverwerking',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.tealSoft}` : 'none', fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 4 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Wanneer RetentieScan nu de juiste eerste stap is</div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  'Verloop loopt op maar de oorzaak is onduidelijk',
                  'U wilt bijsturen vóór mensen vertrekbesluiten hebben genomen',
                  'Management wil weten waar het risico zit, niet alleen een gevoel',
                  'U wilt een eerste keuze, geen breed MTO-project',
                ].map((text) => (
                  <div key={text} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '18px 20px' }}>
                    <div style={{ width: 6, height: 6, background: T.teal, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Loep levert het volgende:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Intake en scopebepaling',
                    'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',
                    'Respons monitoren op campagneniveau',
                    'Managementrapport met patronen en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste vervolgrichting vastgelegd',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.paperSoft, border: `1px solid ${T.rule}`, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 22, padding: '18px 20px', border: `1px solid ${T.rule}`, background: T.white }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Afdelings- of segmentverdieping waar relevant</div>
                  <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                    Waar voldoende respons en metadata beschikbaar zijn, kan RetentieScan behoudsdruk ook op afdelings-, functiegroep- of locatieniveau verdiepen.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.ink, whiteSpace: 'nowrap' }}>
                  Bespreek of deze scan past
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_form' })}
          showSectionMark={false}
          backdropNumber={null}
          title="Toets of RetentieScan"
          accentTitle="nu de juiste eerste stap is."
          body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan past, welke variant logisch is en wat u als eerste terugkrijgt."
          buttonLabel="Bespreek of deze scan past"
          note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function OnboardingModernPage() {
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFCF8', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    amber: 'oklch(0.56 0.15 68)', amberSoft: 'oklch(0.94 0.04 72)', amberFaint: 'oklch(0.975 0.025 72)',
  }
  const FF = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Bespreek of deze scan past" />
      <main>
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: 0.35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${T.amberFaint} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.amber }}>Onboarding 30-60-90</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 800, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: 0.97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Wij meten vroeg hoe nieuwe medewerkers landen. U weet wat als eerste aandacht vraagt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Loep voert de checkpoint-read uit en levert een rapport met wat opvalt in de eerste 90 dagen. U bepaalt daarna de eerste stap.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Bespreek of deze scan past
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.amberFaint, border: `1px solid ${T.amberSoft}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.amber, marginBottom: 16 }}>vanaf €4.500 {'\u2022'} Baseline</div>
                  {[
                    'Rapport met wat opvalt in landing, rol, leiding en team op groepsniveau',
                    'Begeleide managementbespreking (60-90 min)',
                    'Eerste eigenaar en hercheckmoment vastgesteld',
                    'AVG-conforme dataverwerking',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.amberSoft}` : 'none', fontSize: 13, color: T.inkSoft }}>
                      <div style={{ width: 4, height: 4, background: T.amber, flexShrink: 0, marginTop: 4 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.amber, marginBottom: 16 }}>Wanneer Onboarding 30-60-90 nu de juiste eerste stap is</div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[
                  'Nieuwe medewerkers landen ongelijk of haken vroeg af',
                  'U wilt vroeg toetsen hoe rol, leiding en team nu landen',
                  'Management wil een eerste beeld zonder brede retentiescan',
                  'U wilt eerst een kleine borg- of correctiestap bepalen',
                ].map((text) => (
                  <div key={text} style={{ alignItems: 'flex-start', background: T.white, border: `1px solid ${T.rule}`, display: 'flex', gap: 12, padding: '18px 20px' }}>
                    <div style={{ width: 6, height: 6, background: T.amber, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.amber, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Loep levert het volgende:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Intake en scopebepaling',
                    'Survey klaarzetten en launchpakket leveren (uitnodigingslink + tekst)',
                    'Respons monitoren op campagneniveau',
                    'Managementrapport met patronen en prioriteiten',
                    'Begeleide managementbespreking (60–90 min)',
                    'Eerste vervolgrichting vastgelegd',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: T.paperSoft, border: `1px solid ${T.rule}`, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: T.amber, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 22, padding: '18px 20px', border: `1px solid ${T.rule}`, background: T.white }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Wat bewust begrensd blijft</div>
                  <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                    Geen journey-automation, geen individuele beoordeling, geen performance-instrument en geen brede onboarding-suite.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.ink, whiteSpace: 'nowrap' }}>
                  Bespreek of deze scan past
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: T.inkSoft, border: `1px solid ${T.rule}`, whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        <MarketingClosingCta
          href={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_form' })}
          showSectionMark={false}
          backdropNumber={null}
          title="Toets of Onboarding 30-60-90"
          accentTitle="nu de juiste eerste stap is."
          body="Beschrijf kort waarom de eerste maanden van nieuwe medewerkers nu als eerste managementvraag spelen. Dan toetsen we of Onboarding 30-60-90 past en wat u als eerste terugkrijgt."
          buttonLabel="Bespreek of deze scan past"
          note="U krijgt eerst een korte kennismaking, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function OnboardingPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })}
      ctaLabel="Toets onboarding"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Onboarding 30-60-90</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Zie vroeg hoe nieuwe medewerkers landen.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Onboarding 30-60-90 helpt vroeg zichtbaar maken hoe nieuwe medewerkers nu landen in rol, leiding, team en
            werkcontext. U krijgt een compacte groepsread met een eerste vervolgrichting, eigenaar en hercheckmoment,
            zonder daar meteen een brede onboarding-suite van te maken.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_hero' })}
                className="marketing-button-primary-warm"
              >
                Toets onboarding
              </a>
              <Link href="/producten" className="marketing-button-secondary">
                Bekijk producten
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage surface="light">
          <div className="marketing-preview-shell">
            <div className="marketing-divider-title">Lifecycle-check</div>
            <div className="marketing-proof-frame">
              <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                <span className="marketing-chip">Checkpoint-read</span>
                <h2 className="mt-4 marketing-text-title-md">
                  Maak vroeg zichtbaar waar onboarding al goed landt en waar eerste frictie ontstaat.
                </h2>
                <p className="mt-4 marketing-text-body">
                  De route blijft bewust smal: precies een checkpoint per campaign, een assisted managementread,
                  een eerste vervolgrichting, een begrensde vervolgstap en een expliciet hercheckmoment.
                </p>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-3">
                {[
                  ['Waar u naar kijkt', 'Landing in rol, leiding, team en werkcontext op groepsniveau.'],
                  ['Waar het op eindigt', 'Eerste managementhuddle, kleine borg- of correctiestap en een hercheckmoment.'],
                  ['Wat het niet wordt', 'Geen journey-automation, geen individuele beoordeling en geen brede onboardingmachine.'],
                ].map(([title, body]) => (
                  <div key={title} className="marketing-process-card">
                    <p className="marketing-text-kicker">{title}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingHeroStage>
      }
      heroSupport={
        <MarketingHeroSupport>
          <div className="marketing-support-note text-sm leading-7 text-slate-600">
            Deze route blijft bewust compact: één meetmoment, groepsniveau en een eerste opvolgstap. Geen
            journey-automation of individuele beoordeling.
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
        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="space-y-5">
            <div className="marketing-divider-title">Waarom onboarding vroeg helpt</div>
            <h2 className="marketing-text-title-lg">Een vroege checkpoint-read voor nieuwe instroom.</h2>
            <p className="marketing-text-body-lg">
              Onboarding opent alleen als de vraag echt gaat over de eerste landing van nieuwe medewerkers in deze fase.
              De route helpt vroeg duiden, een eerste borg- of correctiestap kiezen en het vervolgmoment vastleggen,
              zonder onboarding om te bouwen tot brede people-suite.
            </p>
          </div>
          <div className="marketing-flow-stack">
            {[
              {
                title: 'Vroege landing zichtbaar',
                body: 'U ziet vroeg hoe nieuwe medewerkers landen in rol, leiding, team en werkcontext, zonder te wachten tot bredere uitval zichtbaar wordt.',
              },
              {
                title: 'Eerste eigenaar en gesprek',
                body: 'De output helpt kiezen wie het eerste gesprek trekt en welke kleine borg- of correctiestap nu logisch is.',
              },
              {
                title: 'Hercheck zonder brede rollout',
                body: 'De route eindigt bij een compact hercheckmoment, niet bij een grote onboardingmachine of open actielijst.',
              },
            ].map((item, index) => (
              <div key={item.title} className="marketing-process-card">
                <p className="marketing-text-kicker">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 marketing-detail-heading">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Wanneer deze route logisch wordt',
              body: 'Gebruik onboarding wanneer management vroeg wil toetsen hoe nieuwe medewerkers nu landen en die vraag smaller is dan een bredere retentiescan of combinatieroute.',
            },
            {
              title: 'Wat je nu krijgt',
              body: 'Een assisted single-checkpoint read met vroege lifecycle-signalen, eerste vervolgrichting, begrensde vervolgstap en een helder hercheckmoment.',
            },
            {
              title: 'Wat het nadrukkelijk niet is',
              body: 'Geen client onboarding-tool, geen journey-engine, geen performance-instrument en geen brede employee lifecycle-suite.',
            },
          ].map((card, index) => (
            <div key={card.title} className="marketing-route-card">
              <p className="marketing-text-kicker">{String(index + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 marketing-detail-heading">{card.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text)]">{card.body}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-5">
            <div className="marketing-divider-title">Onboarding naast RetentieScan</div>
            <h2 className="marketing-text-title-md">Onboarding 30-60-90 is geen RetentieScan voor nieuwe medewerkers.</h2>
            <p className="marketing-text-body">
              Beide routes kijken naar mensen-patronen, maar het tijdstip en de vraag zijn anders.
              Onboarding is een vroege checkpoint-read in de eerste 90 dagen.
              RetentieScan is een behoudsread voor actieve medewerkers die al langer in dienst zijn.
            </p>
            <MarketingComparisonTable
              columns={['Thema', 'Onboarding 30-60-90', 'RetentieScan']}
              rows={[
                [
                  'Doelgroep',
                  'Nieuwe medewerkers — eerste 30, 60 of 90 dagen in dienst.',
                  'Actieve medewerkers — al langer in dienst, risico op vertrek nog niet zichtbaar.',
                ],
                [
                  'Hoofdvraag',
                  'Hoe landen nieuwe medewerkers in rol, leiding, team en werkcontext?',
                  'Waar staat behoud onder druk voordat mensen een vertrekbesluit nemen?',
                ],
                [
                  'Tijdstip',
                  'Vroeg — in de eerste kwartalen na instroom, bij elk nieuw cohort.',
                  'Ongoing — als verloop oploopt of management eerder wil signaleren.',
                ],
                [
                  'Niet bedoeld als',
                  'Brede retentiemeting, journey-engine of predictiemodel voor uitstroom.',
                  'Onboardingcheck, introductiebegeleidingstool of lifecycle-suite.',
                ],
              ]}
            />
          </div>

          <div className="marketing-panel-dark p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat onboarding wel belooft</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.7vw,3rem)] font-bold leading-[1.02] text-white">
              Een vroege onboardingread met een eerste vervolgstap, niet meer dan nodig.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Onboarding 30-60-90 verkoopt geen volledige employee journey. Het product helpt vooral om vroeg te zien
              hoe nieuwe medewerkers nu landen, welke frictie of borging als eerste aandacht vraagt en welke
              vervolgrichting daar logisch uit volgt.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Geen hire-date engine of multi-checkpoint orchestration in deze wave.',
                'Geen individuele onboardingbeoordeling of manageroordeel.',
                'Wel een compacte route om HR, onboardingverantwoordelijke en leiding sneller op een lijn te krijgen.',
              ].map((item) => (
                <div key={item} className="marketing-detail-dark-card text-sm leading-7 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingClosingCta
        href={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_form' })}
        showSectionMark={false}
        backdropNumber={null}
      />

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Lifecyclegrens"
          title="Twijfel je of onboarding nu de juiste eerste route is?"
          body="We helpen je kiezen tussen een vroege onboardingcheck, een bredere retentie- of teamroute of terug naar implementatiebegeleiding. Zo blijft de vervolgstap kleiner en eerlijker dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'onboarding', ctaSource: 'product_onboarding_callout' })}
          primaryLabel="Toets onboarding"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

void OnboardingPage

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
