import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES,
  buildActionCenterBoundedExecutionEvent,
  buildActionCenterMetricCatalog,
} from './action-center-bounded-execution-metrics'

describe('bounded execution metric events', () => {
  it('builds action-card events with canonical action anchors', () => {
    expect(ACTION_CENTER_BOUNDED_EXECUTION_EVENT_TYPES).toContain('action_draft_created')

    expect(
      buildActionCenterBoundedExecutionEvent('action_review_completed', {
        orgId: 'org-1',
        routeId: 'campaign-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'campaign-1',
        routeFamily: 'exit',
        actionId: 'action-1',
        actorRole: 'manager_participant',
        actorUserId: 'manager-1',
      }),
    ).toMatchObject({
      event_type: 'action_review_completed',
      object_anchor: 'action_card',
      route_family: 'exit',
      action_id: 'action-1',
      route_id: 'campaign-1::org-1::department::operations',
      metadata: {},
    })
  })

  it('builds route events without action anchors', () => {
    expect(
      buildActionCenterBoundedExecutionEvent('route_opened', {
        orgId: 'org-1',
        routeId: 'campaign-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'campaign-1',
        routeFamily: 'retention',
        actorRole: 'system_channel',
      }),
    ).toMatchObject({
      event_type: 'route_opened',
      object_anchor: 'follow_through_route',
      route_family: 'retention',
      action_id: null,
      metadata: {},
    })
  })

  it('rejects non-canonical event identities', () => {
    expect(() =>
      buildActionCenterBoundedExecutionEvent('action_draft_created', {
        orgId: 'org-1',
        routeId: 'forged-route-id',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'campaign-1',
        routeFamily: 'exit',
        actionId: 'action-1',
        actorRole: 'manager_participant',
        actorUserId: 'manager-1',
      }),
    ).toThrow('Bounded execution event route identity must stay canonical.')
  })

  it('rejects non-empty metadata so the event rail stays readiness-only', () => {
    expect(() =>
      buildActionCenterBoundedExecutionEvent('action_state_changed', {
        orgId: 'org-1',
        routeId: 'campaign-1::org-1::department::operations',
        routeScopeValue: 'org-1::department::operations',
        routeSourceId: 'campaign-1',
        routeFamily: 'exit',
        actionId: 'action-1',
        actorRole: 'manager_participant',
        actorUserId: 'manager-1',
        metadata: {
          from_state: 'in_review',
        },
      }),
    ).toThrow('Bounded execution event metadata must stay an empty object.')
  })

  it('defines blocked_action_rate and route_ready_for_closeout_rate with bounded semantics', () => {
    const catalog = buildActionCenterMetricCatalog()

    expect(catalog.blocked_action_rate.visibility).toBe('buyer_safe_reporting')
    expect(catalog.route_ready_for_closeout_rate.doesNotProve).toContain('route success')
  })

  it('keeps action completion readback bounded', () => {
    const catalog = buildActionCenterMetricCatalog()

    expect(catalog.action_completion_rate.interpretation).toContain('completed state')
    expect(catalog.action_completion_rate.doesNotProve).toContain('route resolution')
  })
})
