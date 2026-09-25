import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Juridische ronde 24-9 (docs/superpowers/specs/2026-09-24-juridische-ronde.md):
// de voorwaarden, privacyverklaring en verwerkersovereenkomst beschrijven de dienst
// zoals hij is. Geen bespreking door Loep (besluit A), geen e-mailadressen van
// respondenten in de standaardwerkwijze, en Loep Start valt binnen de dekking.
const lees = (pad: string) => readFileSync(join(__dirname, '..', pad), 'utf8')
const paginas = {
  voorwaarden: lees('app/voorwaarden/page.tsx'),
  privacy: lees('app/privacy/page.tsx'),
  dpa: lees('app/dpa/page.tsx'),
}

describe('juridische pagina’s volgen de dienst zoals hij is', () => {
  it.each(Object.entries(paginas))('%s belooft geen begeleiding of persoonlijke toelichting', (_naam, bron) => {
    expect(bron).not.toMatch(/begeleid/i)
    expect(bron).not.toMatch(/persoonlijke toelichting/i)
    expect(bron).not.toMatch(/combinatie daarvan/i)
  })

  it.each(Object.entries(paginas))('%s noemt Loep Start', (_naam, bron) => {
    expect(bron).toContain('Loep Start')
  })

  it('privacy en dpa beschrijven geen e-mailadres van respondenten als standaard', () => {
    expect(paginas.privacy).not.toMatch(/e-mailadres voor uitnodiging/i)
    expect(paginas.dpa).not.toMatch(/e-mailadres voor uitnodiging/i)
    expect(paginas.privacy).toMatch(/geen namen of e-mailadressen van respondenten/)
  })

  it('de voorwaarden sluiten een bespreking door Loep uit, tenzij schriftelijk afgesproken', () => {
    expect(paginas.voorwaarden).toMatch(/bespreking of presentatie van de\s+uitkomsten door Loep maakt geen deel uit van de dienst/)
  })

  it('privacy en dpa noemen dezelfde bewaartermijn van twee jaar na het sluiten van de meting', () => {
    expect(paginas.privacy).toMatch(/uiterlijk twee jaar na het\s+sluiten van de meting/)
    expect(paginas.dpa).toMatch(/uiterlijk twee jaar na het sluiten van de meting/)
  })

  it('privacy sectie 5 belooft een bewaartermijn voor contactformulier en kennismaking (A4.3)', () => {
    expect(paginas.privacy).toMatch(
      /Wat je via het contactformulier of in een kennismaking met Loep deelt, bewaart Loep tot uiterlijk twee jaar\s+na het laatste contact\. Volgt er een overeenkomst, dan gelden de termijnen hierboven\./
    )
  })

  it('privacy sectie 2 heeft een categorie voor contactpersonen (A4.3)', () => {
    expect(paginas.privacy).toMatch(
      /Contactpersonen:<\/strong> naam, zakelijk e-mailadres, organisatie en wat je in je bericht schrijft\./
    )
  })

  it('dpa sectie 9 noemt back-ups van de hostingpartij (A4.4)', () => {
    expect(paginas.dpa).toMatch(
      /Verwijderde gegevens kunnen nog korte tijd voorkomen in back-ups van de hostingpartij\. Die back-ups worden\s+volgens hun vaste termijn automatisch overschreven\. Verwerker zet daaruit geen gegevens terug, behalve om\s+een storing te herstellen\./
    )
  })

  it.each(Object.entries(paginas))('%s heeft geen em- of en-dash', (_naam, bron) => {
    expect(bron).not.toMatch(/[–—]/)
  })
})
