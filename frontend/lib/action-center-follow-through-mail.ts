import type {
  ActionCenterAggregatedRouteStatus,
  ActionCenterReviewOutcome,
  ActionCenterRouteStatus,
} from './action-center-route-contract'
import { isActionCenterReviewRhythmSupportedScanType } from './action-center-review-rhythm'

export const ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES = [
  'assignment_created',
  'review_upcoming',
  'review_overdue',
  'follow_up_open_after_review',
] as const

export type ActionCenterFollowThroughTriggerType =
  (typeof ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES)[number]

export type ActionCenterFollowThroughMailTriggerType = ActionCenterFollowThroughTriggerType

export const ACTION_CENTER_FOLLOW_THROUGH_RECIPIENT_ROLES = ['manager', 'hr_oversight'] as const

export type ActionCenterFollowThroughRecipientRole =
  (typeof ACTION_CENTER_FOLLOW_THROUGH_RECIPIENT_ROLES)[number]

export type ActionCenterFollowThroughMailRecipientRole = ActionCenterFollowThroughRecipientRole

export const ACTION_CENTER_FOLLOW_THROUGH_DELIVERY_STATUSES = ['sent', 'suppressed', 'failed'] as const

export type ActionCenterFollowThroughDeliveryStatus =
  (typeof ACTION_CENTER_FOLLOW_THROUGH_DELIVERY_STATUSES)[number]

export const ACTION_CENTER_FOLLOW_THROUGH_MAIL_SUPPRESSION_REASONS = [
  'reminders-disabled',
  'route-closed',
  'review-completed',
  'route-resolved',
  'missing-recipient',
  'unsupported-route',
  'stale-schedule',
  'duplicate',
] as const

export type ActionCenterFollowThroughMailSuppressionReason =
  (typeof ACTION_CENTER_FOLLOW_THROUGH_MAIL_SUPPRESSION_REASONS)[number]

export interface ActionCenterFollowThroughMailLedgerRecord {
  orgId: string
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  scanType: 'exit'
  triggerType: ActionCenterFollowThroughTriggerType
  recipientRole: ActionCenterFollowThroughRecipientRole
  recipientEmail: string
  sourceMarker: string
  dedupeKey: string
  deliveryStatus: ActionCenterFollowThroughDeliveryStatus
  suppressionReason: ActionCenterFollowThroughMailSuppressionReason | null
  providerMessageId: string | null
  sentAt: string | null
}

type ActionCenterFollowThroughMailRouteStatus =
  | ActionCenterRouteStatus
  | ActionCenterAggregatedRouteStatus
  | null
  | undefined

export interface BuildActionCenterFollowThroughMailDedupeKeyArgs {
  routeId: string
  triggerType: ActionCenterFollowThroughTriggerType
  recipientEmail: string
  sourceMarker: string
}

export interface GetActionCenterFollowThroughMailSuppressionReasonArgs {
  triggerType: ActionCenterFollowThroughTriggerType
  remindersEnabled: boolean
  routeStatus: ActionCenterFollowThroughMailRouteStatus
  reviewCompletedAt: string | null
  reviewScheduledFor: string | null
  reviewOutcome: ActionCenterReviewOutcome
  scanType?: string | null
  recipientEmail?: string | null
  hasFollowUpTarget?: boolean
  isDuplicate?: boolean
  isStaleSchedule?: boolean
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hasText(value: string | null | undefined) {
  return (value?.trim().length ?? 0) > 0
}

export function buildActionCenterFollowThroughMailDedupeKey(
  args: BuildActionCenterFollowThroughMailDedupeKeyArgs,
) {
  return [
    args.routeId,
    args.triggerType,
    normalizeEmail(args.recipientEmail),
    args.sourceMarker.trim(),
  ].join('::')
}

export function isActionCenterFollowThroughMailRouteClosed(routeStatus: ActionCenterFollowThroughMailRouteStatus) {
  return routeStatus === 'afgerond' || routeStatus === 'gestopt'
}

export function isActionCenterFollowThroughMailRouteResolved(args: {
  routeStatus: ActionCenterFollowThroughMailRouteStatus
  reviewOutcome: ActionCenterReviewOutcome
  hasFollowUpTarget?: boolean
}) {
  if (isActionCenterFollowThroughMailRouteClosed(args.routeStatus)) {
    return true
  }

  return (
    args.reviewOutcome === 'afronden' ||
    args.reviewOutcome === 'stoppen' ||
    args.hasFollowUpTarget === true
  )
}

export function getActionCenterFollowThroughMailSuppressionReason(
  args: GetActionCenterFollowThroughMailSuppressionReasonArgs,
): ActionCenterFollowThroughMailSuppressionReason | null {
  if (args.scanType && !isActionCenterReviewRhythmSupportedScanType(args.scanType)) {
    return 'unsupported-route'
  }

  if (args.isDuplicate) {
    return 'duplicate'
  }

  if (args.isStaleSchedule) {
    return 'stale-schedule'
  }

  if (args.recipientEmail !== undefined && !hasText(args.recipientEmail)) {
    return 'missing-recipient'
  }

  if (args.triggerType === 'review_upcoming' && !args.remindersEnabled) {
    return 'reminders-disabled'
  }

  if (args.triggerType === 'follow_up_open_after_review') {
    if (
      isActionCenterFollowThroughMailRouteResolved({
        routeStatus: args.routeStatus,
        reviewOutcome: args.reviewOutcome,
        hasFollowUpTarget: args.hasFollowUpTarget,
      })
    ) {
      return 'route-resolved'
    }

    return null
  }

  if (isActionCenterFollowThroughMailRouteClosed(args.routeStatus)) {
    return 'route-closed'
  }

  if (hasText(args.reviewCompletedAt)) {
    return 'review-completed'
  }

  if (
    (args.triggerType === 'review_upcoming' || args.triggerType === 'review_overdue') &&
    !hasText(args.reviewScheduledFor)
  ) {
    return 'stale-schedule'
  }

  return null
}
