import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockAdminFrom,
} = vi.hoisted(() => ({
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
  return new Request('https://app.verisight.nl/api/action-center-review-rhythm', {
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

function buildValidBody(overrides: Record<string, unknown> = {}) {
  return {
    routeId: 'cmp-exit-1::org-1::department::operations',
    routeScopeValue: 'org-1::department::operations',
    routeSourceId: 'cmp-exit-1',
    orgId: 'org-1',
    scanType: 'exit',
    cadenceDays: 14,
    reminderLeadDays: 3,
    escalationLeadDays: 7,
    remindersEnabled: true,
    ...overrides,
  }
}

describe('action center review rhythm route', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'hr@northwind.example',
        },
      },
    })

    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canScheduleActionCenterReview: true,
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'member' }],
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
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
  })

  it('rejects saves when the actor is not allowed to manage review rhythm for the route org', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canScheduleActionCenterReview: true,
        isVerisightAdmin: false,
      },
      orgMemberships: [],
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'user-1',
          display_name: 'Manager One',
          login_email: 'manager@northwind.example',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      detail: 'Geen toegang om reviewritme te beheren.',
    })
  })

  it('rejects blocked route families in this slice', async () => {
    const campaignQuery = createCampaignQuery({
      data: { id: 'cmp-pulse-1', organization_id: 'org-1', scan_type: 'pulse' },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return campaignQuery
      }

      if (table === 'respondents') {
        return createRespondentsQuery({ data: [] })
      }

      if (table === 'action_center_review_rhythm_configs') {
        return createUpsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          routeId: 'cmp-pulse-1::org-1::department::operations',
          routeSourceId: 'cmp-pulse-1',
          scanType: 'pulse',
        }),
      ),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Reviewritme blijft in deze slice beperkt tot ingeschakelde follow-through-routes.',
    })
  })

  it('rejects mixed global capability when update and scheduling truth come from different workspace scopes', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canScheduleActionCenterReview: true,
        isVerisightAdmin: false,
      },
      orgMemberships: [],
      workspaceMemberships: [
        {
          org_id: 'org-1',
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
          access_role: 'hr_member',
          scope_type: 'department',
          scope_value: 'org-1::department::finance',
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: false,
        },
        {
          org_id: 'org-1',
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
          access_role: 'hr_member',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_view: true,
          can_update: false,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      detail: 'Geen toegang om reviewritme te beheren.',
    })
  })

  it('persists a bounded ExitScan rhythm config payload', async () => {
    const upsertQuery = createUpsertQuery({
      data: {
        route_id: 'cmp-exit-1::org-1::department::operations',
        route_scope_value: 'org-1::department::operations',
        route_source_type: 'campaign',
        route_source_id: 'cmp-exit-1',
        org_id: 'org-1',
        scan_type: 'exit',
        cadence_days: 14,
        reminder_lead_days: 3,
        escalation_lead_days: 7,
        reminders_enabled: true,
        updated_by_role: 'hr_member',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'cmp-exit-1', organization_id: 'org-1', scan_type: 'exit' },
          error: null,
        })
      }

      if (table === 'respondents') {
        return createRespondentsQuery({
          data: [{ department: 'Operations' }],
        })
      }

      if (table === 'action_center_review_rhythm_configs') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: 'org-1',
        route_id: 'cmp-exit-1::org-1::department::operations',
        route_scope_value: 'org-1::department::operations',
        route_source_type: 'campaign',
        route_source_id: 'cmp-exit-1',
        scan_type: 'exit',
        cadence_days: 14,
        reminder_lead_days: 3,
        escalation_lead_days: 7,
        reminders_enabled: true,
        updated_by: 'user-1',
        updated_by_role: 'hr_member',
      }),
      { onConflict: 'route_id' },
    )
    await expect(response.json()).resolves.toEqual({
      config: expect.objectContaining({
        route_id: 'cmp-exit-1::org-1::department::operations',
        scan_type: 'exit',
      }),
    })
  })

  it('persists the same bounded rhythm config payload for RetentieScan routes', async () => {
    const upsertQuery = createUpsertQuery({
      data: {
        route_id: 'cmp-retention-1::org-1::department::operations',
        route_scope_value: 'org-1::department::operations',
        route_source_type: 'campaign',
        route_source_id: 'cmp-retention-1',
        org_id: 'org-1',
        scan_type: 'retention',
        cadence_days: 14,
        reminder_lead_days: 3,
        escalation_lead_days: 7,
        reminders_enabled: true,
        updated_by_role: 'hr_member',
      },
      error: null,
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: { id: 'cmp-retention-1', organization_id: 'org-1', scan_type: 'retention' },
          error: null,
        })
      }

      if (table === 'respondents') {
        return createRespondentsQuery({
          data: [{ department: 'Operations' }],
        })
      }

      if (table === 'action_center_review_rhythm_configs') {
        return upsertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          routeId: 'cmp-retention-1::org-1::department::operations',
          routeSourceId: 'cmp-retention-1',
          scanType: 'retention',
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        route_id: 'cmp-retention-1::org-1::department::operations',
        route_source_id: 'cmp-retention-1',
        scan_type: 'retention',
      }),
      { onConflict: 'route_id' },
    )
    await expect(response.json()).resolves.toEqual({
      config: expect.objectContaining({
        route_id: 'cmp-retention-1::org-1::department::operations',
        scan_type: 'retention',
      }),
    })
  })
})
