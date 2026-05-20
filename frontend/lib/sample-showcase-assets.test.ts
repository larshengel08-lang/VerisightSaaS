import { describe, expect, it } from 'vitest'
import {
  SAMPLE_SHOWCASE_ASSETS,
  getBuyerFacingShowcaseAssets,
  getInternalDemoShowcaseAssets,
  getPrimarySampleShowcaseAsset,
} from '@/lib/sample-showcase-assets'

describe('sample showcase asset registry', () => {
  it('keeps exit as the primary buyer-facing pdf showcase route', () => {
    const exitAsset = getPrimarySampleShowcaseAsset('exit')

    expect(exitAsset?.status).toBe('buyer-facing active')
    expect(exitAsset?.evidenceTier).toBe('deliverable_proof')
    expect(exitAsset?.publicHref).toBe('/examples/voorbeeldrapport_loep.pdf')
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

    expect(buyerFacingAssets.length).toBeGreaterThan(legacyAssets.length)
    expect(buyerFacingAssets.every((asset) => asset.evidenceTier === 'deliverable_proof')).toBe(true)
    expect(buyerFacingPdfs).toHaveLength(2)
    expect(buyerFacingPdfs.map((asset) => asset.product)).toEqual(['exit', 'retention'])
    expect(SAMPLE_SHOWCASE_ASSETS.find((asset) => asset.id === 'portfolio-preview')?.buyerUse.toLowerCase()).toContain(
      'kernroute-sample-rapporten',
    )
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_exitscan_35_fictief.pdf')
    expect(legacyAssets.map((asset) => asset.docsPath)).toContain('docs/examples/voorbeeldrapport_retentiescan_35_fictief.pdf')
  })

  it('keeps culture assessment sample output available for guided internal demos without making it public sample canon', () => {
    const cultureAsset = SAMPLE_SHOWCASE_ASSETS.find((asset) => asset.id === 'culture-assessment-sample-report')

    expect(cultureAsset).toMatchObject({
      product: 'culture_assessment',
      kind: 'pdf',
      status: 'internal demo support',
      accessMode: 'guided_sales_demo',
      deliveryReadiness: 'demo_asset_ready',
      docsPath: 'docs/examples/voorbeeldrapport_cultuurbeeld.pdf',
    })
    expect(cultureAsset?.publicHref).toBeUndefined()
    expect(cultureAsset?.claimBoundary.toLowerCase()).toContain('manager ranking')
    expect(getBuyerFacingShowcaseAssets().some((asset) => asset.product === 'culture_assessment')).toBe(false)
  })

  it('registers the culture assessment premium output pack as internal demo assets', () => {
    const cultureAssets = getInternalDemoShowcaseAssets('culture_assessment')
    const cultureAssetIds = cultureAssets.map((asset) => asset.id)
    const cultureDocs = cultureAssets.map((asset) => asset.docsPath)
    const boardDeck = cultureAssets.find((asset) => asset.id === 'culture-assessment-board-deck')
    const executiveOnePager = cultureAssets.find((asset) => asset.id === 'culture-assessment-executive-one-pager')
    const hrAppendix = cultureAssets.find((asset) => asset.id === 'culture-assessment-hr-appendix')

    expect(cultureAssets.length).toBeGreaterThanOrEqual(9)
    expect(cultureAssetIds).toContain('culture-assessment-sample-report')
    expect(cultureAssetIds).toContain('culture-assessment-board-deck')
    expect(cultureAssetIds).toContain('culture-assessment-executive-one-pager')
    expect(cultureAssetIds).toContain('culture-assessment-hr-appendix')
    expect(cultureAssetIds).toContain('culture-assessment-facilitator-script')
    expect(cultureAssetIds).toContain('culture-assessment-board-read-agenda')
    expect(cultureAssetIds).toContain('culture-assessment-demo-environment')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_HR_APPENDIX.md')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_DEMO_ENVIRONMENT.md')
    expect(boardDeck?.deliveryReadiness).toBe('pilot_delivery_ready')
    expect(executiveOnePager?.deliveryReadiness).toBe('blueprint_ready')
    expect(hrAppendix?.accessMode).toBe('internal_demo_only')
  })
})
