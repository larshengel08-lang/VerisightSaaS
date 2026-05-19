import type { ActionCenterActor } from './action-center-constitution'
import { ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE } from './action-center-entry'
import { ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE } from './action-center-follow-through-mail'
import { ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE } from './action-center-review-reschedule'

export const ACTION_CENTER_ADOPTION_EVENT_SOURCES = [
  ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE,
  ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
  'manager_quick_action',
  'review_transition',
  ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE,
  'route_state_derivation',
  'route_closeout',
  'route_reopen',
  'hr_manual_chase',
] as const

export type ActionCenterAdoptionEventSource =
  (typeof ACTION_CENTER_ADOPTION_EVENT_SOURCES)[number]

export const ACTION_CENTER_ADOPTION_OBJECT_ANCHORS = [
  'follow_through_route',
  'review_moment',
  'closeout_continuation_record',
] as const

export type ActionCenterAdoptionObjectAnchor =
  (typeof ACTION_CENTER_ADOPTION_OBJECT_ANCHORS)[number]

export const ACTION_CENTER_ADOPTION_EVENT_NAMES = [
  'manager_trigger_delivered',
  'manager_contextual_entry_opened',
  'manager_quick_action_completed',
  'review_completed',
  'review_rescheduled',
  'route_became_stale',
  'route_became_overdue',
  'route_became_escalation_sensitive',
  'route_closed',
  'route_reopened',
  'hr_manual_chase_logged',
] as const

export type ActionCenterAdoptionEventName =
  (typeof ACTION_CENTER_ADOPTION_EVENT_NAMES)[number]

export interface ActionCenterAdoptionEventDefinition {
  name: ActionCenterAdoptionEventName
  eventSource: ActionCenterAdoptionEventSource
  objectAnchor: ActionCenterAdoptionObjectAnchor
  actorRoles: readonly ActionCenterActor[]
  requiresReviewItemId: boolean
  metadataPolicy: 'empty_object_only'
  readinessOnly: true
  provesAdoption: false
  description: string
}

