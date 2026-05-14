import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports route shell', () => {
  it('does not keep bridge actions or category filters as the primary HR structure', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('featuredReportBridge')
    expect(source).not.toContain('getReportEntryBridge')
    expect(source).not.toContain('normalizeCategory')
    expect(source).not.toContain('filterReportLibraryEntries')
    expect(source).not.toContain('Open campagnedetail')
    expect(source).not.toContain('Open route in Action Center')
    expect(source).not.toContain('CATEGORY_OPTIONS')
  })

  it('keeps report access tied to downloadable PDFs only', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('PdfDownloadButton')
    expect(source).toContain('Beschikbaar nu')
    expect(source).toContain('Nog niet beschikbaar')
    expect(source).not.toContain('Open route')
    expect(source).not.toContain('Ga naar campaign detail')
  })
})
