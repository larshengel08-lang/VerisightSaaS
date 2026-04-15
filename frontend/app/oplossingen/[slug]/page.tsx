import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { PreviewSlider } from '@/components/marketing/preview-slider'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { getMarketingProductBySlug } from '@/lib/marketing-products'
import { getPrimarySampleShowcaseAsset } from '@/lib/sample-showcase-assets'
import { SEO_SOLUTION_SLUGS, getSeoSolutionPageBySlug } from '@/lib/seo-solution-pages'

type Props = { params: Promise<{ slug: string }> }

const exitSampleAsset = getPrimarySampleShowcaseAsset('exit')
const retentionSampleAsset = getPrimarySampleShowcaseAsset('retention')

export async function generateStaticParams() {
  return [
    ...SEO_SOLUTION_SLUGS.map((slug) => ({ slug })),
    { slug: 'exitscan' },
    { slug: 'retentiescan' },
    { slug: 'combinatie' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const solutionPage = getSeoSolutionPageBySlug(slug)

  if (solutionPage) {
    return {
      title: solutionPage.seoTitle,
      description: solutionPage.description,
      alternates: {
        canonical: solutionPage.canonical,
      },
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
  if (!product) {
    return {}
  }

  return {
    title: product.seoTitle ?? `${product.label} | Verisight`,
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
          isPartOf: {
            '@type': 'WebSite',
            name: 'Verisight',
            url: 'https://www.verisight.nl',
          },
          about: {
            '@type': 'Service',
            name: solutionPage.productLabel,
            url: `https://www.verisight.nl${solutionPage.productHref}`,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.verisight.nl/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Oplossingen',
              item: 'https://www.verisight.nl/producten',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: solutionPage.title,
              item: `https://www.verisight.nl${solutionPage.canonical}`,
            },
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
          eyebrow={solutionPage.eyebrow}
          title={solutionPage.heroTitle}
          description={solutionPage.heroDescription}
          theme={solutionPage.productTheme}
          contextTitle={solutionPage.contextTitle}
          contextBody={solutionPage.contextBody}
          ctaHref="#kennismaking"
          ctaLabel="Plan kennismaking"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {solutionPage.problemCards.map(([title, body]) => (
              <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
              <SectionHeading
                eyebrow="Waarom deze route"
                title={solutionPage.whyNowTitle}
                description={solutionPage.whyNowBody}
              />
              <div className="mt-8 grid gap-3">
                {solutionPage.routeCards.map(([title, body]) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <SectionHeading
                eyebrow="Productfit"
                title={solutionPage.deliverableTitle}
                description={solutionPage.deliverableBody}
                light
              />
              <div className="mt-8 grid gap-3">
                {solutionPage.deliverables.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 md:p-10">
              <SectionHeading
                eyebrow="Prooflaag"
                title={solutionPage.proofTitle}
                description={solutionPage.proofBody}
              />
              <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <PreviewSlider variant={previewVariant} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={solutionPage.productHref}
                  className="inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Bekijk {solutionPage.productLabel}
                </Link>
                <Link
                  href="/vertrouwen"
                  className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                >
                  Bekijk vertrouwen
                </Link>
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

          <div className="mt-16 grid gap-4 md:grid-cols-3">
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

          <div className="mt-16">
            <MarketingInlineContactPanel
              eyebrow="Kennismaking"
              title={solutionPage.contactTitle}
              body={solutionPage.contactBody}
              defaultRouteInterest={solutionPage.routeInterest}
              defaultCtaSource={solutionPage.ctaSource}
            />
          </div>

          <MarketingCalloutBand
            className="mt-16"
            eyebrow="Verdiep verder"
            title={`Wil je eerst de ${solutionPage.productLabel} route verder toetsen?`}
            body="Gebruik eerst de productspecifieke pagina om output, pricing, aanpak en trust in één commerciële leeslijn te bekijken. Zo blijft SEO-verkeer landen op pagina’s die ook inhoudelijk goed converteren."
            primaryHref={solutionPage.productHref}
            primaryLabel={`Bekijk ${solutionPage.productLabel}`}
            secondaryHref="/tarieven"
            secondaryLabel="Bekijk tarieven"
          />
        </MarketingPageShell>
      </>
    )
  }

  const product = getMarketingProductBySlug(slug)
  if (product) {
    redirect(`/producten/${slug}`)
  }

  notFound()
}
