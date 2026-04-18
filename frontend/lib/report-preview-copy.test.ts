import { describe, expect, it } from 'vitest'
import { REPORT_PREVIEW_COPY } from '@/lib/report-preview-copy'

describe('REPORT_PREVIEW_COPY', () => {
  it('keeps exit preview aligned with the fixed opening flow before the management-summary layer', () => {
    const exitCopy = REPORT_PREVIEW_COPY.exit

    expect(exitCopy.intro).toContain('rustige cover')
    expect(exitCopy.intro).toContain('expliciete responslaag')
    expect(exitCopy.dashboardRows).toHaveLength(4)
    expect(exitCopy.factorCards).toHaveLength(6)
    expect(exitCopy.boardroomTitle).toContain('Bestuurlijke handoff')
    expect(exitCopy.boardroomPoints.map(([title]) => title)).toContain('Wat speelt nu')
    expect(exitCopy.boardroomPoints.map(([title]) => title)).toContain('Wat niet concluderen')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Cover + respons')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Bestuurlijke handoff')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Werkhypothesen')
    expect(exitCopy.proofNotes.map(([title]) => title)).toContain('Bewijsstatus')
    expect(exitCopy.nuance).toContain('geen diagnose')
    expect(exitCopy.nuance).toContain('geen geforceerde ROI-claim')
    expect(exitCopy.hypothesisLead).toContain('eerste eigenaar')
    expect(exitCopy.intro).toContain('eerste managementsessie')
    expect(exitCopy.proofNotes.find(([title]) => title === 'Cover + respons')?.[1]).toContain(
      'eerste managementsessie',
    )
    expect(exitCopy.trustTitle).toContain('Trust')
    expect(exitCopy.trustPoints.map(([title]) => title)).toContain('Privacygrens')
    expect(exitCopy.trustPoints.map(([title]) => title)).toContain('Bewijsstatus')
    expect(exitCopy.demoBody).toContain('Fictieve voorbeelddata')
    expect(exitCopy.sampleReportHref).toBe('/examples/voorbeeldrapport_verisight.pdf')
  })

  it('keeps retention preview aligned with verification-first report language', () => {
    const retentionCopy = REPORT_PREVIEW_COPY.retention

    expect(retentionCopy.intro).toContain('eerste verificatiespoor')
    expect(retentionCopy.dashboardRows).toHaveLength(4)
    expect(retentionCopy.factorCards).toHaveLength(6)
    expect(retentionCopy.boardroomTitle).toContain('Bestuurlijke handoff')
    expect(retentionCopy.boardroomPoints.map(([title]) => title)).toContain('Waarom telt dit nu')
    expect(retentionCopy.nuance).toContain('geen individuele voorspeller')
    expect(retentionCopy.nuance).toContain('v1-werkmodel')
    expect(retentionCopy.intro).toContain('eerste managementsessie')
    expect(retentionCopy.hypothesisLead).toContain('reviewmoment')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Bestuurlijke handoff')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Actielogica')
    expect(retentionCopy.proofNotes.map(([title]) => title)).toContain('Bewijsstatus')
    expect(retentionCopy.trustPoints.map(([title]) => title)).toContain('Intended use')
    expect(retentionCopy.trustPoints.map(([title]) => title)).toContain('Privacygrens')
    expect(retentionCopy.trustPoints.map(([title, body]) => `${title} ${body}`.toLowerCase())).toContain(
      'bewijsstatus v1-werkmodel: inhoudelijk plausibel, intern consistent en testmatig beschermd; geen bewezen predictor.',
    )
    expect(retentionCopy.sampleReportHref).toBe('/examples/voorbeeldrapport_retentiescan.pdf')
  })

  it('keeps the portfolio preview explicit about route choice before product breadth', () => {
    const portfolioCopy = REPORT_PREVIEW_COPY.portfolio

    expect(portfolioCopy.intro).toContain('boardroom-structuur')
    expect(portfolioCopy.boardroomPoints.map(([title]) => title)).toContain('Wat speelt nu')
    expect(portfolioCopy.proofNotes.map(([title]) => title)).toContain('Core proof blijft leidend')
    expect(
      portfolioCopy.proofNotes.find(([title]) => title === 'Core proof blijft leidend')?.[1].toLowerCase(),
    ).toContain('exitscan en retentiescan')
    expect(portfolioCopy.proofNotes.map(([title]) => title)).toContain('Managementsamenvatting')
    expect(portfolioCopy.sampleReportBody?.toLowerCase()).toContain('core-first')
    expect(portfolioCopy.sampleReportHref).toBe('/producten')
  })
})
