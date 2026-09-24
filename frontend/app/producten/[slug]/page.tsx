import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
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
import { CULTUURBEELD_FROM_EUR, PRICING_VAT_NOTE, formatEur } from '@/lib/pricing'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'

type Props = { params: Promise<{ slug: string }> }

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

// Pulse, Leadership Scan en Combinatie zijn uit het publieke portfolio gehaald
// (portfolio-cleanup, juni 2026): die routes geven 404 en staan niet in de
// sitemap of de static params.
const PUBLICLY_REMOVED_PRODUCT_SLUGS = new Set(['pulse', 'leadership-scan', 'combinatie'])

// Loep Vertrek, Loep Behoud en Loep Start hebben sinds 17 juni 2026 geen eigen
// pagina meer: next.config.ts verwijst ze met een 308 door naar het anker op
// /producten. De paginafuncties zijn op 20 september 2026 verwijderd. Deze tabel
// is het vangnet: verdwijnt de redirect uit next.config.ts ooit, dan stuurt de
// pagina zelf door in plaats van een lege pagina te tonen.
const REDIRECTED_PRODUCT_ANCHORS: Record<string, string> = {
  exitscan: '/producten#loep-vertrek',
  retentiescan: '/producten#loep-behoud',
  'onboarding-30-60-90': '/producten#loep-start',
}

export async function generateStaticParams() {
  return ALL_MARKETING_PRODUCTS.filter(
    (product) =>
      !PUBLICLY_REMOVED_PRODUCT_SLUGS.has(product.slug) && !(product.slug in REDIRECTED_PRODUCT_ANCHORS),
  ).map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) return {}
  const product = getMarketingProductBySlug(slug)
  if (!product) return {}

  const description = product.description
  const url = `https://www.getloep.nl${product.href}`
  const imageAlt =
    isActiveMarketingProduct(product)
      ? product.ogAlt ?? `${product.label} productpagina van Loep`
      : `${product.label} als gereserveerde route bij Loep`
  const imageUrl = `${product.href}/opengraph-image`

  return {
    title: product.seoTitle ?? `${product.label} | Loep`,
    description,
    alternates: {
      canonical: product.href,
    },
    ...(slug === 'cultuurbeeld' ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      url,
      title: product.seoTitle ?? `${product.label} | Loep`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle ?? `${product.label} | Loep`,
      description,
      images: [imageUrl],
    },
  } satisfies Metadata
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  if (PUBLICLY_REMOVED_PRODUCT_SLUGS.has(slug)) notFound()

  const redirectTarget = REDIRECTED_PRODUCT_ANCHORS[slug]
  if (redirectTarget) permanentRedirect(redirectTarget)

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
      {slug === 'cultuurbeeld' ? <CultureAssessmentPage /> : <UpcomingProductPage slug={slug} />}
    </>
  )
}

