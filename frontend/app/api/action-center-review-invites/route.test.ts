import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetUser,
  mockLoadSuiteAccessContext,
  mockGetActionCenterPageData,
  mockAdminFrom,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockLoadSuiteAccessContext: vi.fn(),
  mockGetActionCenterPageData: vi.fn(),
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

vi.mock('@/lib/action-center-page-data', () => ({
  getActionCenterPageData: mockGetActionCenterPageData,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

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

function createMaybeSingleQuery(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
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
          data: {
            login_email: 'mila@northwind.example',
            display_name: 'Mila Jansen',
          },
          error: null,
        })
      }

      throw new Error(`Unhandled table ${table}`)
    })
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
          data: {
            login_email: 'mila@northwind.example',
            display_name: 'Mila Jansen',
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

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: campaign-org-mismatch.',
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
          data: {
            login_email: '',
            display_name: 'Mila Jansen',
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

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      detail: 'Reviewuitnodiging kan nog niet worden opgebouwd: missing-manager-email.',
    })
  })
})
