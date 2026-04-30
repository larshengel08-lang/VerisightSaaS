import { ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS } from './action-center-manager-responses'
import {
  looksLikeActionCenterExpectedEffect,
  looksLikeActionCenterStep,
} from './action-center-review-decisions'
import type { ActionCenterManagerActionThemeKey } from './pilot-learning'

export type ActionCenterRouteActionStatus = 'open' | 'in_review' | 'afgerond' | 'gestopt'

export interface ActionCenterRouteActionWriteInput {
  id: string
  route_id: string
  campaign_id: string
  route_scope_type: 'department' | 'item'
  route_scope_value: string
  owner_name: string
  owner_assigned_at: string
  primary_action_theme_key: ActionCenterManagerActionThemeKey
  primary_action_text: string
  primary_action_expected_effect: string
  primary_action_status: ActionCenterRouteActionStatus
  review_scheduled_for: string
  created_at: string
  updated_at: string
}

export interface ActionCenterRouteActionRecord {
  actionId: string
  routeId: string
  themeKey: ActionCenterManagerActionThemeKey
  actionText: string
  expectedEffect: string
  reviewScheduledFor: string
  status: ActionCenterRouteActionStatus
  createdAt: string
  updatedAt: string
}

export interface ActionCenterRouteActionDraftInput {
  primary_action_theme_key: ActionCenterManagerActionThemeKey
  primary_action_text: string
  primary_action_expected_effect: string
  primary_action_status: ActionCenterRouteActionStatus
  review_scheduled_for: string
}

const ACTION_STATUSES = new Set<ActionCenterRouteActionStatus>(['open', 'in_review', 'afgerond', 'gestopt'])
const ACTION_SCOPE_TYPES = new Set<ActionCenterRouteActionWriteInput['route_scope_type']>(['department', 'item'])
const THEME_LABELS = new Map(
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS.map((option) => [option.value, option.label] as const),
)

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  return Boolean(normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized))
}

function isIsoTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(normalized)) {
    return false
  }

  return !Number.isNaN(new Date(normalized).getTime())
}

export function validateActionCenterRouteActionWriteInput(
  input: Partial<ActionCenterRouteActionWriteInput> | null | undefined,
): ActionCenterRouteActionWriteInput {
  const actionId = normalizeText(input?.id)
  const routeId = normalizeText(input?.route_id)
  const campaignId = normalizeText(input?.campaign_id)
  const routeScopeType = input?.route_scope_type
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const ownerName = normalizeText(input?.owner_name)
  const ownerAssignedAt = normalizeText(input?.owner_assigned_at)
  const themeKey = normalizeText(input?.primary_action_theme_key) as ActionCenterManagerActionThemeKey | null
  const actionText = normalizeText(input?.primary_action_text)
  const expectedEffect = normalizeText(input?.primary_action_expected_effect)
  const status = normalizeText(input?.primary_action_status) as ActionCenterRouteActionStatus | null
  const reviewScheduledFor = normalizeText(input?.review_scheduled_for)
  const createdAt = normalizeText(input?.created_at)
  const updatedAt = normalizeText(input?.updated_at)

  if (
    !actionId ||
    !routeId ||
    !campaignId ||
    !ACTION_SCOPE_TYPES.has(routeScopeType as ActionCenterRouteActionWriteInput['route_scope_type']) ||
    !routeScopeValue ||
    !ownerName ||
    !ownerAssignedAt ||
    !themeKey ||
    !THEME_LABELS.has(themeKey) ||
    !actionText ||
    !expectedEffect ||
    !status ||
    !ACTION_STATUSES.has(status) ||
    !reviewScheduledFor ||
    !createdAt ||
    !updatedAt ||
    !isIsoDate(reviewScheduledFor) ||
    !isIsoTimestamp(ownerAssignedAt) ||
    !isIsoTimestamp(createdAt) ||
    !isIsoTimestamp(updatedAt) ||
    !looksLikeActionCenterStep(actionText) ||
    !looksLikeActionCenterExpectedEffect(expectedEffect)
  ) {
    throw new Error('Ongeldige route action input.')
  }

  return {
    id: actionId,
    route_id: routeId,
    campaign_id: campaignId,
    route_scope_type: routeScopeType as ActionCenterRouteActionWriteInput['route_scope_type'],
    route_scope_value: routeScopeValue,
    owner_name: ownerName,
    owner_assigned_at: ownerAssignedAt,
    primary_action_theme_key: themeKey,
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
    primary_action_status: status,
    review_scheduled_for: reviewScheduledFor,
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export function validateActionCenterRouteActionDraftInput(
  input: Partial<ActionCenterRouteActionDraftInput> | null | undefined,
): ActionCenterRouteActionDraftInput {
  const themeKey = normalizeText(input?.primary_action_theme_key) as ActionCenterManagerActionThemeKey | null
  const actionText = normalizeText(input?.primary_action_text)
  const expectedEffect = normalizeText(input?.primary_action_expected_effect)
  const status = normalizeText(input?.primary_action_status) as ActionCenterRouteActionStatus | null
  const reviewScheduledFor = normalizeText(input?.review_scheduled_for)

  if (
    !themeKey ||
    !THEME_LABELS.has(themeKey) ||
    !actionText ||
    !looksLikeActionCenterStep(actionText) ||
    !expectedEffect ||
    !looksLikeActionCenterExpectedEffect(expectedEffect) ||
    !status ||
    !ACTION_STATUSES.has(status) ||
    !reviewScheduledFor ||
    !isIsoDate(reviewScheduledFor)
  ) {
    throw new Error('Ongeldige route action input.')
  }

  return {
    primary_action_theme_key: themeKey,
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
    primary_action_status: status,
    review_scheduled_for: reviewScheduledFor,
  }
}

export function projectActionCenterRouteActionCard(
  input: Partial<ActionCenterRouteActionWriteInput> | null | undefined,
): ActionCenterRouteActionRecord {
  const validated = validateActionCenterRouteActionWriteInput(input)

  return {
    actionId: validated.id,
    routeId: validated.route_id,
    themeKey: validated.primary_action_theme_key,
    actionText: validated.primary_action_text,
    expectedEffect: validated.primary_action_expected_effect,
    reviewScheduledFor: validated.review_scheduled_for,
    status: validated.primary_action_status,
    createdAt: validated.created_at,
    updatedAt: validated.updated_at,
  }
}
