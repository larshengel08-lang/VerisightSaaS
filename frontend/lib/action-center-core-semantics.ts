import type { ActionCenterReviewOutcome, ActionCenterRouteContract } from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live-context'
import type { PilotLearningCheckpoint } from './pilot-learning'

export type ActionCenterVisibleReviewOutcome = Exclude<ActionCenterReviewOutcome, 'opschalen'>
export type ActionCenterClosingStatus = 'lopend' | 'afgerond' | 'gestopt'

export interface ActionCenterCoreSemantics {
  route: ActionCenterRouteContract
  reviewSemantics: {
    reviewReason: string
    reviewQuestion: string
    reviewOutcomeRaw: ActionCenterReviewOutcome
    reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  }
  actionFrame: {
    whyNow: string
    firstStep: string
    owner: string
    expectedEffect: string
  }
  resultLoop: {
    whatWasTried: string | null
    whatWeObserved: string | null
    whatWasDecided: string | null
  }
  closingSemantics: {
    status: ActionCenterClosingStatus
    summary: string | null
    historicalSummary: string | null
  }
}

export type ActionCenterCoreSemanticsProjectionInput = Pick<
  LiveActionCenterCampaignContext,
  'campaign' | 'assignedManager' | 'deliveryRecord' | 'learningDossier' | 'learningCheckpoints'
> & {
  route: ActionCenterRouteContract
  latestVisibleUpdateNote?: string | null
}

export interface ActionCenterPreviewCoreSemanticsProjectionInput {
  id: string
  title: string
  status: ActionCenterRouteContract['routeStatus']
  ownerName: string | null
  reviewDate: string | null
  expectedEffect: string | null
  reviewReason: string | null
  reviewOutcome: ActionCenterReviewOutcome
  reason: string | null
  summary: string | null
  signalBody: string | null
  nextStep: string | null
  latestVisibleUpdateNote?: string | null
  route?: ActionCenterRouteContract | null
}

const UNASSIGNED_OWNER_LABEL = 'Nog niet toegewezen'
const REVIEW_REASON_FALLBACK = 'Welke vervolgstap vraagt deze route nu als eerste review?'
const REVIEW_QUESTION_FALLBACK = 'Welke vervolgstap vraagt deze route nu als eerste review?'
const ACTION_FRAME_FALLBACK = 'Nog te bepalen in review'
const DECISION_ONLY_ACTION_TEXTS = new Set([
  'doorgaan',
  'bijstellen',
  'opschalen',
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
])
const HISTORICAL_CLOSEOUT_SIGNAL_PATTERNS = [
  /\bafgerond\b/i,
  /\bafgesloten\b/i,
  /\bvorige stap\b/i,
  /\beerdere cyclus\b/i,
  /\beerste cyclus\b/i,
  /\breeds afgerond\b/i,
  /\bal afgerond\b/i,
  /\bkon worden afgerond\b/i,
]

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function pickFirst(values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = normalizeText(value)
    if (normalized) return normalized
  }

  return null
}

function getCheckpoint(context: ActionCenterCoreSemanticsProjectionInput, key: PilotLearningCheckpoint['checkpoint_key']) {
  return context.learningCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === key) ?? null
}

function getVisibleReviewOutcome(outcome: ActionCenterReviewOutcome): ActionCenterVisibleReviewOutcome {
  return outcome === 'opschalen' ? 'bijstellen' : outcome
}

function getReviewOutcomeLabel(outcome: ActionCenterVisibleReviewOutcome) {
  switch (outcome) {
    case 'doorgaan':
      return 'Doorgaan'
    case 'bijstellen':
      return 'Bijstellen'
    case 'afronden':
      return 'Afronden'
    case 'stoppen':
      return 'Stoppen'
    default:
      return null
  }
}

function normalizeAttemptText(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return null

  return DECISION_ONLY_ACTION_TEXTS.has(normalized.toLocaleLowerCase('nl-NL')) ? null : normalized
}

function readsLikeActionStep(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const lower = normalized.toLocaleLowerCase('nl-NL')
  if (DECISION_ONLY_ACTION_TEXTS.has(lower) || lower.endsWith('?')) {
    return false
  }

  const firstWord = lower.split(/\s+/, 1)[0] ?? ''
  return ACTION_STEP_PREFIXES.has(firstWord)
}

function getRawManagementActionOutcomeText(outcome: ActionCenterReviewOutcome | string | null | undefined) {
  const normalized = normalizeText(outcome)
  if (!normalized || normalized === 'geen-uitkomst') {
    return null
  }

  return normalized
}

