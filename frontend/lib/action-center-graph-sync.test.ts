import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetGraphEnv } = vi.hoisted(() => ({
  mockGetGraphEnv: vi.fn(),
}))

vi.mock('./action-center-graph-client', async () => {
  const actual = await vi.importActual<typeof import('./action-center-graph-client')>('./action-center-graph-client')

  return {
    ...actual,
    getActionCenterGraphEnv: mockGetGraphEnv,
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => {
      throw new Error('Unexpected real admin client usage in graph sync tests.')
    },
  }),
}))

import { syncActionCenterGraphReview } from './action-center-graph-sync'

function createGraphTableMock(args: {
  existingRow?: Record<string, unknown> | null
  maybeSingleError?: { message?: string } | null
}) {
  const state = {
    upserts: [] as Array<Record<string, unknown>>,
  }

  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: args.existingRow ?? null,
      error: args.maybeSingleError ?? null,
    }),
    upsert: vi.fn((payload: Record<string, unknown>) => {
      state.upserts.push(payload)

      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { route_id: payload.route_id },
            error: null,
          }),
        }),
      }
    }),
  }

  return { query, state }
}

function createAdminClientMock(graphTable: ReturnType<typeof createGraphTableMock>['query']) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'action_center_graph_calendar_links') {
        return graphTable
      }

      throw new Error(`Unexpected table ${table}`)
    }),
  }
}

function buildInput(overrides: Partial<Parameters<typeof syncActionCenterGraphReview>[0]> = {}) {
  return {
    orgId: '22222222-2222-4222-8222-222222222222',
    routeId: '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
    reviewItemId:
      '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
    routeScopeValue: '22222222-2222-4222-8222-222222222222::department::operations',
    routeSourceId: '11111111-1111-4111-8111-111111111111',
    scanType: 'exit',
    organizerEmail: 'hr@verisight.nl',
    revision: 3,
    method: 'REQUEST' as const,
    inviteDraft: {
      subject: 'Reviewmoment ExitScan / Operations',
      emailHtml: '<p>Open Action Center.</p>',
      reviewDate: '2026-05-28',
      recipientEmail: 'manager@example.com',
      recipientName: 'Manager Operations',
    },
    ...overrides,
  }
}

