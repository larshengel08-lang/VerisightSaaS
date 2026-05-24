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
  return new Request('http://localhost/api/action-center-governance-interventions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createCampaignQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createInsertQuery(result: { data: unknown; error?: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center governance interventions route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects governance writes without HR/admin permissions', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'manager-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'cmp-1', organization_id: 'org-1', scan_type: 'exit' },
        })
      }

      if (table === 'action_center_governance_interventions') {
        return createInsertQuery({ data: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'cmp-1::org-1::department::operations',
        route_source_id: 'cmp-1',
        route_scope_value: 'org-1::department::operations',
        org_id: 'org-1',
        queue_code: 'stuck_action',
        intervention_type: 'request_manager_update',
      }),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      detail: 'Alleen HR of Loep kan governance-acties vastleggen.',
    })
  })

  it('rejects blocked route families for governance interventions in this slice', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'hr-owner-1' } } })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'cmp-1', organization_id: 'org-1', scan_type: 'pulse' },
        })
      }

      if (table === 'action_center_governance_interventions') {
        return createInsertQuery({ data: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'cmp-1::org-1::department::operations',
        route_source_id: 'cmp-1',
        route_scope_value: 'org-1::department::operations',
        org_id: 'org-1',
        queue_code: 'stuck_action',
        intervention_type: 'request_manager_update',
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail:
        'Governance interventions blijven in deze slice beperkt tot ingeschakelde follow-through-routes.',
    })
  })

  it('persists a canonical HR governance intervention with audit truth', async () => {
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
        route_id: 'cmp-1::org-1::department::operations',
        action_id: null,
        route_source_id: 'cmp-1',
        route_scope_value: 'org-1::department::operations',
        org_id: 'org-1',
        queue_code: 'stuck_action',
        intervention_type: 'request_manager_update',
        reason_code: null,
        actor_role: 'hr_member',
        actor_user_id: 'hr-member-1',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'cmp-1', organization_id: 'org-1', scan_type: 'exit' },
        })
      }

      if (table === 'action_center_governance_interventions') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        route_id: 'cmp-1::org-1::department::operations',
        route_source_id: 'cmp-1',
        route_scope_value: 'org-1::department::operations',
        org_id: 'org-1',
        queue_code: 'stuck_action',
        intervention_type: 'request_manager_update',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_id: 'cmp-1::org-1::department::operations',
        route_source_id: 'cmp-1',
        route_scope_value: 'org-1::department::operations',
        queue_code: 'stuck_action',
        intervention_type: 'request_manager_update',
        actor_role: 'hr_member',
        actor_user_id: 'hr-member-1',
      }),
    )
  })
})
