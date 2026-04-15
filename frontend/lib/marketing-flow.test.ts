import { describe, expect, it } from 'vitest'
import { REPORT_PREVIEW_COPY } from '@/lib/report-preview-copy'
import { getBuyerFacingShowcaseAssets } from '@/lib/sample-showcase-assets'
import {
  homepageProductRoutes,
  homepageUtilityLinks,
  marketingNavLinks,
  marketingPrimaryCta,
  marketingSecondaryCta,
} from '@/components/marketing/site-content'

describe('marketing flow defaults', () => {
  it('keeps the primary and secondary CTA labels aligned with the redesign', () => {
    expect(marketingPrimaryCta).toEqual({
      href: '/#kennismaking',
      label: 'Plan kennismaking',
    })
    expect(marketingSecondaryCta).toEqual({
      href: '/producten',
      label: 'Bekijk de routes',
    })
  })

  it('keeps the top navigation focused on products, process, pricing and trust', () => {
    expect(marketingNavLinks).toEqual([
      { href: '/', label: 'Home' },
      { href: '/producten', label: 'Producten' },
      { href: '/aanpak', label: 'Aanpak' },
      { href: '/tarieven', label: 'Tarieven' },
      { href: '/vertrouwen', label: 'Vertrouwen' },
    ])
  })

  it('keeps ExitScan as the first homepage route and RetentieScan as the complement', () => {
    expect(homepageProductRoutes.map((route) => route.name)).toEqual(['ExitScan', 'RetentieScan', 'Combinatie'])
    expect(homepageProductRoutes[0]?.chip).toBe('Primaire route')
    expect(homepageProductRoutes[1]?.chip).toBe('Complementair')
    expect(homepageProductRoutes[2]?.body.toLowerCase()).toContain('nadat de eerste helder staat')
  })

  it('keeps homepage utility links aligned with buyer flow and due diligence', () => {
    expect(homepageUtilityLinks.map((link) => link.href)).toEqual([
      '/producten',
      '/aanpak',
      '/tarieven',
      '/vertrouwen',
    ])
  })

  it('keeps preview copy and buyer-facing showcase assets linked to the same proof paths', () => {
    const assetHrefs = getBuyerFacingShowcaseAssets().map((asset) => asset.publicHref)

    expect(assetHrefs).toContain(REPORT_PREVIEW_COPY.exit.sampleReportHref)
    expect(assetHrefs).toContain(REPORT_PREVIEW_COPY.retention.sampleReportHref)
    expect(REPORT_PREVIEW_COPY.portfolio.sampleReportHref).toBe('/producten')
  })
})
