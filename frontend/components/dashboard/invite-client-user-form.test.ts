import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('invite client user form clarity', () => {
  it('biedt geen viewer/owner-keuze meer aan — altijd owner (2026-07-09)', () => {
    const source = readFileSync(new URL('./invite-client-user-form.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('setRole')
    expect(source).not.toContain('Viewer - alleen dashboard en rapport')
    expect(source).not.toContain('Klant owner - kritieke launchacties')
    expect(source).toContain("const role = 'owner'")
  })
})
