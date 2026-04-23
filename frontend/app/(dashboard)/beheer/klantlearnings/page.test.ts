import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer klantlearnings admin alignment', () => {
  it('keeps the learning workbench compact, operational and anchored in admin terminology', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('surface="ops"')
    expect(source).toContain('Operations learninglog')
    expect(source).toContain('Adminroute voor pilot- en klantlessen')
    expect(source).toContain('Leg lessen compact vast per lead of campaign')
    expect(source).toContain('Geen buyer-facing claims')
  })
})
