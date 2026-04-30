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
  return new Request('http://localhost/api/action-center-route-actions', {
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

function createRouteContainerQuery(result: { data: unknown; error: unknown }) {
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

function createAssignmentQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route actions route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthorized manager writes', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'manager-1' },
      },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_view: true,
          can_update: true,
          display_name: 'Manager Operations',
          login_email: 'manager.operations@example.com',
          created_at: '2026-04-01T08:00:00.000Z',
          updated_at: '2026-04-01T08:00:00.000Z',
        },
      ],
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
          data: [{ department: 'Operations' }, { department: 'Finance' }],
        })
      }

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-1',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::finance',
            manager_user_id: 'manager-2',
          },
          error: null,
        })
      }

      if (table === 'action_center_route_actions') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        org_id: 'forged-org',
        route_id: 'forged-route',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::finance',
        manager_user_id: 'manager-1',
        owner_name: 'Forged Owner',
        owner_assigned_at: '2026-01-01T00:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('fails closed when no persisted route container exists for the route handoff', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'manager-1' },
      },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_view: true,
          can_update: true,
          display_name: 'Manager Operations',
          login_email: 'manager.operations@example.com',
          created_at: '2026-04-01T08:00:00.000Z',
          updated_at: '2026-04-01T08:00:00.000Z',
        },
      ],
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

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: null,
          error: null,
        })
      }

      if (table === 'action_center_route_actions') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(400)
  })

  it('accepts a valid action and persists server-derived identity', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'manager-1' },
      },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: false },
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_view: true,
          can_update: true,
          display_name: 'Manager Operations',
          login_email: 'manager.operations@example.com',
          created_at: '2026-04-01T08:00:00.000Z',
          updated_at: '2026-04-01T08:00:00.000Z',
        },
      ],
    })

    const insertQuery = createInsertQuery({
      data: {
        id: 'action-1',
        route_id: 'campaign-1::department::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        primary_action_status: 'open',
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
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
          data: [{ department: 'Operations' }, { department: 'Finance' }],
        })
      }

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-1',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-1',
          },
          error: null,
        })
      }

      if (table === 'action_center_route_actions') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        org_id: 'forged-org',
        route_id: 'forged-route',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Forged Owner',
        owner_assigned_at: '2026-01-01T00:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-1',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_id: 'campaign-1::department::org-1::department::operations',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_status: 'open',
        created_by: 'manager-1',
        updated_by: 'manager-1',
      }),
    )

    const payload = await response.json()
    expect(payload.action).toMatchObject({
      org_id: 'org-1',
      route_id: 'campaign-1::department::org-1::department::operations',
      owner_name: 'Manager Operations',
      owner_assigned_at: '2026-04-01T08:00:00.000Z',
    })
  })

  it('derives admin write identity from assignment truth instead of the submitted manager id', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1' },
      },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: true },
      workspaceMemberships: [],
    })

    const insertQuery = createInsertQuery({
      data: {
        id: 'action-2',
        manager_response_id: 'response-2',
        route_id: 'campaign-1::department::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-actual',
        owner_name: 'Actual Manager',
        owner_assigned_at: '2026-04-02T09:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        primary_action_status: 'open',
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:10:00.000Z',
        updated_at: '2026-04-30T10:10:00.000Z',
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

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-2',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-actual',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createAssignmentQuery({
          data: {
            org_id: 'org-1',
            user_id: 'manager-actual',
            display_name: 'Actual Manager',
            login_email: 'actual.manager@example.com',
            access_role: 'manager_assignee',
            scope_type: 'department',
            scope_value: 'org-1::department::operations',
            can_view: true,
            can_update: true,
            created_at: '2026-04-02T09:00:00.000Z',
            updated_at: '2026-04-02T09:00:00.000Z',
          },
          error: null,
        })
      }

      if (table === 'action_center_route_actions') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'forged-manager',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-2',
        manager_user_id: 'manager-actual',
        owner_name: 'Actual Manager',
        owner_assigned_at: '2026-04-02T09:00:00.000Z',
        created_by: 'admin-1',
        updated_by: 'admin-1',
      }),
    )
  })

  it('fails when assignment timing cannot be proven from server truth', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1' },
      },
    })
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: { isVerisightAdmin: true },
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

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-3',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-actual',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createAssignmentQuery({
          data: {
            org_id: 'org-1',
            user_id: 'manager-actual',
            display_name: 'Actual Manager',
            login_email: 'actual.manager@example.com',
            access_role: 'manager_assignee',
            scope_type: 'department',
            scope_value: 'org-1::department::operations',
            can_view: true,
            can_update: true,
            created_at: null,
            updated_at: '2026-04-02T09:00:00.000Z',
          },
          error: null,
        })
      }

      if (table === 'action_center_route_actions') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'forged-manager',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(400)
  })
})
