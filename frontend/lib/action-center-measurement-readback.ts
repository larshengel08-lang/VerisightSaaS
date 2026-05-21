import {
  buildActionCenterMetricCatalog,
  type ActionCenterMetricVisibility,
} from '@/lib/action-center-bounded-execution-metrics'
import type {
  ActionCenterGovernanceQueue,
  ActionCenterGovernanceQueueCode,
} from '@/lib/action-center-governance-queues'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import {
  getActionCenterEnabledRouteDefaults,
  getActionCenterRouteFamilyLabel,
  getActionCenterScanTypeFromSourceLabel,
  type ActionCenterRouteDefaultsEnabledScanType,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'

export type ActionCenterReadbackVisibility =
  | 'internal_only'
  | 'hr_operating_readback'
  | 'buyer_safe_reporting'

export interface ActionCenterMeasurementReadbackInput {
  items: ActionCenterPreviewItem[]
  governanceQueue: ActionCenterGovernanceQueue
  routeScanTypeByRouteId?: Record<string, ActionCenterRouteDefaultsKnownScanType>
  now?: Date
}

export interface ActionCenterMetricInterpretationItem {
  metricName: string
  interpretation: string
  doesNotProve: string
  visibility: ActionCenterMetricVisibility
}

export interface ActionCenterMeasurementReadback {
  layers: {
    routeLevel: {
      routesOpen: number
      routesBlocked: number
      routesReadyForCloseout: number
      routesStale: number
      routesOverdue: number
    }
    actionLevel: {
      activeActionCount: number
      completedActionCount: number
      stoppedActionCount: number
      blockedActionCount: number
      invalidOrHrReviewDraftCount: number
    }
    reviewLevel: {
      reviewDueCount: number
      reviewsCompletedCount: number
      repeatedNoProgressReviewCount: number
    }
    governanceSignalLevel: {
      queueCount: number
      highSeverityCount: number
      blockedActionCount: number
      actionSprawlRiskCount: number
      hrReviewRequiredCount: number
      repeatedReviewWithoutProgressCount: number
      suppressedSignalCount: number
    }
    routeFamilyLevel: Record<
      ActionCenterRouteDefaultsEnabledScanType,
      {
        label: string
        routeCount: number
        routeIntent: string
        actionFocus: string
        defaultReviewWindowDays: { min: number; max: number } | null
        evidenceExpectation: string
        closeoutQuestion: string
        continuationLogic: string
        confidenceFraming: string
        whatNotToClaim: string
      }
    >
  }
  buyerSafeVocabulary: string[]
  metricInterpretationGuide: ActionCenterMetricInterpretationItem[]
}

const ACTION_CENTER_BUYER_SAFE_VOCABULARY = Object.freeze([
  'follow-through reviewed',
  'action completed',
  'action stopped',
  'route still open',
  'route ready for closeout',
  'continuation needed',
  'review overdue',
  'operating rhythm stalled',
  'bounded execution active',
])

const GOVERNANCE_SIGNAL_KEYS = Object.freeze([
  'needs_owner_or_assignment_issue',
  'missing_action_where_execution_expected',
  'action_review_due',
  'stuck_action',
  'blocked_action',
  'action_sprawl_risk',
  'repeated_review_without_progress',
  'route_ready_for_closeout',
  'route_stale_despite_actions',
  'HR_review_required',
] satisfies readonly ActionCenterGovernanceQueueCode[])

function resolveRouteFamily(args: {
  item: ActionCenterPreviewItem
  routeScanTypeByRouteId?: Record<string, ActionCenterRouteDefaultsKnownScanType>
}) {
  return (
    args.routeScanTypeByRouteId?.[args.item.coreSemantics.route.routeId] ??
    getActionCenterScanTypeFromSourceLabel(args.item.sourceLabel)
  )
}

function isOpenRoute(status: ActionCenterPreviewItem['status']) {
  return status !== 'afgerond' && status !== 'gestopt'
}

function getActionCards(item: ActionCenterPreviewItem) {
  return item.coreSemantics.routeActionCards ?? []
}

function getQueueSignalCount(
  queue: ActionCenterGovernanceQueue,
  signalCode: ActionCenterGovernanceQueueCode,
) {
  return queue.items.filter(
    (item) => item.primarySignal === signalCode || item.secondarySignals.includes(signalCode),
  ).length
}

function getRouteFamilyTemplate(routeFamily: ActionCenterRouteDefaultsEnabledScanType) {
  if (routeFamily === 'exit') {
    return {
      label: getActionCenterRouteFamilyLabel('exit') ?? 'ExitScan',
      routeIntent: 'retrospective departure/work-friction follow-through',
      actionFocus: 'verify and act on the selected departure pattern / work-friction route',
      evidenceExpectation: 'bounded review evidence from management observation, team conversation, HR check, or operational indicator',
      closeoutQuestion:
        'what was chosen, what was executed, and what returns in the next exit batch or management conversations?',
      continuationLogic:
        'continue if departure pattern remains active, action evidence is weak, or route signal needs further monitoring',
      confidenceFraming: 'use bounded confidence only; do not present preventability proof',
      whatNotToClaim: 'do not claim causality or preventability proof',
    }
  }

  return {
    label: getActionCenterRouteFamilyLabel('retention') ?? 'RetentieScan',
    routeIntent: 'active retention-pressure follow-through',
    actionFocus: 'verify and act on selected retention pressure / work-factor route',
    evidenceExpectation:
      'bounded review evidence tied to retention signal, stay-intent, departure intention, HR check, or operational indicator',
    closeoutQuestion:
      'what was verified, what first intervention or follow-up started, and what should be watched in retention signal / stay-intent / departure intention?',
      continuationLogic:
        'continue if retention pressure persists, review evidence is weak, or follow-up measurement is planned',
      confidenceFraming:
        'keep uncertainty explicit around retention signal, stay-intent, and departure intention without moving into prediction',
      whatNotToClaim: 'do not claim individual risk prediction or broad engagement-diagnosis certainty',
    }
  }

function buildRouteLevelReadback(items: ActionCenterPreviewItem[], queue: ActionCenterGovernanceQueue) {
  const openRoutes = items.filter((item) => isOpenRoute(item.status))

  return {
    routesOpen: openRoutes.length,
    routesBlocked: items.filter((item) => item.status === 'geblokkeerd').length,
    routesReadyForCloseout:
      getQueueSignalCount(queue, 'route_ready_for_closeout') ||
      items.filter((item) => item.coreSemantics.routeCloseout?.readyForCloseout === true).length,
    routesStale: getQueueSignalCount(queue, 'route_stale_despite_actions'),
    routesOverdue: getQueueSignalCount(queue, 'action_review_due'),
  }
}

function buildActionLevelReadback(items: ActionCenterPreviewItem[], queue: ActionCenterGovernanceQueue) {
  const actionCards = items.flatMap(getActionCards)

  return {
    activeActionCount: actionCards.filter(
      (action) => action.status === 'open' || action.status === 'in_review',
    ).length,
    completedActionCount: actionCards.filter((action) => action.status === 'afgerond').length,
    stoppedActionCount: actionCards.filter((action) => action.status === 'gestopt').length,
    blockedActionCount: getQueueSignalCount(queue, 'blocked_action'),
    invalidOrHrReviewDraftCount: actionCards.filter((action) => {
      const draftLikeAction = action as {
        semanticState?: string | null
        validationDisposition?: string | null
      }

      return (
        draftLikeAction.semanticState === 'draft' &&
        (draftLikeAction.validationDisposition === 'invalid' ||
          draftLikeAction.validationDisposition === 'needs_hr_review')
      )
    }).length,
  }
}

function buildReviewLevelReadback(items: ActionCenterPreviewItem[], queue: ActionCenterGovernanceQueue) {
  const actionCards = items.flatMap(getActionCards)

  return {
    reviewDueCount: getQueueSignalCount(queue, 'action_review_due'),
    reviewsCompletedCount: actionCards.filter((action) => action.latestReview !== null).length,
    repeatedNoProgressReviewCount:
      getQueueSignalCount(queue, 'repeated_review_without_progress'),
  }
}

function buildGovernanceSignalReadback(queue: ActionCenterGovernanceQueue) {
  return {
    queueCount: queue.items.length,
    highSeverityCount: queue.items.filter((item) => item.severity === 'high').length,
    blockedActionCount: getQueueSignalCount(queue, 'blocked_action'),
    actionSprawlRiskCount: getQueueSignalCount(queue, 'action_sprawl_risk'),
    hrReviewRequiredCount: getQueueSignalCount(queue, 'HR_review_required'),
    repeatedReviewWithoutProgressCount: getQueueSignalCount(
      queue,
      'repeated_review_without_progress',
    ),
    suppressedSignalCount: queue.suppressedItems.length,
  }
}

function buildRouteFamilyReadback(args: {
  items: ActionCenterPreviewItem[]
  routeScanTypeByRouteId?: Record<string, ActionCenterRouteDefaultsKnownScanType>
}) {
  const counts = args.items.reduce<Record<ActionCenterRouteDefaultsEnabledScanType, number>>(
    (acc, item) => {
      const routeFamily = resolveRouteFamily({
        item,
        routeScanTypeByRouteId: args.routeScanTypeByRouteId,
      })
      const defaults = getActionCenterEnabledRouteDefaults(routeFamily)
      if (defaults) {
        acc[defaults.scanType] += 1
      }
      return acc
    },
    {
      exit: 0,
      retention: 0,
    },
  )

  return {
    exit: {
      ...getRouteFamilyTemplate('exit'),
      routeCount: counts.exit,
      defaultReviewWindowDays:
        getActionCenterEnabledRouteDefaults('exit')?.reviewWindowDays ?? null,
    },
    retention: {
      ...getRouteFamilyTemplate('retention'),
      routeCount: counts.retention,
      defaultReviewWindowDays:
        getActionCenterEnabledRouteDefaults('retention')?.reviewWindowDays ?? null,
    },
  }
}

function buildMetricInterpretationGuide() {
  const metricCatalog = buildActionCenterMetricCatalog()

  return Object.entries(metricCatalog).map(([metricName, definition]) => ({
    metricName,
    interpretation: definition.interpretation,
    doesNotProve: definition.doesNotProve,
    visibility: definition.visibility,
  }))
}

export function buildActionCenterMeasurementReadback(
  input: ActionCenterMeasurementReadbackInput,
): ActionCenterMeasurementReadback {
  return {
    layers: {
      routeLevel: buildRouteLevelReadback(input.items, input.governanceQueue),
      actionLevel: buildActionLevelReadback(input.items, input.governanceQueue),
      reviewLevel: buildReviewLevelReadback(input.items, input.governanceQueue),
      governanceSignalLevel: buildGovernanceSignalReadback(input.governanceQueue),
      routeFamilyLevel: buildRouteFamilyReadback({
        items: input.items,
        routeScanTypeByRouteId: input.routeScanTypeByRouteId,
      }),
    },
    buyerSafeVocabulary: [...ACTION_CENTER_BUYER_SAFE_VOCABULARY],
    metricInterpretationGuide: buildMetricInterpretationGuide(),
  }
}

export function getActionCenterBuyerSafeVocabulary() {
  return [...ACTION_CENTER_BUYER_SAFE_VOCABULARY]
}

export function getActionCenterGovernanceSignalCatalog() {
  return [...GOVERNANCE_SIGNAL_KEYS]
}
