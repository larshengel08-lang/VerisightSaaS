import type {
  ActionCenterPreviewItem,
  ActionCenterPreviewUpdate,
  ActionCenterPreviewPriority,
  ActionCenterPreviewStatus,
} from '@/lib/action-center-preview-model'
import {
  projectActionCenterCoreSemantics,
  projectActionCenterPreviewCoreSemantics,
} from '@/lib/action-center-core-semantics'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { MemberRole, ScanType } from '@/lib/types'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord, DeliveryExceptionStatus } from '@/lib/ops-delivery'
import { getDeliveryExceptionLabel } from '@/lib/ops-delivery'
import type {
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'
import { projectActionCenterRoute } from '@/lib/action-center-route-contract'
import { buildSuiteTelemetryEvent, type SuiteTelemetryEvent } from '@/lib/telemetry/events'
import type { LiveActionCenterCampaignContext } from './action-center-live-context'

export type { LiveActionCenterCampaignContext } from './action-center-live-context'

const DUTCH_SHORT_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
})

const SUPPORTED_SCAN_TYPES = new Set<ScanType>(['exit', 'retention', 'onboarding', 'pulse', 'leadership'])

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Klant owner',
  member: 'Member',
  viewer: 'Viewer',
}

const SCAN_DEFAULTS: Record<
  ScanType,
  {
    managementQuestion: string
    fallbackStep: string
    fallbackSummary: string
    fallbackRhythm: string
  }
> = {
  exit: {
    managementQuestion: 'Welk vertrekpatroon vraagt nu als eerste een expliciet managementgesprek, eigenaar en bounded vervolg?',
    fallbackStep: 'Leg de eerste managementreactie, eigenaar en reviewdatum vast op basis van de huidige vertrekduiding.',
    fallbackSummary: 'ExitScan opent hier de follow-through laag: welke vertrekduiding telt nu, wie pakt die op en wanneer komt dit terug?',
    fallbackRhythm: 'Maandelijks',
  },
  retention: {
    managementQuestion: 'Welk behoudssignaal verdient nu als eerste een zichtbare behoudsactie en welke eigenaar trekt die follow-through?',
    fallbackStep: 'Kies de eerste behoudsactie, expliciteer de eigenaar en plan een bounded reviewmoment.',
    fallbackSummary: 'RetentieScan vertaalt hier signalen naar een eerste behoudsactie met eigenaar en reviewritme.',
    fallbackRhythm: 'Maandelijks',
  },
  onboarding: {
    managementQuestion: 'Welke vroege landingsfrictie vraagt nu als eerste een checkpoint-correctie en wie bevestigt het volgende reviewmoment?',
    fallbackStep: 'Kies de eerstvolgende checkpoint-correctie en leg vast wie de stabiele landing bewaakt.',
    fallbackSummary: 'Onboarding 30-60-90 gebruikt Action Center hier voor eigenaarschap, checkpoint-correctie en expliciete reviewmomenten.',
    fallbackRhythm: 'Tweewekelijks',
  },
  pulse: {
    managementQuestion: 'Welk reviewsignaal vraagt nu de eerste kleine correctie en wanneer hercheck je die bounded in de volgende cycle?',
    fallbackStep: 'Kies de eerste kleine correctie, benoem de eigenaar en zet meteen de hercheck klaar.',
    fallbackSummary: 'Pulse gebruikt Action Center als compacte reviewlaag: kiezen, corrigeren, en bounded opnieuw kijken.',
    fallbackRhythm: 'Tweewekelijks',
  },
  leadership: {
    managementQuestion: 'Welk leiderschapssignaal vraagt nu de eerste bounded managementactie en hoe wordt die reviewbaar opgevolgd?',
    fallbackStep: 'Leg de eerste bounded leiderschapsactie en de eerstvolgende review vast.',
    fallbackSummary: 'Leadership Scan opent hier geen breed traject, maar een bounded follow-through route met eigenaar en reviewritme.',
    fallbackRhythm: 'Maandelijks',
  },
  team: {
    managementQuestion: 'Welk teamsignaal vraagt nu een eerste lokale managementactie met duidelijke eigenaar en reviewmoment?',
    fallbackStep: 'Kies de eerste lokale teamactie en leg review en eigenaarschap expliciet vast.',
    fallbackSummary: 'TeamScan blijft hier een bounded teamfollow-through laag.',
    fallbackRhythm: 'Maandelijks',
  },
}

