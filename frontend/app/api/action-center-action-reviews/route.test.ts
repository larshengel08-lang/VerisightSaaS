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
  return new Request('http://localhost/api/action-center-action-reviews', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function createActionQuery(result: { data: unknown; error: unknown }) {
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

function createUpdateQuery(result: { error: unknown }) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  }
}

describe('action center action reviews route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects writes for actions outside the manager route ownership', async () => {
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
        },
      ],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        return createActionQuery({
          data: {
            id: 'action-9',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::finance',
            manager_user_id: 'manager-2',
          },
          error: null,
        })
      }

      if (table === 'action_center_action_reviews') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-9',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('rejects review writes that cross assigned-manager ownership inside the same route scope', async () => {
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
        },
      ],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        return createActionQuery({
          data: {
            id: 'action-10',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-2',
          },
          error: null,
        })
      }

      if (table === 'action_center_action_reviews') {
        return createInsertQuery({ data: null, error: null })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-10',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
      }),
    )

    expect(response.status).toBe(403)
  })

  it('accepts a valid review write with lightweight outcome fields only', async () => {
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
        },
      ],
    })

    const insertQuery = createInsertQuery({
      data: {
        id: 'review-1',
        action_id: 'action-1',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
        created_at: '2026-04-30T10:05:00.000Z',
        updated_at: '2026-04-30T10:05:00.000Z',
      },
      error: null,
    })
    const updateQuery = createUpdateQuery({ error: null })
    let actionLookupCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        actionLookupCount += 1
        if (actionLookupCount === 1) {
          return createActionQuery({
            data: {
              id: 'action-1',
              org_id: 'org-1',
              route_scope_type: 'department',
              route_scope_value: 'org-1::department::operations',
              manager_user_id: 'manager-1',
            },
            error: null,
          })
        }

        return updateQuery
      }

      if (table === 'action_center_action_reviews') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-1',
        route_scope_value: 'forged-route',
        decision: 'doorgaan',
        next_step: 'forged decision field',
        expected_effect: 'forged effect field',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
      }),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith({
      action_id: 'action-1',
      reviewed_at: '2026-05-12T09:30:00.000Z',
      observation: 'Dezelfde werkdrukfrictie bleef zichtbaar in twee teams.',
      action_outcome: 'bijsturen-nodig',
      follow_up_note: 'Plan volgende week een kleiner teamgesprek met concrete workload-afspraken.',
      created_by: 'manager-1',
      updated_by: 'manager-1',
    })
    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        primary_action_status: 'in_review',
        updated_by: 'manager-1',
      }),
    )
    expect(updateQuery.eq).toHaveBeenCalledWith('id', 'action-1')

    const payload = await response.json()
    expect(payload.review).toMatchObject({
      action_id: 'action-1',
      action_outcome: 'bijsturen-nodig',
    })
    expect(payload.review).not.toHaveProperty('route_scope_value')
    expect(payload.review).not.toHaveProperty('decision')
    expect(payload.review).not.toHaveProperty('next_step')
    expect(payload.review).not.toHaveProperty('expected_effect')
  })
})
