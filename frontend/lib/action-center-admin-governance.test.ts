import { describe, expect, it } from 'vitest'
import { resolveActionCenterAdminCapabilities } from './action-center-admin-governance'

describe('action center admin governance capabilities', () => {
  it('grants tenant admin only to verisight admin or explicit customer admin capability', () => {
    expect(
      resolveActionCenterAdminCapabilities({
        persona: 'customer_owner',
        isVerisightAdmin: false,
        memberRole: 'owner',
        workspaceRoles: [],
      }).canManageTenantAdmin,
    ).toBe(false)

    expect(
      resolveActionCenterAdminCapabilities({
        persona: 'customer_owner',
        isVerisightAdmin: false,
        memberRole: 'owner',
        workspaceRoles: ['hr_owner'],
      }).canManageTenantAdmin,
    ).toBe(true)

    expect(
      resolveActionCenterAdminCapabilities({
        persona: 'verisight_admin',
        isVerisightAdmin: true,
        memberRole: null,
        workspaceRoles: [],
      }).canManageTenantAdmin,
    ).toBe(true)
  })

  it('keeps executive viewer aggregated and read-only', () => {
    const viewerCapabilities = resolveActionCenterAdminCapabilities({
      persona: 'customer_viewer',
      isVerisightAdmin: false,
      memberRole: 'viewer',
      workspaceRoles: [],
    })

    expect(viewerCapabilities.canViewExecutiveReadback).toBe(false)
    expect(viewerCapabilities.canManageTenantAdmin).toBe(false)
    expect(viewerCapabilities.canApproveRouteActivation).toBe(false)
    expect(viewerCapabilities.canRequestAuditExport).toBe(false)
    expect(viewerCapabilities.canLogSupportAccess).toBe(false)
  })

  it('grants bounded admin controls to explicit hr owners without broadening runtime access rules', () => {
    expect(
      resolveActionCenterAdminCapabilities({
        persona: 'customer_owner',
        isVerisightAdmin: false,
        memberRole: 'owner',
        workspaceRoles: ['hr_owner'],
      }),
    ).toEqual({
      canManageTenantAdmin: true,
      canApproveRouteActivation: true,
      canRequestAuditExport: true,
      canLogSupportAccess: true,
      canViewExecutiveReadback: true,
    })
  })
})
