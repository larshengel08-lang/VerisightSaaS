import { describe, expect, it, vi } from 'vitest'
import {
  cancelActionCenterGraphEvent,
  createActionCenterGraphEvent,
  loadActionCenterGraphCapability,
  requestActionCenterGraphAccessToken,
  updateActionCenterGraphEvent,
} from './action-center-graph-client'

function createJsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

describe('action center graph capability loader', () => {
  it('enables Graph only when the org is allowlisted and the client config is complete', () => {
    expect(
      loadActionCenterGraphCapability({
        orgId: 'org-1',
        scanType: 'exit',
        env: {
          tenantId: 'tenant-1',
          clientId: 'client-1',
          clientSecret: 'secret-1',
          organizerEmail: 'hr@verisight.nl',
          organizerUserId: 'hr-organizer@tenant.example',
          enabledOrgIds: ['org-1'],
        },
      }),
    ).toEqual({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })
  })

  it('falls back when the org is allowlisted but Graph client config is incomplete', () => {
    expect(
      loadActionCenterGraphCapability({
        orgId: 'org-1',
        scanType: 'exit',
        env: {
          tenantId: '',
          clientId: 'client-1',
          clientSecret: '',
          organizerEmail: 'hr@verisight.nl',
          organizerUserId: 'hr-organizer@tenant.example',
          enabledOrgIds: ['org-1'],
        },
      }),
    ).toEqual({
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-client-config',
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: null,
    })
  })
})

