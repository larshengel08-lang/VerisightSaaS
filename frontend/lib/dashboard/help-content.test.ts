import { describe, expect, it } from 'vitest'
import { HELP_CONTACT, HELP_ROLES, HELP_STEPS, HELP_THRESHOLDS } from './help-content'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL } from '@/lib/response-activation'

describe('hulpcopy (spec 2026-09-16 par. 6.4)', () => {
  it('beschrijft de drie stappen in gewone taal', () => {
    expect(HELP_STEPS.map((step) => step.title)).toEqual([
      '1. Inrichten',
      '2. Uitnodigen en herinneren',
      '3. Sluiten en rapport',
    ])
    expect(HELP_STEPS[1].body).toContain('vanuit je eigen mail')
    expect(HELP_STEPS[1].body).toContain('geen mailadressen')
    expect(HELP_STEPS[2].body).toContain('Na de sluitdatum kan niemand meer invullen')
  })

  it('legt de drempels uit met de echte constanten en zegt waarom', () => {
    expect(HELP_THRESHOLDS.total).toBe(MIN_INVITED_TOTAL)
    expect(HELP_THRESHOLDS.perDepartment).toBe(MIN_INVITED_PER_DEPARTMENT)
    expect(HELP_THRESHOLDS.why).toContain('groepsniveau')
    expect(HELP_THRESHOLDS.why).toContain(`${MIN_INVITED_TOTAL}`)
    expect(HELP_THRESHOLDS.why).toContain(`${MIN_INVITED_PER_DEPARTMENT}`)
    expect(HELP_THRESHOLDS.why).toContain('Overige afdelingen')
  })

  it('scheidt wat jij doet van wat Loep doet, zonder wij', () => {
    expect(HELP_ROLES.you.length).toBeGreaterThanOrEqual(3)
    expect(HELP_ROLES.loep.length).toBeGreaterThanOrEqual(3)
    const all = [...HELP_STEPS.map((s) => s.body), HELP_THRESHOLDS.why, ...HELP_ROLES.you, ...HELP_ROLES.loep, HELP_CONTACT.promise].join(' ')
    expect(all).not.toMatch(/\b[Ww]ij\b|\b[Ii]k\b/)
    expect(all).not.toMatch(/\b(campaign|respondentimport|surveylogica|managementduiding)\b/)
  })

  it('heeft één contactblok met hallo@getloep.nl en reactie binnen één werkdag', () => {
    expect(HELP_CONTACT.email).toBe('hallo@getloep.nl')
    expect(HELP_CONTACT.promise).toBe('Loep reageert binnen één werkdag.')
  })

  it('bevat geen em- of en-dashes', () => {
    const all = JSON.stringify({ HELP_STEPS, HELP_THRESHOLDS, HELP_ROLES, HELP_CONTACT })
    expect(all).not.toMatch(/[—–]/)
  })
})
