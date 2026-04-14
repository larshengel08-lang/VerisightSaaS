import { describe, expect, it } from 'vitest'
import { REPORT_PREVIEW_COPY } from '@/lib/report-preview-copy'

describe('REPORT_PREVIEW_COPY', () => {
  it('keeps exit preview aligned with the management-summary framing', () => {
    const exitCopy = REPORT_PREVIEW_COPY.exit

    expect(exitCopy.intro).toContain('managementsamenvatting')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Werkhypothesen')
    expect(exitCopy.hypothesisLead).toContain('eerste eigenaar')
  })

  it('keeps retention preview aligned with verification-first report language', () => {
    const retentionCopy = REPORT_PREVIEW_COPY.retention

    expect(retentionCopy.intro).toContain('eerste verificatiespoor')
    expect(retentionCopy.nuance).toContain('geen individuele voorspeller')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Actielogica')
  })
})
