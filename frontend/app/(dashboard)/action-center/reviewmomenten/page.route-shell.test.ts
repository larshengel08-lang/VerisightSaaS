import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('action center reviewmomenten route source', () => {
  it('guards the route with the same Action Center access boundary as the overview page', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).toContain("redirect('/login')")
    expect(source).toContain('canViewActionCenter')
    expect(source).toContain("redirect('/dashboard')")
  })

  it('does not reuse the broad ActionCenterPreview suite or org_invites as a reviewmomenten workaround', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

    expect(source).not.toContain('ActionCenterPreview')
    expect(source).not.toContain('org_invites')
  })
})
