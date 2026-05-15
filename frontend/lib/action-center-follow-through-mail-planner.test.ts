import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetActionCenterPageData, mockAdminFrom } = vi.hoisted(() => ({
  mockGetActionCenterPageData: vi.fn(),
  mockAdminFrom: vi.fn(),
}))

vi.mock('@/lib/action-center-page-data', () => ({
  getActionCenterPageData: mockGetActionCenterPageData,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

import { planActionCenterFollowThroughMailJobs } from './action-center-follow-through-mail-planner'
import { getActionCenterFollowThroughMailData } from './action-center-follow-through-mail-data'

describe('action center follow-through mail planner', () => {
  const baseSnapshot = {
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
    hrOversightRecipients: [{ email: 'hr-owner@example.com', auditRole: 'hr_owner' }],
  } as const

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emits assignment-created once per owner-assignment marker', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-12T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(result.jobs.some((job) => job.triggerType === 'assignment_created')).toBe(true)
  })

  it('suppresses review-upcoming when the review moved outside the current reminder window', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-01T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(result.jobs.some((job) => job.triggerType === 'review_upcoming')).toBe(false)
  })

  it('adds an HR oversight variant when review-overdue crosses the escalation window', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-29T08:00:00.000Z'),
      snapshots: [baseSnapshot],
      existingDedupeKeys: new Set<string>(),
    })

    expect(
      result.jobs.filter((job) => job.triggerType === 'review_overdue').map((job) => job.recipientRole),
    ).toEqual(expect.arrayContaining(['manager', 'hr_oversight']))
  })

  it('suppresses a planned review reminder when the canonical review date changed after scheduling', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-18T08:00:00.000Z'),
      snapshots: [
        {
          ...baseSnapshot,
          reviewScheduledFor: '2026-05-25',
          reminderLeadDays: 7,
        },
      ],
      existingDedupeKeys: new Set([
        'camp-1::org::sales::review_upcoming::manager@example.com::2026-05-20',
      ]),
    })

    expect(result.jobs.find((job) => job.sourceMarker === '2026-05-20')).toBeUndefined()
    expect(
      result.jobs.find(
        (job) =>
          job.triggerType === 'review_upcoming' &&
          job.sourceMarker === '2026-05-25',
      ),
    ).toBeDefined()
  })

  it('suppresses follow-up-open-after-review when the route already has a successor', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-06-10T08:00:00.000Z'),
      snapshots: [
        {
          ...baseSnapshot,
          reviewCompletedAt: '2026-05-25T12:00:00.000Z',
          reviewOutcome: 'doorgaan',
          hasFollowUpTarget: true,
        },
      ],
      existingDedupeKeys: new Set<string>(),
    })

    expect(result.jobs.some((job) => job.triggerType === 'follow_up_open_after_review')).toBe(false)
  })

  it('keeps manager and hr-overdue variants distinct when they share one mailbox', () => {
    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-29T08:00:00.000Z'),
      snapshots: [
        {
          ...baseSnapshot,
          hrOversightRecipients: [{ email: 'manager@example.com', auditRole: 'hr_owner' }],
        },
      ],
      existingDedupeKeys: new Set<string>(),
    })

    expect(
      result.jobs
        .filter((job) => job.triggerType === 'review_overdue')
        .map((job) => `${job.recipientRole}:${job.dedupeKey}`),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('manager'),
        expect.stringContaining('hr_oversight'),
      ]),
    )
  })

  it('uses the latest canonical review date when planning reminders after a reschedule', async () => {
    mockGetActionCenterPageData.mockResolvedValue({
      items: [
        {
          id: 'camp-1::org-1::department::sales',
          sourceLabel: 'ExitScan',
          orgId: 'org-1',
          teamId: 'org-1::department::sales',
          teamLabel: 'Sales',
          status: 'reviewbaar',
          reviewDate: '2026-05-20',
          coreSemantics: {
            route: {
              campaignId: 'camp-1',
              reviewCompletedAt: null,
              reviewOutcome: 'geen-uitkomst',
              ownerAssignedAt: '2026-05-10T09:00:00.000Z',
              hasFollowUpTarget: false,
            },
          },
        },
      ],
      routeIds: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_workspace_members') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                org_id: 'org-1',
                user_id: 'mgr-1',
                display_name: 'Manager',
                login_email: 'manager@example.com',
                access_role: 'manager_assignee',
                scope_type: 'department',
                scope_value: 'org-1::department::sales',
                can_view: true,
                can_update: false,
                can_schedule_review: false,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_review_rhythm_configs') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                route_id: 'camp-1::org-1::department::sales',
                cadence_days: 14,
                reminder_lead_days: 5,
                escalation_lead_days: 7,
                reminders_enabled: true,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'campaigns') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'camp-1',
                name: 'ExitScan Q2',
                organization_id: 'org-1',
                scan_type: 'exit',
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_manager_responses') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                campaign_id: 'camp-1',
                route_scope_type: 'department',
                route_scope_value: 'org-1::department::sales',
                review_scheduled_for: '2026-05-20',
                updated_at: '2026-05-10T09:00:00.000Z',
              },
              {
                campaign_id: 'camp-1',
                route_scope_type: 'department',
                route_scope_value: 'org-1::department::sales',
                review_scheduled_for: '2026-05-23',
                updated_at: '2026-05-12T09:00:00.000Z',
              },
            ],
            error: null,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const { snapshots } = await getActionCenterFollowThroughMailData({
      context: {
        persona: 'verisight_admin',
        isVerisightAdmin: true,
        memberRole: null,
        primaryOrgId: 'org-1',
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        managerScopeValues: [],
        canViewInsights: true,
        canViewReports: true,
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canManageActionCenterAssignments: true,
        canScheduleActionCenterReview: true,
        managerOnly: false,
      },
      orgMemberships: [],
      currentUserWorkspaceMemberships: [],
    })

    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-18T08:00:00.000Z'),
      snapshots,
      existingDedupeKeys: new Set([
        'camp-1::org-1::department::sales::review_upcoming::manager@example.com::2026-05-20',
      ]),
    })

    expect(result.jobs.find((job) => job.sourceMarker === '2026-05-20')).toBeUndefined()
    expect(result.jobs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          triggerType: 'review_upcoming',
          sourceMarker: '2026-05-23',
          reviewScheduledFor: '2026-05-23',
        }),
      ]),
    )
  })

  it('keeps RetentieScan routes in the shared follow-through loader when route defaults enable them', async () => {
    mockGetActionCenterPageData.mockResolvedValue({
      items: [
        {
          id: 'camp-2::org-1::department::sales',
          sourceLabel: 'RetentieScan',
          orgId: 'org-1',
          teamId: 'org-1::department::sales',
          teamLabel: 'Sales',
          status: 'reviewbaar',
          reviewDate: '2026-05-20',
          coreSemantics: {
            route: {
              campaignId: 'camp-2',
              reviewCompletedAt: null,
              reviewOutcome: 'geen-uitkomst',
              ownerAssignedAt: '2026-05-10T09:00:00.000Z',
              hasFollowUpTarget: false,
            },
          },
        },
      ],
      routeIds: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_workspace_members') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                org_id: 'org-1',
                user_id: 'mgr-1',
                display_name: 'Manager',
                login_email: 'manager@example.com',
                access_role: 'manager_assignee',
                scope_type: 'department',
                scope_value: 'org-1::department::sales',
                can_view: true,
                can_update: false,
                can_schedule_review: false,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_review_rhythm_configs') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                route_id: 'camp-2::org-1::department::sales',
                cadence_days: 14,
                reminder_lead_days: 5,
                escalation_lead_days: 7,
                reminders_enabled: true,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'campaigns') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'camp-2',
                name: 'RetentionScan Q2',
                organization_id: 'org-1',
                scan_type: 'retention',
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_manager_responses') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                campaign_id: 'camp-2',
                route_scope_type: 'department',
                route_scope_value: 'org-1::department::sales',
                review_scheduled_for: '2026-05-23',
                updated_at: '2026-05-12T09:00:00.000Z',
              },
            ],
            error: null,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const { snapshots, routeIds } = await getActionCenterFollowThroughMailData({
      context: {
        persona: 'verisight_admin',
        isVerisightAdmin: true,
        memberRole: null,
        primaryOrgId: 'org-1',
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        managerScopeValues: [],
        canViewInsights: true,
        canViewReports: true,
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canManageActionCenterAssignments: true,
        canScheduleActionCenterReview: true,
        managerOnly: false,
      },
      orgMemberships: [],
      currentUserWorkspaceMemberships: [],
    })

    expect(routeIds).toEqual(['camp-2::org-1::department::sales'])
    expect(snapshots).toEqual([
      expect.objectContaining({
        routeId: 'camp-2::org-1::department::sales',
        scanType: 'retention',
        campaignName: 'RetentionScan Q2',
        reviewScheduledFor: '2026-05-23',
      }),
    ])
  })

  it('suppresses review reminders when canonical manager-response truth cleared the review date', async () => {
    mockGetActionCenterPageData.mockResolvedValue({
      items: [
        {
          id: 'camp-1::org-1::department::sales',
          sourceLabel: 'ExitScan',
          orgId: 'org-1',
          teamId: 'org-1::department::sales',
          teamLabel: 'Sales',
          status: 'reviewbaar',
          reviewDate: '2026-05-20',
          coreSemantics: {
            route: {
              campaignId: 'camp-1',
              reviewCompletedAt: null,
              reviewOutcome: 'geen-uitkomst',
              ownerAssignedAt: '2026-05-10T09:00:00.000Z',
              hasFollowUpTarget: false,
            },
          },
        },
      ],
      routeIds: [],
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'action_center_workspace_members') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                org_id: 'org-1',
                user_id: 'mgr-1',
                display_name: 'Manager',
                login_email: 'manager@example.com',
                access_role: 'manager_assignee',
                scope_type: 'department',
                scope_value: 'org-1::department::sales',
                can_view: true,
                can_update: false,
                can_schedule_review: false,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_review_rhythm_configs') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                route_id: 'camp-1::org-1::department::sales',
                cadence_days: 14,
                reminder_lead_days: 5,
                escalation_lead_days: 7,
                reminders_enabled: true,
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'campaigns') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'camp-1',
                name: 'ExitScan Q2',
                organization_id: 'org-1',
                scan_type: 'exit',
              },
            ],
            error: null,
          }),
        }
      }

      if (table === 'action_center_manager_responses') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [
              {
                campaign_id: 'camp-1',
                route_scope_type: 'department',
                route_scope_value: 'org-1::department::sales',
                review_scheduled_for: '2026-05-23',
                updated_at: '2026-05-12T09:00:00.000Z',
              },
              {
                campaign_id: 'camp-1',
                route_scope_type: 'department',
                route_scope_value: 'org-1::department::sales',
                review_scheduled_for: null,
                updated_at: '2026-05-13T09:00:00.000Z',
              },
            ],
            error: null,
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    })

    const { snapshots } = await getActionCenterFollowThroughMailData({
      context: {
        persona: 'verisight_admin',
        isVerisightAdmin: true,
        memberRole: null,
        primaryOrgId: 'org-1',
        organizationIds: ['org-1'],
        workspaceOrgIds: ['org-1'],
        managerScopeValues: [],
        canViewInsights: true,
        canViewReports: true,
        canViewActionCenter: true,
        canUpdateActionCenter: true,
        canManageActionCenterAssignments: true,
        canScheduleActionCenterReview: true,
        managerOnly: false,
      },
      orgMemberships: [],
      currentUserWorkspaceMemberships: [],
    })

    const result = planActionCenterFollowThroughMailJobs({
      now: new Date('2026-05-18T08:00:00.000Z'),
      snapshots,
      existingDedupeKeys: new Set([
        'camp-1::org-1::department::sales::review_upcoming::manager@example.com::2026-05-20',
      ]),
    })

    expect(result.jobs.some((job) => job.triggerType === 'review_upcoming')).toBe(false)
  })
})
