import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_CANONICAL_REVIEW_STATES,
  ACTION_CENTER_CANONICAL_ROUTE_STATES,
  ACTION_CENTER_TRANSITION_RULES,
  getActionCenterApprovedRouteDefault,
  isActionCenterCanonicalRouteStateTransitionAllowed,
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
  })

  it('exposes only exit and retention as approved route defaults', () => {
    expect(getActionCenterApprovedRouteDefault('exit')).toEqual({
      scanType: 'exit',
      reviewWindowDays: { min: 60, max: 90 },
      staleAfterDays: 90,
    })
    expect(getActionCenterApprovedRouteDefault('retention')).toEqual({
      scanType: 'retention',
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
      reviewWindowDays: { min: 60, max: 90 },
      staleAfterDays: 90,
    })
  })

  it('keeps bounded transition truth for manager-blocked close and hr reopen allowance', () => {
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
})
