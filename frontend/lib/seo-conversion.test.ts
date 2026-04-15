import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config'
import { metadata as homePageMetadata } from '@/app/page'
import sitemap from '@/app/sitemap'
import { metadata as aanpakMetadata } from '@/app/aanpak/page'
import { generateMetadata as generateSolutionMetadata } from '@/app/oplossingen/[slug]/page'
import { metadata as pricingMetadata } from '@/app/tarieven/page'
import { metadata as trustMetadata } from '@/app/vertrouwen/page'
import { generateMetadata as generateProductMetadata } from '@/app/producten/[slug]/page'
import { SEO_SOLUTION_PAGES, getSeoSolutionPageBySlug } from '@/lib/seo-solution-pages'

function firstImage(
  image:
    | string
    | URL
    | { url?: string | URL }
    | Array<string | URL | { url?: string | URL }>
    | undefined,
) {
  return Array.isArray(image) ? image[0] : image
}

describe('SEO conversion tranche', () => {
  it('keeps the homepage and support-page metadata aligned with current SEO positioning', () => {
    expect(homePageMetadata.title).toBe('ExitScan en RetentieScan voor HR-teams')
    expect(firstImage(aanpakMetadata.openGraph?.images)).toMatchObject({ url: '/opengraph-image' })
    expect(firstImage(pricingMetadata.openGraph?.images)).toMatchObject({ url: '/opengraph-image' })
    expect(firstImage(trustMetadata.openGraph?.images)).toBe('/opengraph-image')
  })

  it('adds solution routes to the sitemap and excludes example pdfs', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toContain('https://www.verisight.nl/oplossingen/verloop-analyse')
    expect(urls).toContain('https://www.verisight.nl/oplossingen/exitgesprekken-analyse')
    expect(urls).toContain('https://www.verisight.nl/oplossingen/medewerkersbehoud-analyse')
    expect(urls.some((url) => url.includes('/examples/'))).toBe(false)
  })

  it('serves noindex headers for buyer-facing example pdf assets', async () => {
    const headers = await nextConfig.headers?.()
    const exampleHeaderRule = headers?.find((rule) => rule.source === '/examples/:path*')

    expect(exampleHeaderRule?.headers).toContainEqual({
      key: 'X-Robots-Tag',
      value: 'noindex, noarchive, nosnippet',
    })
  })

  it('keeps exactly three compact SEO solution routes with the intended product mapping', () => {
    expect(SEO_SOLUTION_PAGES).toHaveLength(3)
    expect(getSeoSolutionPageBySlug('verloop-analyse')?.productHref).toBe('/producten/exitscan')
    expect(getSeoSolutionPageBySlug('exitgesprekken-analyse')?.routeInterest).toBe('exitscan')
    expect(getSeoSolutionPageBySlug('medewerkersbehoud-analyse')?.productHref).toBe('/producten/retentiescan')
    expect(SEO_SOLUTION_PAGES.map((page) => page.slug)).toEqual([
      'verloop-analyse',
      'exitgesprekken-analyse',
      'medewerkersbehoud-analyse',
    ])
  })

  it('generates solution and product metadata from the shared SEO contracts', async () => {
    const solutionMetadata = await generateSolutionMetadata({
      params: Promise.resolve({ slug: 'verloop-analyse' }),
    })
    const productMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'exitscan' }),
    })

    expect(solutionMetadata.title).toBe('Verloopanalyse | ExitScan voor vertrekduiding bij HR-teams')
    expect(solutionMetadata.alternates?.canonical).toBe('/oplossingen/verloop-analyse')
    expect(productMetadata.title).toBe('ExitScan | Verloopanalyse en vertrekduiding voor HR-teams')
    expect(productMetadata.alternates?.canonical).toBe('/producten/exitscan')
  })

  it('keeps inline route-aware forms on the intended money pages', () => {
    const productPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )
    const pricingPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'tarieven', 'page.tsx'),
      'utf8',
    )
    const solutionPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'oplossingen', '[slug]', 'page.tsx'),
      'utf8',
    )

    expect(productPageSource).toContain('defaultCtaSource="product_exit_form"')
    expect(productPageSource).toContain('defaultCtaSource="product_retention_form"')
    expect(productPageSource).toContain('ctaHref="#kennismaking"')
    expect(pricingPageSource).toContain('defaultCtaSource="pricing_form"')
    expect(solutionPageSource).toContain('MarketingInlineContactPanel')
    expect(solutionPageSource).toContain('defaultCtaSource={solutionPage.ctaSource}')
  })

  it('keeps llms.txt aligned with the current pricing and product routes', () => {
    const llmsText = fs.readFileSync(path.join(process.cwd(), 'public', 'llms.txt'), 'utf8')

    expect(llmsText).toContain('ExitScan Baseline: EUR 2.950')
    expect(llmsText).toContain('RetentieScan Baseline: EUR 3.450')
    expect(llmsText).toContain('https://www.verisight.nl/producten/exitscan')
    expect(llmsText).toContain('https://www.verisight.nl/producten/retentiescan')
  })
})
