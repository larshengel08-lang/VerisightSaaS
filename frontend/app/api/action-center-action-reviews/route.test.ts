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

function createDeleteQuery(result: { error: unknown }) {
  return {
    delete: vi.fn().mockReturnThis(),
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
            primary_action_status: 'in_review',
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
            primary_action_status: 'in_review',
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
            primary_action_status: 'in_review',
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
        primary_action_status: 'open',
        updated_by: 'manager-1',
      }),
    )
    expect(updateQuery.eq).toHaveBeenCalledWith('id', 'action-1')

    const actionUpdate = updateQuery.update.mock.calls[0]?.[0]
    expect(actionUpdate).not.toHaveProperty('closeout_status')
    expect(actionUpdate).not.toHaveProperty('closeout_reason')
    expect(actionUpdate).not.toHaveProperty('closeout_note')
    expect(actionUpdate).not.toHaveProperty('closed_at')
    expect(actionUpdate).not.toHaveProperty('closed_by_role')

    const payload = await response.json()
    expect(payload.review).toMatchObject({
      action_id: 'action-1',
      action_outcome: 'bijsturen-nodig',
    })
    expect(payload.review).not.toHaveProperty('route_scope_value')
    expect(payload.review).not.toHaveProperty('decision')
    expect(payload.review).not.toHaveProperty('next_step')
    expect(payload.review).not.toHaveProperty('expected_effect')
    expect(payload.review).not.toHaveProperty('closeout_status')
    expect(payload.review).not.toHaveProperty('closeout_reason')
    expect(payload.review).not.toHaveProperty('closeout_note')
    expect(payload.review).not.toHaveProperty('closed_at')
    expect(payload.review).not.toHaveProperty('closed_by_role')
  })

  it('rejects review writes when the current action is still a draft', async () => {
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

    const insertQuery = createInsertQuery({ data: null, error: null })
    const updateQuery = createUpdateQuery({ error: null })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        return createActionQuery({
          data: {
            id: 'action-11',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-1',
            primary_action_status: 'draft',
          },
          error: null,
        })
      }

      if (table === 'action_center_action_reviews') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-11',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Te vroeg om dit al als uitgevoerde review te registreren.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'De draft moet eerst echt gestart worden.',
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Route action review is niet toegestaan vanuit de huidige canonieke toestand.',
    })
    expect(insertQuery.insert).not.toHaveBeenCalled()
    expect(updateQuery.update).not.toHaveBeenCalled()
  })

  it('rejects review writes when the current action is blocked', async () => {
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

    const insertQuery = createInsertQuery({ data: null, error: null })
    const updateQuery = createUpdateQuery({ error: null })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        return createActionQuery({
          data: {
            id: 'action-12',
            org_id: 'org-1',
            route_scope_type: 'department',
            route_scope_value: 'org-1::department::operations',
            manager_user_id: 'manager-1',
            primary_action_status: 'blocked',
          },
          error: null,
        })
      }

      if (table === 'action_center_action_reviews') {
        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-12',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Er is nog een expliciete blocker en die is niet eerst in review gebracht.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Los eerst de blocker op en open daarna een review.',
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Route action review is niet toegestaan vanuit de huidige canonieke toestand.',
    })
    expect(insertQuery.insert).not.toHaveBeenCalled()
    expect(updateQuery.update).not.toHaveBeenCalled()
  })

  it('rolls back the inserted review when the action status update fails', async () => {
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
        id: 'review-rollback-1',
        action_id: 'action-13',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Review was inserted before the status update failed.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Compensate if the status write fails.',
      },
      error: null,
    })
    const updateQuery = createUpdateQuery({
      error: { message: 'status update failed' },
    })
    const deleteQuery = createDeleteQuery({ error: null })
    let routeActionTableCalls = 0
    let actionReviewTableCalls = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        routeActionTableCalls += 1
        if (routeActionTableCalls === 1) {
          return createActionQuery({
            data: {
              id: 'action-13',
              org_id: 'org-1',
              route_scope_type: 'department',
              route_scope_value: 'org-1::department::operations',
              manager_user_id: 'manager-1',
              primary_action_status: 'in_review',
            },
            error: null,
          })
        }

        return updateQuery
      }

      if (table === 'action_center_action_reviews') {
        actionReviewTableCalls += 1
        return actionReviewTableCalls === 1 ? insertQuery : deleteQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-13',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Review was inserted before the status update failed.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'Compensate if the status write fails.',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      detail: 'status update failed',
    })
    expect(insertQuery.insert).toHaveBeenCalledTimes(1)
    expect(updateQuery.update).toHaveBeenCalledTimes(1)
    expect(deleteQuery.delete).toHaveBeenCalledTimes(1)
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'review-rollback-1')
  })

  it('returns an explicit combined failure when both the status update and rollback delete fail', async () => {
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
        id: 'review-rollback-2',
        action_id: 'action-14',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Review write succeeded before both follow-up writes failed.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'This should surface a combined failure response.',
      },
      error: null,
    })
    const updateQuery = createUpdateQuery({
      error: { message: 'status update failed' },
    })
    const deleteQuery = createDeleteQuery({
      error: { message: 'rollback delete failed' },
    })
    let routeActionTableCalls = 0
    let actionReviewTableCalls = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_route_actions') {
        routeActionTableCalls += 1
        if (routeActionTableCalls === 1) {
          return createActionQuery({
            data: {
              id: 'action-14',
              org_id: 'org-1',
              route_scope_type: 'department',
              route_scope_value: 'org-1::department::operations',
              manager_user_id: 'manager-1',
              primary_action_status: 'in_review',
            },
            error: null,
          })
        }

        return updateQuery
      }

      if (table === 'action_center_action_reviews') {
        actionReviewTableCalls += 1
        return actionReviewTableCalls === 1 ? insertQuery : deleteQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest({
        action_id: 'action-14',
        reviewed_at: '2026-05-12T09:30:00.000Z',
        observation: 'Review write succeeded before both follow-up writes failed.',
        action_outcome: 'bijsturen-nodig',
        follow_up_note: 'This should surface a combined failure response.',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      detail: 'Route action review opslaan is deels mislukt: statusupdate en rollback faalden.',
    })
    expect(insertQuery.insert).toHaveBeenCalledTimes(1)
    expect(updateQuery.update).toHaveBeenCalledTimes(1)
    expect(deleteQuery.delete).toHaveBeenCalledTimes(1)
    expect(deleteQuery.eq).toHaveBeenCalledWith('id', 'review-rollback-2')
  })
})
