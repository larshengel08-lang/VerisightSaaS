import {
  buildActionCenterFollowThroughMailDedupeKey,
  getActionCenterFollowThroughMailSuppressionReason,
  type ActionCenterFollowThroughMailSuppressionReason,
  type ActionCenterFollowThroughMailTriggerType,
} from '@/lib/action-center-follow-through-mail'
import type { ActionCenterFollowThroughMailRouteSnapshot } from '@/lib/action-center-follow-through-mail-data'

export interface ActionCenterFollowThroughMailPlannedJob {
  routeId: string
  orgId: string
  campaignId: string
  campaignName: string
  scopeLabel: string
  routeScopeValue: string
  triggerType: ActionCenterFollowThroughMailTriggerType
  recipientRole: 'manager' | 'hr_oversight'
  recipientEmail: string
  recipientName: string | null
  sourceMarker: string
  dedupeKey: string
  reviewScheduledFor: string | null
}

export interface ActionCenterFollowThroughMailSuppressedJob {
  routeId: string
  orgId: string
  campaignId: string
  campaignName: string
  scopeLabel: string
  routeScopeValue: string
  triggerType: ActionCenterFollowThroughMailTriggerType
  recipientRole: 'manager' | 'hr_oversight'
  recipientEmail: string | null
  recipientName: string | null
  sourceMarker: string | null
  suppressionReason: ActionCenterFollowThroughMailSuppressionReason
  reviewScheduledFor: string | null
}

function getUtcDayDiff(dateValue: string, now: Date) {
  const [year, month, day] = dateValue.split('-').map((value) => Number(value))
  if (!year || !month || !day) return null

  const targetDay = Date.UTC(year, month - 1, day)
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return Math.round((nowDay - targetDay) / 86_400_000)
}

function isResolvedRoute(snapshot: ActionCenterFollowThroughMailRouteSnapshot) {
  return (
    snapshot.routeStatus === 'afgerond' ||
    snapshot.routeStatus === 'gestopt' ||
    snapshot.reviewOutcome === 'afronden' ||
    snapshot.reviewOutcome === 'stoppen' ||
    snapshot.hasFollowUpTarget
  )
}

function pushJob(args: {
  jobs: ActionCenterFollowThroughMailPlannedJob[]
  suppressions: ActionCenterFollowThroughMailSuppressedJob[]
  existingDedupeKeys: Set<string>
  snapshot: ActionCenterFollowThroughMailRouteSnapshot
  triggerType: ActionCenterFollowThroughMailTriggerType
  recipientRole: 'manager' | 'hr_oversight'
  recipientEmail: string | null
  recipientName?: string | null
  sourceMarker: string | null
}) {
  if (!args.recipientEmail || !args.sourceMarker) return

  const suppressionReason = getActionCenterFollowThroughMailSuppressionReason({
    triggerType: args.triggerType,
    remindersEnabled: args.snapshot.remindersEnabled,
    routeStatus: args.snapshot.routeStatus,
    reviewCompletedAt: args.snapshot.reviewCompletedAt,
    reviewScheduledFor: args.snapshot.reviewScheduledFor,
    reviewOutcome: args.snapshot.reviewOutcome,
    hasFollowUpTarget: args.snapshot.hasFollowUpTarget,
  })

  if (suppressionReason) {
    args.suppressions.push({
      routeId: args.snapshot.routeId,
      orgId: args.snapshot.orgId,
      campaignId: args.snapshot.campaignId,
      campaignName: args.snapshot.campaignName,
      scopeLabel: args.snapshot.scopeLabel,
      routeScopeValue: args.snapshot.routeScopeValue,
      triggerType: args.triggerType,
      recipientRole: args.recipientRole,
      recipientEmail: args.recipientEmail,
      recipientName: args.recipientName ?? null,
      sourceMarker: args.sourceMarker,
      suppressionReason,
      reviewScheduledFor: args.snapshot.reviewScheduledFor,
    })
    return
  }

  const dedupeKey = buildActionCenterFollowThroughMailDedupeKey({
    routeId: args.snapshot.routeId,
    triggerType: args.triggerType,
    recipientEmail: args.recipientEmail,
    sourceMarker: args.sourceMarker,
  })

  if (args.existingDedupeKeys.has(dedupeKey)) return
  args.existingDedupeKeys.add(dedupeKey)

  args.jobs.push({
    routeId: args.snapshot.routeId,
    orgId: args.snapshot.orgId,
    campaignId: args.snapshot.campaignId,
    campaignName: args.snapshot.campaignName,
    scopeLabel: args.snapshot.scopeLabel,
    routeScopeValue: args.snapshot.routeScopeValue,
    triggerType: args.triggerType,
    recipientRole: args.recipientRole,
    recipientEmail: args.recipientEmail,
    recipientName: args.recipientName ?? null,
    sourceMarker: args.sourceMarker,
    dedupeKey,
    reviewScheduledFor: args.snapshot.reviewScheduledFor,
  })
}

