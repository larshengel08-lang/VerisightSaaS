export type ActionCenterRouteFollowUpTriggerReason =
  | 'nieuw-campaign-signaal'
  | 'nieuw-segment-signaal'
  | 'hernieuwde-hr-beoordeling'

export interface ActionCenterRouteReopenRecord {
  id?: string | null
  routeId: string
  reopenedAt: string
  reopenedByRole: string
}

export interface ActionCenterRouteReopenInput {
  id?: string | null
  route_id?: string | null
  routeId?: string | null
  reopened_at?: string | null
  reopenedAt?: string | null
  reopened_by_role?: string | null
  reopenedByRole?: string | null
}

export interface ActionCenterRouteFollowUpRelationRecord {
  id?: string | null
  routeRelationType: 'follow-up-from'
  sourceRouteId: string
  targetRouteId: string
  triggerReason: ActionCenterRouteFollowUpTriggerReason
  recordedAt: string
  recordedByRole: string
  endedAt?: string | null
}

export interface ActionCenterRouteFollowUpRelationInput {
  id?: string | null
  route_relation_type?: string | null
  routeRelationType?: string | null
  source_route_id?: string | null
  sourceRouteId?: string | null
  target_route_id?: string | null
  targetRouteId?: string | null
  trigger_reason?: string | null
  triggerReason?: string | null
  recorded_at?: string | null
  recordedAt?: string | null
  recorded_by_role?: string | null
  recordedByRole?: string | null
  ended_at?: string | null
  endedAt?: string | null
}

const FOLLOW_UP_TRIGGER_REASONS = new Set<ActionCenterRouteFollowUpTriggerReason>([
  'nieuw-campaign-signaal',
  'nieuw-segment-signaal',
  'hernieuwde-hr-beoordeling',
])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isValidIsoTimestamp(value: string) {
  return !Number.isNaN(Date.parse(value))
}

function readCanonicalText(input: ActionCenterRouteFollowUpRelationInput, snakeKey: keyof ActionCenterRouteFollowUpRelationInput, camelKey: keyof ActionCenterRouteFollowUpRelationInput) {
  return normalizeText((input[snakeKey] as string | null | undefined) ?? (input[camelKey] as string | null | undefined))
}

function readCanonicalReopenText(
  input: ActionCenterRouteReopenInput,
  snakeKey: keyof ActionCenterRouteReopenInput,
  camelKey: keyof ActionCenterRouteReopenInput,
) {
  return normalizeText((input[snakeKey] as string | null | undefined) ?? (input[camelKey] as string | null | undefined))
}

export function projectActionCenterRouteReopen(input: ActionCenterRouteReopenInput): ActionCenterRouteReopenRecord {
  const routeId = readCanonicalReopenText(input, 'route_id', 'routeId')
  const reopenedAt = readCanonicalReopenText(input, 'reopened_at', 'reopenedAt')
  const reopenedByRole = readCanonicalReopenText(input, 'reopened_by_role', 'reopenedByRole')

  if (!routeId) {
    throw new Error('route_id is required.')
  }

  if (!reopenedAt) {
    throw new Error('reopened_at is required.')
  }

  if (!isValidIsoTimestamp(reopenedAt)) {
    throw new Error('reopened_at is invalid.')
  }

  if (!reopenedByRole) {
    throw new Error('reopened_by_role is required.')
  }

  return {
    id: normalizeText(input.id),
    routeId,
    reopenedAt,
    reopenedByRole,
  }
}

export function projectActionCenterRouteFollowUpRelation(
  input: ActionCenterRouteFollowUpRelationInput,
): ActionCenterRouteFollowUpRelationRecord {
  const routeRelationType = readCanonicalText(input, 'route_relation_type', 'routeRelationType')
  const sourceRouteId = readCanonicalText(input, 'source_route_id', 'sourceRouteId')
  const targetRouteId = readCanonicalText(input, 'target_route_id', 'targetRouteId')
  const triggerReason = readCanonicalText(input, 'trigger_reason', 'triggerReason')
  const recordedAt = readCanonicalText(input, 'recorded_at', 'recordedAt')
  const recordedByRole = readCanonicalText(input, 'recorded_by_role', 'recordedByRole')

  if (routeRelationType !== 'follow-up-from') {
    throw new Error('route_relation_type is required and must be follow-up-from.')
  }

  if (!sourceRouteId) {
    throw new Error('source_route_id is required.')
  }

  if (!targetRouteId) {
    throw new Error('target_route_id is required.')
  }

  if (!triggerReason) {
    throw new Error('trigger_reason is required.')
  }

  if (!FOLLOW_UP_TRIGGER_REASONS.has(triggerReason as ActionCenterRouteFollowUpTriggerReason)) {
    throw new Error('trigger_reason is invalid.')
  }

  if (!recordedAt) {
    throw new Error('recorded_at is required.')
  }

  if (!isValidIsoTimestamp(recordedAt)) {
    throw new Error('recorded_at is invalid.')
  }

  if (!recordedByRole) {
    throw new Error('recorded_by_role is required.')
  }

  return {
    id: normalizeText(input.id),
    routeRelationType: 'follow-up-from',
    sourceRouteId,
    targetRouteId,
    triggerReason: triggerReason as ActionCenterRouteFollowUpTriggerReason,
    recordedAt,
    recordedByRole,
    endedAt: readCanonicalText(input, 'ended_at', 'endedAt'),
  }
}

export function getActionCenterFollowUpTriggerReasonLabel(value: ActionCenterRouteFollowUpTriggerReason) {
  switch (value) {
    case 'nieuw-campaign-signaal':
      return 'Nieuw campaign-signaal'
    case 'nieuw-segment-signaal':
      return 'Nieuw segmentsignaal'
    case 'hernieuwde-hr-beoordeling':
      return 'Hernieuwde HR-beoordeling'
  }

  const exhaustiveCheck: never = value
  throw new Error(`Onbekende follow-up trigger reason: ${exhaustiveCheck}`)
}
