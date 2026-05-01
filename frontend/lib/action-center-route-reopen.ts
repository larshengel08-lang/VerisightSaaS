import type {
  ActionCenterRouteCloseoutRecord,
} from './action-center-route-closeout'

export type ActionCenterRouteReopenReason =
  | 'te-vroeg-afgesloten'
  | 'zelfde-traject-loopt-door'
  | 'nieuwe-informatie'

export type ActionCenterRouteReopenRole = 'hr' | 'manager'

export interface ActionCenterRouteReopenRecord {
  routeId: string
  reopenedAt: string
  reopenedByRole: ActionCenterRouteReopenRole
  reopenReason: ActionCenterRouteReopenReason
}

export type ActionCenterRouteRelationType = 'follow-up-from'

export interface ActionCenterRouteFollowUpRelationRecord {
  routeRelationType: ActionCenterRouteRelationType
  sourceRouteId: string
  targetRouteId: string
  recordedAt: string
  recordedByRole: ActionCenterRouteReopenRole
}

export interface ActionCenterRouteLifecycleProjection {
  activeCloseout: ActionCenterRouteCloseoutRecord | null
  historicalCloseout: ActionCenterRouteCloseoutRecord | null
  latestReopen: ActionCenterRouteReopenRecord | null
  isCurrentlyReopened: boolean
  lineageLabel: 'Heropend traject' | 'Vervolg op eerdere route' | null
  followUpFromRouteId: string | null
  followUpTargetRouteId: string | null
  hasFollowUpTarget: boolean
}

const REOPEN_REASONS = new Set<ActionCenterRouteReopenReason>([
  'te-vroeg-afgesloten',
  'zelfde-traject-loopt-door',
  'nieuwe-informatie',
])

const REOPEN_ROLES = new Set<ActionCenterRouteReopenRole>(['hr', 'manager'])
const ROUTE_RELATION_TYPES = new Set<ActionCenterRouteRelationType>(['follow-up-from'])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isIsoTimestamp(value: string | null | undefined) {
  const normalized = normalizeText(value)
  if (!normalized) return false

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(normalized)) {
    return false
  }

  return !Number.isNaN(new Date(normalized).getTime())
}

function compareDescending(left: string, right: string) {
  return new Date(right).getTime() - new Date(left).getTime()
}

export function projectActionCenterRouteReopen(
  input: Record<string, unknown> | null | undefined,
): ActionCenterRouteReopenRecord {
  const routeId = normalizeText(
    typeof input?.route_id === 'string'
      ? input.route_id
      : typeof input?.routeId === 'string'
        ? input.routeId
        : null,
  )
  const reopenedAt = normalizeText(
    typeof input?.reopened_at === 'string'
      ? input.reopened_at
      : typeof input?.reopenedAt === 'string'
        ? input.reopenedAt
        : null,
  )
  const reopenedByRole = normalizeText(
    typeof input?.reopened_by_role === 'string'
      ? input.reopened_by_role
      : typeof input?.reopenedByRole === 'string'
        ? input.reopenedByRole
        : null,
  ) as ActionCenterRouteReopenRole | null
  const reopenReason = normalizeText(
    typeof input?.reopen_reason === 'string'
      ? input.reopen_reason
      : typeof input?.reopenReason === 'string'
        ? input.reopenReason
        : null,
  ) as ActionCenterRouteReopenReason | null

  if (
    !routeId ||
    !reopenedAt ||
    !isIsoTimestamp(reopenedAt) ||
    !reopenedByRole ||
    !REOPEN_ROLES.has(reopenedByRole) ||
    !reopenReason ||
    !REOPEN_REASONS.has(reopenReason)
  ) {
    throw new Error('Ongeldige action center route reopen input: route_id, reopened_at, reopened_by_role en reopen_reason zijn verplicht.')
  }

  return {
    routeId,
    reopenedAt,
    reopenedByRole,
    reopenReason,
  }
}

