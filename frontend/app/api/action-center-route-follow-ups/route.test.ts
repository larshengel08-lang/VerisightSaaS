import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetUser, mockLoadSuiteAccessContext, mockAdminFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}))

vi.mock('@/lib/suite-access-server', () => ({
  loadSuiteAccessContext: mockLoadSuiteAccessContext,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { POST } from './route'

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/action-center-route-follow-ups', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createCampaignQuery(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createUpsertQuery(result: { data: unknown; error: unknown }) {
  return {
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route follow-ups route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects follow-up writes without HR/admin permissions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'manager-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1' },
          error: null,
        })
      }
      if (table === 'action_center_route_relations') {
        return createUpsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        source_campaign_id: 'campaign-1',
        source_route_scope_value: 'org-1::department::operations',
        target_campaign_id: 'campaign-1',
        target_route_scope_value: 'org-1::department::people',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('persists a compact follow-up relation between two route ids', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-owner-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    const upsertQuery = createUpsertQuery({
      data: {
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_relation_type: 'follow-up-from',
        source_route_id: 'campaign-1::org-1::department::operations',
        target_route_id: 'campaign-1::org-1::department::people',
        recorded_at: '2026-05-21T09:00:00.000Z',
        recorded_by_role: 'hr',
      },
      error: null,
    })

    let campaignQueryCall = 0
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        campaignQueryCall += 1
        return createCampaignQuery({
          data: { id: `campaign-${campaignQueryCall}`, organization_id: 'org-1' },
          error: null,
        })
      }
      if (table === 'respondents') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ department: 'Operations' }, { department: 'People' }],
            error: null,
          }),
        }
      }
      if (table === 'action_center_route_relations') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        source_campaign_id: 'campaign-1',
        source_route_scope_value: 'org-1::department::operations',
        target_campaign_id: 'campaign-1',
        target_route_scope_value: 'org-1::department::people',
      }),
    )

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_relation_type: 'follow-up-from',
        source_route_id: 'campaign-1::org-1::department::operations',
        target_route_id: 'campaign-1::org-1::department::people',
        recorded_by_role: 'hr',
        created_by: 'hr-owner-1',
      }),
      { onConflict: 'source_route_id,target_route_id,route_relation_type' },
    )

    const payload = await response.json()
    expect(payload.followUp).toMatchObject({
      routeRelationType: 'follow-up-from',
      sourceRouteId: 'campaign-1::org-1::department::operations',
      targetRouteId: 'campaign-1::org-1::department::people',
    })
  })

  it('rejects cross-org follow-up lineage even when the caller owns one side', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-owner-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    let campaignQueryCall = 0
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        campaignQueryCall += 1
        return createCampaignQuery({
          data:
            campaignQueryCall === 1
              ? { id: 'campaign-1', organization_id: 'org-1' }
              : { id: 'campaign-2', organization_id: 'org-2' },
          error: null,
        })
      }
      if (table === 'respondents') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ department: 'Operations' }, { department: 'People' }],
            error: null,
          }),
        }
      }
      if (table === 'action_center_route_relations') {
        return createUpsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        source_campaign_id: 'campaign-1',
        source_route_scope_value: 'org-1::department::operations',
        target_campaign_id: 'campaign-2',
        target_route_scope_value: 'org-2::department::people',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('rejects mismatched source scope values that do not belong to the source campaign', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-owner-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    let campaignQueryCall = 0
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        campaignQueryCall += 1
        return createCampaignQuery({
          data: { id: `campaign-${campaignQueryCall}`, organization_id: 'org-1' },
          error: null,
        })
      }
      if (table === 'respondents') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ department: 'Operations' }],
            error: null,
          }),
        }
      }
      if (table === 'action_center_route_relations') {
        return createUpsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        source_campaign_id: 'campaign-1',
        source_route_scope_value: 'org-1::department::sales',
        target_campaign_id: 'campaign-2',
        target_route_scope_value: 'org-1::department::operations',
      }),
    )

    expect(response.status).toBe(400)
  })
})
