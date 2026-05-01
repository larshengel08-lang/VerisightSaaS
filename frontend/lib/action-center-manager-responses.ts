import {
  looksLikeActionCenterExpectedEffect,
  looksLikeActionCenterStep,
} from './action-center-review-decisions'
import type { ActionCenterWorkspaceMember } from './suite-access'
import type {
  ActionCenterManagerActionStatus,
  ActionCenterManagerActionThemeKey,
  ActionCenterManagerResponse,
  ActionCenterManagerResponseScopeType,
  ActionCenterManagerResponseType,
} from './pilot-learning'

export type { ActionCenterManagerResponseScopeType } from './pilot-learning'

const RESPONSE_TYPES = new Set<ActionCenterManagerResponseType>(['confirm', 'sharpen', 'schedule', 'watch'])
const RESPONSE_SCOPE_TYPES = new Set<ActionCenterManagerResponseScopeType>(['department', 'item'])
const ACTION_STATUSES = new Set<ActionCenterManagerActionStatus>(['active', 'completed', 'abandoned'])
const THEME_KEYS = new Set<ActionCenterManagerActionThemeKey>([
  'leadership',
  'culture',
  'growth',
  'compensation',
  'workload',
  'role_clarity',
])

export const ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS: Array<{
  value: ActionCenterManagerActionThemeKey
  label: string
}> = [
  { value: 'leadership', label: 'Leiderschap en ondersteuning' },
  { value: 'culture', label: 'Veiligheid en samenwerking' },
  { value: 'growth', label: 'Groei en perspectief' },
  { value: 'compensation', label: 'Beloning en voorwaarden' },
  { value: 'workload', label: 'Werkdruk en herstel' },
  { value: 'role_clarity', label: 'Rolhelderheid en prioriteiten' },
]

export interface ActionCenterManagerResponseWriteInput {
  campaign_id: string
  org_id: string
  route_scope_type: ActionCenterManagerResponseScopeType
  route_scope_value: string
  manager_user_id: string
  response_type: ActionCenterManagerResponseType
  response_note: string
  review_scheduled_for: string
  primary_action_theme_key: ActionCenterManagerActionThemeKey | null
  primary_action_text: string | null
  primary_action_expected_effect: string | null
  primary_action_status: ActionCenterManagerActionStatus | null
}

export interface ActionCenterManagerResponseSubmittedIdentity {
  campaign_id: string
  org_id?: string | null
  route_scope_type: ActionCenterManagerResponseScopeType
  route_scope_value: string
  manager_user_id?: string | null
}

type ManagerAssignmentTruth = Pick<
  ActionCenterWorkspaceMember,
  'org_id' | 'user_id' | 'access_role' | 'scope_type' | 'scope_value' | 'can_view' | 'can_update'
>

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function normalizeCampaignIdentifier(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) {
    return null
  }

  return isUuidLike(normalized) ? normalized.toLowerCase() : normalized
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  const normalized = normalizeText(value)
  return normalized ? normalized.toLocaleLowerCase('nl-NL') : null
}

function isIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
}

export function buildDepartmentScopeValue(orgId: string, departmentLabel: string) {
  return `${orgId}::department::${normalizeDepartmentLabel(departmentLabel) ?? ''}`
}

export function buildCampaignItemScopeValue(orgId: string, campaignId: string) {
  return `${orgId}::campaign::${normalizeCampaignIdentifier(campaignId) ?? ''}`
}

export function parseActionCenterManagerResponseScopeValue(routeScopeValue: string) {
  const normalizedRouteScopeValue = normalizeText(routeScopeValue)
  if (!normalizedRouteScopeValue) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  const segments = normalizedRouteScopeValue.split('::')
  if (segments.length !== 3) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  const [orgId, rawScopeType, scopeKey] = segments
  if (!orgId || !scopeKey) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  if (rawScopeType === 'department') {
    const normalizedDepartmentLabel = normalizeDepartmentLabel(scopeKey)
    if (!normalizedDepartmentLabel) {
      throw new Error('Ongeldige manager response route-identiteit.')
    }

    return {
      orgId,
      scopeType: 'department' as const,
      scopeKey: normalizedDepartmentLabel,
      canonicalScopeValue: buildDepartmentScopeValue(orgId, normalizedDepartmentLabel),
    }
  }

  if (rawScopeType === 'campaign') {
    const normalizedCampaignId = normalizeCampaignIdentifier(scopeKey)
    if (!normalizedCampaignId) {
      throw new Error('Ongeldige manager response route-identiteit.')
    }

    return {
      orgId,
      scopeType: 'item' as const,
      scopeKey: normalizedCampaignId,
      canonicalScopeValue: buildCampaignItemScopeValue(orgId, normalizedCampaignId),
    }
  }

  throw new Error('Ongeldige manager response route-identiteit.')
}

