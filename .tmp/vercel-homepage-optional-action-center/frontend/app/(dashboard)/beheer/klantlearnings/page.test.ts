import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('klantlearnings action center preview adoption', () => {
  it('keeps the live ExitScan surface bounded while handing the UI to the preview shell', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildExitActionCenterWorkspace')
    expect(source).toContain('isExitActionCenterCandidate')
    expect(source).toContain("role: 'member'")
    expect(source).toContain('ActionCenterPreview')
    expect(source).toContain('fallbackOwnerName')
    expect(source).toContain('workbenchHref="#dossierbron"')
    expect(source).toContain('current main')
    expect(source).not.toContain('buildMtoActionCenterWorkspace')
    expect(source).not.toContain('Action Center voor MTO-follow-through')
  })
})
