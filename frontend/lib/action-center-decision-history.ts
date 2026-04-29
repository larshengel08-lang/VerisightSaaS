import type {
  ActionCenterDecision,
  ActionCenterDecisionRecord,
  ActionCenterReviewOutcome,
} from './action-center-route-contract'
import type { ActionCenterReviewDecision } from './pilot-learning'
import { getActionCenterDecisionProfile } from './action-center-review-decisions'

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function coerceDecision(
  reviewOutcome: ActionCenterReviewOutcome | null | undefined,
  managementActionOutcome: string | null | undefined,
): ActionCenterDecision | null {
  if (
    reviewOutcome === 'doorgaan' ||
    reviewOutcome === 'bijstellen' ||
    reviewOutcome === 'afronden' ||
    reviewOutcome === 'stoppen'
  ) {
    return reviewOutcome
  }

  const fallback = normalizeText(managementActionOutcome)
  if (
    fallback === 'doorgaan' ||
    fallback === 'bijstellen' ||
    fallback === 'afronden' ||
    fallback === 'stoppen'
  ) {
    return fallback
  }

  return null
}

export function buildLegacyDecisionEntryId(args: {
  routeId: string
  reviewCompletedAt: string | null
  reviewOutcome: ActionCenterReviewOutcome | null | undefined
}) {
  return `legacy:${args.routeId}:${args.reviewCompletedAt ?? 'unknown-review'}:${args.reviewOutcome ?? 'geen-uitkomst'}`
}

export function compareDecisionHistoryEntries(left: ActionCenterDecisionRecord, right: ActionCenterDecisionRecord) {
  const leftPrimary = new Date(left.decisionRecordedAt).getTime()
  const rightPrimary = new Date(right.decisionRecordedAt).getTime()

  if (leftPrimary !== rightPrimary) {
    return rightPrimary - leftPrimary
  }

  const leftFallback = left.reviewCompletedAt ? new Date(left.reviewCompletedAt).getTime() : Number.NEGATIVE_INFINITY
  const rightFallback = right.reviewCompletedAt
    ? new Date(right.reviewCompletedAt).getTime()
    : Number.NEGATIVE_INFINITY

  if (leftFallback !== rightFallback) {
    return rightFallback - leftFallback
  }

  return left.decisionEntryId.localeCompare(right.decisionEntryId)
}

export function projectAuthoredDecisionRecord(record: ActionCenterReviewDecision): ActionCenterDecisionRecord {
  const profile = getActionCenterDecisionProfile(record.decision)
  return {
    decisionEntryId: record.id,
    sourceRouteId: record.route_source_id,
    decision: record.decision,
    decisionReason: normalizeText(record.decision_reason),
    nextCheck: profile.hidesNextCheck ? null : normalizeText(record.next_check),
    decisionRecordedAt: record.decision_recorded_at,
    reviewCompletedAt: record.review_completed_at,
    currentStepSnapshot: normalizeText(record.current_step),
    nextStepSnapshot: profile.hidesNextStep ? null : normalizeText(record.next_step),
    expectedEffectSnapshot: normalizeText(record.expected_effect),
    observationSnapshot: normalizeText(record.observation_snapshot),
  }
}

export function projectAuthoredDecisionHistory(args: {
  routeId: string
  reviewDecisions?: ActionCenterReviewDecision[] | null
}) {
  return (args.reviewDecisions ?? [])
    .filter((record) => record.route_source_id === args.routeId)
    .map(projectAuthoredDecisionRecord)
    .sort(compareDecisionHistoryEntries)
}

export function projectLegacyDecisionRecord(args: {
  sourceRouteId: string
  reviewOutcome: ActionCenterReviewOutcome | null | undefined
  reviewCompletedAt: string | null
  reviewReason: string | null | undefined
  reviewQuestion: string | null | undefined
  managementActionOutcome: string | null | undefined
  latestObservation: string | null | undefined
}): ActionCenterDecisionRecord | null {
  const decision = coerceDecision(args.reviewOutcome, args.managementActionOutcome)
  if (!decision) return null

  const reviewCompletedAt = normalizeText(args.reviewCompletedAt)
  if (!reviewCompletedAt) return null

  return {
    decisionEntryId: buildLegacyDecisionEntryId({
      routeId: args.sourceRouteId,
      reviewCompletedAt: args.reviewCompletedAt,
      reviewOutcome: args.reviewOutcome,
    }),
    sourceRouteId: args.sourceRouteId,
    decision,
    decisionReason: normalizeText(args.reviewReason) ?? normalizeText(args.latestObservation),
    nextCheck: normalizeText(args.reviewQuestion),
    decisionRecordedAt: reviewCompletedAt,
    reviewCompletedAt: args.reviewCompletedAt,
  }
}
