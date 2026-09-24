import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./decision-block.tsx', import.meta.url), 'utf8')

describe('blok "Besluit vastleggen" (plan 3b, spec 2026-09-16 par. 7)', () => {
  it('heeft dezelfde velden als de besluitpagina in het rapport', () => {
    for (const label of [
      'Datum van het gesprek',
      'Startpunt',
      'Wat precies',
      'Eigenaar',
      'Datum vervolgmoment',
      'Tweede punt',
      'Terugkoppeling aan medewerkers',
      'Waaraan zien we bij het startpunt dat het werkt',
    ]) {
      expect(source).toContain(label)
    }
  })

  it('volgt de besluitpagina: parkeerregel bij het tweede punt en wat je terugkoppelt', () => {
    expect(source).toContain(
      'Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het oppakt. Anders parkeren jullie dit punt: de eigenaar van het startpunt zet het op de agenda van het vervolgmoment.',
    )
    expect(source).toContain(
      'Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
    )
    expect(source).not.toContain('Alleen als jullie er een kiezen.')
    expect(source).not.toContain('Je mensen vulden in; ze horen wat het MT ermee doet.')
  })

  it('schrijft alleen via de server action en toont fout en succes zichtbaar', () => {
    expect(source).toContain('saveCampaignDecisionAction')
    expect(source).toContain('role="alert"')
    expect(source).toContain('role="status"')
    expect(source).toContain('router.refresh()')
    expect(source).not.toContain('supabase')
  })

  it('meldt geen succes voordat de action ok teruggeeft', () => {
    const okBranch = source.slice(source.indexOf('if (!result.ok)'))
    expect(okBranch.indexOf('setError(')).toBeLessThan(okBranch.indexOf('setNotice('))
  })

  it('meelezers krijgen geen formulier en geen knop', () => {
    const readOnly = source.slice(source.indexOf('function ReadOnlyDecision'), source.indexOf('export function DecisionBlock'))
    expect(readOnly).not.toContain('<input')
    expect(readOnly).not.toContain('<textarea')
    expect(readOnly).not.toContain('<button')
    expect(source).toContain('Er is nog geen besluit vastgelegd.')
  })

  it('zegt een laadfout hardop in plaats van een leeg formulier te tonen', () => {
    expect(source).toContain('loadError')
    expect(source).toContain('Loep kan het besluit nu niet laden')
  })

  it('veronderstelt geen begeleider en gebruikt geen streepjes', () => {
    expect(source).not.toMatch(/bespreking met Loep|begeleide|tijdens de bespreking/)
    expect(source).not.toMatch(/[—–]/)
  })
})
