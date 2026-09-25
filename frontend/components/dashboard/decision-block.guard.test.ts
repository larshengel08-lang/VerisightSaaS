import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

// Alleen voor de gedragstest van feedbackHintFor: het blok zelf wordt niet
// gerenderd, maar de module importeert de router en de server action.
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))
vi.mock('@/app/(dashboard)/campaigns/[id]/decision-actions', () => ({ saveCampaignDecisionAction: vi.fn() }))

const { feedbackHintFor } = await import('./decision-block')

// Letterlijk BESLUIT_TERUGKOPPELING in backend/report_html.py.
const FEEDBACK = {
  retention:
    'Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
  exit: 'Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met de vertrekredenen doet. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
  onboarding: 'Je mensen vulden in; ze horen wat het MT ermee doet.',
} as const

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
    for (const hint of Object.values(FEEDBACK)) expect(source).toContain(hint)
    expect(source).not.toContain('Alleen als jullie er een kiezen.')
  })

  it('toont per scan de terugkoppelhint van die scan', () => {
    expect(feedbackHintFor('retention')).toBe(FEEDBACK.retention)
    expect(feedbackHintFor('exit')).toBe(FEEDBACK.exit)
    expect(feedbackHintFor('onboarding')).toBe(FEEDBACK.onboarding)
  })

  it('toont bij een onbekend of ontbrekend scantype geen hint, nooit die van een andere scan', () => {
    for (const scanType of ['pulse', 'team', 'leadership', 'culture_assessment', 'onbekend', 'constructor', '', null, undefined]) {
      expect(feedbackHintFor(scanType)).toBeNull()
    }
    expect(source).toContain('{feedbackHint ? <span className={hintClass}>{feedbackHint}</span> : null}')
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
