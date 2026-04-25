import {
  buildActionCenterPermissionEnvelope,
  buildActionCenterWorkspaceSummary,
  type ActionCenterAssignment,
  type ActionCenterDossier,
  type ActionCenterFollowUpSignal,
  type ActionCenterReviewMoment,
  type ActionCenterWorkspaceSummary,
} from '@/lib/action-center-shared-core'
import type { MemberRole } from '@/lib/types'

export type ExitCarrierStatus = 'active'
export type ExitCarrierRouteScope = 'exit_only'
export type ExitCarrierOwnerModel = 'explicit_named_owner'
export type ExitCarrierReviewDiscipline = 'follow_up_review_required'
export type ExitTriageStatus = 'nieuw' | 'bevestigd' | 'geparkeerd' | 'uitgevoerd' | 'verworpen'
export type ExitDeliveryMode = 'baseline' | 'live'

const OPEN_TRIAGE_STATUSES = new Set<ExitTriageStatus>(['nieuw', 'bevestigd'])

export interface ExitActionCenterCarrier {
  key: 'exit'
  label: string
  status: ExitCarrierStatus
  workspaceKind: 'follow_through'
  routeScope: ExitCarrierRouteScope
  ownerModel: ExitCarrierOwnerModel
  reviewDiscipline: ExitCarrierReviewDiscipline
  canOpenOtherProductAdapters: false
}

export interface ExitDossierInput {
  id: string
  title: string
  triageStatus: ExitTriageStatus
  deliveryMode: ExitDeliveryMode | null
  managementOwnerLabel: string | null
  reviewOwnerLabel: string | null
  firstActionTaken: string | null
  reviewMoment: string | null
  managementActionOutcome: string | null
  nextRoute: string | null
  stopReason: string | null
}

export interface ExitActionCenterWorkspace {
  carrier: ExitActionCenterCarrier
  summary: ActionCenterWorkspaceSummary
  dossiers: ActionCenterDossier[]
  assignments: ActionCenterAssignment[]
  reviewMoments: ActionCenterReviewMoment[]
  followUpSignals: ActionCenterFollowUpSignal[]
  activeDeliveryModes: ExitDeliveryMode[]
}

export interface ExitActionCenterCandidateDossier {
  scanType: string | null
  routeInterest: string | null
  campaignId: string | null
}

const EXIT_ACTION_CENTER_CARRIER: ExitActionCenterCarrier = {
  key: 'exit',
  label: 'ExitScan-adapter',
  status: 'active',
  workspaceKind: 'follow_through',
  routeScope: 'exit_only',
  ownerModel: 'explicit_named_owner',
  reviewDiscipline: 'follow_up_review_required',
  canOpenOtherProductAdapters: false,
}

function buildActorId(prefix: string, value: string | null) {
  if (!value) return null
  const normalized = value.trim().toLowerCase().split(/\s+/).join('-')
  return normalized ? `${prefix}:${normalized}` : null
}

function isOpen(triageStatus: ExitTriageStatus) {
  return OPEN_TRIAGE_STATUSES.has(triageStatus)
}

function isExitDeliveryMode(value: ExitDeliveryMode | null): value is ExitDeliveryMode {
  return value === 'baseline' || value === 'live'
}

export function getExitActionCenterCarrier() {
  return EXIT_ACTION_CENTER_CARRIER
}

export function isExitActionCenterCandidate(args: {
  dossier: ExitActionCenterCandidateDossier
  exitCampaignIds: ReadonlySet<string>
}) {
  const { dossier, exitCampaignIds } = args

  if (dossier.scanType === 'exit') {
    return true
  }

  if (dossier.campaignId) {
    return exitCampaignIds.has(dossier.campaignId)
  }

  return dossier.scanType === null && dossier.routeInterest === 'exitscan'
}

export function buildExitActionCenterWorkspace(args: {
  role: MemberRole | null | undefined
  dossiers: ExitDossierInput[]
}): ExitActionCenterWorkspace {
  const dossiers: ActionCenterDossier[] = []
  const assignments: ActionCenterAssignment[] = []
  const reviewMoments: ActionCenterReviewMoment[] = []
  const followUpSignals: ActionCenterFollowUpSignal[] = []
  const activeDeliveryModes = Array.from(
    new Set(args.dossiers.map((dossier) => dossier.deliveryMode).filter(isExitDeliveryMode)),
  ).sort((left, right) => left.localeCompare(right))

  for (const dossier of args.dossiers) {
    const permissionEnvelope = buildActionCenterPermissionEnvelope({ role: args.role })
    const open = isOpen(dossier.triageStatus)
    const hasFollowThroughDecision = Boolean(
      dossier.managementActionOutcome || dossier.nextRoute || dossier.stopReason,
    )
    const managementOwnerId = buildActorId('manager', dossier.managementOwnerLabel)
    const reviewOwnerId = buildActorId('review', dossier.reviewOwnerLabel)
    const ownerId = managementOwnerId ?? reviewOwnerId

    dossiers.push({
      id: dossier.id,
      title: dossier.title,
      status: open ? 'open' : 'closed',
      ownerId,
      permissionEnvelope,
    })

    const assignmentState =
      dossier.triageStatus === 'uitgevoerd'
        ? 'completed'
        : dossier.triageStatus === 'verworpen'
          ? 'cancelled'
          : dossier.triageStatus === 'geparkeerd'
            ? 'waiting'
            : dossier.firstActionTaken
              ? 'active'
              : 'blocked'
    const assignmentKind =
      hasFollowThroughDecision ? 'handoff' : dossier.firstActionTaken ? 'follow_up' : 'review_prep'

    assignments.push({
      id: `asg-${dossier.id}`,
      dossierId: dossier.id,
      title: dossier.firstActionTaken ?? 'Leg eerste ExitScan follow-up stap vast',
      state: assignmentState,
      kind: assignmentKind,
      ownerId,
    })

    const reviewState =
      dossier.triageStatus === 'uitgevoerd'
        ? 'completed'
        : dossier.triageStatus === 'geparkeerd' || dossier.triageStatus === 'verworpen'
          ? 'cancelled'
          : 'due'

    reviewMoments.push({
      id: `rev-${dossier.id}`,
      dossierId: dossier.id,
      scheduledFor: dossier.reviewMoment ?? 'Exit reviewmoment nog vastleggen',
      state: reviewState,
    })

    if (open && !ownerId) {
      followUpSignals.push({
        id: `sig-owner-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'owner_missing',
        severity: 'warning',
        state: 'open',
      })
    }

    if (open && !dossier.firstActionTaken) {
      followUpSignals.push({
        id: `sig-step-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'blocked_assignment',
        severity: 'critical',
        state: 'open',
      })
    }

    if (open) {
      followUpSignals.push({
        id: `sig-review-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'review_due',
        severity: 'warning',
        state: 'open',
      })
    }

    if (open && !hasFollowThroughDecision) {
      followUpSignals.push({
        id: `sig-decision-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'decision_due',
        severity: 'warning',
        state: 'open',
      })
    }
  }

  return {
    carrier: EXIT_ACTION_CENTER_CARRIER,
    summary: buildActionCenterWorkspaceSummary({
      dossiers,
      assignments,
      reviewMoments,
      followUpSignals,
    }),
    dossiers,
    assignments,
    reviewMoments,
    followUpSignals,
    activeDeliveryModes,
  }
}
