import { describe, expect, it } from 'vitest'
import {
  DECISION_LIMITS,
  decisionFromRow,
  decisionToRow,
  normalizeDecisionInput,
  validateDecisionInput,
  type CampaignDecisionInput,
} from './campaign-decision'

const geldig = {
  decidedAt: '2026-04-02',
  primaryTopic: 'Groeiperspectief',
  primaryAction: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
  owner: 'Sanne de Vries',
  followUpDate: '2026-06-15',
  secondaryTopic: '',
  secondaryAction: '',
  feedbackPlan: '',
  successCriterion: '',
}

describe('besluit van het MT (plan 3b, spec 2026-09-16 par. 7)', () => {
  it('normaliseert: trimt tekst en maakt van een lege datum null', () => {
    const n = normalizeDecisionInput({ ...geldig, owner: '  Sanne de Vries ', followUpDate: '', decidedAt: undefined })
    expect(n.owner).toBe('Sanne de Vries')
    expect(n.followUpDate).toBeNull()
    expect(n.decidedAt).toBeNull()
  })

  it('negeert velden die er niet horen en waarden die geen tekst zijn', () => {
    const n = normalizeDecisionInput({ ...geldig, owner: 42, recordedBy: 'iemand', campaignId: 'x' })
    expect(n.owner).toBe('')
    expect(Object.keys(n).sort()).toEqual(Object.keys(geldig).sort())
  })

  it('keurt een volledig besluit goed', () => {
    expect(validateDecisionInput(normalizeDecisionInput(geldig))).toBeNull()
  })

  it.each([
    ['primaryTopic', 'Vul in over welk onderwerp het besluit gaat.'],
    ['primaryAction', 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'],
    ['owner', 'Vul in wie eigenaar is van dit besluit.'],
  ])('weigert een leeg verplicht veld: %s', (veld, melding) => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, [veld]: '  ' }))).toBe(melding)
  })

  it('weigert een datum die geen datum is, en accepteert een lege', () => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '15-06-2026' }))).toBe(
      'De datum van het vervolgmoment is geen geldige datum.',
    )
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '2026-02-31' }))).toBe(
      'De datum van het vervolgmoment is geen geldige datum.',
    )
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, followUpDate: '' }))).toBeNull()
  })

  it('weigert een gespreksdatum die geen datum is', () => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, decidedAt: '2026-02-31' }))).toBe(
      'De datum van het gesprek is geen geldige datum.',
    )
  })

  it('weigert een vervolgmoment voor de datum van het gesprek', () => {
    expect(
      validateDecisionInput(normalizeDecisionInput({ ...geldig, decidedAt: '2026-04-02', followUpDate: '2026-04-01' })),
    ).toBe('Het vervolgmoment ligt voor de datum van het gesprek.')
  })

  it('weigert een tweede actie zonder tweede onderwerp', () => {
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, secondaryAction: 'Piekrooster herzien.' }))).toBe(
      'Vul bij het tweede punt ook het onderwerp in.',
    )
  })

  it('weigert een veld dat te lang is, met de grens in de melding', () => {
    const lang = 'x'.repeat(DECISION_LIMITS.action + 1)
    expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryAction: lang }))).toBe(
      `Wat precies is te lang (maximaal ${DECISION_LIMITS.action} tekens).`,
    )
  })

  describe('grenswaarden van DECISION_LIMITS: exact op de grens geldig, één teken erover geweigerd', () => {
    it('primaryAction (DECISION_LIMITS.action)', () => {
      const opDeGrens = 'x'.repeat(DECISION_LIMITS.action)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryAction: opDeGrens }))).toBeNull()
      const eroverheen = 'x'.repeat(DECISION_LIMITS.action + 1)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryAction: eroverheen }))).toBe(
        `Wat precies is te lang (maximaal ${DECISION_LIMITS.action} tekens).`,
      )
    })

    it('primaryTopic (DECISION_LIMITS.topic)', () => {
      const opDeGrens = 'x'.repeat(DECISION_LIMITS.topic)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryTopic: opDeGrens }))).toBeNull()
      const eroverheen = 'x'.repeat(DECISION_LIMITS.topic + 1)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, primaryTopic: eroverheen }))).toBe(
        `Het onderwerp is te lang (maximaal ${DECISION_LIMITS.topic} tekens).`,
      )
    })

    it('owner (DECISION_LIMITS.owner)', () => {
      const opDeGrens = 'x'.repeat(DECISION_LIMITS.owner)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, owner: opDeGrens }))).toBeNull()
      const eroverheen = 'x'.repeat(DECISION_LIMITS.owner + 1)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, owner: eroverheen }))).toBe(
        `De eigenaar is te lang (maximaal ${DECISION_LIMITS.owner} tekens).`,
      )
    })

    it('feedbackPlan (DECISION_LIMITS.text)', () => {
      const opDeGrens = 'x'.repeat(DECISION_LIMITS.text)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, feedbackPlan: opDeGrens }))).toBeNull()
      const eroverheen = 'x'.repeat(DECISION_LIMITS.text + 1)
      expect(validateDecisionInput(normalizeDecisionInput({ ...geldig, feedbackPlan: eroverheen }))).toBe(
        `De terugkoppeling is te lang (maximaal ${DECISION_LIMITS.text} tekens).`,
      )
    })
  })

  it('vertaalt naar een databaserij zonder updated_at (de trigger zet die)', () => {
    const rij = decisionToRow(normalizeDecisionInput(geldig), {
      campaignId: 'c-1',
      organizationId: 'o-1',
      userId: 'u-1',
    })
    expect(rij).toEqual({
      campaign_id: 'c-1',
      organization_id: 'o-1',
      recorded_by: 'u-1',
      decided_at: '2026-04-02',
      primary_topic: 'Groeiperspectief',
      primary_action: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
      owner: 'Sanne de Vries',
      follow_up_date: '2026-06-15',
      secondary_topic: '',
      secondary_action: '',
      feedback_plan: '',
      success_criterion: '',
    })
  })

  it('leest een databaserij terug, en geeft null bij geen rij', () => {
    expect(decisionFromRow(null)).toBeNull()
    const d = decisionFromRow({
      decided_at: '2026-04-02',
      primary_topic: 'Groeiperspectief',
      primary_action: 'Actie',
      owner: 'Sanne',
      follow_up_date: null,
      secondary_topic: null,
      secondary_action: '',
      feedback_plan: '',
      success_criterion: '',
      updated_at: '2026-04-03T09:30:00Z',
    })
    expect(d?.primaryTopic).toBe('Groeiperspectief')
    expect(d?.followUpDate).toBeNull()
    expect(d?.secondaryTopic).toBe('')
    expect(d?.updatedAt).toBe('2026-04-03T09:30:00Z')
  })
})

