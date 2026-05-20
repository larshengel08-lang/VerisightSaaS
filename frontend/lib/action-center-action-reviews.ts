export { resolveActionCenterActionReviewTransition } from './action-center-constitution'

export type ActionCenterActionOutcome =
  | 'effect-zichtbaar'
  | 'bijsturen-nodig'
  | 'nog-te-vroeg'
  | 'stoppen'

export type ActionCenterActionEvidenceSource =
  | 'manager-observation'
  | 'team-conversation'
  | 'other-bounded-source'

export type ActionCenterActionConfidenceLevel = 'low' | 'medium' | 'high'

export interface ActionCenterActionReviewWriteInput {
  action_review_id: string
  action_id: string
  reviewed_at: string
  observation: string
  action_outcome: ActionCenterActionOutcome
  evidence_source: ActionCenterActionEvidenceSource | null
  confidence_level: ActionCenterActionConfidenceLevel | null
  follow_up_note: string | null
}

export interface ActionCenterActionReviewRecord {
  actionReviewId: string
  actionId: string
  reviewedAt: string
  observation: string
  actionOutcome: ActionCenterActionOutcome
  evidenceSource: ActionCenterActionEvidenceSource | null
  confidenceLevel: ActionCenterActionConfidenceLevel | null
  followUpNote: string | null
}

const ACTION_OUTCOMES = new Set<ActionCenterActionOutcome>([
  'effect-zichtbaar',
  'bijsturen-nodig',
  'nog-te-vroeg',
  'stoppen',
])

const EVIDENCE_SOURCES = new Set<ActionCenterActionEvidenceSource>([
  'manager-observation',
  'team-conversation',
  'other-bounded-source',
])

const CONFIDENCE_LEVELS = new Set<ActionCenterActionConfidenceLevel>(['low', 'medium', 'high'])

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
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      normalized,
    )
  if (!match) {
    return false
  }

  const year = Number.parseInt(match[1] ?? '', 10)
  const month = Number.parseInt(match[2] ?? '', 10)
  const day = Number.parseInt(match[3] ?? '', 10)
  const hour = Number.parseInt(match[4] ?? '', 10)
  const minute = Number.parseInt(match[5] ?? '', 10)
  const second = Number.parseInt(match[6] ?? '', 10)

  if (!isValidCalendarDate(year, month, day)) {
    return false
  }

  if (hour > 23 || minute > 59 || second > 59) {
    return false
  }

  if (match[7] !== 'Z') {
    const offsetHour = Number.parseInt(match[9] ?? '', 10)
    const offsetMinute = Number.parseInt(match[10] ?? '', 10)

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
  const evidenceSource = normalizeText(input?.evidence_source) as ActionCenterActionEvidenceSource | null
  const confidenceLevel = normalizeText(input?.confidence_level) as ActionCenterActionConfidenceLevel | null
  const followUpNote = normalizeText(input?.follow_up_note)

  if (
    !actionReviewId ||
    !actionId ||
    !reviewedAt ||
    !observation ||
    !actionOutcome ||
    !ACTION_OUTCOMES.has(actionOutcome) ||
    (evidenceSource !== null && !EVIDENCE_SOURCES.has(evidenceSource)) ||
    (confidenceLevel !== null && !CONFIDENCE_LEVELS.has(confidenceLevel)) ||
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
    evidence_source: evidenceSource,
    confidence_level: confidenceLevel,
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
    evidenceSource: validated.evidence_source,
    confidenceLevel: validated.confidence_level,
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
