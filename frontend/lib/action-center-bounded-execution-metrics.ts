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
