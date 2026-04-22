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
    expect(exitAsset?.evidenceTier).toBe('deliverable_proof')
    expect(exitAsset?.publicHref).toBe('/examples/voorbeeldrapport_verisight.pdf')
    expect(exitAsset?.claimBoundary.toLowerCase()).toContain('fictieve data')
  })

  it('keeps retention as a complementary buyer-facing pdf showcase route', () => {
    const retentionAsset = getPrimarySampleShowcaseAsset('retention')

    expect(retentionAsset?.status).toBe('buyer-facing active')
    expect(retentionAsset?.buyerUse.toLowerCase()).toContain('deliverable-proof')
    expect(retentionAsset?.publicHref).toBe('/examples/voorbeeldrapport_retentiescan.pdf')
    expect(retentionAsset?.trustFrame.toLowerCase()).toContain('verification-first')
  })

  it('separates buyer-facing active assets from legacy archive assets', () => {
    const buyerFacingAssets = getBuyerFacingShowcaseAssets()
    const legacyAssets = SAMPLE_SHOWCASE_ASSETS.filter((asset) => asset.status === 'legacy archive')
    const buyerFacingPdfs = buyerFacingAssets.filter((asset) => asset.kind === 'pdf')
    const onboardingPreview = SAMPLE_SHOWCASE_ASSETS.find((asset) => asset.id === 'onboarding-preview')

    expect(buyerFacingAssets.length).toBeGreaterThan(legacyAssets.length)
    expect(buyerFacingAssets.every((asset) => asset.evidenceTier === 'deliverable_proof')).toBe(true)
    expect(buyerFacingPdfs).toHaveLength(2)
    expect(buyerFacingPdfs.map((asset) => asset.product)).toEqual(['exit', 'retention'])
    expect(onboardingPreview?.status).toBe('buyer-facing active')
    expect(onboardingPreview?.product).toBe('onboarding')
    expect(onboardingPreview?.kind).toBe('preview')
    expect(onboardingPreview?.claimBoundary.toLowerCase()).toContain('geen journey-engine')
    expect(SAMPLE_SHOWCASE_ASSETS.find((asset) => asset.id === 'portfolio-preview')?.buyerUse.toLowerCase()).toContain(
      'kernroute-sample-rapporten',
    )
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_exitscan_35_fictief.pdf')
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_retentiescan_35_fictief.pdf')
  })
})
