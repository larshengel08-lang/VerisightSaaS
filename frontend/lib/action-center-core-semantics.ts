import type {
  ActionCenterDecisionRecord,
  ActionCenterReviewOutcome,
  ActionCenterRouteContract,
} from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live-context'
import {
  getActionCenterFollowUpTriggerReasonLabel,
  type ActionCenterRouteFollowUpRelationRecord,
  type ActionCenterRouteReopenRecord,
  type ActionCenterRouteFollowUpTriggerReason,
} from './action-center-route-reopen'
import type {
  ActionCenterManagerResponse,
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
} from './pilot-learning'
import {
  compareDecisionHistoryEntries,
  projectResultProgression,
  projectAuthoredDecisionHistory,
  projectLegacyDecisionRecord,
  type ActionCenterResultProgressEntry,
} from './action-center-decision-history'
import { getActionCenterDecisionProfile } from './action-center-review-decisions'

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
  latestDecision: ActionCenterDecisionRecord | null
  actionProgress: {
    currentStep: string | null
    nextStep: string | null
    expectedEffect: string | null
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
  resultProgression: ActionCenterResultProgressEntry[]
  decisionHistory: ActionCenterDecisionRecord[]
  lineageSummary: ActionCenterLineageSummary
  followUpSemantics?: ActionCenterProjectedFollowUpSemantics
  closingSemantics: {
    status: ActionCenterClosingStatus
    summary: string | null
    historicalSummary: string | null
  }
}

export interface ActionCenterLineageSummary {
  overviewLabel: ActionCenterLineageLabel | null
  backwardLabel: ActionCenterLineageLabel | null
  backwardRouteId: string | null
  forwardLabel: ActionCenterLineageLabel | null
  forwardRouteId: string | null
  detailLabels: ActionCenterLineageLabel[]
}

export interface ActionCenterProjectedFollowUpSemantics {
  isDirectSuccessor: boolean
  lineageLabel: string | null
  triggerReason: ActionCenterRouteFollowUpTriggerReason | null
  triggerReasonLabel: string | null
  sourceRouteId: string | null
}

export type ActionCenterLineageLabel =
  | 'Heropend traject'
  | 'Vervolg op eerdere route'
  | 'Later opgevolgd'

export type ActionCenterCoreSemanticsProjectionInput = Pick<
  LiveActionCenterCampaignContext,
  | 'campaign'
  | 'assignedManager'
  | 'deliveryRecord'
  | 'learningDossier'
  | 'learningCheckpoints'
  | 'reviewDecisions'
  | 'managerResponse'
  | 'routeFollowUpRelations'
  | 'routeReopens'
> & {
  route: ActionCenterRouteContract
  latestVisibleUpdateNote?: string | null
  decisionRecords?: ActionCenterDecisionRecord[]
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
  managerResponse?: ActionCenterManagerResponse | null
  lineageSummary?: ActionCenterLineageSummary | null
  followUpSemantics?: ActionCenterProjectedFollowUpSemantics | null
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
const FOLLOW_UP_SUCCESSOR_LINEAGE_LABEL = 'Vervolg op eerdere route'
const REOPENED_ROUTE_LINEAGE_LABEL = 'Heropend traject'
const FOLLOWED_UP_LATER_LINEAGE_LABEL = 'Later opgevolgd'
const HISTORICAL_CLOSEOUT_SIGNAL_PATTERNS = [
  /\bvorige stap\s+(?:is|was|werd)\s+(?:al\s+|reeds\s+)?(?:definitief\s+)?afgerond\b/i,
  /\bvorige stap\s+(?:is|was|werd)\s+(?:al\s+|reeds\s+)?(?:definitief\s+)?afgesloten\b/i,
  /\b(?:de\s+)?(?:eerdere|eerste|vorige)\s+cyclus\s+(?:is|was|werd)\s+(?:al\s+|reeds\s+)?(?:definitief\s+)?afgerond\b/i,
  /\b(?:de\s+)?(?:eerdere|eerste|vorige)\s+cyclus\s+(?:is|was|werd)\s+(?:al\s+|reeds\s+)?(?:definitief\s+)?afgesloten\b/i,
  /\b(?:de\s+)?(?:eerdere|eerste|vorige)\s+cyclus\s+kon\s+worden\s+afgerond\b/i,
  /\b(?:de\s+)?(?:eerdere|eerste|vorige)\s+cyclus\s+kon\s+worden\s+afgesloten\b/i,
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

function getEmptyFollowUpSemantics(): ActionCenterProjectedFollowUpSemantics {
  return {
    isDirectSuccessor: false,
    lineageLabel: null,
    triggerReason: null,
    triggerReasonLabel: null,
    sourceRouteId: null,
  }
}

function getEmptyLineageSummary(): ActionCenterLineageSummary {
  return {
    overviewLabel: null,
    backwardLabel: null,
    backwardRouteId: null,
    forwardLabel: null,
    forwardRouteId: null,
    detailLabels: [],
  }
}

function getCheckpoint(context: ActionCenterCoreSemanticsProjectionInput, key: PilotLearningCheckpoint['checkpoint_key']) {
  return context.learningCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === key) ?? null
}

function pickMostRecentRelation<T extends { recordedAt: string }>(rows: T[]) {
  return rows
    .slice()
    .sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())[0] ?? null
}

