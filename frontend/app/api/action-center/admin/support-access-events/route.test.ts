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
  return new Request('http://localhost/api/action-center/admin/support-access-events', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center support access events route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects support access writes from non-admin actors', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'customer-owner-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: false,
        canLogSupportAccess: false,
        organizationIds: ['org-1'],
        workspaceOrgIds: [],
      },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    const response = await POST(
      makeRequest({
        orgId: 'org-1',
        routeId: 'route-1',
        scopeValue: 'org-1::department::operations',
        accessKind: 'support',
        accessReason: 'Investigate route state',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('stores support access events with reason and affected route scope', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: true,
        canLogSupportAccess: true,
        organizationIds: [],
        workspaceOrgIds: [],
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    const insertQuery = createInsertQuery({
      data: {
        id: 'support-1',
        org_id: 'org-1',
        route_id: 'route-1',
        scope_value: 'org-1::department::operations',
        accessed_by: 'admin-1',
        access_kind: 'support',
        access_reason: 'Investigate route state',
        created_at: '2026-05-23T09:00:00.000Z',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_support_access_events') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        orgId: 'org-1',
        routeId: 'route-1',
        scopeValue: 'org-1::department::operations',
        accessKind: 'support',
        accessReason: 'Investigate route state',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: 'org-1',
        route_id: 'route-1',
        scope_value: 'org-1::department::operations',
        accessed_by: 'admin-1',
        access_kind: 'support',
        access_reason: 'Investigate route state',
      }),
    )

    await expect(response.json()).resolves.toMatchObject({
      supportAccessEvent: {
        accessKind: 'support',
        routeId: 'route-1',
      },
    })
  })
})
