import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center executive readback page', () => {
  it('keeps the page bounded to read-only governance readback', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('eyebrow="Executive readback"')
    expect(source).toContain('title="Bestuurlijke follow-through readback"')
    expect(source).toContain('Geen impactclaim')
    expect(source).toContain('Route activation approvals')
    expect(source).not.toContain('Projectboard')
    expect(source).not.toContain('Actie aanmaken')
  })
})
