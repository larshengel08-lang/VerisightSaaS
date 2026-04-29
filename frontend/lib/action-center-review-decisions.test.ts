import { describe, expect, it } from 'vitest'
import {
  normalizeActionCenterReviewDecision,
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
})
