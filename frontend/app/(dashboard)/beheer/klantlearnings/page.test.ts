import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('klantlearnings action center landing', () => {
  it('keeps MTO on the shared action center core without opening other carriers', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("buildMtoActionCenterWorkspace")
    expect(source).toContain('Action Center voor MTO-follow-through')
    expect(source).toContain('Operations Action Center')
    expect(source).toContain('Shared follow-through voor cockpit, dossiers en reviews')
    expect(source).toContain('HR blijft de centrale eigenaar')
    expect(source).toContain('Reviewdruk')
    expect(source).toContain('Dossier-first')
    expect(source).toContain('Nog geen open MTO-dossiers')
  })
})
