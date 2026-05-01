import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const routePath = fileURLToPath(new URL('./route.ts', import.meta.url))

const HR_USER_ID = '11111111-1111-4111-8111-111111111111'
const MANAGER_USER_ID = '22222222-2222-4222-8222-222222222222'
const OTHER_MANAGER_USER_ID = '33333333-3333-4333-8333-333333333333'
const SOURCE_CAMPAIGN_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const TARGET_CAMPAIGN_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const TARGET_NEXT_CAMPAIGN_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const CROSS_ORG_CAMPAIGN_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const OPEN_CAMPAIGN_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
const SOURCE_ITEM_SCOPE_VALUE = `org-1::campaign::${SOURCE_CAMPAIGN_ID}`
const TARGET_ITEM_SCOPE_VALUE = `org-1::campaign::${TARGET_CAMPAIGN_ID}`
const SOURCE_CAMPAIGN_ID_MIXED_CASE = 'AaAaAaAa-AaAa-4aAa-8aAa-AaAaAaAaAaAa'
const TARGET_CAMPAIGN_ID_MIXED_CASE = 'BbBbBbBb-BbBb-4bBb-8bBb-BbBbBbBbBbBb'
const SOURCE_ITEM_SCOPE_VALUE_MIXED_CASE = `org-1::campaign::${SOURCE_CAMPAIGN_ID_MIXED_CASE}`
const TARGET_ITEM_SCOPE_VALUE_MIXED_CASE = `org-1::campaign::${TARGET_CAMPAIGN_ID_MIXED_CASE}`

type MockCampaign = {
  id: string
  organization_id: string
}

type MockRouteCloseout = {
  route_id: string
  closed_at: string | null
}

type MockWorkspaceMembership = {
  org_id: string
  user_id?: string
  access_role: 'hr_owner' | 'hr_member' | 'manager_assignee'
  scope_value: string
  can_update: boolean
}

type MockManagerMembership = {
  org_id: string
  user_id: string
  access_role: 'manager_assignee'
  scope_value: string
  can_view: boolean
  can_update: boolean
}

type MockManagerResponse = Record<string, unknown>

const mockState = {
  user: { id: HR_USER_ID } as { id: string } | null,
  isVerisightAdmin: false,
  memberRole: 'viewer' as 'owner' | 'member' | 'viewer' | null,
  workspaceMemberships: [] as MockWorkspaceMembership[],
  managerWorkspaceMemberships: [] as MockManagerMembership[],
  campaigns: {
    [SOURCE_CAMPAIGN_ID]: {
      id: SOURCE_CAMPAIGN_ID,
      organization_id: 'org-1',
    },
    [OPEN_CAMPAIGN_ID]: {
      id: OPEN_CAMPAIGN_ID,
      organization_id: 'org-1',
    },
    [TARGET_CAMPAIGN_ID]: {
      id: TARGET_CAMPAIGN_ID,
      organization_id: 'org-1',
    },
    [TARGET_NEXT_CAMPAIGN_ID]: {
      id: TARGET_NEXT_CAMPAIGN_ID,
      organization_id: 'org-1',
    },
    [CROSS_ORG_CAMPAIGN_ID]: {
      id: CROSS_ORG_CAMPAIGN_ID,
      organization_id: 'org-2',
    },
  } satisfies Record<string, MockCampaign>,
  routeCloseouts: {
    [`${SOURCE_CAMPAIGN_ID}::org-1::department::operations`]: {
      route_id: `${SOURCE_CAMPAIGN_ID}::org-1::department::operations`,
      closed_at: '2026-04-22T09:00:00.000Z',
    },
  } as Record<string, MockRouteCloseout>,
  existingManagerResponses: [] as MockManagerResponse[],
  createdManagerResponses: [] as MockManagerResponse[],
  deletedManagerResponseIds: [] as string[],
  existingActiveRelations: [] as Array<Record<string, unknown>>,
  insertedRelations: [] as Array<Record<string, unknown>>,
  insertConflict: false,
  managerResponseInsertConflict: false,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: mockState.user,
        },
      }),
    },
  }),
}))