function formatShortDate(value: string | null) {
  if (!value) return 'Nog niet gepland'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return DUTCH_SHORT_DATE.format(parsed).replace('.', '')
}

function getPriorityFromSignals(args: {
  exceptionStatus: DeliveryExceptionStatus | null | undefined
  avgSignal: number | null
  totalCompleted: number
}): ActionCenterPreviewPriority {
  if (args.exceptionStatus && args.exceptionStatus !== 'none') {
    return 'hoog'
  }

  if (typeof args.avgSignal === 'number' && args.avgSignal >= 6.5) {
    return 'hoog'
  }

  if (args.totalCompleted > 0 && args.totalCompleted < 10) {
    return 'midden'
  }

  return typeof args.avgSignal === 'number' && args.avgSignal >= 4.5 ? 'midden' : 'laag'
}

function getRoleFallback(memberRole: MemberRole | null) {
  if (!memberRole) return 'Nog geen expliciete klantrol'
  return ROLE_LABELS[memberRole]
}

function getReviewOwnerName(checkpoints: PilotLearningCheckpoint[], deliveryRecord: CampaignDeliveryRecord | null) {
  const reviewOwner =
    checkpoints.find((checkpoint) => checkpoint.checkpoint_key === 'follow_up_review')?.owner_label?.trim() ?? null
  const managementOwner =
    checkpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use')?.owner_label?.trim() ?? null

  return reviewOwner || managementOwner || deliveryRecord?.operator_owner || null
}

function buildOpenSignals(args: {
  status: ActionCenterPreviewStatus
  routeOwner: string | null
  reviewDate: string | null
  intervention: string | null
}) {
  const signals: string[] = []
  if (!args.routeOwner) signals.push('owner_missing')
  if (!args.reviewDate && args.status !== 'afgerond' && args.status !== 'gestopt') signals.push('review_due')
  if (args.status === 'geblokkeerd') signals.push('blocked_assignment')
  if (!args.intervention && args.status !== 'afgerond' && args.status !== 'gestopt') signals.push('decision_due')
  return signals
}

function getInterventionTruth(value: string | null | undefined) {
  const normalized = value?.trim() ?? ''
  if (!normalized || normalized === 'Nog te bepalen in review') {
    return null
  }

  return normalized
}

type ActionCenterPreviewItemDraft = Omit<ActionCenterPreviewItem, 'coreSemantics' | 'openSignals'> & {
  coreSemantics?: ActionCenterPreviewItem['coreSemantics']
  openSignals?: string[]
}

function buildUpdates(args: {
  learningCheckpoints: PilotLearningCheckpoint[]
  deliveryCheckpoints: CampaignDeliveryCheckpoint[]
  learningDossier: PilotLearningDossier | null
  deliveryRecord: CampaignDeliveryRecord | null
  fallbackAuthor: string
}): ActionCenterPreviewUpdate[] {
  const learningUpdates = args.learningCheckpoints
    .map((checkpoint) => ({
      id: checkpoint.id,
      author: checkpoint.owner_label?.trim() || args.fallbackAuthor,
      updatedAt: checkpoint.updated_at,
      note:
        checkpoint.confirmed_lesson ||
        checkpoint.interpreted_observation ||
        checkpoint.qualitative_notes ||
        checkpoint.objective_signal_notes ||
        `${checkpoint.checkpoint_key.replace(/_/g, ' ')} bijgewerkt.`,
    }))
    .filter((update) => Boolean(update.note))

  const deliveryUpdates = args.deliveryCheckpoints
    .map((checkpoint) => ({
      id: checkpoint.id,
      author: args.fallbackAuthor,
      updatedAt: checkpoint.updated_at,
      note: checkpoint.operator_note || checkpoint.last_auto_summary || `${checkpoint.checkpoint_key.replace(/_/g, ' ')} bijgewerkt.`,
    }))
    .filter((update) => Boolean(update.note))

  const combined = [...learningUpdates, ...deliveryUpdates]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3)
    .map((update) => ({
      id: update.id,
      author: update.author,
      dateLabel: formatShortDate(update.updatedAt),
      note: update.note,
    }))

  if (combined.length > 0) {
    return combined
  }

  const fallbackNote =
    args.learningDossier?.case_public_summary ||
    args.learningDossier?.adoption_outcome ||
    args.learningDossier?.expected_first_value ||
    args.deliveryRecord?.customer_handoff_note ||
    'Nog geen expliciete review-update uit campaign of dossierbron.'

  return [
    {
      id: `fallback-${args.deliveryRecord?.id ?? args.learningDossier?.id ?? 'action-center'}`,
      author: args.fallbackAuthor,
      dateLabel: formatShortDate(args.learningDossier?.updated_at ?? args.deliveryRecord?.updated_at ?? new Date().toISOString()),
      note: fallbackNote,
    },
  ]
}

