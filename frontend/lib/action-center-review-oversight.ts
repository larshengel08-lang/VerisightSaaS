import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'
import { getReviewMomentScopeLabel } from '@/lib/action-center-review-moments'
import {
  getActionCenterEnabledRouteDefaults,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'
import {
  classifyActionCenterReviewRhythmStatus,
  type ActionCenterReviewRhythmConfig,
} from '@/lib/action-center-review-rhythm'
import { isActionCenterFollowThroughMailRouteResolved } from '@/lib/action-center-follow-through-mail'
import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'

export type ActionCenterReviewOversightState =
  | 'upcoming'
  | 'overdue'
  | 'stale'
  | 'escalation-sensitive'
  | 'resolved'

export interface ActionCenterReviewOversightSummary {
  upcomingCount: number
  overdueCount: number
  staleCount: number
  escalationSensitiveCount: number
  resolvedCount: number
}

export interface ActionCenterReviewOversightAttentionItem {
  routeId: string
  state: Exclude<ActionCenterReviewOversightState, 'upcoming' | 'resolved'>
  scopeLabel: string
  sourceLabel: string
  reviewDateLabel: string
}

function getOverdueDayDiff(reviewDate: string | null, now: Date) {
  if (!reviewDate) return null

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(reviewDate)
    ? `${reviewDate}T00:00:00.000Z`
    : reviewDate
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return null

  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const reviewDay = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  return Math.round((nowDay - reviewDay) / 86_400_000)
}

export function classifyActionCenterReviewOversightState(args: {
  scanType: ActionCenterRouteDefaultsKnownScanType | string | null | undefined
  routeStatus: ActionCenterPreviewStatus
  reviewDate: string | null
  reviewCompletedAt: string | null
  reviewOutcome: ActionCenterReviewOutcome
  hasFollowUpTarget: boolean
  config: ActionCenterReviewRhythmConfig
  now: Date
}): ActionCenterReviewOversightState | null {
  const routeDefaults = getActionCenterEnabledRouteDefaults(args.scanType)
  if (!routeDefaults) {
    return null
  }

  if (
    isActionCenterFollowThroughMailRouteResolved({
      routeStatus: args.routeStatus,
      reviewOutcome: args.reviewOutcome,
      hasFollowUpTarget: args.hasFollowUpTarget,
    })
  ) {
    return 'resolved'
  }

  const health = classifyActionCenterReviewRhythmStatus({
    reviewDate: args.reviewDate,
    now: args.now,
    config: args.config,
    itemStatus: args.routeStatus,
  })

  if (health === 'completed') {
    return 'resolved'
  }

  if (health === 'stale') {
    return 'stale'
  }

  if (health === 'upcoming') {
    return 'upcoming'
  }

  const overdueDayDiff = getOverdueDayDiff(args.reviewDate, args.now)
  if (overdueDayDiff !== null && overdueDayDiff >= args.config.escalationLeadDays) {
    return 'escalation-sensitive'
  }

  return 'overdue'
}

export function buildActionCenterReviewOversightSummary(args: {
  items: ActionCenterPreviewItem[]
  configByRouteId: Record<string, ActionCenterReviewRhythmConfig>
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
  now: Date
}) {
  const summary: ActionCenterReviewOversightSummary = {
    upcomingCount: 0,
    overdueCount: 0,
    staleCount: 0,
    escalationSensitiveCount: 0,
    resolvedCount: 0,
  }
  const stateByRouteId: Record<string, ActionCenterReviewOversightState> = {}
  const attentionItems: ActionCenterReviewOversightAttentionItem[] = []

  for (const item of args.items) {
    const routeId = item.coreSemantics.route.routeId
    const scanType = args.routeScanTypeByRouteId[routeId]
    const routeDefaults = getActionCenterEnabledRouteDefaults(scanType)

    if (!routeDefaults) {
      continue
    }

    const state = classifyActionCenterReviewOversightState({
      scanType,
      routeStatus: item.status,
      reviewDate: item.reviewDate,
      reviewCompletedAt: item.coreSemantics.route.reviewCompletedAt,
      reviewOutcome: item.reviewOutcome,
      hasFollowUpTarget: item.coreSemantics.route.hasFollowUpTarget,
      config: args.configByRouteId[routeId] ?? routeDefaults,
      now: args.now,
    })

    if (!state) {
      continue
    }

    stateByRouteId[routeId] = state

    if (state === 'upcoming') summary.upcomingCount += 1
    if (state === 'overdue') summary.overdueCount += 1
    if (state === 'stale') summary.staleCount += 1
    if (state === 'escalation-sensitive') summary.escalationSensitiveCount += 1
    if (state === 'resolved') summary.resolvedCount += 1

    if (state === 'stale' || state === 'overdue' || state === 'escalation-sensitive') {
      attentionItems.push({
        routeId,
        state,
        scopeLabel: getReviewMomentScopeLabel(item),
        sourceLabel: item.sourceLabel,
        reviewDateLabel: item.reviewDateLabel,
      })
    }
  }

  attentionItems.sort((left, right) => {
    const priority = (state: ActionCenterReviewOversightAttentionItem['state']) => {
      if (state === 'escalation-sensitive') return 0
      if (state === 'stale') return 1
      return 2
    }

    const stateDiff = priority(left.state) - priority(right.state)
    if (stateDiff !== 0) return stateDiff

    return left.scopeLabel.localeCompare(right.scopeLabel)
  })

  return {
    summary,
    stateByRouteId,
    attentionItems: attentionItems.slice(0, 5),
  }
}
