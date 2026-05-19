import { describe, expect, it } from 'vitest'
import {
  getActionCenterGovernanceActorRoleLabel,
  isActionCenterGovernanceActorRole,
  resolveActionCenterHrWriteAccess,
  resolveActionCenterReviewRhythmWriteAccess,
  resolveActionCenterTransitionAccess,
} from './action-center-governance'

describe('action center governance helpers', () => {
  it('recognizes canonical governance actor roles', () => {
    expect(isActionCenterGovernanceActorRole('verisight_admin')).toBe(true)
    expect(isActionCenterGovernanceActorRole('hr_member')).toBe(true)
    expect(isActionCenterGovernanceActorRole('unknown')).toBe(false)
    expect(getActionCenterGovernanceActorRoleLabel('hr_owner')).toBe('HR owner')
  })

  it('prefers verisight admin when resolving HR write access', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: true },
        orgMemberships: [],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'verisight_admin',
    })
  })

  it('resolves org ownership to hr_owner audit truth', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_owner',
    })
  })

  it('resolves hr_member workspace access when no org owner access exists', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'org',
            scope_value: 'org-1::org::org-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_member',
    })
  })

  it('denies write access without verisight or HR authority', () => {
    expect(
      resolveActionCenterHrWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [],
        orgId: 'org-1',
      }),
    ).toEqual({
      allowed: false,
      auditRole: null,
    })
  })

  it('does not allow manager canonical reschedule or close access', () => {
    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'hr_owner',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }).allowed,
    ).toBe(true)

    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'manager',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }).allowed,
    ).toBe(false)

    expect(
      resolveActionCenterTransitionAccess({
        actorRole: 'manager',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }).allowed,
    ).toBe(false)
  })

  it('requires view, update, schedule, and matching scope for review rhythm access', () => {
    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::other-route',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
          {
            org_id: 'org-1',
            user_id: 'hr-member-2',
            display_name: 'HR Member',
            login_email: 'hr.member.two@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::route-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: false,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: false,
      auditRole: null,
    })
  })

  it('allows review rhythm access for matching route scope and org-wide hr memberships', () => {
    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-member-1',
            display_name: 'HR Member',
            login_email: 'hr.member@example.com',
            access_role: 'hr_member',
            scope_type: 'route',
            scope_value: 'org-1::route::route-1',
            can_view: true,
            can_update: true,
            can_assign: false,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_member',
    })

    expect(
      resolveActionCenterReviewRhythmWriteAccess({
        context: { isVerisightAdmin: false },
        orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
        workspaceMemberships: [
          {
            org_id: 'org-1',
            user_id: 'hr-owner-1',
            display_name: 'HR Owner',
            login_email: 'hr.owner@example.com',
            access_role: 'hr_owner',
            scope_type: 'org',
            scope_value: 'org-1::org::org-1',
            can_view: true,
            can_update: true,
            can_assign: true,
            can_schedule_review: true,
          },
        ],
        orgId: 'org-1',
        routeScopeValue: 'org-1::route::route-1',
      }),
    ).toEqual({
      allowed: true,
      auditRole: 'hr_owner',
    })
  })
})
