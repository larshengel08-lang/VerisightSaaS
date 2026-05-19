import { describe, expect, it } from 'vitest'

import {
  ACTION_CENTER_ADOPTION_EVENT_DEFINITIONS,
  ACTION_CENTER_ADOPTION_EVENT_NAMES,
  ACTION_CENTER_ADOPTION_METRIC_NAMES,
  ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS,
  getActionCenterAdoptionEventDefinition,
  getActionCenterAdoptionMetricDefinition,
} from './action-center-adoption-metrics'
import { ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE } from './action-center-entry'
import { ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE } from './action-center-follow-through-mail'
import { ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE } from './action-center-review-reschedule'

describe('action center adoption measurement readiness', () => {
  it('defines metric formulas and event anchors for manager trigger open rate', () => {
    expect(getActionCenterAdoptionMetricDefinition('manager_trigger_open_rate')).toMatchObject({
      eventSource: ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
      objectAnchor: 'follow_through_route',
      formula: 'unique_manager_contextual_entry_opens / unique_manager_trigger_deliveries',
      eventAnchors: [
        ACTION_CENTER_FOLLOW_THROUGH_MAIL_ADOPTION_EVENT_SOURCE,
        ACTION_CENTER_ENTRY_ADOPTION_EVENT_SOURCE,
      ],
      provesAdoption: false,
      readinessOnly: true,
    })
  })

  it('anchors review reschedule rate to the bounded canonical reschedule surface', () => {
    expect(getActionCenterAdoptionMetricDefinition('reschedule_rate')).toMatchObject({
      eventSource: ACTION_CENTER_REVIEW_RESCHEDULE_ADOPTION_EVENT_SOURCE,
      objectAnchor: 'review_moment',
      formula: 'canonically_rescheduled_reviews / scheduled_reviews_in_measurement_window',
      provesAdoption: false,
      readinessOnly: true,
    })
  })

  it('keeps an exhaustive bounded event-definition contract including the allowed review completion actors', () => {
    expect(ACTION_CENTER_ADOPTION_EVENT_NAMES).toEqual([
      'manager_trigger_delivered',
      'manager_contextual_entry_opened',
      'manager_quick_action_completed',
      'review_completed',
      'review_rescheduled',
      'route_became_stale',
      'route_became_overdue',
      'route_became_escalation_sensitive',
      'route_closed',
      'route_reopened',
      'hr_manual_chase_logged',
    ])

    expect(ACTION_CENTER_ADOPTION_EVENT_DEFINITIONS).toHaveLength(
      ACTION_CENTER_ADOPTION_EVENT_NAMES.length,
    )

    for (const eventDefinition of ACTION_CENTER_ADOPTION_EVENT_DEFINITIONS) {
      expect(getActionCenterAdoptionEventDefinition(eventDefinition.name)).toEqual(eventDefinition)
      expect(eventDefinition.readinessOnly).toBe(true)
      expect(eventDefinition.provesAdoption).toBe(false)
      expect(eventDefinition.actorRoles.length).toBeGreaterThan(0)
      expect(eventDefinition.metadataPolicy).toBe('empty_object_only')

      if (eventDefinition.objectAnchor === 'review_moment') {
        expect(eventDefinition.requiresReviewItemId).toBe(true)
      } else {
        expect(eventDefinition.requiresReviewItemId).toBe(false)
      }
    }

    expect(getActionCenterAdoptionEventDefinition('review_completed')).toMatchObject({
      eventSource: 'review_transition',
      objectAnchor: 'review_moment',
      actorRoles: ['hr_rhythm_owner', 'manager_participant'],
      requiresReviewItemId: true,
    })
  })

  it('keeps an exhaustive bounded metric-definition contract and does not claim adoption proof', () => {
    expect(ACTION_CENTER_ADOPTION_METRIC_NAMES).toEqual([
      'manager_trigger_open_rate',
      'manager_quick_action_completion_rate',
      'review_completion_rate',
      'reschedule_rate',
      'stale_route_rate',
      'overdue_route_rate',
      'escalation_sensitive_route_rate',
      'closeout_discipline_rate',
      'reopen_rate',
      'HR_chasing_reduction_proxy',
    ])

    expect(ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS).toHaveLength(
      ACTION_CENTER_ADOPTION_METRIC_NAMES.length,
    )

    for (const metric of ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS) {
      expect(getActionCenterAdoptionMetricDefinition(metric.name)).toEqual(metric)
      expect(metric.provesAdoption).toBe(false)
      expect(metric.readinessOnly).toBe(true)
      expect(metric.whatItDoesNotProve.length).toBeGreaterThan(0)
      expect(metric.eventAnchors.length).toBeGreaterThan(0)
    }
  })
})
