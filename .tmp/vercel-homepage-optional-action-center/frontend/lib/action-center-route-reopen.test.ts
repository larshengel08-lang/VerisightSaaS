import { describe, expect, it } from 'vitest'
import {
  getActionCenterFollowUpTriggerReasonLabel,
  projectActionCenterRouteFollowUpRelation,
} from './action-center-route-reopen'

describe('action center route reopen follow-up relation contract', () => {
  it('throws when trigger_reason is missing on a follow-up relation', () => {
    expect(() => {
      projectActionCenterRouteFollowUpRelation({
        route_relation_type: 'follow-up-from',
        source_route_id: 'campaign-exit-closed::org-1::department::operations',
        target_route_id: 'campaign-pulse-open::org-1::department::operations',
        recorded_at: '2026-04-24T10:00:00.000Z',
        recorded_by_role: 'hr',
      })
    }).toThrow(/trigger_reason/i)
  })

  it('accepts a canonical trigger_reason on a follow-up relation', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: 'campaign-exit-closed::org-1::department::operations',
      target_route_id: 'campaign-pulse-open::org-1::department::operations',
      trigger_reason: 'nieuw-campaign-signaal',
      recorded_at: '2026-04-24T10:00:00.000Z',
      recorded_by_role: 'hr',
    })

    expect(relation.triggerReason).toBe('nieuw-campaign-signaal')
  })

  it('accepts another canonical trigger_reason on a follow-up relation', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: 'campaign-exit-closed::org-1::department::operations',
      target_route_id: 'campaign-pulse-open::org-1::department::operations',
      trigger_reason: 'nieuw-segment-signaal',
      recorded_at: '2026-04-24T10:00:00.000Z',
      recorded_by_role: 'hr',
    })

    expect(relation.triggerReason).toBe('nieuw-segment-signaal')
  })

  it('rejects an invalid trigger_reason on a follow-up relation', () => {
    expect(() =>
      projectActionCenterRouteFollowUpRelation({
        route_relation_type: 'follow-up-from',
        source_route_id: 'campaign-exit-closed::org-1::department::operations',
        target_route_id: 'campaign-pulse-open::org-1::department::operations',
        trigger_reason: 'onbekend-signaal',
        recorded_at: '2026-04-24T10:00:00.000Z',
        recorded_by_role: 'hr',
      }),
    ).toThrow(/trigger_reason/i)
  })

  it('rejects an invalid recorded_at timestamp on a follow-up relation', () => {
    expect(() =>
      projectActionCenterRouteFollowUpRelation({
        route_relation_type: 'follow-up-from',
        source_route_id: 'campaign-exit-closed::org-1::department::operations',
        target_route_id: 'campaign-pulse-open::org-1::department::operations',
        trigger_reason: 'nieuw-campaign-signaal',
        recorded_at: 'geen-datum',
        recorded_by_role: 'hr',
      }),
    ).toThrow(/recorded_at is invalid/i)
  })

  it('normalizes trimmed whitespace across mixed snake_case and camelCase input', () => {
    const relation = projectActionCenterRouteFollowUpRelation({
      route_relation_type: ' follow-up-from ',
      sourceRouteId: ' campaign-exit-closed::org-1::department::operations ',
      target_route_id: ' campaign-pulse-open::org-1::department::operations ',
      triggerReason: ' nieuw-campaign-signaal ',
      recorded_at: ' 2026-04-24T10:00:00.000Z ',
      recordedByRole: ' hr ',
    })

    expect(relation).toEqual({
      id: null,
      routeRelationType: 'follow-up-from',
      sourceRouteId: 'campaign-exit-closed::org-1::department::operations',
      targetRouteId: 'campaign-pulse-open::org-1::department::operations',
      triggerReason: 'nieuw-campaign-signaal',
      recordedAt: '2026-04-24T10:00:00.000Z',
      recordedByRole: 'hr',
      endedAt: null,
    })
  })

  it('returns the expected trigger reason labels', () => {
    expect(getActionCenterFollowUpTriggerReasonLabel('nieuw-campaign-signaal')).toBe('Nieuw campaign-signaal')
    expect(getActionCenterFollowUpTriggerReasonLabel('nieuw-segment-signaal')).toBe('Nieuw segmentsignaal')
    expect(getActionCenterFollowUpTriggerReasonLabel('hernieuwde-hr-beoordeling')).toBe(
      'Hernieuwde HR-beoordeling',
    )
  })
})
