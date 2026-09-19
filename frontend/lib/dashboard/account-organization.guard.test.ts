import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./account-organization.ts', import.meta.url), 'utf8')

describe('loadAccountOrganizations (spec 2026-09-16 par. 6.5)', () => {
  it('leest de organisatienaam uit organizations via org_members, nooit uit het e-mailadres', () => {
    expect(src).toContain(".from('org_members')")
    expect(src).toContain(".from('organizations')")
    expect(src).toContain(".in('id', orgIds)")
    expect(src).not.toContain("split('@')")
  })

  it('geeft de namen in een vaste volgorde terug (Nederlandse sortering)', () => {
    expect(src).toContain(".sort((a, b) => a.localeCompare(b, 'nl'))")
  })

  it('geeft een fout terug in plaats van stil een lege lijst', () => {
    expect(src).toContain('error: membershipError.message')
    expect(src).toContain('error: orgError.message')
    expect(src).toContain('ontbreekt de naam')
  })
})
