import type {
  ActionCenterReviewDecision,
  ActionCenterRouteSourceType,
  AuthoredActionCenterDecision,
} from './pilot-learning'

const AUTHORED_DECISION_VALUES = new Set<AuthoredActionCenterDecision>([
  'doorgaan',
  'bijstellen',
  'afronden',
  'stoppen',
])

export type {
  ActionCenterReviewDecision,
  ActionCenterRouteSourceType,
  AuthoredActionCenterDecision,
} from './pilot-learning'

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
