import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  deriveActionCenterRouteGovernanceSignals,
  type ActionCenterGovernanceSignalCode,
} from '@/lib/action-center-governance'
import {
  getActionCenterEnabledRouteDefaults,
  getActionCenterRouteFamilyLabel,
  getActionCenterScanTypeFromSourceLabel,
  type ActionCenterRouteDefaultsEnabledScanType,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'

export type ActionCenterGovernanceQueueCode =
  | 'needs_owner_or_assignment_issue'
  | 'missing_action_where_execution_expected'
  | 'action_review_due'
  | 'stuck_action'
  | 'blocked_action'
  | 'action_sprawl_risk'
  | 'repeated_review_without_progress'
  | 'route_ready_for_closeout'
  | 'route_stale_despite_actions'
  | 'HR_review_required'

export interface ActionCenterSuppressedGovernanceSignal {
  routeId: string
  signalCode: ActionCenterGovernanceQueueCode
  reasonCode: string
}

export interface ActionCenterSuppressedGovernanceQueueItem
  extends ActionCenterSuppressedGovernanceSignal {
  scopeLabel: string
  routeFamily: ActionCenterRouteDefaultsEnabledScanType
}

export interface ActionCenterGovernanceQueueItem {
  routeId: string
  routeFamily: ActionCenterRouteDefaultsEnabledScanType
  sourceLabel: string
  scopeLabel: string
  managerOwner: string | null
  primarySignal: ActionCenterGovernanceQueueCode
  secondarySignals: ActionCenterGovernanceQueueCode[]
  severity: 'high' | 'medium'
  whyInQueue: string
  expectedHrAction: string
  recommendation: string
  timeInQueueDays: number
}

export interface ActionCenterGovernanceQueue {
  items: ActionCenterGovernanceQueueItem[]
  suppressedItems: ActionCenterSuppressedGovernanceQueueItem[]
}

const GOVERNANCE_SIGNAL_TO_QUEUE_CODE: Record<
  ActionCenterGovernanceSignalCode,
  Exclude<
    ActionCenterGovernanceQueueCode,
    'needs_owner_or_assignment_issue' | 'blocked_action' | 'route_stale_despite_actions' | 'HR_review_required'
  >
> = {
  missing_action_where_execution_is_expected: 'missing_action_where_execution_expected',
  action_sprawl_risk: 'action_sprawl_risk',
  missing_action_review: 'action_review_due',
  stuck_action: 'stuck_action',
  repeated_review_without_progress: 'repeated_review_without_progress',
  route_ready_for_closeout: 'route_ready_for_closeout',
}

const SIGNAL_PRIORITY: Record<ActionCenterGovernanceQueueCode, number> = {
  HR_review_required: 0,
  blocked_action: 1,
  repeated_review_without_progress: 2,
  action_sprawl_risk: 3,
  stuck_action: 4,
  route_stale_despite_actions: 5,
  action_review_due: 6,
  needs_owner_or_assignment_issue: 7,
  missing_action_where_execution_expected: 8,
  route_ready_for_closeout: 9,
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getCalendarDayDiff(dateValue: string | null | undefined, now: Date) {
  const normalized = normalizeText(dateValue)
  if (!normalized) return 0

  const withTime = /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T00:00:00.000Z` : normalized
  const parsed = new Date(withTime)
  if (Number.isNaN(parsed.getTime())) return 0

  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const parsedDay = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  return Math.max(0, Math.round((nowDay - parsedDay) / 86_400_000))
}

function getActiveActionCount(item: ActionCenterPreviewItem) {
  return (item.coreSemantics.routeActionCards ?? []).filter(
    (action) => action.status === 'open' || action.status === 'in_review',
  ).length
}

function hasBlockedAction(item: ActionCenterPreviewItem) {
  return (
    item.status === 'geblokkeerd' ||
    item.coreSemantics.route.routeStatus === 'geblokkeerd' ||
    item.coreSemantics.route.blockedBy !== null
  )
}

function shouldRequireHrReview(item: ActionCenterPreviewItem) {
  return ((item.coreSemantics.routeActionCards ?? []) as Array<{
    semanticState?: string | null
    validationDisposition?: string | null
  }>).some(
    (action) => action.semanticState === 'draft' && action.validationDisposition === 'needs_hr_review',
  )
}

function hasOwnerAssignmentIssue(item: ActionCenterPreviewItem) {
  const ownerName = normalizeText(item.ownerName)
  return !ownerName || ownerName === 'Nog niet toegewezen'
}

function shouldFlagRouteStaleDespiteActions(args: {
  item: ActionCenterPreviewItem
  now: Date
  scanType: ActionCenterRouteDefaultsEnabledScanType
}) {
  const defaults = getActionCenterEnabledRouteDefaults(args.scanType)
  if (!defaults || typeof defaults.staleAfterDays !== 'number') return false

  const activeActionCount = getActiveActionCount(args.item)
  if (activeActionCount === 0) return false

  return getCalendarDayDiff(args.item.reviewDate, args.now) >= defaults.staleAfterDays
}

function getRecommendation(signalCode: ActionCenterGovernanceQueueCode) {
  switch (signalCode) {
    case 'HR_review_required':
      return 'HR review needed'
    case 'blocked_action':
      return 'Blocked action check'
    case 'repeated_review_without_progress':
      return 'Repeated no progress'
    case 'action_sprawl_risk':
      return 'Action sprawl risk'
    case 'stuck_action':
      return 'HR review needed'
    case 'route_stale_despite_actions':
      return 'Continuation likely'
    case 'action_review_due':
      return 'Review overdue'
    case 'needs_owner_or_assignment_issue':
      return 'HR review needed'
    case 'missing_action_where_execution_expected':
      return 'HR review needed'
    case 'route_ready_for_closeout':
      return 'Closeout likely'
  }
}

function getExpectedHrAction(signalCode: ActionCenterGovernanceQueueCode) {
  switch (signalCode) {
    case 'HR_review_required':
      return 'HR review this route and decide whether correction or continuation is needed.'
    case 'blocked_action':
      return 'HR review the blockage and decide whether manager clarification or continuation check is needed.'
    case 'repeated_review_without_progress':
      return 'Ask the manager for an update or require a fresh action review.'
    case 'action_sprawl_risk':
      return 'Ask for action correction so the route returns to bounded execution.'
    case 'stuck_action':
      return 'Request a manager update and assess whether HR review is needed.'
    case 'route_stale_despite_actions':
      return 'Check whether the route should continue, be corrected, or be escalated for HR review.'
    case 'action_review_due':
      return 'Prompt the manager to complete the bounded action review.'
    case 'needs_owner_or_assignment_issue':
      return 'Correct the accountable owner before execution continues.'
    case 'missing_action_where_execution_expected':
      return 'Request a bounded action or confirm why execution is intentionally not active yet.'
    case 'route_ready_for_closeout':
      return 'Confirm closeout readiness and decide whether the route should close or continue.'
  }
}

function getWhyInQueue(args: {
  signalCode: ActionCenterGovernanceQueueCode
  routeFamily: ActionCenterRouteDefaultsEnabledScanType
  item: ActionCenterPreviewItem
  now: Date
}) {
  const reviewAgeDays = getCalendarDayDiff(args.item.reviewDate, args.now)

  switch (args.signalCode) {
    case 'HR_review_required':
      return 'Deze route bevat een bounded actie die eerst expliciete HR-beoordeling vraagt.'
    case 'blocked_action':
      return 'Er staat nu een blokkering op deze route, waardoor verdere bounded uitvoering niet rustig kan doorlopen.'
    case 'repeated_review_without_progress':
      return 'Meerdere reviews bleven hangen op no-progress uitkomsten, waardoor HR nu moet meekijken.'
    case 'action_sprawl_risk':
      return `Deze route heeft ${getActiveActionCount(args.item)} actieve acties en loopt daarmee voorbij de gezonde bounded grens.`
    case 'stuck_action':
      return `Actieve bounded uitvoering blijft al ${reviewAgeDays} dagen zonder nieuw bruikbaar reviewbewijs hangen.`
    case 'route_stale_despite_actions':
      return 'De route is stale geworden terwijl er nog bounded acties aanwezig zijn.'
    case 'action_review_due':
      return 'De afgesproken bounded actiereview is verstreken zonder vastgelegde review.'
    case 'needs_owner_or_assignment_issue':
      return 'De route mist een bruikbare accountable owner en kan daardoor niet rustig worden bestuurd.'
    case 'missing_action_where_execution_expected':
      return 'De route vraagt uitvoering, maar er staat nog geen geldige bounded actie op de route.'
    case 'route_ready_for_closeout':
      return 'Alle bounded signalen wijzen erop dat deze route bestuurlijk klaar is voor closeout.'
  }
}

function getSignalSeverity(signalCode: ActionCenterGovernanceQueueCode): 'high' | 'medium' {
  return SIGNAL_PRIORITY[signalCode] <= SIGNAL_PRIORITY.route_stale_despite_actions ? 'high' : 'medium'
}

function getSignalTimeInQueueDays(args: {
  signalCode: ActionCenterGovernanceQueueCode
  item: ActionCenterPreviewItem
  now: Date
}) {
  switch (args.signalCode) {
    case 'route_ready_for_closeout':
      return getCalendarDayDiff(args.item.coreSemantics.routeCloseout.closedAt, args.now)
    case 'blocked_action':
    case 'action_review_due':
    case 'route_stale_despite_actions':
    case 'repeated_review_without_progress':
    case 'stuck_action':
      return getCalendarDayDiff(args.item.reviewDate, args.now)
    default:
      return getCalendarDayDiff(args.item.coreSemantics.route.routeOpenedAt, args.now)
  }
}

function getScanType(args: {
  item: ActionCenterPreviewItem
  routeScanTypeByRouteId?: Record<string, ActionCenterRouteDefaultsKnownScanType>
}) {
  return (
    args.routeScanTypeByRouteId?.[args.item.coreSemantics.route.routeId] ??
    getActionCenterScanTypeFromSourceLabel(args.item.sourceLabel)
  )
}

function deriveRawSignalCodes(args: {
  item: ActionCenterPreviewItem
  routeFamily: ActionCenterRouteDefaultsEnabledScanType
  now: Date
}) {
  const queueCodes = new Set<ActionCenterGovernanceQueueCode>()
  const derivedGovernance = deriveActionCenterRouteGovernanceSignals({
    item: args.item,
    scanType: args.routeFamily,
    now: args.now,
  })

  for (const signal of derivedGovernance?.signals ?? []) {
    queueCodes.add(GOVERNANCE_SIGNAL_TO_QUEUE_CODE[signal.code])
  }

  if (hasOwnerAssignmentIssue(args.item)) {
    queueCodes.add('needs_owner_or_assignment_issue')
  }

  if (hasBlockedAction(args.item)) {
    queueCodes.add('blocked_action')
  }

  if (shouldRequireHrReview(args.item)) {
    queueCodes.add('HR_review_required')
  }

  if (
    shouldFlagRouteStaleDespiteActions({
      item: args.item,
      now: args.now,
      scanType: args.routeFamily,
    })
  ) {
    queueCodes.add('route_stale_despite_actions')
  }

  return [...queueCodes]
}

function sortSignalCodes(signalCodes: ActionCenterGovernanceQueueCode[]) {
  return signalCodes.slice().sort((left, right) => SIGNAL_PRIORITY[left] - SIGNAL_PRIORITY[right])
}

function buildQueueItem(args: {
  item: ActionCenterPreviewItem
  routeFamily: ActionCenterRouteDefaultsEnabledScanType
  signalCodes: ActionCenterGovernanceQueueCode[]
  now: Date
}) {
  const sortedSignalCodes = sortSignalCodes(args.signalCodes)
  const [primarySignal, ...secondarySignals] = sortedSignalCodes
  if (!primarySignal) {
    return null
  }

  return {
    routeId: args.item.coreSemantics.route.routeId,
    routeFamily: args.routeFamily,
    sourceLabel: getActionCenterRouteFamilyLabel(args.routeFamily) ?? args.item.sourceLabel,
    scopeLabel: args.item.teamLabel,
    managerOwner: normalizeText(args.item.ownerName),
    primarySignal,
    secondarySignals,
    severity: getSignalSeverity(primarySignal),
    whyInQueue: getWhyInQueue({
      signalCode: primarySignal,
      routeFamily: args.routeFamily,
      item: args.item,
      now: args.now,
    }),
    expectedHrAction: getExpectedHrAction(primarySignal),
    recommendation: getRecommendation(primarySignal),
    timeInQueueDays: getSignalTimeInQueueDays({
      signalCode: primarySignal,
      item: args.item,
      now: args.now,
    }),
  } satisfies ActionCenterGovernanceQueueItem
}

function isSuppressed(
  routeId: string,
  signalCode: ActionCenterGovernanceQueueCode,
  suppressedSignals: ActionCenterSuppressedGovernanceSignal[],
) {
  return suppressedSignals.some(
    (suppressedSignal) =>
      suppressedSignal.routeId === routeId && suppressedSignal.signalCode === signalCode,
  )
}

function sortGovernanceQueueItems(items: ActionCenterGovernanceQueueItem[]) {
  return items.slice().sort((left, right) => {
    const priorityDiff = SIGNAL_PRIORITY[left.primarySignal] - SIGNAL_PRIORITY[right.primarySignal]
    if (priorityDiff !== 0) return priorityDiff

    const timeDiff = right.timeInQueueDays - left.timeInQueueDays
    if (timeDiff !== 0) return timeDiff

    return left.scopeLabel.localeCompare(right.scopeLabel)
  })
}

export function buildActionCenterGovernanceQueue(args: {
  items: ActionCenterPreviewItem[]
  now: Date
  routeScanTypeByRouteId?: Record<string, ActionCenterRouteDefaultsKnownScanType>
  suppressedSignals?: ActionCenterSuppressedGovernanceSignal[]
}): ActionCenterGovernanceQueue {
  const suppressedSignals = args.suppressedSignals ?? []
  const items: ActionCenterGovernanceQueueItem[] = []
  const suppressedItems: ActionCenterSuppressedGovernanceQueueItem[] = []

  for (const item of args.items) {
    const scanType = getScanType({
      item,
      routeScanTypeByRouteId: args.routeScanTypeByRouteId,
    })
    const routeDefaults = getActionCenterEnabledRouteDefaults(scanType)
    if (!routeDefaults) {
      continue
    }

    const rawSignalCodes = deriveRawSignalCodes({
      item,
      routeFamily: routeDefaults.scanType,
      now: args.now,
    })
    if (rawSignalCodes.length === 0) {
      continue
    }

    const visibleSignalCodes = rawSignalCodes.filter(
      (signalCode) => !isSuppressed(item.coreSemantics.route.routeId, signalCode, suppressedSignals),
    )
    const routeSuppressedSignals = rawSignalCodes.filter((signalCode) =>
      isSuppressed(item.coreSemantics.route.routeId, signalCode, suppressedSignals),
    )

    for (const signalCode of routeSuppressedSignals) {
      const suppressedSignal = suppressedSignals.find(
        (candidate) =>
          candidate.routeId === item.coreSemantics.route.routeId && candidate.signalCode === signalCode,
      )
      if (!suppressedSignal) continue

      suppressedItems.push({
        routeId: suppressedSignal.routeId,
        signalCode: suppressedSignal.signalCode,
        reasonCode: suppressedSignal.reasonCode,
        scopeLabel: item.teamLabel,
        routeFamily: routeDefaults.scanType,
      })
    }

    const queueItem = buildQueueItem({
      item,
      routeFamily: routeDefaults.scanType,
      signalCodes: visibleSignalCodes,
      now: args.now,
    })

    if (queueItem) {
      items.push(queueItem)
    }
  }

  return {
    items: sortGovernanceQueueItems(items),
    suppressedItems,
  }
}
