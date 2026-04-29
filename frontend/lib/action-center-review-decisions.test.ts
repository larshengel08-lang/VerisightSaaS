import { describe, expect, it } from 'vitest'
import {
  getActionCenterDecisionGuidance,
  getActionCenterDecisionProfile,
  isActionCenterDecisionCheckpointKey,
  normalizeActionCenterReviewDecision,
  validateActionCenterReviewDecisionWriteInput,
  shouldUseLegacyDecisionFallback,
  sortActionCenterReviewDecisions,
  type ActionCenterReviewDecision,
} from './action-center-review-decisions'

describe('action center review decisions', () => {
  it('normalizes only the canonical authored decision values', () => {
    expect(normalizeActionCenterReviewDecision('doorgaan')).toBe('doorgaan')
    expect(normalizeActionCenterReviewDecision(' bijstellen ')).toBe('bijstellen')
    expect(normalizeActionCenterReviewDecision('opschalen')).toBeNull()
    expect(normalizeActionCenterReviewDecision('')).toBeNull()
  })

  it('sorts authored review decisions by decisionRecordedAt descending before reviewCompletedAt', () => {
    const older: ActionCenterReviewDecision = {
      id: 'decision-1',
      route_source_type: 'campaign',
      route_source_id: 'campaign-1',
      checkpoint_id: 'checkpoint-1',
      decision: 'doorgaan',
      decision_reason: 'De eerste stap loopt nog.',
      next_check: 'Toets volgende week of de frictie daalt.',
      current_step: 'Plan een eerste teamgesprek.',
      next_step: 'Check of het teamgesprek plaatsvond.',
      expected_effect: 'Maak zichtbaar of de eerste stap tractie geeft.',
      observation_snapshot: 'Het patroon was bevestigd in meerdere exits.',
      decision_recorded_at: '2026-04-20T09:00:00.000Z',
      review_completed_at: '2026-04-20T08:30:00.000Z',
      created_by: null,
      updated_by: null,
      created_at: '2026-04-20T09:00:00.000Z',
      updated_at: '2026-04-20T09:00:00.000Z',
    }
    const newer: ActionCenterReviewDecision = {
      ...older,
      id: 'decision-2',
      decision: 'bijstellen',
      decision_reason: 'De eerste stap gaf nog geen stabiele verbetering.',
      decision_recorded_at: '2026-04-25T09:00:00.000Z',
      review_completed_at: '2026-04-25T08:30:00.000Z',
      created_at: '2026-04-25T09:00:00.000Z',
      updated_at: '2026-04-25T09:00:00.000Z',
    }

    expect(sortActionCenterReviewDecisions([older, newer]).map((entry) => entry.id)).toEqual([
      'decision-2',
      'decision-1',
    ])
  })

  it('disables legacy fallback as soon as one authored review decision exists', () => {
    expect(shouldUseLegacyDecisionFallback([])).toBe(true)
    expect(
      shouldUseLegacyDecisionFallback([
        {
          id: 'decision-1',
          route_source_type: 'campaign',
          route_source_id: 'campaign-1',
          checkpoint_id: 'checkpoint-1',
          decision: 'bijstellen',
          decision_reason: 'De eerste stap gaf nog geen stabiele verbetering.',
          next_check: 'Toets volgende week of de frictie daalt.',
          current_step: 'Plan een eerste teamgesprek.',
          next_step: 'Check of het teamgesprek plaatsvond.',
          expected_effect: 'Maak zichtbaar of de eerste stap tractie geeft.',
          observation_snapshot: 'Werkdruk bleef zichtbaar in hetzelfde team.',
          decision_recorded_at: '2026-04-25T09:00:00.000Z',
          review_completed_at: '2026-04-25T08:30:00.000Z',
          created_by: null,
          updated_by: null,
          created_at: '2026-04-25T09:00:00.000Z',
          updated_at: '2026-04-25T09:00:00.000Z',
        },
      ]),
    ).toBe(false)
  })

  it('allows authored review decisions only on supported review checkpoints', () => {
    expect(isActionCenterDecisionCheckpointKey('first_management_use')).toBe(true)
    expect(isActionCenterDecisionCheckpointKey('follow_up_review')).toBe(true)
    expect(isActionCenterDecisionCheckpointKey('launch_output')).toBe(false)
  })

  it('validates and normalizes authored review decision write input', () => {
    const parsed = validateActionCenterReviewDecisionWriteInput({
      route_source_type: 'campaign',
      route_source_id: 'campaign-1',
      checkpoint_id: 'checkpoint-1',
      decision: ' bijstellen ',
      decision_reason: ' De eerste stap gaf nog geen stabiele verbetering. ',
      next_check: ' Toets volgende week of de frictie daalt. ',
      current_step: ' Plan een eerste teamgesprek. ',
      next_step: ' Check of het teamgesprek plaatsvond. ',
      expected_effect: ' Maak zichtbaar of de eerste stap tractie geeft. ',
      observation_snapshot: ' Werkdruk bleef zichtbaar in hetzelfde team. ',
      decision_recorded_at: '2026-04-25T09:00:00.000Z',
      review_completed_at: '2026-04-25T08:30:00.000Z',
    })

    expect(parsed).toEqual({
      route_source_type: 'campaign',
      route_source_id: 'campaign-1',
      checkpoint_id: 'checkpoint-1',
      decision: 'bijstellen',
      decision_reason: 'De eerste stap gaf nog geen stabiele verbetering.',
      next_check: 'Toets volgende week of de frictie daalt.',
      current_step: 'Plan een eerste teamgesprek.',
      next_step: 'Check of het teamgesprek plaatsvond.',
      expected_effect: 'Maak zichtbaar of de eerste stap tractie geeft.',
      observation_snapshot: 'Werkdruk bleef zichtbaar in hetzelfde team.',
      decision_recorded_at: '2026-04-25T09:00:00.000Z',
      review_completed_at: '2026-04-25T08:30:00.000Z',
    })
  })

  it('rejects authored review decision input when required fields or decision values are invalid', () => {
    expect(() =>
      validateActionCenterReviewDecisionWriteInput({
        route_source_type: 'campaign',
        route_source_id: 'campaign-1',
        checkpoint_id: 'checkpoint-1',
        decision: 'opschalen',
        decision_reason: '',
        next_check: '',
        current_step: '',
        next_step: null,
        expected_effect: null,
        observation_snapshot: null,
        decision_recorded_at: 'not-a-date',
        review_completed_at: '',
      }),
    ).toThrowError('Ongeldige authored review decision input.')
  })

  it('requires a distinct next step and observation snapshot for bijstellen decisions', () => {
    expect(() =>
      validateActionCenterReviewDecisionWriteInput({
        route_source_type: 'campaign',
        route_source_id: 'campaign-1',
        checkpoint_id: 'checkpoint-1',
        decision: 'bijstellen',
        decision_reason: 'De eerste stap gaf nog geen stabiele verbetering.',
        next_check: 'Toets volgende week of de frictie daalt.',
        current_step: 'Plan een eerste teamgesprek.',
        next_step: 'Plan een eerste teamgesprek.',
        expected_effect: 'Maak zichtbaar of de eerste stap tractie geeft.',
        observation_snapshot: null,
        decision_recorded_at: '2026-04-25T09:00:00.000Z',
        review_completed_at: '2026-04-25T08:30:00.000Z',
      }),
    ).toThrowError('Ongeldige authored review decision input.')
  })

  it('rejects closing decisions that still carry open follow-up fields', () => {
    expect(() =>
      validateActionCenterReviewDecisionWriteInput({
        route_source_type: 'campaign',
        route_source_id: 'campaign-1',
        checkpoint_id: 'checkpoint-1',
        decision: 'afronden',
        decision_reason: 'Het effect is bevestigd.',
        next_check: 'Toets volgende maand of dit stabiel blijft.',
        current_step: 'Rond het traject af.',
        next_step: 'Plan een extra review.',
        expected_effect: 'Borging aantonen.',
        observation_snapshot: 'De verbetering hield drie weken stand.',
        decision_recorded_at: '2026-04-25T09:00:00.000Z',
        review_completed_at: '2026-04-25T08:30:00.000Z',
      }),
    ).toThrowError('Ongeldige authored review decision input.')
  })

  it('classifies open versus closing decisions into one shared profile', () => {
    expect(getActionCenterDecisionProfile('doorgaan')).toEqual({
      isClosing: false,
      requiresDistinctNextStep: false,
      requiresObservationSnapshot: false,
      hidesNextCheck: false,
      hidesNextStep: false,
    })

    expect(getActionCenterDecisionProfile('bijstellen')).toEqual({
      isClosing: false,
      requiresDistinctNextStep: true,
      requiresObservationSnapshot: true,
      hidesNextCheck: false,
      hidesNextStep: false,
    })

    expect(getActionCenterDecisionProfile('afronden')).toEqual({
      isClosing: true,
      requiresDistinctNextStep: false,
      requiresObservationSnapshot: false,
      hidesNextCheck: true,
      hidesNextStep: true,
    })
  })

  it('returns decision-specific guidance for the internal write surface', () => {
    expect(getActionCenterDecisionGuidance('bijstellen')).toContain('koerscorrectie')
    expect(getActionCenterDecisionGuidance('stoppen')).toContain('stopreden')
  })
})
