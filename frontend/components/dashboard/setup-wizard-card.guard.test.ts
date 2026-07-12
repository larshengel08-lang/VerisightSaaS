import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('setup-wizard afdelingsblok', () => {
  const src = readFileSync(new URL('./setup-wizard-card.tsx', import.meta.url), 'utf8')

  it('toont in segment-modus een blok per afdeling met naam, aantal en kopieerlink', () => {
    expect(src).toContain('saveSegmentDepartmentsAction')
    expect(src).toContain('buildSegmentSurveyLinks')
  })
  it('vergrendelt de naam van afdelingen met responses', () => {
    expect(src).toContain('lockedDepartments')
    expect(src).toMatch(/naam vergrendeld|al responses/)
  })
  it('toont het automatisch opgetelde totaal', () => {
    expect(src).toMatch(/Totaal deelnemers|totalInvited/)
  })
  it('managet de n>=5-verwachting expliciet', () => {
    expect(src).toContain('minimaal 5')
  })
  it('vraagt het enkelvoudige aantal niet meer in segment-modus', () => {
    expect(src).toMatch(/hasSegments|segmentMode/)
  })
})
