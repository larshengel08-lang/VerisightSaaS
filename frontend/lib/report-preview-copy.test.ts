import { describe, expect, it } from 'vitest'
import { REPORT_PREVIEW_COPY } from '@/lib/report-preview-copy'

describe('REPORT_PREVIEW_COPY', () => {
  it('keeps exit preview aligned with the management-summary framing', () => {
    const exitCopy = REPORT_PREVIEW_COPY.exit

    expect(exitCopy.intro).toContain('managementsamenvatting')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Werkhypothesen')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Bewijsstatus')
    expect(exitCopy.nuance).toContain('geen diagnose')
    expect(exitCopy.hypothesisLead).toContain('eerste eigenaar')
    expect(exitCopy.trustTitle).toContain('Trust')
    expect(exitCopy.trustPoints.map(([title]) => title)).toContain('Privacygrens')
    expect(exitCopy.trustPoints.map(([title]) => title)).toContain('Bewijsstatus')
    expect(exitCopy.demoBody).toContain('Fictieve voorbeelddata')
  })

  it('keeps retention preview aligned with verification-first report language', () => {
    const retentionCopy = REPORT_PREVIEW_COPY.retention

    expect(retentionCopy.intro).toContain('eerste verificatiespoor')
    expect(retentionCopy.nuance).toContain('geen individuele voorspeller')
    expect(retentionCopy.nuance).toContain('v1-werkmodel')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Actielogica')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Bewijsstatus')
    expect(retentionCopy.trustPoints.map(([title]) => title)).toContain('Intended use')
    expect(retentionCopy.trustPoints.map(([title]) => title)).toContain('Privacygrens')
    expect(retentionCopy.trustPoints.map(([title, body]) => `${title} ${body}`.toLowerCase())).toContain(
      'bewijsstatus v1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd; geen bewezen predictor.',
    )
  })
})
