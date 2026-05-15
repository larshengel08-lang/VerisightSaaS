import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn(),
  }),
}))

import { buildActionCenterFollowThroughMailRouteSnapshot } from './action-center-follow-through-mail-data'

describe('action center follow-through mail data', () => {
  it('rejects non-ExitScan routes before they enter the mail planner', () => {
    expect(
      buildActionCenterFollowThroughMailRouteSnapshot({
        routeId: 'camp-2::org::support',
        scanType: 'retention',
        routeStatus: 'reviewbaar',
      }),
    ).toEqual({
      ok: false,
      reason: 'unsupported-route',
    })
  })

  it('keeps scoped HR oversight recipients bounded to writable review-rhythm actors only', () => {
    const snapshot = buildActionCenterFollowThroughMailRouteSnapshot({
      routeId: 'camp-1::org::sales',
      routeScopeValue: 'org-1::department::sales',
      scanType: 'exit',
      routeStatus: 'reviewbaar',
      hrRecipients: [
        {
          email: 'hr-owner@example.com',
          role: 'hr_owner',
          canUpdate: true,
          canScheduleReview: true,
          scopeType: 'department',
          scopeValue: 'org-1::department::sales',
        },
        {
          email: 'viewer@example.com',
          role: 'viewer',
          canUpdate: false,
          canScheduleReview: false,
          scopeType: 'department',
          scopeValue: 'org-1::department::sales',
        },
      ],
    })

    expect(snapshot.ok && snapshot.value.hrOversightRecipients).toEqual([
      { email: 'hr-owner@example.com', auditRole: 'hr_owner' },
    ])
  })
})
