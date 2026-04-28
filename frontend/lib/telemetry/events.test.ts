import { describe, expect, it } from 'vitest'
import {
  buildSuiteTelemetryEvent,
  countSuiteTelemetryEvents,
  countSuiteTelemetryEventRows,
  getSuiteTelemetryEventLabel,
  isSuiteTelemetryEventType,
} from '@/lib/telemetry/events'

describe('suite telemetry event builder', () => {
  it('normalizes a bounded telemetry payload', () => {
    const event = buildSuiteTelemetryEvent('first_value_confirmed', {
      orgId: 'org_123',
      campaignId: 'cmp_123',
      actorId: 'user_123',
    })
    expect(event.eventType).toBe('first_value_confirmed')
    expect(event.orgId).toBe('org_123')
  })

  it('summarizes bounded event counts', () => {
    const counts = countSuiteTelemetryEvents([
      buildSuiteTelemetryEvent('owner_access_confirmed', {}),
      buildSuiteTelemetryEvent('owner_access_confirmed', {}),
      buildSuiteTelemetryEvent('manager_denied_insights', {}),
    ])
    expect(counts.owner_access_confirmed).toBe(2)
    expect(counts.manager_denied_insights).toBe(1)
  })

  it('validates and labels live telemetry rows', () => {
    expect(isSuiteTelemetryEventType('first_value_confirmed')).toBe(true)
    expect(isSuiteTelemetryEventType('action_center_route_opened')).toBe(true)
    expect(isSuiteTelemetryEventType('action_center_owner_assigned')).toBe(true)
    expect(isSuiteTelemetryEventType('action_center_review_completed')).toBe(true)
    expect(isSuiteTelemetryEventType('action_center_outcome_recorded')).toBe(true)
    expect(isSuiteTelemetryEventType('unexpected_event')).toBe(false)
    expect(getSuiteTelemetryEventLabel('action_center_route_opened')).toContain('route opened')
    expect(getSuiteTelemetryEventLabel('action_center_owner_assigned')).toContain('owner assigned')
    expect(getSuiteTelemetryEventLabel('action_center_review_completed')).toContain('review completed')
    expect(getSuiteTelemetryEventLabel('action_center_outcome_recorded')).toContain('outcome recorded')
    expect(getSuiteTelemetryEventLabel('action_center_closeout_recorded')).toContain('closeout')
    expect(
      countSuiteTelemetryEventRows([
        {
          id: 'evt_1',
          eventType: 'first_value_confirmed',
          orgId: 'org_1',
          campaignId: 'cmp_1',
          actorId: null,
          payload: {},
          createdAt: '2026-04-27T10:00:00.000Z',
        },
        {
          id: 'evt_2',
          eventType: 'action_center_route_opened',
          orgId: 'org_1',
          campaignId: 'cmp_1',
          actorId: null,
          payload: {},
          createdAt: '2026-04-27T10:05:00.000Z',
        },
      ]),
    ).toMatchObject({ first_value_confirmed: 1, action_center_route_opened: 1 })
  })
})
