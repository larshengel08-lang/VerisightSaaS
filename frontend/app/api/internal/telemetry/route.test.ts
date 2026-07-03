import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/telemetry/store', () => ({
  insertSuiteTelemetryEvents: async (events: unknown[]) =>
    events.map((event, index) => ({
      id: `evt_${index + 1}`,
      ...(event as Record<string, unknown>),
      createdAt: '2026-04-27T10:00:00.000Z',
    })),
}))

import { POST } from './route'

const ADMIN_TOKEN = 'test-admin-token'

function authedRequest(body: unknown): Request {
  return new Request('http://localhost/api/internal/telemetry', {
    method: 'POST',
    headers: { 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify(body),
  })
}

describe('internal telemetry route', () => {
  beforeEach(() => {
    process.env.INTERNAL_ADMIN_TOKEN = ADMIN_TOKEN
  })

  afterEach(() => {
    delete process.env.INTERNAL_ADMIN_TOKEN
  })

  it('rejects requests without a valid admin token', async () => {
    const response = await POST(
      new Request('http://localhost/api/internal/telemetry', {
        method: 'POST',
        body: JSON.stringify({
          events: [{ eventType: 'first_value_confirmed', orgId: 'org_1' }],
        }),
      }),
    )
    expect(response.status).toBe(401)
  })

  it('rejects requests with a wrong admin token', async () => {
    const response = await POST(
      new Request('http://localhost/api/internal/telemetry', {
        method: 'POST',
        headers: { 'x-admin-token': 'wrong-token' },
        body: JSON.stringify({
          events: [{ eventType: 'first_value_confirmed', orgId: 'org_1' }],
        }),
      }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 500 when the admin token is not configured', async () => {
    delete process.env.INTERNAL_ADMIN_TOKEN
    const response = await POST(authedRequest({ events: [] }))
    expect(response.status).toBe(500)
  })

  it('rejects incomplete telemetry payloads', async () => {
    const response = await POST(authedRequest({}))
    expect(response.status).toBe(400)
  })

  it('accepts a bounded batch payload', async () => {
    const response = await POST(
      authedRequest({
        events: [
          {
            eventType: 'first_value_confirmed',
            orgId: 'org_1',
            campaignId: 'cmp_1',
            payload: { source: 'seed' },
          },
        ],
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.inserted).toBe(1)
  })
})
