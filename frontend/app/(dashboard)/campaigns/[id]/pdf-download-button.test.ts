import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('pdf download button guardrails', () => {
  it('releases the loading state with the tracked format key and never references a missing setter', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('setLoadingFormat(null)')
    expect(source).not.toContain('setLoading(false)')
  })

  it('gebruikt de dashboard-huisstijl in plaats van een losse blauwe knop', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('bg-[color:var(--dashboard-ink)]')
    expect(source).not.toContain('bg-blue-600')
    expect(source).not.toContain('hover:bg-blue-700')
  })

  it('laat label en uitlijning van buiten bepalen', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('label?: string')
    expect(source).toContain("align?: 'start' | 'end'")
  })

  it('legt een mislukte download in het Nederlands uit, met contact, en houdt de technische melding apart (walkthrough 5.3)', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain(
      "import { downloadErrorMessage, purgedDownloadMessage, summarizeTechnicalDetail } from '@/lib/report-download-error'",
    )
    expect(source).toContain('downloadErrorMessage(response.status)')
    expect(source).toContain('Technische melding:')
    expect(source).not.toContain('Controleer of de backend bereikbaar is')
    expect(source).not.toContain('Rapport kon niet worden gegenereerd')
    expect(source).not.toMatch(/[—–]/)
  })

  it('geeft de statuscode-specifieke hoofdmelding en de ruwe backend-body altijd door aan summarizeTechnicalDetail (code review Task 9)', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('technical: summarizeTechnicalDetail(rawDetail)')
    expect(source).not.toContain('detail.trim()')
  })

  it('toont bij een 410 na de opschoning de backendzin met datum als hoofdmelding, zonder herhaling als technische melding', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('purgedDownloadMessage(response.status, rawDetail)')
    expect(source).toContain('{ message: purgedMessage, technical: null }')
  })

  it('logt en toont de echte fout bij een verbindingsprobleem in plaats van een vaste "backend bereikbaar"-tekst (code review Task 9)', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toContain('console.error(err)')
    expect(source).toContain('Het downloaden is niet gelukt. Controleer je internetverbinding en probeer het opnieuw.')
    expect(source).toContain('summarizeTechnicalDetail(err instanceof Error ? err.message : String(err))')
  })

  it('houdt de technische melding leesbaar (afbreken, begrensde hoogte, voldoende contrast) (code review Task 9)', () => {
    const source = readFileSync(new URL('./pdf-download-button.tsx', import.meta.url), 'utf8')

    expect(source).toMatch(/max-h-24 overflow-auto break-words text-\[11px\] text-red-700/)
    expect(source).not.toContain('text-red-600/70')
  })
})