export function inferActionCenterManagerResponseScopeType(
  routeScopeValue: string,
): ActionCenterManagerResponseScopeType {
  return parseActionCenterManagerResponseScopeValue(routeScopeValue).scopeType
}

function isCanonicalRouteScopeForCampaign(args: {
  campaignId: string
  campaignOrgId: string
  routeScopeType: ActionCenterManagerResponseScopeType
  routeScopeValue: string
  visibleDepartmentLabels: string[]
}) {
  const parsedScopeValue = parseActionCenterManagerResponseScopeValue(args.routeScopeValue)

  if (args.routeScopeType === 'item') {
    return (
      parsedScopeValue.orgId === args.campaignOrgId &&
      parsedScopeValue.scopeType === 'item' &&
      parsedScopeValue.canonicalScopeValue === buildCampaignItemScopeValue(args.campaignOrgId, args.campaignId)
    )
  }

  return args.visibleDepartmentLabels.some(
    (label) => buildDepartmentScopeValue(args.campaignOrgId, label) === args.routeScopeValue,
  )
}

export function resolveManagerResponseWriteIdentity(args: {
  submitted: ActionCenterManagerResponseSubmittedIdentity
  currentUserId: string
  campaignOrgId: string
  visibleDepartmentLabels: string[]
  membership: ManagerAssignmentTruth | null
  isVerisightAdmin: boolean
}) {
  const submittedCampaignId = normalizeCampaignIdentifier(args.submitted.campaign_id)
  const submittedOrgId = normalizeText(args.submitted.org_id)
  const submittedScopeValue = normalizeText(args.submitted.route_scope_value)
  const submittedManagerUserId = normalizeText(args.submitted.manager_user_id)

  if (
    !submittedCampaignId ||
    !submittedScopeValue ||
    !RESPONSE_SCOPE_TYPES.has(args.submitted.route_scope_type as ActionCenterManagerResponseScopeType)
  ) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  if (
    submittedManagerUserId &&
    submittedManagerUserId !== args.currentUserId
  ) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  if (
    submittedOrgId &&
    submittedOrgId !== args.campaignOrgId
  ) {
    throw new Error('Manager response route bestaat niet voor deze campagne.')
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
    throw new Error('Manager response route bestaat niet voor deze campagne.')
  }

  if (args.isVerisightAdmin) {
    return {
      campaign_id: submittedCampaignId,
      org_id: args.campaignOrgId,
      route_scope_type: args.submitted.route_scope_type,
      route_scope_value: submittedScopeValue,
      manager_user_id: args.currentUserId,
    } satisfies ActionCenterManagerResponseSubmittedIdentity & {
      org_id: string
      manager_user_id: string
    }
  }

  if (
    !args.membership ||
    args.membership.access_role !== 'manager_assignee' ||
    !args.membership.can_view ||
    !args.membership.can_update ||
    args.membership.user_id !== args.currentUserId ||
    args.membership.org_id !== args.campaignOrgId ||
    args.membership.scope_type !== args.submitted.route_scope_type ||
    args.membership.scope_value !== submittedScopeValue
  ) {
    throw new Error('Ongeldige manager response route-identiteit.')
  }

  return {
    campaign_id: submittedCampaignId,
    org_id: args.membership.org_id,
    route_scope_type: args.membership.scope_type,
    route_scope_value: args.membership.scope_value,
    manager_user_id: args.currentUserId,
  } satisfies ActionCenterManagerResponseSubmittedIdentity & {
    org_id: string
    manager_user_id: string
  }
}

