import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')
const panels = readFileSync(new URL('../../../components/dashboard/onboarding-panels.tsx', import.meta.url), 'utf8')

describe('activatiepagina (spec 2026-09-16 par. 7, walkthrough 0.1 t/m 0.4)', () => {
  it('vraagt een wachtwoord en belooft de self-service-flow in drie stappen', () => {
    expect(page).toContain('Kies een wachtwoord')
    expect(page).toContain('Startdatum en deelnemers')
    expect(page).toContain('Uitnodigen')
    expect(page).toContain('Volgen en afronden')
  })

  it('bevat geen managed-copy of jargon meer', () => {
    for (const forbidden of ['respondentimport', 'campaign', 'surveylogica', 'Begeleide inrichting', 'managementduiding', 'ActivationJourneyPanel', 'juiste dashboard']) {
      expect(page).not.toContain(forbidden)
    }
    expect(panels).not.toContain('ActivationJourneyPanel')
  })

  it('geeft beide wachtwoordvelden dezelfde placeholder', () => {
    expect(page.match(/placeholder="Minimaal 8 tekens"/g)?.length).toBe(2)
    expect(page).not.toContain('placeholder="••••••••"')
  })

  it('laat de browser een nieuw wachtwoord voorstellen en bewaren', () => {
    expect(page.match(/autoComplete="new-password"/g)?.length).toBe(2)
  })

  it('belooft niet dat de eerste meting al is aangemaakt (klopt niet voor latere uitnodigingen)', () => {
    expect(page).not.toContain('al aangemaakt')
    expect(page).toContain('Je organisatie staat al klaar in Loep. Een meting loopt in drie stappen:')
    expect(page).toContain('In je overzicht zie je bij welke stap jouw meting nu staat.')
  })

  it('staat in het Loep-ontwerp', () => {
    expect(page).not.toContain('bg-blue-600')
    expect(page).not.toContain('text-blue-600')
    expect(page).toContain('#0D1B2A')
    expect(page).toContain('#E8A020')
  })

  it('houdt de token_hash-verificatie en de L5-opschoning van de URL', () => {
    expect(page).toContain('verifyOtp')
    expect(page).toContain("params.get('token_hash')")
    expect(page).toContain('window.history.replaceState')
    expect(page).toContain("router.replace('/login?error=invite')")
  })

  it('bevat geen em- of en-dashes, ook niet in commentaar', () => {
    expect(page).not.toMatch(/[—–]/)
  })
})
