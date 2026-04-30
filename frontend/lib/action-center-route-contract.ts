import type { DeliveryExceptionStatus } from '@/lib/ops-delivery'
import type { LiveActionCenterCampaignContext } from './action-center-live'
import type { PilotLearningCheckpoint } from './pilot-learning'
import { hasPrimaryManagerAction } from './action-center-manager-responses'
import type { ActionCenterManagerResponseType, ActionCenterManagerActionThemeKey } from './pilot-learning'

export type ActionCenterEntryStage = 'attention' | 'candidate' | 'active'

export type ActionCenterRouteStatus =
  | 'open-verzoek'
  | 'te-bespreken'
  | 'in-uitvoering'
  | 'geblokkeerd'
  | 'afgerond'
  | 'gestopt'

export type ActionCenterAggregatedRouteStatus =
  | 'open-verzoek'
  | 'in-uitvoering'
  | 'reviewbaar'
  | 'afgerond'
  | 'gestopt'

export type ActionCenterReviewOutcome =
  | 'geen-uitkomst'
  | 'doorgaan'
  | 'bijstellen'
  | 'opschalen'
  | 'afronden'
  | 'stoppen'

export type ActionCenterDecision =
  | 'doorgaan'
  | 'bijstellen'
  | 'afronden'
  | 'stoppen'

export interface ActionCenterDecisionRecord {
  decisionEntryId: string
  sourceRouteId: string
  decision: ActionCenterDecision
  decisionReason: string | null
  nextCheck: string | null
  decisionRecordedAt: string
  reviewCompletedAt: string | null
  currentStepSnapshot?: string | null
  nextStepSnapshot?: string | null
  expectedEffectSnapshot?: string | null
  observationSnapshot?: string | null
}

export interface ActionCenterRouteContract {
  routeId: string
  campaignId: string
  entryStage: ActionCenterEntryStage
  routeOpenedAt: string | null
  ownerAssignedAt: string | null
  routeStatus: ActionCenterRouteStatus | null
  reviewOutcome: ActionCenterReviewOutcome
  reviewCompletedAt: string | null
  outcomeRecordedAt: string | null
  outcomeSummary: string | null
  intervention: string | null
  owner: string | null
  expectedEffect: string | null
  reviewScheduledFor: string | null
  reviewReason: string | null
  managerResponseType: ActionCenterManagerResponseType | null
  managerResponseNote: string | null
  primaryActionThemeKey: ActionCenterManagerActionThemeKey | null
  followThroughMode: 'open_request' | 'bounded_response' | 'primary_action' | 'legacy_action' | 'none'
  blockedBy: Exclude<DeliveryExceptionStatus, 'none'> | null
}

interface ActionCenterRouteActionSummaryInput {
  actionId: string
  status: 'open' | 'in_review' | 'afgerond' | 'gestopt'
  reviewScheduledFor: string | null
}

const REVIEW_OUTCOMES = new Set<ActionCenterReviewOutcome>([
  'geen-uitkomst',
  'doorgaan',
  'bijstellen',
  'opschalen',
  'afronden',
  'stoppen',
])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export function buildActionCenterRouteId(campaignId: string, scopeValue: string) {
  return `${campaignId}::${scopeValue}`
}

function getRouteOpenedAt(context: LiveActionCenterCampaignContext) {
  return (
    normalizeText(context.assignedManager?.assignedAt) ??
    normalizeText(context.deliveryRecord?.first_management_use_confirmed_at)
  )
}

function getOwner(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.assignedManager?.displayName)
}

function getOwnerAssignedAt(context: LiveActionCenterCampaignContext, routeOpenedAt: string | null, owner: string | null) {
  if (!routeOpenedAt || !owner) return null
  return normalizeText(context.assignedManager?.assignedAt) ?? routeOpenedAt
}

function getIntervention(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.managerResponse?.primary_action_text) ?? normalizeText(context.learningDossier?.first_action_taken)
}

function getExpectedEffect(context: LiveActionCenterCampaignContext) {
  return (
    normalizeText(context.managerResponse?.primary_action_expected_effect) ??
    normalizeText(context.learningDossier?.expected_first_value)
  )
}

function getReviewReason(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.first_management_value)
}

function getReviewScheduledFor(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.managerResponse?.review_scheduled_for) ?? normalizeText(context.learningDossier?.review_moment)
}

function getOutcomeSummary(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.case_public_summary) ?? normalizeText(context.learningDossier?.adoption_outcome)
}

function getLearningCheckpoint(context: LiveActionCenterCampaignContext, key: PilotLearningCheckpoint['checkpoint_key']) {
  return context.learningCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === key) ?? null
}

function isCompletedReviewCheckpoint(checkpoint: PilotLearningCheckpoint | null) {
  if (!checkpoint) return false

  return (
    checkpoint.status === 'bevestigd' ||
    checkpoint.status === 'uitgevoerd' ||
    checkpoint.status === 'verworpen'
  )
}

function hasCandidateTruth(context: LiveActionCenterCampaignContext) {
  return Boolean(
    getOwner(context) ??
      normalizeText(context.managerResponse?.response_note) ??
      getIntervention(context) ??
      getExpectedEffect(context) ??
      getReviewScheduledFor(context) ??
      getReviewReason(context),
  )
}

function getManagerResponseType(context: LiveActionCenterCampaignContext) {
  return context.managerResponse?.response_type ?? null
}

function getManagerResponseNote(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.managerResponse?.response_note)
}

function getPrimaryActionThemeKey(context: LiveActionCenterCampaignContext) {
  return context.managerResponse?.primary_action_theme_key ?? null
}

