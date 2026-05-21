import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { InsightPost } from '@/lib/insights'

const olderPost: InsightPost = {
  title: 'Retentiesignalen op tijd zien',
  slug: 'retentiesignalen-op-tijd-zien',
  metaDescription: 'Een compacte gids voor het eerder herkennen van behoudsdruk.',
  focusKeyword: 'retentiesignalen',
  category: 'Behoud',
  ctaType: 'knowledge',
  ctaLabel: 'Lees verder',
  ctaTarget: '/producten/retentiescan',
  relatedSolutionSlug: 'medewerkersbehoud-analyse',
  generatedAt: '2026-05-01',
  publishedAt: '2026-05-01',
  bodyMarkdown: 'Introductie',
  readingMinutes: 4,
}

const newerPost: InsightPost = {
  ...olderPost,
  title: 'Onboarding frictie eerder signaleren',
  slug: 'onboarding-frictie-eerder-signaleren',
  category: 'Onboarding',
  generatedAt: '2026-05-09',
  publishedAt: '2026-05-09',
}

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.unmock('@/lib/insights')
  vi.unmock('@/components/marketing/marketing-page-shell')
  vi.unmock('@/components/marketing/insights-index-content')
})

async function loadIndexRoute(posts: InsightPost[]) {
  vi.doMock('@/lib/insights', () => ({
    getAllInsights: () => posts,
  }))
  vi.doMock('@/components/marketing/marketing-page-shell', () => ({
    MarketingPageShell: ({
      children,
      ctaHref,
      ctaLabel,
      heroIntro,
      heroSupport,
      pageType,
    }: {
      children: React.ReactNode
      ctaHref?: string
      ctaLabel?: string
      heroIntro: React.ReactNode
      heroSupport?: React.ReactNode
      pageType?: string
    }) =>
      React.createElement(
        'div',
        { 'data-page-type': pageType, 'data-cta-href': ctaHref, 'data-cta-label': ctaLabel },
        React.createElement('div', { 'data-slot': 'intro' }, heroIntro),
        React.createElement('div', { 'data-slot': 'support' }, heroSupport),
        React.createElement('div', { 'data-slot': 'children' }, children),
      ),
  }))
  vi.doMock('@/components/marketing/insights-index-content', () => ({
    InsightsIndexContent: ({ posts: routePosts }: { posts: InsightPost[] }) =>
      React.createElement(
        'div',
        { 'data-post-count': routePosts.length },
        routePosts.map((post) => post.slug).join('|'),
      ),
  }))

  return import('./page')
}

describe('inzichten index route', () => {
  it('renders the route shell with metadata and the loaded insight collection', async () => {
    const route = await loadIndexRoute([newerPost, olderPost])

    expect(route.metadata.alternates?.canonical).toBe('/inzichten')
    expect(route.metadata.openGraph?.url).toBe('https://www.verisight.nl/inzichten')

    const markup = renderToStaticMarkup(route.default())

    expect(markup).toContain('Scherpere duiding bij vertrek, behoud en opvolging')
    expect(markup).toContain('data-page-type="overview"')
    expect(markup).toContain('data-post-count="2"')
    expect(markup).toContain('onboarding-frictie-eerder-signaleren|retentiesignalen-op-tijd-zien')
  })

  it('derives the inzichten sitemap hub lastModified from the newest published insight', async () => {
    vi.doMock('@/lib/insights', () => ({
      getAllInsights: () => [olderPost, newerPost],
    }))

    const { default: sitemap } = await import('../sitemap')
    const hubEntry = sitemap().find((entry) => entry.url === 'https://www.verisight.nl/inzichten')

    expect(hubEntry).toBeDefined()
    expect(hubEntry?.lastModified?.toISOString()).toBe('2026-05-09T00:00:00.000Z')
  })
})
