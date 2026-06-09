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

export type MtoDesignMode = 'design_input_only'
export type MtoCarrierStatus = 'inactive'
export type MtoCarrierOwnerModel = 'hr_central'
export type MtoCarrierManagerScope = 'department_only'
export type MtoTriageStatus = 'nieuw' | 'bevestigd' | 'geparkeerd' | 'uitgevoerd' | 'verworpen'

const OPEN_TRIAGE_STATUSES = new Set<MtoTriageStatus>(['nieuw', 'bevestigd'])
const GENERIC_MTO_MANAGER_LABELS = new Set(['klant + verisight', 'verisight', 'founder / verisight'])

export interface MtoDesignInput {
  source: 'mto'
  themes: string[]
  notes: string | null
}

export interface MtoDesignInputSummary {
  source: 'mto'
  mode: MtoDesignMode
  themeCount: number
  notes: string | null
  canCreateAssignments: false
  canOpenCarrier: false
}

export interface MtoActionCenterCarrier {
  key: 'mto'
  label: string
  status: MtoCarrierStatus
  workspaceKind: 'follow_through'
  ownerModel: MtoCarrierOwnerModel
  managerScope: MtoCarrierManagerScope
  reviewPressureVisible: true
  dossierFirst: true
  canOpenOtherProductAdapters: false
}

export interface MtoDossierInput {
  id: string
  title: string
  triageStatus: MtoTriageStatus
  departmentLabel: string | null
  managerLabel: string | null
  firstActionTaken: string | null
  reviewMoment: string | null
  managementActionOutcome: string | null
  nextRoute: string | null
  stopReason: string | null
}

export interface MtoActionCenterWorkspace {
  carrier: MtoActionCenterCarrier
  summary: ActionCenterWorkspaceSummary
  dossiers: ActionCenterDossier[]
  assignments: ActionCenterAssignment[]
  reviewMoments: ActionCenterReviewMoment[]
  followUpSignals: ActionCenterFollowUpSignal[]
  managerDepartmentLabels: string[]
}

const MTO_ACTION_CENTER_CARRIER: MtoActionCenterCarrier = {
  key: 'mto',
  label: 'MTO-design-input',
  status: 'inactive',
  workspaceKind: 'follow_through',
  ownerModel: 'hr_central',
  managerScope: 'department_only',
  reviewPressureVisible: true,
  dossierFirst: true,
  canOpenOtherProductAdapters: false,
}

function buildActorId(prefix: string, value: string | null) {
  if (!value) return null
  const normalized = value.trim().toLowerCase().split(/\s+/).join('-')
  return normalized ? `${prefix}:${normalized}` : null
}

function isOpen(triageStatus: MtoTriageStatus) {
  return OPEN_TRIAGE_STATUSES.has(triageStatus)
}

function hasBoundedText(value: string | null) {
  return Boolean(value?.trim())
}

export function normalizeMtoManagerLabel(value: string | null) {
  const normalizedValue = value?.trim()
  if (!normalizedValue) {
    return null
  }

  return GENERIC_MTO_MANAGER_LABELS.has(normalizedValue.toLowerCase()) ? null : normalizedValue
}

export function describeMtoDesignInput(input: MtoDesignInput): MtoDesignInputSummary {
  return {
    source: input.source,
    mode: 'design_input_only',
    themeCount: input.themes.length,
    notes: input.notes,
    canCreateAssignments: false,
    canOpenCarrier: false,
  }
}

export function getMtoActionCenterCarrier() {
  return MTO_ACTION_CENTER_CARRIER
}

export function buildMtoActionCenterWorkspace(args: {
  role: MemberRole | null | undefined
  dossiers: MtoDossierInput[]
}): MtoActionCenterWorkspace {
  const dossiers: ActionCenterDossier[] = []
  const assignments: ActionCenterAssignment[] = []
  const reviewMoments: ActionCenterReviewMoment[] = []
  const followUpSignals: ActionCenterFollowUpSignal[] = []
  const managerDepartmentLabels = Array.from(
    new Set(args.dossiers.map((dossier) => dossier.departmentLabel).filter((value): value is string => Boolean(value))),
  ).sort((left, right) => left.localeCompare(right))

  for (const dossier of args.dossiers) {
    const permissionEnvelope = buildActionCenterPermissionEnvelope({ role: args.role })
    const open = isOpen(dossier.triageStatus)
    const hasFollowThroughDecision =
      hasBoundedText(dossier.managementActionOutcome) ||
      hasBoundedText(dossier.nextRoute) ||
      hasBoundedText(dossier.stopReason)
    const hasReviewMoment = hasBoundedText(dossier.reviewMoment)
    const departmentOwnerId = buildActorId('department', dossier.departmentLabel)
    const managerOwnerId = buildActorId('manager', dossier.managerLabel)

    dossiers.push({
      id: dossier.id,
      title: dossier.title,
      status: open ? 'open' : 'closed',
      ownerId: managerOwnerId ?? departmentOwnerId,
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
      title: dossier.firstActionTaken ?? 'Leg eerste bounded stap vast',
      state: assignmentState,
      kind: assignmentKind,
      ownerId: managerOwnerId ?? departmentOwnerId,
    })

    const reviewState =
      dossier.triageStatus === 'uitgevoerd'
        ? 'completed'
        : dossier.triageStatus === 'geparkeerd' || dossier.triageStatus === 'verworpen'
          ? 'cancelled'
          : hasReviewMoment
            ? 'scheduled'
            : 'due'
    reviewMoments.push({
      id: `rev-${dossier.id}`,
      dossierId: dossier.id,
      scheduledFor: dossier.reviewMoment ?? 'Reviewmoment nog vastleggen',
      state: reviewState,
    })

    if (open && !dossier.firstActionTaken) {
      followUpSignals.push({
        id: `sig-step-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'blocked_assignment',
        severity: 'critical',
        state: 'open',
      })
    }

    if (open && !dossier.managerLabel && dossier.departmentLabel) {
      followUpSignals.push({
        id: `sig-owner-${dossier.id}`,
        dossierId: dossier.id,
        kind: 'owner_missing',
        severity: 'warning',
        state: 'open',
      })
    }

    if (open && !hasReviewMoment) {
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
    carrier: MTO_ACTION_CENTER_CARRIER,
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
    managerDepartmentLabels,
  }
}
