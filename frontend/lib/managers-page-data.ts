import type { SupabaseClient } from '@supabase/supabase-js'
import type { Campaign, Organization, Respondent } from '@/lib/types'
import type { ActionCenterWorkspaceMember, ActionCenterWorkspaceScopeType } from '@/lib/suite-access'

export type ManagerAssignmentStatus = 'gekoppeld' | 'nog_niet_gekoppeld' | 'scopeconflict' | 'onbekend'

export type ManagerAssignmentWorkspaceRow = Pick<
  ActionCenterWorkspaceMember,
  | 'org_id'
  | 'user_id'
  | 'display_name'
  | 'login_email'
  | 'access_role'
  | 'scope_type'
  | 'scope_value'
  | 'can_view'
  | 'can_update'
  | 'can_assign'
  | 'can_schedule_review'
  | 'created_at'
  | 'updated_at'
>

type ActiveCampaignRow = Pick<Campaign, 'id' | 'organization_id' | 'name' | 'is_active'>
type RespondentDepartmentRow = Pick<Respondent, 'campaign_id' | 'department'>
type OrganizationRow = Pick<Organization, 'id' | 'name' | 'slug' | 'contact_email' | 'is_active' | 'created_at'>

export interface ManagerScopeSummary {
  orgId: string
  orgName: string
  scopeType: ActionCenterWorkspaceScopeType
  scopeTypeLabel: string
  scopeValue: string
  scopeLabel: string
  createdAt: string | null
  updatedAt: string | null
}

export interface ManagerRegistryRow {
  userId: string
  displayName: string
  loginEmail: string | null
  status: ManagerAssignmentStatus
  statusLabel: string
  scopeTypeLabel: string
  accessLabel: string
  permissions: string[]
  scopes: ManagerScopeSummary[]
  createdAt: string | null
  updatedAt: string | null
}

