import { describe, expect, it } from 'vitest'
import {
  DECISION_LIMITS,
  decisionFromRow,
  decisionToRow,
  normalizeDecisionInput,
  validateDecisionInput,
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
