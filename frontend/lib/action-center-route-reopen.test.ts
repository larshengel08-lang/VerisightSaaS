import { describe, expect, it } from 'vitest'
import {
  projectActionCenterRouteFollowUpRelation,
  projectActionCenterRouteLifecycle,
  projectActionCenterRouteReopen,
} from './action-center-route-reopen'

describe('action center route reopen truth', () => {
  it('accepts a dedicated reopen event record', () => {
    const reopen = projectActionCenterRouteReopen({
      route_id: 'route-1',
      reopened_at: '2026-05-01T09:00:00.000Z',
      reopened_by_role: 'hr',
      reopen_reason: 'te-vroeg-afgesloten',
    })

    expect(reopen.routeId).toBe('route-1')
    expect(reopen.reopenReason).toBe('te-vroeg-afgesloten')
  })

  it('keeps follow-up as a separate relation truth', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: 'route-1',
      target_route_id: 'route-2',
      recorded_at: '2026-05-01T10:00:00.000Z',
      recorded_by_role: 'hr',
    })

    expect(relation.routeRelationType).toBe('follow-up-from')
    expect(relation.sourceRouteId).toBe('route-1')
    expect(relation.targetRouteId).toBe('route-2')
  })

  it('does not allow reopen to masquerade as relation truth', () => {
    expect(() =>
      projectActionCenterRouteFollowUpRelation({
        route_relation_type: 'reopened-from',
        source_route_id: 'route-1',
        target_route_id: 'route-1',
        recorded_at: '2026-05-01T10:00:00.000Z',
        recorded_by_role: 'hr',
      }),
    ).toThrow(/route_relation_type/i)
  })

  it('derives deterministic precedence from latest closeout and reopen ordering', () => {
    const closed = projectActionCenterRouteLifecycle({
      routeCloseout: {
        routeId: 'route-1',
        closeoutStatus: 'afgerond',
        closeoutReason: 'voldoende-opgepakt',
        closeoutNote: null,
        closedAt: '2026-05-10T09:00:00.000Z',
        closedByRole: 'hr',
      },
      routeReopens: [],
    })
    const reopened = projectActionCenterRouteLifecycle({
      routeCloseout: {
        routeId: 'route-1',
        closeoutStatus: 'afgerond',
        closeoutReason: 'voldoende-opgepakt',
        closeoutNote: null,
        closedAt: '2026-05-10T09:00:00.000Z',
        closedByRole: 'hr',
      },
      routeReopens: [
        {
          routeId: 'route-1',
          reopenedAt: '2026-05-11T09:00:00.000Z',
          reopenedByRole: 'hr',
          reopenReason: 'te-vroeg-afgesloten',
        },
      ],
    })
    const closedAgain = projectActionCenterRouteLifecycle({
      routeCloseout: {
        routeId: 'route-1',
        closeoutStatus: 'gestopt',
        closeoutReason: 'bewust-niet-voortzetten',
        closeoutNote: null,
        closedAt: '2026-05-12T09:00:00.000Z',
        closedByRole: 'hr',
      },
      routeReopens: [
        {
          routeId: 'route-1',
          reopenedAt: '2026-05-11T09:00:00.000Z',
          reopenedByRole: 'hr',
          reopenReason: 'te-vroeg-afgesloten',
        },
      ],
    })

    expect(closed.activeCloseout?.closeoutStatus).toBe('afgerond')
    expect(reopened.activeCloseout).toBeNull()
    expect(reopened.isCurrentlyReopened).toBe(true)
    expect(closedAgain.activeCloseout?.closeoutStatus).toBe('gestopt')
    expect(closedAgain.isCurrentlyReopened).toBe(false)
  })
})
