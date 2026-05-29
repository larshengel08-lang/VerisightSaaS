import type { SuiteTelemetryEventRow, SuiteTelemetryEventType } from '@/lib/telemetry/events'

const ACTION_CENTER_CRITICAL_EVENT_TYPES = [
  'action_center_route_opened',
  'action_center_owner_assigned',
  'action_center_review_scheduled',
  'action_center_closeout_recorded',
] as const satisfies readonly SuiteTelemetryEventType[]

export type ActionCenterCriticalEventType = (typeof ACTION_CENTER_CRITICAL_EVENT_TYPES)[number]

const ACTION_CENTER_ADMIN_CONTROL_TYPES = [
  'route_activation_approvals',
  'support_access_logging',
] as const

export type ActionCenterAdminControlType =
  (typeof ACTION_CENTER_ADMIN_CONTROL_TYPES)[number]

export interface ActionCenterAdminReadback {
  routeActivationApprovals: Array<{
    routeFamily: string
    approvalStatus: string
    scopeValue: string
    createdAt: string
  }>
  supportAccessEvents: Array<{
    accessKind: string
    accessReason: string
    createdAt: string
  }>
}

export interface ActionCenterOpsHealthSnapshot {
  totalEventCount: number
  latestEventAt: string | null
  coveredEventTypes: ActionCenterCriticalEventType[]
  missingEventTypes: ActionCenterCriticalEventType[]
  routeOpenedCount: number
  ownerAssignedCount: number
  reviewScheduledCount: number
  closeoutRecordedCount: number
  routeActivationApprovalCount: number
  supportAccessEventCount: number
  coveredControlTypes: ActionCenterAdminControlType[]
  missingControlTypes: ActionCenterAdminControlType[]
}

export function getActionCenterOpsEventLabel(eventType: ActionCenterCriticalEventType) {
  switch (eventType) {
    case 'action_center_route_opened':
      return 'Route geopend'
    case 'action_center_owner_assigned':
      return 'Manager toegewezen'
    case 'action_center_review_scheduled':
      return 'Review gepland'
    case 'action_center_closeout_recorded':
      return 'Closeout vastgelegd'
  }
}

export function getActionCenterAdminControlLabel(controlType: ActionCenterAdminControlType) {
  switch (controlType) {
    case 'route_activation_approvals':
      return 'Route activation approvals'
    case 'support_access_logging':
      return 'Support access logging'
  }
}

export function summarizeActionCenterOpsHealth(
  rows: SuiteTelemetryEventRow[],
  adminReadback?: ActionCenterAdminReadback,
): ActionCenterOpsHealthSnapshot {
  const actionCenterRows = rows.filter((row) =>
    ACTION_CENTER_CRITICAL_EVENT_TYPES.includes(row.eventType as ActionCenterCriticalEventType),
  )
  const coveredEventTypes = ACTION_CENTER_CRITICAL_EVENT_TYPES.filter((eventType) =>
    actionCenterRows.some((row) => row.eventType === eventType),
  )
  const missingEventTypes = ACTION_CENTER_CRITICAL_EVENT_TYPES.filter(
    (eventType) => !coveredEventTypes.includes(eventType),
  )
  const latestEventAt =
    actionCenterRows
      .map((row) => row.createdAt)
      .sort((left, right) => right.localeCompare(left))[0] ?? null
  const routeActivationApprovalCount = adminReadback?.routeActivationApprovals.length ?? 0
  const supportAccessEventCount = adminReadback?.supportAccessEvents.length ?? 0
  const coveredControlTypes = ACTION_CENTER_ADMIN_CONTROL_TYPES.filter((controlType) => {
    if (controlType === 'route_activation_approvals') {
      return routeActivationApprovalCount > 0
    }

    return supportAccessEventCount > 0
  })
  const missingControlTypes = ACTION_CENTER_ADMIN_CONTROL_TYPES.filter(
    (controlType) => !coveredControlTypes.includes(controlType),
  )

  return {
    totalEventCount: actionCenterRows.length,
    latestEventAt,
    coveredEventTypes,
    missingEventTypes,
    routeOpenedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_route_opened').length,
    ownerAssignedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_owner_assigned').length,
    reviewScheduledCount: actionCenterRows.filter((row) => row.eventType === 'action_center_review_scheduled').length,
    closeoutRecordedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_closeout_recorded').length,
    routeActivationApprovalCount,
    supportAccessEventCount,
    coveredControlTypes,
    missingControlTypes,
  }
}
