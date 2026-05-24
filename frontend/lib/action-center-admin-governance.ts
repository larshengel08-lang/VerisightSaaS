import type { MemberRole } from '@/lib/types'
import type { ActionCenterWorkspaceRole, SuitePersona } from '@/lib/suite-access'

export interface ActionCenterAdminCapabilities {
  canManageTenantAdmin: boolean
  canApproveRouteActivation: boolean
  canRequestAuditExport: boolean
  canLogSupportAccess: boolean
  canViewExecutiveReadback: boolean
}

export const ACTION_CENTER_APPROVED_ROUTE_FAMILIES = ['exit', 'retention'] as const
export type ActionCenterApprovedRouteFamily =
  (typeof ACTION_CENTER_APPROVED_ROUTE_FAMILIES)[number]

export const ACTION_CENTER_SUPPORT_ACCESS_KINDS = [
  'support',
  'privacy',
  'governance',
  'incident',
] as const
export type ActionCenterSupportAccessKind =
  (typeof ACTION_CENTER_SUPPORT_ACCESS_KINDS)[number]

export function resolveActionCenterAdminCapabilities(args: {
  persona: SuitePersona
  isVerisightAdmin: boolean
  memberRole: MemberRole | null
  workspaceRoles: ActionCenterWorkspaceRole[]
}): ActionCenterAdminCapabilities {
  const hasExplicitCustomerAdminCapability =
    args.memberRole === 'owner' && args.workspaceRoles.includes('hr_owner')
  const canManageTenantAdmin = args.isVerisightAdmin || hasExplicitCustomerAdminCapability
  const canApproveRouteActivation = canManageTenantAdmin
  const canRequestAuditExport = canManageTenantAdmin
  const canLogSupportAccess = canManageTenantAdmin
  const canViewExecutiveReadback =
    args.isVerisightAdmin || args.memberRole === 'owner'

  return {
    canManageTenantAdmin,
    canApproveRouteActivation,
    canRequestAuditExport,
    canLogSupportAccess,
    canViewExecutiveReadback,
  }
}

export function canAccessActionCenterAdminOrg(args: {
  isVerisightAdmin: boolean
  organizationIds: string[]
  workspaceOrgIds: string[]
  orgId: string
}) {
  if (args.isVerisightAdmin) {
    return true
  }

  return (
    args.organizationIds.includes(args.orgId) ||
    args.workspaceOrgIds.includes(args.orgId)
  )
}