function getFollowThroughMode(context: LiveActionCenterCampaignContext) {
  if (hasPrimaryManagerAction(context.managerResponse)) {
    return 'primary_action' as const
  }

  if (context.managerResponse) {
    return 'bounded_response' as const
  }

  if (
    normalizeText(context.learningDossier?.first_action_taken) ||
    normalizeText(context.learningDossier?.expected_first_value) ||
    normalizeText(context.learningDossier?.review_moment) ||
    normalizeText(context.learningDossier?.first_management_value)
  ) {
    return 'legacy_action' as const
  }

  if (getOwner(context)) {
    return 'open_request' as const
  }

  return 'none' as const
}

function getReviewOutcome(context: LiveActionCenterCampaignContext): ActionCenterReviewOutcome {
  const rawOutcome = normalizeText(context.learningDossier?.management_action_outcome)

  if (rawOutcome && REVIEW_OUTCOMES.has(rawOutcome as ActionCenterReviewOutcome)) {
    return rawOutcome as ActionCenterReviewOutcome
  }

  return 'geen-uitkomst'
}

export function classifyActionCenterEntryStage(context: LiveActionCenterCampaignContext): ActionCenterEntryStage {
  if (getRouteOpenedAt(context)) {
    return 'active'
  }

  if (hasCandidateTruth(context)) {
    return 'candidate'
  }

  return 'attention'
}

export function projectActionCenterRoute(context: LiveActionCenterCampaignContext): ActionCenterRouteContract {
  const routeId = buildActionCenterRouteId(context.campaign.id, context.scopeValue)
  const routeOpenedAt = getRouteOpenedAt(context)
  const entryStage = classifyActionCenterEntryStage(context)
  const intervention = getIntervention(context)
  const owner = getOwner(context)
  const ownerAssignedAt = getOwnerAssignedAt(context, routeOpenedAt, owner)
  const expectedEffect = getExpectedEffect(context)
  const reviewScheduledFor = getReviewScheduledFor(context)
  const reviewReason = getReviewReason(context)
  const reviewOutcome = getReviewOutcome(context)
  const managerResponseType = getManagerResponseType(context)
  const managerResponseNote = getManagerResponseNote(context)
  const primaryActionThemeKey = getPrimaryActionThemeKey(context)
  const followThroughMode = getFollowThroughMode(context)
  const followUpReviewCheckpoint = getLearningCheckpoint(context, 'follow_up_review')
  const reviewCompletedAt =
    reviewOutcome !== 'geen-uitkomst' && isCompletedReviewCheckpoint(followUpReviewCheckpoint)
      ? normalizeText(followUpReviewCheckpoint?.updated_at)
      : null
  const outcomeSummary = getOutcomeSummary(context)
  const outcomeRecordedAt = reviewCompletedAt && outcomeSummary ? reviewCompletedAt : null
  const blockedBy =
    context.deliveryRecord?.exception_status && context.deliveryRecord.exception_status !== 'none'
      ? context.deliveryRecord.exception_status
      : null

  let routeStatus: ActionCenterRouteStatus | null = null

  if (entryStage === 'active') {
    if (context.learningDossier?.triage_status === 'uitgevoerd') {
      routeStatus = 'afgerond'
    } else if (context.learningDossier?.triage_status === 'verworpen') {
      routeStatus = 'gestopt'
    } else if (blockedBy) {
      routeStatus = 'geblokkeerd'
    } else if (followThroughMode === 'open_request') {
      routeStatus = 'open-verzoek'
    } else if (intervention && owner && expectedEffect && reviewScheduledFor) {
      routeStatus = 'in-uitvoering'
    } else {
      routeStatus = 'te-bespreken'
    }
  }

  return {
    routeId,
    campaignId: context.campaign.id,
    entryStage,
    routeOpenedAt,
    ownerAssignedAt,
    routeStatus,
    reviewOutcome,
    reviewCompletedAt,
    outcomeRecordedAt,
    outcomeSummary,
    intervention,
    owner,
    expectedEffect,
    reviewScheduledFor,
    reviewReason,
    managerResponseType,
    managerResponseNote,
    primaryActionThemeKey,
    followThroughMode,
    blockedBy,
  }
}

export function summarizeActionCenterRouteActions(
  actions: ActionCenterRouteActionSummaryInput[],
  today = getTodayIsoDate(),
): {
  routeStatus: ActionCenterAggregatedRouteStatus
  openActionCount: number
  nextReviewScheduledFor: string | null
} {
  const openActions = actions.filter((action) => action.status === 'open' || action.status === 'in_review')
  const nextReviewScheduledFor =
    openActions
      .map((action) => normalizeText(action.reviewScheduledFor))
      .filter((reviewScheduledFor): reviewScheduledFor is string => Boolean(reviewScheduledFor))
      .sort((left, right) => left.localeCompare(right))[0] ?? null

  if (actions.length === 0) {
    return {
      routeStatus: 'open-verzoek',
      openActionCount: 0,
      nextReviewScheduledFor: null,
    }
  }

  const hasReviewPressure = actions.some(
    (action) =>
      action.status === 'in_review' ||
      (action.status === 'open' &&
        Boolean(action.reviewScheduledFor) &&
        action.reviewScheduledFor <= today),
  )

  if (hasReviewPressure) {
    return {
      routeStatus: 'reviewbaar',
      openActionCount: openActions.length,
      nextReviewScheduledFor,
    }
  }

  if (openActions.length > 0) {
    return {
      routeStatus: 'in-uitvoering',
      openActionCount: openActions.length,
      nextReviewScheduledFor,
    }
  }

  if (actions.some((action) => action.status === 'afgerond')) {
    return {
      routeStatus: 'afgerond',
      openActionCount: 0,
      nextReviewScheduledFor: null,
    }
  }

  return {
    routeStatus: 'gestopt',
    openActionCount: 0,
    nextReviewScheduledFor: null,
  }
}
