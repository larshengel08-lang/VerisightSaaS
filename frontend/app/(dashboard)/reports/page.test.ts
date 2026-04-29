import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports overview guardrails', () => {
  it('keeps the page focused on report selection and download', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Rapporten"')
    expect(source).toContain('title="Rapporten die klaarstaan."')
    expect(source).toContain('Gebruik dit scherm eerst als bibliotheek: welk document hoort bij welke route, en wat kun je nu openen.')
    expect(source).toContain('Open rapport')
    expect(source).toContain('Kernoutput eerst')
    expect(source).toContain('Bounded reads secundair')
    expect(source).toContain('Bibliotheeklijst')
    expect(source).not.toContain('Na het rapport')
    expect(source).not.toContain('Reports & Exports')
    expect(source).not.toContain('Open in viewer')
    expect(source).not.toContain('Beschikbare rapporten')
  })
})
