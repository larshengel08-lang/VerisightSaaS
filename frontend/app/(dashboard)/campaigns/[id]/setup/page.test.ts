import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campaign setup shell', () => {
  it('redirects to the existing beheer route until the real wizard (subsystem 2) lands', () => {
    expect(source).toContain('redirect(')
    expect(source).toContain('/beheer')
  })
})
