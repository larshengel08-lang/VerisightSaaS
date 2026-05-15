import { describe, expect, it } from 'vitest'
import { planActionCenterFollowThroughMailJobs } from './action-center-follow-through-mail-planner'

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
})
