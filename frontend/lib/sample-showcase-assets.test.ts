import { describe, expect, it } from 'vitest'
import {
  SAMPLE_SHOWCASE_ASSETS,
  getBuyerFacingShowcaseAssets,
  getPrimarySampleShowcaseAsset,
} from '@/lib/sample-showcase-assets'

describe('sample showcase asset registry', () => {
  it('keeps exit as the primary buyer-facing pdf showcase route', () => {
    const exitAsset = getPrimarySampleShowcaseAsset('exit')

    expect(exitAsset?.status).toBe('buyer-facing active')
    expect(exitAsset?.publicHref).toBe('/examples/voorbeeldrapport_verisight.pdf')
    expect(exitAsset?.claimBoundary.toLowerCase()).toContain('fictieve data')
  })

  it('keeps retention as a complementary buyer-facing pdf showcase route', () => {
    const retentionAsset = getPrimarySampleShowcaseAsset('retention')

    expect(retentionAsset?.status).toBe('buyer-facing active')
    expect(retentionAsset?.publicHref).toBe('/examples/voorbeeldrapport_retentiescan.pdf')
    expect(retentionAsset?.trustFrame.toLowerCase()).toContain('verification-first')
  })

  it('separates buyer-facing active assets from legacy archive assets', () => {
    const buyerFacingAssets = getBuyerFacingShowcaseAssets()
    const legacyAssets = SAMPLE_SHOWCASE_ASSETS.filter((asset) => asset.status === 'legacy archive')

    expect(buyerFacingAssets.length).toBeGreaterThan(legacyAssets.length)
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_exitscan_35_fictief.pdf')
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_retentiescan_35_fictief.pdf')
  })
})