function pickMostRecentReopen<T extends { reopenedAt: string }>(rows: T[]) {
  return rows
    .slice()
    .sort((left, right) => new Date(right.reopenedAt).getTime() - new Date(left.reopenedAt).getTime())[0] ?? null
}

function resolveLineageRead(args: {
  routeId: string
  relations: ActionCenterRouteFollowUpRelationRecord[] | undefined
  routeReopens: ActionCenterRouteReopenRecord[] | undefined
}) {
  const activeRelations = (args.relations ?? []).filter((relation) => !normalizeText(relation.endedAt))
  const backwardRelation = pickMostRecentRelation(
    activeRelations.filter((relation) => relation.targetRouteId === args.routeId),
  )
  const forwardRelation = pickMostRecentRelation(
    activeRelations.filter((relation) => relation.sourceRouteId === args.routeId),
  )
  const reopen = pickMostRecentReopen(
    (args.routeReopens ?? []).filter((routeReopen) => routeReopen.routeId === args.routeId),
  )
  const predecessorRelation = reopen ? null : backwardRelation
  const backwardLabel: ActionCenterLineageLabel | null = reopen
    ? REOPENED_ROUTE_LINEAGE_LABEL
    : backwardRelation
      ? FOLLOW_UP_SUCCESSOR_LINEAGE_LABEL
      : null
  const forwardLabel: ActionCenterLineageLabel | null = forwardRelation
    ? FOLLOWED_UP_LATER_LINEAGE_LABEL
    : null

  return {
    backwardRelation,
    forwardRelation,
    reopen,
    predecessorRelation,
    backwardLabel,
    forwardLabel,
  }
}

export function projectActionCenterLineageSummary(args: {
  routeId: string
  relations: ActionCenterRouteFollowUpRelationRecord[] | undefined
  routeReopens: ActionCenterRouteReopenRecord[] | undefined
}): ActionCenterLineageSummary {
  const { backwardRelation, forwardRelation, reopen, backwardLabel, forwardLabel, predecessorRelation } =
    resolveLineageRead(args)

  if (!backwardRelation && !forwardRelation && !reopen) {
    return getEmptyLineageSummary()
  }

  return {
    overviewLabel: backwardLabel ?? forwardLabel,
    backwardLabel,
    backwardRouteId: predecessorRelation?.sourceRouteId ?? null,
    forwardLabel,
    forwardRouteId: forwardRelation?.targetRouteId ?? null,
    detailLabels: [backwardLabel, forwardLabel].filter((label): label is ActionCenterLineageLabel => Boolean(label)),
  }
}

