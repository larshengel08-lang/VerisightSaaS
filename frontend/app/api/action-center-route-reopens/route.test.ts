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
  return new Request('http://localhost/api/action-center-route-reopens', {
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

function createRespondentsQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  }
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route reopens route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects reopen writes without HR/admin permissions', async () => {
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
      if (table === 'respondents') {
        return createRespondentsQuery({ data: [{ department: 'Operations' }] })
      }
      if (table === 'action_center_route_reopens') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        reopen_reason: 'te-vroeg-afgesloten',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('persists a canonical reopen event', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-owner-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    const insertQuery = createInsertQuery({
      data: {
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        reopen_reason: 'te-vroeg-afgesloten',
        reopened_at: '2026-05-21T09:00:00.000Z',
        reopened_by_role: 'hr_owner',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1' },
          error: null,
        })
      }
      if (table === 'respondents') {
        return createRespondentsQuery({ data: [{ department: 'Operations' }] })
      }
      if (table === 'action_center_route_reopens') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        reopen_reason: 'te-vroeg-afgesloten',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        reopen_reason: 'te-vroeg-afgesloten',
        reopened_by_role: 'hr_owner',
        created_by: 'hr-owner-1',
      }),
    )

    const payload = await response.json()
    expect(payload.reopen).toMatchObject({
      routeId: 'campaign-1::org-1::department::operations',
      reopenReason: 'te-vroeg-afgesloten',
      reopenedByRole: 'hr_owner',
    })
  })

  it('persists the exact HR workspace role for reopen audit truth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-member-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'hr-member-1',
          display_name: 'HR Member',
          login_email: 'hr.member@example.com',
          access_role: 'hr_member',
          scope_type: 'org',
          scope_value: 'org-1::org::org-1',
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })

    const insertQuery = createInsertQuery({
      data: {
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        reopen_reason: 'herbeoordeling',
        reopened_at: '2026-05-21T09:00:00.000Z',
        reopened_by_role: 'hr_member',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1' },
          error: null,
        })
      }
      if (table === 'respondents') {
        return createRespondentsQuery({ data: [{ department: 'Operations' }] })
      }
      if (table === 'action_center_route_reopens') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        reopen_reason: 'herbeoordeling',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        reopened_by_role: 'hr_member',
        created_by: 'hr-member-1',
      }),
    )

    const payload = await response.json()
    expect(payload.reopen).toMatchObject({
      reopenedByRole: 'hr_member',
    })
  })
})
