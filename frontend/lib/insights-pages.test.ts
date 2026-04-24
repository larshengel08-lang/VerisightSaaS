import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'

describe('insights pages v1 contracts', () => {
  it('adds the insights overview and exactly three detail pages to the sitemap', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toContain('https://www.verisight.nl/inzichten')
    expect(urls).toContain('https://www.verisight.nl/inzichten/waarom-medewerkers-vertrekken')
    expect(urls).toContain('https://www.verisight.nl/inzichten/welke-signalen-gaan-aan-verloop-vooraf')
    expect(urls).toContain('https://www.verisight.nl/inzichten/waar-staat-behoud-onder-druk')
    expect(urls.filter((url) => url.includes('/inzichten/'))).toHaveLength(3)
  })

  it('defines a repo-first registry with exactly three bounded insight entries', async () => {
    const moduleUnderTest = await import('@/lib/insights-pages').catch(() => null)

    expect(moduleUnderTest).not.toBeNull()
    expect(moduleUnderTest?.INSIGHT_PAGES).toHaveLength(3)
    expect(moduleUnderTest?.INSIGHT_PAGES.map((page) => page.slug)).toEqual([
      'waarom-medewerkers-vertrekken',
      'welke-signalen-gaan-aan-verloop-vooraf',
      'waar-staat-behoud-onder-druk',
    ])
    expect(new Set(moduleUnderTest?.INSIGHT_PAGES.map((page) => page.ctaSource)).size).toBe(3)
    expect(moduleUnderTest?.INSIGHT_PAGES.every((page) => !!page.publishedAt)).toBe(true)
    expect(moduleUnderTest?.INSIGHT_PAGES.filter((page) => page.theme === 'exit')).toHaveLength(2)
    expect(moduleUnderTest?.INSIGHT_PAGES.filter((page) => page.theme === 'retention')).toHaveLength(1)
    expect(moduleUnderTest?.INSIGHT_PAGES.every((page) => page.whenThisFits.length === 3)).toBe(true)
    expect(moduleUnderTest?.INSIGHT_PAGES.every((page) => page.notFor.length === 3)).toBe(true)
    expect(moduleUnderTest?.INSIGHT_PAGES.every((page) => page.cta.title.length > 0)).toBe(true)
    expect(moduleUnderTest?.INSIGHT_PAGES.every((page) => page.cta.body.length > 0)).toBe(true)
  })

  it('ships overview and detail routes with route-aware leadcapture on the detail pages', () => {
    const overviewPath = path.join(process.cwd(), 'app', 'inzichten', 'page.tsx')
    const detailPath = path.join(process.cwd(), 'app', 'inzichten', '[slug]', 'page.tsx')

    expect(fs.existsSync(overviewPath)).toBe(true)
    expect(fs.existsSync(detailPath)).toBe(true)

    const detailSource = fs.existsSync(detailPath) ? fs.readFileSync(detailPath, 'utf8') : ''

    expect(detailSource).toContain('MarketingInlineContactPanel')
    expect(detailSource).toContain('defaultCtaSource={insightPage.ctaSource}')
    expect(detailSource).toContain('notFound()')
    expect(detailSource).toContain('Wanneer dit past')
    expect(detailSource).toContain('Niet voor')
    expect(detailSource).toContain('Wanneer een gesprek zinvol is')
  })

  it('generates metadata for the overview and detail routes from the shared contract', async () => {
    const overviewModule = await import('@/app/inzichten/page').catch(() => null)
    const detailModule = await import('@/app/inzichten/[slug]/page').catch(() => null)

    expect(overviewModule).not.toBeNull()
    expect(detailModule).not.toBeNull()

    const detailMetadata = detailModule
      ? await detailModule.generateMetadata({ params: Promise.resolve({ slug: 'waarom-medewerkers-vertrekken' }) })
      : null

    expect(overviewModule?.metadata?.alternates?.canonical).toBe('/inzichten')
    expect(detailMetadata?.alternates?.canonical).toBe('/inzichten/waarom-medewerkers-vertrekken')
    expect(detailMetadata?.title).toBeTruthy()
    expect(detailMetadata?.description).toBeTruthy()
  })
})
