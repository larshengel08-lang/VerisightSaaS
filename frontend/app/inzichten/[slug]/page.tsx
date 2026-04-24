import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingInlineContactPanel } from '@/components/marketing/marketing-inline-contact-panel'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import {
  INSIGHT_PAGE_SLUGS,
  formatInsightPublishedAt,
  getInsightPageBySlug,
} from '@/lib/insights-pages'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  return INSIGHT_PAGE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const insightPage = getInsightPageBySlug(slug)

  if (!insightPage) {
    return {}
  }

  return {
    title: insightPage.seoTitle,
    description: insightPage.description,
    alternates: { canonical: insightPage.canonical },
    openGraph: {
      type: 'website',
      title: insightPage.seoTitle,
      description: insightPage.description,
      url: `https://www.verisight.nl${insightPage.canonical}`,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: insightPage.seoTitle,
      description: insightPage.description,
      images: ['/opengraph-image'],
    },
  }
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params
  const insightPage = getInsightPageBySlug(slug)

  if (!insightPage) {
    notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: insightPage.seoTitle,
        description: insightPage.description,
        url: `https://www.verisight.nl${insightPage.canonical}`,
        inLanguage: 'nl-NL',
        isPartOf: { '@type': 'WebSite', name: 'Verisight', url: 'https://www.verisight.nl' },
        about: {
          '@type': 'Service',
          name: insightPage.primaryProductLabel,
          url: `https://www.verisight.nl${insightPage.primaryProductHref}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
          { '@type': 'ListItem', position: 2, name: 'Inzichten', item: 'https://www.verisight.nl/inzichten' },
          {
            '@type': 'ListItem',
            position: 3,
            name: insightPage.title,
            item: `https://www.verisight.nl${insightPage.canonical}`,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MarketingPageShell
        theme={insightPage.theme === 'exit' ? 'exit' : 'retention'}
        pageType="support"
        ctaHref="#kennismaking"
        ctaLabel="Toets routefit"
        heroIntro={
          <div className="max-w-[58rem]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">
              {insightPage.hero.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(2.4rem,5vw,4.8rem)] font-light leading-[0.98] tracking-[-0.05em] text-[var(--ink)]">
              {insightPage.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>{insightPage.hero.kicker}</span>
              <span aria-hidden="true">•</span>
              <time dateTime={insightPage.publishedAt}>
                {formatInsightPublishedAt(insightPage.publishedAt)}
              </time>
            </div>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-8 text-[var(--text)]">
              {insightPage.hero.body}
            </p>
          </div>
        }
        heroStage={
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">
              Managementleeslijn
            </p>
            <div className="mt-6 grid gap-3">
              {insightPage.hero.stats.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
        heroSupport={
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6">
            <p className="text-sm leading-7 text-slate-600">{insightPage.productHandoff.body}</p>
            <div className="mt-5 grid gap-3">
              <Link
                href={insightPage.primaryProductHref}
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk {insightPage.primaryProductLabel}
              </Link>
              <Link
                href={insightPage.secondarySolutionHref}
                className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                Bekijk {insightPage.secondarySolutionLabel}
              </Link>
            </div>
          </div>
        }
      >
        <MarketingSection tone="plain">
          <div className="grid gap-5 lg:grid-cols-3">
            {insightPage.problemFraming.map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 md:p-10">
              <SectionHeading
                eyebrow="Managementinzicht"
                title={insightPage.managementInsight.title}
                description={insightPage.managementInsight.body}
              />
              <div className="mt-8 grid gap-3">
                {insightPage.managementInsight.bullets.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-[#0d1b2e] p-8 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <SectionHeading
                eyebrow="Directe producthandoff"
                title={insightPage.productHandoff.title}
                description={insightPage.productHandoff.body}
                light
              />
              <div className="mt-8 space-y-3">
                <Link
                  href={insightPage.primaryProductHref}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Bekijk {insightPage.primaryProductLabel}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={insightPage.secondarySolutionHref}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Bekijk {insightPage.secondarySolutionLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Kwalificatie"
            title="Gebruik deze pagina om te bepalen of een gesprek nu echt zinvol is."
            description={insightPage.qualificationIntro}
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Wanneer dit past</p>
              <div className="mt-4 grid gap-3">
                {insightPage.whenThisFits.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Niet voor</p>
              <div className="mt-4 grid gap-3">
                {insightPage.notFor.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Wanneer een gesprek zinvol is</p>
              <div className="mt-4 grid gap-3">
                {insightPage.conversationReadiness.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-7 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Wat nu te doen"
            title="Gebruik deze laag om te prioriteren, niet om een brede contentroute te openen."
            description="De vervolgstap moet concreet blijven: eerst managementvraag aanscherpen, daarna route kiezen en pas dan verbreden."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {insightPage.whatToDoNext.map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="surface">
          <SectionHeading
            eyebrow="Trust en proof"
            title="Verwijs alleen naar bewijs dat de huidige baseline werkelijk draagt."
            description="Deze sectie houdt de insight-pagina compact en verwijst gecontroleerd naar product-, oplossings- en trustlagen."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {insightPage.trustProofReferences.map((reference) => (
              <Link
                key={reference.href}
                href={reference.href}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">{reference.label}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{reference.body}</p>
              </Link>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection tone="plain">
          <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
            Dit gesprek is bedoeld om routefit, scope en eerste haalbaarheid te toetsen. Geen algemene demo, wel een
            serieuze eerste route-inschatting.
          </div>
          <MarketingInlineContactPanel
            eyebrow="Kennismaking"
            title={insightPage.cta.title}
            body={insightPage.cta.body}
            defaultRouteInterest={insightPage.primaryRouteInterest}
            defaultCtaSource={insightPage.ctaSource}
          />
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
