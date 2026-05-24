import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { InsightsIndexContent } from '@/components/marketing/insights-index-content'
import { marketingPrimaryCta } from '@/components/marketing/site-content'
import { getAllInsights } from '@/lib/insights'

export const metadata: Metadata = {
  title: 'Inzichten',
  description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Loep.',
  alternates: {
    canonical: '/inzichten',
  },
  openGraph: {
    type: 'website',
    title: 'Inzichten | Loep',
    description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Loep.',
    url: 'https://www.verisight.nl/inzichten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inzichten | Loep',
    description: 'Verdiepende inzichten over vertrek, behoud, duiding en opvolging binnen dezelfde wereld als Loep.',
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">INZICHTEN</p>
          <h1 className="mt-4 max-w-[11ch] text-balance font-display text-[clamp(2.7rem,8vw,5.5rem)] leading-[1.01] text-[var(--ink)]">
            Scherpere duiding bij vertrek, behoud en opvolging
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-[1.8] text-[var(--muted)]">
            Hier leest u verdiepende artikelen die helpen scherper te kijken naar vertrek, behoud, prioriteiten en
            eerste opvolging. Rustige duiding, compact gebracht en duidelijk verbonden aan dezelfde wereld als
            Loep.
          </p>
        </div>
      }
      heroSupport={
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-low)] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--meta)]">Waarover u hier leest</p>
          <div className="mt-4 space-y-3 text-sm leading-[1.75] text-[var(--muted)]">
            <p>Vertrek begrijpen voordat patronen zich blijven herhalen.</p>
            <p>Behoud eerder zien voordat signalen pas in uitstroom zichtbaar worden.</p>
            <p>Prioriteiten scherper maken en opvolging pas organiseren wanneer dat echt nodig is.</p>
          </div>
          <Link
            href="/aanpak"
            className="marketing-button-secondary mt-6"
          >
            Bekijk hoe Loep werkt
          </Link>
        </div>
      }
    >
      <InsightsIndexContent posts={posts} />
    </MarketingPageShell>
  )
}

