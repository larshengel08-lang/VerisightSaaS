import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center preview shell', () => {
  it('keeps the adopted action center views and admin-first affordances visible in the client surface', () => {
    const source = readFileSync(
      new URL('../../../../components/dashboard/action-center-preview.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('Wat vraagt nu aandacht?')
    expect(source).toContain('Komende reviews')
    expect(source).toContain('Managers toewijzen')
    expect(source).toContain('Mijn open acties')
    expect(source).toContain('Actie aanmaken')
    expect(source).toContain('Open dossierbron')
  })
})
