import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell'
import { InsightsIndexContent } from '@/components/marketing/insights-index-content'
import { marketingPrimaryCta } from '@/components/marketing/site-content'
import { getAllInsights } from '@/lib/insights'

export const metadata: Metadata = {
  title: 'Inzichten | Verisight',
  description: 'Laatste inzichten over onboarding, behoud, uitstroom en HR-prioritering van Verisight.',
  alternates: {
    canonical: '/inzichten',
  },
  openGraph: {
    type: 'website',
    title: 'Inzichten | Verisight',
    description: 'Laatste inzichten over onboarding, behoud, uitstroom en HR-prioritering van Verisight.',
    url: 'https://www.verisight.nl/inzichten',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inzichten | Verisight',
    description: 'Laatste inzichten over onboarding, behoud, uitstroom en HR-prioritering van Verisight.',
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Inzichten</p>
          <h1 className="mt-4 max-w-4xl text-[clamp(3rem,6vw,5.5rem)] leading-[0.94] text-[var(--ink)]">
            Laatste inzichten voor HR en management
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text)]">
            Een curated marketing hub rond onboarding, behoud, uitstroom en prioritering. Een compacte plek voor
            artikelen die managementvragen scherper maken en laten zien waar Verisight helpt.
          </p>
        </div>
      }
      heroSupport={
        <div className="space-y-4 rounded-[28px] border border-[var(--border)] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Waarom dit werkt</p>
          <p className="text-sm leading-7 text-[var(--text)]">
            Thought leadership blijft hier dicht op de producttaal: duidelijke managementvragen, praktische duiding en
            een zachte brug naar product- of oplossingsroutes.
          </p>
          <Link
            href="/inzichten"
            className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
          >
            Naar /inzichten
          </Link>
        </div>
      }
    >
      <InsightsIndexContent posts={posts} />
    </MarketingPageShell>
  )
}
