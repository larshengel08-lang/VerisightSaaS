import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('beheer managers route source', () => {
  const fileUrl = new URL('./page.tsx', import.meta.url)

  it('uses the agreed assignment-only route and page shell', () => {
    const source = readFileSync(fileUrl, 'utf8')

    expect(source).toContain('Managers')
    expect(source).toContain('ManagersPageView')
    expect(source).toContain('getManagersPageData')
  })

  it('guards the route with suite access instead of reusing ActionCenterPreview', () => {
    const source = readFileSync(fileUrl, 'utf8')

    expect(source).toContain('canManageActionCenterAssignments')
    expect(source).toContain("redirect('/action-center')")
    expect(source).not.toContain('ActionCenterPreview')
    expect(source).not.toContain('org_invites')
  })

  it('does not introduce lifecycle semantics into the managers page copy', () => {
    const source = readFileSync(fileUrl, 'utf8').toLowerCase()

    for (const forbidden of [
      'uitnodiging',
      'activatie',
      'pending',
      'invited',
      'activated',
      'access requested',
      'wacht op toegang',
      'toegang aangevraagd',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
