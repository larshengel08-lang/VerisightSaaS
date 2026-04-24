import Link from 'next/link'
import type { Metadata } from 'next'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { MarketingSection } from '@/components/marketing/marketing-section'
import { SectionHeading } from '@/components/marketing/section-heading'
import { INSIGHT_PAGES, formatInsightPublishedAt } from '@/lib/insights-pages'

export const metadata: Metadata = {
  title: 'Inzichten | Verisight',
  description:
    'Commerciele insights over vertrekduiding en behoudsdruk, gebouwd als bounded laag rond de bestaande Verisight-productroutes.',
  alternates: { canonical: '/inzichten' },
  openGraph: {
    type: 'website',
    title: 'Inzichten | Verisight',
    description:
      'Verken drie bounded insight-paginas die vertrekduiding en behoudsdruk koppelen aan de juiste Verisight-productroute.',
    url: 'https://www.verisight.nl/inzichten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inzichten | Verisight',
    description:
      'Verken drie bounded insight-paginas die vertrekduiding en behoudsdruk koppelen aan de juiste Verisight-productroute.',
    images: ['/opengraph-image'],
  },
}

export default function InsightsOverviewPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Inzichten | Verisight',
        description:
          'Commerciele insights over vertrekduiding en behoudsdruk, gebouwd als bounded laag rond de bestaande Verisight-productroutes.',
        url: 'https://www.verisight.nl/inzichten',
        inLanguage: 'nl-NL',
        isPartOf: { '@type': 'WebSite', name: 'Verisight', url: 'https://www.verisight.nl' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.verisight.nl/' },
          { '@type': 'ListItem', position: 2, name: 'Inzichten', item: 'https://www.verisight.nl/inzichten' },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MarketingPageShell
        theme="support"
        pageType="support"
        ctaHref="/producten"
        ctaLabel="Bekijk producten"
        heroIntro={
          <div className="max-w-[56rem]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">Inzichten</p>
            <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4.6rem)] font-light leading-[0.98] tracking-[-0.05em] text-[var(--ink)]">
              Geen blogmachine, wel een bounded SEO-laag.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-8 text-[var(--text)]">
              Deze sectie verdiept drie managementvragen die al aansluiten op de bestaande productroutes. Geen kennisbank,
              geen nieuwslaag en geen brede topical cluster.
            </p>
          </div>
        }
        heroStage={
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">Wat u hier vindt</p>
            <div className="mt-6 grid gap-3">
              {[
                'Twee ExitScan-gedreven managementvragen en een RetentieScan-gedreven vraag',
                'Buyer-facing verdieping die direct teruglinkt naar een productroute',
                'Titel en datum per pagina, zonder auteurssysteem of blog-taxonomie',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        }
        heroSupport={
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6">
            <p className="text-sm leading-7 text-slate-600">
              De primaire SEO- en conversielaag blijft op <strong>/oplossingen</strong> en <strong>/producten</strong>. Deze
              insights zijn aanvullend en sturen altijd terug naar een concrete route.
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/producten" className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950">
                Bekijk producten
              </Link>
              <Link href="/oplossingen/verloop-analyse" className="marketing-link-card text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950">
                Bekijk verloopanalyse
              </Link>
            </div>
          </div>
        }
      >
        <MarketingSection tone="plain">
          <SectionHeading
            eyebrow="Drie ingangen"
            title="Verken drie managementvragen die buyer-facing en bounded blijven."
            description="Elke pagina koppelt een managementvraag aan een primaire productroute, een ondersteunende oplossingspagina en een duidelijke vervolgstap."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {INSIGHT_PAGES.map((page) => (
              <article key={page.slug} className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
                      page.theme === 'exit'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {page.theme === 'exit' ? 'Exit' : 'Retention'}
                  </span>
                  <time className="text-xs uppercase tracking-[0.18em] text-slate-400" dateTime={page.publishedAt}>
                    {formatInsightPublishedAt(page.publishedAt)}
                  </time>
                </div>
                <h2 className="mt-6 font-display text-[1.7rem] font-light leading-[1.05] tracking-[-0.03em] text-slate-950">
                  {page.title}
                </h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">{page.description}</p>
                <div className="mt-6 grid gap-2">
                  <Link
                    href={page.canonical}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Lees dit inzicht
                  </Link>
                  <Link
                    href={page.primaryProductHref}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-950"
                  >
                    Bekijk {page.primaryProductLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </MarketingSection>
      </MarketingPageShell>
    </>
  )
}
