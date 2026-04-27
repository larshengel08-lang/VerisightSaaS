export type SuiteTelemetryEventType =
  | 'owner_access_confirmed'
  | 'first_value_confirmed'
  | 'first_management_use_confirmed'
  | 'manager_denied_insights'
  | 'action_center_review_scheduled'
  | 'action_center_closeout_recorded'

export interface SuiteTelemetryEvent {
  eventType: SuiteTelemetryEventType
  orgId: string | null
  campaignId: string | null
  actorId: string | null
  payload: Record<string, unknown>
}

export interface SuiteTelemetryEventRow {
  id: string
  eventType: SuiteTelemetryEventType
  orgId: string | null
  campaignId: string | null
  actorId: string | null
  payload: Record<string, unknown>
  createdAt: string
}

export function isSuiteTelemetryEventType(value: string): value is SuiteTelemetryEventType {
  return (
    value === 'owner_access_confirmed' ||
    value === 'first_value_confirmed' ||
    value === 'first_management_use_confirmed' ||
    value === 'manager_denied_insights' ||
    value === 'action_center_review_scheduled' ||
    value === 'action_center_closeout_recorded'
  )
}

export function buildSuiteTelemetryEvent(
  eventType: SuiteTelemetryEventType,
  args: { orgId?: string | null; campaignId?: string | null; actorId?: string | null; payload?: Record<string, unknown> },
): SuiteTelemetryEvent {
  return {
    eventType,
    orgId: args.orgId ?? null,
    campaignId: args.campaignId ?? null,
    actorId: args.actorId ?? null,
    payload: args.payload ?? {},
  }
}

export function countSuiteTelemetryEvents(events: SuiteTelemetryEvent[]) {
  return events.reduce<Record<SuiteTelemetryEventType, number>>(
    (acc, event) => {
      acc[event.eventType] += 1
      return acc
    },
    {
      owner_access_confirmed: 0,
      first_value_confirmed: 0,
      first_management_use_confirmed: 0,
      manager_denied_insights: 0,
      action_center_review_scheduled: 0,
      action_center_closeout_recorded: 0,
    },
  )
}

export function countSuiteTelemetryEventRows(rows: SuiteTelemetryEventRow[]) {
  return countSuiteTelemetryEvents(rows)
}

export function getSuiteTelemetryEventLabel(eventType: SuiteTelemetryEventType) {
  switch (eventType) {
    case 'owner_access_confirmed':
      return 'Owner access confirmed'
    case 'first_value_confirmed':
      return 'First value confirmed'
    case 'first_management_use_confirmed':
      return 'First management use confirmed'
    case 'manager_denied_insights':
      return 'Manager denied insights'
    case 'action_center_review_scheduled':
      return 'Action Center review scheduled'
    case 'action_center_closeout_recorded':
      return 'Action Center closeout recorded'
    default:
      return eventType
  }
}
