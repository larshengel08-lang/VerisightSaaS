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
  return new Request('http://localhost/api/action-center-route-closeouts', {
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

function createUpsertQuery(result: { data: unknown; error: unknown }) {
  return {
    upsert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route closeouts route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects route closeout writes without HR/admin permissions', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'manager-1' } },
    })
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
        return createRespondentsQuery({
          data: [{ department: 'Operations' }],
        })
      }

      if (table === 'action_center_route_closeouts') {
        return createUpsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'afgerond',
        closeout_reason: 'voldoende-opgepakt',
        closeout_note: 'Voor nu voldoende opgepakt in teamritme.',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('persists a canonical HR closeout with structured reason', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'hr-owner-1' } },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    const upsertQuery = createUpsertQuery({
      data: {
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'afgerond',
        closeout_reason: 'voldoende-opgepakt',
        closeout_note: 'Voor nu voldoende opgepakt in teamritme.',
        closed_at: '2026-05-20T09:00:00.000Z',
        closed_by_role: 'hr_owner',
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
        return createRespondentsQuery({
          data: [{ department: 'Operations' }],
        })
      }

      if (table === 'action_center_route_closeouts') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'afgerond',
        closeout_reason: 'voldoende-opgepakt',
        closeout_note: 'Voor nu voldoende opgepakt in teamritme.',
      }),
    )

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'afgerond',
        closeout_reason: 'voldoende-opgepakt',
        closeout_note: 'Voor nu voldoende opgepakt in teamritme.',
        closed_by_role: 'hr_owner',
        created_by: 'hr-owner-1',
        updated_by: 'hr-owner-1',
      }),
      { onConflict: 'route_id' },
    )

    const payload = await response.json()
    expect(payload.closeout).toMatchObject({
      routeId: 'campaign-1::org-1::department::operations',
      closeoutStatus: 'afgerond',
      closeoutReason: 'voldoende-opgepakt',
      closedByRole: 'hr_owner',
    })
  })

  it('persists the exact HR workspace role for closeout audit truth', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'hr-member-1' } },
    })
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

    const upsertQuery = createUpsertQuery({
      data: {
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'gestopt',
        closeout_reason: 'bewust-niet-voortzetten',
        closeout_note: null,
        closed_at: '2026-05-20T09:00:00.000Z',
        closed_by_role: 'hr_member',
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
        return createRespondentsQuery({
          data: [{ department: 'Operations' }],
        })
      }

      if (table === 'action_center_route_closeouts') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        closeout_status: 'gestopt',
        closeout_reason: 'bewust-niet-voortzetten',
      }),
    )

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        closed_by_role: 'hr_member',
        created_by: 'hr-member-1',
        updated_by: 'hr-member-1',
      }),
      { onConflict: 'route_id' },
    )

    const payload = await response.json()
    expect(payload.closeout).toMatchObject({
      closedByRole: 'hr_member',
    })
  })
})
