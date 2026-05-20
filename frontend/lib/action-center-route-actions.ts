import { ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS } from './action-center-manager-responses'
import type {
  ActionCenterActionDraftDisposition,
  ActionCenterActionSemanticState,
} from './action-center-constitution'
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
  primary_action_theme_key: ActionCenterManagerActionThemeKey | null
  primary_action_text: string | null
  primary_action_expected_effect: string | null
  primary_action_status: ActionCenterRouteActionStatus | null
  review_scheduled_for: string | null
  created_at: string
  updated_at: string
}

export interface ValidatedActionCenterRouteActionWriteInput extends ActionCenterRouteActionWriteInput {
  primary_action_theme_key: ActionCenterManagerActionThemeKey
  primary_action_text: string
  primary_action_expected_effect: string
  primary_action_status: ActionCenterRouteActionStatus
  review_scheduled_for: string
  semanticState: Extract<ActionCenterActionSemanticState, 'active'>
  validationDisposition: null
}

export interface ActionCenterRouteActionRecord {
  actionId: string
  routeId: string
  themeKey: ActionCenterManagerActionThemeKey | null
  actionText: string | null
  expectedEffect: string | null
  reviewScheduledFor: string | null
  status: ActionCenterRouteActionStatus | null
  semanticState: Extract<ActionCenterActionSemanticState, 'draft' | 'active'>
  validationDisposition: ActionCenterActionDraftDisposition | null
  createdAt: string
  updatedAt: string
}

export interface ActionCenterRouteActionDraftInput {
  primary_action_theme_key: ActionCenterManagerActionThemeKey | null
  primary_action_text: string | null
  primary_action_expected_effect: string | null
  primary_action_status: ActionCenterRouteActionStatus | null
  review_scheduled_for: string | null
}

export interface ValidatedActionCenterRouteActionDraft extends ActionCenterRouteActionDraftInput {
  semanticState: Extract<ActionCenterActionSemanticState, 'draft'>
  validationDisposition: ActionCenterActionDraftDisposition
}

const ACTION_STATUSES = new Set<ActionCenterRouteActionStatus>(['open', 'in_review', 'afgerond', 'gestopt'])
const ACTION_SCOPE_TYPES = new Set<ActionCenterRouteActionWriteInput['route_scope_type']>(['department', 'item'])
const THEME_LABELS = new Map(
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS.map((option) => [option.value, option.label] as const),
)
const ACTION_CENTER_DRAFT_HR_REVIEW_PATTERNS = [
  /\bproject\b/,
  /\bhr-project\b/,
  /\broadmap\b/,
  /\bprogramma\b/,
  /\bprogrammalijn\b/,
  /\bworkstreams?\b/,
  /\borganisatiebreed\b/,
  /\borganisatie-breed\b/,
] as const
const ACTION_CENTER_DRAFT_OUTSIDE_BOUNDED_PATTERNS = [
  /\bdossier\b/,
  /\bvervolgroute\b/,
  /\bstopreden\b/,
  /\brouting\b/,
  /\bmanagement_action_outcome\b/,
  /\badoption_outcome\b/,
  /\bcase_public_summary\b/,
] as const
const ACTION_CENTER_DRAFT_EMPLOYEE_PATTERNS = [/\bemployee\b/, /\bindividual\b/, /\bmedewerker\b/, /\bwerknemer\b/] as const
const ACTION_CENTER_DRAFT_SURVEILLANCE_PATTERNS = [
  /\bmonitor\b/,
  /\bdetail\b/,
  /\bdetails\b/,
  /\brisk\b/,
  /\brisico\b/,
  /\btrack\b/,
  /\bclosely\b/,
] as const

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoDate(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
  if (!match) return false

  const year = Number.parseInt(match[1] ?? '', 10)
  const month = Number.parseInt(match[2] ?? '', 10)
  const day = Number.parseInt(match[3] ?? '', 10)
  return isValidCalendarDate(year, month, day)
}

function isValidCalendarDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day))

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

function isIsoTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      normalized,
    )
  if (!match) {
    return false
  }

  const year = Number.parseInt(match[1] ?? '', 10)
  const month = Number.parseInt(match[2] ?? '', 10)
  const day = Number.parseInt(match[3] ?? '', 10)
  const hour = Number.parseInt(match[4] ?? '', 10)
  const minute = Number.parseInt(match[5] ?? '', 10)
  const second = Number.parseInt(match[6] ?? '', 10)

  if (!isValidCalendarDate(year, month, day)) {
    return false
  }

  if (hour > 23 || minute > 59 || second > 59) {
    return false
  }

  if (match[7] !== 'Z') {
    const offsetHour = Number.parseInt(match[9] ?? '', 10)
    const offsetMinute = Number.parseInt(match[10] ?? '', 10)

    if (Number.isNaN(offsetHour) || Number.isNaN(offsetMinute) || offsetHour > 23 || offsetMinute > 59) {
      return false
    }
  }

  return true
}

function matchesAnyPattern(value: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(value))
}

function validateRequiredActionDraftFields(
  input: Partial<ActionCenterRouteActionDraftInput> | null | undefined,
): ActionCenterRouteActionDraftInput {
  const rawThemeKey = normalizeText(input?.primary_action_theme_key)
  const themeKey =
    rawThemeKey && THEME_LABELS.has(rawThemeKey as ActionCenterManagerActionThemeKey)
      ? (rawThemeKey as ActionCenterManagerActionThemeKey)
      : null
  const actionText = normalizeText(input?.primary_action_text)
  const expectedEffect = normalizeText(input?.primary_action_expected_effect)
  const rawReviewScheduledFor = normalizeText(input?.review_scheduled_for)
  const reviewScheduledFor =
    rawReviewScheduledFor && isIsoDate(rawReviewScheduledFor) ? rawReviewScheduledFor : null

  return {
    primary_action_theme_key: themeKey,
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
    primary_action_status: null,
    review_scheduled_for: reviewScheduledFor,
  }
}

function hasBoundedDraftStructure(input: ActionCenterRouteActionDraftInput) {
  return (
    Boolean(input.primary_action_theme_key) &&
    Boolean(input.review_scheduled_for && isIsoDate(input.review_scheduled_for)) &&
    Boolean(input.primary_action_text) &&
    Boolean(input.primary_action_expected_effect) &&
    looksLikeActionCenterStep(input.primary_action_text) &&
    looksLikeActionCenterExpectedEffect(input.primary_action_expected_effect)
  )
}

function buildDraftSemanticSurface(input: Pick<
  ActionCenterRouteActionDraftInput,
  'primary_action_text' | 'primary_action_expected_effect'
>) {
  return `${input.primary_action_text ?? ''} ${input.primary_action_expected_effect ?? ''}`.toLocaleLowerCase('nl-NL')
}

function looksLikeEmployeeDossierLanguage(
  actionText: string | null,
  expectedEffect: string | null,
) {
  const semanticSurface = buildDraftSemanticSurface({
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
  })

  return (
    matchesAnyPattern(semanticSurface, ACTION_CENTER_DRAFT_OUTSIDE_BOUNDED_PATTERNS) ||
    (matchesAnyPattern(semanticSurface, ACTION_CENTER_DRAFT_EMPLOYEE_PATTERNS) &&
      matchesAnyPattern(semanticSurface, ACTION_CENTER_DRAFT_SURVEILLANCE_PATTERNS))
  )
}

function looksLikeBroadProjectLanguage(
  actionText: string | null,
  expectedEffect: string | null,
) {
  const semanticSurface = buildDraftSemanticSurface({
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
  })

  return matchesAnyPattern(semanticSurface, ACTION_CENTER_DRAFT_HR_REVIEW_PATTERNS)
}