function getDecisionText(args: {
  reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  managementActionOutcomeText?: string | null
  nextRoute?: string | null
  stopReason?: string | null
  outcomeSummary?: string | null
  latestVisibleUpdateNote?: string | null
}) {
  return pickFirst([
    getReviewOutcomeLabel(args.reviewOutcomeVisible),
    args.managementActionOutcomeText,
    args.nextRoute,
    args.stopReason,
    args.outcomeSummary,
    args.latestVisibleUpdateNote,
  ])
}

function getClosingStatus(context: ActionCenterCoreSemanticsProjectionInput, route: ActionCenterRouteContract): ActionCenterClosingStatus {
  if (context.learningDossier?.triage_status === 'uitgevoerd' || route.routeStatus === 'afgerond') {
    return 'afgerond'
  }

  if (context.learningDossier?.triage_status === 'verworpen' || route.routeStatus === 'gestopt') {
    return 'gestopt'
  }

  return 'lopend'
}

function getRouteSummary(route: ActionCenterRouteContract, context: ActionCenterCoreSemanticsProjectionInput) {
  return pickFirst([
    route.outcomeSummary,
    context.deliveryRecord?.customer_handoff_note,
  ])
}

function getHistoricalCloseoutSummary(context: ActionCenterCoreSemanticsProjectionInput) {
  const followUpReview = getCheckpoint(context, 'follow_up_review')
  const confirmedLesson = normalizeText(followUpReview?.confirmed_lesson)

  if (!confirmedLesson) {
    return null
  }

  return HISTORICAL_CLOSEOUT_SIGNAL_PATTERNS.some((pattern) => pattern.test(confirmedLesson))
    ? confirmedLesson
    : null
}

function getReviewQuestionTemplateForStatus(status: ActionCenterRouteContract['routeStatus']) {
  switch (status) {
    case 'geblokkeerd':
      return 'Wat blokkeert deze route nu het meest?'
    case 'in-uitvoering':
      return 'Welke vervolgstap vraagt deze route nu als eerste review?'
    case 'afgerond':
      return 'Welke uitkomst van deze route verdient nu de eerste review?'
    case 'gestopt':
      return 'Welke stopreden vraagt nu de eerste review?'
    case 'te-bespreken':
    default:
      return 'Welke vervolgstap vraagt deze route nu als eerste review?'
  }
}

function joinReasonAndStep(reason: string | null, step: string | null) {
  const values = [normalizeText(reason), normalizeText(step)].filter((value): value is string => Boolean(value))
  if (values.length === 0) return null
  return values.join(' ')
}

function getLatestActionUpdate(context: ActionCenterCoreSemanticsProjectionInput) {
  return pickFirst([
    context.learningDossier?.first_action_taken,
    context.deliveryRecord?.operator_notes,
  ])
}

function getLatestObservation(context: ActionCenterCoreSemanticsProjectionInput, route: ActionCenterRouteContract) {
  return pickFirst([
    route.outcomeSummary,
    getCheckpoint(context, 'follow_up_review')?.confirmed_lesson,
    getCheckpoint(context, 'follow_up_review')?.interpreted_observation,
    getCheckpoint(context, 'follow_up_review')?.qualitative_notes,
    getCheckpoint(context, 'follow_up_review')?.objective_signal_notes,
    getCheckpoint(context, 'first_management_use')?.confirmed_lesson,
    getCheckpoint(context, 'first_management_use')?.interpreted_observation,
    getCheckpoint(context, 'first_management_use')?.qualitative_notes,
    getCheckpoint(context, 'first_management_use')?.objective_signal_notes,
    context.learningDossier?.adoption_outcome,
    context.learningDossier?.case_public_summary,
    context.latestVisibleUpdateNote,
  ])
}

function getPreviewClosingStatus(status: ActionCenterRouteContract['routeStatus']): ActionCenterClosingStatus {
  if (status === 'afgerond') return 'afgerond'
  if (status === 'gestopt') return 'gestopt'
  return 'lopend'
}

function getClosingSummary(status: ActionCenterClosingStatus, values: Array<string | null | undefined>) {
  if (status === 'lopend') {
    return null
  }

  return (
    pickFirst(values) ??
    (status === 'afgerond' ? 'De route is voor nu afgerond.' : 'De route is bewust gestopt.')
  )
}

