import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('klantlearnings action center landing', () => {
  it('keeps MTO live and adds ExitScan as exactly one additional consumer on the same action center surface', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("buildMtoActionCenterWorkspace")
    expect(source).toContain('buildExitActionCenterWorkspace')
    expect(source).toContain('Action Center voor MTO-follow-through')
    expect(source).toContain('Operations Action Center')
    expect(source).toContain('Shared follow-through voor cockpit, dossiers en reviews')
    expect(source).toContain('HR blijft de centrale eigenaar')
    expect(source).toContain('ExitScan live consumer')
    expect(source).toContain('Shared follow-through voor ExitScan-dossiers, reviews en workbench')
    expect(source).toContain('Open ExitScan follow-through')
    expect(source).toContain('Nog geen open ExitScan-dossiers')
    expect(source).toContain('Reviewdruk')
    expect(source).toContain('Dossier-first')
    expect(source).toContain('Nog geen open MTO-dossiers')
  })
})
