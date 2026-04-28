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
  }
}

export type ActionCenterCoreSemanticsProjectionInput = Pick<
  LiveActionCenterCampaignContext,
  'campaign' | 'assignedManager' | 'deliveryRecord' | 'learningDossier' | 'learningCheckpoints'
> & {
  route: ActionCenterRouteContract
}

const UNASSIGNED_OWNER_LABEL = 'Nog niet toegewezen'
const REVIEW_REASON_FALLBACK = 'Welke vervolgstap vraagt deze route nu als eerste review?'
const REVIEW_QUESTION_FALLBACK = 'Welke vervolgstap vraagt deze route nu als eerste review?'
const ACTION_FRAME_FALLBACK = 'Nog te bepalen in review'

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

function getReviewQuestionTemplate(route: ActionCenterRouteContract) {
  switch (route.routeStatus) {
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
  ])
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
    getReviewQuestionTemplate(route),
  ])
  const reviewQuestion = pickFirst([
    route.expectedEffect,
    expectedEffectFromReason,
    nextStep,
    getReviewQuestionTemplate(route),
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
    route.outcomeSummary,
    context.deliveryRecord?.customer_handoff_note,
    context.learningDossier?.title,
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
        latestActionUpdate,
        nextStep,
        firstStep,
      ]),
      whatWeObserved: pickFirst([
        latestObservation,
        observationFallback,
      ]),
      whatWasDecided: pickFirst([
        context.learningDossier?.next_route,
        context.learningDossier?.stop_reason,
        route.outcomeSummary,
        getReviewOutcomeLabel(reviewOutcomeVisible),
        normalizeText(context.learningDossier?.management_action_outcome),
      ]),
    },
    closingSemantics: {
      status: getClosingStatus(context, route),
    },
  }
}
