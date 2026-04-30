import {
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
} from './action-center-manager-responses'
import type { ActionCenterWorkspaceMember } from './suite-access'

export type ActionCenterWritableRouteScopeType = 'department' | 'item'

type ManagerAssignmentTruth = Pick<
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
  | 'created_at'
  | 'updated_at'
>

interface SubmittedRouteIdentity {
  campaign_id: string
  route_scope_type: ActionCenterWritableRouteScopeType
  route_scope_value: string
  manager_user_id?: string | null
}

interface PersistedActionIdentity {
  id: string
  org_id: string
  route_scope_type: string
  route_scope_value: string
  manager_user_id: string
}

interface RouteContainerTruth {
  id: string
  campaign_id: string
  org_id: string
  route_scope_type: ActionCenterWritableRouteScopeType
  route_scope_value: string
  manager_user_id: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function buildAssignmentDisplayName(assignment: Pick<ManagerAssignmentTruth, 'display_name' | 'login_email' | 'user_id'>) {
  const displayName = normalizeText(assignment.display_name)
  if (displayName) {
    return displayName
  }

  const loginEmail = normalizeText(assignment.login_email)
  if (loginEmail) {
    return loginEmail.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Manager'
  }

  return assignment.user_id
}

function isCanonicalRouteScopeForCampaign(args: {
  campaignId: string
  campaignOrgId: string
  routeScopeType: ActionCenterWritableRouteScopeType
  routeScopeValue: string
  visibleDepartmentLabels: string[]
}) {
  if (args.routeScopeType === 'item') {
    return args.routeScopeValue === buildCampaignItemScopeValue(args.campaignOrgId, args.campaignId)
  }

  return args.visibleDepartmentLabels.some(
    (label) => buildDepartmentScopeValue(args.campaignOrgId, label) === args.routeScopeValue,
  )
}

function isWritableManagerAssignment(
  assignment: ManagerAssignmentTruth | null,
  routeScopeType: ActionCenterWritableRouteScopeType,
  routeScopeValue: string,
  managerUserId: string,
  campaignOrgId: string,
) {
  return Boolean(
    assignment &&
      assignment.access_role === 'manager_assignee' &&
      assignment.can_view &&
      assignment.can_update &&
      assignment.org_id === campaignOrgId &&
      assignment.scope_type === routeScopeType &&
      assignment.scope_value === routeScopeValue &&
      assignment.user_id === managerUserId,
  )
}

export function buildActionCenterRouteId(
  campaignId: string,
  routeScopeType: ActionCenterWritableRouteScopeType,
  routeScopeValue: string,
) {
  return `${campaignId}::${routeScopeType}::${routeScopeValue}`
}

export function resolveRouteActionWriteIdentity(args: {
  submitted: SubmittedRouteIdentity
  routeContainer: RouteContainerTruth | null
  currentUserId: string
  campaignOrgId: string
  visibleDepartmentLabels: string[]
  currentUserMembership: ManagerAssignmentTruth | null
  assignedManagerMembership: ManagerAssignmentTruth | null
  isVerisightAdmin: boolean
}) {
  const submittedCampaignId = normalizeText(args.submitted.campaign_id)
  const submittedScopeValue = normalizeText(args.submitted.route_scope_value)
  const submittedManagerUserId = normalizeText(args.submitted.manager_user_id)

  if (
    !submittedCampaignId ||
    !submittedScopeValue ||
    (args.submitted.route_scope_type !== 'department' && args.submitted.route_scope_type !== 'item')
  ) {
    throw new Error('Ongeldige route action route-identiteit.')
  }

  if (
    !args.routeContainer?.id ||
    args.routeContainer.campaign_id !== submittedCampaignId ||
    args.routeContainer.org_id !== args.campaignOrgId ||
    args.routeContainer.route_scope_type !== args.submitted.route_scope_type ||
    args.routeContainer.route_scope_value !== submittedScopeValue
  ) {
    throw new Error('Route action route-container bestaat niet voor deze route.')
  }

  if (
    !isCanonicalRouteScopeForCampaign({
      campaignId: submittedCampaignId,
      campaignOrgId: args.campaignOrgId,
      routeScopeType: args.submitted.route_scope_type,
      routeScopeValue: submittedScopeValue,
      visibleDepartmentLabels: args.visibleDepartmentLabels,
    })
  ) {
    throw new Error('Route action route bestaat niet voor deze campagne.')
  }

  const assignment = args.isVerisightAdmin ? args.assignedManagerMembership : args.currentUserMembership
  const persistedManagerUserId = normalizeText(args.routeContainer.manager_user_id)

  if (!persistedManagerUserId) {
    throw new Error('Route action route-container mist manager-identiteit.')
  }

  if (
    !isWritableManagerAssignment(
      assignment,
      args.submitted.route_scope_type,
      submittedScopeValue,
      persistedManagerUserId,
      args.campaignOrgId,
    )
  ) {
    throw new Error(
      args.isVerisightAdmin
        ? 'Geen geldige manager-toewijzing gevonden voor deze route.'
        : 'Alleen de toegewezen manager kan acties voor deze route schrijven.',
    )
  }

  if (!args.isVerisightAdmin && persistedManagerUserId !== args.currentUserId) {
    throw new Error('Alleen de toegewezen manager kan acties voor deze route schrijven.')
  }

  if (!args.isVerisightAdmin && submittedManagerUserId && submittedManagerUserId !== persistedManagerUserId) {
    throw new Error('Alleen de toegewezen manager kan acties voor deze route schrijven.')
  }

  const ownerAssignedAt = normalizeText(assignment?.created_at)
  if (!ownerAssignedAt) {
    throw new Error('Manager-toewijzing mist een bewezen assignment-tijdstip.')
  }

  return {
    manager_response_id: args.routeContainer.id,
    campaign_id: submittedCampaignId,
    org_id: args.campaignOrgId,
    route_id: buildActionCenterRouteId(
      submittedCampaignId,
      args.submitted.route_scope_type,
      submittedScopeValue,
    ),
    route_scope_type: args.submitted.route_scope_type,
    route_scope_value: submittedScopeValue,
    manager_user_id: persistedManagerUserId,
    owner_name: buildAssignmentDisplayName(assignment),
    owner_assigned_at: ownerAssignedAt,
  }
}

export function resolveActionReviewWriteIdentity(args: {
  action: PersistedActionIdentity | null
  currentUserId: string
  currentUserMembership: ManagerAssignmentTruth | null
  isVerisightAdmin: boolean
}) {
  if (!args.action?.id || !args.action.org_id) {
    throw new Error('Route action bestaat niet.')
  }

  const routeScopeType =
    args.action.route_scope_type === 'department' || args.action.route_scope_type === 'item'
      ? args.action.route_scope_type
      : null
  const routeScopeValue = normalizeText(args.action.route_scope_value)
  const managerUserId = normalizeText(args.action.manager_user_id)

  if (!routeScopeType || !routeScopeValue || !managerUserId) {
    throw new Error('Route action bestaat niet.')
  }

  if (args.isVerisightAdmin) {
    return { action_id: args.action.id }
  }

  if (
    managerUserId !== args.currentUserId ||
    !args.currentUserMembership ||
    args.currentUserMembership.access_role !== 'manager_assignee' ||
    !args.currentUserMembership.can_view ||
    !args.currentUserMembership.can_update ||
    args.currentUserMembership.user_id !== args.currentUserId ||
    args.currentUserMembership.org_id !== args.action.org_id ||
    args.currentUserMembership.scope_type !== routeScopeType ||
    args.currentUserMembership.scope_value !== routeScopeValue
  ) {
    throw new Error('Alleen de toegewezen manager kan reviews voor deze actie schrijven.')
  }

  return { action_id: args.action.id }
}
