import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('open survey proxy — query-params', () => {
  it('stuurt de query-string (?afd=...) door naar de backend', () => {
    const src = readFileSync(join(__dirname, '[token]', 'route.ts'), 'utf-8')
    // De fetch-URL moet de zoekstring van het request bevatten:
    expect(src).toContain('req.nextUrl.search')
  })
})
