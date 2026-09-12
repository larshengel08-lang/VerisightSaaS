import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('rapportenoverzicht (spec 2026-09-11 par. 4.3)', () => {
  it('bouwt de rijen met de rapportvrijgaveregel', () => {
    expect(source).toContain('buildReportOverviewRows')
    expect(source).not.toContain('buildHrReportDownloadRows')
  })

  it('plant hier geen bespreking meer', () => {
    expect(source).not.toContain('CALENDLY')
    expect(source).not.toContain('mailto:')
    expect(source).not.toContain('Plan bespreking')
    expect(source).not.toContain('Managementbespreking plannen')
  })

  it('faalt luid als het overzicht niet geladen kan worden', () => {
    expect(source).toContain('throw new Error')
  })
})
