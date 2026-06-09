import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { InsightsIndexContent } from '@/components/marketing/insights-index-content'
import { marketingPrimaryCta } from '@/components/marketing/site-content'
import { getAllInsights } from '@/lib/insights'

export const metadata: Metadata = {
  title: 'Inzichten | Verisight',
  description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Verisight.',
  alternates: {
    canonical: '/inzichten',
  },
  openGraph: {
    type: 'website',
    title: 'Inzichten | Verisight',
    description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Verisight.',
    url: 'https://www.verisight.nl/inzichten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inzichten | Verisight',
    description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Verisight.',
    images: ['/opengraph-image'],
  },
}

export default function InsightsIndexPage() {
  const posts = getAllInsights()

  return (
    <MarketingPageShell
      pageType="overview"
      ctaHref={marketingPrimaryCta.href}
      ctaLabel={marketingPrimaryCta.label}
      heroIntro={
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">INZICHTEN</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(3rem,6vw,5.5rem)] leading-[0.94] text-[var(--ink)]">
            Scherpere duiding bij vertrek, behoud en opvolging
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text)]">
            Hier leest u verdiepende artikelen die helpen scherper te kijken naar vertrek, behoud, prioriteiten en
            eerste opvolging. Rustige duiding, compact gebracht en duidelijk verbonden aan dezelfde wereld als
            Verisight.
          </p>
        </div>
      }
      heroSupport={
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Waarover u hier leest</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--text)]">
            <p>Vertrek begrijpen voordat patronen zich blijven herhalen.</p>
            <p>Behoud eerder zien voordat signalen pas in uitstroom zichtbaar worden.</p>
            <p>Prioriteiten scherper maken en opvolging pas organiseren wanneer dat echt nodig is.</p>
          </div>
          <Link
            href="/aanpak"
            className="mt-6 inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
          >
            Bekijk hoe Verisight werkt
          </Link>
        </div>
      }
    >
      <InsightsIndexContent posts={posts} />
    </MarketingPageShell>
  )
}
