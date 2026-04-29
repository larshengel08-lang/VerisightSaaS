import type {
  ActionCenterDecision,
  ActionCenterDecisionRecord,
  ActionCenterReviewOutcome,
} from './action-center-route-contract'

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