export interface ManagersPageData {
  managers: ManagerRegistryRow[]
  uncoveredScopes: Array<{
    orgId: string
    orgName: string
    scopeLabel: string
    scopeValue: string
  }>
  uncoveredScopesAvailable: boolean
  managerCount: number
  uncoveredScopeCount: number | null
  scopeConflictCount: number
  scopedAccessCount: number
  organizationCount: number
  lastUpdatedAt: string | null
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isValidScopeValue(value: string | null | undefined) {
  return (value?.trim().length ?? 0) > 0
}

export function buildDepartmentScopeValue(orgId: string, departmentLabel: string) {
  return `${orgId}::department::${departmentLabel.trim().toLowerCase()}`
}

export function parseManagerScopeLabel(
  scopeValue: string,
  scopeType: ActionCenterWorkspaceScopeType,
  fallbackItemLabel?: string | null,
) {
  if (scopeType === 'org') {
    return 'Organisatie'
  }

  if (scopeType === 'department') {
    const rawDepartment = scopeValue.split('::')[2] ?? scopeValue
    return titleCase(rawDepartment)
  }

  return fallbackItemLabel?.trim() || 'Campagne'
}

export function countUncoveredDepartments(args: {
  activeDepartments: string[]
  managerScopeValues: string[]
}) {
  const activeDepartmentSet = new Set(args.activeDepartments.filter(isValidScopeValue))
  const managerScopeSet = new Set(args.managerScopeValues.filter(isValidScopeValue))

  return [...activeDepartmentSet].filter((scopeValue) => !managerScopeSet.has(scopeValue)).length
}

export function deriveManagerAssignmentStatus(rows: ManagerAssignmentWorkspaceRow[]): ManagerAssignmentStatus {
  if (rows.length === 0) {
    return 'onbekend'
  }

  const validScopeRows = rows.filter((row) => isValidScopeValue(row.scope_value))
  if (validScopeRows.length === 0) {
    return 'nog_niet_gekoppeld'
  }

  const orgScopeByOrgId = new Set(
    validScopeRows.filter((row) => row.scope_type === 'org').map((row) => row.org_id),
  )
  const nestedScopeByOrgId = new Set(
    validScopeRows
      .filter((row) => row.scope_type === 'department' || row.scope_type === 'item')
      .map((row) => row.org_id),
  )

  for (const orgId of orgScopeByOrgId) {
    if (nestedScopeByOrgId.has(orgId)) {
      return 'scopeconflict'
    }
  }

  return 'gekoppeld'
}

export function summarizeManagerPermissions(row: Pick<
  ManagerAssignmentWorkspaceRow,
  'can_update' | 'can_schedule_review'
>) {
  const permissions = [
    'Dashboardtoegang: Niet toegestaan',
    'Rapporttoegang: Niet toegestaan',
    'Action Center: Beperkt tot scope',
  ]

  if (row.can_update) {
    permissions.push('Kan opvolgen')
  }

  if (row.can_schedule_review) {
    permissions.push('Kan review plannen')
  }

  return permissions
}

function getStatusLabel(status: ManagerAssignmentStatus) {
  switch (status) {
    case 'gekoppeld':
      return 'Gekoppeld'
    case 'nog_niet_gekoppeld':
      return 'Nog niet gekoppeld'
    case 'scopeconflict':
      return 'Scopeconflict'
    default:
      return 'Onbekend'
  }
}

function getScopeTypeLabel(scopeType: ActionCenterWorkspaceScopeType) {
  switch (scopeType) {
    case 'org':
      return 'Organisatie'
    case 'department':
      return 'Afdeling'
    case 'item':
    default:
      return 'Itemscope'
  }
}

function getScopeTypeSummary(scopes: ManagerScopeSummary[]) {
  const uniqueLabels = [...new Set(scopes.map((scope) => scope.scopeTypeLabel))]
  if (uniqueLabels.length === 0) {
    return 'Niet beschikbaar'
  }
  if (uniqueLabels.length === 1) {
    return uniqueLabels[0]
  }
  return 'Gemengd'
}

function getAccessLabel(row: Pick<ManagerAssignmentWorkspaceRow, 'can_view' | 'can_update' | 'can_schedule_review'>) {
  if (!row.can_view) {
    return 'Onbekend'
  }
  if (row.can_update && row.can_schedule_review) {
    return 'Opvolgen + review plannen'
  }
  if (row.can_update) {
    return 'Kan opvolgen'
  }
  if (row.can_schedule_review) {
    return 'Kan review plannen'
  }
  return 'Alleen scoped lezen'
}

function getLatestTimestamp(values: Array<string | null | undefined>) {
  const definedValues = values.filter((value): value is string => Boolean(value))
  if (definedValues.length === 0) {
    return null
  }

  return definedValues.sort((left, right) => right.localeCompare(left))[0] ?? null
}

function toManagerRegistryRows(args: {
  workspaceRows: ManagerAssignmentWorkspaceRow[]
  organizationsById: Map<string, OrganizationRow>
  activeCampaignsById: Map<string, ActiveCampaignRow>
}) {
  const rowsByUserId = args.workspaceRows.reduce<Map<string, ManagerAssignmentWorkspaceRow[]>>((acc, row) => {
    const existing = acc.get(row.user_id) ?? []
    existing.push(row)
    acc.set(row.user_id, existing)
    return acc
  }, new Map())

  return [...rowsByUserId.entries()]
    .map<ManagerRegistryRow>(([userId, rows]) => {
      const primaryRow = rows[0]
      const status = deriveManagerAssignmentStatus(rows)
      const scopes = rows
        .filter((row) => isValidScopeValue(row.scope_value))
        .map<ManagerScopeSummary>((row) => {
          const org = args.organizationsById.get(row.org_id)
          const fallbackCampaignLabel =
            row.scope_type === 'item'
              ? args.activeCampaignsById.get(row.scope_value.split('::')[2] ?? '')?.name ?? null
              : null

          return {
            orgId: row.org_id,
            orgName: org?.name ?? 'Niet beschikbaar',
            scopeType: row.scope_type,
            scopeTypeLabel: getScopeTypeLabel(row.scope_type),
            scopeValue: row.scope_value,
            scopeLabel: parseManagerScopeLabel(row.scope_value, row.scope_type, fallbackCampaignLabel),
            createdAt: row.created_at ?? null,
            updatedAt: row.updated_at ?? null,
          }
        })

      const permissionUnion = {
        can_update: rows.some((row) => row.can_update),
        can_schedule_review: rows.some((row) => row.can_schedule_review),
      }

      return {
        userId,
        displayName: primaryRow.display_name?.trim() || primaryRow.login_email || 'Onbekende manager',
        loginEmail: primaryRow.login_email ?? null,
        status,
        statusLabel: getStatusLabel(status),
        scopeTypeLabel: getScopeTypeSummary(scopes),
        accessLabel: getAccessLabel({
          can_view: rows.some((row) => row.can_view),
          ...permissionUnion,
        }),
        permissions: summarizeManagerPermissions(permissionUnion),
        scopes,
        createdAt: getLatestTimestamp(rows.map((row) => row.created_at ?? null)),
        updatedAt: getLatestTimestamp(rows.map((row) => row.updated_at ?? null)),
      }
    })
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
}

export async function getManagersPageData(
  supabase: SupabaseClient,
  orgIds: string[],
): Promise<ManagersPageData> {
  const visibleOrgIds = [...new Set(orgIds)]
  if (visibleOrgIds.length === 0) {
    return {
      managers: [],
      uncoveredScopes: [],
      uncoveredScopesAvailable: false,
      managerCount: 0,
      uncoveredScopeCount: null,
      scopeConflictCount: 0,
      scopedAccessCount: 0,
      organizationCount: 0,
      lastUpdatedAt: null,
    }
  }

  const [{ data: organizationsRaw }, { data: workspaceRowsRaw }, { data: activeCampaignsRaw }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, slug, contact_email, is_active, created_at')
        .in('id', visibleOrgIds),
      supabase
        .from('action_center_workspace_members')
        .select(
          'org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, can_assign, can_schedule_review, created_at, updated_at',
        )
        .in('org_id', visibleOrgIds)
        .eq('access_role', 'manager_assignee'),
      supabase
        .from('campaigns')
        .select('id, organization_id, name, is_active')
        .in('organization_id', visibleOrgIds)
        .eq('is_active', true),
    ])