export function planActionCenterFollowThroughMailJobs(args: {
  now: Date
  snapshots: readonly ActionCenterFollowThroughMailRouteSnapshot[]
  existingDedupeKeys: ReadonlySet<string>
}) {
  const jobs: ActionCenterFollowThroughMailPlannedJob[] = []
  const suppressions: ActionCenterFollowThroughMailSuppressedJob[] = []
  const activeDedupeKeys = new Set(args.existingDedupeKeys)

  for (const snapshot of args.snapshots) {
    if (isResolvedRoute(snapshot) && snapshot.reviewCompletedAt) {
      continue
    }

    pushJob({
      jobs,
      suppressions,
      existingDedupeKeys: activeDedupeKeys,
      snapshot,
      triggerType: 'assignment_created',
      recipientRole: 'manager',
      recipientEmail: snapshot.managerRecipient?.email ?? null,
      recipientName: snapshot.managerRecipient?.name ?? null,
      sourceMarker: snapshot.ownerAssignedAt,
    })

    if (snapshot.reviewScheduledFor) {
      const dayDiff = getUtcDayDiff(snapshot.reviewScheduledFor, args.now)
      if (dayDiff !== null) {
        const daysUntilReview = -dayDiff
        if (
          daysUntilReview >= 0 &&
          daysUntilReview <= snapshot.reminderLeadDays &&
          snapshot.remindersEnabled
        ) {
          pushJob({
            jobs,
            suppressions,
            existingDedupeKeys: activeDedupeKeys,
            snapshot,
            triggerType: 'review_upcoming',
            recipientRole: 'manager',
            recipientEmail: snapshot.managerRecipient?.email ?? null,
            recipientName: snapshot.managerRecipient?.name ?? null,
            sourceMarker: snapshot.reviewScheduledFor,
          })
        }

        if (dayDiff > 0 && !snapshot.reviewCompletedAt && !isResolvedRoute(snapshot)) {
          pushJob({
            jobs,
            suppressions,
            existingDedupeKeys: activeDedupeKeys,
            snapshot,
            triggerType: 'review_overdue',
            recipientRole: 'manager',
            recipientEmail: snapshot.managerRecipient?.email ?? null,
            recipientName: snapshot.managerRecipient?.name ?? null,
            sourceMarker: `${snapshot.reviewScheduledFor}::manager`,
          })

          if (dayDiff >= snapshot.escalationLeadDays) {
            for (const recipient of snapshot.hrOversightRecipients) {
              pushJob({
                jobs,
                suppressions,
                existingDedupeKeys: activeDedupeKeys,
                snapshot,
                triggerType: 'review_overdue',
                recipientRole: 'hr_oversight',
                recipientEmail: recipient.email,
                sourceMarker: `${snapshot.reviewScheduledFor}::hr_oversight`,
              })
            }
          }
        }
      }
    }

    if (
      snapshot.reviewCompletedAt &&
      snapshot.reviewOutcome !== 'afronden' &&
      snapshot.reviewOutcome !== 'stoppen' &&
      !snapshot.hasFollowUpTarget &&
      !isResolvedRoute(snapshot)
    ) {
      const completedAt = new Date(snapshot.reviewCompletedAt)
      if (!Number.isNaN(completedAt.getTime())) {
        const daysSinceReviewComplete = Math.floor(
          (args.now.getTime() - completedAt.getTime()) / 86_400_000,
        )

        if (daysSinceReviewComplete >= snapshot.escalationLeadDays) {
          for (const recipient of snapshot.hrOversightRecipients) {
            pushJob({
              jobs,
              suppressions,
              existingDedupeKeys: activeDedupeKeys,
              snapshot,
              triggerType: 'follow_up_open_after_review',
              recipientRole: 'hr_oversight',
              recipientEmail: recipient.email,
              sourceMarker: snapshot.reviewCompletedAt,
            })
          }
        }
      }
    }
  }

  return { jobs, suppressions }
}
