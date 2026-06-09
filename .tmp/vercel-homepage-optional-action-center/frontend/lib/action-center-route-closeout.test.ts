import { describe, expect, it } from 'vitest'
import { projectActionCenterRouteCloseout } from './action-center-route-closeout'

describe('projectActionCenterRouteCloseout', () => {
  it('accepts a canonical HR closeout with structured reason', () => {
    const closeout = projectActionCenterRouteCloseout({
      route_id: 'route-1',
      closeout_status: 'afgerond',
      closeout_reason: 'voldoende-opgepakt',
      closeout_note: 'Voor nu voldoende belegd in teamritme.',
      closed_at: '2026-05-20T09:00:00.000Z',
      closed_by_role: 'hr',
    })

    expect(closeout.closeoutStatus).toBe('afgerond')
    expect(closeout.closeoutReason).toBe('voldoende-opgepakt')
    expect(closeout.closedByRole).toBe('hr')
  })

  it('also accepts API-projected camelCase closeout records', () => {
    const closeout = projectActionCenterRouteCloseout({
      routeId: 'route-1',
      closeoutStatus: 'afgerond',
      closeoutReason: 'effect-voldoende-zichtbaar',
      closeoutNote: 'Zichtbaar genoeg om dit nu te sluiten.',
      closedAt: '2026-05-20T09:00:00.000Z',
      closedByRole: 'hr',
    })

    expect(closeout.routeId).toBe('route-1')
    expect(closeout.closeoutReason).toBe('effect-voldoende-zichtbaar')
    expect(closeout.closeoutNote).toBe('Zichtbaar genoeg om dit nu te sluiten.')
  })

  it('rejects closeout rows without a structured reason', () => {
    expect(() =>
      projectActionCenterRouteCloseout({
        route_id: 'route-1',
        closeout_status: 'afgerond',
        closeout_note: 'Alleen notitie',
        closed_at: '2026-05-20T09:00:00.000Z',
        closed_by_role: 'hr',
      }),
    ).toThrow(/closeout_reason/i)
  })
})
