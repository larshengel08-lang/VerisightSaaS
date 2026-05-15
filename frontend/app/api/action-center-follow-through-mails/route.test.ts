import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetDispatchData,
  mockPlanJobs,
  mockRenderMail,
  mockDeliverMail,
  mockAdminFrom,
} = vi.hoisted(() => ({
  mockGetDispatchData: vi.fn(),
  mockPlanJobs: vi.fn(),
  mockRenderMail: vi.fn(),
  mockDeliverMail: vi.fn(),
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/action-center-follow-through-mail-data', () => ({
  getActionCenterFollowThroughMailDispatchData: mockGetDispatchData,
}))

vi.mock('@/lib/action-center-follow-through-mail-planner', () => ({
  planActionCenterFollowThroughMailJobs: mockPlanJobs,
}))

vi.mock('@/lib/action-center-follow-through-mail-render', () => ({
  renderActionCenterFollowThroughMail: mockRenderMail,
}))

vi.mock('@/lib/action-center-follow-through-mail-delivery', () => ({
  deliverActionCenterFollowThroughMail: mockDeliverMail,
  getActionCenterFollowThroughMailEnv: () => ({
    resendApiKey: 're_test',
    emailFrom: 'Verisight <noreply@verisight.nl>',
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { GET, POST } from './route'

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request('https://app.verisight.nl/api/action-center-follow-through-mails', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

function createLedgerSelectQuery(result: { data: unknown; error?: unknown }) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue(result),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}

function createLedgerInsertQuery() {
  return {
    insert: vi.fn().mockResolvedValue({ error: null }),
  }
}

describe('POST /api/action-center-follow-through-mails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BACKEND_ADMIN_TOKEN = 'test-token'

    mockGetDispatchData.mockResolvedValue({
      snapshots: [
        {
          routeId: 'camp-1::org::sales',
          routeScopeValue: 'org-1::department::sales',
          orgId: 'org-1',
          campaignId: 'camp-1',
          campaignName: 'ExitScan Q2',
          scopeLabel: 'Sales',
          scanType: 'exit',
          routeStatus: 'reviewbaar',
          reviewScheduledFor: '2026-05-20',
          reviewCompletedAt: null,
          reviewOutcome: 'geen-uitkomst',
          ownerAssignedAt: '2026-05-10T09:00:00.000Z',
          hasFollowUpTarget: false,
          remindersEnabled: true,
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          managerRecipient: { email: 'manager@example.com', name: 'Manager' },
          hrOversightRecipients: [],
        },
      ],
      routeIds: ['camp-1::org::sales'],
    })

    mockPlanJobs.mockReturnValue({
      jobs: [
        {
          routeId: 'camp-1::org::sales',
          orgId: 'org-1',
          campaignId: 'camp-1',
          campaignName: 'ExitScan Q2',
          scopeLabel: 'Sales',
          routeScopeValue: 'org-1::department::sales',
          triggerType: 'review_upcoming',
          recipientRole: 'manager',
          recipientEmail: 'manager@example.com',
          recipientName: 'Manager',
          sourceMarker: '2026-05-20',
          dedupeKey: 'camp-1::org::sales::review_upcoming::manager@example.com::2026-05-20',
          reviewScheduledFor: '2026-05-20',
        },
      ],
      suppressions: [],
    })

    mockRenderMail.mockReturnValue({
      subject: 'Reviewmoment ExitScan Q2 / Sales',
      emailText: 'Open Action Center',
      emailHtml: '<p>Open Action Center</p>',
    })

    mockDeliverMail.mockResolvedValue({
      ok: true,
      providerMessageId: 're_123',
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_follow_through_mail_events') {
        const selectQuery = createLedgerSelectQuery({ data: [] })
        const insertQuery = createLedgerInsertQuery()
        return {
          ...selectQuery,
          ...insertQuery,
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })
  })

  it('rejects unauthenticated dispatch requests', async () => {
    const response = await POST(makeRequest({ mode: 'dispatch' }))

    expect(response.status).toBe(401)
  })

  it('does not accept Bearer null when trusted secrets are absent', async () => {
    delete process.env.BACKEND_ADMIN_TOKEN
    delete process.env.CRON_SECRET

    const response = await POST(
      makeRequest(
        { mode: 'dispatch' },
        { authorization: 'Bearer null' },
      ),
    )

    expect(response.status).toBe(401)
  })

  it('supports dry-run responses without sending mail', async () => {
    const response = await POST(
      makeRequest(
        { mode: 'dry-run' },
        { authorization: 'Bearer test-token' },
      ),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      mode: 'dry-run',
      plannedCount: 1,
      sentCount: 0,
    })
    expect(mockDeliverMail).not.toHaveBeenCalled()
  })

  it('supports trusted GET dispatches for cron invocations', async () => {
    const response = await GET(
      new Request('https://app.verisight.nl/api/action-center-follow-through-mails', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-token',
        },
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      mode: 'dispatch',
      plannedCount: 1,
    })
  })

  it('blocks non-eligible routes from leaving the dispatcher', async () => {
    const response = await POST(
      makeRequest(
        { mode: 'dispatch', routeIds: ['unknown-route'] },
        { authorization: 'Bearer test-token' },
      ),
    )

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      detail: 'Geen eligible Action Center-routes gevonden voor dispatch.',
    })
  })
})
