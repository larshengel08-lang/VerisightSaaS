import type { DeliveryExceptionStatus } from '@/lib/ops-delivery'
import type { LiveActionCenterCampaignContext } from './action-center-live'
import type { PilotLearningCheckpoint } from './pilot-learning'

export type ActionCenterEntryStage = 'attention' | 'candidate' | 'active'

export type ActionCenterRouteStatus =
  | 'te-bespreken'
  | 'in-uitvoering'
  | 'geblokkeerd'
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
  blockedBy: Exclude<DeliveryExceptionStatus, 'none'> | null
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

function getRouteOpenedAt(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.deliveryRecord?.first_management_use_confirmed_at)
}

function getOwner(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.assignedManager?.displayName)
}

function getOwnerAssignedAt(context: LiveActionCenterCampaignContext, routeOpenedAt: string | null, owner: string | null) {
  if (!routeOpenedAt || !owner) return null
  return normalizeText(context.assignedManager?.assignedAt)
}

function getIntervention(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.first_action_taken)
}

function getExpectedEffect(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.expected_first_value)
}

function getReviewReason(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.first_management_value)
}

function getReviewScheduledFor(context: LiveActionCenterCampaignContext) {
  return normalizeText(context.learningDossier?.review_moment)
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
      getIntervention(context) ??
      getExpectedEffect(context) ??
      getReviewScheduledFor(context) ??
      getReviewReason(context),
  )
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
  const routeOpenedAt = getRouteOpenedAt(context)
  const entryStage = classifyActionCenterEntryStage(context)
  const intervention = getIntervention(context)
  const owner = getOwner(context)
  const ownerAssignedAt = getOwnerAssignedAt(context, routeOpenedAt, owner)
  const expectedEffect = getExpectedEffect(context)
  const reviewScheduledFor = getReviewScheduledFor(context)
  const reviewReason = getReviewReason(context)
  const reviewOutcome = getReviewOutcome(context)
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
    } else if (intervention && owner && expectedEffect && reviewScheduledFor) {
      routeStatus = 'in-uitvoering'
    } else {
      routeStatus = 'te-bespreken'
    }
  }

  return {
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
    blockedBy,
  }
}
