import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/telemetry/store', () => ({
  insertSuiteTelemetryEvents: async (events: unknown[]) =>
    events.map((event, index) => ({
      id: `evt_${index + 1}`,
      ...(event as Record<string, unknown>),
      createdAt: '2026-04-27T10:00:00.000Z',
    })),
}))

import { POST } from './route'

describe('internal telemetry route', () => {
  it('rejects incomplete telemetry payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/internal/telemetry', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    expect(response.status).toBe(400)
  })

  it('accepts a bounded batch payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/internal/telemetry', {
        method: 'POST',
        body: JSON.stringify({
          events: [
            {
              eventType: 'first_value_confirmed',
              orgId: 'org_1',
              campaignId: 'cmp_1',
              payload: { source: 'seed' },
            },
          ],
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.inserted).toBe(1)
  })
})
