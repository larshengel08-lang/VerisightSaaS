import { describe, expect, it } from 'vitest'
import {
  getActionCenterOpsEventLabel,
  summarizeActionCenterOpsHealth,
} from './action-center-ops-health'
import type { SuiteTelemetryEventRow } from '@/lib/telemetry/events'

describe('action center ops health', () => {
  it('summarizes critical action center telemetry evidence for pilot operations', () => {
    const rows: SuiteTelemetryEventRow[] = [
      {
        id: 'evt-1',
        eventType: 'action_center_route_opened',
        orgId: 'org-1',
        campaignId: 'cmp-1',
        actorId: 'user-1',
        payload: {},
        createdAt: '2026-05-02T09:00:00.000Z',
      },
      {
        id: 'evt-2',
        eventType: 'action_center_owner_assigned',
        orgId: 'org-1',
        campaignId: 'cmp-1',
        actorId: 'user-1',
        payload: {},
        createdAt: '2026-05-02T09:05:00.000Z',
      },
      {
        id: 'evt-3',
        eventType: 'action_center_review_scheduled',
        orgId: 'org-1',
        campaignId: 'cmp-1',
        actorId: 'user-2',
        payload: {},
        createdAt: '2026-05-02T09:10:00.000Z',
      },
    ]

    expect(summarizeActionCenterOpsHealth(rows)).toEqual({
      totalEventCount: 3,
      latestEventAt: '2026-05-02T09:10:00.000Z',
      coveredEventTypes: [
        'action_center_route_opened',
        'action_center_owner_assigned',
        'action_center_review_scheduled',
      ],
      missingEventTypes: ['action_center_closeout_recorded'],
      routeOpenedCount: 1,
      ownerAssignedCount: 1,
      reviewScheduledCount: 1,
      closeoutRecordedCount: 0,
    })
  })

  it('returns stable Dutch labels for critical action center ops events', () => {
    expect(getActionCenterOpsEventLabel('action_center_closeout_recorded')).toBe('Closeout vastgelegd')
  })
})
