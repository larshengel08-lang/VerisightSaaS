import { describe, expect, it } from 'vitest'
import { projectActionCenterRouteFollowUpRelation } from './action-center-route-reopen'

describe('action center follow-up route trigger projector', () => {
  it('accepts canonical camelCase triggerReason input and returns canonical truth', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      id: ' relation-direct-follow-up-1 ',
      routeRelationType: ' follow-up-from ',
      sourceRouteId: ' campaign-exit-closed::org-1::department::operations ',
      targetRouteId: ' campaign-pulse-open::org-1::department::operations ',
      triggerReason: ' nieuw-campaign-signaal ',
      recordedAt: ' 2026-04-24T10:00:00.000Z ',
      recordedByRole: ' hr ',
      endedAt: ' 2026-05-01T10:00:00.000Z ',
    })

    expect(relation).toEqual({
      id: 'relation-direct-follow-up-1',
      routeRelationType: 'follow-up-from',
      sourceRouteId: 'campaign-exit-closed::org-1::department::operations',
      targetRouteId: 'campaign-pulse-open::org-1::department::operations',
      triggerReason: 'nieuw-campaign-signaal',
      recordedAt: '2026-04-24T10:00:00.000Z',
      recordedByRole: 'hr',
      endedAt: '2026-05-01T10:00:00.000Z',
    })
  })
})
