import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockGetActionCenterPageData,
  mockAdminFrom,
  mockSyncActionCenterGraphReview,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockGetActionCenterPageData: vi.fn(),
  mockAdminFrom: vi.fn(),
  mockSyncActionCenterGraphReview: vi.fn(),
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

vi.mock('@/lib/action-center-page-data', () => ({
  getActionCenterPageData: mockGetActionCenterPageData,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

vi.mock('@/lib/action-center-graph-sync', () => ({
  syncActionCenterGraphReview: mockSyncActionCenterGraphReview,
}))

import { getCanonicalInviteOrigin } from './invite-helpers'
import { GET, POST } from './route'

const mockItem = {
  id: 'cmp-exit-1::org-1::department::operations',
  orgId: 'org-1',
  title: 'ExitScan: Operations',
  teamLabel: 'Operations',
  reviewDate: '2026-05-28',
  reviewReason: 'Toets of de eerste managementactie effect laat zien.',
  status: 'reviewbaar',
  sourceLabel: 'ExitScan',
  coreSemantics: {
    route: {
      routeId: 'cmp-exit-1::org-1::department::operations',
      campaignId: 'cmp-exit-1',
    },
  },
} as const

const originalEnv = {
  FRONTEND_URL: process.env.FRONTEND_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}

function restoreEnvVar(key: 'FRONTEND_URL' | 'NEXT_PUBLIC_SITE_URL' | 'NEXT_PUBLIC_APP_URL', value: string | undefined) {
  if (typeof value === 'undefined') {
    delete process.env[key]
    return
  }

  process.env[key] = value
}

function buildManagerMembershipRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    org_id: 'org-1',
    access_role: 'manager_assignee',
    scope_value: 'org-1::department::operations',
    login_email: 'mila@northwind.example',
    display_name: 'Mila Jansen',
    can_view: true,
    ...overrides,
  }
}

function buildManagerResponseRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    campaign_id: 'cmp-exit-1',
    org_id: 'org-1',
    route_scope_type: 'department',
    route_scope_value: 'org-1::department::operations',
    review_scheduled_for: '2026-05-28',
    ...overrides,
  }
}

function createMaybeSingleQuery(result: { data: Record<string, unknown> | null; error: unknown }) {
  const filters = new Map<string, unknown>()

  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn((column: string, value: unknown) => {
      filters.set(column, value)
      return query
    }),
    maybeSingle: vi.fn().mockImplementation(async () => {
      const matches =
        result.data &&
        [...filters.entries()].every(([column, value]) => result.data?.[column] === value)

      return {
        data: matches ? result.data : null,
        error: result.error,
      }
    }),
  }

  return query
}

function createLatestRevisionQuery(result: { data: Record<string, unknown> | null; error: unknown }) {
  const filters = new Map<string, unknown>()

  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn((column: string, value: unknown) => {
      filters.set(column, value)
      return query
    }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockImplementation(async () => {
      const matches =
        result.data &&
        [...filters.entries()].every(([column, value]) => result.data?.[column] === value)

      return {
        data: matches ? result.data : null,
        error: result.error,
      }
    }),
  }

  return query
}

