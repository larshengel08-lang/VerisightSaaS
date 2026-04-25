import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('klantlearnings action center landing', () => {
  it('wires ExitScan onto the live action center surface without reopening the wider adapter suite', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("buildExitActionCenterWorkspace")
    expect(source).toContain('Action Center voor ExitScan-follow-through')
    expect(source).toContain('Operations Action Center')
    expect(source).toContain('ExitScan follow-through als zelfstandige productlaag')
    expect(source).toContain('Expliciete eigenaar')
    expect(source).toContain('Reviewdruk')
    expect(source).toContain('Dossier-first')
    expect(source).toContain('Nog geen open ExitScan-dossiers')
    expect(source).not.toContain("buildMtoActionCenterWorkspace")
    expect(source).not.toContain('Action Center voor MTO-follow-through')
  })
})