/**
 * Codekwaliteitsreview taak 10, punt 3(b): `no-dashes.guard.test.ts` scant
 * lib/dashboard niet (toevoegen aan ROOTS faalt op een bestaand bestand,
 * dashboard-state-resolver.ts, dat buiten deze taak valt). In plaats daarvan
 * bewaakt deze test hier elke melding die validateDecisionInput kan
 * opleveren op het em-streepje (U+2014) en het en-streepje (U+2013).
 */
describe('geen streepjes in de meldingen van validateDecisionInput (spec 2026-09-16 par. 7)', () => {
  const streepje = /[—–]/

  const scenarios: Array<[string, Record<string, unknown>]> = [
    ['leeg onderwerp', { ...geldig, primaryTopic: '' }],
    ['lege actie', { ...geldig, primaryAction: '' }],
    ['lege eigenaar', { ...geldig, owner: '' }],
    ['tweede actie zonder tweede onderwerp', { ...geldig, secondaryAction: 'Piekrooster herzien.' }],
    ['te lang onderwerp', { ...geldig, primaryTopic: 'x'.repeat(DECISION_LIMITS.topic + 1) }],
    ['te lange actie', { ...geldig, primaryAction: 'x'.repeat(DECISION_LIMITS.action + 1) }],
    ['te lange eigenaar', { ...geldig, owner: 'x'.repeat(DECISION_LIMITS.owner + 1) }],
    [
      'te lang tweede onderwerp',
      { ...geldig, secondaryTopic: 'x'.repeat(DECISION_LIMITS.topic + 1), secondaryAction: 'iets' },
    ],
    [
      'te lange actie bij tweede punt',
      { ...geldig, secondaryTopic: 'iets', secondaryAction: 'x'.repeat(DECISION_LIMITS.action + 1) },
    ],
    ['te lange terugkoppeling', { ...geldig, feedbackPlan: 'x'.repeat(DECISION_LIMITS.text + 1) }],
    ['te lang succescriterium', { ...geldig, successCriterion: 'x'.repeat(DECISION_LIMITS.text + 1) }],
    ['ongeldige gespreksdatum', { ...geldig, decidedAt: '2026-02-31' }],
    ['ongeldig vervolgmoment', { ...geldig, followUpDate: '2026-02-31' }],
    ['vervolgmoment voor het gesprek', { ...geldig, decidedAt: '2026-04-02', followUpDate: '2026-04-01' }],
  ]

  it.each(scenarios)('%s: geen U+2014 of U+2013 in de melding', (_naam, invoer) => {
    const melding = validateDecisionInput(normalizeDecisionInput(invoer))
    expect(melding).not.toBeNull()
    expect(melding as string).not.toMatch(streepje)
  })
})

