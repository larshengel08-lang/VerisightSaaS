import type { MemberRole } from '@/lib/types'
import { buildSuiteTelemetryEvent, type SuiteTelemetryEvent } from '@/lib/telemetry/events'

export type ActionCenterWorkspaceRole = 'hr_owner' | 'hr_member' | 'manager_assignee'
export type ActionCenterWorkspaceScopeType = 'org' | 'department' | 'item'

export interface ActionCenterWorkspaceMember {
  id?: string
  org_id: string
  user_id: string
  display_name: string | null
  login_email: string | null
  access_role: ActionCenterWorkspaceRole
  scope_type: ActionCenterWorkspaceScopeType
  scope_value: string
  can_view: boolean
  can_update: boolean
  can_assign: boolean
  can_schedule_review: boolean
  created_at?: string
  updated_at?: string
}

export interface SuiteOrgMembership {
  org_id: string
  role: MemberRole
}

export type SuitePersona =
  | 'verisight_admin'
  | 'customer_owner'
  | 'customer_member'
  | 'customer_viewer'
  | 'manager_assignee'
  | 'no_access'

export interface SuiteAccessContext {
  persona: SuitePersona
  isVerisightAdmin: boolean
  memberRole: MemberRole | null
  primaryOrgId: string | null
  organizationIds: string[]
  workspaceOrgIds: string[]
  managerScopeValues: string[]
  canViewInsights: boolean
  canViewReports: boolean
  canViewActionCenter: boolean
  canUpdateActionCenter: boolean
  canManageActionCenterAssignments: boolean
  canScheduleActionCenterReview: boolean
  managerOnly: boolean
}

function getRoleRank(role: MemberRole) {
  switch (role) {
    case 'owner':
      return 3
    case 'member':
      return 2
    case 'viewer':
    default:
      return 1
  }
}

function getHighestMemberRole(memberships: SuiteOrgMembership[]) {
  return memberships.reduce<MemberRole | null>((highest, membership) => {
    if (!highest) return membership.role
    return getRoleRank(membership.role) > getRoleRank(highest) ? membership.role : highest
  }, null)
}

function getPersona(isVerisightAdmin: boolean, memberRole: MemberRole | null, hasActionCenterScopes: boolean): SuitePersona {
  if (isVerisightAdmin) return 'verisight_admin'
  if (memberRole === 'owner') return 'customer_owner'
  if (memberRole === 'member') return 'customer_member'
  if (memberRole === 'viewer') return 'customer_viewer'
  if (hasActionCenterScopes) return 'manager_assignee'
  return 'no_access'
}

export function buildSuiteAccessContext(args: {
  isVerisightAdmin: boolean
  orgMemberships: SuiteOrgMembership[]
  workspaceMemberships: ActionCenterWorkspaceMember[]
}): SuiteAccessContext {
  const organizationIds = [...new Set(args.orgMemberships.map((membership) => membership.org_id))]
  const workspaceMemberships = args.workspaceMemberships.filter((membership) => membership.can_view)
  const workspaceOrgIds = [...new Set(workspaceMemberships.map((membership) => membership.org_id))]
  const managerScopeValues = [
    ...new Set(
      workspaceMemberships
        .filter((membership) => membership.access_role === 'manager_assignee')
        .map((membership) => membership.scope_value),
    ),
  ]
  const memberRole = getHighestMemberRole(args.orgMemberships)
  const persona = getPersona(args.isVerisightAdmin, memberRole, managerScopeValues.length > 0)
  const managerOnly =
    persona === 'manager_assignee' && !args.isVerisightAdmin && organizationIds.length === 0
  const canViewInsights = args.isVerisightAdmin || memberRole !== null
  const canViewReports = canViewInsights
  const canViewActionCenter = args.isVerisightAdmin || memberRole !== null || managerScopeValues.length > 0
  const canManageActionCenterAssignments =
    args.isVerisightAdmin || memberRole === 'owner'
  const canUpdateActionCenter =
    args.isVerisightAdmin ||
    memberRole === 'owner' ||
    workspaceMemberships.some((membership) => membership.can_update)
  const canScheduleActionCenterReview =
    args.isVerisightAdmin ||
    memberRole === 'owner' ||
    workspaceMemberships.some((membership) => membership.can_schedule_review)

  return {
    persona,
    isVerisightAdmin: args.isVerisightAdmin,
    memberRole,
    primaryOrgId: organizationIds[0] ?? workspaceOrgIds[0] ?? null,
    organizationIds,
    workspaceOrgIds,
    managerScopeValues,
    canViewInsights,
    canViewReports,
    canViewActionCenter,
    canUpdateActionCenter,
    canManageActionCenterAssignments,
    canScheduleActionCenterReview,
    managerOnly,
  }
}

export function getDefaultSuiteLandingPath(context: Pick<SuiteAccessContext, 'canViewActionCenter' | 'managerOnly'>) {
  if (context.managerOnly && context.canViewActionCenter) {
    return '/action-center'
  }

  return '/dashboard'
}

export function isScopeVisibleToActionCenterContext(
  context: Pick<SuiteAccessContext, 'isVerisightAdmin' | 'memberRole' | 'managerScopeValues'>,
  scopeValue: string,
) {
  if (context.isVerisightAdmin || context.memberRole !== null) {
    return true
  }

  return context.managerScopeValues.includes(scopeValue)
}

export function buildSuiteAccessTelemetryEvents(args: {
  actorId?: string | null
  context: Pick<SuiteAccessContext, 'persona' | 'primaryOrgId' | 'canViewInsights' | 'managerOnly'>
}) {
  const events: SuiteTelemetryEvent[] = []

  if (
    args.context.persona === 'customer_owner' &&
    args.context.canViewInsights
  ) {
    events.push(
      buildSuiteTelemetryEvent('owner_access_confirmed', {
        orgId: args.context.primaryOrgId,
        actorId: args.actorId ?? null,
      }),
    )
  }

  if (args.context.managerOnly && !args.context.canViewInsights) {
    events.push(
      buildSuiteTelemetryEvent('manager_denied_insights', {
        orgId: args.context.primaryOrgId,
        actorId: args.actorId ?? null,
      }),
    )
  }

  return events
}
