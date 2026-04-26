import type {
  ActionCenterPreviewItem,
  ActionCenterPreviewPriority,
  ActionCenterPreviewStatus,
  ActionCenterPreviewUpdate,
} from '@/components/dashboard/action-center-preview'
import { getScanDefinition } from '@/lib/scan-definitions'
import type { MemberRole, Campaign, CampaignStats, ScanType } from '@/lib/types'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord, DeliveryExceptionStatus } from '@/lib/ops-delivery'
import { getDeliveryExceptionLabel } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'

export interface LiveActionCenterCampaignContext {
  campaign: Campaign
  stats: CampaignStats | null
  organizationName: string
  memberRole: MemberRole | null
  scopeValue: string
  scopeLabel: string
  peopleCount: number
  assignedManager: {
    userId: string
    displayName: string | null
  } | null
  deliveryRecord: CampaignDeliveryRecord | null
  deliveryCheckpoints: CampaignDeliveryCheckpoint[]
  learningDossier: PilotLearningDossier | null
  learningCheckpoints: PilotLearningCheckpoint[]
}

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

function getStatus(args: {
  learningDossier: PilotLearningDossier | null
  deliveryRecord: CampaignDeliveryRecord | null
  reviewDate: string | null
  ownerName: string | null
}): ActionCenterPreviewStatus {
  const triageStatus = args.learningDossier?.triage_status ?? null
  if (triageStatus === 'uitgevoerd' || args.deliveryRecord?.lifecycle_stage === 'learning_closed') {
    return 'afgerond'
  }
  if (triageStatus === 'verworpen') {
    return 'gestopt'
  }
  if (args.deliveryRecord?.exception_status && args.deliveryRecord.exception_status !== 'none') {
    return 'geblokkeerd'
  }
  if (args.learningDossier?.first_action_taken || args.deliveryRecord?.next_step || args.ownerName || args.reviewDate) {
    return 'in-uitvoering'
  }
  return 'te-bespreken'
}

function getRoleFallback(memberRole: MemberRole | null) {
  if (!memberRole) return 'Nog geen expliciete klantrol'
  return ROLE_LABELS[memberRole]
}

function getOwnerNames(checkpoints: PilotLearningCheckpoint[], deliveryRecord: CampaignDeliveryRecord | null) {
  const managementOwner =
    checkpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use')?.owner_label?.trim() ?? null
  const reviewOwner =
    checkpoints.find((checkpoint) => checkpoint.checkpoint_key === 'follow_up_review')?.owner_label?.trim() ?? null

  return {
    ownerName: managementOwner || reviewOwner || deliveryRecord?.operator_owner || null,
    reviewOwnerName: reviewOwner || managementOwner || deliveryRecord?.operator_owner || null,
  }
}

function buildOpenSignals(args: {
  status: ActionCenterPreviewStatus
  ownerName: string | null
  reviewDate: string | null
  deliveryRecord: CampaignDeliveryRecord | null
}) {
  const signals: string[] = []
  if (!args.ownerName) signals.push('owner_missing')
  if (!args.reviewDate && args.status !== 'afgerond' && args.status !== 'gestopt') signals.push('review_due')
  if (args.status === 'geblokkeerd') signals.push('blocked_assignment')
  if (!args.deliveryRecord?.next_step && args.status !== 'afgerond' && args.status !== 'gestopt') signals.push('decision_due')
  return signals
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
    args.learningDossier?.management_action_outcome ||
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

export function isLiveActionCenterScanType(scanType: ScanType) {
  return SUPPORTED_SCAN_TYPES.has(scanType)
}

export function buildLiveActionCenterItems(contexts: LiveActionCenterCampaignContext[]): ActionCenterPreviewItem[] {
  return contexts
    .filter((context) => isLiveActionCenterScanType(context.campaign.scan_type))
    .map((context, index) => {
      const definition = getScanDefinition(context.campaign.scan_type)
      const defaults = SCAN_DEFAULTS[context.campaign.scan_type]
      const avgSignal = context.stats?.avg_signal_score ?? context.stats?.avg_risk_score ?? null
      const fallbackAuthor = context.organizationName || 'Verisight'
      const reviewDate = context.learningDossier?.review_moment ?? null
      const { ownerName, reviewOwnerName } = getOwnerNames(context.learningCheckpoints, context.deliveryRecord)
      const status = getStatus({
        learningDossier: context.learningDossier,
        deliveryRecord: context.deliveryRecord,
        reviewDate,
        ownerName,
      })
      const openSignals = buildOpenSignals({
        status,
        ownerName,
        reviewDate,
        deliveryRecord: context.deliveryRecord,
      })
      const updates = buildUpdates({
        learningCheckpoints: context.learningCheckpoints,
        deliveryCheckpoints: context.deliveryCheckpoints,
        learningDossier: context.learningDossier,
        deliveryRecord: context.deliveryRecord,
        fallbackAuthor,
      })
      const latestUpdate = updates[0]?.note ?? null
      const priority = getPriorityFromSignals({
        exceptionStatus: context.deliveryRecord?.exception_status,
        avgSignal,
        totalCompleted: context.stats?.total_completed ?? 0,
      })
      const nextStep =
        context.learningDossier?.first_action_taken ||
        context.deliveryRecord?.next_step ||
        getFallbackStep(context.campaign.scan_type, context.deliveryRecord?.lifecycle_stage)

      return {
        id: context.campaign.id,
        code: `ACT-${1000 + index + 1}`,
        title:
          context.learningDossier?.title ||
          `${definition.productName}: ${context.campaign.name}`,
        summary:
          context.deliveryRecord?.customer_handoff_note ||
          context.learningDossier?.expected_first_value ||
          defaults.fallbackSummary,
        reason:
          context.learningDossier?.first_management_value ||
          defaults.managementQuestion,
        sourceLabel: definition.productName,
        teamId: context.scopeValue,
        teamLabel: context.scopeLabel,
        ownerId: context.assignedManager?.userId ?? null,
        ownerName: context.assignedManager?.displayName ?? ownerName,
        ownerRole: context.assignedManager?.displayName
          ? `Manager - ${context.scopeLabel}`
          : ownerName
            ? `Owner - ${context.organizationName}`
            : getRoleFallback(context.memberRole),
        ownerSubtitle: context.scopeLabel,
        reviewOwnerName: reviewOwnerName ?? context.assignedManager?.displayName ?? null,
        priority,
        status,
        reviewDate,
        reviewDateLabel: formatShortDate(reviewDate),
        reviewRhythm: reviewDate ? defaults.fallbackRhythm : defaults.fallbackRhythm,
        signalLabel: `${definition.productName} - ${context.campaign.name}`,
        signalBody: getSignalBody(context.campaign.scan_type, context.deliveryRecord, latestUpdate),
        nextStep,
        peopleCount: context.peopleCount,
        openSignals,
        updates,
      } satisfies ActionCenterPreviewItem
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
