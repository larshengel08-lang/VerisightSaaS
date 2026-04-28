import { projectActionCenterRoute, type ActionCenterReviewOutcome, type ActionCenterRouteContract } from './action-center-route-contract'
import type { LiveActionCenterCampaignContext } from './action-center-live'
import type { PilotLearningCheckpoint } from './pilot-learning'

export type ActionCenterVisibleReviewOutcome = Exclude<ActionCenterReviewOutcome, 'opschalen'>
export type ActionCenterClosingStatus = 'lopend' | 'afgerond' | 'gestopt'

export interface ActionCenterCoreSemantics {
  route: ActionCenterRouteContract
  reviewSemantics: {
    reviewQuestion: string | null
    whyNow: string | null
    reviewOutcomeRaw: ActionCenterReviewOutcome
    reviewOutcomeVisible: ActionCenterVisibleReviewOutcome
  }
  actionFrame: {
    firstStep: string | null
    owner: string | null
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

export function projectActionCenterCoreSemantics(
  context: LiveActionCenterCampaignContext,
): ActionCenterCoreSemantics {
  const route = projectActionCenterRoute(context)
  const reviewCheckpoint = getCheckpoint(context, 'follow_up_review')
  const managementCheckpoint = getCheckpoint(context, 'first_management_use')
  const reviewOutcomeVisible = getVisibleReviewOutcome(route.reviewOutcome)

  const whyNow = pickFirst([
    route.reviewReason,
    context.learningDossier?.buyer_question,
    context.learningDossier?.buying_reason,
    context.learningDossier?.trust_friction,
    route.expectedEffect,
    context.deliveryRecord?.customer_handoff_note,
  ])

  const owner = pickFirst([
    route.owner,
    reviewCheckpoint?.owner_label,
    managementCheckpoint?.owner_label,
    context.deliveryRecord?.operator_owner,
  ])

  const expectedEffect = pickFirst([
    route.expectedEffect,
    route.reviewReason,
    context.learningDossier?.buyer_question,
    context.learningDossier?.buying_reason,
    context.deliveryRecord?.customer_handoff_note,
    context.learningDossier?.implementation_risk,
  ])

  const firstStep = pickFirst([
    route.intervention,
    context.deliveryRecord?.next_step,
    route.reviewReason,
    route.expectedEffect,
  ])

  const whatWeObserved = pickFirst([
    route.outcomeSummary,
    reviewCheckpoint?.confirmed_lesson,
    reviewCheckpoint?.interpreted_observation,
    reviewCheckpoint?.qualitative_notes,
    reviewCheckpoint?.objective_signal_notes,
    managementCheckpoint?.confirmed_lesson,
    managementCheckpoint?.interpreted_observation,
    managementCheckpoint?.qualitative_notes,
    managementCheckpoint?.objective_signal_notes,
    context.learningDossier?.management_action_outcome,
    context.learningDossier?.implementation_risk,
    context.deliveryRecord?.customer_handoff_note,
  ])

  const whatWasDecided = pickFirst([
    route.outcomeSummary,
    context.learningDossier?.stop_reason,
    context.learningDossier?.next_route,
    getReviewOutcomeLabel(reviewOutcomeVisible),
  ])

  return {
    route,
    reviewSemantics: {
      reviewQuestion: whyNow,
      whyNow,
      reviewOutcomeRaw: route.reviewOutcome,
      reviewOutcomeVisible,
    },
    actionFrame: {
      firstStep,
      owner,
      expectedEffect,
    },
    resultLoop: {
      whatWasTried: pickFirst([
        route.intervention,
        context.deliveryRecord?.next_step,
        expectedEffect,
        whyNow,
      ]),
      whatWeObserved,
      whatWasDecided,
    },
    closingSemantics: {
      status: getClosingStatus(context, route),
    },
  }
}