/**
 * Codekwaliteitsreview taak 10, punt 1, 2 en 6: robuustheid tegen
 * onbetrouwbare invoer. `normalizeDecisionInput` mag nooit crashen op
 * `null`/`undefined`/een array/een primitieve waarde, en `validateDecisionInput`
 * mag nooit crashen als een optioneel veld ontbreekt.
 */
describe('robuustheid tegen onbetrouwbare invoer (codekwaliteitsreview taak 10)', () => {
  const leeg = normalizeDecisionInput({})

  it('normalizeDecisionInput(null) crasht niet en levert een leeg besluit op', () => {
    expect(() => normalizeDecisionInput(null)).not.toThrow()
    expect(normalizeDecisionInput(null)).toEqual(leeg)
  })

  it('normalizeDecisionInput(undefined) crasht niet en levert een leeg besluit op', () => {
    expect(() => normalizeDecisionInput(undefined)).not.toThrow()
    expect(normalizeDecisionInput(undefined)).toEqual(leeg)
  })

  it('normalizeDecisionInput([]) crasht niet en levert een leeg besluit op', () => {
    expect(() => normalizeDecisionInput([])).not.toThrow()
    expect(normalizeDecisionInput([])).toEqual(leeg)
  })

  it('normalizeDecisionInput op een primitieve waarde crasht niet en levert een leeg besluit op', () => {
    expect(() => normalizeDecisionInput('geen object')).not.toThrow()
    expect(normalizeDecisionInput('geen object')).toEqual(leeg)
  })

  it('validateDecisionInput crasht niet als optionele velden ontbreken', () => {
    const onvolledig = {
      decidedAt: null,
      primaryTopic: 'Groeiperspectief',
      primaryAction: 'Elke leidinggevende voert voor 1 juni een ontwikkelgesprek.',
      owner: 'Sanne de Vries',
      followUpDate: null,
      // secondaryTopic, secondaryAction, feedbackPlan, successCriterion ontbreken bewust
    } as unknown as CampaignDecisionInput
    expect(() => validateDecisionInput(onvolledig)).not.toThrow()
    expect(validateDecisionInput(onvolledig)).toBeNull()
  })
})
