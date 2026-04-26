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
      {slug === 'onboarding-30-60-90' ? <OnboardingPage /> : null}
      {slug === 'leadership-scan' ? <LeadershipScanPage /> : null}
      {slug === 'combinatie' ? <CombinatiePage /> : null}
      {!['retentiescan', 'exitscan', 'pulse', 'onboarding-30-60-90', 'leadership-scan', 'combinatie'].includes(slug) ? <UpcomingProductPage slug={slug} /> : null}
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
    white: '#FFFCF8', navy: 'oklch(0.13 0.032 250)', ink: 'oklch(0.16 0.012 250)',
    inkSoft: 'oklch(0.32 0.010 250)', inkMuted: 'oklch(0.52 0.008 250)',
    inkFaint: 'oklch(0.70 0.006 250)', rule: 'oklch(0.875 0.012 62)',
    ruleLight: 'oklch(0.918 0.008 62)', teal: 'oklch(0.50 0.12 188)',
    tealFaint: 'oklch(0.972 0.018 185)',
  }
  const AC = { deep: 'oklch(0.45 0.18 50)', mid: 'oklch(0.76 0.14 53)', soft: 'oklch(0.95 0.045 50)', faint: 'oklch(0.976 0.018 50)' }
  const FF = 'var(--font-fraunces), serif'
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'exitscan', ctaSource: 'product_exit_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        {/* Hero */}
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${AC.soft} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: AC.deep }}>ExitScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>← Alle routes</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
                  <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink }}>
                    Breng vertrekduiding<br />
                    <em className="shimmer-text" style={{ fontStyle: 'italic' }}>scherp in beeld.</em>
                  </h1>
                </div>
                <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '46ch', margin: '26px 0 36px' }}>
                    Voor terugkijkende vertrekduiding op groepsniveau, eerst als baseline en daarna eventueel als ritmeroute.
                  </p>
                </div>
                <div style={{ animation: 'slideUpFade .7s cubic-bezier(.16,1,.3,1) .44s both', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Plan een kennismaking
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div style={{ animation: 'slideRightFade .8s cubic-bezier(.16,1,.3,1) .28s both' }}>
                <div style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>EUR 2.950 · Baseline</div>
                  {['Dashboard met prioriteiten en factoranalyse', 'Managementrapport voor HR, MT en directie', 'Bestuurlijke handoff inbegrepen', 'AVG-conforme dataverwerking'].map((item, i) => (
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

        {/* Varianten */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Varianten</div>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, marginBottom: 32, lineHeight: 1.1 }}>Baseline of ritmeroute?</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[
                { label: 'Baseline', accent: AC.deep, points: ['Analyse van recent vertrek, bijv. over de afgelopen 12 maanden', 'Geschikt als er al voldoende vertrekinput beschikbaar is', 'Geen actieve respondenten nodig — ex-medewerkers'] },
                { label: 'Ritmeroute', accent: T.inkMuted, points: ['Doorlopende vervolgroute nadat baseline, proces en eigenaar al staan', 'Geschikt als u actuele uitstroomsignalen wilt blijven volgen', 'Respondenten vullen in rond het moment van vertrek'] },
              ].map(({ label, accent, points }) => (
                <div key={label} style={{ padding: '28px', background: T.white, border: `1px solid ${T.rule}`, borderTop: `3px solid ${accent}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 16 }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </section>

        {/* Wanneer logisch */}
        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.deep, marginBottom: 16 }}>Wanneer logisch</div>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, marginBottom: 32, lineHeight: 1.1 }}>ExitScan is logisch in deze situaties</h2>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
              {[
                { text: 'Bij structureel verloop dat u wilt begrijpen', num: '01' },
                { text: 'Bij voorbereiding op een MT-bespreking over uitstroom', num: '02' },
                { text: 'Bij behoefte aan scherpere stuurinformatie voor HR en management', num: '03' },
                { text: 'Na een reorganisatie of fusie', num: '04' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '22px 20px', borderTop: `1px solid ${T.rule}`, borderLeft: i % 2 === 1 ? `1px solid ${T.rule}` : 'none' }}>
                  <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, minWidth: 24 }}>{item.num}</span>
                  <p style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
          </div>
        </section>

        {/* Wat u ontvangt — dark band */}
        <section style={{ background: T.navy, padding: 'clamp(48px,5.5vw,72px) 0' }}>
          <div style={{ ...SH }}>
            <div style={{ display: 'grid', gap: 'clamp(32px,5vw,64px)' }} className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: AC.mid, marginBottom: 18 }}>Wat u ontvangt</div>
                <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, letterSpacing: '-.022em', color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>
                  Dashboard, rapport en toelichting<br />
                  <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'oklch(.76 .14 53)' }}>in dezelfde leeslijn.</em>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Dashboard met prioriteiten en factoranalyse', 'Managementrapport voor HR, MT en directie met een eerste managementsessie als vaste vervolgstap', 'Toelichting op de uitkomsten en vervolgstappen', 'AVG-conforme dataverwerking'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.05)', fontSize: 13, color: 'rgba(247,245,241,.8)', lineHeight: 1.5 }}>
                      <div style={{ width: 4, height: 4, background: AC.mid, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div id="segment-deep-dive" style={{ marginTop: 24, padding: '18px 20px', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.inkFaint }}>Add-on</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 6, marginBottom: 6 }}>Segment Deep Dive</div>
                  <p style={{ fontSize: 12.5, color: 'rgba(247,245,241,.6)', lineHeight: 1.6 }}>Verdieping op een specifieke afdeling, functiegroep of locatie. Beschikbaar als er voldoende respondenten en metadata voor zijn.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'center', minWidth: 200 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: T.ink, background: '#fff', whiteSpace: 'nowrap' }}>
                  Plan een kennismaking
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.2)', whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section id="kennismaking" style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0' }}>
          <div style={{ ...SH, maxWidth: 820 }}>
            <MarketingInlineContactPanel
              eyebrow="Kennismaking"
              title="Plan een gesprek over ExitScan"
              body="Beschrijf kort welke vertrekvraag nu bestuurlijk aandacht vraagt. Dan toetsen we of ExitScan de juiste eerste stap is en hoe de aanpak eruitziet."
              defaultRouteInterest="exitscan"
              defaultCtaSource="product_exit_form"
            />
          </div>
        </section>
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
    teal: 'oklch(0.50 0.12 188)', tealMid: 'oklch(0.62 0.10 185)',
    tealSoft: 'oklch(0.94 0.04 185)', tealFaint: 'oklch(0.972 0.018 185)',
  }
  const FF = 'var(--font-fraunces), serif'
  const SH = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }
  const ctaHref = buildContactHref({ routeInterest: 'retentiescan', ctaSource: 'product_retention_hero' })

  return (
    <div style={{ background: T.paper, color: T.ink, overflowX: 'hidden' }}>
      <PublicHeader ctaHref={ctaHref} ctaLabel="Plan een kennismaking" />
      <main>
        {/* Hero */}
        <section style={{ background: T.white, padding: 'clamp(52px,6.5vw,80px) 0 clamp(48px,6vw,72px)', borderBottom: `1px solid ${T.rule}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${T.rule}60 1px,transparent 1px),linear-gradient(90deg,${T.rule}60 1px,transparent 1px)`, backgroundSize: '72px 72px', opacity: .35 }} />
          <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 500, background: `radial-gradient(circle,${T.tealFaint} 0%,transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ ...SH, position: 'relative' }}>
            <div style={{ animation: 'slideDownFade .55s cubic-bezier(.16,1,.3,1) .05s both', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: T.teal }}>RetentieScan</span>
              <div style={{ flex: 1, height: '1px', background: T.rule, maxWidth: 200 }} />
              <Link href="/producten" style={{ fontSize: 11, color: T.inkMuted, textDecoration: 'none' }}>← Alle routes</Link>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] items-start">
              <div>
                <div style={{ animation: 'slideUpFade .9s cubic-bezier(.16,1,.3,1) .15s both' }}>
                  <h1 style={{ fontFamily: FF, fontWeight: 400, fontSize: 'clamp(42px,5.5vw,76px)', lineHeight: .97, letterSpacing: '-.032em', color: T.ink }}>
                    Zie eerder waar<br />
                    <em style={{ fontStyle: 'italic', color: T.teal }}>behoud onder druk staat.</em>
                  </h1>
                </div>
                <div style={{ animation: 'slideUpFade .8s cubic-bezier(.16,1,.3,1) .3s both' }}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '46ch', margin: '26px 0 36px' }}>
                    Voor vroegsignalering op behoud op groeps- en segmentniveau, als baseline of ritmeroute.
                  </p>
                </div>
                <div style={{ animation: 'slideUpFade .7s cubic-bezier(.16,1,.3,1) .44s both', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.ink }}>
                    Plan een kennismaking
                  </a>
                  <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 500, padding: '11px 24px', color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                    Bekijk tarieven
                  </Link>
                </div>
              </div>
              <div style={{ animation: 'slideRightFade .8s cubic-bezier(.16,1,.3,1) .28s both' }}>
                <div style={{ padding: '28px', background: T.tealFaint, border: `1px solid ${T.tealSoft}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>EUR 3.450 · Baseline</div>
                  {['Dashboard met retentiesignaal en factoranalyse', 'Managementrapport voor HR, MT en directie', 'Geen individuele signalen — groepsduiding', 'AVG-conforme dataverwerking'].map((item, i) => (
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

        {/* Wanneer logisch */}
        <section style={{ background: T.paperSoft, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Wanneer logisch</div>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, marginBottom: 32, lineHeight: 1.1 }}>RetentieScan is logisch in deze situaties</h2>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
              {[
                { text: 'Vroeg signaleren voordat sprake is van verloop', num: '01' },
                { text: 'Na een verandertraject of reorganisatie', num: '02' },
                { text: 'Bij behoefte aan MT-rapportage over behoudsdruk en retentiesignalen', num: '03' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '22px 20px', borderTop: `1px solid ${T.rule}`, borderLeft: i > 0 ? `1px solid ${T.rule}` : 'none' }}>
                  <span style={{ fontFamily: FF, fontSize: 12, color: T.inkFaint, minWidth: 24 }}>{item.num}</span>
                  <p style={{ fontSize: 14, color: T.inkSoft, lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${T.rule}` }} />
          </div>
        </section>

        {/* Varianten */}
        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 16 }}>Varianten</div>
            <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,34px)', fontWeight: 400, letterSpacing: '-.02em', color: T.ink, marginBottom: 32, lineHeight: 1.1 }}>Baseline of ritmeroute?</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {[
                { label: 'Baseline', accent: T.teal, points: ['Gerichte eerste read voor actieve medewerkers', 'Geschikt om behoudsdruk en retentiesignalen eerst scherp te krijgen', 'Sterk als startpunt voor verificatie en prioritering'] },
                { label: 'Ritmeroute', accent: T.inkMuted, points: ['Herhaalvorm nadat baseline en eerste opvolging al staan', 'Geschikt om verschuiving in retentiesignaal en topfactoren te volgen', 'Bewust kleiner dan opnieuw een brede eerste scan'] },
              ].map(({ label, accent, points }) => (
                <div key={label} style={{ padding: '28px', background: T.paperSoft, border: `1px solid ${T.rule}`, borderTop: `3px solid ${accent}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink, marginBottom: 16 }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </section>

        {/* Wat u ontvangt — dark band */}
        <section style={{ background: T.navy, padding: 'clamp(48px,5.5vw,72px) 0' }}>
          <div style={{ ...SH }}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: T.teal, marginBottom: 18 }}>Wat u ontvangt</div>
                <h2 style={{ fontFamily: FF, fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, letterSpacing: '-.022em', color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>
                  Dashboard, rapport en toelichting<br />
                  <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'oklch(.62 .10 185)' }}>in dezelfde leeslijn.</em>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Dashboard met retentiesignaal en factoranalyse', 'Managementrapport voor HR, MT en directie met een eerste managementsessie als vaste vervolgstap', 'Toelichting op de uitkomsten en vervolgstappen', 'Geen individuele signalen — groepsduiding', 'AVG-conforme dataverwerking'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,.05)', fontSize: 13, color: 'rgba(247,245,241,.8)', lineHeight: 1.5 }}>
                      <div style={{ width: 4, height: 4, background: T.teal, flexShrink: 0, marginTop: 5 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'center', minWidth: 200 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: T.ink, background: '#fff', whiteSpace: 'nowrap' }}>
                  Plan een kennismaking
                </a>
                <Link href="/tarieven" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, padding: '12px 24px', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.2)', whiteSpace: 'nowrap' }}>
                  Bekijk tarieven
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section id="kennismaking" style={{ background: T.paperSoft, padding: 'clamp(52px,6vw,80px) 0' }}>
          <div style={{ ...SH, maxWidth: 820 }}>
            <MarketingInlineContactPanel
              eyebrow="Kennismaking"
              title="Plan een gesprek over RetentieScan"
              body="Beschrijf kort waar behoud nu onder druk staat. Dan toetsen we of RetentieScan de juiste eerste stap is en hoe de aanpak eruitziet."
              defaultRouteInterest="retentiescan"
              defaultCtaSource="product_retention_form"
            />
          </div>
        </section>
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
      ctaHref={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_hero' })}
      ctaLabel="Bespreek Pulse"
      heroIntro={
        <MarketingHeroIntro>
          <p className="marketing-hero-eyebrow text-amber-700">Pulse</p>
          <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
            Houd na een eerste scan kort en gericht zicht op wat nu verschuift.
          </h1>
          <p className="marketing-hero-copy text-slate-600">
            Pulse is een compacte vervolgroute na een eerste baseline, bestuurlijke read of eerste vervolgbespreking. Je gebruikt het product voor een
            korte managementreview: wat laat de huidige snapshot zien, welk werkspoor vraagt nu bespreking en wanneer
            is een volgende check logisch.
          </p>
          <div className="marketing-hero-actions">
            <div className="marketing-hero-cta-row">
              <a
                href={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_hero' })}
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
              Pulse en een expliciet hercheckmoment.
            </p>
            <div className="marketing-stage-list">
              {[
                'Start na een eerste baseline, managementread of eerste vervolgrichting.',
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
              body: 'De output eindigt bij prioriteit nu, een eerste vervolgrichting en een expliciet afgesproken hercheckmoment.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: 'Na een eerste baseline',
              body: 'Pulse wordt logisch zodra management na ExitScan, RetentieScan of een eerste vervolgrichting niet opnieuw breed wil meten, maar wel gericht wil herchecken.',
            },
            {
              title: 'Na eerste vervolgstappen',
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
          defaultRouteInterest="pulse"
          defaultCtaSource="product_pulse_form"
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <MarketingCalloutBand
          eyebrow="Portfoliohelderheid"
          title="Twijfel je tussen Pulse en een bredere vervolgronde?"
          body="We helpen je kiezen tussen een compacte Pulse-hercheck, RetentieScan ritmeroute of een andere vervolgroute. Zo blijft de volgende stap scherp in plaats van breder dan nodig."
          primaryHref={buildContactHref({ routeInterest: 'pulse', ctaSource: 'product_pulse_callout' })}
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
            of begrensde vervolgstap vraagt.
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

void TeamScanPage

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
              managementread, eerste vervolgrichting, begrensde vervolgstap en een expliciet hercheckmoment.
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
              body: 'De output eindigt bij een eerste vervolgrichting, eerste kleine vervolgstap en een expliciet hercheckmoment in plaats van een open eindeloze actielijst.',
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

          <div className="marketing-panel-dark p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Wat onboarding wel belooft</p>
            <h2 className="mt-4 font-display text-4xl text-white">
              Een vroege checkpoint-read met hercheck en eerste vervolgstap, geen brede onboardingmachine.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Onboarding 30-60-90 verkoopt geen volledige employee journey. Het product helpt vooral om vroeg te zien
              hoe nieuwe medewerkers nu landen, welke frictie of borging als eerste aandacht vraagt en welke
              vervolgrichting daar logisch uit volgt.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-300">
              {[
                'Geen hire-date engine of multi-checkpoint orchestration in deze wave.',
                'Geen individuele onboardingbeoordeling of manageroordeel.',
                'Wel een compacte route om HR, onboardingverantwoordelijke en leiding sneller op een lijn te krijgen.',
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
              body: 'De eerste uitkomst is een eerste vervolgrichting, een eerste managementcheck en een hercheckmoment, niet een brede leadership-suite.',
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection tone="plain">
        <div className="grid gap-6 lg:grid-cols-3">
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
