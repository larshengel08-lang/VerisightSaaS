import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

const login = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8')

describe('inlogpagina (spec 2026-09-16 par. 7, walkthrough 7.3)', () => {
  it('is licht: inloggen bij Loep met e-mail en wachtwoord, en de contactregel', () => {
    expect(login).toContain('Log in bij Loep')
    // Het contactadres komt uit de ene bron (lib/loep-contact), niet als losse kopie.
    expect(login).toContain('LOEP_CONTACT_EMAIL')
    expect(LOEP_CONTACT_EMAIL).toBe('hallo@getloep.nl')
    expect(login).toContain('Wachtwoord vergeten')
  })

  it('zegt niets over managers, versies of vrijgave', () => {
    expect(login).not.toContain('v2.0')
    expect(login).not.toContain('Vertrouwelijk platform')
    expect(login).not.toContain('managers')
    expect(login).not.toContain('vrijgegeven')
    expect(login).not.toContain('beheerders')
  })

  it('legt een verlopen of gebruikte activatielink uit in plaats van stil op /login te landen', () => {
    // complete-account stuurt bij een mislukte verifyOtp naar /login?error=invite;
    // de tekst en de detectie staan in lib/invite-link-notice (eigen unittest).
    expect(login).toContain('inviteLinkNoticeFromSearch(window.location.search)')
    // Na het lezen gaat de parameter uit de URL, zodat een refresh de melding niet opnieuw toont.
    expect(login).toContain("window.history.replaceState({}, '', window.location.pathname)")
  })

  it('laat de browser e-mail en wachtwoord invullen', () => {
    expect(login).toContain('autoComplete="email"')
    expect(login).toContain('autoComplete="current-password"')
  })

  it('staat in het Loep-ontwerp, niet in het oude blauw', () => {
    expect(login).not.toContain('bg-blue-600')
    expect(login).not.toContain('text-blue-600')
    expect(login).toContain('#0D1B2A')
  })

  it('bevat geen em- of en-dashes', () => {
    expect(login).not.toMatch(/[—–]/)
  })
})
