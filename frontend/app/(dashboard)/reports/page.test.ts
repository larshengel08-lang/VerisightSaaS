import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('reports overview guardrails', () => {
  it('keeps the page focused on report selection and download', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Rapporten"')
    expect(source).toContain('title="Rapportbibliotheek"')
    expect(source).toContain('Bekijk per scan welke rapporten beschikbaar zijn en open of download de juiste versie.')
    expect(source).toContain('Open rapport')
    expect(source).toContain('Na het rapport')
    expect(source).not.toContain('Reports & Exports')
    expect(source).not.toContain('Open in viewer')
    expect(source).not.toContain('Beschikbare rapporten')
  })
})
