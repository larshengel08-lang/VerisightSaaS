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

function imageUrl(
  image:
    | string
    | URL
    | { url?: string | URL }
    | Array<string | URL | { url?: string | URL }>
    | undefined,
) {
  const first = firstImage(image)
  if (typeof first === 'string') return first
  if (first instanceof URL) return first.toString()
  if (first?.url instanceof URL) return first.url.toString()
  return first?.url
}

describe('SEO conversion tranche', () => {
  it('keeps the homepage and support-page metadata aligned with current SEO positioning', () => {
    expect(homePageMetadata.title).toBe('Verisight')
    expect(homePageMetadata.alternates?.canonical).toBe('/')
    expect(imageUrl(aanpakMetadata.openGraph?.images)).toBe('/opengraph-image')
    expect(imageUrl(pricingMetadata.openGraph?.images)).toBe('/opengraph-image')
    expect(imageUrl(trustMetadata.openGraph?.images)).toBe('/opengraph-image')
  })

  it('adds solution routes to the sitemap and excludes example pdfs', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toContain('https://www.getloep.nl/oplossingen/verloop-analyse')
    expect(urls).toContain('https://www.getloep.nl/oplossingen/exitgesprekken-analyse')
    expect(urls).toContain('https://www.getloep.nl/oplossingen/medewerkersbehoud-analyse')
    expect(urls).toContain('https://www.getloep.nl/producten/cultuurbeeld')
    expect(urls).toContain('https://www.getloep.nl/producten/pulse')
    expect(urls).toContain('https://www.getloep.nl/producten/onboarding-30-60-90')
    expect(urls).toContain('https://www.getloep.nl/producten/leadership-scan')
    expect(urls).not.toContain('https://www.getloep.nl/producten/teamscan')
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
    const exitProductMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'exitscan' }),
    })
    const cultureProductMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'cultuurbeeld' }),
    })
    const pulseProductMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'pulse' }),
    })
    const onboardingProductMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'onboarding-30-60-90' }),
    })
    const leadershipProductMetadata = await generateProductMetadata({
      params: Promise.resolve({ slug: 'leadership-scan' }),
    })

    expect(solutionMetadata.title).toBe('Verloopanalyse | Loep Vertrek voor vertrekduiding bij HR-teams')
    expect(solutionMetadata.alternates?.canonical).toBe('/oplossingen/verloop-analyse')
    expect(exitProductMetadata.title).toBe('Loep Vertrek | Verloopanalyse en vertrekduiding voor HR-teams')
    expect(exitProductMetadata.alternates?.canonical).toBe('/producten/exitscan')
    expect(cultureProductMetadata.title).toBe(
      'Loep Cultuurbeeld | Jaarlijkse cultuur- en engagementbaseline voor directie en HR',
    )
    expect(cultureProductMetadata.alternates?.canonical).toBe('/producten/cultuurbeeld')
    expect(pulseProductMetadata.title).toBe('Pulse | Compacte reviewmetingen na eerste baseline of managementread')
    expect(pulseProductMetadata.alternates?.canonical).toBe('/producten/pulse')
    expect(onboardingProductMetadata.title).toBe('Loep Start | Vroege lifecycle-check voor nieuwe medewerkers')
    expect(onboardingProductMetadata.alternates?.canonical).toBe('/producten/onboarding-30-60-90')
    expect(leadershipProductMetadata.title).toBe('Leadership Scan | Begrensde managementread na een bestaand signaal')
    expect(leadershipProductMetadata.alternates?.canonical).toBe('/producten/leadership-scan')
  })

  it('keeps route-aware CTA wiring on the intended money pages', () => {
    const productPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'producten', '[slug]', 'page.tsx'),
      'utf8',
    )
    const pricingPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'tarieven', 'page.tsx'),
      'utf8',
    )
    const pricingContentSource = fs.readFileSync(
      path.join(process.cwd(), 'components', 'marketing', 'tarieven-content.tsx'),
      'utf8',
    )
    const solutionPageSource = fs.readFileSync(
      path.join(process.cwd(), 'app', 'oplossingen', '[slug]', 'page.tsx'),
      'utf8',
    )

    expect(productPageSource).toContain("ctaSource: 'product_exit_form'")
    expect(productPageSource).toContain("ctaSource: 'product_retention_form'")
    expect(productPageSource).toContain("ctaSource: 'product_culture_assessment_form'")
    expect(productPageSource).toContain("ctaSource: 'product_pulse_form'")
    expect(productPageSource).toContain("ctaSource: 'product_onboarding_form'")
    expect(productPageSource).toContain("ctaSource: 'product_leadership_form'")
    expect(productPageSource.includes('ctaHref="#kennismaking"') || productPageSource.includes('href="#kennismaking"')).toBe(true)
    expect(pricingPageSource).toContain("ctaSource: 'pricing_primary_cta'")
    expect(pricingContentSource).toContain("ctaSource: 'pricing_closing_cta'")
    expect(solutionPageSource).toContain('MarketingClosingCta')
    expect(solutionPageSource).toContain('ctaSource: solutionPage.ctaSource')
  })

  it('keeps llms.txt aligned with the current pricing and product routes', () => {
    const llmsText = fs.readFileSync(path.join(process.cwd(), 'public', 'llms.txt'), 'utf8')

    // Actuele portfolio (2026-07-04): drie gelijkwaardige scans, één prijs.
    expect(llmsText).toContain('EUR 4.500 excl. btw')
    expect(llmsText).toContain('https://www.getloep.nl/producten#loep-vertrek')
    expect(llmsText).toContain('https://www.getloep.nl/producten#loep-behoud')
    expect(llmsText).toContain('https://www.getloep.nl/producten#loep-start')
    expect(llmsText).toContain('https://www.getloep.nl/producten#tarieven')
    expect(llmsText).toContain('https://www.getloep.nl/kennismaking')
    expect(llmsText).toContain('/examples/voorbeeldrapport_loep.pdf')
    expect(llmsText).toContain('/examples/voorbeeldrapport_retentiescan.pdf')
    // Oud merk, verwijderde producten en oude prijzen mogen niet terugkomen.
    expect(llmsText).not.toContain('Verisight')
    expect(llmsText).not.toContain('2.950')
    expect(llmsText).not.toContain('3.450')
    expect(llmsText).not.toContain('Pulse')
    expect(llmsText).not.toContain('Leadership')
    expect(llmsText).not.toContain('Cultuurbeeld')
    expect(llmsText).not.toContain('/aanpak')
    expect(llmsText).not.toContain('TeamScan')
  })
})
