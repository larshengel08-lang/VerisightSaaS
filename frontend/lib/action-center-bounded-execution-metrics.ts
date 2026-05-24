import {
  ACTION_CENTER_ACTOR_TYPES,
  ACTION_CENTER_APPROVED_ROUTE_FAMILIES,
  type ActionCenterActor,
  type ActionCenterApprovedRouteFamily,
} from './action-center-constitution'

export const ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES = [
  'route_opened',
  'route_became_execution_expected',
  'action_draft_created',
  'action_draft_validated',
  'action_draft_rejected',
  'action_draft_sent_to_hr_review',
  'action_state_changed',
  'action_review_opened',
  'action_review_completed',
  'hr_chase_event',
] as const

export type ActionCenterBoundedExecutionEventType =
  (typeof ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES)[number]

export const ACTION_CENTER_BOUNDED_EXECUTION_OBJECT_ANCHORS = [
  'follow_through_route',
  'action_card',
] as const

export type ActionCenterBoundedExecutionObjectAnchor =
  (typeof ACTION_CENTER_BOUNDED_EXECUTION_OBJECT_ANCHORS)[number]

export type ActionCenterBoundedExecutionMetadata = Record<string, never>

export type ActionCenterMetricObjectAnchor =
  | 'route'
  | 'action'
  | 'review'
  | 'governance_signal'
  | 'action_attempt'

export type ActionCenterMetricVisibility =
  | 'internal_only'
  | 'hr_operating_readback'
  | 'buyer_safe_reporting'

export interface ActionCenterMetricDefinition {
  formula: string
  eventSource: string
  objectAnchor: ActionCenterMetricObjectAnchor
  visibility: ActionCenterMetricVisibility
  interpretation: string
  doesNotProve: string
}

interface ActionCenterBoundedExecutionEventDefinition {
  eventType: ActionCenterBoundedExecutionEventType
  objectAnchor: ActionCenterBoundedExecutionObjectAnchor
  actorRoles: readonly ActionCenterActor[]
  requiresActionId: boolean
}

export interface ActionCenterBoundedExecutionEventRecord {
  org_id: string
  route_id: string
  route_scope_value: string
  route_source_id: string
  route_family: ActionCenterApprovedRouteFamily
  action_id: string | null
  object_anchor: ActionCenterBoundedExecutionObjectAnchor
  event_type: ActionCenterBoundedExecutionEventType
  actor_role: ActionCenterActor
  actor_user_id: string | null
  metadata: ActionCenterBoundedExecutionMetadata
  occurred_at: string
}

interface BuildActionCenterBoundedExecutionEventInput {
  orgId: string
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  routeFamily: ActionCenterApprovedRouteFamily
  actorRole: ActionCenterActor
  actorUserId?: string | null
  actionId?: string | null
  metadata?: ActionCenterBoundedExecutionMetadata | null
  occurredAt?: string | null
}

