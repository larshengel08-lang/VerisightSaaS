import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// De teksten zelf staan in lib/dashboard/campaign-decision.ts en worden daar
// getest (en door tests/test_report_leesronde_fixes.py gelijk gehouden met de
// besluitpagina). Hier: dat het blok ze gebruikt, en goed koppelt.
const source = readFileSync(new URL('./decision-block.tsx', import.meta.url), 'utf8')

const HINT_IDS = [
  'decision-hint-primary-action',
  'decision-hint-owner',
  'decision-hint-follow-up',
  'decision-hint-second-point',
  'decision-hint-feedback',
]

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
    ]) {
      expect(source).toContain(label)
    }
    expect(source).toContain('{DECISION_SUCCESS_LABEL}')
    expect(source).toContain('label={DECISION_SUCCESS_LABEL}')
  })

  it('volgt de besluitpagina: parkeerregel, richtlijn en terugkoppeling per scan', () => {
    expect(source).toContain('{DECISION_SECOND_POINT_HINT}')
    expect(source).toContain('decisionFeedbackHintFor(scanType)')
    expect(source).toContain('decisionFollowUpHintFor(scanType)')
    expect(source).not.toContain('Alleen als jullie er een kiezen.')
    expect(source).not.toContain('45 tot 90 dagen')
    expect(source).not.toContain('Je mensen vulden in')
  })

  it('toont de terugkoppelhint alleen als de scan er een heeft, de teller altijd', () => {
    // Taak 10: de teller (decision-count-feedbackPlan) is nu altijd gekoppeld,
    // de terugkoppelhint alleen als de scan er een heeft.
    expect(source).toContain(
      "aria-describedby={feedbackHint ? 'decision-hint-feedback decision-count-feedbackPlan' : 'decision-count-feedbackPlan'}",
    )
    expect(source).toMatch(/\{feedbackHint \? \(\s*<span id="decision-hint-feedback"/)
  })

  it('koppelt elke hint via aria-describedby en zet hem buiten het label', () => {
    // Taak 10: sommige velden koppelen nu twee ids (hint + teller), dus het
    // id staat niet altijd meer direct tussen aanhalingstekens; wel als los
    // woord binnen de aria-describedby-waarde.
    for (const id of HINT_IDS) {
      expect(source).toContain(`id="${id}"`)
      expect(source).toMatch(new RegExp(`aria-describedby=[^\\n]*\\b${id}\\b`))
    }
    // Geen hint meer binnen een <label>: de toegankelijke naam is alleen het label.
    for (const label of source.split('<label').slice(1)) {
      expect(label.slice(0, label.indexOf('</label>'))).not.toContain('hintClass')
    }
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

  // Taak 10: de besluitvelden kregen dezelfde grens als de PDF (240 i.p.v.
  // 600). Een teller per lang veld voorkomt dat iemand pas bij opslaan merkt
  // dat zijn tekst niet past; geen stille afkap (Fail Loud).
  const LONG_FIELDS = ['primaryAction', 'secondaryAction', 'feedbackPlan', 'successCriterion']

  it('toont bij elk lang veld een teller met een eigen id', () => {
    // CharCount gebruikt elk lang veld via een eigen id
    // (`<CharCount id="decision-count-<veld>" .../>`).
    for (const field of LONG_FIELDS) {
      expect(source).toContain(`<CharCount id="decision-count-${field}"`)
    }
  })

  it('kondigt alleen de waarschuwing aan, niet elke toetsaanslag', () => {
    // Controller-amendement op taak 10: de telling zelf is geen live region
    // (dat zou bij elke toetsaanslag onderbreken); alleen de waarschuwing bij
    // overschrijding is aria-live="polite", en staat er pas zodra hij nodig is.
    const start = source.indexOf('function CharCount')
    expect(start).toBeGreaterThan(-1)
    const end = source.indexOf('\n}', start)
    const body = source.slice(start, end)
    expect(body).toMatch(/<span id=\{id\}[^>]*>/)
    expect(body).not.toMatch(/<span id=\{id\}[^>]*aria-live/)
    expect(body).toMatch(/aria-live="polite"/)
    // De waarschuwing staat alleen gerenderd als `over` waar is.
    expect(body).toMatch(/over \? <span aria-live="polite">/)
  })

  it('koppelt elk lang veld aan zijn teller via aria-describedby', () => {
    for (const field of LONG_FIELDS) {
      expect(source).toMatch(new RegExp(`name="${field}"[\\s\\S]{0,400}?aria-describedby=[^>]*decision-count-${field}`))
    }
  })

  it('kapt geen besluitveld stil af: geen .slice(0, of .substring(0, op een veldwaarde', () => {
    expect(source).not.toMatch(/\.slice\(0,/)
    expect(source).not.toMatch(/\.substring\(0,/)
  })
})