function getFallbackStep(scanType: ScanType, lifecycleStage: string | null | undefined) {
  const defaults = SCAN_DEFAULTS[scanType]
  if (!lifecycleStage) return defaults.fallbackStep

  if (lifecycleStage === 'client_activation_pending') {
    return 'Bevestig eerst het vrijgavemoment en leg vast welke eerste managementread daarna zichtbaar moet worden.'
  }
  if (lifecycleStage === 'first_value_reached') {
    return 'Kies nu wie de eerste managementread trekt en welke bounded vervolgstap daarna direct volgt.'
  }
  if (lifecycleStage === 'first_management_use') {
    return 'Leg de eerste managementactie, eigenaar en vervolgreview nu expliciet vast.'
  }
  if (lifecycleStage === 'follow_up_decided') {
    return 'Bevestig of de gekozen follow-through nu doorgaat, bounded verdiept of bewust sluit.'
  }

  return defaults.fallbackStep
}

function getSignalBody(scanType: ScanType, deliveryRecord: CampaignDeliveryRecord | null, latestUpdate: string | null) {
  if (latestUpdate) return latestUpdate

  const defaults = SCAN_DEFAULTS[scanType]
  if (deliveryRecord?.exception_status && deliveryRecord.exception_status !== 'none') {
    return `${getDeliveryExceptionLabel(deliveryRecord.exception_status)} vraagt nu een expliciete bounded herstelstap binnen dezelfde productlijn.`
  }
  if (deliveryRecord?.customer_handoff_note) return deliveryRecord.customer_handoff_note
  return defaults.fallbackSummary
}

function getSortRank(status: ActionCenterPreviewStatus) {
  switch (status) {
    case 'geblokkeerd':
      return 0
    case 'te-bespreken':
      return 1
    case 'in-uitvoering':
      return 2
    case 'afgerond':
      return 3
    case 'gestopt':
    default:
      return 4
  }
}

export function finalizeActionCenterPreviewItem(
  item: ActionCenterPreviewItemDraft,
  options: { recomputeCoreSemantics?: boolean } = {},
): ActionCenterPreviewItem {
  const latestVisibleUpdateNote = item.updates[0]?.note ?? null
  const existingRoute = item.coreSemantics?.route ?? null
  const reuseExistingRouteTruth = Boolean(existingRoute)
  const coreSemantics =
    !options.recomputeCoreSemantics && item.coreSemantics
      ? item.coreSemantics
      :
    projectActionCenterPreviewCoreSemantics({
      id: item.id,
      title: item.title,
      status: item.status,
      ownerName: item.ownerName,
      reviewDate: item.reviewDate,
      expectedEffect: reuseExistingRouteTruth ? (existingRoute?.expectedEffect ?? null) : item.expectedEffect,
      reviewReason: reuseExistingRouteTruth ? (existingRoute?.reviewReason ?? null) : item.reviewReason,
      reviewOutcome: item.reviewOutcome,
      reason: item.reason,
      summary: item.summary,
      signalBody: item.signalBody,
      nextStep: reuseExistingRouteTruth ? (existingRoute?.intervention ?? null) : item.nextStep,
      latestVisibleUpdateNote,
      route: existingRoute,
    })

  const reviewReason = coreSemantics.reviewSemantics.reviewReason
  const nextStep = coreSemantics.actionFrame.firstStep
  const expectedEffect = coreSemantics.actionFrame.expectedEffect
  const signalBody = coreSemantics.resultLoop.whatWeObserved ?? item.signalBody

  return {
    ...item,
    reason: reviewReason,
    nextStep,
    expectedEffect,
    reviewReason: item.reviewReason ?? coreSemantics.route.reviewReason ?? reviewReason,
    signalBody,
    coreSemantics,
    openSignals: buildOpenSignals({
      status: item.status,
      routeOwner: item.ownerName,
      reviewDate: item.reviewDate,
      intervention: getInterventionTruth(coreSemantics.route.intervention ?? item.nextStep),
    }),
  }
}