describe('action center review invite route', () => {
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
        canScheduleActionCenterReview: true,
        canManageActionCenterAssignments: true,
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    mockGetActionCenterPageData.mockResolvedValue({
      items: [mockItem],
      summary: { reviewCount: 1 },
      ownerOptions: [],
      managerOptions: [],
      itemHrefs: {},
      organizationNames: ['Northwind'],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow(),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: null,
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    mockSyncActionCenterGraphReview.mockResolvedValue({
      status: 'linked',
      provider: 'microsoft_graph',
      action: 'created',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 2,
      reason: null,
    })
  })

  afterEach(() => {
    restoreEnvVar('FRONTEND_URL', originalEnv.FRONTEND_URL)
    restoreEnvVar('NEXT_PUBLIC_SITE_URL', originalEnv.NEXT_PUBLIC_SITE_URL)
    restoreEnvVar('NEXT_PUBLIC_APP_URL', originalEnv.NEXT_PUBLIC_APP_URL)
  })

  it('returns 400 when reviewItemId is missing on POST', async () => {
    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      detail: 'reviewItemId is verplicht.',
    })
  })

  it('requires a logged-in user', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      detail: 'Niet ingelogd.',
    })
  })

  it('requires Action Center access', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: false,
        canScheduleActionCenterReview: false,
        canManageActionCenterAssignments: false,
        organizationIds: [],
        workspaceOrgIds: [],
        isVerisightAdmin: false,
      },
      orgMemberships: [],
      workspaceMemberships: [],
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      detail: 'Geen toegang tot Action Center.',
    })
  })

  it('requires the dedicated review scheduling capability', async () => {
    mockLoadSuiteAccessContext.mockResolvedValue({
      context: {
        canViewActionCenter: true,
        canScheduleActionCenterReview: false,
        canManageActionCenterAssignments: false,
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        isVerisightAdmin: false,
      },
      orgMemberships: [{ org_id: 'org-1', role: 'member' }],
      workspaceMemberships: [],
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({
      detail: 'Geen toegang om reviewuitnodigingen te plannen.',
    })
  })

  it('returns 404 when the selected review item is not visible in Action Center page data', async () => {
    mockGetActionCenterPageData.mockResolvedValue({
      items: [],
      summary: { reviewCount: 0 },
      ownerOptions: [],
      managerOptions: [],
      itemHrefs: {},
      organizationNames: ['Northwind'],
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: 'missing-item',
        }),
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      detail: 'Reviewmoment niet gevonden.',
    })
  })

  it('returns preview json for POST', async () => {
    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
          revision: 2.7,
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.subject).toBe('Reviewmoment ExitScan Q2 / Operations')
    expect(payload.deliveryModel).toEqual({
      channel: 'email-ics',
      organizerMode: 'organizer',
      nativeMicrosoftRequired: false,
    })
    expect(payload.writePolicy).toEqual({
      calendarRsvp: 'hint-only',
      canonicalReviewState: 'action-center-only',
    })
    expect(payload.actionCenterHref).toContain('/action-center?focus=')
    expect(payload.revision).toBe(2)
    expect(payload.method).toBe('REQUEST')
    expect(payload.organizerEmail).toBe('northwind-hr@example.com')
  })

  it('can explicitly trigger bounded Outlook sync on POST without changing the default preview contract', async () => {
    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
          revision: 2,
          syncProvider: 'microsoft_graph',
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.graphSync).toEqual({
      status: 'linked',
      provider: 'microsoft_graph',
      action: 'created',
      eventId: 'graph-event-1',
      iCalUId: 'ical-1',
      lastSyncedRevision: 2,
      reason: null,
    })
    expect(mockSyncActionCenterGraphReview).toHaveBeenCalledWith({
      orgId: 'org-1',
      routeId: mockItem.id,
      reviewItemId: mockItem.id,
      routeScopeValue: 'org-1::department::operations',
      routeSourceId: 'cmp-exit-1',
      scanType: 'exit',
      organizerEmail: 'northwind-hr@example.com',
      revision: 2,
      method: 'REQUEST',
      inviteDraft: {
        subject: 'Reviewmoment ExitScan Q2 / Operations',
        emailHtml: expect.stringContaining('Action Center'),
        reviewDate: '2026-05-28',
        recipientEmail: 'mila@northwind.example',
        recipientName: 'Mila Jansen',
      },
    })
  })

  it('returns preview json by default on GET', async () => {
    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=3&mode=cancel`,
      ),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.reviewItemId).toBe(mockItem.id)
    expect(payload.revision).toBe(3)
    expect(payload.method).toBe('CANCEL')
    expect(payload.organizerEmail).toBe('northwind-hr@example.com')
  })

  it('accepts uppercase echoed mode values on GET without degrading CANCEL to REQUEST', async () => {
    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=4&mode=CANCEL&format=ics`,
      ),
    )

    expect(response.status).toBe(200)
    const body = await response.text()
    expect(body).toContain('METHOD:CANCEL')
    expect(body).toContain('STATUS:CANCELLED')
    expect(body).toContain('SEQUENCE:4')
  })

  it('normalizes non-integer revision values consistently on GET', async () => {
    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=3.9`,
      ),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.revision).toBe(3)
    expect(payload.method).toBe('REQUEST')
  })

  it('returns a downloadable .ics artifact when format=ics is requested', async () => {
    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=3&mode=request&format=ics`,
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/calendar; charset=utf-8')
    expect(response.headers.get('content-disposition')).toContain('attachment; filename=')
    const body = await response.text()
    expect(body).toContain('METHOD:REQUEST')
    expect(body).toContain('SEQUENCE:3')
    expect(body).toContain('ORGANIZER:mailto:northwind-hr@example.com')
  })

  it('uses the persisted latest cancel revision state by default on GET preview when no override is supplied', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}`,
      ),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.reviewItemId).toBe(mockItem.id)
    expect(payload.reviewDate).toBe('2026-05-28')
    expect(payload.revision).toBe(5)
    expect(payload.method).toBe('CANCEL')
    expect(payload.organizerEmail).toBe('northwind-hr@example.com')
  })

  it('uses the persisted latest cancel revision state by default for .ics downloads when no override is supplied', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&format=ics`,
      ),
    )

    expect(response.status).toBe(200)
    const body = await response.text()
    expect(body).toContain('METHOD:CANCEL')
    expect(body).toContain('STATUS:CANCELLED')
    expect(body).toContain('SEQUENCE:5')
  })

  it('still honors explicit revision and mode overrides when persisted cancel state exists', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=8&mode=request`,
      ),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.revision).toBe(8)
    expect(payload.method).toBe('REQUEST')
  })

  it('uses persisted cancel defaults on POST preview when no override is supplied', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.revision).toBe(5)
    expect(payload.method).toBe('CANCEL')
  })

  it('falls back to persisted cancel defaults when POST override inputs are blank or invalid', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
          revision: 'abc',
          mode: '',
        }),
      }),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.revision).toBe(5)
    expect(payload.method).toBe('CANCEL')
  })

  it('falls back to persisted cancel defaults when GET override query params are blank or invalid', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow({
            review_scheduled_for: null,
          }),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: {
            route_id: mockItem.coreSemantics.route.routeId,
            revision: 5,
            operation: 'cancel',
            review_date: null,
            previous_review_date: '2026-05-28',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await GET(
      new Request(
        `https://app.verisight.nl/api/action-center-review-invites?reviewItemId=${encodeURIComponent(mockItem.id)}&revision=abc&mode=`,
      ),
    )

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.revision).toBe(5)
    expect(payload.method).toBe('CANCEL')
  })

  it('fails closed when the fetched campaign org does not match the selected review item org', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-2',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: campaign-org-mismatch.',
    })
  })

  it('fails closed when canonical review schedule truth cannot be established', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow(),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: null,
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: null,
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-canonical-review-truth.',
    })
  })

  it('returns 409 when invite eligibility fails', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow({
            login_email: '',
          }),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow(),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: null,
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-manager-email.',
    })
  })

  it('fails closed when the manager assignment is not viewable in the shared Action Center eligibility path', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'campaigns') {
        return createMaybeSingleQuery({
          data: {
            id: 'cmp-exit-1',
            name: 'ExitScan Q2',
            scan_type: 'exit',
            organization_id: 'org-1',
          },
          error: null,
        })
      }

      if (table === 'organizations') {
        return createMaybeSingleQuery({
          data: {
            id: 'org-1',
            name: 'Northwind',
            contact_email: 'northwind-hr@example.com',
          },
          error: null,
        })
      }

      if (table === 'action_center_workspace_members') {
        return createMaybeSingleQuery({
          data: buildManagerMembershipRow({
            can_view: false,
          }),
          error: null,
        })
      }

      if (table === 'action_center_manager_responses') {
        return createMaybeSingleQuery({
          data: buildManagerResponseRow(),
          error: null,
        })
      }

      if (table === 'action_center_review_schedule_revisions') {
        return createLatestRevisionQuery({
          data: null,
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })

    const response = await POST(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        method: 'POST',
        body: JSON.stringify({
          reviewItemId: mockItem.id,
        }),
      }),
    )

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-manager-email.',
    })
  })

  it('uses the request URL origin instead of forwarded host headers when no site URL env var is configured', () => {
    delete process.env.FRONTEND_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_APP_URL

    const origin = getCanonicalInviteOrigin(
      new Request('https://app.verisight.nl/api/action-center-review-invites', {
        headers: {
          'x-forwarded-host': 'evil.example',
          'x-forwarded-proto': 'http',
        },
      }),
    )

    expect(origin).toBe('https://app.verisight.nl')
  })
})
