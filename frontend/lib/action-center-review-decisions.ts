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
const ACTION_STEP_PREFIXES = new Set([
  'plan',
  'leg',
  'bevestig',
  'kies',
  'maak',
  'zet',
  'start',
  'bespreek',
  'neem',
  'stem',
  'deel',
  'werk',
  'rond',
  'stop',
  'onderzoek',
  'borg',
  'vraag',
  'mail',
  'bel',
  'organiseer',
  'herplan',
  'corrigeer',
  'check',
  'koppel',
  'vervolg',
  'voer',
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

export interface ActionCenterDecisionProfile {
  isClosing: boolean
  requiresDistinctNextStep: boolean
  requiresObservationSnapshot: boolean
  hidesNextCheck: boolean
  hidesNextStep: boolean
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

function areSameStep(left: string | null | undefined, right: string | null | undefined) {
  const normalizedLeft = normalizeText(left)?.toLocaleLowerCase('nl-NL') ?? null
  const normalizedRight = normalizeText(right)?.toLocaleLowerCase('nl-NL') ?? null
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight)
}

export function getActionCenterDecisionProfile(decision: AuthoredActionCenterDecision): ActionCenterDecisionProfile {
  switch (decision) {
    case 'bijstellen':
      return {
        isClosing: false,
        requiresDistinctNextStep: true,
        requiresObservationSnapshot: true,
        hidesNextCheck: false,
        hidesNextStep: false,
      }
    case 'afronden':
    case 'stoppen':
      return {
        isClosing: true,
        requiresDistinctNextStep: false,
        requiresObservationSnapshot: false,
        hidesNextCheck: true,
        hidesNextStep: true,
      }
    case 'doorgaan':
    default:
      return {
        isClosing: false,
        requiresDistinctNextStep: false,
        requiresObservationSnapshot: false,
        hidesNextCheck: false,
        hidesNextStep: false,
      }
  }
}

export function getActionCenterDecisionGuidance(decision: AuthoredActionCenterDecision) {
  switch (decision) {
    case 'bijstellen':
      return 'Bijstellen vraagt een zichtbare koerscorrectie: leg vast wat je zag, welke volgende stap nu verandert en wat je daarna opnieuw wilt toetsen.'
    case 'afronden':
      return 'Afronden sluit de route inhoudelijk: beschrijf waarom deze route klaar is en laat vervolgvelden leeg zodat geen open follow-through zichtbaar blijft.'
    case 'stoppen':
      return 'Stoppen vraagt een expliciete stopreden: leg uit waarom vervolg niet zinvol is en laat open volgende stappen of toetsen leeg.'
    case 'doorgaan':
    default:
      return 'Doorgaan bevestigt het huidige spoor: houd de huidige stap en volgende toets scherp zodat de route bounded reviewbaar blijft.'
  }
}

export function looksLikeActionCenterStep(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const lower = normalized.toLocaleLowerCase('nl-NL')
  if (lower.endsWith('?')) return false

  const firstWord = lower.split(/\s+/, 1)[0] ?? ''
  return ACTION_STEP_PREFIXES.has(firstWord)
}

export function looksLikeActionCenterExpectedEffect(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const lower = normalized.toLocaleLowerCase('nl-NL')
  if (looksLikeActionCenterStep(lower)) return false

  return (
    lower.includes('moet ') ||
    lower.includes('zichtbaar') ||
    lower.includes('duidelijk') ||
    lower.includes('blijken') ||
    lower.includes('bevestigd') ||
    lower.includes('effect') ||
    lower.includes('toename') ||
    lower.includes('afname')
  )
}

export function getActionCenterActionGuidance(args: {
  currentStep: string | null | undefined
  nextStep: string | null | undefined
  expectedEffect: string | null | undefined
}) {
  if (!looksLikeActionCenterStep(args.currentStep)) {
    return 'De huidige stap leest nog niet als concrete managementhandeling. Maak hem actiever en bounded.'
  }

  if (normalizeText(args.nextStep) && !looksLikeActionCenterStep(args.nextStep)) {
    return 'De volgende stap leest nog niet als echte vervolghandeling. Scherp hem aan als bounded interventie.'
  }

  if (!looksLikeActionCenterExpectedEffect(args.expectedEffect)) {
    return 'Het verwacht effect leest nog te veel als taakzin. Beschrijf wat de stap zichtbaar of duidelijker moet maken.'
  }

  return 'De actie-opbouw is scherp genoeg: huidige stap, vervolgstap en verwacht effect vormen samen een geloofwaardige voortgangslijn.'
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
  const decisionProfile = decision ? getActionCenterDecisionProfile(decision) : null

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

  if (decisionProfile?.requiresDistinctNextStep && (!nextStep || areSameStep(currentStep, nextStep))) {
    throw new Error('Ongeldige authored review decision input.')
  }

  if (decisionProfile?.requiresObservationSnapshot && !observationSnapshot) {
    throw new Error('Ongeldige authored review decision input.')
  }

  if (decisionProfile?.hidesNextCheck && nextCheck) {
    throw new Error('Ongeldige authored review decision input.')
  }

  if (decisionProfile?.hidesNextStep && nextStep) {
    throw new Error('Ongeldige authored review decision input.')
  }

  if (!decisionProfile?.isClosing) {
    if (!expectedEffect || !looksLikeActionCenterExpectedEffect(expectedEffect)) {
      throw new Error('Ongeldige authored review decision input.')
    }

    if (!looksLikeActionCenterStep(currentStep)) {
      throw new Error('Ongeldige authored review decision input.')
    }

    if (nextStep && !looksLikeActionCenterStep(nextStep)) {
      throw new Error('Ongeldige authored review decision input.')
    }
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
