import { describe, expect, it } from 'vitest'
import { resolveAccountHeading } from './account-heading'

describe('resolveAccountHeading (spec 2026-09-16 par. 6.5, walkthrough 1.3)', () => {
  it('toont de organisatienaam als er precies één is', () => {
    expect(resolveAccountHeading({ names: ['TEST Loep Testklant'], error: null, isAdmin: false })).toEqual({
      label: 'TEST Loep Testklant',
      degraded: false,
    })
  })

  it('telt bij meer organisaties in plaats van er één te kiezen', () => {
    expect(resolveAccountHeading({ names: ['A', 'B'], error: null, isAdmin: false })).toEqual({
      label: '2 organisaties',
      degraded: false,
    })
  })

  it('noemt de operator zonder lidmaatschap "Loep beheer"', () => {
    expect(resolveAccountHeading({ names: [], error: null, isAdmin: true })).toEqual({
      label: 'Loep beheer',
      degraded: false,
    })
  })

  it('faalt zichtbaar: laadfout of geen organisatie wordt een degraded label, nooit een maildomein', () => {
    expect(resolveAccountHeading({ names: [], error: 'permission denied', isAdmin: false })).toEqual({
      label: 'Organisatie niet geladen',
      degraded: true,
    })
    expect(resolveAccountHeading({ names: ['A'], error: 'Van 1 organisatie(s) ontbreekt de naam', isAdmin: false })).toEqual({
      label: 'Organisatie niet geladen',
      degraded: true,
    })
    expect(resolveAccountHeading({ names: [], error: null, isAdmin: false })).toEqual({
      label: 'Geen organisatie gekoppeld',
      degraded: true,
    })
  })

  it('bevat geen em- of en-dashes', () => {
    for (const args of [
      { names: [], error: 'x', isAdmin: false },
      { names: [], error: null, isAdmin: false },
      { names: ['A', 'B'], error: null, isAdmin: false },
    ]) {
      expect(resolveAccountHeading(args).label).not.toMatch(/[—–]/)
    }
  })
})
