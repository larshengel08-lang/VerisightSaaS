export type ActionCenterActionOutcome =
  | 'effect-zichtbaar'
  | 'bijsturen-nodig'
  | 'nog-te-vroeg'
  | 'stoppen'

export interface ActionCenterActionReviewWriteInput {
  action_review_id: string
  action_id: string
  reviewed_at: string
  observation: string
  action_outcome: ActionCenterActionOutcome
  follow_up_note: string | null
}

export interface ActionCenterActionReviewRecord {
  actionReviewId: string
  actionId: string
  reviewedAt: string
  observation: string
  actionOutcome: ActionCenterActionOutcome
  followUpNote: string | null
}

const ACTION_OUTCOMES = new Set<ActionCenterActionOutcome>([
  'effect-zichtbaar',
  'bijsturen-nodig',
  'nog-te-vroeg',
  'stoppen',
])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(normalized)) {
    return false
  }

  return !Number.isNaN(new Date(normalized).getTime())
}

function getActionOutcomeLabel(outcome: ActionCenterActionOutcome) {
  switch (outcome) {
    case 'effect-zichtbaar':
      return 'Effect zichtbaar'
    case 'bijsturen-nodig':
      return 'Bijsturen nodig'
    case 'nog-te-vroeg':
      return 'Nog te vroeg'
    case 'stoppen':
    default:
      return 'Stoppen'
  }
}

export function validateActionCenterActionReviewInput(
  input: Partial<ActionCenterActionReviewWriteInput> | null | undefined,
): ActionCenterActionReviewWriteInput {
  const actionReviewId = normalizeText(input?.action_review_id)
  const actionId = normalizeText(input?.action_id)
  const reviewedAt = normalizeText(input?.reviewed_at)
  const observation = normalizeText(input?.observation)
  const actionOutcome = normalizeText(input?.action_outcome) as ActionCenterActionOutcome | null
  const followUpNote = normalizeText(input?.follow_up_note)

  if (
    !actionReviewId ||
    !actionId ||
    !reviewedAt ||
    !observation ||
    !actionOutcome ||
    !ACTION_OUTCOMES.has(actionOutcome) ||
    !isIsoTimestamp(reviewedAt)
  ) {
    throw new Error('Ongeldige route action review input.')
  }

  return {
    action_review_id: actionReviewId,
    action_id: actionId,
    reviewed_at: reviewedAt,
    observation,
    action_outcome: actionOutcome,
    follow_up_note: followUpNote,
  }
}

export function projectActionCenterActionReview(
  input: Partial<ActionCenterActionReviewWriteInput> | null | undefined,
): ActionCenterActionReviewRecord {
  const validated = validateActionCenterActionReviewInput(input)

  return {
    actionReviewId: validated.action_review_id,
    actionId: validated.action_id,
    reviewedAt: validated.reviewed_at,
    observation: validated.observation,
    actionOutcome: validated.action_outcome,
    followUpNote: validated.follow_up_note,
  }
}

export function buildCompactActionOutcome(
  input: Partial<ActionCenterActionReviewWriteInput> | null | undefined,
) {
  const review = projectActionCenterActionReview(input)
  const label = getActionOutcomeLabel(review.actionOutcome)

  return review.followUpNote ? `${label}: ${review.followUpNote}` : label
}
