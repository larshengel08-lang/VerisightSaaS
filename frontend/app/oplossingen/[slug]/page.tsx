import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
  MarketingHeroIntro,
  MarketingHeroStage,
  MarketingHeroSupport,
} from '@/components/marketing/marketing-hero'
import { MarketingCalloutBand } from '@/components/marketing/marketing-callout-band'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingProofStrip } from '@/components/marketing/marketing-proof-strip'
import { SampleShowcaseCard } from '@/components/marketing/sample-showcase-card'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
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
          isPartOf: { '@type': 'WebSite', name: 'Verisight', url: 'https://www.verisight.nl' },
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

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <MarketingPageShell
          theme={solutionPage.productTheme}
          pageType="support"
          ctaHref={solutionPage.productHref}
          ctaLabel={`Bekijk ${solutionPage.productLabel}`}
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
                  <Link
                    href={solutionPage.productHref}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.18)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Bekijk {solutionPage.productLabel}
                  </Link>
                  <Link
                    href="/vertrouwen"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk vertrouwen
                  </Link>
                </div>
              </div>
            </MarketingHeroIntro>
          }
          heroStage={
            <MarketingHeroStage className="h-full">
              <div className="space-y-5">
                <span className="marketing-stage-tag bg-white/10 text-slate-200">Buyer-facing handofflaag</span>
                <h2 className="marketing-stage-title font-display text-white">{solutionPage.contextTitle}</h2>
                <p className="marketing-stage-copy text-slate-300">{solutionPage.contextBody}</p>
                <div className="space-y-3">
                  {solutionPage.problemCards.slice(0, 2).map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-slate-200"
                    >
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-2 text-slate-300">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </MarketingHeroStage>
          }
          heroSupport={
            <MarketingHeroSupport>
              <div className="marketing-support-note">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Mirror-rol</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text)]">
                  Deze mirrorpage is een buyer-facing handofflaag, geen productoverzicht.
                </p>
              </div>
              <div className="marketing-support-note">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Handoff</p>
                <p className="mt-2 text-sm leading-7 text-[var(--text)]">
                  De juiste vervolgstap ligt op {solutionPage.productLabel}. Proof en trust ondersteunen hier alleen de overgang.
                </p>
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
                  Bekijk trustgrenzen
                </Link>
              </div>
            </MarketingHeroSupport>
          }
        >
          <MarketingSection tone="plain">
            <SectionHeading
              eyebrow="Probleemduiding"
              title="Waarom deze situatie aandacht vraagt."
              description={solutionPage.description}
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {solutionPage.problemCards.map(([title, body]) => (
                <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Waarom nu"
              title="Waarom de huidige aanpak hier te weinig lijn geeft."
              description={solutionPage.whyNowBody}
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {solutionPage.currentApproachCards.map(([title, body]) => (
                <div key={title} className="marketing-feature-card">
                  <p className="text-base font-semibold text-[var(--ink)]">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text)]">{body}</p>
                </div>
              ))}
            </div>
          </MarketingSection>

          <MarketingSection tone="tint">
            <SectionHeading
              eyebrow="Routefit"
              title="Welke route hier het beste op past."
              description={solutionPage.primaryHandoffBody}
            />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="marketing-feature-card">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#3C8D8A]">Primaire handoff</p>
                <h3 className="mt-4 text-3xl font-semibold text-slate-950">Bekijk {solutionPage.productLabel}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--text)]">{solutionPage.deliverableBody}</p>
                <ul className="mt-6 space-y-3">
                  {solutionPage.primaryHandoffPoints.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text)]">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3C8D8A]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={solutionPage.productHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#234B57] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1b3943]"
                  >
                    Bekijk {solutionPage.productLabel}
                  </Link>
                </div>
              </div>

              <div className="marketing-route-card-dark bg-[linear-gradient(180deg,#1b2e45_0%,#132033_100%)]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#DCEFEA]">Niet wat deze mirror doet</p>
                <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#F7F5F1]">
                  Geen productoverzicht of routekeuzepagina.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[rgba(247,245,241,0.72)]">
                  Deze SEO-ingang bevestigt de bestaande routehiërarchie en geeft één duidelijke productroute door in plaats van meerdere routes opnieuw te openen.
                </p>
                <div className="mt-6 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[rgba(247,245,241,0.82)]">
                  De mirror doet handoff naar {solutionPage.productLabel} en opent geen concurrerende route-architectuur.
                </div>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection tone="surface">
            <SectionHeading
              eyebrow="Proof en trust"
              title="Korte proof- en trustlaag"
              description={solutionPage.proofBody}
            />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              {sampleAsset ? (
                <SampleShowcaseCard
                  eyebrow="Voorbeeldrapport"
                  title={`Open de ${solutionPage.productLabel} showcase.`}
                  body={solutionPage.proofBody}
                  asset={sampleAsset}
                  linkLabel={`Open ${solutionPage.productLabel}-voorbeeldrapport`}
                />
              ) : (
                <div className="marketing-feature-card">
                  <p className="text-sm leading-7 text-[var(--text)]">{solutionPage.proofBody}</p>
                </div>
              )}

              <MarketingProofStrip
                items={solutionPage.trustPoints.map((item, index) => ({
                  title: index === 0 ? 'Mirrorgrens' : index === 1 ? 'Proofrol' : 'Claimgrens',
                  body: item,
                }))}
              />
            </div>
          </MarketingSection>

          <MarketingSection tone="plain">
            <MarketingCalloutBand
              eyebrow="Verdiep verder"
              title="Ga verder via de productroute die hier echt bij past."
              body={`Gebruik eerst ${solutionPage.productLabel} om output, trust, pricing en aanpak in de juiste commerciële leeslijn te bekijken. Daarna blijft de vervolgstap kleiner en helderder.`}
              primaryHref={solutionPage.productHref}
              primaryLabel={`Bekijk ${solutionPage.productLabel}`}
              secondaryHref="/vertrouwen"
              secondaryLabel="Bekijk vertrouwen"
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
