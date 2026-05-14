import { describe, expect, it } from 'vitest'
import {
  buildActionCenterReviewInviteDraft,
  type ActionCenterReviewInviteContext,
} from '@/lib/action-center-review-invite'
import { renderActionCenterReviewInviteIcs } from '@/lib/action-center-review-invite-ics'

describe('action center review invite ics', () => {
  function unfoldIcs(value: string) {
    return value.replace(/\r\n /g, '')
  }

  function buildDraft(overrides: Partial<ActionCenterReviewInviteContext> = {}) {
    return buildActionCenterReviewInviteDraft({
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
      ...overrides,
    } satisfies ActionCenterReviewInviteContext)
  }

  const draft = buildDraft()

  it('renders a REQUEST invite as an all-day local review event for date-only review dates', () => {
    const ics = renderActionCenterReviewInviteIcs({
      draft,
      method: 'REQUEST',
      revision: 2,
      organizerEmail: 'noreply@verisight.nl',
    })
    const unfolded = unfoldIcs(ics)

    expect(unfolded).toContain('METHOD:REQUEST')
    expect(unfolded).toContain('UID:ac-review-route-42@verisight.nl')
    expect(unfolded).toContain('SEQUENCE:2')
    expect(unfolded).toContain('DTSTART;VALUE=DATE:20260520')
    expect(unfolded).toContain('DTEND;VALUE=DATE:20260521')
    expect(unfolded).toContain('ORGANIZER:mailto:noreply@verisight.nl')
    expect(unfolded).toContain('ATTENDEE;CN="M. Manager":mailto:manager@example.com')
    expect(unfolded).toContain(`DESCRIPTION:Open dit reviewmoment in Action Center: ${draft.actionCenterHref}`)
    expect(unfolded).toContain(`URL:${draft.actionCenterHref}`)
    expect(unfolded).toContain('STATUS:CONFIRMED')
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

  it('quotes and escapes ATTENDEE CN as an ICS parameter value', () => {
    const unfolded = unfoldIcs(renderActionCenterReviewInviteIcs({
      draft: buildDraft({
        managerName: 'Mila, Ops; Lead: "North"',
      }),
      method: 'REQUEST',
      revision: 4,
      organizerEmail: 'noreply@verisight.nl',
    }))

    expect(unfolded).toContain(
      'ATTENDEE;CN="Mila, Ops; Lead: ^\'North^\'":mailto:manager@example.com',
    )
  })

  it('folds long content lines using CRLF continuation whitespace', () => {
    const longDraft = buildDraft({
      reviewItemId: `review-item-${'x'.repeat(180)}`,
    })
    const ics = renderActionCenterReviewInviteIcs({
      draft: longDraft,
      method: 'REQUEST',
      revision: 5,
      organizerEmail: 'noreply@verisight.nl',
    })
    const lines = ics.split('\r\n')
    const urlLineIndex = lines.findIndex((line) => line.startsWith('URL:'))

    expect(urlLineIndex).toBeGreaterThan(-1)
    expect(lines[urlLineIndex + 1]?.startsWith(' ')).toBe(true)
    expect(ics).not.toContain(`URL:${longDraft.actionCenterHref}\r\nDTSTART`)
  })
})