  const organizations = (organizationsRaw ?? []) as OrganizationRow[]
  const workspaceRows = (workspaceRowsRaw ?? []) as ManagerAssignmentWorkspaceRow[]
  const activeCampaigns = (activeCampaignsRaw ?? []) as ActiveCampaignRow[]
  const activeCampaignIds = activeCampaigns.map((campaign) => campaign.id)
  const organizationsById = new Map(organizations.map((organization) => [organization.id, organization]))
  const activeCampaignsById = new Map(activeCampaigns.map((campaign) => [campaign.id, campaign]))

  const { data: departmentRowsRaw } =
    activeCampaignIds.length > 0
      ? await supabase
          .from('respondents')
          .select('campaign_id, department')
          .in('campaign_id', activeCampaignIds)
      : { data: [] }

  const departmentRows = (departmentRowsRaw ?? []) as RespondentDepartmentRow[]
  const activeDepartmentScopeValues = departmentRows
    .map((row) => {
      const departmentLabel = normalizeDepartmentLabel(row.department)
      if (!departmentLabel) {
        return null
      }

      const campaign = activeCampaignsById.get(row.campaign_id)
      if (!campaign) {
        return null
      }

      return {
        orgId: campaign.organization_id,
        orgName: organizationsById.get(campaign.organization_id)?.name ?? 'Niet beschikbaar',
        scopeLabel: departmentLabel,
        scopeValue: buildDepartmentScopeValue(campaign.organization_id, departmentLabel),
      }
    })
    .filter(Boolean) as Array<{
    orgId: string
    orgName: string
    scopeLabel: string
    scopeValue: string
  }>

  const uncoveredScopesAvailable = activeDepartmentScopeValues.length > 0
  const managerScopeValues = workspaceRows
    .filter((row) => row.scope_type === 'department' && isValidScopeValue(row.scope_value))
    .map((row) => row.scope_value)
  const uncoveredScopeSet = new Set(
    activeDepartmentScopeValues
      .filter((scope) => !managerScopeValues.includes(scope.scopeValue))
      .map((scope) => `${scope.orgId}::${scope.scopeValue}`),
  )
  const uncoveredScopes = activeDepartmentScopeValues.filter((scope) =>
    uncoveredScopeSet.has(`${scope.orgId}::${scope.scopeValue}`),
  )
  const managers = toManagerRegistryRows({
    workspaceRows,
    organizationsById,
    activeCampaignsById,
  })

  return {
    managers,
    uncoveredScopes,
    uncoveredScopesAvailable,
    managerCount: managers.filter((manager) => manager.status !== 'nog_niet_gekoppeld').length,
    uncoveredScopeCount: uncoveredScopesAvailable
      ? countUncoveredDepartments({
          activeDepartments: activeDepartmentScopeValues.map((scope) => scope.scopeValue),
          managerScopeValues,
        })
      : null,
    scopeConflictCount: managers.filter((manager) => manager.status === 'scopeconflict').length,
    scopedAccessCount: new Set(
      workspaceRows
        .filter((row) => row.can_view && isValidScopeValue(row.scope_value))
        .map((row) => row.user_id),
    ).size,
    organizationCount: organizations.length,
    lastUpdatedAt: getLatestTimestamp(workspaceRows.map((row) => row.updated_at ?? row.created_at ?? null)),
  }
}
