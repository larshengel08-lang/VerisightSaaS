import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center reviewmomenten entry shell', () => {
  it('keeps the route on the shared action-center data helper and dedicated review client', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('ReviewMomentPageClient')
    expect(source).toContain('getActionCenterPageData')
    expect(source).toContain('computeReviewMomentGovernanceCounts')
    expect(source).toContain('context.canScheduleActionCenterReview')
    expect(source).toContain('canDownloadInviteArtifact={context.canScheduleActionCenterReview}')
  })
})
