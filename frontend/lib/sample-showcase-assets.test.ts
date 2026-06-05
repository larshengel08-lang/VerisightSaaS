import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
      deliveryReadiness: 'pilot_delivery_ready',
      docsPath: 'docs/examples/voorbeeldrapport_cultuurbeeld.pdf',
    })
    expect(cultureAsset?.publicHref).toBeUndefined()
    expect(cultureAsset?.buyerUse.toLowerCase()).toContain('jaarlijkse baseline')
    expect(cultureAsset?.buyerUse.toLowerCase()).toContain('niet als web-served website-prooflaag')
    expect(cultureAsset?.claimBoundary.toLowerCase()).toContain('manager ranking')
    expect(cultureAsset?.trustFrame.toLowerCase()).toContain('guided boardroom deck')
    expect(cultureAsset?.trustFrame.toLowerCase()).toContain('governance state')
    expect(cultureAsset?.trustFrame.toLowerCase()).toContain('buyer-facing sample canon')
    expect(getBuyerFacingShowcaseAssets().some((asset) => asset.product === 'culture_assessment')).toBe(false)
  })

  it('registers the culture assessment premium output pack as internal demo assets', () => {
    const cultureAssets = getInternalDemoShowcaseAssets('culture_assessment')
    const cultureAssetIds = cultureAssets.map((asset) => asset.id)
    const cultureDocs = cultureAssets.map((asset) => asset.docsPath)
    const deckSample = cultureAssets.find((asset) => asset.id === 'culture-assessment-board-deck-sample')
    const boardDeck = cultureAssets.find((asset) => asset.id === 'culture-assessment-board-deck')
    const executiveOnePager = cultureAssets.find((asset) => asset.id === 'culture-assessment-executive-one-pager')
    const hrAppendix = cultureAssets.find((asset) => asset.id === 'culture-assessment-hr-appendix')
    const hrAppendixSample = cultureAssets.find((asset) => asset.id === 'culture-assessment-hr-appendix-sample-page')
    const managerCascadeSample = cultureAssets.find((asset) => asset.id === 'culture-assessment-manager-cascade-sample-page')

    expect(cultureAssets.length).toBeGreaterThanOrEqual(12)
    expect(cultureAssetIds).toContain('culture-assessment-sample-report')
    expect(cultureAssetIds).toContain('culture-assessment-board-deck-sample')
    expect(cultureAssetIds).toContain('culture-assessment-board-deck')
    expect(cultureAssetIds).toContain('culture-assessment-executive-one-pager')
    expect(cultureAssetIds).toContain('culture-assessment-hr-appendix')
    expect(cultureAssetIds).toContain('culture-assessment-hr-appendix-sample-page')
    expect(cultureAssetIds).toContain('culture-assessment-manager-cascade-sample-page')
    expect(cultureAssetIds).toContain('culture-assessment-facilitator-script')
    expect(cultureAssetIds).toContain('culture-assessment-board-read-agenda')
    expect(cultureAssetIds).toContain('culture-assessment-demo-environment')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_HR_APPENDIX.md')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_BOARD_READ_AGENDA.md')
    expect(cultureDocs).toContain('docs/reference/CULTURE_ASSESSMENT_DEMO_ENVIRONMENT.md')
    expect(cultureDocs).toContain('docs/examples/voorbeelddeck_cultuurbeeld.pdf')
    expect(cultureDocs).toContain('docs/examples/voorbeeld_hr_appendix_cultuurbeeld.pdf')
    expect(cultureDocs).toContain('docs/examples/voorbeeld_manager_cascade_cultuurbeeld.pdf')
    expect(deckSample?.deliveryReadiness).toBe('pilot_delivery_ready')
    expect(boardDeck?.deliveryReadiness).toBe('pilot_delivery_ready')
    expect(executiveOnePager?.deliveryReadiness).toBe('blueprint_ready')
    expect(hrAppendix?.accessMode).toBe('internal_demo_only')
    expect(hrAppendixSample?.deliveryReadiness).toBe('demo_asset_ready')
    expect(managerCascadeSample?.claimBoundary.toLowerCase()).toContain('geen teamranking')
    expect(executiveOnePager?.trustFrame.toLowerCase()).toContain('premium report + deck family')
  })

  it('keeps every docsPath-backed showcase asset resolvable in the repo', () => {
    const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

    for (const asset of SAMPLE_SHOWCASE_ASSETS) {
      if (!asset.docsPath) continue
      expect(existsSync(resolve(repoRoot, asset.docsPath)), `${asset.id} -> ${asset.docsPath}`).toBe(true)
    }
  })
})
