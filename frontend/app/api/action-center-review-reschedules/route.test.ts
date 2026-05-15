import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockAdminFrom,
  mockSyncActionCenterGraphReview,
  mockResolveReviewInviteContext,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockSyncActionCenterGraphReview: vi.fn(),
  mockResolveReviewInviteContext: vi.fn(),
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

vi.mock('@/lib/action-center-graph-sync', () => ({
  syncActionCenterGraphReview: mockSyncActionCenterGraphReview,
}))

vi.mock('../action-center-review-invites/invite-helpers', () => ({
  resolveReviewInviteContext: mockResolveReviewInviteContext,
}))

import { POST } from './route'

const ROUTE_SOURCE_ID = '11111111-1111-4111-8111-111111111111'
const ORG_ID = '22222222-2222-4222-8222-222222222222'
const ROUTE_SCOPE_VALUE = `${ORG_ID}::department::operations`
const ROUTE_ID = `${ROUTE_SOURCE_ID}::${ROUTE_SCOPE_VALUE}`

function makeRequest(body: Record<string, unknown>) {
  return new Request('https://app.verisight.nl/api/action-center-review-reschedules', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function buildValidBody(overrides: Record<string, unknown> = {}) {
  return {
    operation: 'reschedule',
    routeId: ROUTE_ID,
    routeScopeValue: ROUTE_SCOPE_VALUE,
    routeSourceId: ROUTE_SOURCE_ID,
    orgId: ORG_ID,
    scanType: 'exit',
    reviewDate: '2099-06-03',
    reason: 'manager-beschikbaar',
    ...overrides,
  }
}

function createCampaignQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createManagerResponseQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createLatestRevisionQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createUpdateManagerResponseQuery(result: { data: unknown; error?: unknown }) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
}

function createInsertRevisionQuery(result: { data: unknown; error?: unknown }) {
  return {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

describe('action center review reschedules route', () => {
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
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: ORG_ID, role: 'member' }],
      workspaceMemberships: [
        {
          org_id: ORG_ID,
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
          access_role: 'hr_member',
          scope_type: 'org',
          scope_value: `${ORG_ID}::org::${ORG_ID}`,
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })

    mockResolveReviewInviteContext.mockResolvedValue({
      context: {
        actionCenterOrigin: 'https://app.verisight.nl',
        campaignId: ROUTE_SOURCE_ID,
        campaignName: 'ExitScan Q2',
        managerEmail: 'mila@northwind.example',
        managerName: 'Mila Jansen',
        phase: 1,
        reviewDate: '2026-05-28',
        reviewItemId: ROUTE_ID,
        routeId: ROUTE_ID,
        routeStatus: 'reviewbaar',
        scanType: 'exit',
        scopeLabel: 'Operations',
      },
      orgId: ORG_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeSourceId: ROUTE_SOURCE_ID,
      organizerEmail: 'northwind-hr@example.com',
      persistedScheduleDefaults: {
        latestRevision: 2,
        latestOperation: 'reschedule',
        isCanonicalReviewCancelled: false,
      },
    })

    mockSyncActionCenterGraphReview.mockResolvedValue({
      status: 'linked',
      provider: 'microsoft_graph',
      action: 'updated',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 3,
      reason: null,
    })
  })

  it('requires a logged-in user', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      detail: 'Niet ingelogd.',
    })
  })

  it('rejects writes when the actor is outside the review scheduling boundary', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: false,
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(403)
    expect(mockAdminFrom).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      detail: 'Geen toegang om reviewdatum te beheren.',
    })
  })

  it('rejects blocked route families in this slice', async () => {
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'pulse',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return createUpdateManagerResponseQuery({
          data: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
            },
          })
        }

        return createInsertRevisionQuery({
          data: null,
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(buildValidBody()),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Review reschedule blijft in deze slice beperkt tot ingeschakelde follow-through-routes.',
    })
  })

  it('allows RetentieScan routes through the same bounded reschedule route', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockResolveReviewInviteContext.mockResolvedValue({
      context: {
        actionCenterOrigin: 'https://app.verisight.nl',
        campaignId: ROUTE_SOURCE_ID,
        campaignName: 'RetentieScan Q2',
        managerEmail: 'mila@northwind.example',
        managerName: 'Mila Jansen',
        phase: 1,
        reviewDate: '2026-05-28',
        reviewItemId: ROUTE_ID,
        routeId: ROUTE_ID,
        routeStatus: 'reviewbaar',
        scanType: 'retention',
        scopeLabel: 'Operations',
      },
      orgId: ORG_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeSourceId: ROUTE_SOURCE_ID,
      organizerEmail: 'northwind-hr@example.com',
      persistedScheduleDefaults: {
        latestRevision: 2,
        latestOperation: 'reschedule',
        isCanonicalReviewCancelled: false,
      },
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'retention',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          scanType: 'retention',
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        scan_type: 'retention',
      }),
    )
    expect(mockSyncActionCenterGraphReview).toHaveBeenCalledWith(
      expect.objectContaining({
        scanType: 'retention',
      }),
    )
  })

  it('fails closed when no canonical manager response row exists for the route', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: null,
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Review reschedule vereist bestaande canonieke reviewwaarheid.',
    })
    expect(updateQuery.update).not.toHaveBeenCalled()
    expect(insertQuery.insert).not.toHaveBeenCalled()
  })

  it('fails closed before mutation when the canonical row has a null review date and no prior revision context', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: null,
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: null,
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Review reschedule vereist bestaande canonieke reviewwaarheid.',
    })
    expect(updateQuery.update).not.toHaveBeenCalled()
    expect(insertQuery.insert).not.toHaveBeenCalled()
  })

  it('fails closed before mutation when null current truth is paired with non-cancel latest revision context', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 5,
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: null,
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 4,
              operation: 'reschedule',
              review_date: '2026-06-11',
              previous_review_date: '2026-05-28',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Review reschedule vereist bestaande canonieke reviewwaarheid.',
    })
    expect(updateQuery.update).not.toHaveBeenCalled()
    expect(insertQuery.insert).not.toHaveBeenCalled()
  })

  it('updates the canonical review date and inserts the next revision for reschedules', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(200)
    expect(updateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2099-06-03',
      updated_by: 'user-1',
    })
    expect(insertQuery.insert).toHaveBeenCalledWith({
      org_id: ORG_ID,
      route_id: ROUTE_ID,
      route_scope_value: ROUTE_SCOPE_VALUE,
      route_source_id: ROUTE_SOURCE_ID,
      scan_type: 'exit',
      revision: 3,
      operation: 'reschedule',
      previous_review_date: '2026-05-28',
      review_date: '2099-06-03',
      reason: 'manager-beschikbaar',
      changed_by: 'user-1',
      changed_by_role: 'hr_member',
    })
    expect(mockResolveReviewInviteContext).toHaveBeenCalledWith({
      request: expect.any(Request),
      reviewItemId: ROUTE_ID,
    })
    expect(mockSyncActionCenterGraphReview).toHaveBeenCalledWith({
      orgId: ORG_ID,
      routeId: ROUTE_ID,
      reviewItemId: ROUTE_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeSourceId: ROUTE_SOURCE_ID,
      scanType: 'exit',
      organizerEmail: 'northwind-hr@example.com',
      revision: 3,
      method: 'REQUEST',
      inviteDraft: {
        subject: 'Reviewmoment ExitScan Q2 / Operations',
        emailHtml: expect.stringContaining('Action Center'),
        reviewDate: '2026-05-28',
        recipientEmail: 'mila@northwind.example',
        recipientName: 'Mila Jansen',
      },
    })
    await expect(response.json()).resolves.toEqual({
      revision: 3,
      operation: 'reschedule',
      reviewDate: '2099-06-03',
    })
  })

  it('clears the canonical review date and inserts the next revision for cancellations', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: null,
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 4,
        operation: 'cancel',
        review_date: null,
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 3,
              operation: 'reschedule',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          operation: 'cancel',
          reviewDate: null,
          reason: 'manager-niet-meer-betrokken',
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(updateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: null,
      updated_by: 'user-1',
    })
    expect(insertQuery.insert).toHaveBeenCalledWith({
      org_id: ORG_ID,
      route_id: ROUTE_ID,
      route_scope_value: ROUTE_SCOPE_VALUE,
      route_source_id: ROUTE_SOURCE_ID,
      scan_type: 'exit',
      revision: 4,
      operation: 'cancel',
      previous_review_date: '2026-05-28',
      review_date: null,
      reason: 'manager-niet-meer-betrokken',
      changed_by: 'user-1',
      changed_by_role: 'hr_member',
    })
    expect(mockSyncActionCenterGraphReview).toHaveBeenCalledWith({
      orgId: ORG_ID,
      routeId: ROUTE_ID,
      reviewItemId: ROUTE_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeSourceId: ROUTE_SOURCE_ID,
      scanType: 'exit',
      organizerEmail: 'northwind-hr@example.com',
      revision: 4,
      method: 'CANCEL',
      inviteDraft: {
        subject: 'Reviewmoment ExitScan Q2 / Operations',
        emailHtml: expect.stringContaining('Action Center'),
        reviewDate: '2026-05-28',
        recipientEmail: 'mila@northwind.example',
        recipientName: 'Mila Jansen',
      },
    })
    await expect(response.json()).resolves.toEqual({
      revision: 4,
      operation: 'cancel',
      reviewDate: null,
    })
  })

  it('does not roll back canonical success when Graph mirroring fails after the revision insert', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockSyncActionCenterGraphReview.mockRejectedValue(new Error('graph unavailable'))

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      revision: 3,
      operation: 'reschedule',
      reviewDate: '2099-06-03',
    })
    expect(updateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2099-06-03',
      updated_by: 'user-1',
    })
    expect(insertQuery.insert).toHaveBeenCalled()
  })

  it('fails closed before mutation when cancel is requested for an already-cancelled canonical route', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: null,
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 5,
        operation: 'cancel',
        review_date: null,
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: null,
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 4,
              operation: 'cancel',
              review_date: null,
              previous_review_date: '2026-05-28',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          operation: 'cancel',
          reviewDate: null,
          reason: 'manager-niet-meer-betrokken',
        }),
      ),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Review reschedule vereist bestaande afwijkende reviewwaarheid.',
    })
    expect(updateQuery.update).not.toHaveBeenCalled()
    expect(insertQuery.insert).not.toHaveBeenCalled()
  })

  it('reschedules successfully after a prior cancel while recording the current canonical null state', async () => {
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 5,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: null,
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 4,
              operation: 'cancel',
              review_date: null,
              previous_review_date: '2026-05-28',
            },
          })
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(200)
    expect(insertQuery.insert).toHaveBeenCalledWith({
      org_id: ORG_ID,
      route_id: ROUTE_ID,
      route_scope_value: ROUTE_SCOPE_VALUE,
      route_source_id: ROUTE_SOURCE_ID,
      scan_type: 'exit',
      revision: 5,
      operation: 'reschedule',
      previous_review_date: null,
      review_date: '2099-06-03',
      reason: 'manager-beschikbaar',
      changed_by: 'user-1',
      changed_by_role: 'hr_member',
    })
    await expect(response.json()).resolves.toEqual({
      revision: 5,
      operation: 'reschedule',
      reviewDate: '2099-06-03',
    })
  })

  it('reports when it restores the prior canonical review date after a revision insert failure', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 2,
            operation: 'reschedule',
            review_date: '2026-05-28',
            previous_review_date: '2026-05-14',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(applyUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2099-06-03',
      updated_by: 'user-1',
    })
    expect(rollbackUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2026-05-28',
      updated_by: 'user-1',
    })
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'restored',
    })
  })

  it('reports rollback failure when the compensation write resolves with an error result', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: null,
      error: {
        message: 'rollback failed',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 2,
            operation: 'reschedule',
            review_date: '2026-05-28',
            previous_review_date: '2026-05-14',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(rollbackUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2026-05-28',
      updated_by: 'user-1',
    })
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'failed',
      rollbackDetail: 'rollback failed',
    })
  })

  it('restores the prior canonical review date through the null rollback branch after a cancel insert failure', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: null,
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: null,
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 2,
            operation: 'reschedule',
            review_date: '2026-05-28',
            previous_review_date: '2026-05-14',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          operation: 'cancel',
          reviewDate: null,
        }),
      ),
    )

    expect(response.status).toBe(500)
    expect(applyUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: null,
      updated_by: 'user-1',
    })
    expect(rollbackUpdateQuery.is).toHaveBeenCalledWith('review_scheduled_for', null)
    expect(rollbackUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2026-05-28',
      updated_by: 'user-1',
    })
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'restored',
    })
  })

  it('does not roll back over a concurrent winning revision that already landed', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'duplicate revision',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 3,
            operation: 'reschedule',
            review_date: '2099-06-03',
            previous_review_date: '2026-05-28',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(200)
    expect(rollbackUpdateQuery.update).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      revision: 3,
      operation: 'reschedule',
      reviewDate: '2099-06-03',
    })
  })

  it('reconciles canonical truth to a concurrent winner on the same next revision with a different review date', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'duplicate revision',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 3,
            operation: 'reschedule',
            review_date: '2099-06-10',
            previous_review_date: '2026-05-28',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(rollbackUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2099-06-10',
      updated_by: 'user-1',
    })
    await expect(response.json()).resolves.toEqual({
      detail: 'duplicate revision',
      rollback: 'restored',
    })
  })

  it('reconciles canonical truth when the revision stream has already advanced beyond the failed next revision', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 4,
            operation: 'reschedule',
            review_date: '2099-06-10',
            previous_review_date: '2099-06-03',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(rollbackUpdateQuery.update).toHaveBeenCalledWith({
      review_scheduled_for: '2099-06-10',
      updated_by: 'user-1',
    })
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'restored',
    })
  })

  it('does not roll back when the canonical row no longer reflects this failed attempt', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-10',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2026-05-28',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 2,
            operation: 'reschedule',
            review_date: '2026-05-28',
            previous_review_date: '2026-05-14',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(rollbackUpdateQuery.update).not.toHaveBeenCalled()
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'skipped',
    })
  })

  it('does not overwrite a winner that lands after the rollback read and before the compensating update', async () => {
    const applyUpdateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackReadQuery = createManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const rollbackUpdateQuery = createUpdateManagerResponseQuery({
      data: null,
      error: null,
    })
    const insertQuery = createInsertRevisionQuery({
      data: null,
      error: {
        message: 'insert failed',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        if (managerResponseCallCount === 2) {
          return applyUpdateQuery
        }

        if (managerResponseCallCount === 3) {
          return rollbackReadQuery
        }

        return rollbackUpdateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return createLatestRevisionQuery({
            data: {
              revision: 2,
              operation: 'reschedule',
              review_date: '2026-05-28',
              previous_review_date: '2026-05-14',
            },
          })
        }

        if (revisionCallCount === 2) {
          return insertQuery
        }

        return createLatestRevisionQuery({
          data: {
            revision: 2,
            operation: 'reschedule',
            review_date: '2026-05-28',
            previous_review_date: '2026-05-14',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(makeRequest(buildValidBody()))

    expect(response.status).toBe(500)
    expect(rollbackUpdateQuery.eq).toHaveBeenCalledWith('review_scheduled_for', '2099-06-03')
    await expect(response.json()).resolves.toEqual({
      detail: 'insert failed',
      rollback: 'skipped',
    })
  })

  it('writes revisions onto the canonical route stream when the request uses a mixed-case UUID', async () => {
    const canonicalCampaignId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const mixedCaseRouteSourceId = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'
    const canonicalRouteId = `${canonicalCampaignId}::${ROUTE_SCOPE_VALUE}`
    const mixedCaseRouteId = `${mixedCaseRouteSourceId}::${ROUTE_SCOPE_VALUE}`
    const latestRevisionQuery = createLatestRevisionQuery({
      data: {
        revision: 2,
        operation: 'reschedule',
        review_date: '2026-05-28',
        previous_review_date: '2026-05-14',
      },
    })
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: canonicalCampaignId,
            organization_id: ORG_ID,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: canonicalCampaignId,
              org_id: ORG_ID,
              route_scope_type: 'department',
              route_scope_value: ROUTE_SCOPE_VALUE,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return latestRevisionQuery
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          routeSourceId: mixedCaseRouteSourceId,
          routeId: mixedCaseRouteId,
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(latestRevisionQuery.eq).toHaveBeenCalledWith('route_id', canonicalRouteId)
    expect(insertQuery.insert).toHaveBeenCalledWith({
      org_id: ORG_ID,
      route_id: canonicalRouteId,
      route_scope_value: ROUTE_SCOPE_VALUE,
      route_source_id: canonicalCampaignId,
      scan_type: 'exit',
      revision: 3,
      operation: 'reschedule',
      previous_review_date: '2026-05-28',
      review_date: '2099-06-03',
      reason: 'manager-beschikbaar',
      changed_by: 'user-1',
      changed_by_role: 'hr_member',
    })
  })

  it('writes revisions onto the canonical route stream when org identity is mixed-case but UUID-equivalent', async () => {
    const canonicalOrgId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    const mixedCaseOrgId = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB'
    const canonicalRouteScopeValue = `${canonicalOrgId}::department::operations`
    const mixedCaseRouteScopeValue = `${mixedCaseOrgId}::department::operations`
    const canonicalRouteId = `${ROUTE_SOURCE_ID}::${canonicalRouteScopeValue}`
    const mixedCaseRouteId = `${ROUTE_SOURCE_ID}::${mixedCaseRouteScopeValue}`
    const latestRevisionQuery = createLatestRevisionQuery({
      data: {
        revision: 2,
        operation: 'reschedule',
        review_date: '2026-05-28',
        previous_review_date: '2026-05-14',
      },
    })
    const updateQuery = createUpdateManagerResponseQuery({
      data: {
        review_scheduled_for: '2099-06-03',
      },
    })
    const insertQuery = createInsertRevisionQuery({
      data: {
        revision: 3,
        operation: 'reschedule',
        review_date: '2099-06-03',
      },
    })
    let managerResponseCallCount = 0
    let revisionCallCount = 0

    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: canonicalOrgId, role: 'member' }],
      workspaceMemberships: [
        {
          org_id: canonicalOrgId,
          user_id: 'user-1',
          display_name: 'HR Member',
          login_email: 'hr@northwind.example',
          access_role: 'hr_member',
          scope_type: 'org',
          scope_value: `${canonicalOrgId}::org::${canonicalOrgId}`,
          can_view: true,
          can_update: true,
          can_assign: false,
          can_schedule_review: true,
        },
      ],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createCampaignQuery({
          data: {
            id: ROUTE_SOURCE_ID,
            organization_id: canonicalOrgId,
            scan_type: 'exit',
          },
        })
      }

      if (table === 'action_center_manager_responses') {
        managerResponseCallCount += 1
        if (managerResponseCallCount === 1) {
          return createManagerResponseQuery({
            data: {
              campaign_id: ROUTE_SOURCE_ID,
              org_id: canonicalOrgId,
              route_scope_type: 'department',
              route_scope_value: canonicalRouteScopeValue,
              review_scheduled_for: '2026-05-28',
            },
          })
        }

        return updateQuery
      }

      if (table === 'action_center_review_schedule_revisions') {
        revisionCallCount += 1
        if (revisionCallCount === 1) {
          return latestRevisionQuery
        }

        return insertQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const response = await POST(
      makeRequest(
        buildValidBody({
          orgId: mixedCaseOrgId,
          routeId: mixedCaseRouteId,
          routeScopeValue: mixedCaseRouteScopeValue,
        }),
      ),
    )

    expect(response.status).toBe(200)
    expect(latestRevisionQuery.eq).toHaveBeenCalledWith('route_id', canonicalRouteId)
    expect(insertQuery.insert).toHaveBeenCalledWith({
      org_id: canonicalOrgId,
      route_id: canonicalRouteId,
      route_scope_value: canonicalRouteScopeValue,
      route_source_id: ROUTE_SOURCE_ID,
      scan_type: 'exit',
      revision: 3,
      operation: 'reschedule',
      previous_review_date: '2026-05-28',
      review_date: '2099-06-03',
      reason: 'manager-beschikbaar',
      changed_by: 'user-1',
      changed_by_role: 'hr_member',
    })
  })
})
