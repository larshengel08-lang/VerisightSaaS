import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import type { ActionCenterGovernanceActorRole } from '@/lib/action-center-governance'
import type { ActionCenterGovernanceQueueCode } from '@/lib/action-center-governance-queues'

export const ACTION_CENTER_GOVERNANCE_INTERVENTION_TYPES = [
  'observe_only',
  'request_manager_update',
  'send_bounded_reminder',
  'require_action_review',
  'mark_hr_review_required',
  'request_action_correction',
  'suppress_false_signal',
  'close_route',
  'continue_route',
  'reopen_route',
] as const

export type ActionCenterGovernanceInterventionType =
  (typeof ACTION_CENTER_GOVERNANCE_INTERVENTION_TYPES)[number]

export interface ActionCenterGovernanceInterventionInput {
  routeId: string
  routeSourceId: string
  routeScopeValue: string
  orgId: string
  queueCode: ActionCenterGovernanceQueueCode
  interventionType: ActionCenterGovernanceInterventionType | string
  actorRole: ActionCenterGovernanceActorRole
  actorUserId?: string | null
  actionId?: string | null
  reasonCode?: string | null
}

export interface ActionCenterGovernanceInterventionRecord {
  route_id: string
  action_id: string | null
  route_source_id: string
  route_scope_value: string
  org_id: string
  queue_code: ActionCenterGovernanceQueueCode
  intervention_type: ActionCenterGovernanceInterventionType
  reason_code: string | null
  actor_role: ActionCenterGovernanceActorRole
  actor_user_id: string
  created_at: string
}

const ALLOWED_INTERVENTIONS_BY_QUEUE: Record<
  ActionCenterGovernanceQueueCode,
  readonly ActionCenterGovernanceInterventionType[]
> = {
  needs_owner_or_assignment_issue: ['mark_hr_review_required', 'request_manager_update', 'suppress_false_signal'],
  missing_action_where_execution_expected: [
    'observe_only',
    'request_manager_update',
    'require_action_review',
    'mark_hr_review_required',
    'suppress_false_signal',
  ],
  action_review_due: [
    'observe_only',
    'request_manager_update',
    'send_bounded_reminder',
    'require_action_review',
    'suppress_false_signal',
  ],
  stuck_action: [
    'observe_only',
    'request_manager_update',
    'mark_hr_review_required',
    'continue_route',
    'suppress_false_signal',
  ],
  blocked_action: [
    'observe_only',
    'request_manager_update',
    'mark_hr_review_required',
    'continue_route',
    'suppress_false_signal',
  ],
  action_sprawl_risk: [
    'request_action_correction',
    'mark_hr_review_required',
    'continue_route',
    'suppress_false_signal',
  ],
  repeated_review_without_progress: [
    'request_manager_update',
    'require_action_review',
    'mark_hr_review_required',
    'continue_route',
    'suppress_false_signal',
  ],
  route_ready_for_closeout: ['observe_only', 'close_route', 'continue_route', 'suppress_false_signal'],
  route_stale_despite_actions: [
    'observe_only',
    'request_action_correction',
    'mark_hr_review_required',
    'continue_route',
    'suppress_false_signal',
  ],
  HR_review_required: ['observe_only', 'request_action_correction', 'mark_hr_review_required', 'reopen_route', 'continue_route', 'suppress_false_signal'],
}

const HR_ALLOWED_ROLES = new Set<ActionCenterGovernanceActorRole>([
  'verisight_admin',
  'verisight',
  'hr_owner',
  'hr_member',
  'hr',
])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

export function isActionCenterGovernanceInterventionType(
  value: string | null | undefined,
): value is ActionCenterGovernanceInterventionType {
  return ACTION_CENTER_GOVERNANCE_INTERVENTION_TYPES.includes(
    value as ActionCenterGovernanceInterventionType,
  )
}

export function validateActionCenterGovernanceIntervention(
  input: Omit<ActionCenterGovernanceInterventionInput, 'routeId' | 'routeSourceId' | 'routeScopeValue' | 'orgId'>,
) {
  const reasonCode = normalizeText(input.reasonCode)

  if (input.interventionType === 'suppress_false_signal' && !reasonCode) {
    throw new Error('Suppression requires a reason code.')
  }

  if (!HR_ALLOWED_ROLES.has(input.actorRole)) {
    return { allowed: false as const, reason: 'Only HR or Loep governance roles may intervene.' }
  }

  if (!isActionCenterGovernanceInterventionType(input.interventionType)) {
    return { allowed: false as const, reason: 'Intervention is outside bounded governance.' }
  }

  const allowedTypes = ALLOWED_INTERVENTIONS_BY_QUEUE[input.queueCode]
  if (!allowedTypes.includes(input.interventionType)) {
    return { allowed: false as const, reason: 'Intervention is not allowed for this governance signal.' }
  }

  return { allowed: true as const, reason: null }
}

export function buildActionCenterGovernanceInterventionRecord(
  input: ActionCenterGovernanceInterventionInput,
): ActionCenterGovernanceInterventionRecord {
  const routeId = normalizeText(input.routeId)
  const routeSourceId = normalizeText(input.routeSourceId)
  const routeScopeValue = normalizeText(input.routeScopeValue)
  const orgId = normalizeText(input.orgId)
  const actorUserId = normalizeText(input.actorUserId)
  const actionId = normalizeText(input.actionId)
  const reasonCode = normalizeText(input.reasonCode)

  if (!routeId || !routeSourceId || !routeScopeValue || !orgId || !actorUserId) {
    throw new Error('Governance intervention identity is incomplete.')
  }

  if (routeId !== buildActionCenterRouteId(routeSourceId, routeScopeValue)) {
    throw new Error('Governance intervention route identity must stay canonical.')
  }

  const validation = validateActionCenterGovernanceIntervention({
    queueCode: input.queueCode,
    interventionType: input.interventionType,
    actorRole: input.actorRole,
    actorUserId,
    actionId,
    reasonCode,
  })

  if (!validation.allowed || !isActionCenterGovernanceInterventionType(input.interventionType)) {
    throw new Error(validation.reason ?? 'Governance intervention is not allowed.')
  }

  return {
    route_id: routeId,
    action_id: actionId,
    route_source_id: routeSourceId,
    route_scope_value: routeScopeValue,
    org_id: orgId,
    queue_code: input.queueCode,
    intervention_type: input.interventionType,
    reason_code: reasonCode,
    actor_role: input.actorRole,
    actor_user_id: actorUserId,
    created_at: new Date().toISOString(),
  }
}
