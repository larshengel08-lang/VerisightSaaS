import { describe, expect, it } from 'vitest'
import {
  buildActionCenterExecutiveReadback,
  buildActionCenterTenantAdminSummary,
} from './action-center-enterprise-readback'

describe('action center enterprise readback', () => {
  it('builds a tenant admin summary with approval, support, and export counts', () => {
    expect(
      buildActionCenterTenantAdminSummary({
        routeActivationApprovals: [
          {
            routeFamily: 'exit',
            approvalStatus: 'approved',
            scopeValue: 'org-1::department::ops',
            createdAt: '2026-05-23T09:00:00.000Z',
          },
        ],
        supportAccessEvents: [
          {
            accessKind: 'support',
            accessReason: 'Check route',
            createdAt: '2026-05-23T09:10:00.000Z',
          },
        ],
        auditExportRequests: [
          {
            exportScope: 'bounded_summary',
            requestStatus: 'generated',
            createdAt: '2026-05-23T09:20:00.000Z',
          },
        ],
      }).controlCounts,
    ).toEqual({
      routeActivationApprovals: 1,
      supportAccessEvents: 1,
      auditExportRequests: 1,
    })
  })

  it('builds a read-only executive summary without manager/task framing', () => {
    const executiveReadback = buildActionCenterExecutiveReadback({
      routeActivationApprovals: [],
      supportAccessEvents: [],
      openRouteCount: 4,
      staleRouteCount: 1,
      closeoutReadyRouteCount: 2,
    })

    expect(executiveReadback.headline).toContain('Bestuurlijke follow-through readback')
    expect(executiveReadback.operatingBoundaryNote).toContain('geen impactclaim')
    expect(executiveReadback.summaryRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Open routes', value: 4 }),
        expect.objectContaining({ label: 'Closeout-ready routes', value: 2 }),
      ]),
    )
  })
})
