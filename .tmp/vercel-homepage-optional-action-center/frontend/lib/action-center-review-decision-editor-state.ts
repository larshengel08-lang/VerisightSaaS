import {
  normalizeActionCenterReviewDecision,
  type ActionCenterReviewDecisionWriteInput,
} from './action-center-review-decisions'
import type {
  ActionCenterReviewDecision,
  AuthoredActionCenterDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from './pilot-learning'

export interface ActionCenterReviewDecisionFormState {
  id: string | null
  route_source_type: ActionCenterReviewDecisionWriteInput['route_source_type']
  route_source_id: string | null
  checkpoint_id: string
  decision: AuthoredActionCenterDecision
  decision_reason: string
  next_check: string
  current_step: string
  next_step: string
  expected_effect: string
  observation_snapshot: string
  decision_recorded_at_local: string
  review_completed_at_local: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed
}

function pickFirst(values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = normalizeText(value)
    if (normalized.length > 0) {
      return normalized
    }
  }

  return ''
}

function toDate(value: string | null | undefined) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateTimeLocalValue(value: string | null | undefined) {
  const parsed = toDate(value)
  if (!parsed) return ''

  const year = parsed.getFullYear()
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsed.getDate()}`.padStart(2, '0')
  const hours = `${parsed.getHours()}`.padStart(2, '0')
  const minutes = `${parsed.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function toIsoDateTimeString(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = trimmed.length === 16 ? `${trimmed}:00` : trimmed
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

export function buildActionCenterReviewDecisionFormState(args: {
  dossier: PilotLearningDossier
  checkpoint: PilotLearningCheckpoint
  decision: ActionCenterReviewDecision | null
}) {
  const { dossier, checkpoint, decision } = args
  const fallbackTimestamp = checkpoint.updated_at ?? dossier.updated_at ?? new Date().toISOString()
  const fallbackDecision =
    normalizeActionCenterReviewDecision(dossier.management_action_outcome) ?? ('bijstellen' satisfies AuthoredActionCenterDecision)

  return {
    id: decision?.id ?? null,
    route_source_type: 'campaign',
    route_source_id: dossier.campaign_id ?? null,
    checkpoint_id: checkpoint.id,
    decision: decision?.decision ?? fallbackDecision,
    decision_reason: pickFirst([
      decision?.decision_reason,
      dossier.first_management_value,
      dossier.buyer_question,
      dossier.buying_reason,
      checkpoint.confirmed_lesson,
      checkpoint.interpreted_observation,
    ]),
    next_check: pickFirst([
      decision?.next_check,
      dossier.expected_first_value,
      dossier.review_moment,
      checkpoint.qualitative_notes,
      checkpoint.objective_signal_notes,
    ]),
    current_step: pickFirst([
      decision?.current_step,
      dossier.first_action_taken,
      dossier.next_route,
    ]),
    next_step: pickFirst([
      decision?.next_step,
      dossier.next_route,
      dossier.stop_reason,
    ]),
    expected_effect: pickFirst([
      decision?.expected_effect,
      dossier.expected_first_value,
      dossier.adoption_outcome,
    ]),
    observation_snapshot: pickFirst([
      decision?.observation_snapshot,
      checkpoint.confirmed_lesson,
      checkpoint.interpreted_observation,
      checkpoint.qualitative_notes,
      dossier.management_action_outcome,
      dossier.case_public_summary,
    ]),
    decision_recorded_at_local: formatDateTimeLocalValue(decision?.decision_recorded_at ?? fallbackTimestamp),
    review_completed_at_local: formatDateTimeLocalValue(decision?.review_completed_at ?? fallbackTimestamp),
  } satisfies ActionCenterReviewDecisionFormState
}