export function isLiveActionCenterScanType(scanType: ScanType) {
  return SUPPORTED_SCAN_TYPES.has(scanType)
}

export function buildLiveActionCenterItems(contexts: LiveActionCenterCampaignContext[]): ActionCenterPreviewItem[] {
  return contexts
    .filter((context) => isLiveActionCenterScanType(context.campaign.scan_type))
    .flatMap((context, index) => {
      const route = projectActionCenterRoute(context)
      if (route.entryStage !== 'active' || !route.routeStatus) {
        return []
      }

      const definition = getScanDefinition(context.campaign.scan_type)
      const defaults = SCAN_DEFAULTS[context.campaign.scan_type]
      const avgSignal = context.stats?.avg_signal_score ?? context.stats?.avg_risk_score ?? null
      const fallbackAuthor = context.organizationName || 'Verisight'
      const reviewDate = route.reviewScheduledFor
      const reviewOwnerName = getReviewOwnerName(context.learningCheckpoints, context.deliveryRecord)
      const status = route.routeStatus
      const updates = buildUpdates({
        learningCheckpoints: context.learningCheckpoints,
        deliveryCheckpoints: context.deliveryCheckpoints,
        learningDossier: context.learningDossier,
        deliveryRecord: context.deliveryRecord,
        fallbackAuthor,
      })
      const hasExplicitUpdates = context.learningCheckpoints.length > 0 || context.deliveryCheckpoints.length > 0
      const latestUpdate = hasExplicitUpdates ? (updates[0]?.note ?? null) : null
      const coreSemantics = projectActionCenterCoreSemantics({
        ...context,
        route,
        latestVisibleUpdateNote: latestUpdate,
        reviewDecisions: context.reviewDecisions ?? ([] as ActionCenterReviewDecision[]),
        decisionRecords: [],
      })
      const priority = getPriorityFromSignals({
        exceptionStatus: context.deliveryRecord?.exception_status,
        avgSignal,
        totalCompleted: context.stats?.total_completed ?? 0,
      })
      const nextStep =
        route.intervention ||
        context.deliveryRecord?.next_step ||
        getFallbackStep(context.campaign.scan_type, context.deliveryRecord?.lifecycle_stage)

      return [finalizeActionCenterPreviewItem({
        id: context.campaign.id,
        code: `ACT-${1000 + index + 1}`,
        title:
          context.learningDossier?.title ||
          `${definition.productName}: ${context.campaign.name}`,
        summary:
          context.deliveryRecord?.customer_handoff_note ||
          route.expectedEffect ||
          defaults.fallbackSummary,
        reason: coreSemantics.reviewSemantics.reviewReason,
        sourceLabel: definition.productName,
        orgId: context.campaign.organization_id,
        scopeType: context.scopeType,
        teamId: context.scopeValue,
        teamLabel: context.scopeLabel,
        ownerId: context.assignedManager?.userId ?? null,
        ownerName: route.owner,
        ownerRole: context.assignedManager?.displayName
          ? `Manager - ${context.scopeLabel}`
          : getRoleFallback(context.memberRole),
        ownerSubtitle: context.scopeLabel,
        reviewOwnerName,
        priority,
        status,
        reviewDate,
        reviewDateLabel: formatShortDate(reviewDate),
        reviewRhythm: defaults.fallbackRhythm,
        signalLabel: `${definition.productName} - ${context.campaign.name}`,
        signalBody: getSignalBody(context.campaign.scan_type, context.deliveryRecord, latestUpdate),
        nextStep,
        expectedEffect: coreSemantics.actionFrame.expectedEffect,
        reviewReason: coreSemantics.route.reviewReason,
        reviewOutcome: route.reviewOutcome,
        peopleCount: context.peopleCount,
        coreSemantics,
        updates,
      })]
    })
    .sort((left, right) => {
      const statusDelta = getSortRank(left.status) - getSortRank(right.status)
      if (statusDelta !== 0) return statusDelta

      const leftDate = left.reviewDate ? new Date(left.reviewDate).getTime() : Number.POSITIVE_INFINITY
      const rightDate = right.reviewDate ? new Date(right.reviewDate).getTime() : Number.POSITIVE_INFINITY
      if (leftDate !== rightDate) return leftDate - rightDate

      return left.title.localeCompare(right.title)
    })
}