export function projectActionCenterRouteFollowUpRelation(
  input: Record<string, unknown> | null | undefined,
): ActionCenterRouteFollowUpRelationRecord {
  const routeRelationType = normalizeText(
    typeof input?.route_relation_type === 'string'
      ? input.route_relation_type
      : typeof input?.routeRelationType === 'string'
        ? input.routeRelationType
        : null,
  ) as ActionCenterRouteRelationType | null
  const sourceRouteId = normalizeText(
    typeof input?.source_route_id === 'string'
      ? input.source_route_id
      : typeof input?.sourceRouteId === 'string'
        ? input.sourceRouteId
        : null,
  )
  const targetRouteId = normalizeText(
    typeof input?.target_route_id === 'string'
      ? input.target_route_id
      : typeof input?.targetRouteId === 'string'
        ? input.targetRouteId
        : null,
  )
  const recordedAt = normalizeText(
    typeof input?.recorded_at === 'string'
      ? input.recorded_at
      : typeof input?.recordedAt === 'string'
        ? input.recordedAt
        : null,
  )
  const recordedByRole = normalizeText(
    typeof input?.recorded_by_role === 'string'
      ? input.recorded_by_role
      : typeof input?.recordedByRole === 'string'
        ? input.recordedByRole
        : null,
  ) as ActionCenterRouteReopenRole | null

  if (
    !routeRelationType ||
    !ROUTE_RELATION_TYPES.has(routeRelationType) ||
    !sourceRouteId ||
    !targetRouteId ||
    !recordedAt ||
    !isIsoTimestamp(recordedAt) ||
    !recordedByRole ||
    !REOPEN_ROLES.has(recordedByRole)
  ) {
    throw new Error('Ongeldige action center route relation input: route_relation_type, source_route_id, target_route_id, recorded_at en recorded_by_role zijn verplicht.')
  }

  return {
    routeRelationType,
    sourceRouteId,
    targetRouteId,
    recordedAt,
    recordedByRole,
  }
}

export function projectActionCenterRouteLifecycle(args: {
  routeCloseout?: ActionCenterRouteCloseoutRecord | null
  routeReopens?: ActionCenterRouteReopenRecord[] | null
  followUpFromRelation?: ActionCenterRouteFollowUpRelationRecord | null
  followUpTargetRelation?: ActionCenterRouteFollowUpRelationRecord | null
}): ActionCenterRouteLifecycleProjection {
  const latestReopen =
    [...(args.routeReopens ?? [])].sort((left, right) => compareDescending(left.reopenedAt, right.reopenedAt))[0] ??
    null
  const closeout = args.routeCloseout ?? null
  const closeoutIsCurrent =
    closeout &&
    (!latestReopen || new Date(closeout.closedAt).getTime() >= new Date(latestReopen.reopenedAt).getTime())
      ? true
      : false

  const isCurrentlyReopened = Boolean(closeout && latestReopen && !closeoutIsCurrent)
  const activeCloseout = closeoutIsCurrent ? closeout : null
  const historicalCloseout = closeout

  let lineageLabel: ActionCenterRouteLifecycleProjection['lineageLabel'] = null
  if (isCurrentlyReopened) {
    lineageLabel = 'Heropend traject'
  } else if (args.followUpFromRelation) {
    lineageLabel = 'Vervolg op eerdere route'
  }

  return {
    activeCloseout,
    historicalCloseout,
    latestReopen,
    isCurrentlyReopened,
    lineageLabel,
    followUpFromRouteId: args.followUpFromRelation?.sourceRouteId ?? null,
    followUpTargetRouteId: args.followUpTargetRelation?.targetRouteId ?? null,
    hasFollowUpTarget: Boolean(args.followUpTargetRelation?.targetRouteId),
  }
}

export function getActionCenterRouteReopenReasonLabel(reason: ActionCenterRouteReopenReason) {
  switch (reason) {
    case 'te-vroeg-afgesloten':
      return 'Te vroeg afgesloten'
    case 'zelfde-traject-loopt-door':
      return 'Zelfde traject loopt door'
    case 'nieuwe-informatie':
    default:
      return 'Nieuwe informatie'
  }
}

export function getActionCenterRouteRelationLabel(type: ActionCenterRouteRelationType) {
  if (type === 'follow-up-from') {
    return 'Vervolg op eerdere route'
  }

  return type
}
