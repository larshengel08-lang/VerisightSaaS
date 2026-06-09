import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports overview guardrails', () => {
  it('keeps the page focused on report selection and download', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Rapportbibliotheek"')
    expect(source).toContain('title="Klaar voor het overleg."')
    expect(source).toContain('Gebruik rapporten als compacte samenvatting voor overleg')
    expect(source).toContain('Rapporten klaar voor bespreking')
    expect(source).toContain('Wanneer deze bibliotheek echt opent.')
    expect(source).toContain('Van rapport naar opvolging')
    expect(source).not.toContain('Reports & Exports')
    expect(source).not.toContain('Open in viewer')
    expect(source).not.toContain('Beschikbare rapporten')
  })
})
