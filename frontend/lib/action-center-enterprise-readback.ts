export interface ActionCenterActivationApprovalReadbackRow {
  routeFamily: string
  approvalStatus: string
  scopeValue: string
  createdAt: string
}

export interface ActionCenterSupportAccessReadbackRow {
  accessKind: string
  accessReason: string
  createdAt: string
}

export interface ActionCenterAuditExportReadbackRow {
  exportScope: string
  requestStatus: string
  createdAt: string
}

export function buildActionCenterTenantAdminSummary(args: {
  routeActivationApprovals: ActionCenterActivationApprovalReadbackRow[]
  supportAccessEvents: ActionCenterSupportAccessReadbackRow[]
  auditExportRequests: ActionCenterAuditExportReadbackRow[]
}) {
  return {
    headline: 'Tenant-admin governance overzicht',
    boundaryNote:
      'Deze laag toont alleen approvals, support-access, export-signalen en rehearsal-links. Geen workflowboard en geen routeverbreding.',
    controlCounts: {
      routeActivationApprovals: args.routeActivationApprovals.length,
      supportAccessEvents: args.supportAccessEvents.length,
      auditExportRequests: args.auditExportRequests.length,
    },
    recentRouteActivation: args.routeActivationApprovals[0] ?? null,
    recentSupportAccessEvent: args.supportAccessEvents[0] ?? null,
    recentAuditExportRequest: args.auditExportRequests[0] ?? null,
  }
}

export function buildActionCenterExecutiveReadback(args: {
  routeActivationApprovals: ActionCenterActivationApprovalReadbackRow[]
  supportAccessEvents: ActionCenterSupportAccessReadbackRow[]
  openRouteCount: number
  staleRouteCount: number
  closeoutReadyRouteCount: number
}) {
  return {
    headline: 'Bestuurlijke follow-through readback',
    operatingBoundaryNote:
      'Deze readback toont ritme, review, closeout en governance-signalen; geen manager-ranking, geen personeelsdossier en geen impactclaim.',
    summaryRows: [
      {
        label: 'Open routes',
        value: args.openRouteCount,
      },
      {
        label: 'Stale routes',
        value: args.staleRouteCount,
      },
      {
        label: 'Closeout-ready routes',
        value: args.closeoutReadyRouteCount,
      },
      {
        label: 'Route activation approvals',
        value: args.routeActivationApprovals.length,
      },
      {
        label: 'Support access events',
        value: args.supportAccessEvents.length,
      },
    ],
  }
}
