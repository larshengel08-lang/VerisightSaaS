import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports overview guardrails', () => {
  it('keeps the page focused on report selection and download', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Rapportbibliotheek"')
    expect(source).toContain('title="Rapporten die nu leesbaar zijn."')
    expect(source).toContain('Open alleen de rapporten die al genoeg basis hebben')
    expect(source).toContain('title="Wat nu leesbaar is"')
    expect(source).toContain('Wanneer deze bibliotheek opent.')
    expect(source).not.toContain('Reports & Exports')
    expect(source).not.toContain('Open in viewer')
    expect(source).not.toContain('Beschikbare rapporten')
    expect(source).not.toContain('Van rapport naar opvolging')
  })
})
