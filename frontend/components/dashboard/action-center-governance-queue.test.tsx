import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterGovernanceQueue } from './action-center-governance-queue'

describe('action center governance queue', () => {
  it('renders unified queue items with why-in-queue copy', () => {
    const markup = renderToStaticMarkup(
      <ActionCenterGovernanceQueue
        queue={{
          items: [
            {
              routeId: 'route-1',
              routeFamily: 'retention',
              sourceLabel: 'RetentieScan',
              scopeLabel: 'Support',
              managerOwner: 'Manager Support',
              primarySignal: 'HR_review_required',
              secondarySignals: ['blocked_action'],
              severity: 'high',
              whyInQueue: 'Deze route vraagt nu expliciete HR review.',
              expectedHrAction: 'HR review needed before the route can continue calmly.',
              recommendation: 'HR review needed',
              timeInQueueDays: 4,
            },
          ],
          suppressedItems: [],
        }}
      />,
    )

    expect(markup).toContain('Waarom nu in de queue')
    expect(markup).toContain('HR review needed')
    expect(markup).toContain('Support')
    expect(markup).not.toContain('workflow')
    expect(markup).not.toContain('task board')
  })
})
