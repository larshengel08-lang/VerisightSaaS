import type {
  ActionCenterWorkspaceMember,
  SuiteAccessContext,
  SuiteOrgMembership,
} from '@/lib/suite-access'

export type ActionCenterGovernanceActorRole =
  | 'verisight_admin'
  | 'verisight'
  | 'hr_owner'
  | 'hr_member'
  | 'hr'
  | 'manager'

export type ActionCenterGovernanceWriteRole = 'verisight_admin' | 'hr_owner' | 'hr_member'

const ACTION_CENTER_GOVERNANCE_ROLE_SET = new Set<ActionCenterGovernanceActorRole>([
  'verisight_admin',
  'verisight',
  'hr_owner',
  'hr_member',
  'hr',
  'manager',
])

export function isActionCenterGovernanceActorRole(
  value: string | null | undefined,
): value is ActionCenterGovernanceActorRole {
  return Boolean(value && ACTION_CENTER_GOVERNANCE_ROLE_SET.has(value as ActionCenterGovernanceActorRole))
}

export function getActionCenterGovernanceActorRoleLabel(role: ActionCenterGovernanceActorRole) {
  switch (role) {
    case 'verisight_admin':
      return 'Verisight admin'
    case 'verisight':
      return 'Verisight'
    case 'hr_owner':
      return 'HR owner'
    case 'hr_member':
      return 'HR member'
    case 'hr':
      return 'HR'
    case 'manager':
      return 'Manager'
  }
}

export function resolveActionCenterHrWriteAccess(args: {
  context: Pick<SuiteAccessContext, 'isVerisightAdmin'>
  orgMemberships: SuiteOrgMembership[]
  workspaceMemberships: ActionCenterWorkspaceMember[]
  orgId: string
}):
  | {
      allowed: true
      auditRole: ActionCenterGovernanceWriteRole
    }
  | {
      allowed: false
      auditRole: null
    } {
  if (args.context.isVerisightAdmin) {
    return {
      allowed: true,
      auditRole: 'verisight_admin' as const,
    }
  }

  const orgMembership = args.orgMemberships.find((membership) => membership.org_id === args.orgId) ?? null
  if (orgMembership?.role === 'owner') {
    return {
      allowed: true,
      auditRole: 'hr_owner' as const,
    }
  }

  const hrWorkspaceMembership =
    args.workspaceMemberships.find(
      (membership) =>
        membership.org_id === args.orgId &&
        (membership.access_role === 'hr_owner' || membership.access_role === 'hr_member') &&
        membership.can_update,
    ) ?? null

  if (hrWorkspaceMembership) {
    const auditRole =
      hrWorkspaceMembership.access_role === 'hr_owner' ? ('hr_owner' as const) : ('hr_member' as const)

    return {
      allowed: true,
      auditRole,
    }
  }

  return {
    allowed: false,
    auditRole: null,
  }
}
