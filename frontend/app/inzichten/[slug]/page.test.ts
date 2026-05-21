import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { InsightPost } from '@/lib/insights'

const primaryPost: InsightPost = {
  title: 'Waarom onboarding retentie vroeg voorspelt',
  slug: 'waarom-onboarding-retentie-vroeg-voorspelt',
  metaDescription: 'Lees hoe onboardingfrictie vroeg zichtbaar maakt waar medewerkers later afhaken.',
  focusKeyword: 'onboarding retentie',
  category: 'Onboarding',
  ctaType: 'soft_product',
  ctaLabel: 'Bekijk de Onboarding Scan',
  ctaTarget: '/producten/onboarding-30-60-90',
  relatedSolutionSlug: 'medewerkersbehoud-analyse',
  generatedAt: '2026-05-06',
  publishedAt: '2026-05-06',
  bodyMarkdown: '# Intro\n\nTekst',
  readingMinutes: 5,
}

const secondaryPost: InsightPost = {
  ...primaryPost,
  title: 'Vroege uitstroomsignalen op groepsniveau zien',
  slug: 'vroege-uitstroomsignalen-op-groepsniveau-zien',
  category: 'Uitstroom',
  generatedAt: '2026-05-02',
  publishedAt: '2026-05-02',
}

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.unmock('@/lib/insights')
  vi.unmock('@/components/marketing/marketing-page-shell')
  vi.unmock('@/components/marketing/insight-article-content')
  vi.unmock('@/components/marketing/insight-card')
  vi.unmock('next/navigation')
})

async function loadArticleRoute(options?: {
  currentPost?: InsightPost | null
  allPosts?: InsightPost[]
  formattedDate?: string
  notFoundImpl?: () => never
}) {
  vi.doMock('@/lib/insights', () => ({
    getAllInsights: () => options?.allPosts ?? [primaryPost, secondaryPost],
    getInsightBySlug: (slug: string) =>
      slug === (options?.currentPost ?? primaryPost)?.slug ? options?.currentPost ?? primaryPost : null,
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
  vi.doMock('@/components/marketing/insight-article-content', () => ({
    InsightArticleContent: ({
      post,
      relatedPosts,
    }: {
      post: InsightPost
      relatedPosts: InsightPost[]
    }) =>
      React.createElement(
        'div',
        { 'data-post-slug': post.slug, 'data-related-count': relatedPosts.length },
        relatedPosts.map((candidate) => candidate.slug).join('|'),
      ),
  }))
  vi.doMock('@/components/marketing/insight-card', () => ({
    formatInsightDateLabel: () => options?.formattedDate ?? '6 mei 2026',
  }))
  vi.doMock('next/navigation', () => ({
    notFound: options?.notFoundImpl ?? (() => { throw new Error('NEXT_NOT_FOUND') }),
  }))

  return import('./page')
}

describe('inzichten article route', () => {
  it('generates static params and article metadata from the insight loader', async () => {
    const route = await loadArticleRoute()

    await expect(route.generateStaticParams()).resolves.toEqual([
      { slug: 'waarom-onboarding-retentie-vroeg-voorspelt' },
      { slug: 'vroege-uitstroomsignalen-op-groepsniveau-zien' },
    ])

    const metadata = await route.generateMetadata({
      params: Promise.resolve({ slug: 'waarom-onboarding-retentie-vroeg-voorspelt' }),
    })

    expect(metadata.alternates?.canonical).toBe('/inzichten/waarom-onboarding-retentie-vroeg-voorspelt')
    expect(metadata.openGraph?.type).toBe('article')
    expect(metadata.title).toBe('Waarom onboarding retentie vroeg voorspelt | Inzichten')
  })

  it('renders the route shell with article context and excludes the current post from related insights', async () => {
    const route = await loadArticleRoute()

    const markup = renderToStaticMarkup(
      await route.default({
        params: Promise.resolve({ slug: 'waarom-onboarding-retentie-vroeg-voorspelt' }),
      }),
    )

    expect(markup).toContain('Waarom onboarding retentie vroeg voorspelt')
    expect(markup).toContain('data-page-type="overview"')
    expect(markup).toContain('6 mei 2026')
    expect(markup).toContain('data-post-slug="waarom-onboarding-retentie-vroeg-voorspelt"')
    expect(markup).toContain('data-related-count="1"')
    expect(markup).toContain('vroege-uitstroomsignalen-op-groepsniveau-zien')
    expect(markup).not.toContain('waarom-onboarding-retentie-vroeg-voorspelt|')
  })

  it('calls notFound when the requested insight slug is missing', async () => {
    const notFound = vi.fn(() => {
      throw new Error('NEXT_NOT_FOUND')
    })
    const route = await loadArticleRoute({
      currentPost: null,
      notFoundImpl: notFound,
    })

    await expect(
      route.default({
        params: Promise.resolve({ slug: 'onbekend-inzicht' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
