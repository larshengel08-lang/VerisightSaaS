import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_ACTION_TRANSITION_RULES,
  ACTION_CENTER_ACTION_SEMANTIC_STATES,
  ACTION_CENTER_CANONICAL_REVIEW_STATES,
  ACTION_CENTER_CANONICAL_ROUTE_STATES,
  ACTION_CENTER_TRANSITION_RULES,
  getActionCenterApprovedRouteDefault,
  isActionCenterActionStateTransitionAllowed,
  isActionCenterCanonicalRouteStateTransitionAllowed,
  resolveActionCenterActionReviewTransition,
} from '@/lib/action-center-constitution'

describe('action-center constitution', () => {
  it('keeps the canonical route and review state lists explicit', () => {
    expect(ACTION_CENTER_CANONICAL_ROUTE_STATES).toEqual([
      'open',
      'scheduled',
      'overdue',
      'stale',
      'escalation_sensitive',
      'closed',
      'reopened',
    ])
    expect(ACTION_CENTER_CANONICAL_REVIEW_STATES).toEqual([
      'scheduled',
      'completed',
      'missed',
      'cancelled',
      'rescheduled',
    ])
    expect(ACTION_CENTER_ACTION_SEMANTIC_STATES).toEqual([
      'draft',
      'active',
      'review_due',
      'in_review',
      'blocked',
      'completed',
      'stopped',
      'superseded',
    ])
  })

  it('exposes only exit and retention as approved route defaults', () => {
    expect(getActionCenterApprovedRouteDefault('exit')).toEqual({
      scanType: 'exit',
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      reviewWindowDays: { min: 60, max: 90 },
      staleAfterDays: 90,
    })
    expect(getActionCenterApprovedRouteDefault('retention')).toEqual({
      scanType: 'retention',
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      reviewWindowDays: { min: 45, max: 90 },
      staleAfterDays: 90,
    })
    expect(getActionCenterApprovedRouteDefault('pulse')).toBeNull()
    expect(getActionCenterApprovedRouteDefault(null)).toBeNull()
  })

  it('returns route defaults that are safe against caller mutation', () => {
    const exitDefaults = getActionCenterApprovedRouteDefault('exit')

    expect(exitDefaults).not.toBeNull()

    expect(() => {
      ;(exitDefaults as { reviewWindowDays: { min: number } }).reviewWindowDays.min = 999
    }).toThrow()

    expect(getActionCenterApprovedRouteDefault('exit')).toEqual({
      scanType: 'exit',
      cadenceDays: 14,
      reminderLeadDays: 3,
      escalationLeadDays: 7,
      reviewWindowDays: { min: 60, max: 90 },
      staleAfterDays: 90,
    })
  })

  it('keeps bounded transition truth for route close, route reopen, review reschedule, and draft promotion', () => {
    expect(ACTION_CENTER_TRANSITION_RULES).toEqual([
      {
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
        actors: ['hr_rhythm_owner'],
      },
      {
        object: 'follow_through_route',
        fromState: 'closed',
        toState: 'reopened',
        actors: ['hr_rhythm_owner'],
      },
      {
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
        actors: ['hr_rhythm_owner'],
      },
      {
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        actors: ['hr_rhythm_owner'],
        draftValidationDisposition: 'valid',
      },
    ])
  })

  it('keeps bounded action lifecycle transition truth explicit', () => {
    expect(ACTION_CENTER_ACTION_TRANSITION_RULES).toEqual([
      {
        fromState: 'draft',
        toState: 'active',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
      {
        fromState: 'active',
        toState: 'review_due',
        actors: ['system_channel'],
      },
      {
        fromState: 'review_due',
        toState: 'in_review',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
      {
        fromState: 'in_review',
        toState: 'active',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
      {
        fromState: 'in_review',
        toState: 'completed',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
      {
        fromState: 'in_review',
        toState: 'stopped',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
      {
        fromState: 'blocked',
        toState: 'in_review',
        actors: ['manager_participant', 'hr_rhythm_owner'],
      },
    ])
  })

  it('exports transition rules that are safe against object mutation', () => {
    const closeRule = ACTION_CENTER_TRANSITION_RULES[0]

    expect(() => {
      ;(closeRule as { toState: string }).toState = 'reopened'
    }).toThrow()

    expect(() => {
      ;(closeRule.actors as string[]).push('manager_participant')
    }).toThrow()

    expect(ACTION_CENTER_TRANSITION_RULES[0]).toEqual({
      object: 'follow_through_route',
      fromState: 'open',
      toState: 'closed',
      actors: ['hr_rhythm_owner'],
    })
  })

  it('blocks manager route close transitions', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'manager_participant',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }),
    ).toBe(false)
  })

  it('allows hr closeout and reopen transitions', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'follow_through_route',
        fromState: 'open',
        toState: 'closed',
      }),
    ).toBe(true)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'follow_through_route',
        fromState: 'closed',
        toState: 'reopened',
      }),
    ).toBe(true)
  })

  it('allows hr review reschedule transitions and blocks manager access', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }),
    ).toBe(true)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'manager_participant',
        object: 'review_moment',
        fromState: 'scheduled',
        toState: 'rescheduled',
      }),
    ).toBe(false)
  })

  it('allows only hr to promote route actions from draft to active', () => {
    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'valid',
      }),
    ).toBe(true)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'manager_participant',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'valid',
      }),
    ).toBe(false)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'invalid',
      }),
    ).toBe(false)

    expect(
      isActionCenterCanonicalRouteStateTransitionAllowed({
        actor: 'hr_rhythm_owner',
        object: 'route_action',
        fromState: 'draft',
        toState: 'active',
        draftValidationDisposition: 'needs_hr_review',
      }),
    ).toBe(false)
  })

  it('does not allow draft to jump straight to completed', () => {
    expect(
      isActionCenterActionStateTransitionAllowed({
        actor: 'manager_participant',
        fromState: 'draft',
        toState: 'completed',
      }),
    ).toBe(false)
  })

  it('allows in_review to active for no-progress review outcomes', () => {
    expect(
      isActionCenterActionStateTransitionAllowed({
        actor: 'manager_participant',
        fromState: 'in_review',
        toState: 'active',
      }),
    ).toBe(true)
  })

  it('does not allow blocked to completed without review', () => {
    expect(
      isActionCenterActionStateTransitionAllowed({
        actor: 'manager_participant',
        fromState: 'blocked',
        toState: 'completed',
      }),
    ).toBe(false)
  })

  it('maps review outcomes back to canonical action lifecycle states', () => {
    expect(resolveActionCenterActionReviewTransition('effect-zichtbaar')).toBe('completed')
    expect(resolveActionCenterActionReviewTransition('bijsturen-nodig')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('nog-te-vroeg')).toBe('active')
    expect(resolveActionCenterActionReviewTransition('stoppen')).toBe('stopped')
  })
})
