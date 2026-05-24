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

import { GET } from './route'

function makeRequest(url = 'http://localhost/api/action-center/admin/audit-exports?orgId=org-1') {
  return new Request(url, { method: 'GET' })
}

function createSelectManyQuery(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
  }
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center audit exports route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a bounded audit export summary instead of raw unrestricted dumps', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: true,
        canRequestAuditExport: true,
        organizationIds: [],
        workspaceOrgIds: [],
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_activation_approvals') {
        return createSelectManyQuery({
          data: [
            {
              route_family: 'exit',
              approval_status: 'approved',
              scope_value: 'org-1::department::operations',
              created_at: '2026-05-23T09:00:00.000Z',
            },
          ],
          error: null,
        })
      }

      if (table === 'action_center_support_access_events') {
        return createSelectManyQuery({
          data: [
            {
              access_kind: 'support',
              access_reason: 'Investigate route state',
              created_at: '2026-05-23T09:10:00.000Z',
            },
          ],
          error: null,
        })
      }

      if (table === 'action_center_audit_export_requests') {
        return createInsertQuery({
          data: { id: 'export-1' },
          error: null,
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await GET(makeRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      routeActivations: expect.any(Array),
      supportAccessEvents: expect.any(Array),
    })
  })
})
