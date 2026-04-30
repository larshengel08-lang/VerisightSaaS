import {
  looksLikeActionCenterExpectedEffect,
  looksLikeActionCenterStep,
} from './action-center-review-decisions'
import type {
  ActionCenterManagerActionStatus,
  ActionCenterManagerActionThemeKey,
  ActionCenterManagerResponse,
  ActionCenterManagerResponseScopeType,
  ActionCenterManagerResponseType,
} from './pilot-learning'

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

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
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
  const campaignId = normalizeText(input?.campaign_id)
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
