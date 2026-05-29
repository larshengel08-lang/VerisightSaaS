import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingClosingCta } from '@/components/marketing/marketing-closing-cta'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewEvidenceRail } from '@/components/marketing/preview-evidence-rail'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { buildContactHref } from '@/lib/contact-funnel'
import { getMarketingProductBySlug } from '@/lib/marketing-products'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'
import { SEO_SOLUTION_SLUGS, getSeoSolutionPageBySlug } from '@/lib/seo-solution-pages'

type Props = { params: Promise<{ slug: string }> }

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export async function generateStaticParams() {
  return [...SEO_SOLUTION_SLUGS.map((slug) => ({ slug })), { slug: 'exitscan' }, { slug: 'retentiescan' }, { slug: 'combinatie' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const solutionPage = getSeoSolutionPageBySlug(slug)

  if (solutionPage) {
    return {
      title: solutionPage.seoTitle,
      description: solutionPage.description,
      alternates: { canonical: solutionPage.canonical },
      openGraph: {
        type: 'website',
        title: solutionPage.seoTitle,
        description: solutionPage.description,
        url: `https://www.verisight.nl${solutionPage.canonical}`,
        images: ['/opengraph-image'],
      },
      twitter: {
        card: 'summary_large_image',
        title: solutionPage.seoTitle,
        description: solutionPage.description,
        images: ['/opengraph-image'],
      },
    }
  }

  const product = getMarketingProductBySlug(slug)
  if (!product) return {}

  return {
    title: product.seoTitle ?? `${product.label} | Loep`,
    description: product.description,
  }
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params
  const solutionPage = getSeoSolutionPageBySlug(slug)

  if (solutionPage) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: solutionPage.seoTitle,
          description: solutionPage.description,
          url: `https://www.verisight.nl${solutionPage.canonical}`,
          inLanguage: 'nl-NL',
          isPartOf: { '@type': 'WebSite', name: 'Loep', url: 'https://www.verisight.nl' },
          about: { '@type': 'Service', name: solutionPage.productLabel, url: `https://www.verisight.nl${solutionPage.productHref}` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
            { '@type': 'ListItem', position: 2, name: 'Oplossingen', item: 'https://www.verisight.nl/producten' },
            { '@type': 'ListItem', position: 3, name: solutionPage.title, item: `https://www.verisight.nl${solutionPage.canonical}` },
          ],
        },
      ],
    }

    const sampleAsset = solutionPage.productTheme === 'exit' ? exitSampleAsset : retentionSampleAsset
    const previewVariant = solutionPage.productTheme === 'exit' ? 'exit' : 'retention'

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <MarketingPageShell
          theme={solutionPage.productTheme}
          pageType="product"
          ctaHref="#kennismaking"
          ctaLabel="Plan kennismaking"
          heroIntro={
            <MarketingHeroIntro>
              <p className={`marketing-hero-eyebrow ${solutionPage.productTheme === 'exit' ? 'text-blue-600' : 'text-emerald-700'}`}>
                {solutionPage.eyebrow}
              </p>
              <h1 className="marketing-hero-title marketing-hero-title-detail font-display text-slate-950">
                {solutionPage.heroTitle}
              </h1>
              <p className="marketing-hero-copy text-slate-600">{solutionPage.heroDescription}</p>
              <div className="marketing-hero-actions">
                <div className="marketing-hero-cta-row">
                  <a
                    href="#kennismaking"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Plan kennismaking
                  </a>
                  <Link
                    href={solutionPage.productHref}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk {solutionPage.productLabel}
                  </Link>
                </div>
              </div>
            </MarketingHeroIntro>
          }
          heroStage={
            <MarketingHeroStage>
              <div className="space-y-5">
                <span className="marketing-stage-tag bg-white/10 text-slate-200">Gerichte ingang</span>
                <h2 className="marketing-stage-title font-display text-white">{solutionPage.contextTitle}</h2>
                <p className="marketing-stage-copy text-slate-300">{solutionPage.contextBody}</p>
                <div className="marketing-stage-list">
                  {solutionPage.routeCards.slice(0, 3).map(([title, body]) => (
                    <div key={title} className="marketing-stage-list-item">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </MarketingHeroStage>
          }
          heroSupport={
            <MarketingHeroSupport>
              <div className="marketing-support-note text-sm leading-7 text-slate-600">
                Deze oplossingspagina is een compacte ingang op een bestaande productroute. Proof en sample-output
                landen daarom direct onder de hero en verwijzen daarna door naar de productspecifieke pagina.
              </div>
              <div className="marketing-link-grid">
                <Link
                  href={solutionPage.productHref}
                  className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  Bekijk {solutionPage.productLabel}
                </Link>
                <Link
                  href="/vertrouwen"
                  className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
                >
                  Bekijk vertrouwen
                </Link>
              </div>
            </MarketingHeroSupport>
          }
        >
          <MarketingSection tone="plain">
            <div className="grid gap-5 lg:grid-cols-3">
              {solutionPage.problemCards.map(([title, body]) => (
                <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
                  <SectionHeading eyebrow="Waarom deze route" title={solutionPage.whyNowTitle} description={solutionPage.whyNowBody} />
                  <div className="mt-8 grid gap-3">
                    {solutionPage.routeCards.map(([title, body]) => (
                      <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-950">{title}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
                  <SectionHeading eyebrow="Prooflaag" title={solutionPage.proofTitle} description={solutionPage.proofBody} />
                  <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <PreviewSlider variant={previewVariant} />
                  </div>
                  <PreviewEvidenceRail className="mt-6" variant={previewVariant} />
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
                  <SectionHeading eyebrow="Productfit" title={solutionPage.deliverableTitle} description={solutionPage.deliverableBody} light />
                  <div className="mt-8 grid gap-3">
                    {solutionPage.deliverables.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {sampleAsset ? (
                  <SampleShowcaseCard
                    eyebrow="Voorbeeldrapport"
                    title={`Open de ${solutionPage.productLabel} showcase.`}
                    body={solutionPage.proofBody}
                    asset={sampleAsset}
                    linkLabel={`Open ${solutionPage.productLabel}-voorbeeldrapport`}
                  />
                ) : null}
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Volgende stap', `Ga dieper op de productroute in via ${solutionPage.productLabel}.`],
                ['Pricing', 'Gebruik tarieven om eerste trajecten, vervolgvormen en add-ons te toetsen zonder planmatrix.'],
                ['Aanpak', 'Gebruik aanpak om te zien hoe intake, setup, livegang en eerste managementwaarde samenkomen.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-3">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingClosingCta
            href={buildContactHref({
              routeInterest: solutionPage.routeInterest,
              ctaSource: solutionPage.ctaSource,
            })}
            showSectionMark={false}
            backdropNumber={null}
          />

          <MarketingSection tone="plain">
            <MarketingCalloutBand
              eyebrow="Verdiep verder"
              title={`Wil je eerst de ${solutionPage.productLabel} route verder toetsen?`}
              body="Gebruik eerst de productspecifieke pagina om output, pricing, aanpak en trust in één commerciële leeslijn te bekijken. Zo blijft SEO-verkeer landen op pagina's die ook inhoudelijk goed converteren."
              primaryHref={solutionPage.productHref}
              primaryLabel={`Bekijk ${solutionPage.productLabel}`}
              secondaryHref="/tarieven"
              secondaryLabel="Bekijk tarieven"
            />
          </MarketingSection>
        </MarketingPageShell>
      </>
    )
  }

  const product = getMarketingProductBySlug(slug)
  if (product) redirect(`/producten/${slug}`)

  notFound()
}

