import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('campagnedetail: verlengingen tellen (spec 2026-09-16 par. 4.3)', () => {
  it('telt de verlengingen uit de auditevents binnen de eigen organisatie', () => {
    expect(source).toContain("contains('metadata', { extension: true })")
    expect(source).toContain("eq('organization_id', stats.organization_id)")
    expect(source).toContain('extensionCount: extensionCount ?? 0')
  })

  it('faalt luid als de telling niet lukt, in plaats van 0 verlengingen aan te nemen', () => {
    expect(source).toContain('{ count: extensionCount, error: extensionCountError }')
    expect(source).toContain('if (extensionCountError)')
    expect(source).toContain('throw new Error(`Kon het aantal verlengingen niet laden: ${extensionCountError.message}`)')
  })
})