vi.mock('@/lib/suite-access-server', () => ({
  loadSuiteAccessContext: async () => ({
    context: {
      isVerisightAdmin: mockState.isVerisightAdmin,
      memberRole: mockState.memberRole,
    },
    workspaceMemberships: mockState.workspaceMemberships,
    profile: null,
    orgMemberships: mockState.memberRole
      ? [
          {
            org_id: 'org-1',
            role: mockState.memberRole,
          },
        ]
      : [],
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'campaigns') {
        return {
          select: () => ({
            eq: (_column: string, value: string) => ({
              maybeSingle: async () => ({
                data: mockState.campaigns[value] ?? null,
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'action_center_route_closeouts') {
        return {
          select: () => ({
            eq: (_column: string, value: string) => ({
              maybeSingle: async () => ({
                data: mockState.routeCloseouts[value] ?? null,
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'action_center_workspace_members') {
        return {
          select: () => ({
            eq: (_column: string, orgId: string) => ({
              eq: (_column2: string, userId: string) => ({
                eq: (_column3: string, accessRole: string) => ({
                  eq: (_column4: string, scopeValue: string) => ({
                    maybeSingle: async () => ({
                      data:
                        mockState.managerWorkspaceMemberships.find(
                          (membership) =>
                            membership.org_id === orgId &&
                            membership.user_id === userId &&
                            membership.access_role === accessRole &&
                            membership.scope_value === scopeValue,
                        ) ?? null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }

      if (table === 'action_center_route_relations') {
        return {
          select: () => ({
            eq: (firstColumn: string, firstValue: string) => ({
              eq: (secondColumn: string, secondValue: string) => ({
                is: async (thirdColumn: string, thirdValue: unknown) => ({
                  data: mockState.existingActiveRelations.filter((relation) => {
                    const relationRecord = relation as Record<string, unknown>
                    return (
                      relationRecord[firstColumn] === firstValue &&
                      relationRecord[secondColumn] === secondValue &&
                      relationRecord[thirdColumn] === thirdValue
                    )
                  }),
                  error: null,
                }),
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                if (mockState.insertConflict) {
                  return {
                    data: null,
                    error: {
                      code: '23505',
                      message:
                        'duplicate key value violates unique constraint "idx_action_center_route_relations_active_direct_follow_up"',
                    },
                  }
                }

                const inserted = {
                  id: `relation-${mockState.insertedRelations.length + 1}`,
                  ...payload,
                }
                mockState.insertedRelations.push(inserted)
                return {
                  data: inserted,
                  error: null,
                }
              },
            }),
          }),
        }
      }

      if (table === 'action_center_manager_responses') {
        return {
          select: () => ({
            eq: (_column: string, campaignId: string) => ({
              eq: (_column2: string, routeScopeType: string) => ({
                eq: (_column3: string, routeScopeValue: string) => ({
                  maybeSingle: async () => ({
                    data:
                      mockState.existingManagerResponses.find(
                        (response) =>
                          response.campaign_id === campaignId &&
                          response.route_scope_type === routeScopeType &&
                          response.route_scope_value === routeScopeValue,
                      ) ?? null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
          insert: (payload: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                if (mockState.managerResponseInsertConflict) {
                  return {
                    data: null,
                    error: {
                      code: '23505',
                      message:
                        'duplicate key value violates unique constraint "action_center_manager_responses_campaign_id_route_scope_type_route_scope_key"',
                    },
                  }
                }

                const created = {
                  id: `manager-response-${mockState.createdManagerResponses.length + 1}`,
                  ...payload,
                }
                mockState.createdManagerResponses.push(created)
                mockState.existingManagerResponses.push(created)
                return {
                  data: created,
                  error: null,
                }
              },
            }),
          }),
          delete: () => ({
            eq: (_column: string, id: string) => ({
              eq: async (_column2: string, campaignId: string) => {
                mockState.deletedManagerResponseIds.push(id)
                mockState.existingManagerResponses = mockState.existingManagerResponses.filter(
                  (response) => !(response.id === id && response.campaign_id === campaignId),
                )
                return {
                  error: null,
                }
              },
            }),
          }),
        }
      }

      throw new Error(`Unexpected table mocked in follow-up route test: ${table}`)
    },
  }),
}))

beforeEach(() => {
  mockState.user = { id: HR_USER_ID }
  mockState.isVerisightAdmin = false
  mockState.memberRole = 'viewer'
  mockState.workspaceMemberships = []
  mockState.managerWorkspaceMemberships = [
    {
      org_id: 'org-1',
      user_id: MANAGER_USER_ID,
      access_role: 'manager_assignee',
      scope_value: 'org-1::department::operations',
      can_view: true,
      can_update: true,
    },
  ]
  mockState.existingManagerResponses = []
  mockState.createdManagerResponses = []
  mockState.deletedManagerResponseIds = []
  mockState.existingActiveRelations = []
  mockState.insertedRelations = []
  mockState.insertConflict = false
  mockState.managerResponseInsertConflict = false
  mockState.campaigns[SOURCE_CAMPAIGN_ID] = {
    id: SOURCE_CAMPAIGN_ID,
    organization_id: 'org-1',
  }
  mockState.campaigns[OPEN_CAMPAIGN_ID] = {
    id: OPEN_CAMPAIGN_ID,
    organization_id: 'org-1',
  }
  mockState.campaigns[TARGET_CAMPAIGN_ID] = {
    id: TARGET_CAMPAIGN_ID,
    organization_id: 'org-1',
  }
  mockState.campaigns[TARGET_NEXT_CAMPAIGN_ID] = {
    id: TARGET_NEXT_CAMPAIGN_ID,
    organization_id: 'org-1',
  }
  mockState.campaigns[CROSS_ORG_CAMPAIGN_ID] = {
    id: CROSS_ORG_CAMPAIGN_ID,
    organization_id: 'org-2',
  }
  mockState.routeCloseouts = {
    [`${SOURCE_CAMPAIGN_ID}::org-1::department::operations`]: {
      route_id: `${SOURCE_CAMPAIGN_ID}::org-1::department::operations`,
      closed_at: '2026-04-22T09:00:00.000Z',
    },
  }
})

function buildFollowUpRequest(overrides: Record<string, unknown> = {}) {
  return {
    source_campaign_id: SOURCE_CAMPAIGN_ID,
    source_route_scope_value: 'org-1::department::operations',
    target_campaign_id: TARGET_CAMPAIGN_ID,
    target_route_scope_value: 'org-1::department::operations',
    trigger_reason: 'nieuw-campaign-signaal',
    manager_user_id: MANAGER_USER_ID,
    ...overrides,
  }
}

async function postFollowUp(body: Record<string, unknown>) {
  if (!existsSync(routePath)) {
    return new Response(JSON.stringify({ detail: 'Follow-up route API not implemented.' }), {
      status: 501,
      headers: {
        'content-type': 'application/json',
      },
    })
  }

  const routeModule = (await import(pathToFileURL(routePath).href)) as {
    POST?: (request: Request) => Promise<Response>
  }

  if (!routeModule.POST) {
    return new Response(JSON.stringify({ detail: 'Follow-up route POST handler ontbreekt.' }), {
      status: 501,
      headers: {
        'content-type': 'application/json',
      },
    })
  }

  return routeModule.POST(
    new Request('http://localhost/api/action-center-route-follow-ups', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    }),
  )
}

describe('action center route follow-up API contract', () => {
  it('returns 400 when trigger_reason is missing', async () => {
    const request = buildFollowUpRequest()
    delete (request as { trigger_reason?: string }).trigger_reason

    const response = await postFollowUp(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/trigger[_ ]reason/i),
    })
  })

  it('returns 400 when manager_user_id is missing', async () => {
    const request = buildFollowUpRequest()
    delete (request as { manager_user_id?: string }).manager_user_id

    const response = await postFollowUp(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/manager_user_id/i),
    })
  })

  it('returns 400 when source_campaign_id is malformed', async () => {
    const response = await postFollowUp(
      buildFollowUpRequest({
        source_campaign_id: 'not-a-uuid',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/source_campaign_id/i),
    })
  })

  it('returns 400 when target_campaign_id is malformed', async () => {
    const response = await postFollowUp(
      buildFollowUpRequest({
        target_campaign_id: 'not-a-uuid',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/target_campaign_id/i),
    })
  })

  it('returns 400 when manager_user_id is malformed', async () => {
    const response = await postFollowUp(
      buildFollowUpRequest({
        manager_user_id: 'not-a-uuid',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/manager_user_id/i),
    })
  })

  it('returns 403 when a manager-only actor tries to create a follow-up route relation', async () => {
    mockState.memberRole = null
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        access_role: 'manager_assignee',
        scope_value: 'org-1::department::operations',
        can_update: true,
      },
    ]

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/HR|Verisight/i),
    })
  })

  it('returns 403 when a plain org member without explicit HR workspace access tries to create a follow-up route relation', async () => {
    mockState.memberRole = 'member'
    mockState.workspaceMemberships = []

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/HR|Verisight/i),
    })
  })

  it('returns 400 when trigger_reason is invalid', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        trigger_reason: 'onbekend-signaal',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/trigger_reason/i),
    })
  })

  it('returns 400 when manager_user_id is not assigned as a manager for the target route scope', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        manager_user_id: OTHER_MANAGER_USER_ID,
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/manager_user_id|manager assignee/i),
    })
  })

  it('returns 409 when an active direct follow-up relation already exists for the same closed source route', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.existingActiveRelations = [
      {
        id: 'relation-direct-follow-up-1',
        route_relation_type: 'follow-up-from',
        source_route_id: `${SOURCE_CAMPAIGN_ID}::org-1::department::operations`,
        target_route_id: `${TARGET_CAMPAIGN_ID}::org-1::department::operations`,
        trigger_reason: 'nieuw-campaign-signaal',
        ended_at: null,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        target_campaign_id: TARGET_NEXT_CAMPAIGN_ID,
      }),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/active direct follow-up/i),
    })
  })

  it('returns 409 when the source route has no closeout state yet', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    delete mockState.routeCloseouts[`${SOURCE_CAMPAIGN_ID}::org-1::department::operations`]

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/closed source route/i),
    })
  })

  it('returns 400 when source and target campaigns do not belong to the same organization', async () => {
    const response = await postFollowUp(
      buildFollowUpRequest({
        target_campaign_id: CROSS_ORG_CAMPAIGN_ID,
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/zelfde org|same org/i),
    })
  })

  it('returns 400 when the target route scope differs from the closed source route scope', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.managerWorkspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: MANAGER_USER_ID,
        access_role: 'manager_assignee',
        scope_value: 'org-1::department::finance',
        can_view: true,
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        target_route_scope_value: 'org-1::department::finance',
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/zelfde scope|same scope|dezelfde afdeling context/i),
    })
  })

  it('returns 400 when a department-scope follow-up uses a foreign-org department scope value', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        source_route_scope_value: 'org-2::department::operations',
        target_route_scope_value: 'org-2::department::operations',
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/ongeldige|campaign|scope|afdeling/i),
    })
  })

  it('returns 400 when a department-scope follow-up uses a malformed department scope value', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        source_route_scope_value: 'org-1::department::operations::extra',
        target_route_scope_value: 'org-1::department::operations::extra',
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/ongeldige|campaign|scope|afdeling/i),
    })
  })

  it('returns 400 when an item-scope follow-up is requested because V1 only supports department scopes', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.managerWorkspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: MANAGER_USER_ID,
        access_role: 'manager_assignee',
        scope_value: TARGET_ITEM_SCOPE_VALUE,
        can_view: true,
        can_update: true,
      },
    ]
    mockState.routeCloseouts[`${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`] = {
      route_id: `${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`,
      closed_at: '2026-04-22T09:00:00.000Z',
    }

    const response = await postFollowUp(
      buildFollowUpRequest({
        source_route_scope_value: SOURCE_ITEM_SCOPE_VALUE,
        target_route_scope_value: TARGET_ITEM_SCOPE_VALUE,
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/V1 follow-up routes|department scopes|alleen.*department/i),
    })
  })

  it('returns 400 for mixed-case item-scope follow-up requests because V1 only supports department scopes', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.managerWorkspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: MANAGER_USER_ID,
        access_role: 'manager_assignee',
        scope_value: TARGET_ITEM_SCOPE_VALUE,
        can_view: true,
        can_update: true,
      },
    ]
    mockState.routeCloseouts[`${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`] = {
      route_id: `${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`,
      closed_at: '2026-04-22T09:00:00.000Z',
    }

    const response = await postFollowUp(
      buildFollowUpRequest({
        source_campaign_id: SOURCE_CAMPAIGN_ID_MIXED_CASE,
        source_route_scope_value: SOURCE_ITEM_SCOPE_VALUE_MIXED_CASE,
        target_campaign_id: TARGET_CAMPAIGN_ID_MIXED_CASE,
        target_route_scope_value: TARGET_ITEM_SCOPE_VALUE_MIXED_CASE,
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/V1 follow-up routes|department scopes|alleen.*department/i),
    })
  })

  it('returns 400 when an item-scope target is supplied because V1 only supports department scopes', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.managerWorkspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: MANAGER_USER_ID,
        access_role: 'manager_assignee',
        scope_value: SOURCE_ITEM_SCOPE_VALUE,
        can_view: true,
        can_update: true,
      },
    ]
    mockState.routeCloseouts[`${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`] = {
      route_id: `${SOURCE_CAMPAIGN_ID}::${SOURCE_ITEM_SCOPE_VALUE}`,
      closed_at: '2026-04-22T09:00:00.000Z',
    }

    const response = await postFollowUp(
      buildFollowUpRequest({
        source_route_scope_value: SOURCE_ITEM_SCOPE_VALUE,
        target_route_scope_value: SOURCE_ITEM_SCOPE_VALUE,
      }),
    )

    expect(response.status).toBe(400)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/V1 follow-up routes|department scopes|alleen.*department/i),
    })
  })

  it('returns 409 when source and target resolve to the same route instead of a new follow-up handoff', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        target_campaign_id: SOURCE_CAMPAIGN_ID,
      }),
    )

    expect(response.status).toBe(409)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/nieuwe route|zelfde route|follow-up handoff/i),
    })
  })

  it('returns 409 when a target route manager response already exists so the handoff would overwrite manager-owned data', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.existingManagerResponses = [
      {
        id: 'manager-response-existing-1',
        campaign_id: TARGET_CAMPAIGN_ID,
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: MANAGER_USER_ID,
        response_type: 'watch',
        response_note: 'Bestaande managerreactie.',
      },
    ]

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(409)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/manager response|managerreactie|bestaat al/i),
    })
  })

  it('persists trigger_reason on a new follow-up relation row for a matching manager assignee', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.existingActiveRelations = [
      {
        id: 'relation-unrelated-type',
        route_relation_type: 'depends-on',
        source_route_id: `${SOURCE_CAMPAIGN_ID}::org-1::department::operations`,
        target_route_id: `${TARGET_CAMPAIGN_ID}::org-1::department::operations`,
        trigger_reason: 'nieuw-campaign-signaal',
        ended_at: null,
      },
      {
        id: 'relation-unrelated-source',
        route_relation_type: 'follow-up-from',
        source_route_id: `${TARGET_NEXT_CAMPAIGN_ID}::org-1::department::operations`,
        target_route_id: `${TARGET_CAMPAIGN_ID}::org-1::department::operations`,
        trigger_reason: 'nieuw-campaign-signaal',
        ended_at: null,
      },
    ]

    const response = await postFollowUp(
      buildFollowUpRequest({
        trigger_reason: 'hernieuwde-hr-beoordeling',
        manager_user_id: MANAGER_USER_ID,
      }),
    )

    expect(response.status).toBe(201)
    expect(mockState.createdManagerResponses).toHaveLength(1)
    expect(mockState.createdManagerResponses[0]).toMatchObject({
      campaign_id: TARGET_CAMPAIGN_ID,
      org_id: 'org-1',
      route_scope_type: 'department',
      route_scope_value: 'org-1::department::operations',
      manager_user_id: MANAGER_USER_ID,
      response_type: 'schedule',
      response_note: 'Vervolgroute geopend door HR.',
      primary_action_theme_key: null,
      primary_action_text: null,
      primary_action_expected_effect: null,
      primary_action_status: null,
      created_by: HR_USER_ID,
      updated_by: HR_USER_ID,
    })
    expect(mockState.createdManagerResponses[0].review_scheduled_for).toEqual(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
    expect(mockState.insertedRelations).toHaveLength(1)
    expect(mockState.insertedRelations[0]).toMatchObject({
      org_id: 'org-1',
      route_relation_type: 'follow-up-from',
      source_campaign_id: SOURCE_CAMPAIGN_ID,
      source_route_id: `${SOURCE_CAMPAIGN_ID}::org-1::department::operations`,
      source_route_scope_value: 'org-1::department::operations',
      target_campaign_id: TARGET_CAMPAIGN_ID,
      target_route_id: `${TARGET_CAMPAIGN_ID}::org-1::department::operations`,
      target_route_scope_value: 'org-1::department::operations',
      trigger_reason: 'hernieuwde-hr-beoordeling',
      recorded_by: HR_USER_ID,
      recorded_by_role: 'hr_member',
      manager_user_id: MANAGER_USER_ID,
      ended_at: null,
    })
    await expect(response.json()).resolves.toMatchObject({
      relation: expect.objectContaining({
        trigger_reason: 'hernieuwde-hr-beoordeling',
        manager_user_id: MANAGER_USER_ID,
      }),
    })
  })

  it('returns 409 when the insert hits the active direct follow-up unique constraint', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.insertConflict = true

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(409)
    expect(mockState.createdManagerResponses).toHaveLength(1)
    expect(mockState.deletedManagerResponseIds).toEqual(['manager-response-1'])
    expect(mockState.existingManagerResponses).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/active direct follow-up/i),
    })
  })

  it('returns 409 when the manager response carrier insert hits the unique constraint first', async () => {
    mockState.workspaceMemberships = [
      {
        org_id: 'org-1',
        user_id: HR_USER_ID,
        access_role: 'hr_member',
        scope_value: 'org-1::org::org-1',
        can_update: true,
      },
    ]
    mockState.managerResponseInsertConflict = true

    const response = await postFollowUp(buildFollowUpRequest())

    expect(response.status).toBe(409)
    expect(mockState.createdManagerResponses).toHaveLength(0)
    expect(mockState.deletedManagerResponseIds).toHaveLength(0)
    expect(mockState.insertedRelations).toHaveLength(0)
    await expect(response.json()).resolves.toMatchObject({
      detail: expect.stringMatching(/manager response carrier|overschrijven is in V1 niet toegestaan|bestaat al/i),
    })
  })
})
