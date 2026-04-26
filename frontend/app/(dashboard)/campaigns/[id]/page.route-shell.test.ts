import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail first-next-step shell', () => {
  it('reuses shared first-next-step guidance inside the route section', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getFirstNextStepGuidance')
    expect(source).toContain('firstNextStepGuidance.cards.map')
    expect(source).toContain('Mogelijke vervolgroutes')
    expect(source).toContain('Geen standaard vervolg')
    expect(source).toContain('followOnSuggestions.map')
  })

  it('keeps the module preview layer anchored to real campaign evidence', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('SignalStatCard')
    expect(source).toContain('InsightStatCard')
    expect(source).toContain('FocusPanel')
    expect(source).toContain("label=\"Signaal-index\"")
    expect(source).toContain("label=\"Respons\"")
    expect(source).toContain("label=\"Risicoband\"")
    expect(source).toContain("label=\"Sterkste factor\"")
    expect(source).toContain('focusPanelItems')
  })
})