const ACTION_CENTER_METRIC_CATALOG = Object.freeze({
  route_to_action_conversion_rate: {
    formula: 'routes_with_at_least_one_valid_action / routes_where_execution_is_expected',
    eventSource: 'route_opened + action_draft_validated',
    objectAnchor: 'route',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows how often expected execution becomes an explicit bounded action.',
    doesNotProve: 'Does not prove that the chosen follow-through was the right response.',
  },
  time_to_first_action: {
    formula: 'median(valid_action_created_at - route_execution_expected_at)',
    eventSource: 'route_became_execution_expected + action_draft_validated',
    objectAnchor: 'route',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows how quickly execution starts once a route explicitly needs follow-through.',
    doesNotProve: 'Does not prove urgency quality or outcome impact.',
  },
  actions_per_route_distribution: {
    formula: 'distribution(valid_actions_per_active_route)',
    eventSource: 'action_draft_validated + action_state_changed',
    objectAnchor: 'route',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows whether execution stays sparse, healthy, or starts to sprawl per route.',
    doesNotProve: 'Does not prove appropriate action quality by itself.',
  },
  action_review_completion_rate: {
    formula: 'actions_reviewed_within_due_window / actions_with_review_due',
    eventSource: 'action_review_opened + action_review_completed',
    objectAnchor: 'review',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how reliably bounded review rhythm is actually being completed.',
    doesNotProve: 'Does not prove that the chosen action created the later change being observed.',
  },
  action_completion_rate: {
    formula: 'actions_moved_to_completed / valid_actions_created',
    eventSource: 'action_state_changed',
    objectAnchor: 'action',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often bounded actions reach a completed state.',
    doesNotProve: 'Does not prove route resolution or that later change came from this action alone.',
  },
  action_stop_rate: {
    formula: 'actions_moved_to_stopped / valid_actions_created',
    eventSource: 'action_state_changed',
    objectAnchor: 'action',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows how often actions are intentionally stopped instead of continuing or completing.',
    doesNotProve: 'Does not prove failure, success, or bad management by itself.',
  },
  time_from_action_creation_to_first_review: {
    formula: 'median(first_review_at - valid_action_created_at)',
    eventSource: 'action_draft_validated + action_review_completed',
    objectAnchor: 'action',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows how quickly actions move from creation into reflective review.',
    doesNotProve: 'Does not prove execution quality or effect size.',
  },
  route_stale_rate_with_actions_present: {
    formula: 'stale_routes_with_actions / routes_with_at_least_one_action',
    eventSource: 'action_state_changed + route_readback_snapshot',
    objectAnchor: 'route',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often routes become stale even while actions are present.',
    doesNotProve: 'Does not prove that actions caused staleness or that intervention failed.',
  },
  hr_chasing_reduction_proxy_on_action_routes: {
    formula: '1 - (hr_follow_up_events / comparable_action_route_baseline)',
    eventSource: 'hr_chase_event',
    objectAnchor: 'route',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows whether repeated HR chasing burden appears to be decreasing on action routes.',
    doesNotProve: 'Does not prove productivity gain or adoption proof.',
  },
  action_sprawl_rate: {
    formula: 'routes_with_action_sprawl_signal / active_routes_with_actions',
    eventSource: 'governance_queue_snapshot',
    objectAnchor: 'governance_signal',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often bounded execution grows beyond the healthy action limit.',
    doesNotProve: 'Does not prove route complexity or manager quality.',
  },
  action_quality_rejection_rate: {
    formula: 'invalid_or_hr_review_action_attempts / action_creation_attempts',
    eventSource: 'action_draft_rejected + action_draft_sent_to_hr_review',
    objectAnchor: 'action_attempt',
    visibility: 'hr_operating_readback',
    interpretation: 'Shows how often action quality guidance still rejects or escalates new action attempts.',
    doesNotProve: 'Does not prove manager ability or HR effectiveness.',
  },
  repeated_review_without_progress_rate: {
    formula: 'routes_with_repeated_no_progress_signal / routes_with_reviewed_actions',
    eventSource: 'action_review_completed + governance_queue_snapshot',
    objectAnchor: 'governance_signal',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often repeated reviews still fail to move execution forward.',
    doesNotProve: 'Does not prove true lack of impact or route failure.',
  },
  blocked_action_rate: {
    formula: 'actions_with_blocker_signal / active_actions',
    eventSource: 'governance_queue_snapshot',
    objectAnchor: 'action',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often execution is blocked inside active bounded actions.',
    doesNotProve: 'Does not prove root cause or organizational risk level.',
  },
  route_ready_for_closeout_rate: {
    formula: 'routes_marked_closeout_ready / open_routes',
    eventSource: 'governance_queue_snapshot + route_closeout_projection',
    objectAnchor: 'route',
    visibility: 'buyer_safe_reporting',
    interpretation: 'Shows how often routes are nearing bounded closure.',
    doesNotProve: 'Does not prove route success or that the underlying issue is fully resolved.',
  },
} satisfies Record<string, ActionCenterMetricDefinition>)