export function getActionCenterManagerResponseLabel(value: ActionCenterManagerResponseType) {
  switch (value) {
    case 'confirm':
      return 'Bevestigen'
    case 'sharpen':
      return 'Aanscherpen'
    case 'schedule':
      return 'Inplannen'
    case 'watch':
    default:
      return 'Begrenzen / volgen'
  }
}

export function hasPrimaryManagerAction(
  response: Pick<
    ActionCenterManagerResponse,
    'primary_action_theme_key' | 'primary_action_text' | 'primary_action_expected_effect'
  > | null | undefined,
) {
  return Boolean(
    normalizeText(response?.primary_action_theme_key) &&
      normalizeText(response?.primary_action_text) &&
      normalizeText(response?.primary_action_expected_effect),
  )
}

export function validateActionCenterManagerResponseWriteInput(
  input: Partial<ActionCenterManagerResponseWriteInput> | null | undefined,
): ActionCenterManagerResponseWriteInput {
  const campaignId = normalizeCampaignIdentifier(input?.campaign_id)
  const orgId = normalizeText(input?.org_id)
  const routeScopeType = input?.route_scope_type
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const managerUserId = normalizeText(input?.manager_user_id)
  const responseType = input?.response_type
  const responseNote = normalizeText(input?.response_note)
  const reviewScheduledFor = normalizeText(input?.review_scheduled_for)
  const primaryActionThemeKey = normalizeText(input?.primary_action_theme_key) as ActionCenterManagerActionThemeKey | null
  const primaryActionText = normalizeText(input?.primary_action_text)
  const primaryActionExpectedEffect = normalizeText(input?.primary_action_expected_effect)
  const primaryActionStatus = normalizeText(input?.primary_action_status) as ActionCenterManagerActionStatus | null

  if (
    !campaignId ||
    !orgId ||
    !RESPONSE_SCOPE_TYPES.has(routeScopeType as ActionCenterManagerResponseScopeType) ||
    !routeScopeValue ||
    !managerUserId ||
    !RESPONSE_TYPES.has(responseType as ActionCenterManagerResponseType) ||
    !responseNote ||
    !reviewScheduledFor ||
    !isIsoDate(reviewScheduledFor)
  ) {
    throw new Error('Ongeldige manager response input.')
  }

  const hasAnyPrimaryActionField = Boolean(
    primaryActionThemeKey || primaryActionText || primaryActionExpectedEffect || primaryActionStatus,
  )

  if (!hasAnyPrimaryActionField) {
    return {
      campaign_id: campaignId,
      org_id: orgId,
      route_scope_type: routeScopeType as ActionCenterManagerResponseScopeType,
      route_scope_value: routeScopeValue,
      manager_user_id: managerUserId,
      response_type: responseType as ActionCenterManagerResponseType,
      response_note: responseNote,
      review_scheduled_for: reviewScheduledFor,
      primary_action_theme_key: null,
      primary_action_text: null,
      primary_action_expected_effect: null,
      primary_action_status: null,
    }
  }

  if (
    !primaryActionThemeKey ||
    !THEME_KEYS.has(primaryActionThemeKey) ||
    !primaryActionText ||
    !primaryActionExpectedEffect ||
    !primaryActionStatus ||
    !ACTION_STATUSES.has(primaryActionStatus) ||
    !looksLikeActionCenterStep(primaryActionText) ||
    !looksLikeActionCenterExpectedEffect(primaryActionExpectedEffect)
  ) {
    throw new Error('Ongeldige manager response input.')
  }

  return {
    campaign_id: campaignId,
    org_id: orgId,
    route_scope_type: routeScopeType as ActionCenterManagerResponseScopeType,
    route_scope_value: routeScopeValue,
    manager_user_id: managerUserId,
    response_type: responseType as ActionCenterManagerResponseType,
    response_note: responseNote,
    review_scheduled_for: reviewScheduledFor,
    primary_action_theme_key: primaryActionThemeKey,
    primary_action_text: primaryActionText,
    primary_action_expected_effect: primaryActionExpectedEffect,
    primary_action_status: primaryActionStatus,
  }
}
