import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActionCenterMeasurementReadback } from './action-center-measurement-readback'
import { buildActionCenterMeasurementReadback } from '@/lib/action-center-measurement-readback'
import type { ActionCenterGovernanceQueue } from '@/lib/action-center-governance-queues'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

function makeMeasurementReadbackFixture() {
  const items = [
    {
      id: 'route-exit-1',
      sourceLabel: 'ExitScan',
      teamLabel: 'Operations',
      status: 'reviewbaar',
      reviewDate: '2026-05-10',
      coreSemantics: {
        route: {
          routeId: 'route-exit-1',
          campaignId: 'cmp-1',
          routeOpenedAt: '2026-05-01T09:00:00.000Z',
        },
        routeActionCards: [
          {
            actionId: 'action-1',
            status: 'open',
            reviewScheduledFor: '2026-05-20',
            latestReview: null,
          },
        ],
        routeCloseout: {
          readyForCloseout: false,
        },
      },
    },
  ] as unknown as ActionCenterPreviewItem[]

  const governanceQueue: ActionCenterGovernanceQueue = {
    items: [
      {
        routeId: 'route-exit-1',
        routeFamily: 'exit',
        sourceLabel: 'ExitScan',
        scopeLabel: 'Operations',
        managerOwner: 'Manager Operations',
        primarySignal: 'action_review_due',
        secondarySignals: [],
        severity: 'medium',
        whyInQueue: 'De bounded actiereview is verlopen.',
        expectedHrAction: 'Vraag om bounded review.',
        recommendation: 'Review overdue',
        timeInQueueDays: 3,
      },
    ],
    suppressedItems: [],
  }

  return buildActionCenterMeasurementReadback({
    items,
    governanceQueue,
    routeScanTypeByRouteId: {
      'route-exit-1': 'exit',
    },
  })
}

describe('action center measurement readback', () => {
  it('renders buyer-safe readback without proof copy', () => {
    const markup = renderToStaticMarkup(
      <ActionCenterMeasurementReadback readback={makeMeasurementReadbackFixture()} />,
    )

    expect(markup).toContain('Bounded execution active')
    expect(markup).toContain('Review overdue')
    expect(markup).not.toContain('Impact achieved')
    expect(markup).not.toContain('intervention success')
  })
})
