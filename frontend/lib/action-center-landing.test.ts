import { describe, expect, it } from 'vitest'
import {
  buildSuiteAccessContext,
  shouldUseBoundedActionCenterOverview,
  type ActionCenterWorkspaceMember,
} from './suite-access'

describe('action center landing mode', () => {
  it('keeps manager assignees with live route interaction in the richer landing', () => {
    const workspaceMemberships: ActionCenterWorkspaceMember[] = [
      {
        org_id: 'org-1',
        user_id: 'manager-1',
        display_name: 'Manager Noord',
        login_email: 'manager.noord@example.com',
        access_role: 'manager_assignee',
        scope_type: 'department',
        scope_value: 'sales',
        can_view: true,
        can_update: true,
        can_assign: false,
        can_schedule_review: true,
      },
    ]

    const context = buildSuiteAccessContext({
      isVerisightAdmin: false,
      orgMemberships: [],
      workspaceMemberships,
    })

    expect(shouldUseBoundedActionCenterOverview(context)).toBe(false)
  })

  it('keeps read-only action center viewers in bounded overview mode', () => {
    const workspaceMemberships: ActionCenterWorkspaceMember[] = [
      {
        org_id: 'org-1',
        user_id: 'viewer-1',
        display_name: 'Viewer',
        login_email: 'viewer@example.com',
        access_role: 'hr_member',
        scope_type: 'org',
        scope_value: 'org-1',
        can_view: true,
        can_update: false,
        can_assign: false,
        can_schedule_review: false,
      },
    ]

    const context = buildSuiteAccessContext({
      isVerisightAdmin: false,
      orgMemberships: [{ org_id: 'org-1', role: 'viewer' }],
      workspaceMemberships,
    })

    expect(shouldUseBoundedActionCenterOverview(context)).toBe(true)
  })

  it('keeps owner and admin readbacks in the existing bounded landing when no manager scopes exist', () => {
    const ownerContext = buildSuiteAccessContext({
      isVerisightAdmin: false,
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })
    const adminContext = buildSuiteAccessContext({
      isVerisightAdmin: true,
      orgMemberships: [],
      workspaceMemberships: [],
    })

    expect(shouldUseBoundedActionCenterOverview(ownerContext)).toBe(true)
    expect(shouldUseBoundedActionCenterOverview(adminContext)).toBe(true)
  })
})
