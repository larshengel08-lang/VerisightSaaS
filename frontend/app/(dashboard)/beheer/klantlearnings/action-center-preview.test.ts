import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center preview shell', () => {
  it('keeps the adopted action center views and admin-first affordances visible in the client surface', () => {
    const source = readFileSync(
      new URL('../../../../components/dashboard/action-center-preview.tsx', import.meta.url),
      'utf8',
    )

    expect(source).toContain('Reviewmomenten')
    expect(source).toContain('Managers toewijzen')
    expect(source).toContain('Mijn teams')
    expect(source).toContain('Actie aanmaken')
    expect(source).toContain('Open dossierbron')
    expect(source).toContain('Volgende reviewsessie')
  })
})
