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
})
