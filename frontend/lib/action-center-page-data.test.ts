import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import type { ActionCenterWorkspaceMember, SuiteAccessContext, SuiteOrgMembership } from '@/lib/suite-access'

const { mockAdminFrom, mockBuildLiveActionCenterItems, mockGetLiveActionCenterSummary } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
  mockBuildLiveActionCenterItems: vi.fn(),
  mockGetLiveActionCenterSummary: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

vi.mock('@/lib/action-center-live', () => ({
  buildLiveActionCenterItems: mockBuildLiveActionCenterItems,
  getLiveActionCenterSummary: mockGetLiveActionCenterSummary,
}))

import { getActionCenterPageData } from './action-center-page-data'

function createThenableQuery(data: unknown) {
  const result = { data }

  const query = {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (onFulfilled: (value: typeof result) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  }

  return query
}

function buildWorkspaceMember(overrides: Partial<ActionCenterWorkspaceMember> = {}): ActionCenterWorkspaceMember {
  return {
    org_id: 'org-1',
    user_id: 'user-1',
    display_name: 'Workspace User',
    login_email: 'user@example.com',
    access_role: 'hr_member',
    scope_type: 'org',
    scope_value: 'org-1',
    can_view: true,
    can_update: false,
    can_assign: false,
    can_schedule_review: true,
    created_at: '2026-05-01T09:00:00.000Z',
    updated_at: '2026-05-02T09:00:00.000Z',
    ...overrides,
  }
}

describe('getActionCenterPageData invite eligibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockBuildLiveActionCenterItems.mockImplementation((contexts: Array<{ campaign: { id: string } }>) =>
      contexts.map((context) => ({
        id: context.campaign.id,
        ownerName: null,
        coreSemantics: {
          route: {
            campaignId: context.campaign.id,
          },
        },
      })),
    )
    mockGetLiveActionCenterSummary.mockReturnValue({ reviewCount: 1 })

    const tableData: Record<string, unknown> = {
      organizations: [
        {
          id: 'org-1',
          name: 'Northwind',
          slug: 'northwind',
          contact_email: 'hr@northwind.example',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      campaigns: [
        {
          id: 'campaign-exit-1',
          organization_id: 'org-1',
          name: 'Exit Operations',
          scan_type: 'exit',
          created_at: '2026-05-01T00:00:00.000Z',
        },
        {
          id: 'campaign-retention-1',
          organization_id: 'org-1',
          name: 'Retention Operations',
          scan_type: 'retention',
          created_at: '2026-05-02T00:00:00.000Z',
        },
      ],
      campaign_stats: [
        {
          campaign_id: 'campaign-exit-1',
          organization_id: 'org-1',
          total_completed: 4,
          total_invited: 4,
          created_at: '2026-05-01T00:00:00.000Z',
        },
        {
          campaign_id: 'campaign-retention-1',
          organization_id: 'org-1',
          total_completed: 3,
          total_invited: 3,
          created_at: '2026-05-02T00:00:00.000Z',
        },
      ],
      campaign_delivery_records: [],
      pilot_learning_dossiers: [],
      action_center_workspace_members: [
        buildWorkspaceMember({
          user_id: 'manager-1',
          display_name: 'Mila Manager',
          login_email: 'mila.manager@northwind.example',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: 'org-1::department::operations',
          can_update: true,
          can_assign: true,
        }),
      ],
      action_center_route_relations: [],
      respondents: [
        {
          campaign_id: 'campaign-exit-1',
          department: 'Operations',
        },
        {
          campaign_id: 'campaign-retention-1',
          department: 'Operations',
        },
      ],
      campaign_delivery_checkpoints: [],
      pilot_learning_checkpoints: [],
      action_center_review_decisions: [],
      action_center_manager_responses: [],
      action_center_route_reopens: [],
      action_center_route_closeouts: [],
    }

    mockAdminFrom.mockImplementation((table: string) => createThenableQuery(tableData[table] ?? []))
  })

  it('keeps visible route-default-enabled routes eligible for hr_member schedulers even without their own manager_assignee row', async () => {
    const context: SuiteAccessContext = {
      persona: 'customer_member',
      isVerisightAdmin: false,
      memberRole: 'member',
      primaryOrgId: 'org-1',
      organizationIds: ['org-1'],
      workspaceOrgIds: ['org-1'],
      managerScopeValues: [],
      canViewInsights: false,
      canViewReports: false,
      canViewActionCenter: true,
      canUpdateActionCenter: false,
      canManageActionCenterAssignments: false,
      canScheduleActionCenterReview: true,
      managerOnly: false,
    }
    const orgMemberships: SuiteOrgMembership[] = [{ org_id: 'org-1', role: 'member' }]
    const currentUserWorkspaceMemberships = [buildWorkspaceMember()]

    const pageData = await getActionCenterPageData({
      context,
      orgMemberships,
      currentUserWorkspaceMemberships,
    })

    const routeId = buildActionCenterRouteId('campaign-exit-1', 'org-1::department::operations')
    const retentionRouteId = buildActionCenterRouteId('campaign-retention-1', 'org-1::department::operations')

    expect(pageData.inviteDownloadEligibleRouteIds).toEqual([routeId, retentionRouteId])

    const liveContexts = mockBuildLiveActionCenterItems.mock.calls[0]?.[0]
    expect(liveContexts).toHaveLength(2)
    expect(liveContexts[0]?.assignedManager).toBeNull()
  })
})
