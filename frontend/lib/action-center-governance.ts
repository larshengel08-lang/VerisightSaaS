import {
  ACTION_CENTER_CANONICAL_REVIEW_STATES,
  ACTION_CENTER_CANONICAL_ROUTE_STATES,
  isActionCenterCanonicalRouteStateTransitionAllowed,
  type ActionCenterActor,
  type ActionCenterCanonicalReviewState,
  type ActionCenterCanonicalRouteState,
  type ActionCenterConstitutionObject,
  type ActionCenterConstitutionState,
} from '@/lib/action-center-constitution'
import {
  getActionCenterEnabledRouteDefaults,
  getActionCenterRouteFamilyLabel,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import type {
  ActionCenterWorkspaceMember,
  SuiteAccessContext,
  SuiteOrgMembership,
} from '@/lib/suite-access'

export type ActionCenterGovernanceActorRole =
  | 'verisight_admin'
  | 'verisight'
  | 'hr_owner'
  | 'hr_member'
  | 'hr'
  | 'manager'

export type ActionCenterGovernanceWriteRole = 'verisight_admin' | 'hr_owner' | 'hr_member'
export type ActionCenterGovernanceSignalCode =
  | 'missing_action_where_execution_is_expected'
  | 'action_sprawl_risk'
  | 'missing_action_review'
  | 'stuck_action'
  | 'repeated_review_without_progress'
  | 'route_ready_for_closeout'

export interface ActionCenterGovernanceSignal {
  code: ActionCenterGovernanceSignalCode
  label: string
  detail: string
}

export interface ActionCenterRouteGovernanceSignals {
  routeId: string
  scopeLabel: string
  sourceLabel: string
  reviewDateLabel: string
  signals: ActionCenterGovernanceSignal[]
}

const NO_PROGRESS_ACTION_OUTCOMES = new Set(['bijsturen-nodig', 'nog-te-vroeg'])

const ACTION_CENTER_GOVERNANCE_ROLE_SET = new Set<ActionCenterGovernanceActorRole>([
  'verisight_admin',
  'verisight',
  'hr_owner',
  'hr_member',
  'hr',
  'manager',
])

export function isActionCenterGovernanceActorRole(
  value: string | null | undefined,
): value is ActionCenterGovernanceActorRole {
  return Boolean(value && ACTION_CENTER_GOVERNANCE_ROLE_SET.has(value as ActionCenterGovernanceActorRole))
}

export function getActionCenterGovernanceActorRoleLabel(role: ActionCenterGovernanceActorRole) {
  switch (role) {
    case 'verisight_admin':
      return 'Loep admin'
    case 'verisight':
      return 'Loep'
    case 'hr_owner':
      return 'HR owner'
    case 'hr_member':
      return 'HR member'
    case 'hr':
      return 'HR'
    case 'manager':
      return 'Manager'
  }
}

export function resolveActionCenterHrWriteAccess(args: {
  context: Pick<SuiteAccessContext, 'isVerisightAdmin'>
  orgMemberships: SuiteOrgMembership[]
  workspaceMemberships: ActionCenterWorkspaceMember[]
  orgId: string
}):
  | {
      allowed: true
      auditRole: ActionCenterGovernanceWriteRole
    }
  | {
      allowed: false
      auditRole: null
    } {
  if (args.context.isVerisightAdmin) {
    return {
      allowed: true,
      auditRole: 'verisight_admin' as const,
    }
  }

  const orgMembership = args.orgMemberships.find((membership) => membership.org_id === args.orgId) ?? null
  if (orgMembership?.role === 'owner') {
    return {
      allowed: true,
      auditRole: 'hr_owner' as const,
    }
  }

  const hrWorkspaceMembership =
    args.workspaceMemberships.find(
      (membership) =>
        membership.org_id === args.orgId &&
        (membership.access_role === 'hr_owner' || membership.access_role === 'hr_member') &&
        membership.can_update,
    ) ?? null

  if (hrWorkspaceMembership) {
    const auditRole =
      hrWorkspaceMembership.access_role === 'hr_owner' ? ('hr_owner' as const) : ('hr_member' as const)

    return {
      allowed: true,
      auditRole,
    }
  }

  return {
    allowed: false,
    auditRole: null,
  }
}

export function getActionCenterGovernanceSignalLabel(code: ActionCenterGovernanceSignalCode) {
  switch (code) {
    case 'missing_action_where_execution_is_expected':
      return 'Actie ontbreekt'
    case 'action_sprawl_risk':
      return 'Acties spreiden uit'
    case 'missing_action_review':
      return 'Actiereview ontbreekt'
    case 'stuck_action':
      return 'Actie blijft hangen'
    case 'repeated_review_without_progress':
      return 'Herhaalde review zonder voortgang'
    case 'route_ready_for_closeout':
      return 'Klaar voor closeout'
  }
}

function normalizeDateString(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getCalendarDayDiffFromDate(value: string | null | undefined, now: Date) {
  const normalized = normalizeDateString(value)
  if (!normalized) {
    return null
  }

  const withTime = /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T00:00:00.000Z` : normalized
  const parsed = new Date(withTime)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const parsedDay = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  return Math.round((nowDay - parsedDay) / 86_400_000)
}

function getStuckThresholdDays(value: number | { min: number; max: number } | undefined) {
  if (typeof value === 'number') {
    return value
  }

  return value?.max ?? null
}

function isActiveRouteStatus(status: ActionCenterPreviewItem['status']) {
  return status === 'in-uitvoering' || status === 'reviewbaar'
}

function isActiveRouteAction(
  action: ActionCenterPreviewItem['coreSemantics']['routeActionCards'][number],
) {
  return action.status === 'open' || action.status === 'in_review'
}

function isNoProgressActionOutcome(value: string | null | undefined) {
  return Boolean(value && NO_PROGRESS_ACTION_OUTCOMES.has(value))
}

function getActionLastEvidenceAgeDays(args: {
  action: ActionCenterPreviewItem['coreSemantics']['routeActionCards'][number]
  now: Date
}) {
  if (args.action.latestReview && isNoProgressActionOutcome(args.action.latestReview.actionOutcome)) {
    return getCalendarDayDiffFromDate(args.action.latestReview.reviewedAt, args.now)
  }

  if (!args.action.latestReview) {
    return getCalendarDayDiffFromDate(args.action.reviewScheduledFor, args.now)
  }

  return null
}

function buildGovernanceSignalDetail(args: {
  code: ActionCenterGovernanceSignalCode
  activeActionCount: number
  actionThreshold: number | null
  dayThreshold: number | null
  signalCount: number
}) {
  switch (args.code) {
    case 'missing_action_where_execution_is_expected':
      return 'De route draait al in uitvoering, maar er staat nog geen expliciete bounded actiekaart in dezelfde route.'
    case 'action_sprawl_risk':
      return `Deze route heeft ${args.activeActionCount} actieve acties terwijl de routegrens op ${args.actionThreshold ?? 0} ligt.`
    case 'missing_action_review':
      return 'Actieve acties lopen al voorbij de reviewgrens zonder vastgelegde actiereview.'
    case 'stuck_action':
      return `Actieve acties lopen langer door dan de route-default van ${args.dayThreshold ?? 0} dagen zonder nieuw reviewbewijs.`
    case 'repeated_review_without_progress':
      return `${args.signalCount} actieve acties blijven hangen op no-progress reviewuitkomsten en overschrijden daarmee de waarschuwinggrens van ${args.actionThreshold ?? 0}.`
    case 'route_ready_for_closeout':
      return 'Alle bounded acties zijn afgerond of bewust gestopt en de route kan bestuurlijk worden afgesloten.'
  }
}

export function deriveActionCenterRouteGovernanceSignals(args: {
  item: ActionCenterPreviewItem
  scanType: ActionCenterRouteDefaultsKnownScanType | string | null | undefined
  now: Date
}): ActionCenterRouteGovernanceSignals | null {
  const routeDefaults = getActionCenterEnabledRouteDefaults(args.scanType)
  if (!routeDefaults) {
    return null
  }

  const routeStatus = args.item.status
  if (routeStatus === 'afgerond' || routeStatus === 'gestopt') {
    return null
  }

  const routeActionCards = args.item.coreSemantics?.routeActionCards ?? []
  const activeRouteActions = routeActionCards.filter((action) => isActiveRouteAction(action))
  const activeActionCount = activeRouteActions.length
  const totalActionCount = routeActionCards.length
  const routeReadyForCloseout = Boolean(args.item.coreSemantics?.routeCloseout?.readyForCloseout)
  const stuckThresholdDays = getStuckThresholdDays(routeDefaults.stuckActiveWarningDays)
  const missingActionReviewCount = activeRouteActions.filter((action) => {
    if (action.latestReview !== null) {
      return false
    }

    const overdueDays = getCalendarDayDiffFromDate(action.reviewScheduledFor, args.now)
    return overdueDays !== null && overdueDays > routeDefaults.reviewDueGraceDays
  }).length
  const stuckActionCount = activeRouteActions.filter((action) => {
    if (stuckThresholdDays === null) {
      return false
    }

    const lastEvidenceAgeDays = getActionLastEvidenceAgeDays({ action, now: args.now })
    return lastEvidenceAgeDays !== null && lastEvidenceAgeDays >= stuckThresholdDays
  }).length
  const repeatedNoProgressCount = activeRouteActions.filter(
    (action) => action.latestReview !== null && isNoProgressActionOutcome(action.latestReview.actionOutcome),
  ).length
  const signals: ActionCenterGovernanceSignal[] = []

  if (isActiveRouteStatus(routeStatus) && activeActionCount === 0 && !routeReadyForCloseout) {
    signals.push({
      code: 'missing_action_where_execution_is_expected',
      label: getActionCenterGovernanceSignalLabel('missing_action_where_execution_is_expected'),
      detail: buildGovernanceSignalDetail({
        code: 'missing_action_where_execution_is_expected',
        activeActionCount,
        actionThreshold: null,
        dayThreshold: null,
        signalCount: 0,
      }),
    })
  }

  if (
    typeof routeDefaults.sprawlRiskCount === 'number' &&
    activeActionCount > routeDefaults.sprawlRiskCount
  ) {
    signals.push({
      code: 'action_sprawl_risk',
      label: getActionCenterGovernanceSignalLabel('action_sprawl_risk'),
      detail: buildGovernanceSignalDetail({
        code: 'action_sprawl_risk',
        activeActionCount,
        actionThreshold: routeDefaults.sprawlRiskCount,
        dayThreshold: null,
        signalCount: 0,
      }),
    })
  }

  if (missingActionReviewCount > 0 && !routeReadyForCloseout) {
    signals.push({
      code: 'missing_action_review',
      label: getActionCenterGovernanceSignalLabel('missing_action_review'),
      detail: buildGovernanceSignalDetail({
        code: 'missing_action_review',
        activeActionCount,
        actionThreshold: null,
        dayThreshold: routeDefaults.reviewDueGraceDays,
        signalCount: missingActionReviewCount,
      }),
    })
  }

  if (stuckActionCount > 0 && !routeReadyForCloseout) {
    signals.push({
      code: 'stuck_action',
      label: getActionCenterGovernanceSignalLabel('stuck_action'),
      detail: buildGovernanceSignalDetail({
        code: 'stuck_action',
        activeActionCount,
        actionThreshold: null,
        dayThreshold: stuckThresholdDays,
        signalCount: stuckActionCount,
      }),
    })
  }

  if (
    activeActionCount > 0 &&
    !routeReadyForCloseout &&
    repeatedNoProgressCount > routeDefaults.repeatedReviewWarningCount
  ) {
    signals.push({
      code: 'repeated_review_without_progress',
      label: getActionCenterGovernanceSignalLabel('repeated_review_without_progress'),
      detail: buildGovernanceSignalDetail({
        code: 'repeated_review_without_progress',
        activeActionCount,
        actionThreshold: routeDefaults.repeatedReviewWarningCount,
        dayThreshold: null,
        signalCount: repeatedNoProgressCount,
      }),
    })
  }

  if (routeReadyForCloseout) {
    signals.push({
      code: 'route_ready_for_closeout',
      label: getActionCenterGovernanceSignalLabel('route_ready_for_closeout'),
      detail: buildGovernanceSignalDetail({
        code: 'route_ready_for_closeout',
        activeActionCount,
        actionThreshold: null,
        dayThreshold: null,
        signalCount: 0,
      }),
    })
  }

  if (signals.length === 0) {
    return null
  }

  return {
    routeId: args.item.coreSemantics.route.routeId,
    scopeLabel: args.item.teamLabel,
    sourceLabel: getActionCenterRouteFamilyLabel(args.scanType) ?? args.item.sourceLabel,
    reviewDateLabel: args.item.reviewDateLabel,
    signals,
  }
}

type ActionCenterGovernanceTransitionObject =
  | ActionCenterConstitutionObject
  | 'owner_assignment'

function isActionCenterCanonicalStateForObject(args: {
  object: ActionCenterConstitutionObject
  state: string
}): args is
  | { object: 'follow_through_route'; state: ActionCenterCanonicalRouteState }
  | { object: 'review_moment'; state: ActionCenterCanonicalReviewState } {
  if (args.object === 'follow_through_route') {
    return ACTION_CENTER_CANONICAL_ROUTE_STATES.includes(args.state as ActionCenterCanonicalRouteState)
  }

  return ACTION_CENTER_CANONICAL_REVIEW_STATES.includes(args.state as ActionCenterCanonicalReviewState)
}

function getActionCenterTransitionActor(
  actorRole: ActionCenterGovernanceActorRole,
): ActionCenterActor {
  switch (actorRole) {
    case 'manager':
      return 'manager_participant'
    case 'verisight_admin':
    case 'hr_owner':
    case 'hr_member':
      return 'hr_rhythm_owner'
    case 'verisight':
    case 'hr':
      return 'system_channel'
  }
}

export function resolveActionCenterTransitionAccess(args: {
  actorRole: ActionCenterGovernanceActorRole
  object: ActionCenterGovernanceTransitionObject
  fromState: string
  toState: string
}): { allowed: boolean } {
  if (
    args.object === 'owner_assignment' ||
    !isActionCenterCanonicalStateForObject({ object: args.object, state: args.fromState }) ||
    !isActionCenterCanonicalStateForObject({ object: args.object, state: args.toState })
  ) {
    return { allowed: false }
  }

  return {
    allowed: isActionCenterCanonicalRouteStateTransitionAllowed({
      actor: getActionCenterTransitionActor(args.actorRole),
      object: args.object,
      fromState: args.fromState as ActionCenterConstitutionState,
      toState: args.toState as ActionCenterConstitutionState,
    }),
  }
}

export function resolveActionCenterReviewRhythmWriteAccess(args: {
  context: Pick<SuiteAccessContext, 'isVerisightAdmin'>
  orgMemberships: SuiteOrgMembership[]
  workspaceMemberships: ActionCenterWorkspaceMember[]
  orgId: string
  routeScopeValue: string
}):
  | {
      allowed: true
      auditRole: ActionCenterGovernanceWriteRole
    }
  | {
      allowed: false
      auditRole: null
    } {
  if (args.context.isVerisightAdmin) {
    return {
      allowed: true,
      auditRole: 'verisight_admin',
    }
  }

  const orgMembership = args.orgMemberships.find((membership) => membership.org_id === args.orgId) ?? null
  if (orgMembership?.role === 'owner') {
    return {
      allowed: true,
      auditRole: 'hr_owner',
    }
  }

  const hrWorkspaceMembership =
    args.workspaceMemberships.find(
      (membership) =>
        membership.org_id === args.orgId &&
        (membership.access_role === 'hr_owner' || membership.access_role === 'hr_member') &&
        membership.can_view &&
        membership.can_update &&
        membership.can_schedule_review &&
        (membership.scope_type === 'org' || membership.scope_value === args.routeScopeValue),
    ) ?? null

  if (hrWorkspaceMembership) {
    return {
      allowed: true,
      auditRole: hrWorkspaceMembership.access_role === 'hr_owner' ? 'hr_owner' : 'hr_member',
    }
  }

  return {
    allowed: false,
    auditRole: null,
  }
}