function getProductStructuredData(product: MarketingProduct) {
  const fullUrl = `https://www.getloep.nl${product.href}`
  const imageUrl = `https://www.getloep.nl${product.href}/opengraph-image`

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: product.seoTitle ?? `${product.label} | Loep`,
    description: product.description,
    url: fullUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Loep',
      url: 'https://www.getloep.nl',
    },
    primaryImageOfPage: imageUrl,
    inLanguage: 'nl-NL',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.getloep.nl/' },
      { '@type': 'ListItem', position: 2, name: 'Producten', item: 'https://www.getloep.nl/producten' },
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
      name: 'Loep',
      url: 'https://www.getloep.nl',
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
                  Loep brengt cultuur en engagement in beeld. Jij weet wat bestuurlijk aandacht vraagt.
                </h1>
                <p style={{ fontSize: 16.5, lineHeight: 1.72, color: T.inkSoft, maxWidth: '48ch', margin: '26px 0 36px' }}>
                  Loep zet de jaarlijkse cultuur- en engagementbaseline klaar, analyseert de uitkomsten en levert een board-read met eerste aandachtspunten. Het gesprek met je directie voer je zelf, met het rapport op tafel.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 600, padding: '12px 28px', color: '#fff', background: T.violet }}>
                    Toets Loep Cultuurbeeld
                  </a>
                </div>
              </div>
              <div>
                <div style={{ padding: '28px', background: T.violetFaint, border: `1px solid ${T.violetSoft}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 16 }}>vanaf {formatEur(CULTUURBEELD_FROM_EUR)} {'•'} Baseline</div>
                  {[
                    'Board-read rapport met Loep Culture Index en domeinanalyse',
                    'Je bespreekt het rapport zelf met je directie',
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
                  'De vraag gaat organisatiebreed over cultuur, engagement of werkbeleving, niet over één team of één factor',
                  'Directie of board wil een eerste patroonlezing voordat er interventies worden gestart',
                  'Er is geen actueel breed medewerkeronderzoek en de vraag is: waar moeten we het gesprek beginnen?',
                  'Je wil snel een eerste beeld zonder een groot MTO-traject op te starten',
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
                Kies eerst of je een eerste organisatiebreed cultuurbeeld nodig hebt, of een terugkerend ritme om cultuur en engagement structureel te volgen.
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
                      'Zelfde vragenlijst, zo zijn metingen vergelijkbaar over de tijd',
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

        {/* ── Wat je ontvangt ── */}
        <section style={{ background: T.white, padding: 'clamp(48px,5.5vw,72px) 0', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ ...SH }}>
            <div style={{ maxWidth: '64ch', marginBottom: 30 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: T.violet, marginBottom: 16 }}>Wat je ontvangt</div>
              <p style={{ fontSize: 15, lineHeight: 1.72, color: T.inkSoft }}>
                Loep levert het volgende, allemaal inbegrepen en niets los te bestellen:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]" style={{ alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {[
                    'Board-read rapport met Loep Culture Index, domeinprofiel en bestuurlijke aandachtspunten',
                    'Het gesprek met je directie voer je zelf, met het board-read rapport als basis',
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
                    Geen benchmarking met externe normen in v1 · Geen named manager detail standaard · Geen individuele voorspellingen · Geen automatische interventie.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, minWidth: 220 }}>
                <a href="#kennismaking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 600, padding: '14px 28px', color: '#fff', background: T.violet, whiteSpace: 'nowrap' as const }}>
                  Toets Loep Cultuurbeeld
                </a>
                {/*
                  Hier stond een tweede knop naar de tarievenpagina. Die verwijst
                  sinds 17 juni door naar de prijsstaffel op de productenpagina,
                  en Loep Cultuurbeeld staat daar niet in: het houdt zijn eigen
                  prijs. De knop stuurde de lezer dus naar bedragen die niet voor
                  dit product gelden. Daarom staat de prijs er nu zelf, uit
                  dezelfde bron als elk ander Loep-bedrag.
                */}
                <p style={{ fontSize: 13, lineHeight: 1.65, color: T.inkMuted, padding: '12px 0 0' }}>
                  Vanaf {formatEur(CULTUURBEELD_FROM_EUR)} {PRICING_VAT_NOTE} voor de baseline.
                </p>
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
                    ['Doorlooptijd', '5 werkdagen na sluiting', '6 tot 12 weken', 'Onbepaald, je doet het zelf'],
                    ['Gesprek met de directie', 'Voer je zelf, met het board-read rapport', 'Consultancydag apart geprijsd', 'Voer je zelf, zonder rapport dat richting geeft'],
                    ['Vragenlijst', 'Vaste 40-item enterprise-baseline', 'Op maat, lang traject', 'Zelf bouwen, geen validatie'],
                    ['Governance', 'Minimum-n hardcoded, manager detail standaard locked', 'Afhankelijk van afspraken', 'Niet ingebouwd'],
                    ['Prijs', `Vanaf ${formatEur(CULTUURBEELD_FROM_EUR)}`, '€25.000 tot €100.000 en meer', 'Laag instap, hoge tijdsinvestering'],
                    ['Geschikt voor', '100 tot 1.000 medewerkers, directie als koper', 'Organisaties boven 1.000 medewerkers', 'Teams die zelf willen bouwen'],
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
          note="In de kennismaking kijken we eerst of Cultuurbeeld past, voordat er iets vastligt."
        />
      </main>
      <PublicFooter />
    </div>
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
              Deze productroute blijft ondersteunend zolang Loep Vertrek en Loep Behoud de live propositie dragen.
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
