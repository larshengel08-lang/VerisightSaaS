import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('klantlearnings action center truth pass', () => {
  it('keeps the live ExitScan surface bounded and read-only for the admin route', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildExitActionCenterWorkspace')
    expect(source).toContain('isExitActionCenterCandidate')
    expect(source).toContain("role: 'member'")
    expect(source).toContain('Action Center voor ExitScan-follow-through')
    expect(source).toContain('Surface-rechten')
    expect(source).toContain('Read-only')
    expect(source).toContain('Ownerduiding')
    expect(source).toContain('Exit-only filter')
    expect(source).toContain('Reviewstatus')
    expect(source).toContain('Nog niet gepland')
    expect(source).not.toContain('buildMtoActionCenterWorkspace')
    expect(source).not.toContain('Action Center voor MTO-follow-through')
  })
})
