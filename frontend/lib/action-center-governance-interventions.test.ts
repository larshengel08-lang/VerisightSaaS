import { describe, expect, it } from 'vitest'
import {
  buildActionCenterGovernanceInterventionRecord,
  validateActionCenterGovernanceIntervention,
} from './action-center-governance-interventions'

describe('validateActionCenterGovernanceIntervention', () => {
  it('allows HR to request manager update on stuck_action', () => {
    expect(
      validateActionCenterGovernanceIntervention({
        queueCode: 'stuck_action',
        interventionType: 'request_manager_update',
        actorRole: 'hr_member',
      }).allowed,
    ).toBe(true)
  })

  it('blocks HR from rewriting manager history', () => {
    expect(
      validateActionCenterGovernanceIntervention({
        queueCode: 'blocked_action',
        interventionType: 'rewrite_manager_history',
        actorRole: 'hr_owner',
      }).allowed,
    ).toBe(false)
  })

  it('requires suppression reason for false-positive dismissal', () => {
    expect(() =>
      validateActionCenterGovernanceIntervention({
        queueCode: 'action_review_due',
        interventionType: 'suppress_false_signal',
        actorRole: 'hr_member',
        reasonCode: null,
      }),
    ).toThrow('Suppression requires a reason code.')
  })

  it('builds an auditable intervention record with canonical route identity', () => {
    const record = buildActionCenterGovernanceInterventionRecord({
      routeId: 'cmp-1::org-1::department::operations',
      routeSourceId: 'cmp-1',
      routeScopeValue: 'org-1::department::operations',
      orgId: 'org-1',
      queueCode: 'route_ready_for_closeout',
      interventionType: 'close_route',
      actorRole: 'hr_owner',
      actorUserId: 'user-1',
      reasonCode: 'closeout-confirmed',
    })

    expect(record).toMatchObject({
      route_id: 'cmp-1::org-1::department::operations',
      queue_code: 'route_ready_for_closeout',
      intervention_type: 'close_route',
      actor_role: 'hr_owner',
      actor_user_id: 'user-1',
    })
  })
})