describe('action center graph sync orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetGraphEnv.mockReturnValue({
      tenantId: 'tenant-1',
      clientId: 'client-1',
      clientSecret: 'secret-1',
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
      enabledOrgIds: ['22222222-2222-4222-8222-222222222222'],
    })
  })

  it('creates a new Graph event and persists a linked route mapping when no provider link exists yet', async () => {
    const graphTable = createGraphTableMock({ existingRow: null })
    const adminClient = createAdminClientMock(graphTable.query)
    const createEvent = vi.fn().mockResolvedValue({
      ok: true,
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
    })
    const loadCapability = vi.fn().mockReturnValue({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })

    const result = await syncActionCenterGraphReview(buildInput(), {
      adminClient,
      loadCapability,
      createEvent,
    })

    expect(result).toEqual({
      status: 'linked',
      provider: 'microsoft_graph',
      action: 'created',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 3,
      reason: null,
    })
    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(graphTable.state.upserts).toHaveLength(1)
    expect(graphTable.state.upserts[0]).toMatchObject({
      route_id: buildInput().routeId,
      review_item_id: buildInput().routeId,
      provider: 'microsoft_graph',
      event_id: 'graph-event-1',
      sync_state: 'linked',
      last_synced_revision: 3,
    })
  })

  it('updates an existing linked Graph event instead of creating a duplicate', async () => {
    const graphTable = createGraphTableMock({
      existingRow: {
        org_id: buildInput().orgId,
        route_id: buildInput().routeId,
        review_item_id: buildInput().routeId,
        route_scope_value: buildInput().routeScopeValue,
        route_source_id: buildInput().routeSourceId,
        provider: 'microsoft_graph',
        event_id: 'graph-event-1',
        organizer_email: 'hr@verisight.nl',
        organizer_user_id: 'hr-organizer@tenant.example',
        consent_state: 'granted',
        sync_state: 'linked',
        last_synced_revision: 2,
        i_cal_uid: 'ical-1',
        last_sync_error: null,
      },
    })
    const adminClient = createAdminClientMock(graphTable.query)
    const createEvent = vi.fn()
    const updateEvent = vi.fn().mockResolvedValue({
      ok: true,
      eventId: 'graph-event-1',
    })
    const loadCapability = vi.fn().mockReturnValue({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })

    const result = await syncActionCenterGraphReview(buildInput(), {
      adminClient,
      loadCapability,
      createEvent,
      updateEvent,
    })

    expect(result).toEqual({
      status: 'linked',
      provider: 'microsoft_graph',
      action: 'updated',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 3,
      reason: null,
    })
    expect(createEvent).not.toHaveBeenCalled()
    expect(updateEvent).toHaveBeenCalledTimes(1)
    expect(graphTable.state.upserts[0]).toMatchObject({
      event_id: 'graph-event-1',
      sync_state: 'linked',
      last_synced_revision: 3,
      i_cal_uid: 'ical-1',
    })
  })

  it('cancels an existing linked Graph event and records the cancelled state', async () => {
    const graphTable = createGraphTableMock({
      existingRow: {
        org_id: buildInput().orgId,
        route_id: buildInput().routeId,
        review_item_id: buildInput().routeId,
        route_scope_value: buildInput().routeScopeValue,
        route_source_id: buildInput().routeSourceId,
        provider: 'microsoft_graph',
        event_id: 'graph-event-1',
        organizer_email: 'hr@verisight.nl',
        organizer_user_id: 'hr-organizer@tenant.example',
        consent_state: 'granted',
        sync_state: 'linked',
        last_synced_revision: 2,
        i_cal_uid: 'ical-1',
        last_sync_error: null,
      },
    })
    const adminClient = createAdminClientMock(graphTable.query)
    const cancelEvent = vi.fn().mockResolvedValue({
      ok: true,
      eventId: 'graph-event-1',
    })
    const loadCapability = vi.fn().mockReturnValue({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })

    const result = await syncActionCenterGraphReview(
      buildInput({
        method: 'CANCEL',
      }),
      {
        adminClient,
        loadCapability,
        cancelEvent,
      },
    )

    expect(result).toEqual({
      status: 'cancelled',
      provider: 'microsoft_graph',
      action: 'cancelled',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 3,
      reason: null,
    })
    expect(cancelEvent).toHaveBeenCalledTimes(1)
    expect(graphTable.state.upserts[0]).toMatchObject({
      event_id: 'graph-event-1',
      sync_state: 'cancelled',
      last_synced_revision: 3,
    })
  })

  it('falls back cleanly when Graph capability is unavailable', async () => {
    const graphTable = createGraphTableMock({ existingRow: null })
    const adminClient = createAdminClientMock(graphTable.query)
    const loadCapability = vi.fn().mockReturnValue({
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-consent',
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: null,
    })
    const createEvent = vi.fn()

    const result = await syncActionCenterGraphReview(buildInput(), {
      adminClient,
      loadCapability,
      createEvent,
    })

    expect(result).toEqual({
      status: 'fallback',
      provider: 'microsoft_graph',
      action: 'fallback',
      eventId: null,
      iCalUId: null,
      lastSyncedRevision: null,
      reason: 'missing-consent',
    })
    expect(createEvent).not.toHaveBeenCalled()
    expect(graphTable.state.upserts).toHaveLength(0)
  })

  it('does not create a second event when the same revision is already linked', async () => {
    const graphTable = createGraphTableMock({
      existingRow: {
        org_id: buildInput().orgId,
        route_id: buildInput().routeId,
        review_item_id: buildInput().routeId,
        route_scope_value: buildInput().routeScopeValue,
        route_source_id: buildInput().routeSourceId,
        provider: 'microsoft_graph',
        event_id: 'graph-event-1',
        organizer_email: 'hr@verisight.nl',
        organizer_user_id: 'hr-organizer@tenant.example',
        consent_state: 'granted',
        sync_state: 'linked',
        last_synced_revision: 3,
        i_cal_uid: 'ical-1',
        last_sync_error: null,
      },
    })
    const adminClient = createAdminClientMock(graphTable.query)
    const createEvent = vi.fn()
    const updateEvent = vi.fn()
    const loadCapability = vi.fn().mockReturnValue({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })

    const result = await syncActionCenterGraphReview(buildInput(), {
      adminClient,
      loadCapability,
      createEvent,
      updateEvent,
    })

    expect(result).toEqual({
      status: 'already-current',
      provider: 'microsoft_graph',
      action: 'noop',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 3,
      reason: null,
    })
    expect(createEvent).not.toHaveBeenCalled()
    expect(updateEvent).not.toHaveBeenCalled()
    expect(graphTable.state.upserts).toHaveLength(0)
  })
})
