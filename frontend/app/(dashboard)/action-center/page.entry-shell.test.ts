import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center campaign-entry shell', () => {
  it('keeps campaign-detail entry continuity visible in the Action Center workspace subtitle', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("source === 'campaign-detail'")
    expect(source).toContain('Geopend vanuit campaign detail')
  })
})
