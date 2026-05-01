import type { ActionCenterRouteCloseoutRecord } from './action-center-route-closeout'

export type ActionCenterRouteReopenRole = 'hr' | 'manager' | 'verisight'

export type ActionCenterRouteReopenReason =
  | 'te-vroeg-afgesloten'
  | 'nieuw-signaal'
  | 'herbeoordeling'
  | 'vervolg-nodig'
  | (string & {})

export interface ActionCenterRouteReopenRecord {
  routeId: string
  reopenedAt: string
  reopenedByRole: ActionCenterRouteReopenRole
  reopenReason: ActionCenterRouteReopenReason
}

export type ActionCenterRouteFollowUpTriggerReason =
  | 'nieuw-campaign-signaal'
  | 'nieuw-segment-signaal'
  | 'hernieuwde-hr-beoordeling'

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
const REOPEN_ROLES = new Set<ActionCenterRouteReopenRole>(['hr', 'manager', 'verisight'])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isValidIsoTimestamp(value: string) {
  return !Number.isNaN(Date.parse(value))
}

function readCanonicalUnknownText(
  input: Record<string, unknown> | null | undefined,
  snakeKey: string,
  camelKey: string,
) {
  const snakeValue = input?.[snakeKey]
  const camelValue = input?.[camelKey]

  return normalizeText(
    typeof snakeValue === 'string'
      ? snakeValue
      : typeof camelValue === 'string'
        ? camelValue
        : null,
  )
}

function readCanonicalText(input: ActionCenterRouteFollowUpRelationInput, snakeKey: keyof ActionCenterRouteFollowUpRelationInput, camelKey: keyof ActionCenterRouteFollowUpRelationInput) {
  return normalizeText((input[snakeKey] as string | null | undefined) ?? (input[camelKey] as string | null | undefined))
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

export function projectActionCenterRouteReopen(
  input: Record<string, unknown> | null | undefined,
): ActionCenterRouteReopenRecord {
  const routeId = readCanonicalUnknownText(input, 'route_id', 'routeId')
  const reopenedAt = readCanonicalUnknownText(input, 'reopened_at', 'reopenedAt')
  const reopenedByRole = readCanonicalUnknownText(
    input,
    'reopened_by_role',
    'reopenedByRole',
  ) as ActionCenterRouteReopenRole | null
  const reopenReason = readCanonicalUnknownText(
    input,
    'reopen_reason',
    'reopenReason',
  ) as ActionCenterRouteReopenReason | null

  if (!routeId || !reopenedAt || !isValidIsoTimestamp(reopenedAt) || !reopenedByRole || !REOPEN_ROLES.has(reopenedByRole) || !reopenReason) {
    throw new Error(
      'Ongeldige action center route reopen input: route_id, reopened_at, reopened_by_role en reopen_reason zijn verplicht.',
    )
  }

  return {
    routeId,
    reopenedAt,
    reopenedByRole,
    reopenReason,
  }
}

export function projectActionCenterRouteLifecycle(args: {
  routeCloseout?: ActionCenterRouteCloseoutRecord | null
  routeReopens?: ActionCenterRouteReopenRecord[]
  followUpFromRelation?: ActionCenterRouteFollowUpRelationRecord | null
  followUpTargetRelation?: ActionCenterRouteFollowUpRelationRecord | null
}) {
  const latestReopen =
    [...(args.routeReopens ?? [])]
      .sort((left, right) => Date.parse(right.reopenedAt) - Date.parse(left.reopenedAt))[0] ?? null

  const closeoutIsActive = Boolean(
    args.routeCloseout &&
      (!latestReopen || Date.parse(args.routeCloseout.closedAt) >= Date.parse(latestReopen.reopenedAt)),
  )

  const activeCloseout = closeoutIsActive ? (args.routeCloseout ?? null) : null
  const isCurrentlyReopened = Boolean(latestReopen && !activeCloseout)

  const activeFollowUpFromRelation =
    args.followUpFromRelation && !normalizeText(args.followUpFromRelation.endedAt)
      ? args.followUpFromRelation
      : null
  const activeFollowUpTargetRelation =
    args.followUpTargetRelation && !normalizeText(args.followUpTargetRelation.endedAt)
      ? args.followUpTargetRelation
      : null

  const followUpFromRouteId = activeFollowUpFromRelation?.sourceRouteId ?? null
  const followUpTargetRouteId = activeFollowUpTargetRelation?.targetRouteId ?? null
  const hasFollowUpTarget = Boolean(followUpTargetRouteId)

  return {
    activeCloseout,
    latestReopen,
    isCurrentlyReopened,
    followUpFromRouteId,
    followUpTargetRouteId,
    hasFollowUpTarget,
    lineageLabel: isCurrentlyReopened
      ? ('Heropend traject' as const)
      : followUpFromRouteId
        ? ('Vervolg op eerdere route' as const)
        : null,
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
