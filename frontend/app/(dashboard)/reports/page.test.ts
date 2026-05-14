import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports overview guardrails', () => {
  it('keeps the page focused on report download instead of featured library framing', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Beschikbaar nu')
    expect(source).toContain('Nog niet beschikbaar')
    expect(source).toContain('Download PDF')
    expect(source).not.toContain('DashboardHero')
    expect(source).not.toContain('Rapportbibliotheek')
    expect(source).not.toContain('Aanbevolen rapport')
    expect(source).not.toContain('Wanneer deze bibliotheek opent.')
    expect(source).not.toContain('Bekijk resultaten')
  })
})
