import { describe, expect, it } from 'vitest'

import {
  ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS,
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

  it('keeps every metric readiness-only rather than claiming adoption proof', () => {
    expect(ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS).toHaveLength(10)

    for (const metric of ACTION_CENTER_ADOPTION_METRIC_DEFINITIONS) {
      expect(metric.provesAdoption).toBe(false)
      expect(metric.readinessOnly).toBe(true)
      expect(metric.whatItDoesNotProve.length).toBeGreaterThan(0)
    }
  })
})
