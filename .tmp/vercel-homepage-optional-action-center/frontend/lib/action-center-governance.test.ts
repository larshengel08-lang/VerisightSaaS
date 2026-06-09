import { describe, expect, it } from 'vitest'
import {
  getActionCenterGovernanceActorRoleLabel,
  isActionCenterGovernanceActorRole,
  resolveActionCenterHrWriteAccess,
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
})
