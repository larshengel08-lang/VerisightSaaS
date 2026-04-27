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
