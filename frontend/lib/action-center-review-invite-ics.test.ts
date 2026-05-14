import { describe, expect, it } from 'vitest'
import {
  buildActionCenterReviewInviteDraft,
  type ActionCenterReviewInviteContext,
} from '@/lib/action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from '@/lib/action-center-review-invite-ics'

describe('action center review invite ics', () => {
  const draft = buildActionCenterReviewInviteDraft({
    actionCenterOrigin: 'https://app.verisight.nl',
    campaignId: 'campaign-exit-q2',
    campaignName: 'ExitScan Q2',
    managerEmail: 'manager@example.com',
    managerName: 'M. Manager',
    phase: 1,
    reviewDate: '2026-05-20',
    reviewItemId: 'review-item-42',
    routeId: 'route-42',
    routeStatus: 'reviewbaar',
    scanType: 'exit',
    scopeLabel: 'Operations',
  } satisfies ActionCenterReviewInviteContext)

  it('renders a REQUEST invite as an all-day local review event for date-only review dates', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'REQUEST',
      revision: 2,
      organizerEmail: 'noreply@verisight.nl',
    })

    expect(ics).toContain('METHOD:REQUEST')
    expect(ics).toContain('UID:ac-review-route-42@verisight.nl')
    expect(ics).toContain('SEQUENCE:2')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260520')
    expect(ics).toContain('DTEND;VALUE=DATE:20260521')
    expect(ics).toContain('ORGANIZER:mailto:noreply@verisight.nl')
    expect(ics).toContain('ATTENDEE;CN=M. Manager:mailto:manager@example.com')
    expect(ics).toContain(`DESCRIPTION:Open dit reviewmoment in Action Center: ${draft.actionCenterHref}`)
    expect(ics).toContain(`URL:${draft.actionCenterHref}`)
    expect(ics).toContain('STATUS:CONFIRMED')
    expect(ics).toContain('\r\n')
  })

  it('renders a CANCEL invite with the same UID and a higher sequence', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'CANCEL',
      revision: 3,
      organizerEmail: 'noreply@verisight.nl',
    })

    expect(ics).toContain('METHOD:CANCEL')
    expect(ics).toContain('STATUS:CANCELLED')
    expect(ics).toContain('SEQUENCE:3')
    expect(ics).toContain('UID:ac-review-route-42@verisight.nl')
  })
})