function projectFollowUpSemantics(args: {
  routeId: string
  relations: ActionCenterRouteFollowUpRelationRecord[] | undefined
  routeReopens: ActionCenterRouteReopenRecord[] | undefined
}): ActionCenterProjectedFollowUpSemantics {
  const { backwardRelation, forwardRelation, reopen, predecessorRelation, backwardLabel } = resolveLineageRead(args)

  if (!backwardRelation && !forwardRelation && !reopen) {
    return getEmptyFollowUpSemantics()
  }

  return {
    isDirectSuccessor: Boolean(predecessorRelation),
    lineageLabel: backwardLabel,
    triggerReason: predecessorRelation?.triggerReason ?? null,
    triggerReasonLabel: predecessorRelation
      ? getActionCenterFollowUpTriggerReasonLabel(predecessorRelation.triggerReason)
      : null,
    sourceRouteId: predecessorRelation?.sourceRouteId ?? null,
  }
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
    context.managerResponse?.response_note,
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

function buildDecisionHistory(args: {
  route: ActionCenterRouteContract
  reviewQuestion: string | null
  latestObservation: string | null
  reviewReason?: string | null
  managementActionOutcome?: string | null
  reviewDecisions?: ActionCenterReviewDecision[] | null
  decisionRecords?: ActionCenterDecisionRecord[]
}) {
  const authored = projectAuthoredDecisionHistory({
    routeId: args.route.campaignId,
    reviewDecisions: args.reviewDecisions,
  })

  if (authored.length > 0) {
    return authored
  }

  const canonical = [...(args.decisionRecords ?? [])]
    .filter((record) => record.sourceRouteId === args.route.campaignId)
    .sort(compareDecisionHistoryEntries)

  if (canonical.length > 0) {
    return canonical
  }

  const legacy = projectLegacyDecisionRecord({
    sourceRouteId: args.route.campaignId,
    reviewOutcome: args.route.reviewOutcome,
    reviewCompletedAt: args.route.reviewCompletedAt,
    reviewReason: args.reviewReason ?? args.route.reviewReason,
    reviewQuestion: args.reviewQuestion,
    managementActionOutcome: args.managementActionOutcome,
    latestObservation: args.latestObservation,
  })

  return legacy ? [legacy] : []
}

function projectActionProgress(args: {
  route: ActionCenterRouteContract
  deliveryNextStep: string | null | undefined
  firstActionTaken: string | null | undefined
  reviewQuestion: string | null
  expectedEffectFallback: string | null
  suppressNextStepFallback?: boolean
}) {
  const currentStep = pickFirst([args.firstActionTaken, args.route.intervention])
  const nextStep = args.suppressNextStepFallback
    ? normalizeText(args.deliveryNextStep)
    : pickFirst([args.deliveryNextStep, args.reviewQuestion])
  const expectedEffect = pickFirst([
    args.route.expectedEffect,
    args.expectedEffectFallback,
    args.reviewQuestion,
  ])

  return {
    currentStep,
    nextStep,
    expectedEffect,
  }
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
  const nextStep = pickFirst([input.managerResponse?.primary_action_text, input.nextStep, input.route?.intervention])
  const managerResponse = input.managerResponse ?? null
  const reviewScheduledFor =
    normalizeText(managerResponse?.review_scheduled_for) ?? normalizeText(input.reviewDate)
  const expectedEffect =
    normalizeText(managerResponse?.primary_action_expected_effect) ?? normalizeText(input.expectedEffect)
  const hasPrimaryAction = Boolean(
    managerResponse?.primary_action_theme_key &&
      managerResponse?.primary_action_text &&
      managerResponse?.primary_action_expected_effect,
  )
  const preservedStatus = input.route?.routeStatus
  const routeStatus =
    preservedStatus === 'afgerond' || preservedStatus === 'gestopt' || preservedStatus === 'geblokkeerd'
      ? preservedStatus
      : hasPrimaryAction && input.ownerName && expectedEffect && reviewScheduledFor
        ? 'in-uitvoering'
        : managerResponse
          ? 'te-bespreken'
          : input.status

  return {
    routeId: input.route?.routeId ?? input.id,
    campaignId: input.route?.campaignId ?? input.id,
    entryStage: input.route?.entryStage ?? 'active',
    routeOpenedAt: input.route?.routeOpenedAt ?? null,
    ownerAssignedAt: input.ownerName ? (input.route?.ownerAssignedAt ?? null) : null,
    routeStatus,
    reviewOutcome: input.reviewOutcome,
    reviewCompletedAt: input.route?.reviewCompletedAt ?? null,
    outcomeRecordedAt: input.route?.outcomeRecordedAt ?? null,
    outcomeSummary: input.route?.outcomeSummary ?? null,
    intervention: nextStep,
    owner: input.ownerName,
    expectedEffect,
    reviewScheduledFor,
    reviewReason,
    managerResponseType: managerResponse?.response_type ?? input.route?.managerResponseType ?? null,
    managerResponseNote: managerResponse?.response_note ?? input.route?.managerResponseNote ?? null,
    primaryActionThemeKey: managerResponse?.primary_action_theme_key ?? input.route?.primaryActionThemeKey ?? null,
    followThroughMode: hasPrimaryAction
      ? 'primary_action'
      : managerResponse
        ? 'bounded_response'
        : input.route?.followThroughMode ?? 'legacy_action',
    blockedBy: routeStatus === 'geblokkeerd' ? (input.route?.blockedBy ?? 'blocked') : null,
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
    route.managerResponseNote,
    input.reason,
    input.signalBody,
    input.summary,
    getReviewQuestionTemplateForStatus(route.routeStatus),
  ])
  const reviewQuestion = pickFirst([
    route.expectedEffect,
    route.managerResponseNote,
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
  const decisionHistory = buildDecisionHistory({
    route,
    reviewQuestion,
    latestObservation: whatWeObserved,
    reviewReason,
    managementActionOutcome: input.reviewOutcome,
  })
  const latestDecision = decisionHistory[0] ?? null
  const resultProgression = projectResultProgression(decisionHistory)
  const latestDecisionProfile = latestDecision ? getActionCenterDecisionProfile(latestDecision.decision) : null
  const actionProgress = projectActionProgress({
    route,
    deliveryNextStep: input.nextStep,
    firstActionTaken: route.intervention,
    reviewQuestion,
    expectedEffectFallback: expectedEffectFromReason,
    suppressNextStepFallback: latestDecisionProfile?.hidesNextStep ?? false,
  })
  const whatWasDecided = getDecisionText({
    reviewOutcomeVisible,
    managementActionOutcomeText: getRawManagementActionOutcomeText(input.reviewOutcome),
    outcomeSummary: route.outcomeSummary,
    latestVisibleUpdateNote,
  })
  const closingStatus = getPreviewClosingStatus(route.routeStatus)
  const lineageSummary = input.lineageSummary ?? getEmptyLineageSummary()
  const followUpSemantics = input.followUpSemantics ?? getEmptyFollowUpSemantics()

  return {
    route,
    reviewSemantics: {
      reviewReason: reviewReason ?? REVIEW_REASON_FALLBACK,
      reviewQuestion: reviewQuestion ?? REVIEW_QUESTION_FALLBACK,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    latestDecision,
    actionProgress,
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
        route.managerResponseNote,
        normalizeAttemptText(latestVisibleUpdateNote),
        input.nextStep,
        nextStep,
      ]),
      whatWeObserved,
      whatWasDecided,
    },
    resultProgression,
    decisionHistory,
    lineageSummary,
    followUpSemantics,
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
    route.managerResponseNote,
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
    route.managerResponseNote,
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
  const lineageSummary = projectActionCenterLineageSummary({
    routeId: route.routeId,
    relations: context.routeFollowUpRelations,
    routeReopens: context.routeReopens,
  })
  const followUpSemantics = projectFollowUpSemantics({
    routeId: route.routeId,
    relations: context.routeFollowUpRelations,
    routeReopens: context.routeReopens,
  })
  const decisionHistory = buildDecisionHistory({
    route,
    reviewQuestion,
    latestObservation,
    reviewReason,
    managementActionOutcome: context.learningDossier?.management_action_outcome,
    reviewDecisions: context.reviewDecisions,
    decisionRecords: context.decisionRecords,
  })
  const latestDecision = decisionHistory[0] ?? null
  const resultProgression = projectResultProgression(decisionHistory)
  const latestDecisionProfile = latestDecision ? getActionCenterDecisionProfile(latestDecision.decision) : null
  const actionProgress = projectActionProgress({
    route,
    deliveryNextStep: latestDecision?.nextStepSnapshot ?? context.deliveryRecord?.next_step,
    firstActionTaken:
      latestDecision?.currentStepSnapshot ??
      context.managerResponse?.primary_action_text ??
      context.learningDossier?.first_action_taken,
    reviewQuestion,
    expectedEffectFallback:
      latestDecision?.expectedEffectSnapshot ??
      context.managerResponse?.primary_action_expected_effect ??
      derivedExpectedEffect,
    suppressNextStepFallback: latestDecisionProfile?.hidesNextStep ?? false,
  })

  return {
    route,
    reviewSemantics: {
      reviewReason: reviewReason ?? REVIEW_REASON_FALLBACK,
      reviewQuestion: reviewQuestion ?? REVIEW_QUESTION_FALLBACK,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    latestDecision,
    actionProgress,
    actionFrame: {
      whyNow: whyNow ?? ACTION_FRAME_FALLBACK,
      firstStep: firstStep ?? ACTION_FRAME_FALLBACK,
      owner: owner ?? UNASSIGNED_OWNER_LABEL,
      expectedEffect: expectedEffect ?? ACTION_FRAME_FALLBACK,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        latestDecision?.currentStepSnapshot,
        normalizeAttemptText(context.latestVisibleUpdateNote),
        context.managerResponse?.response_note,
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
    resultProgression,
    decisionHistory,
    lineageSummary,
    followUpSemantics,
    closingSemantics: {
      status: closingStatus,
      summary: getClosingSummary(closingStatus, getLiveClosingSummaryValues(context, route, closingStatus)),
      historicalSummary: closingStatus === 'lopend' ? getHistoricalCloseoutSummary(context) : null,
    },
  }
}