function getPreviewClosingSummaryValues(route: ActionCenterRouteContract, status: ActionCenterClosingStatus) {
  if (status === 'afgerond' || status === 'gestopt') {
    return [route.outcomeSummary]
  }

  return []
}

function getLiveClosingSummaryValues(
  context: ActionCenterCoreSemanticsProjectionInput,
  route: ActionCenterRouteContract,
  status: ActionCenterClosingStatus,
) {
  if (status === 'afgerond') {
    return [
      route.outcomeSummary,
      context.learningDossier?.next_route,
    ]
  }

  if (status === 'gestopt') {
    return [
      context.learningDossier?.stop_reason,
      route.outcomeSummary,
    ]
  }

  return []
}

function buildPreviewRoute(input: ActionCenterPreviewCoreSemanticsProjectionInput): ActionCenterRouteContract {
  const reviewReason = pickFirst([input.reviewReason, input.route?.reviewReason])
  const nextStep = pickFirst([input.nextStep, input.route?.intervention])

  return {
    campaignId: input.route?.campaignId ?? input.id,
    entryStage: input.route?.entryStage ?? 'active',
    routeOpenedAt: input.route?.routeOpenedAt ?? null,
    ownerAssignedAt: input.ownerName ? (input.route?.ownerAssignedAt ?? null) : null,
    routeStatus: input.status,
    reviewOutcome: input.reviewOutcome,
    reviewCompletedAt: input.route?.reviewCompletedAt ?? null,
    outcomeRecordedAt: input.route?.outcomeRecordedAt ?? null,
    outcomeSummary: input.route?.outcomeSummary ?? null,
    intervention: nextStep,
    owner: input.ownerName,
    expectedEffect: normalizeText(input.expectedEffect),
    reviewScheduledFor: normalizeText(input.reviewDate),
    reviewReason,
    blockedBy: input.status === 'geblokkeerd' ? (input.route?.blockedBy ?? 'blocked') : null,
  }
}

export function projectActionCenterPreviewCoreSemantics(
  input: ActionCenterPreviewCoreSemanticsProjectionInput,
): ActionCenterCoreSemantics {
  const route = buildPreviewRoute(input)
  const reviewOutcomeVisible = getVisibleReviewOutcome(route.reviewOutcome)
  const primaryReason = pickFirst([
    route.reviewReason,
    input.reason,
    input.signalBody,
  ])
  const nextStep = pickFirst([
    route.intervention,
    input.nextStep,
  ])
  const expectedEffectFromReason = joinReasonAndStep(primaryReason, nextStep)
  const firstStep = nextStep ?? ACTION_FRAME_FALLBACK
  const reviewReason = pickFirst([
    route.reviewReason,
    input.reason,
    input.signalBody,
    input.summary,
    getReviewQuestionTemplateForStatus(route.routeStatus),
  ])
  const reviewQuestion = pickFirst([
    route.expectedEffect,
    expectedEffectFromReason,
    nextStep,
    route.reviewReason,
    getReviewQuestionTemplateForStatus(route.routeStatus),
  ])
  const whyNow = pickFirst([
    primaryReason,
    input.signalBody,
    input.summary,
    input.title,
    reviewReason,
  ])
  const latestVisibleUpdateNote = normalizeText(input.latestVisibleUpdateNote)
  const whatWeObserved = pickFirst([
    latestVisibleUpdateNote,
    input.signalBody,
    route.expectedEffect,
  ])
  const whatWasDecided = getDecisionText({
    reviewOutcomeVisible,
    managementActionOutcomeText: getRawManagementActionOutcomeText(input.reviewOutcome),
    outcomeSummary: route.outcomeSummary,
    latestVisibleUpdateNote,
  })
  const closingStatus = getPreviewClosingStatus(route.routeStatus)

  return {
    route,
    reviewSemantics: {
      reviewReason: reviewReason ?? REVIEW_REASON_FALLBACK,
      reviewQuestion: reviewQuestion ?? REVIEW_QUESTION_FALLBACK,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    actionFrame: {
      whyNow: whyNow ?? ACTION_FRAME_FALLBACK,
      firstStep,
      owner: input.ownerName ?? UNASSIGNED_OWNER_LABEL,
      expectedEffect: pickFirst([
        route.expectedEffect,
        expectedEffectFromReason,
        reviewQuestion,
      ]) ?? ACTION_FRAME_FALLBACK,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        normalizeAttemptText(latestVisibleUpdateNote),
        input.nextStep,
        nextStep,
      ]),
      whatWeObserved,
      whatWasDecided,
    },
    closingSemantics: {
      status: closingStatus,
      summary: getClosingSummary(closingStatus, getPreviewClosingSummaryValues(route, closingStatus)),
      historicalSummary: null,
    },
  }
}

