import { projectActionCenterRoute, type ActionCenterReviewOutcome, type ActionCenterRouteContract } from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live'
import type { PilotLearningCheckpoint } from './pilot-learning'

export type ActionCenterVisibleReviewOutcome = Exclude<ActionCenterReviewOutcome, 'opschalen'>
export type ActionCenterClosingStatus = 'lopend' | 'afgerond' | 'gestopt'

export interface ActionCenterCoreSemantics {
  route: ActionCenterRouteContract
  reviewSemantics: {
    reviewQuestion: string | null
    reviewOutcomeRaw: ActionCenterReviewOutcome
    reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  }
  actionFrame: {
    whyNow: string | null
    firstStep: string | null
    owner: string
    expectedEffect: string | null
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

const UNASSIGNED_OWNER_LABEL = 'Nog niet toegewezen'

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

function getCheckpoint(context: LiveActionCenterCampaignContext, key: PilotLearningCheckpoint['checkpoint_key']) {
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

function getClosingStatus(context: LiveActionCenterCampaignContext, route: ActionCenterRouteContract): ActionCenterClosingStatus {
  if (context.learningDossier?.triage_status === 'uitgevoerd' || route.routeStatus === 'afgerond') {
    return 'afgerond'
  }

  if (context.learningDossier?.triage_status === 'verworpen' || route.routeStatus === 'gestopt') {
    return 'gestopt'
  }

  return 'lopend'
}

function joinReasonAndStep(reason: string | null, step: string | null) {
  const values = [normalizeText(reason), normalizeText(step)].filter((value): value is string => Boolean(value))
  if (values.length === 0) return null
  return values.join(' ')
}

function getLatestActionUpdate(context: LiveActionCenterCampaignContext) {
  return pickFirst([
    context.learningDossier?.first_action_taken,
    context.deliveryRecord?.operator_notes,
  ])
}

function getLatestObservation(context: LiveActionCenterCampaignContext, route: ActionCenterRouteContract) {
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
  context: LiveActionCenterCampaignContext,
): ActionCenterCoreSemantics {
  const route = projectActionCenterRoute(context)
  const reviewCheckpoint = getCheckpoint(context, 'follow_up_review')
  const managementCheckpoint = getCheckpoint(context, 'first_management_use')
  const reviewOutcomeVisible = getVisibleReviewOutcome(route.reviewOutcome)
  const nextStep = pickFirst([
    context.deliveryRecord?.next_step,
    route.intervention,
  ])

  const reviewQuestion = pickFirst([
    route.reviewReason,
    context.learningDossier?.buyer_question,
    context.learningDossier?.buying_reason,
    context.learningDossier?.trust_friction,
    route.outcomeSummary,
    context.learningDossier?.title,
    context.campaign.name,
  ])

  const whyNow = pickFirst([
    route.reviewReason,
    context.learningDossier?.buyer_question,
    context.learningDossier?.buying_reason,
    context.learningDossier?.trust_friction,
    route.outcomeSummary,
    context.deliveryRecord?.customer_handoff_note,
    context.learningDossier?.title,
    context.campaign.name,
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

  const derivedExpectedEffect = joinReasonAndStep(
    pickFirst([
      route.reviewReason,
      context.learningDossier?.buyer_question,
      context.learningDossier?.buying_reason,
      context.learningDossier?.trust_friction,
    ]),
    nextStep,
  )

  const expectedEffect = pickFirst([
    route.expectedEffect,
    derivedExpectedEffect,
  ])

  const latestObservation = getLatestObservation(context, route)
  const latestActionUpdate = getLatestActionUpdate(context)

  return {
    route,
    reviewSemantics: {
      reviewQuestion,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    actionFrame: {
      whyNow,
      firstStep,
      owner: owner ?? UNASSIGNED_OWNER_LABEL,
      expectedEffect,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        latestActionUpdate,
        nextStep,
        firstStep,
      ]),
      whatWeObserved: pickFirst([
        latestObservation,
        expectedEffect,
        context.learningDossier?.expected_first_value,
      ]),
      whatWasDecided: pickFirst([
        getReviewOutcomeLabel(reviewOutcomeVisible),
        normalizeText(context.learningDossier?.management_action_outcome),
        route.outcomeSummary,
        context.learningDossier?.next_route,
        context.learningDossier?.stop_reason,
      ]),
    },
    closingSemantics: {
      status: getClosingStatus(context, route),
    },
  }
}
