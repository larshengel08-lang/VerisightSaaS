import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('open answers page', () => {
  it('keeps the page inside the results environment and not beheer', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Alle open antwoorden')
    expect(source).toContain('Thematische clusters')
    expect(source).not.toContain('Routebeheer')
  })
})
