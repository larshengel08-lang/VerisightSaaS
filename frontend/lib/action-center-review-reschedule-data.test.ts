import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAdminFrom } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { loadActionCenterReviewRescheduleData } from './action-center-review-reschedule-data'

const ROUTE_SOURCE_ID = '11111111-1111-4111-8111-111111111111'
const ORG_ID = '22222222-2222-4222-8222-222222222222'
const ROUTE_SCOPE_VALUE = `${ORG_ID}::department::operations`
const ROUTE_ID = `${ROUTE_SOURCE_ID}::${ROUTE_SCOPE_VALUE}`

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

describe('action center review reschedule data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the canonical review truth with the latest revision state for an ExitScan route', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
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

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      campaignId: ROUTE_SOURCE_ID,
      orgId: ORG_ID,
      routeId: ROUTE_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeScopeType: 'department',
      scanType: 'exit',
      reviewDate: '2026-05-28',
      latestRevision: 2,
      latestOperation: 'reschedule',
      latestReviewDate: '2026-05-28',
      latestPreviousReviewDate: '2026-05-14',
    })
  })

  it('returns the canonical review truth for a RetentieScan route when the shared route contract enables it', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
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

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      campaignId: ROUTE_SOURCE_ID,
      orgId: ORG_ID,
      routeId: ROUTE_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeScopeType: 'department',
      scanType: 'retention',
      reviewDate: '2026-05-28',
      latestRevision: 2,
      latestOperation: 'reschedule',
    })
  })

  it('fails closed when the route is not an enabled Action Center campaign', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
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

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toEqual({
      status: 'unsupported-scan-type',
    })
  })

  it('fails closed when no canonical manager response row exists for the route', async () => {
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
        return createManagerResponseQuery({
          data: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
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

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toEqual({
      status: 'missing-canonical-review-truth',
    })
  })

  it('treats an existing canonical row with a null review date as valid persisted truth after cancel', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            revision: 4,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      campaignId: ROUTE_SOURCE_ID,
      orgId: ORG_ID,
      routeId: ROUTE_ID,
      routeScopeValue: ROUTE_SCOPE_VALUE,
      routeScopeType: 'department',
      scanType: 'exit',
      reviewDate: null,
      latestRevision: 4,
      latestOperation: 'cancel',
      latestReviewDate: null,
      latestPreviousReviewDate: '2026-05-28',
    })
  })

  it('fails closed when the canonical row has a null review date and there is no usable prior revision context', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: null,
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toEqual({
      status: 'missing-canonical-review-truth',
    })
  })

  it('fails closed when current canonical truth is null but the latest revision is not a cancel winner', async () => {
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

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            revision: 4,
            operation: 'reschedule',
            review_date: '2026-06-11',
            previous_review_date: '2026-05-28',
          },
        })
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: ROUTE_ID,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: ORG_ID,
      }),
    ).resolves.toEqual({
      status: 'missing-canonical-review-truth',
    })
  })

  it('canonicalizes mixed-case route identity to the persisted campaign id for revision lookups', async () => {
    const canonicalCampaignId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const mixedCaseRouteSourceId = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'
    const mixedCaseRouteId = `${mixedCaseRouteSourceId}::${ROUTE_SCOPE_VALUE}`
    const latestRevisionQuery = createLatestRevisionQuery({
      data: {
        revision: 6,
        operation: 'reschedule',
        review_date: '2026-06-04',
        previous_review_date: '2026-05-28',
      },
    })

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
        return createManagerResponseQuery({
          data: {
            campaign_id: canonicalCampaignId,
            org_id: ORG_ID,
            route_scope_type: 'department',
            route_scope_value: ROUTE_SCOPE_VALUE,
            review_scheduled_for: '2026-06-04',
          },
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return latestRevisionQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: mixedCaseRouteId,
        routeScopeValue: ROUTE_SCOPE_VALUE,
        routeSourceId: mixedCaseRouteSourceId,
        orgId: ORG_ID,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      campaignId: canonicalCampaignId,
      routeId: `${canonicalCampaignId}::${ROUTE_SCOPE_VALUE}`,
      latestRevision: 6,
    })

    expect(latestRevisionQuery.eq).toHaveBeenCalledWith('route_id', `${canonicalCampaignId}::${ROUTE_SCOPE_VALUE}`)
  })

  it('canonicalizes mixed-case org UUID identity in orgId and routeScopeValue', async () => {
    const canonicalOrgId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    const mixedCaseOrgId = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB'
    const canonicalRouteScopeValue = `${canonicalOrgId}::department::operations`
    const mixedCaseRouteScopeValue = `${mixedCaseOrgId}::department::operations`
    const canonicalRouteId = `${ROUTE_SOURCE_ID}::${canonicalRouteScopeValue}`
    const mixedCaseRouteId = `${ROUTE_SOURCE_ID}::${mixedCaseRouteScopeValue}`
    const latestRevisionQuery = createLatestRevisionQuery({
      data: {
        revision: 6,
        operation: 'reschedule',
        review_date: '2026-06-04',
        previous_review_date: '2026-05-28',
      },
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
        return createManagerResponseQuery({
          data: {
            campaign_id: ROUTE_SOURCE_ID,
            org_id: canonicalOrgId,
            route_scope_type: 'department',
            route_scope_value: canonicalRouteScopeValue,
            review_scheduled_for: '2026-06-04',
          },
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return latestRevisionQuery
      }

      throw new Error(`Unexpected table ${table}`)
    })

    await expect(
      loadActionCenterReviewRescheduleData({
        routeId: mixedCaseRouteId,
        routeScopeValue: mixedCaseRouteScopeValue,
        routeSourceId: ROUTE_SOURCE_ID,
        orgId: mixedCaseOrgId,
      }),
    ).resolves.toMatchObject({
      status: 'ok',
      orgId: canonicalOrgId,
      routeId: canonicalRouteId,
      routeScopeValue: canonicalRouteScopeValue,
      latestRevision: 6,
    })

    expect(latestRevisionQuery.eq).toHaveBeenCalledWith('route_id', canonicalRouteId)
  })
})
