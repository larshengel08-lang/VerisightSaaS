import type {
  ActionCenterReviewDecision,
  ActionCenterRouteSourceType,
  AuthoredActionCenterDecision,
  LearningCheckpointKey,
} from './pilot-learning'

const AUTHORED_DECISION_VALUES = new Set<AuthoredActionCenterDecision>([
  'doorgaan',
  'bijstellen',
  'afronden',
  'stoppen',
])

const ACTION_CENTER_DECISION_CHECKPOINT_KEYS = new Set<LearningCheckpointKey>([
  'first_management_use',
  'follow_up_review',
])

export type {
  ActionCenterReviewDecision,
  ActionCenterRouteSourceType,
  AuthoredActionCenterDecision,
} from './pilot-learning'

export interface ActionCenterReviewDecisionWriteInput {
  route_source_type: ActionCenterRouteSourceType
  route_source_id: string
  checkpoint_id: string
  decision: AuthoredActionCenterDecision
  decision_reason: string
  next_check: string
  current_step: string
  next_step: string | null
  expected_effect: string | null
  observation_snapshot: string | null
  decision_recorded_at: string
  review_completed_at: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return Number.NEGATIVE_INFINITY

  const timestamp = new Date(normalized).getTime()
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

export function normalizeActionCenterReviewDecision(
  value: string | null | undefined,
): AuthoredActionCenterDecision | null {
  const normalized = normalizeText(value)
  if (!normalized) return null

  return AUTHORED_DECISION_VALUES.has(normalized as AuthoredActionCenterDecision)
    ? (normalized as AuthoredActionCenterDecision)
    : null
}

function isIsoTimestamp(value: string | null | undefined) {
  return parseTimestamp(value) !== Number.NEGATIVE_INFINITY
}

export function isActionCenterDecisionCheckpointKey(
  value: LearningCheckpointKey | string | null | undefined,
): value is 'first_management_use' | 'follow_up_review' {
  return ACTION_CENTER_DECISION_CHECKPOINT_KEYS.has(value as LearningCheckpointKey)
}

export function validateActionCenterReviewDecisionWriteInput(
  input: Partial<ActionCenterReviewDecisionWriteInput> | null | undefined,
): ActionCenterReviewDecisionWriteInput {
  const routeSourceType = input?.route_source_type
  const routeSourceId = normalizeText(input?.route_source_id)
  const checkpointId = normalizeText(input?.checkpoint_id)
  const decision = normalizeActionCenterReviewDecision(input?.decision)
  const decisionReason = normalizeText(input?.decision_reason)
  const nextCheck = normalizeText(input?.next_check)
  const currentStep = normalizeText(input?.current_step)
  const nextStep = normalizeText(input?.next_step)
  const expectedEffect = normalizeText(input?.expected_effect)
  const observationSnapshot = normalizeText(input?.observation_snapshot)
  const decisionRecordedAt = normalizeText(input?.decision_recorded_at)
  const reviewCompletedAt = normalizeText(input?.review_completed_at)

  if (
    routeSourceType !== 'campaign' ||
    !routeSourceId ||
    !checkpointId ||
    !decision ||
    !decisionReason ||
    !nextCheck ||
    !currentStep ||
    !decisionRecordedAt ||
    !reviewCompletedAt ||
    !isIsoTimestamp(decisionRecordedAt) ||
    !isIsoTimestamp(reviewCompletedAt)
  ) {
    throw new Error('Ongeldige authored review decision input.')
  }

  return {
    route_source_type: routeSourceType,
    route_source_id: routeSourceId,
    checkpoint_id: checkpointId,
    decision,
    decision_reason: decisionReason,
    next_check: nextCheck,
    current_step: currentStep,
    next_step: nextStep,
    expected_effect: expectedEffect,
    observation_snapshot: observationSnapshot,
    decision_recorded_at: decisionRecordedAt,
    review_completed_at: reviewCompletedAt,
  }
}

export function sortActionCenterReviewDecisions(decisions: ActionCenterReviewDecision[]) {
  return [...decisions].sort((left, right) => {
    const decisionRecordedDelta =
      parseTimestamp(right.decision_recorded_at) - parseTimestamp(left.decision_recorded_at)
    if (decisionRecordedDelta !== 0) {
      return decisionRecordedDelta
    }

    const reviewCompletedDelta =
      parseTimestamp(right.review_completed_at) - parseTimestamp(left.review_completed_at)
    if (reviewCompletedDelta !== 0) {
      return reviewCompletedDelta
    }

    const createdAtDelta = parseTimestamp(right.created_at) - parseTimestamp(left.created_at)
    if (createdAtDelta !== 0) {
      return createdAtDelta
    }

    return left.id.localeCompare(right.id)
  })
}

export function shouldUseLegacyDecisionFallback(decisions: ActionCenterReviewDecision[]) {
  return decisions.length === 0
}
