import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./read-only-state-card.tsx', import.meta.url), 'utf8')

describe('alleen-lezen statuskaart (spec 2026-09-11 par. 9)', () => {
  it('toont status en voortgang uit dezelfde resolverstaat', () => {
    expect(source).toContain('state.primaryMessage')
    expect(source).toContain('state.subtext')
    expect(source).toContain('state.showProgress')
  })

  it('legt uit waarom er geen knoppen staan', () => {
    expect(source).toContain('Alleen de eigenaar van deze Loep-omgeving kan de meting beheren.')
  })

  it('noemt de meting boven de kop (walkthrough 1.2)', () => {
    expect(source).toContain('state.campaignName')
  })

  it('bevat geen enkele actie', () => {
    expect(source).not.toContain('DashboardStateActions')
    expect(source).not.toContain('<button')
    expect(source).not.toContain('ctaLabel')
    expect(source).not.toContain('secondaryActions')
  })
})