export const ACTION_CENTER_ADOPTION_EVENT_DEFINITIONS = [
  {
    name: 'manager_trigger_delivered',
    eventSource: ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE,
    objectAnchor: 'follow_through_route',
    actorRoles: ['system_channel'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Manager-facing follow-through trigger delivered through the bounded notification layer.',
  },
  {
    name: 'manager_contextual_entry_opened',
    eventSource: ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
    objectAnchor: 'follow_through_route',
    actorRoles: ['manager_participant'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Manager opened Action Center through a bounded contextual entry point.',
  },
  {
    name: 'manager_quick_action_completed',
    eventSource: 'manager_quick_action',
    objectAnchor: 'review_moment',
    actorRoles: ['manager_participant'],
    requiresReviewItemId: true,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Manager completed the one bounded quick action attached to a trigger.',
  },
  {
    name: 'review_completed',
    eventSource: 'review_transition',
    objectAnchor: 'review_moment',
    actorRoles: ['hr_rhythm_owner', 'manager_participant'],
    requiresReviewItemId: true,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Canonical review completion recorded in Action Center.',
  },
  {
    name: 'review_rescheduled',
    eventSource: ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE,
    objectAnchor: 'review_moment',
    actorRoles: ['hr_rhythm_owner'],
    requiresReviewItemId: true,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Canonical review reschedule recorded in Action Center.',
  },
  {
    name: 'route_became_stale',
    eventSource: 'route_state_derivation',
    objectAnchor: 'follow_through_route',
    actorRoles: ['system_channel'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'System-derived signal that an eligible route crossed the stale threshold.',
  },
  {
    name: 'route_became_overdue',
    eventSource: 'route_state_derivation',
    objectAnchor: 'follow_through_route',
    actorRoles: ['system_channel'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'System-derived signal that an eligible route crossed the overdue threshold.',
  },
  {
    name: 'route_became_escalation_sensitive',
    eventSource: 'route_state_derivation',
    objectAnchor: 'follow_through_route',
    actorRoles: ['system_channel'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'System-derived signal that an eligible route crossed the escalation threshold.',
  },
  {
    name: 'route_closed',
    eventSource: 'route_closeout',
    objectAnchor: 'closeout_continuation_record',
    actorRoles: ['hr_rhythm_owner'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Canonical route closeout recorded with bounded closeout semantics.',
  },
  {
    name: 'route_reopened',
    eventSource: 'route_reopen',
    objectAnchor: 'closeout_continuation_record',
    actorRoles: ['hr_rhythm_owner'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Canonical route reopen recorded with explicit reason.',
  },
  {
    name: 'hr_manual_chase_logged',
    eventSource: 'hr_manual_chase',
    objectAnchor: 'follow_through_route',
    actorRoles: ['hr_rhythm_owner'],
    requiresReviewItemId: false,
    metadataPolicy: 'empty_object_only',
    readinessOnly: true,
    provesAdoption: false,
    description: 'Bounded HR chase event recorded for later reduction proxy measurement.',
  },
] as const satisfies readonly ActionCenterAdoptionEventDefinition[]

export const ACTION_CENTER_ADOPTION_METRIC_NAMES = [
  'manager_trigger_open_rate',
  'manager_quick_action_completion_rate',
  'review_completion_rate',
  'reschedule_rate',
  'stale_route_rate',
  'overdue_route_rate',
  'escalation_sensitive_route_rate',
  'closeout_discipline_rate',
  'reopen_rate',
  'HR_chasing_reduction_proxy',
] as const

export type ActionCenterAdoptionMetricName =
  (typeof ACTION_CENTER_ADOPTION_METRIC_NAMES)[number]

export interface ActionCenterAdoptionMetricDefinition {
  name: ActionCenterAdoptionMetricName
  formula: string
  eventSource: ActionCenterAdoptionEventSource
  eventAnchors: readonly ActionCenterAdoptionEventSource[]
  objectAnchor: ActionCenterAdoptionObjectAnchor
  interpretation: string
  whatItDoesNotProve: string
  readinessOnly: true
  provesAdoption: false
}

export const ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS = [
  {
    name: 'manager_trigger_open_rate',
    formula: 'unique_manager_contextual_entry_opens / unique_manager_trigger_deliveries',
    eventSource: ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
    eventAnchors: [
      ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE,
      ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
    ],
    objectAnchor: 'follow_through_route',
    interpretation: 'Indicates whether manager-facing triggers cause first engagement with bounded follow-through.',
    whatItDoesNotProve: 'Does not prove useful follow-through, review quality, or management action quality.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'manager_quick_action_completion_rate',
    formula: 'completed_manager_quick_actions / manager_quick_action_opportunities',
    eventSource: 'manager_quick_action',
    eventAnchors: ['manager_quick_action'],
    objectAnchor: 'review_moment',
    interpretation: 'Shows whether managers complete the bounded primary action asked of them.',
    whatItDoesNotProve: 'Does not prove that the underlying decision or intervention was good.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'review_completion_rate',
    formula: 'canonically_completed_reviews / scheduled_reviews_in_measurement_window',
    eventSource: 'review_transition',
    eventAnchors: ['review_transition'],
    objectAnchor: 'review_moment',
    interpretation: 'Shows whether planned reviews are actually completed.',
    whatItDoesNotProve: 'Does not prove route closure quality or intervention success.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'reschedule_rate',
    formula: 'canonically_rescheduled_reviews / scheduled_reviews_in_measurement_window',
    eventSource: ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE,
    eventAnchors: [ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE],
    objectAnchor: 'review_moment',
    interpretation: 'Indicates how often rhythm slips and requires bounded replanning.',
    whatItDoesNotProve: 'Does not prove bad governance by itself.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'stale_route_rate',
    formula: 'routes_in_stale_state / active_eligible_follow_through_routes',
    eventSource: 'route_state_derivation',
    eventAnchors: ['route_state_derivation'],
    objectAnchor: 'follow_through_route',
    interpretation: 'Shows broken or missing review rhythm on eligible routes.',
    whatItDoesNotProve: 'Does not prove neglect in every case.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'overdue_route_rate',
    formula: 'routes_in_overdue_state / active_eligible_follow_through_routes',
    eventSource: 'route_state_derivation',
    eventAnchors: ['route_state_derivation'],
    objectAnchor: 'follow_through_route',
    interpretation: 'Shows follow-through pressure that crossed the planned review date.',
    whatItDoesNotProve: 'Does not prove failure of follow-through by itself.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'escalation_sensitive_route_rate',
    formula: 'routes_in_escalation_sensitive_state / active_eligible_follow_through_routes',
    eventSource: 'route_state_derivation',
    eventAnchors: ['route_state_derivation'],
    objectAnchor: 'follow_through_route',
    interpretation: 'Shows routes that crossed the bounded escalation threshold and need HR attention.',
    whatItDoesNotProve: 'Does not prove poor product fit by itself.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'closeout_discipline_rate',
    formula: 'canonically_closed_routes_with_required_closeout_fields / canonically_closed_routes',
    eventSource: 'route_closeout',
    eventAnchors: ['route_closeout'],
    objectAnchor: 'closeout_continuation_record',
    interpretation: 'Shows whether closure is disciplined rather than vague.',
    whatItDoesNotProve: 'Does not prove the chosen action was correct.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'reopen_rate',
    formula: 'reopened_routes / canonically_closed_routes',
    eventSource: 'route_reopen',
    eventAnchors: ['route_reopen', 'route_closeout'],
    objectAnchor: 'closeout_continuation_record',
    interpretation: 'Shows how often canonical closure did not hold.',
    whatItDoesNotProve: 'Does not prove reopen is always bad.',
    readinessOnly: true,
    provesAdoption: false,
  },
  {
    name: 'HR_chasing_reduction_proxy',
    formula:
      '1 - (HR_manual_chase_events / (routes_in_overdue_state + routes_in_stale_state + routes_in_escalation_sensitive_state))',
    eventSource: 'hr_manual_chase',
    eventAnchors: ['hr_manual_chase', 'route_state_derivation'],
    objectAnchor: 'follow_through_route',
    interpretation: 'Estimates whether the system reduces manual HR chasing pressure over time.',
    whatItDoesNotProve: 'Does not prove manager satisfaction or total operating efficiency.',
    readinessOnly: true,
    provesAdoption: false,
  },
] as const satisfies readonly ActionCenterAdoptionMetricDefinition[]

export function getActionCenterAdoptionMetricDefinition(
  name: string | null | undefined,
) {
  return ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS.find((metric) => metric.name === name) ?? null
}

export function getActionCenterAdoptionEventDefinition(
  name: string | null | undefined,
) {
  return ACTION_CENTER_ADOPTION_EVENT_DEFINITIONS.find((eventDefinition) => eventDefinition.name === name) ?? null
}
