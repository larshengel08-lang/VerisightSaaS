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
  return new Request('http://localhost/api/action-center/admin/route-activation-approvals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createUpsertQuery(result: { data: unknown; error: unknown }) {
  return {
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route activation approvals route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects route activation approval writes from non-admin actors', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'customer-owner-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: false,
        canApproveRouteActivation: false,
        organizationIds: ['org-1'],
        workspaceOrgIds: [],
      },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    const response = await POST(
      makeRequest({
        orgId: 'org-1',
        routeFamily: 'exit',
        scopeValue: 'org-1::department::operations',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('stores a bounded approval record for approved route families', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: true,
        canApproveRouteActivation: true,
        organizationIds: [],
        workspaceOrgIds: [],
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    const upsertQuery = createUpsertQuery({
      data: {
        id: 'approval-1',
        org_id: 'org-1',
        route_family: 'exit',
        scope_value: 'org-1::department::operations',
        requested_by: 'admin-1',
        approved_by: 'admin-1',
        approval_status: 'approved',
        rationale: 'Enterprise operating approval',
        created_at: '2026-05-23T09:00:00.000Z',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_activation_approvals') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        orgId: 'org-1',
        routeFamily: 'exit',
        scopeValue: 'org-1::department::operations',
        rationale: 'Enterprise operating approval',
      }),
    )

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: 'org-1',
        route_family: 'exit',
        scope_value: 'org-1::department::operations',
        requested_by: 'admin-1',
        approved_by: 'admin-1',
        approval_status: 'approved',
        rationale: 'Enterprise operating approval',
      }),
      { onConflict: 'org_id,route_family,scope_value' },
    )

    await expect(response.json()).resolves.toMatchObject({
      approval: {
        routeFamily: 'exit',
        approvalStatus: 'approved',
      },
    })
  })
})
