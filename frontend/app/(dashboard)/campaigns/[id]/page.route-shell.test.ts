import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('campaign detail first-next-step shell', () => {
  it('keeps the rail semantics on module level and shows breadcrumb + module back link in content', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getDashboardModuleHref')
    expect(source).toContain('getDashboardModuleKeyForScanType')
    expect(source).toContain('getDashboardModuleLabel')
    expect(source).toContain('Overzicht')
    expect(source).toContain('moduleBackLinkLabel')
    expect(source).toContain('Terug naar alle RetentieScans')
    expect(source).toContain('Terug naar alle ExitScans')
    expect(source).not.toContain('Terug naar dashboardoverzicht')
  })

  it('reuses shared first-next-step guidance inside the route section', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('getFirstNextStepGuidance')
    expect(source).toContain('firstNextStepGuidance.cards.map')
    expect(source).toContain('Alleen als vervolg echt nodig is')
    expect(source).toContain('Compacte vervolgroutes')
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
