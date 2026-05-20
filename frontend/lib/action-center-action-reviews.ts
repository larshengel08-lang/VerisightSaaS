export { resolveActionCenterActionReviewTransition } from './action-center-constitution'

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

function isValidCalendarDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day))

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

function isIsoTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const match =
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.\d{1,6})?(?<timezone>Z|(?<offsetSign>[+-])(?<offsetHour>\d{2}):(?<offsetMinute>\d{2}))$/.exec(
      normalized,
    )
  if (!match?.groups) {
    return false
  }

  const year = Number.parseInt(match.groups.year, 10)
  const month = Number.parseInt(match.groups.month, 10)
  const day = Number.parseInt(match.groups.day, 10)
  const hour = Number.parseInt(match.groups.hour, 10)
  const minute = Number.parseInt(match.groups.minute, 10)
  const second = Number.parseInt(match.groups.second, 10)

  if (!isValidCalendarDate(year, month, day)) {
    return false
  }

  if (hour > 23 || minute > 59 || second > 59) {
    return false
  }

  if (match.groups.timezone !== 'Z') {
    const offsetHour = Number.parseInt(match.groups.offsetHour ?? '', 10)
    const offsetMinute = Number.parseInt(match.groups.offsetMinute ?? '', 10)

    if (Number.isNaN(offsetHour) || Number.isNaN(offsetMinute) || offsetHour > 23 || offsetMinute > 59) {
      return false
    }
  }

  return true
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
