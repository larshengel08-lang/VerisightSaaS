import type { MemberRole } from '@/lib/types'

export { getFutureActionCenterAdapter } from '@/lib/action-center-adapters'

export type ActionCenterWorkspaceKind = 'follow_through'
export type ActionCenterDossierStatus = 'open' | 'closed'
export type ActionCenterAssignmentState =
  | 'queued'
  | 'active'
  | 'blocked'
  | 'waiting'
  | 'completed'
  | 'cancelled'
export type ActionCenterAssignmentKind = 'follow_up' | 'review_prep' | 'closure' | 'handoff'
export type ActionCenterReviewState = 'scheduled' | 'due' | 'completed' | 'cancelled'
export type ActionCenterFollowUpSignalKind =
  | 'decision_due'
  | 'owner_missing'
  | 'review_due'
  | 'blocked_assignment'
  | 'awaiting_input'
  | 'closure_ready'
export type ActionCenterSignalSeverity = 'info' | 'warning' | 'critical'
export type ActionCenterSignalState = 'open' | 'resolved'

export interface ActionCenterPermissionEnvelope {
  canViewWorkspace: boolean
  canUpdateAssignments: boolean
  canScheduleReviewMoments: boolean
  canResolveSignals: boolean
  canCloseDossiers: boolean
  canManagePermissions: boolean
  canOpenProductAdapters: false
}

export interface ActionCenterDossier {
  id: string
  title: string
  status: ActionCenterDossierStatus
  ownerId: string | null
  permissionEnvelope: ActionCenterPermissionEnvelope
}

export interface ActionCenterAssignment {
  id: string
  dossierId: string
  title: string
  state: ActionCenterAssignmentState
  kind: ActionCenterAssignmentKind
  ownerId: string | null
}

export interface ActionCenterReviewMoment {
  id: string
  dossierId: string
  scheduledFor: string
  state: ActionCenterReviewState
}

export interface ActionCenterFollowUpSignal {
  id: string
  dossierId: string
  kind: ActionCenterFollowUpSignalKind
  severity: ActionCenterSignalSeverity
  state: ActionCenterSignalState
}

export interface ActionCenterWorkspaceSummary {
  workspaceKind: ActionCenterWorkspaceKind
  openDossierCount: number
  blockedCount: number
  reviewDueCount: number
  escalationCount: number
  projectPlanCount: 0
  advisoryCount: 0
}

export function buildActionCenterPermissionEnvelope(args: {
  role: MemberRole | null | undefined
}): ActionCenterPermissionEnvelope {
  const role = args.role
  const canViewWorkspace = Boolean(role)
  const canEditFollowThrough = role === 'owner'

  return {
    canViewWorkspace,
    canUpdateAssignments: canEditFollowThrough,
    canScheduleReviewMoments: canEditFollowThrough,
    canResolveSignals: canEditFollowThrough,
    canCloseDossiers: canEditFollowThrough,
    canManagePermissions: canEditFollowThrough,
    canOpenProductAdapters: false,
  }
}

export function buildActionCenterWorkspaceSummary(args: {
  dossiers: ActionCenterDossier[]
  assignments: ActionCenterAssignment[]
  reviewMoments: ActionCenterReviewMoment[]
  followUpSignals: ActionCenterFollowUpSignal[]
}): ActionCenterWorkspaceSummary {
  const openDossierCount = args.dossiers.filter((dossier) => dossier.status === 'open').length
  const blockedCount = args.assignments.filter((assignment) => assignment.state === 'blocked').length
  const reviewDueCount = args.reviewMoments.filter((reviewMoment) => reviewMoment.state === 'due').length
  const escalationCount = args.followUpSignals.filter(
    (signal) => signal.state === 'open' && signal.severity === 'critical',
  ).length

  return {
    workspaceKind: 'follow_through',
    openDossierCount,
    blockedCount,
    reviewDueCount,
    escalationCount,
    projectPlanCount: 0,
    advisoryCount: 0,
  }
}