const BOUNDED_EXECUTION_EVENT_DEFINITIONS: readonly ActionCenterBoundedExecutionEventDefinition[] =
  Object.freeze([
    {
      eventType: 'route_opened',
      objectAnchor: 'follow_through_route',
      actorRoles: ['system_channel', 'hr_rhythm_owner'],
      requiresActionId: false,
    },
    {
      eventType: 'route_became_execution_expected',
      objectAnchor: 'follow_through_route',
      actorRoles: ['system_channel'],
      requiresActionId: false,
    },
    {
      eventType: 'action_draft_created',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'action_draft_validated',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'action_draft_rejected',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'action_draft_sent_to_hr_review',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'action_state_changed',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner', 'system_channel'],
      requiresActionId: true,
    },
    {
      eventType: 'action_review_opened',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'action_review_completed',
      objectAnchor: 'action_card',
      actorRoles: ['manager_participant', 'hr_rhythm_owner'],
      requiresActionId: true,
    },
    {
      eventType: 'hr_chase_event',
      objectAnchor: 'follow_through_route',
      actorRoles: ['hr_rhythm_owner'],
      requiresActionId: false,
    },
  ])

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function isPlainMetadataObject(
  value: ActionCenterBoundedExecutionMetadata | null | undefined,
): value is ActionCenterBoundedExecutionMetadata {
  return Boolean(value) && !Array.isArray(value)
}

function isEmptyMetadataObject(value: ActionCenterBoundedExecutionMetadata | null | undefined) {
  return isPlainMetadataObject(value) && Object.keys(value).length === 0
}

function getBoundedExecutionEventDefinition(eventType: ActionCenterBoundedExecutionEventType) {
  return (
    BOUNDED_EXECUTION_EVENT_DEFINITIONS.find((definition) => definition.eventType === eventType) ??
    null
  )
}

export function resolveActionCenterBoundedExecutionRouteFamily(
  value: string | null | undefined,
): ActionCenterApprovedRouteFamily | null {
  return ACTION_CENTER_APPROVED_ROUTE_FAMILIES.includes(value as ActionCenterApprovedRouteFamily)
    ? (value as ActionCenterApprovedRouteFamily)
    : null
}

export function buildActionCenterBoundedExecutionEvent(
  eventType: ActionCenterBoundedExecutionEventType,
  input: BuildActionCenterBoundedExecutionEventInput,
): ActionCenterBoundedExecutionEventRecord {
  const definition = getBoundedExecutionEventDefinition(eventType)
  const orgId = normalizeText(input.orgId)
  const routeId = normalizeText(input.routeId)
  const routeScopeValue = normalizeText(input.routeScopeValue)
  const routeSourceId = normalizeText(input.routeSourceId)
  const actionId = normalizeText(input.actionId)
  const actorUserId = normalizeText(input.actorUserId)
  const routeFamily = resolveActionCenterBoundedExecutionRouteFamily(input.routeFamily)
  const occurredAt = normalizeText(input.occurredAt) ?? new Date().toISOString()
  const metadata = input.metadata ?? {}

  if (!definition) {
    throw new Error(`Unsupported bounded execution event type: ${eventType}`)
  }

  if (!orgId || !routeId || !routeScopeValue || !routeSourceId || !routeFamily) {
    throw new Error('Bounded execution event identity is incomplete.')
  }

  if (!ACTION_CENTER_ACTOR_TYPES.includes(input.actorRole)) {
    throw new Error('Bounded execution event actor role is invalid.')
  }

  if (!definition.actorRoles.includes(input.actorRole)) {
    throw new Error('Bounded execution event actor role is not allowed for this event.')
  }

  if (routeId !== `${routeSourceId}::${routeScopeValue}`) {
    throw new Error('Bounded execution event route identity must stay canonical.')
  }

  if (definition.requiresActionId && !actionId) {
    throw new Error('Bounded execution action-card events require an action id.')
  }

  if (input.actorRole === 'system_channel' && actorUserId) {
    throw new Error('System-channel bounded execution events may not carry an actor user id.')
  }

  if (input.actorRole !== 'system_channel' && !actorUserId) {
    throw new Error('Human bounded execution events require an actor user id.')
  }

  if (!isEmptyMetadataObject(metadata)) {
    throw new Error('Bounded execution event metadata must stay an empty object.')
  }

  return {
    org_id: orgId,
    route_id: routeId,
    route_scope_value: routeScopeValue,
    route_source_id: routeSourceId,
    route_family: routeFamily,
    action_id: definition.requiresActionId ? (actionId ?? null) : null,
    object_anchor: definition.objectAnchor,
    event_type: eventType,
    actor_role: input.actorRole,
    actor_user_id: actorUserId,
    metadata: {},
    occurred_at: occurredAt,
  }
}

export function buildActionCenterMetricCatalog() {
  return ACTION_CENTER_METRIC_CATALOG
}
