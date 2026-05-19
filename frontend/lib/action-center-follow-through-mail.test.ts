import { describe, expect, it } from 'vitest'

import {
  ACTION_CENTER_FOLLOW_THROUGH_MAIL_LEDGER_SCAN_TYPES,
  ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES,
  type ActionCenterFollowThroughMailLedgerRecord,
  buildActionCenterFollowThroughMailDedupeKey,
  getActionCenterFollowThroughMailSuppressionReason,
} from './action-center-follow-through-mail'

describe('action center follow-through mail contract', () => {
  it('exposes the bounded phase-1 trigger families only', () => {
    expect(ACTION_CENTER_FOLLOW_THROUGH_TRIGGER_TYPES).toEqual([
      'assignment_created',
      'review_upcoming',
      'review_overdue',
      'follow_up_open_after_review',
    ])
    expect(ACTION_CENTER_FOLLOW_THROUGH_MAIL_LEDGER_SCAN_TYPES).toEqual(['exit', 'retention'])
  })

  it('builds a stable dedupe key from route, trigger family, recipient, and canonical source marker', () => {
    expect(
      buildActionCenterFollowThroughMailDedupeKey({
        routeId: 'camp-1::org::sales',
        triggerType: 'review_upcoming',
        recipientEmail: 'manager@example.com',
        sourceMarker: '2026-05-20',
      }),
    ).toBe('camp-1::org::sales::review_upcoming::manager@example.com::2026-05-20')
  })

  it('suppresses review-upcoming reminders when reminders are disabled', () => {
    expect(
      getActionCenterFollowThroughMailSuppressionReason({
        triggerType: 'review_upcoming',
        remindersEnabled: false,
        routeStatus: 'reviewbaar',
        reviewCompletedAt: null,
        reviewScheduledFor: '2026-05-20',
        reviewOutcome: 'geen-uitkomst',
      }),
    ).toBe('reminders-disabled')
  })

  it('suppresses follow-up-open-after-review when the route is already closed or resolved', () => {
    expect(
      getActionCenterFollowThroughMailSuppressionReason({
        triggerType: 'follow_up_open_after_review',
        remindersEnabled: true,
        routeStatus: 'afgerond',
        reviewCompletedAt: '2026-05-10T12:00:00.000Z',
        reviewScheduledFor: '2026-05-09',
        reviewOutcome: 'afronden',
        hasFollowUpTarget: true,
      }),
    ).toBe('route-resolved')
  })

  it('accepts retention as a bounded ledger scan type for follow-through delivery records', () => {
    const record: ActionCenterFollowThroughMailLedgerRecord = {
      orgId: 'org-1',
      routeId: 'camp-1::org::sales',
      routeScopeValue: 'org::sales',
      routeSourceId: 'camp-1',
      scanType: 'retention',
      triggerType: 'review_upcoming',
      recipientRole: 'manager',
      recipientEmail: 'manager@example.com',
      sourceMarker: '2026-05-20',
      dedupeKey: 'dedupe',
      deliveryStatus: 'sent',
      suppressionReason: null,
      providerMessageId: 'msg-1',
      sentAt: '2026-05-20T08:00:00.000Z',
    }

    expect(record.scanType).toBe('retention')
  })
})