export function getLiveActionCenterSummary(items: ActionCenterPreviewItem[]) {
  const productLabels = new Set(items.map((item) => item.sourceLabel))
  const organizations = new Set(items.map((item) => item.ownerSubtitle))

  return {
    productCount: productLabels.size,
    organizationCount: organizations.size,
    actionCount: items.length,
    blockedCount: items.filter((item) => item.status === 'geblokkeerd').length,
    reviewCount: items.filter((item) => item.reviewDate).length,
  }
}

export function buildActionCenterTelemetryEvents(
  contexts: LiveActionCenterCampaignContext[],
  actorId?: string | null,
) {
  const events: SuiteTelemetryEvent[] = []

  for (const context of contexts) {
    const orgId = context.campaign.organization_id
    const campaignId = context.campaign.id
    const lifecycleStage = context.deliveryRecord?.lifecycle_stage ?? null
    const route = projectActionCenterRoute(context)
    const routeStatus = route.routeStatus

    if (
      lifecycleStage &&
      ['first_value_reached', 'first_management_use', 'follow_up_decided', 'learning_closed'].includes(lifecycleStage)
    ) {
      events.push(
        buildSuiteTelemetryEvent('first_value_confirmed', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: { lifecycleStage },
        }),
      )
    }

    if (
      lifecycleStage &&
      ['first_management_use', 'follow_up_decided', 'learning_closed'].includes(lifecycleStage)
    ) {
      events.push(
        buildSuiteTelemetryEvent('first_management_use_confirmed', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: { lifecycleStage },
        }),
      )
    }

    if (route.reviewScheduledFor) {
      events.push(
        buildSuiteTelemetryEvent('action_center_review_scheduled', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            reviewMoment: route.reviewScheduledFor,
            scopeValue: context.scopeValue,
            routeStatus,
          },
        }),
      )
    }

    if (route.routeOpenedAt) {
      events.push(
        buildSuiteTelemetryEvent('action_center_route_opened', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            scopeValue: context.scopeValue,
            routeStatus,
          },
        }),
      )
    }

    if (route.ownerAssignedAt && route.owner) {
      events.push(
        buildSuiteTelemetryEvent('action_center_owner_assigned', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            scopeValue: context.scopeValue,
            routeStatus,
            ownerLabel: route.owner,
          },
        }),
      )
    }

    if (route.reviewCompletedAt) {
      events.push(
        buildSuiteTelemetryEvent('action_center_review_completed', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            scopeValue: context.scopeValue,
            routeStatus,
            reviewOutcome: route.reviewOutcome,
          },
        }),
      )
    }

    if (route.outcomeRecordedAt && route.outcomeSummary) {
      events.push(
        buildSuiteTelemetryEvent('action_center_outcome_recorded', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            scopeValue: context.scopeValue,
            routeStatus,
            reviewOutcome: route.reviewOutcome,
            outcomeSummary: route.outcomeSummary,
          },
        }),
      )
    }

    if (routeStatus === 'afgerond' || routeStatus === 'gestopt' || lifecycleStage === 'learning_closed') {
      events.push(
        buildSuiteTelemetryEvent('action_center_closeout_recorded', {
          orgId,
          campaignId,
          actorId: actorId ?? null,
          payload: {
            routeStatus,
            triageStatus: context.learningDossier?.triage_status ?? null,
            lifecycleStage,
          },
        }),
      )
    }
  }

  return events
}
