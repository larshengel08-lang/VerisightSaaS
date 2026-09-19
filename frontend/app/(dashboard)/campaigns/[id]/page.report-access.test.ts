import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
const reportBlock = source.slice(source.indexOf("state.kind === 'report_ready'"))

describe('campagnedetail: rapport in eigen hand (spec 2026-09-11 par. 4.2)', () => {
  it('toont de downloadknop zonder adminvoorwaarde', () => {
    expect(reportBlock).toContain('PdfDownloadButton')
    expect(reportBlock).not.toContain('isAdmin')
  })

  it('belooft geen contact door Loep meer', () => {
    expect(source).not.toContain('Loep neemt contact met je op')
    expect(source).toContain('Je rapport staat klaar')
    expect(source).toContain('Het antwoord staat op pagina twee.')
  })

  it('plant geen bespreking meer vanaf het campagnedetail', () => {
    expect(source).not.toContain('NEXT_PUBLIC_CALENDLY_URL')
    expect(source).not.toContain('managementbespreking')
  })

  it('biedt op "gesloten zonder rapport" de weg naar een nieuwe meting (spec 2026-09-16 par. 4.5 en 6.3)', () => {
    expect(source).toContain("state.processingVariant === 'insufficient_response'")
    expect(source).toContain('<RequestNewMeasurement variant="follow_up" organizationName={orgData?.name ?? null} />')
  })
})
