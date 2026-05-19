export const ACTION_CENTER_APPROVED_ROUTE_FAMILIES = ['exit', 'retention'] as const

export type ActionCenterApprovedRouteFamily = (typeof ACTION_CENTER_APPROVED_ROUTE_FAMILIES)[number]

export const ACTION_CENTER_CANONICAL_ROUTE_STATES = [
  'open',
  'scheduled',
  'overdue',
  'stale',
  'escalation_sensitive',
  'closed',
  'reopened',
] as const

export type ActionCenterCanonicalRouteState = (typeof ACTION_CENTER_CANONICAL_ROUTE_STATES)[number]

export const ACTION_CENTER_CANONICAL_REVIEW_STATES = [
  'scheduled',
  'completed',
  'missed',
  'cancelled',
  'rescheduled',
] as const

export type ActionCenterCanonicalReviewState = (typeof ACTION_CENTER_CANONICAL_REVIEW_STATES)[number]

export const ACTION_CENTER_ACTOR_TYPES = [
  'hr_rhythm_owner',
  'manager_participant',
  'system_channel',
] as const

export type ActionCenterActor = (typeof ACTION_CENTER_ACTOR_TYPES)[number]

export type ActionCenterConstitutionObject = 'follow_through_route' | 'review_moment'

export type ActionCenterConstitutionState =
  | ActionCenterCanonicalRouteState
  | ActionCenterCanonicalReviewState

export type ActionCenterTransitionRule = {
  readonly object: ActionCenterConstitutionObject
  readonly fromState: ActionCenterConstitutionState
  readonly toState: ActionCenterConstitutionState
  actors: readonly ActionCenterActor[]
}

function freezeActionCenterTransitionRule(rule: ActionCenterTransitionRule): Readonly<ActionCenterTransitionRule> {
  return Object.freeze({
    ...rule,
    actors: Object.freeze([...rule.actors]),
  })
}

export const ACTION_CENTER_TRANSITION_RULES: readonly Readonly<ActionCenterTransitionRule>[] = Object.freeze([
  freezeActionCenterTransitionRule({
    object: 'follow_through_route',
    fromState: 'open',
    toState: 'closed',
    actors: ['hr_rhythm_owner'],
  }),
  freezeActionCenterTransitionRule({
    object: 'follow_through_route',
    fromState: 'closed',
    toState: 'reopened',
    actors: ['hr_rhythm_owner'],
  }),
  freezeActionCenterTransitionRule({
    object: 'review_moment',
    fromState: 'scheduled',
    toState: 'rescheduled',
    actors: ['hr_rhythm_owner'],
  }),
])

export type ActionCenterApprovedRouteDefault = Readonly<{
  scanType: ActionCenterApprovedRouteFamily
  cadenceDays: number
  reminderLeadDays: number
  escalationLeadDays: number
  reviewWindowDays: Readonly<{
    min: number
    max: number
  }>
  staleAfterDays: number
}>

function freezeActionCenterApprovedRouteDefault(
  routeDefault: ActionCenterApprovedRouteDefault,
): ActionCenterApprovedRouteDefault {
  return Object.freeze({
    ...routeDefault,
    reviewWindowDays: Object.freeze({ ...routeDefault.reviewWindowDays }),
  })
}

const ACTION_CENTER_APPROVED_ROUTE_DEFAULTS: Record<ActionCenterApprovedRouteFamily, ActionCenterApprovedRouteDefault> =
  {
  exit: freezeActionCenterApprovedRouteDefault({
    scanType: 'exit',
    cadenceDays: 14,
    reminderLeadDays: 3,
    escalationLeadDays: 7,
    reviewWindowDays: { min: 60, max: 90 },
    staleAfterDays: 90,
  }),
  retention: freezeActionCenterApprovedRouteDefault({
    scanType: 'retention',
    cadenceDays: 14,
    reminderLeadDays: 3,
    escalationLeadDays: 7,
    reviewWindowDays: { min: 45, max: 90 },
    staleAfterDays: 90,
  }),
  }

export function getActionCenterApprovedRouteDefault(
  scanType: string | null | undefined,
): ActionCenterApprovedRouteDefault | null {
  if (scanType !== 'exit' && scanType !== 'retention') {
    return null
  }

  return freezeActionCenterApprovedRouteDefault(ACTION_CENTER_APPROVED_ROUTE_DEFAULTS[scanType])
}

export function isActionCenterCanonicalRouteStateTransitionAllowed(args: {
  actor: ActionCenterActor
  object: ActionCenterConstitutionObject
  fromState: ActionCenterConstitutionState
  toState: ActionCenterConstitutionState
}): boolean {
  return ACTION_CENTER_TRANSITION_RULES.some(
    (rule) =>
      rule.object === args.object &&
      rule.fromState === args.fromState &&
      rule.toState === args.toState &&
      rule.actors.includes(args.actor),
  )
}
