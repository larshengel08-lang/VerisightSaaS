import { describe, expect, it } from 'vitest'
import {
  buildSuiteAccessContext,
  buildSuiteAccessTelemetryEvents,
  getDefaultSuiteLandingPath,
  isScopeVisibleToActionCenterContext,
  type ActionCenterWorkspaceMember,
} from './suite-access'

describe('suite access context', () => {
  it('keeps customer owners in the full dashboard shell while opening action-center assignment capabilities', () => {
    const context = buildSuiteAccessContext({
      isVerisightAdmin: false,
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    expect(context.persona).toBe('customer_owner')
    expect(context.canViewInsights).toBe(true)
    expect(context.canViewReports).toBe(true)
    expect(context.canViewActionCenter).toBe(true)
    expect(context.canManageActionCenterAssignments).toBe(true)
    expect(context.managerOnly).toBe(false)
    expect(getDefaultSuiteLandingPath(context)).toBe('/dashboard')
  })

  it('routes manager assignees into action center only without dashboard or report access', () => {
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

    expect(context.persona).toBe('manager_assignee')
    expect(context.canViewInsights).toBe(false)
    expect(context.canViewReports).toBe(false)
    expect(context.canViewActionCenter).toBe(true)
    expect(context.managerOnly).toBe(true)
    expect(context.managerScopeValues).toEqual(['sales'])
    expect(getDefaultSuiteLandingPath(context)).toBe('/action-center')
    expect(isScopeVisibleToActionCenterContext(context, 'sales')).toBe(true)
    expect(isScopeVisibleToActionCenterContext(context, 'hr')).toBe(false)
    expect(buildSuiteAccessTelemetryEvents({ context, actorId: 'manager-1' })).toEqual([
      expect.objectContaining({
        eventType: 'manager_denied_insights',
        actorId: 'manager-1',
      }),
    ])
  })

  it('lets admins see both modules even without org membership rows', () => {
    const context = buildSuiteAccessContext({
      isVerisightAdmin: true,
      orgMemberships: [],
      workspaceMemberships: [],
    })

    expect(context.persona).toBe('verisight_admin')
    expect(context.canViewInsights).toBe(true)
    expect(context.canViewReports).toBe(true)
    expect(context.canViewActionCenter).toBe(true)
    expect(context.canManageActionCenterAssignments).toBe(true)
    expect(isScopeVisibleToActionCenterContext(context, 'finance')).toBe(true)
  })

  it('records owner access confirmation when an owner can enter the insight shell', () => {
    const context = buildSuiteAccessContext({
      isVerisightAdmin: false,
      orgMemberships: [{ org_id: 'org-1', role: 'owner' }],
      workspaceMemberships: [],
    })

    expect(buildSuiteAccessTelemetryEvents({ context, actorId: 'owner-1' })).toEqual([
      expect.objectContaining({
        eventType: 'owner_access_confirmed',
        orgId: 'org-1',
        actorId: 'owner-1',
      }),
    ])
  })
})
