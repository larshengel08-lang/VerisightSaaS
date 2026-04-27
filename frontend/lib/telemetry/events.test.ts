import { describe, expect, it } from 'vitest'
import { buildSuiteTelemetryEvent, countSuiteTelemetryEvents } from '@/lib/telemetry/events'

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
})
