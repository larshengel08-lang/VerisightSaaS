import type { ActionCenterGovernanceActorRole } from './action-center-governance'

export type ActionCenterRouteCloseoutStatus = 'afgerond' | 'gestopt'

export type ActionCenterRouteCloseoutReason =
  | 'voldoende-opgepakt'
  | 'effect-voldoende-zichtbaar'
  | 'geen-verdere-opvolging-nodig'
  | 'geen-lokale-vervolgstap-nodig'
  | 'bewust-niet-voortzetten'
  | 'elders-opgepakt'

export type ActionCenterRouteCloseoutRole = ActionCenterGovernanceActorRole | 'manager'

export interface ActionCenterRouteCloseoutRecord {
  routeId: string
  closeoutStatus: ActionCenterRouteCloseoutStatus
  closeoutReason: ActionCenterRouteCloseoutReason
  closeoutNote: string | null
  closedAt: string
  closedByRole: ActionCenterRouteCloseoutRole
}

export interface ActionCenterRouteCloseoutProjection {
  closeoutStatus: ActionCenterRouteCloseoutStatus | null
  closeoutReason: ActionCenterRouteCloseoutReason | null
  closeoutNote: string | null
  closedAt: string | null
  closedByRole: ActionCenterRouteCloseoutRole | null
  readyForCloseout: boolean
}

const CLOSEOUT_STATUSES = new Set<ActionCenterRouteCloseoutStatus>(['afgerond', 'gestopt'])
const CLOSEOUT_REASONS = new Set<ActionCenterRouteCloseoutReason>([
  'voldoende-opgepakt',
  'effect-voldoende-zichtbaar',
  'geen-verdere-opvolging-nodig',
  'geen-lokale-vervolgstap-nodig',
  'bewust-niet-voortzetten',
  'elders-opgepakt',
])
const CLOSEOUT_ROLES = new Set<ActionCenterRouteCloseoutRole>([
  'verisight_admin',
  'verisight',
  'hr_owner',
  'hr_member',
  'hr',
  'manager',
])

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

export function projectActionCenterRouteCloseout(
  input: Record<string, unknown> | null | undefined,
): ActionCenterRouteCloseoutRecord {
  const routeId = normalizeText(
    typeof input?.route_id === 'string'
      ? input.route_id
      : typeof input?.routeId === 'string'
        ? input.routeId
        : null,
  )
  const closeoutStatus = normalizeText(
    typeof input?.closeout_status === 'string'
      ? input.closeout_status
      : typeof input?.closeoutStatus === 'string'
        ? input.closeoutStatus
        : null,
  ) as ActionCenterRouteCloseoutStatus | null
  const closeoutReason = normalizeText(
    typeof input?.closeout_reason === 'string'
      ? input.closeout_reason
      : typeof input?.closeoutReason === 'string'
        ? input.closeoutReason
        : null,
  ) as ActionCenterRouteCloseoutReason | null
  const closeoutNote = normalizeText(
    typeof input?.closeout_note === 'string'
      ? input.closeout_note
      : typeof input?.closeoutNote === 'string'
        ? input.closeoutNote
        : null,
  )
  const closedAt = normalizeText(
    typeof input?.closed_at === 'string'
      ? input.closed_at
      : typeof input?.closedAt === 'string'
        ? input.closedAt
        : null,
  )
  const closedByRole = normalizeText(
    typeof input?.closed_by_role === 'string'
      ? input.closed_by_role
      : typeof input?.closedByRole === 'string'
        ? input.closedByRole
        : null,
  ) as ActionCenterRouteCloseoutRole | null

  if (
    !routeId ||
    !closeoutStatus ||
    !CLOSEOUT_STATUSES.has(closeoutStatus) ||
    !closeoutReason ||
    !CLOSEOUT_REASONS.has(closeoutReason) ||
    !closedAt ||
    !isIsoTimestamp(closedAt) ||
    !closedByRole ||
    !CLOSEOUT_ROLES.has(closedByRole)
  ) {
    throw new Error('Ongeldige action center route closeout input: route_id, closeout_status, closeout_reason, closed_at en closed_by_role zijn verplicht.')
  }

  return {
    routeId,
    closeoutStatus,
    closeoutReason,
    closeoutNote,
    closedAt,
    closedByRole,
  }
}

export function projectActionCenterRouteCloseoutState(args: {
  record?: ActionCenterRouteCloseoutRecord | null
  readyForCloseout?: boolean
}): ActionCenterRouteCloseoutProjection {
  if (args.record) {
    return {
      closeoutStatus: args.record.closeoutStatus,
      closeoutReason: args.record.closeoutReason,
      closeoutNote: args.record.closeoutNote,
      closedAt: args.record.closedAt,
      closedByRole: args.record.closedByRole,
      readyForCloseout: false,
    }
  }

  return {
    closeoutStatus: null,
    closeoutReason: null,
    closeoutNote: null,
    closedAt: null,
    closedByRole: null,
    readyForCloseout: Boolean(args.readyForCloseout),
  }
}
