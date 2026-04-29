import { describe, expect, it } from 'vitest'
import { buildActionCenterReviewDecisionFormState, formatDateTimeLocalValue, toIsoDateTimeString } from './action-center-review-decision-editor-state'
import type { ActionCenterReviewDecision, PilotLearningCheckpoint, PilotLearningDossier } from './pilot-learning'

describe('action center review decision editor state', () => {
  it('prefills the form from an existing authored decision', () => {
    const dossier = {
      id: 'dossier-1',
      campaign_id: 'campaign-1',
      first_action_taken: 'Voer het eerste teamgesprek.',
      next_route: 'Plan een vervolggesprek met HR.',
      expected_first_value: 'Meer scherpte over het lokale vertrekpatroon.',
      management_action_outcome: 'bijstellen',
      updated_at: '2026-04-29T09:15:00.000Z',
    } as Partial<PilotLearningDossier> as PilotLearningDossier
    const checkpoint = {
      id: 'checkpoint-1',
      updated_at: '2026-04-28T15:00:00.000Z',
    } as Partial<PilotLearningCheckpoint> as PilotLearningCheckpoint
    const decision = {
      id: 'decision-1',
      route_source_type: 'campaign',
      route_source_id: 'campaign-1',
      checkpoint_id: 'checkpoint-1',
      decision: 'doorgaan',
      decision_reason: 'Het eerste gesprek gaf genoeg scherpte.',
      next_check: 'Toets over twee weken of het patroon stabiel blijft.',
      current_step: 'Voer het eerste teamgesprek.',
      next_step: 'Plan een vervolggesprek met HR.',
      expected_effect: 'Meer scherpte over het lokale vertrekpatroon.',
      observation_snapshot: 'Dezelfde frictie kwam in twee teams terug.',
      decision_recorded_at: '2026-04-29T10:15:00.000Z',
      review_completed_at: '2026-04-29T10:00:00.000Z',
    } as Partial<ActionCenterReviewDecision> as ActionCenterReviewDecision

    expect(buildActionCenterReviewDecisionFormState({ dossier, checkpoint, decision })).toEqual({
      id: 'decision-1',
      route_source_type: 'campaign',
      route_source_id: 'campaign-1',
      checkpoint_id: 'checkpoint-1',
      decision: 'doorgaan',
      decision_reason: 'Het eerste gesprek gaf genoeg scherpte.',
      next_check: 'Toets over twee weken of het patroon stabiel blijft.',
      current_step: 'Voer het eerste teamgesprek.',
      next_step: 'Plan een vervolggesprek met HR.',
      expected_effect: 'Meer scherpte over het lokale vertrekpatroon.',
      observation_snapshot: 'Dezelfde frictie kwam in twee teams terug.',
      decision_recorded_at_local: formatDateTimeLocalValue('2026-04-29T10:15:00.000Z'),
      review_completed_at_local: formatDateTimeLocalValue('2026-04-29T10:00:00.000Z'),
    })
  })

  it('falls back to dossier and checkpoint truth when no authored decision exists', () => {
    const dossier = {
      id: 'dossier-2',
      campaign_id: 'campaign-2',
      first_management_value: 'Welke teamfrictie vraagt nu als eerste eigenaarschap?',
      expected_first_value: 'Binnen twee weken moet het eerste gesprek zijn gevoerd.',
      first_action_taken: 'Leg de eerste managementreactie vast.',
      next_route: 'Hercheck het team na de correctie.',
      management_action_outcome: 'stoppen',
      updated_at: '2026-04-29T11:05:00.000Z',
    } as Partial<PilotLearningDossier> as PilotLearningDossier
    const checkpoint = {
      id: 'checkpoint-2',
      confirmed_lesson: 'Het eerste gesprek maakte het vertrekpatroon scherper.',
      updated_at: '2026-04-28T16:45:00.000Z',
    } as Partial<PilotLearningCheckpoint> as PilotLearningCheckpoint

    expect(buildActionCenterReviewDecisionFormState({ dossier, checkpoint, decision: null })).toEqual({
      id: null,
      route_source_type: 'campaign',
      route_source_id: 'campaign-2',
      checkpoint_id: 'checkpoint-2',
      decision: 'stoppen',
      decision_reason: 'Welke teamfrictie vraagt nu als eerste eigenaarschap?',
      next_check: 'Binnen twee weken moet het eerste gesprek zijn gevoerd.',
      current_step: 'Leg de eerste managementreactie vast.',
      next_step: 'Hercheck het team na de correctie.',
      expected_effect: 'Binnen twee weken moet het eerste gesprek zijn gevoerd.',
      observation_snapshot: 'Het eerste gesprek maakte het vertrekpatroon scherper.',
      decision_recorded_at_local: formatDateTimeLocalValue('2026-04-28T16:45:00.000Z'),
      review_completed_at_local: formatDateTimeLocalValue('2026-04-28T16:45:00.000Z'),
    })
  })

  it('formats and normalizes datetime-local values consistently', () => {
    expect(formatDateTimeLocalValue('2026-04-29T13:05:00.000Z')).toMatch(/^2026-04-29T\d{2}:05$/)
    expect(toIsoDateTimeString('2026-04-29T13:05')).toBeTruthy()
    expect(toIsoDateTimeString('')).toBeNull()
  })
})
