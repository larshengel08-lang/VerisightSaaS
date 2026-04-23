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
})