export function projectActionCenterCoreSemantics(
  context: ActionCenterCoreSemanticsProjectionInput,
): ActionCenterCoreSemantics {
  const { route } = context
  const reviewCheckpoint = getCheckpoint(context, 'follow_up_review')
  const managementCheckpoint = getCheckpoint(context, 'first_management_use')
  const reviewOutcomeVisible = getVisibleReviewOutcome(route.reviewOutcome)
  const nextStep = pickFirst([
    context.deliveryRecord?.next_step,
    route.intervention,
  ])

  const primaryReason = pickFirst([
    route.reviewReason,
    context.learningDossier?.buyer_question,
    context.learningDossier?.buying_reason,
    context.learningDossier?.trust_friction,
  ])
  const routeSummary = getRouteSummary(route, context)

  const expectedEffectFromReason = joinReasonAndStep(primaryReason, nextStep)

  const reviewReason = pickFirst([
    primaryReason,
    route.expectedEffect,
    nextStep,
    getReviewQuestionTemplateForStatus(route.routeStatus),
  ])
  const reviewQuestion = pickFirst([
    route.expectedEffect,
    expectedEffectFromReason,
    nextStep,
    route.reviewReason,
    getReviewQuestionTemplateForStatus(route.routeStatus),
  ])

  const whyNow = pickFirst([
    primaryReason,
    routeSummary,
    context.learningDossier?.title,
    context.campaign.name,
    reviewReason,
  ])

  const owner = pickFirst([
    route.owner,
    reviewCheckpoint?.owner_label,
    managementCheckpoint?.owner_label,
    context.assignedManager?.displayName,
  ])

  const firstStep = pickFirst([
    nextStep,
    route.intervention,
    context.learningDossier?.first_action_taken,
  ]) ?? pickFirst([
    readsLikeActionStep(route.outcomeSummary) ? route.outcomeSummary : null,
    readsLikeActionStep(context.deliveryRecord?.customer_handoff_note)
      ? context.deliveryRecord?.customer_handoff_note
      : null,
    readsLikeActionStep(context.learningDossier?.title) ? context.learningDossier?.title : null,
  ])

  const derivedExpectedEffect = expectedEffectFromReason

  const expectedEffect = pickFirst([
    route.expectedEffect,
    derivedExpectedEffect,
    reviewQuestion,
  ])
  const observationFallback = pickFirst([
    route.expectedEffect,
    context.learningDossier?.expected_first_value,
  ])

  const latestObservation = getLatestObservation(context, route)
  const latestActionUpdate = getLatestActionUpdate(context)
  const closingStatus = getClosingStatus(context, route)

  return {
    route,
    reviewSemantics: {
      reviewReason: reviewReason ?? REVIEW_REASON_FALLBACK,
      reviewQuestion: reviewQuestion ?? REVIEW_QUESTION_FALLBACK,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    actionFrame: {
      whyNow: whyNow ?? ACTION_FRAME_FALLBACK,
      firstStep: firstStep ?? ACTION_FRAME_FALLBACK,
      owner: owner ?? UNASSIGNED_OWNER_LABEL,
      expectedEffect: expectedEffect ?? ACTION_FRAME_FALLBACK,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        normalizeAttemptText(context.latestVisibleUpdateNote),
        latestActionUpdate,
        nextStep,
        firstStep,
      ]),
      whatWeObserved: pickFirst([
        latestObservation,
        observationFallback,
      ]),
      whatWasDecided: getDecisionText({
        reviewOutcomeVisible,
        managementActionOutcomeText: normalizeText(context.learningDossier?.management_action_outcome),
        nextRoute: context.learningDossier?.next_route,
        stopReason: context.learningDossier?.stop_reason,
        outcomeSummary: route.outcomeSummary,
        latestVisibleUpdateNote: normalizeText(context.latestVisibleUpdateNote),
      }),
    },
    closingSemantics: {
      status: closingStatus,
      summary: getClosingSummary(closingStatus, getLiveClosingSummaryValues(context, route, closingStatus)),
      historicalSummary: closingStatus === 'lopend' ? getHistoricalCloseoutSummary(context) : null,
    },
  }
}
