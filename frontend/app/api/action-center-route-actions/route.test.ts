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
    data: result.data,
    error: result.error,
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

function createDeleteQuery(result: { error: unknown }) {
  return {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  }
}

describe('action center route actions route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not hard-reject broad project language before auth because it remains a draft needing hr review', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Start een organisatiebreed verbeterproject en werk de roadmap voor meerdere teams uit.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn welke workstreams in dit programma moeten landen.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(401)
    expect(mockAdminFrom).not.toHaveBeenCalled()
  })

  it('does not hard-reject dossier-like language before auth because it remains a draft-invalid submission', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Leg het dossier aan en vul de vervolgroute en stopreden voor deze casus bij.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn of het dossier compleet genoeg is voor verdere routing.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(401)
    expect(mockAdminFrom).not.toHaveBeenCalled()
  })

  it('does not hard-reject weak action quality before auth because it remains a draft-invalid submission', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Wat moeten we hier nu mee doen?',
        primary_action_expected_effect: 'Plan daarna de follow-up met het managementteam.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(401)
    expect(mockAdminFrom).not.toHaveBeenCalled()
  })

  it('persists broad project language as a draft needing hr review instead of a 400 validation error', async () => {
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
        id: 'action-draft-1',
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Start een organisatiebreed verbeterproject en werk de roadmap voor meerdere teams uit.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn welke workstreams in dit programma moeten landen.',
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-hr-review-created' }, { id: 'event-hr-review-disposition' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-hr-review',
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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
        primary_action_text: 'Start een organisatiebreed verbeterproject en werk de roadmap voor meerdere teams uit.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn welke workstreams in dit programma moeten landen.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-hr-review',
        primary_action_status: null,
      }),
    )
    expect(metricsInsertQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        event_type: 'action_draft_created',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-draft-1',
      }),
      expect.objectContaining({
        event_type: 'action_draft_sent_to_hr_review',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-draft-1',
      }),
    ])

    const payload = await response.json()
    expect(payload.actionDraft).toMatchObject({
      semanticState: 'draft',
      validationDisposition: 'needs_hr_review',
      primary_action_status: null,
    })
  })

  it('persists dossier-like route language as an invalid draft instead of a 400 validation error', async () => {
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
        id: 'action-draft-2',
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Leg het dossier aan en vul de vervolgroute en stopreden voor deze casus bij.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn of het dossier compleet genoeg is voor verdere routing.',
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-invalid-created' }, { id: 'event-invalid-rejected' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-invalid',
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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
        primary_action_text: 'Leg het dossier aan en vul de vervolgroute en stopreden voor deze casus bij.',
        primary_action_expected_effect:
          'Binnen twee weken moet duidelijk zijn of het dossier compleet genoeg is voor verdere routing.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-invalid',
        primary_action_status: null,
      }),
    )
    expect(metricsInsertQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        event_type: 'action_draft_created',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-draft-2',
      }),
      expect.objectContaining({
        event_type: 'action_draft_rejected',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-draft-2',
      }),
    ])

    const payload = await response.json()
    expect(payload.actionDraft).toMatchObject({
      semanticState: 'draft',
      validationDisposition: 'invalid',
      primary_action_status: null,
    })
  })

  it('persists missing content as an invalid draft instead of rejecting before draft validation', async () => {
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
        id: 'action-draft-3',
        route_id: 'campaign-1::org-1::department::operations',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_theme_key: null,
        primary_action_text: null,
        primary_action_expected_effect: null,
        primary_action_status: null,
        review_scheduled_for: null,
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-valid-created' }, { id: 'event-valid-validated' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-missing',
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-missing',
        primary_action_theme_key: null,
        primary_action_text: null,
        primary_action_expected_effect: null,
        primary_action_status: null,
        review_scheduled_for: null,
      }),
    )

    const payload = await response.json()
    expect(payload.actionDraft).toMatchObject({
      primary_action_theme_key: null,
      primary_action_text: null,
      primary_action_expected_effect: null,
      primary_action_status: null,
      review_scheduled_for: null,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
  })

  it.each([
    {
      label: 'a freeform date string is submitted',
      review_scheduled_for: 'tomorrow',
    },
    {
      label: 'an impossible iso date is submitted',
      review_scheduled_for: '2026-02-31',
    },
  ])('persists null review timing when $label so invalid dates never reach the db', async ({ review_scheduled_for }) => {
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
        id: 'action-draft-date',
        route_id: 'campaign-1::org-1::department::operations',
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
        primary_action_status: null,
        review_scheduled_for: null,
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-valid-created' }, { id: 'event-valid-validated' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-invalid-date',
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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
        review_scheduled_for,
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_response_id: 'response-invalid-date',
        review_scheduled_for: null,
      }),
    )

    const payload = await response.json()
    expect(payload.actionDraft).toMatchObject({
      review_scheduled_for: null,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    })
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

  it('surfaces campaign lookup failures as bounded 500 errors instead of route-missing outcomes', async () => {
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
          data: null,
          error: { message: 'campaign lookup failed' },
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

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      detail: 'Route action route laden mislukt.',
    })
  })

  it('surfaces assigned-manager lookup failures as bounded 500 errors for admin writes', async () => {
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
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-admin-failure',
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
          data: null,
          error: { message: 'assignment lookup failed' },
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

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      detail: 'Route action manager-toewijzing laden mislukt.',
    })
  })

  it('accepts a valid action and persists server-derived identity without asserting immediate active truth on the manager draft', async () => {
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
        route_id: 'campaign-1::org-1::department::operations',
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
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-valid-created' }, { id: 'event-valid-validated' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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
        route_id: 'campaign-1::org-1::department::operations',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_status: null,
        created_by: 'manager-1',
        updated_by: 'manager-1',
      }),
    )
    expect(metricsInsertQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        event_type: 'action_draft_created',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-1',
      }),
      expect.objectContaining({
        event_type: 'action_draft_validated',
        object_anchor: 'action_card',
        route_family: 'exit',
        action_id: 'action-1',
      }),
    ])

    const payload = await response.json()
    expect(payload.action).toMatchObject({
      org_id: 'org-1',
      route_id: 'campaign-1::org-1::department::operations',
      owner_name: 'Manager Operations',
      owner_assigned_at: '2026-04-01T08:00:00.000Z',
      primary_action_status: null,
    })
    expect(payload.actionDraft).toMatchObject({
      primary_action_status: null,
      semanticState: 'draft',
      validationDisposition: 'valid',
    })
  })

  it('accepts an item-scope action using the canonical campaign scope without department canonicalization', async () => {
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
          scope_type: 'item',
          scope_value: 'org-1::campaign::campaign-1',
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
        id: 'action-item-1',
        route_id: 'campaign-1::org-1::campaign::campaign-1',
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'item',
        route_scope_value: 'org-1::campaign::campaign-1',
        manager_user_id: 'manager-1',
        owner_name: 'Manager Operations',
        owner_assigned_at: '2026-04-01T08:00:00.000Z',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-valid-created' }, { id: 'event-valid-validated' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-item-1',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'item',
            route_scope_value: 'org-1::campaign::campaign-1',
            manager_user_id: 'manager-1',
          },
          error: null,
        })
      }

      if (table === 'respondents') {
        throw new Error('respondents lookup should not run for item scope')
      }

      if (table === 'action_center_route_actions') {
        return insertQuery
      }

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'item',
        route_scope_value: 'org-1::campaign::campaign-1',
        manager_user_id: 'manager-1',
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
        manager_response_id: 'response-item-1',
        route_id: 'campaign-1::org-1::campaign::campaign-1',
        route_scope_type: 'item',
        route_scope_value: 'org-1::campaign::campaign-1',
      }),
    )
  })

  it('rejects an item-scope action when the submitted scope is not the canonical campaign item value', async () => {
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
          scope_type: 'item',
          scope_value: 'org-1::campaign::campaign-1-forged',
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

      if (table === 'action_center_manager_responses') {
        return createRouteContainerQuery({
          data: {
            id: 'response-item-invalid',
            campaign_id: 'campaign-1',
            org_id: 'org-1',
            route_scope_type: 'item',
            route_scope_value: 'org-1::campaign::campaign-1-forged',
            manager_user_id: 'manager-1',
          },
          error: null,
        })
      }

      if (table === 'respondents') {
        throw new Error('respondents lookup should not run for item scope')
      }

      if (table === 'action_center_route_actions') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        campaign_id: 'campaign-1',
        route_scope_type: 'item',
        route_scope_value: 'org-1::campaign::campaign-1-forged',
        manager_user_id: 'manager-1',
        primary_action_theme_key: 'workload',
        primary_action_text: 'Plan deze week een kort teamgesprek over workloadpieken.',
        primary_action_expected_effect:
          'Binnen twee weken moet zichtbaar zijn of de workloadpieken kleiner worden.',
        review_scheduled_for: '2026-05-20',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: 'Route action route bestaat niet voor deze campagne.',
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
        route_id: 'campaign-1::org-1::department::operations',
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
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:10:00.000Z',
        updated_at: '2026-04-30T10:10:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: [{ id: 'event-admin-created' }, { id: 'event-admin-validated' }],
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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
        primary_action_status: null,
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

  it('rolls back the inserted action when bounded event logging fails', async () => {
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
        id: 'action-metric-failure',
        route_id: 'campaign-1::org-1::department::operations',
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
        primary_action_status: null,
        review_scheduled_for: '2026-05-20',
        created_at: '2026-04-30T10:00:00.000Z',
        updated_at: '2026-04-30T10:00:00.000Z',
      },
      error: null,
    })
    const metricsInsertQuery = createInsertQuery({
      data: null,
      error: { message: 'metric insert failed' },
    })
    const deleteQuery = createDeleteQuery({ error: null })
    let routeActionTableCalls = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'exit' },
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
            id: 'response-metric-failure',
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
        routeActionTableCalls += 1
        return routeActionTableCalls === 1 ? insertQuery : deleteQuery
      }

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      detail: 'Route action bounded event logging mislukt.',
    })
    expect(metricsInsertQuery.insert).toHaveBeenCalledTimes(1)
    expect(deleteQuery.delete).toHaveBeenCalledTimes(1)
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'action-metric-failure')
  })

  it('fails closed before persisting an action when the campaign route family is outside bounded execution', async () => {
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

    const insertQuery = createInsertQuery({ data: null, error: null })
    const metricsInsertQuery = createInsertQuery({ data: null, error: null })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'campaign-1', organization_id: 'org-1', scan_type: 'pulse' },
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
            id: 'response-unsupported-family',
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

      if (table === 'action_center_bounded_execution_events') {
        return metricsInsertQuery
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

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      detail: 'Route action route family valt buiten bounded execution.',
    })
    expect(insertQuery.insert).not.toHaveBeenCalled()
    expect(metricsInsertQuery.insert).not.toHaveBeenCalled()
  })
})
