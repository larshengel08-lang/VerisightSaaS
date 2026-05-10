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
import { FollowOnRoutePage } from '@/components/marketing/follow-on-route-page'
import { OnboardingSecondaryPage } from '@/components/marketing/onboarding-secondary-page'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { PublicFooter } from '@/components/marketing/public-footer'
import { PublicHeader } from '@/components/marketing/public-header'
import { buildContactHref } from '@/lib/contact-funnel'
import { getFollowOnRouteContent } from '@/lib/follow-on-route-content'
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
      {slug === 'onboarding-30-60-90' ? <OnboardingSecondaryPage /> : null}
      {['pulse', 'leadership-scan', 'combinatie'].includes(slug) ? (
        <FollowOnRoutePage route={getFollowOnRouteContent(slug)!} />
      ) : null}
      {!['retentiescan', 'exitscan', 'onboarding-30-60-90', 'pulse', 'leadership-scan', 'combinatie'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
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
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFFFF', page: '#FFFFFF', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)',
  }
    const AC = { deep: 'oklch(0.45 0.18 50)', mid: 'oklch(0.76 0.14 53)', soft: 'oklch(0.95 0.045 50)' }
const FF = 'var(--font-playfair), serif'
    const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
    const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'
    const featureCardStyle = {
      background: T.white,
      border: `1px solid ${T.ruleLight}`,
      borderRadius: 28,
      boxShadow: cardShadow,
    } as const
    const rowCardStyle = {
      background: T.paper,
      border: `1px solid ${T.ruleLight}`,
      borderRadius: 22,
    } as const
    const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_hero' })

  return (
    <div style={{ background: T.page, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        <section style={{ background: T.page, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: AC.deep }}>ExitScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Begrijp waarom medewerkers vertrekken en waar actie het eerst telt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Voor organisaties die vertrek niet alleen willen registreren, maar scherp willen begrijpen waar patronen terugkomen en waar actie het eerst effect heeft.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Plan een kennismaking
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
                </div>
                <div>
                  <div style={{ ...featureCardStyle, padding: '28px' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Baseline</div>
                    {[
                      'Dashboard met prioriteiten en factoranalyse',
                      'Managementrapport voor HR, MT en directie',
                      'Eerste handoff voor opvolging inbegrepen',
                      'AVG-conforme dataverwerking',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.ruleLight}` : 'none', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65 }}>
                        <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 4 }} />
                        {item}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.page, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Wanneer ExitScan nu de juiste eerste stap is</div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {[
                    'Vertrek is al zichtbaar of terugkerend',
                    'U wilt begrijpen waarom patronen terugkomen',
                    'U wilt snel zien waar actie of gesprek het eerst telt',
                    'U zoekt een eerste managementbeeld in plaats van alleen losse exitregistratie',
                  ].map((text) => (
                    <div key={text} style={{ ...featureCardStyle, alignItems: 'flex-start', display: 'flex', gap: 12, padding: '20px 22px' }}>
                      <div style={{ width: 6, height: 6, background: AC.deep, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                      <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                    </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 28 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 14 }}>Kies baseline of ritmeroute</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft, marginBottom: 26, maxWidth: '54ch' }}>
                Kies eerst of u een scherp vertrekbeeld nodig heeft of juist een terugkerend ritme om vertrek structureel te volgen.
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[
                  {
                    label: 'Baseline',
                    accent: AC.deep,
                    points: [
                      'Een scherp vertrekbeeld van recent vertrek',
                      'Geschikt als vertrek al zichtbaar of terugkerend is',
                      'Geeft een eerste managementbeeld van redenen, drivers en prioriteiten',
                    ],
                  },
                  {
                    label: 'Ritmeroute',
                    accent: T.inkMuted,
                    points: [
                      'Voor organisaties die vertrek structureel willen blijven volgen',
                      'Logisch als baseline, proces en ritme al staan',
                      'Houdt dezelfde leeslijn vast in dashboard en rapport',
                    ],
                  },
                  ].map(({ label, accent, points }) => (
                    <div key={label} style={{ ...featureCardStyle, padding: '28px' }}>
                      <span style={{ background: accent, borderRadius: 999, display: 'block', height: 4, marginBottom: 18, width: 26 }} />
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>{label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {points.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65 }}>
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

        <section style={{ background: T.page, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                U krijgt een leeslijn voor dashboard, rapport en eerste managementbespreking.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Dashboard met eerste vertrekbeeld en prioriteiten',
                    'Managementrapport met hoofdredenen, drivers en duiding',
                    'Eerste managementhouvast voor gesprek, verificatie en vervolg',
                    'Waar relevant: conditionele afdelings- of segmentverdieping bij voldoende respons',
                  ].map((item, i) => (
                    <div key={i} style={{ ...rowCardStyle, display: 'flex', gap: 12, padding: '16px 18px', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                  <div id="segment-deep-dive" style={{ ...featureCardStyle, marginTop: 22, padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Afdelings- of segmentverdieping waar relevant</div>
                    <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                      Waar voldoende respons en metadata beschikbaar zijn, kan ExitScan het vertrekbeeld ook op afdelings-, functiegroep- of locatieniveau verdiepen.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.ink, whiteSpace: 'nowrap' }}>
                  Plan een kennismaking
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
          buttonLabel="Plan een kennismaking"
          note="U krijgt eerst een route-inschatting, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function RetentionScanPage() {
  const T = {
    paper: 'oklch(0.978 0.010 62)', paperSoft: 'oklch(0.956 0.018 60)',
    white: '#FFFFFF', page: '#FFFFFF', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)',
    teal: 'oklch(0.50 0.12 188)', tealSoft: 'oklch(0.94 0.04 185)', tealFaint: 'oklch(0.972 0.018 185)',
  }
const FF = 'var(--font-playfair), serif'
    const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
    const cardShadow = '0 10px 28px rgba(22, 34, 56, 0.06), 0 2px 6px rgba(22, 34, 56, 0.04)'
    const featureCardStyle = {
      background: T.white,
      border: `1px solid ${T.ruleLight}`,
      borderRadius: 28,
      boxShadow: cardShadow,
    } as const
    const rowCardStyle = {
      background: T.paper,
      border: `1px solid ${T.ruleLight}`,
      borderRadius: 22,
    } as const
    const ctaHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_hero' })

  return (
    <div style={{ background: T.page, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        <section style={{ background: T.page, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.teal }}>RetentieScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>Terug naar producten</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink, maxWidth: '12ch' }}>
                  Zie eerder waar behoud onder druk komt te staan en wat nu aandacht vraagt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Voor organisaties die behoudsdruk eerder willen zien, voordat verloop zichtbaar oploopt en het gesprek te laat begint.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Plan een kennismaking
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
                </div>
                <div>
                  <div style={{ ...featureCardStyle, padding: '28px' }}>
                    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Baseline</div>
                    {[
                      'Dashboard met retentiesignaal en factoranalyse',
                      'Managementrapport voor HR, MT en directie',
                      'Geen individuele signalen, alleen groepsduiding',
                      'AVG-conforme dataverwerking',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.ruleLight}` : 'none', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65 }}>
                        <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 4 }} />
                        {item}
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: T.page, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Wanneer RetentieScan nu de juiste eerste stap is</div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {[
                    'U wilt eerder zien waar behoud onder druk staat',
                    'U wilt niet wachten tot verloop zichtbaar oploopt',
                    'U vermoedt behoudsdruk maar wilt eerst een scherp groepsbeeld',
                    'U zoekt vroegsignalering voor gesprek en verificatie, niet alleen terugblik',
                  ].map((text) => (
                    <div key={text} style={{ ...featureCardStyle, alignItems: 'flex-start', display: 'flex', gap: 12, padding: '20px 22px' }}>
                      <div style={{ width: 6, height: 6, background: T.teal, borderRadius: '50%', flexShrink: 0, marginTop: 9 }} />
                      <p style={{ fontSize: 14, lineHeight: 1.65, color: T.inkSoft }}>{text}</p>
                    </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}`, paddingTop: 28 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 14 }}>Kies baseline of ritmeroute</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft, marginBottom: 26, maxWidth: '56ch' }}>
                Kies eerst of u nu een scherp vroegsignaal nodig heeft of een ritme om behoudsdruk structureel te volgen.
              </p>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {[
                  {
                    label: 'Baseline',
                    accent: T.teal,
                    points: [
                      'Een scherp behoudsbeeld voor actieve teams',
                      'Geschikt als u nu eerst wilt zien waar behoud onder druk staat',
                      'Geeft een eerste managementbeeld van signalen, drivers en prioriteiten',
                    ],
                  },
                  {
                    label: 'Ritmeroute',
                    accent: T.inkMuted,
                    points: [
                      'Voor organisaties die behoudsdruk structureel willen blijven volgen',
                      'Logisch als baseline en eerste opvolging al staan',
                      'Houdt dezelfde leeslijn vast in dashboard en rapport',
                    ],
                  },
                  ].map(({ label, accent, points }) => (
                    <div key={label} style={{ ...featureCardStyle, padding: '28px' }}>
                      <span style={{ background: accent, borderRadius: 999, display: 'block', height: 4, marginBottom: 18, width: 26 }} />
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: accent, marginBottom: 12 }}>{label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {points.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.65 }}>
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

        <section style={{ background: T.page, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Wat u ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                U krijgt een leeslijn voor retentiesignaal, rapport en eerste managementbespreking.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Dashboard met retentiesignaal en eerste prioriteiten',
                    'Managementrapport met factoranalyse en duiding',
                    'Eerste managementhouvast voor gesprek, verificatie en vervolg',
                    'Waar relevant: conditionele afdelings- of segmentverdieping bij voldoende respons',
                  ].map((item, i) => (
                    <div key={i} style={{ ...rowCardStyle, display: 'flex', gap: 12, padding: '16px 18px', fontSize: 13.5, color: T.inkSoft, lineHeight: 1.6 }}>
                      <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                  <div style={{ ...featureCardStyle, marginTop: 22, padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: 8 }}>Afdelings- of segmentverdieping waar relevant</div>
                    <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.65 }}>
                      Waar voldoende respons en metadata beschikbaar zijn, kan RetentieScan behoudsdruk ook op afdelings-, functiegroep- of locatieniveau verdiepen.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.ink, whiteSpace: 'nowrap' }}>
                  Plan een kennismaking
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
          buttonLabel="Plan een kennismaking"
          note="U krijgt eerst een route-inschatting, geen verplicht uitgebreid traject."
        />
      </main>
      <PublicFooter />
    </div>
  )
}

function PulsePage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_hero' })}
      ctaLabel="Toets Pulse"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Pulse</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Zie kort wat nu verschuift na een eerste scan.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Pulse is de compacte hercheck na een eerste scan of managementgesprek. U ziet wat er nu verschuift, welk
            werkspoor als eerste aandacht vraagt en wanneer een volgende check logisch is.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_hero' })}
                className="marketing-button-primary-warm"
              >
                Toets Pulse
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
            <div className="marketing-divider-title">Compacte vervolgroute</div>
            <div className="marketing-proof-frame">
              <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                <span className="marketing-chip">Pulse snapshot</span>
                <h2 className="mt-4 marketing-text-title-md">
                  Lees wat nu verschuift, zonder opnieuw een brede scan te openen.
                </h2>
                <p className="mt-4 marketing-text-body">
                  Pulse blijft bewust smal: een actuele groepssnapshot, een begrensde vergelijking met de vorige
                  vergelijkbare Pulse en een expliciet hercheckmoment.
                </p>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-3">
                {[
                  ['Startpunt', 'Na een eerste baseline, managementread of eerste vervolgrichting.'],
                  ['Wat u leest', 'Huidige snapshot, topfactoren en alleen een beperkte vergelijking met de vorige Pulse.'],
                  ['Waar het op eindigt', 'Review nu, een eerste correctie en een helder volgend checkmoment.'],
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
            Pulse is bedoeld voor een korte hercheck, niet voor een nieuwe brede meting.
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
            <div className="marketing-divider-title">Waarom Pulse juist werkt als compacte hercheck</div>
            <h2 className="marketing-text-title-lg">Een korte reviewlaag na de eerste managementduiding.</h2>
            <p className="marketing-text-body-lg">
              Pulse laat op groepsniveau zien hoe de huidige werkbeleving en gekozen prioriteitsfactoren er nu voor
              staan. De route is bedoeld om sneller te reviewen, bij te sturen en een volgende check logisch te plannen,
              niet om opnieuw een brede eerste scan te verkopen.
            </p>
          </div>
          <div className="marketing-flow-stack">
            {[
              {
                title: 'Wanneer Pulse logisch is',
                body: 'Gebruik Pulse na een eerste scan of managementgesprek wanneer u gericht wilt herchecken wat nu verschuift, zonder opnieuw breed te meten.',
              },
              {
                title: 'Wanneer Pulse niet de juiste route is',
                body: 'Kies geen Pulse als de vraag nog een bredere eerste meting, extra duiding of een grotere vervolgroute nodig heeft.',
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
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              title: 'Wanneer Pulse logisch is',
              body: 'Pulse wordt logisch zodra management na ExitScan, RetentieScan of een eerste vervolgrichting niet opnieuw breed wil meten, maar wel gericht wil herchecken.',
            },
            {
              title: 'Wanneer Pulse niet de juiste route is',
              body: 'Gebruik Pulse niet als de vraag nog om een bredere eerste scan, extra duiding of een grotere vervolgroute vraagt.',
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
            <div className="marketing-divider-title">Pulse naast ritmeroute</div>
            <h2 className="marketing-text-title-md">Pulse en RetentieScan hebben niet dezelfde rol.</h2>
            <p className="marketing-text-body">
              Deze vergelijking laat dezelfde routegrens zien in de huidige stijl: Pulse blijft de smalle reviewlaag,
              terwijl RetentieScan de bredere herhaalvorm op behoud blijft dragen.
            </p>
            <MarketingComparisonTable
              columns={['Thema', 'Pulse', 'RetentieScan ritmeroute']}
              rows={[
                [
                  'Startpunt',
                  'Na een eerste baseline, managementread of eerste vervolgrichting wanneer een compacte hercheck logisch is.',
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
                  'Parallel hoofdpackage naast baseline zonder duidelijke vervolgrichting of ritme.',
                ],
              ]}
            />
          </div>

          <div className="marketing-panel-dark p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat Pulse wel belooft</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.7vw,3rem)] leading-[1.02] text-white">
              Een compacte managementcheck, geen brede trendbelofte.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Pulse verkoopt geen nieuwe brede eerste scan. Het product helpt vooral om na een eerste managementread sneller te
              zien waar review, beperkte correctie of een volgende check nu het meest logisch is.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Geen individuele signalen of persoonsgerichte actieroutes.',
                'Geen brede trendmachine of effectclaim over meerdere lagen tegelijk.',
                'Wel een compacte route om management, HR en leidinggevende sneller op een lijn te krijgen.',
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
        href={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_form' })}
        showSectionMark={false}
        backdropNumber={null}
      />

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Portfoliohelderheid"
          title="Twijfel je of Pulse nu de juiste hercheck is?"
          body="We helpen je kiezen tussen een compacte Pulse-hercheck, RetentieScan ritmeroute of een andere vervolgroute. Zo blijft de volgende stap scherp in plaats van breder dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_callout' })}
          primaryLabel="Toets Pulse"
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
            of begrensde vervolgstap vraagt.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan suite-demo
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
              De route blijft bewust smal: department-first lokale read, bounded prioritering, een eerste
              vervolgrichting en een begrensde vervolgstap zonder manager ranking of brede teamscorekaart.
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
              body: 'De output eindigt bij een eerste vervolgrichting, begrensde vervolgstap en een expliciet hercheckmoment voor de volgende lokale stap.',
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
                'Veilige afdelingsuitsplitsing, bounded prioriteit, eerste vervolgrichting en begrensde vervolgstap.',
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
              te zien waar lokale verificatie, een heldere vervolgrichting en een begrensde vervolgstap het meest logisch zijn.
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

      <MarketingClosingCta
        href={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_form' })}
        showSectionMark={false}
        backdropNumber={null}
      />

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Lokalisatiegrens"
          title="Twijfel je tussen TeamScan en een andere vervolgronde?"
          body="We helpen je kiezen tussen TeamScan, Segment Deep Dive of terug naar een bredere kernroute. Zo blijft de vervolgstap lokaal scherp in plaats van diffuser dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'teamscan', ctaSource: 'product_team_callout' })}
          primaryLabel="Plan suite-demo"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
        />
      </MarketingSection>
    </MarketingPageShell>
  )
}

void TeamScanPage

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
            <div className="marketing-divider-title">Onboarding naast implementatie</div>
            <h2 className="marketing-text-title-md">Verwar deze route niet met implementatiebegeleiding.</h2>
            <p className="marketing-text-body">
              Deze vergelijking houdt de route eerlijk. Onboarding 30-60-90 is een vroege managementread voor nieuwe
              medewerkers, niet dezelfde laag als implementatie, adoptie of deliverybegeleiding.
            </p>
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
                  'Groepssignalen, eerste vervolgrichting, eerste kleine vervolgstap en hercheckmoment op dit meetmoment.',
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
          </div>

          <div className="marketing-panel-dark p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat onboarding wel belooft</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.7vw,3rem)] leading-[1.02] text-white">
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

function LeadershipScanPage() {
  return (
    <MarketingPageShell
      theme="support"
      pageType="product"
      ctaHref={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_hero' })}
      ctaLabel="Toets Leadership Scan"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-slate-700">Leadership Scan</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Voeg managementcontext toe aan een bestaand people-signaal.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Leadership Scan helpt zichtbaar maken welke managementcontext een bestaand signaal mee kleurt en waar eerst
            gesprek of verificatie nodig is, zonder dit naar individuen te trekken.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_hero' })}
                className="marketing-button-primary"
              >
                Toets Leadership Scan
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
            <div className="marketing-divider-title">Managementcontext</div>
            <div className="marketing-proof-frame">
              <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
                <span className="marketing-chip">Follow-on route</span>
                <h2 className="mt-4 marketing-text-title-md">
                  Lees eerst welke managementcontext het bestaande signaal mee kleurt.
                </h2>
                <p className="mt-4 marketing-text-body">
                  De waarde zit in een groepsniveau-managementread: welke context vraagt eerst gesprek, verificatie of
                  een kleine correctie, zonder named leaders of hierarchy-output.
                </p>
              </div>
              <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-3">
                {[
                  ['Wat u toetst', 'Welke managementcontext het bestaande people-signaal mee kleurt.'],
                  ['Wat u niet opent', 'Geen 360-logica, geen performanceframing en geen oordeel over individuen.'],
                  ['Waar het op eindigt', 'Eerste verificatievraag, vervolgrichting en een helder hercheckmoment.'],
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
            Deze route blijft op groepsniveau: geen 360-tool, geen performance-instrument en geen oordeel over
            individuele leidinggevenden.
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
            <div className="marketing-divider-title">Waar Leadership Scan echt voor bedoeld is</div>
            <h2 className="marketing-text-title-lg">Voeg managementcontext toe zonder het signaal op individuen te trekken.</h2>
            <p className="marketing-text-body-lg">
              Leadership Scan helpt bepalen waar leidingcontext als eerste verificatie vraagt na een bestaand
              people-signaal. De route blijft een groepsread en eindigt bij een eerste managementcheck, een kleine
              vervolgrichting en een hercheckmoment.
            </p>
          </div>
          <div className="marketing-flow-stack">
            {[
              {
                title: 'Managementcontext eerst',
                body: 'De route helpt bepalen waar leidingcontext als eerste verificatie vraagt na een bestaand people-signaal.',
              },
              {
                title: 'Groepsniveau blijft leidend',
                body: 'Output blijft geaggregeerd, suppressie-aware en zonder named leader readouts.',
              },
              {
                title: 'Kleine vervolgstap',
                body: 'De eerste uitkomst is een eerste vervolgrichting, een eerste managementcheck en een hercheckmoment, niet een brede leadership-suite.',
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
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="space-y-5">
            <div className="marketing-divider-title">Routegrens</div>
            <h2 className="marketing-text-title-md">Gebruik Leadership Scan pas als de vraag echt over managementcontext gaat.</h2>
            <div className="grid gap-5">
              {[
                {
                  title: 'Wanneer deze route logisch wordt',
                  body: 'Na een bestaand signaal uit ExitScan, RetentieScan, onboarding of Pulse, wanneer de vraag verschuift naar managementcontext en eerste verificatie.',
                },
                {
                  title: 'Wat je nu krijgt',
                  body: 'Een bounded managementread met groepssignaal, eerste verificatievraag en een duidelijk hercheckmoment.',
                },
                {
                  title: 'Wat het nadrukkelijk niet is',
                  body: 'Geen named leader report, geen hierarchy-model, geen 360-beoordeling en geen performance-instrument.',
                },
              ].map((card, index) => (
                <div key={card.title} className="marketing-route-card">
                  <p className="marketing-text-kicker">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 marketing-detail-heading">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--text)]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="marketing-panel-dark p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9AD0D0]">Wat Leadership Scan wel belooft</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,3.7vw,3rem)] leading-[1.02] text-white">
              Een compacte managementread, niet bedoeld voor beoordeling van individuele leiders.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Leadership Scan helpt eerst duiden welke managementcontext een bestaand signaal mee kleurt. De route is
              bedoeld voor verificatie en een kleine vervolgstap, niet voor manager-ranking, 360-output of
              performanceframing.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Geen named leaders, geen individuele beoordelingen.',
                'Geen hierarchy-model of brede leadership-suite in deze route.',
                'Wel een compacte managementcheck die HR en leiding sneller op een lijn brengt.',
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
        href={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_form' })}
        showSectionMark={false}
        backdropNumber={null}
      />

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Vervolgroute"
          title="Twijfel je of Leadership Scan nu de juiste vervolgstap is?"
          body="We helpen je kiezen tussen Leadership Scan, een kernroute of een andere bounded vervolglaag. Zo blijft de volgende stap kleiner en helderder dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'leadership', ctaSource: 'product_leadership_callout' })}
          primaryLabel="Toets Leadership Scan"
          secondaryHref="/tarieven"
          secondaryLabel="Bekijk tarieven"
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
          <p className="marketing-hero-eyebrow text-sky-700">Combinatieroute</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Gebruik ExitScan en RetentieScan als bewuste vervolgroute.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            De combinatie is logisch voor organisaties die zowel willen leren van uitstroom als eerder willen
            signaleren waar behoud onder druk staat, zonder daar een standaardpakket van te maken. Het is geen derde
            kernroute. Dashboard, rapport en Action Center komen daarna in dezelfde omgeving samen.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_hero' })}
                className="inline-flex items-center justify-center rounded-full bg-[#3C8D8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(60,141,138,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#2d6e6b]"
              >
                Plan een kennismaking
              </a>
              <Link
                href="/producten"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
              >
                Bekijk de routes
              </Link>
            </div>
          </div>
        </MarketingHeroIntro>
      }
      heroStage={
        <MarketingHeroStage>
          <div className="space-y-5">
            <span className="marketing-stage-tag bg-[#3C8D8A]/10 text-[#DCEFEA]">Vervolgroute</span>
            <h2 className="marketing-stage-title font-display text-white">
              De combinatie is geen verplichte instap, maar een route voor twee concrete vragen.
            </h2>
            <p className="marketing-stage-copy text-slate-300">
              Deze pagina laat zien dat de combinatie pas sterker wordt zodra beide vragen bestaan en de eerste route
              al scherp staat. Pas daarna verbinden dashboard, rapport en Action Center zich in één gedeelde
              vervolglijn.
            </p>
            <div className="marketing-stage-list">
              {[
                'Stap 1: begrijp vertrek met ExitScan.',
                'Stap 2: signaleer behoud met RetentieScan.',
                'Stap 3: stuur vanuit een gedeelde vervolglijn.',
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
            staan wanneer de eerste keuze al landt en dezelfde omgeving daarna de vervolgstap kan dragen.
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Vervolgroute</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">
                Laat de gedeelde managementweergave pas na de eerste keuze zien.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                De combinatie gebruikt dezelfde previewstructuur, maar de echte voorbeeldoutput blijft via ExitScan en
                RetentieScan publiek verifieerbaar. Daarna moeten dashboard, rapport en Action Center wel in dezelfde
                vaste leeslijn blijven.
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
                title="ExitScan blijft het eerste publieke anker."
                body="Gebruik ExitScan eerst om de primaire route te bewijzen voordat de combinatieroute in beeld komt."
                asset={exitSampleAsset}
                linkLabel="Open ExitScan-voorbeeldrapport"
              />
            ) : null}
            {retentionSampleAsset ? (
              <SampleShowcaseCard
                eyebrow="RetentieScan-proof"
                title="RetentieScan bevestigt de vervolgstap."
                body="Gebruik RetentieScan om te laten zien hoe vroegsignalering op behoud aansluit zodra de actieve behoudsvraag echt speelt."
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
              title: 'Stap 1: begrijp vertrek',
              body: 'Gebruik ExitScan om vertrekpatronen en terugkerende werkfactoren achteraf scherp te krijgen.',
            },
            {
              title: 'Stap 2: signaleer behoud',
              body: 'Gebruik RetentieScan om eerder zichtbaar te maken waar dezelfde thema\'s nu nog doorwerken in actieve teams.',
            },
            {
              title: 'Stap 3: stuur in een lijn',
              body: 'Gebruik een gedeelde vervolglijn voor prioritering, opvolging en herhaalmeting via dashboard, rapport en Action Center.',
            },
          ]}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <MarketingComparisonTable
            columns={['Routevraag', 'Betekenis']}
            rows={[
              ['Hoofdvraag', 'Hoe verbinden we vertrekduiding en vroegsignalering in dezelfde lijn?'],
              ['Leesrichting', 'Achteraf begrijpen en vooruit kijken'],
              ['Managementoutput', 'Twee gerichte scans met dashboard, rapport en Action Center in een gedeelde vervolglijn'],
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
                serieus willen adresseren in dezelfde vervolglijn en uiteindelijk in dezelfde omgeving willen laten landen.
              </p>
            </div>
        </div>
      </MarketingSection>

      <MarketingClosingCta
        href={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_form' })}
        showSectionMark={false}
        backdropNumber={null}
      />

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Volgende stap"
          title="Wilt u toetsen of de combinatie logisch is?"
          body="In een kort gesprek kijken we of u vooral met een product moet starten of dat beide vragen pas na de eerste route genoeg onderbouwd zijn voor een combinatieroute in dezelfde omgeving."
          primaryHref={buildContactHref({ routeInterest: 'combinatie', ctaSource: 'product_combination_callout' })}
          primaryLabel="Plan een kennismaking"
          secondaryHref="/producten"
          secondaryLabel="Bekijk de routes"
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