describe('action center graph client', () => {
  it('requests an application token with the .default scope', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      createJsonResponse({
        access_token: 'graph-token',
      }),
    )

    const result = await requestActionCenterGraphAccessToken({
      tenantId: 'tenant-1',
      clientId: 'client-1',
      clientSecret: 'secret-1',
    }, { fetchImpl })

    expect(result).toEqual({
      ok: true,
      accessToken: 'graph-token',
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token')
    const requestInit = fetchImpl.mock.calls[0]?.[1] as RequestInit
    expect(requestInit.method).toBe('POST')
    expect(String(requestInit.body)).toContain('grant_type=client_credentials')
    expect(String(requestInit.body)).toContain('scope=https%3A%2F%2Fgraph.microsoft.com%2F.default')
  })

  it('creates a Graph event in the organizer mailbox with the canonical payload shape', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(
        createJsonResponse({
          id: 'graph-event-1',
          iCalUId: 'ical-1',
        }, { status: 201 }),
      )

    const result = await createActionCenterGraphEvent(
      {
        tenantId: 'tenant-1',
        clientId: 'client-1',
        clientSecret: 'secret-1',
        organizerUserId: 'hr-organizer@tenant.example',
      },
      {
        subject: 'Reviewmoment ExitScan / Operations',
        bodyHtml: '<p>Open Action Center.</p>',
        start: { dateTime: '2026-05-20T09:00:00', timeZone: 'W. Europe Standard Time' },
        end: { dateTime: '2026-05-20T09:30:00', timeZone: 'W. Europe Standard Time' },
        attendees: [{ email: 'manager@example.com', name: 'Manager Operations' }],
        allowNewTimeProposals: false,
        transactionId: 'route-1::revision-3',
      },
      { fetchImpl },
    )

    expect(result).toEqual({
      ok: true,
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
    })

    const createCall = fetchImpl.mock.calls[1]
    expect(createCall?.[0]).toBe('https://graph.microsoft.com/v1.0/users/hr-organizer%40tenant.example/events')
    const createInit = createCall?.[1] as RequestInit
    expect(createInit.method).toBe('POST')
    expect((createInit.headers as Record<string, string>).Authorization).toBe('Bearer graph-token')
    expect(String(createInit.body)).toContain('"subject":"Reviewmoment ExitScan / Operations"')
    expect(String(createInit.body)).toContain('"allowNewTimeProposals":false')
    expect(String(createInit.body)).toContain('"transactionId":"route-1::revision-3"')
  })

  it('updates an existing Graph event via PATCH in the organizer mailbox', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(createJsonResponse({ id: 'graph-event-1' }))

    const result = await updateActionCenterGraphEvent(
      {
        tenantId: 'tenant-1',
        clientId: 'client-1',
        clientSecret: 'secret-1',
        organizerUserId: 'hr-organizer@tenant.example',
      },
      {
        eventId: 'graph-event-1',
        subject: 'Reviewmoment ExitScan / Operations',
        bodyHtml: '<p>Bijgewerkt reviewmoment.</p>',
        start: { dateTime: '2026-05-27T09:00:00', timeZone: 'W. Europe Standard Time' },
        end: { dateTime: '2026-05-27T09:30:00', timeZone: 'W. Europe Standard Time' },
      },
      { fetchImpl },
    )

    expect(result).toEqual({
      ok: true,
      eventId: 'graph-event-1',
    })

    const patchCall = fetchImpl.mock.calls[1]
    expect(patchCall?.[0]).toBe('https://graph.microsoft.com/v1.0/users/hr-organizer%40tenant.example/events/graph-event-1')
    const patchInit = patchCall?.[1] as RequestInit
    expect(patchInit.method).toBe('PATCH')
    expect(String(patchInit.body)).toContain('"dateTime":"2026-05-27T09:00:00"')
  })

  it('cancels an existing Graph event by posting a comment to the cancel endpoint', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    const result = await cancelActionCenterGraphEvent(
      {
        tenantId: 'tenant-1',
        clientId: 'client-1',
        clientSecret: 'secret-1',
        organizerUserId: 'hr-organizer@tenant.example',
      },
      {
        eventId: 'graph-event-1',
        comment: 'Reviewmoment verplaatst in Action Center.',
      },
      { fetchImpl },
    )

    expect(result).toEqual({
      ok: true,
      eventId: 'graph-event-1',
    })

    const cancelCall = fetchImpl.mock.calls[1]
    expect(cancelCall?.[0]).toBe('https://graph.microsoft.com/v1.0/users/hr-organizer%40tenant.example/events/graph-event-1/cancel')
    const cancelInit = cancelCall?.[1] as RequestInit
    expect(cancelInit.method).toBe('POST')
    expect(String(cancelInit.body)).toContain('"Comment":"Reviewmoment verplaatst in Action Center."')
  })

  it('fails closed when token or network calls fail', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'))

    const result = await createActionCenterGraphEvent(
      {
        tenantId: 'tenant-1',
        clientId: 'client-1',
        clientSecret: 'secret-1',
        organizerUserId: 'hr-organizer@tenant.example',
      },
      {
        subject: 'Reviewmoment ExitScan / Operations',
        bodyHtml: '<p>Open Action Center.</p>',
        start: { dateTime: '2026-05-20T09:00:00', timeZone: 'W. Europe Standard Time' },
        end: { dateTime: '2026-05-20T09:30:00', timeZone: 'W. Europe Standard Time' },
      },
      { fetchImpl },
    )

    expect(result).toEqual({
      ok: false,
      reason: 'network down',
    })
  })

  it('fails closed when Graph create returns no event id', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ access_token: 'graph-token' }))
      .mockResolvedValueOnce(createJsonResponse({ iCalUId: 'ical-1' }, { status: 201 }))

    const result = await createActionCenterGraphEvent(
      {
        tenantId: 'tenant-1',
        clientId: 'client-1',
        clientSecret: 'secret-1',
        organizerUserId: 'hr-organizer@tenant.example',
      },
      {
        subject: 'Reviewmoment ExitScan / Operations',
        bodyHtml: '<p>Open Action Center.</p>',
        start: { dateTime: '2026-05-20T09:00:00', timeZone: 'W. Europe Standard Time' },
        end: { dateTime: '2026-05-20T09:30:00', timeZone: 'W. Europe Standard Time' },
      },
      { fetchImpl },
    )

    expect(result).toEqual({
      ok: false,
      reason: 'graph_event_missing_id',
    })
  })
})