function validatePersistedActionCenterRouteActionInput(
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
    !createdAt ||
    !updatedAt ||
    !isIsoTimestamp(ownerAssignedAt) ||
    !isIsoTimestamp(createdAt) ||
    !isIsoTimestamp(updatedAt)
  ) {
    throw new Error('Ongeldige route action input.')
  }

  if (themeKey && !THEME_LABELS.has(themeKey)) {
    throw new Error('Ongeldige route action input.')
  }

  if (status && !ACTION_STATUSES.has(status)) {
    throw new Error('Ongeldige route action input.')
  }

  if (reviewScheduledFor && !isIsoDate(reviewScheduledFor)) {
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

export function validateActionCenterRouteActionWriteInput(
  input: Partial<ActionCenterRouteActionWriteInput> | null | undefined,
): ValidatedActionCenterRouteActionWriteInput {
  const validated = validatePersistedActionCenterRouteActionInput(input)

  if (
    !validated.primary_action_theme_key ||
    !validated.primary_action_text ||
    !validated.primary_action_expected_effect ||
    !validated.primary_action_status ||
    !validated.review_scheduled_for ||
    !looksLikeActionCenterStep(validated.primary_action_text) ||
    !looksLikeActionCenterExpectedEffect(validated.primary_action_expected_effect)
  ) {
    throw new Error('Ongeldige route action input.')
  }

  return {
    ...validated,
    primary_action_theme_key: validated.primary_action_theme_key,
    primary_action_text: validated.primary_action_text,
    primary_action_expected_effect: validated.primary_action_expected_effect,
    primary_action_status: validated.primary_action_status,
    review_scheduled_for: validated.review_scheduled_for,
    semanticState: 'active',
    validationDisposition: null,
  }
}

export function validateActionCenterRouteActionDraftInput(
  input: Partial<ActionCenterRouteActionDraftInput> | null | undefined,
): ValidatedActionCenterRouteActionDraft {
  const validated = validateRequiredActionDraftFields(input)

  if (looksLikeEmployeeDossierLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    throw new Error('Route action is outside bounded execution.')
  }

  if (!hasBoundedDraftStructure(validated)) {
    return {
      ...validated,
      semanticState: 'draft',
      validationDisposition: 'invalid',
    }
  }

  if (looksLikeBroadProjectLanguage(validated.primary_action_text, validated.primary_action_expected_effect)) {
    return {
      ...validated,
      semanticState: 'draft',
      validationDisposition: 'needs_hr_review',
    }
  }

  return {
    ...validated,
    semanticState: 'draft',
    validationDisposition: 'valid',
  }
}

export function projectActionCenterRouteActionCard(
  input: Partial<ActionCenterRouteActionWriteInput> | null | undefined,
): ActionCenterRouteActionRecord {
  const persisted = validatePersistedActionCenterRouteActionInput(input)

  if (persisted.primary_action_status) {
    const validated = validateActionCenterRouteActionWriteInput(persisted)

    return {
      actionId: validated.id,
      routeId: validated.route_id,
      themeKey: validated.primary_action_theme_key,
      actionText: validated.primary_action_text,
      expectedEffect: validated.primary_action_expected_effect,
      reviewScheduledFor: validated.review_scheduled_for,
      status: validated.primary_action_status,
      semanticState: validated.semanticState,
      validationDisposition: validated.validationDisposition,
      createdAt: validated.created_at,
      updatedAt: validated.updated_at,
    }
  }

  const draft = validateActionCenterRouteActionDraftInput({
    primary_action_theme_key: persisted.primary_action_theme_key,
    primary_action_text: persisted.primary_action_text,
    primary_action_expected_effect: persisted.primary_action_expected_effect,
    primary_action_status: persisted.primary_action_status,
    review_scheduled_for: persisted.review_scheduled_for,
  })

  return {
    actionId: persisted.id,
    routeId: persisted.route_id,
    themeKey: draft.primary_action_theme_key,
    actionText: draft.primary_action_text,
    expectedEffect: draft.primary_action_expected_effect,
    reviewScheduledFor: draft.review_scheduled_for,
    status: null,
    semanticState: draft.semanticState,
    validationDisposition: draft.validationDisposition,
    createdAt: persisted.created_at,
    updatedAt: persisted.updated_at,
  }
}
