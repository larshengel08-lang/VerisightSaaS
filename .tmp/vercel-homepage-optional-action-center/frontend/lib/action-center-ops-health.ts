import type { SuiteTelemetryEventRow, SuiteTelemetryEventType } from '@/lib/telemetry/events'

const ACTION_CENTER_CRITICAL_EVENT_TYPES = [
  'action_center_route_opened',
  'action_center_owner_assigned',
  'action_center_review_scheduled',
  'action_center_closeout_recorded',
] as const satisfies readonly SuiteTelemetryEventType[]

export type ActionCenterCriticalEventType = (typeof ACTION_CENTER_CRITICAL_EVENT_TYPES)[number]

export interface ActionCenterOpsHealthSnapshot {
  totalEventCount: number
  latestEventAt: string | null
  coveredEventTypes: ActionCenterCriticalEventType[]
  missingEventTypes: ActionCenterCriticalEventType[]
  routeOpenedCount: number
  ownerAssignedCount: number
  reviewScheduledCount: number
  closeoutRecordedCount: number
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

export function summarizeActionCenterOpsHealth(rows: SuiteTelemetryEventRow[]): ActionCenterOpsHealthSnapshot {
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

  return {
    totalEventCount: actionCenterRows.length,
    latestEventAt,
    coveredEventTypes,
    missingEventTypes,
    routeOpenedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_route_opened').length,
    ownerAssignedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_owner_assigned').length,
    reviewScheduledCount: actionCenterRows.filter((row) => row.eventType === 'action_center_review_scheduled').length,
    closeoutRecordedCount: actionCenterRows.filter((row) => row.eventType === 'action_center_closeout_recorded').length,
  }
}
