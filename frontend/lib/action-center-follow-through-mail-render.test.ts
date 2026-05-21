import { describe, expect, it } from 'vitest'
import { renderActionCenterFollowThroughMail } from './action-center-follow-through-mail-render'

describe('action center follow-through mail render', () => {
  it('renders a bounded review-upcoming mail with contextual deeplink and invite artifact link', () => {
    const rendered = renderActionCenterFollowThroughMail({
      triggerType: 'review_upcoming',
      recipientRole: 'manager',
      campaignName: 'ExitScan Q2',
      scopeLabel: 'Sales',
      actionCenterHref: 'https://app.verisight.nl/dashboard/action-center?focus=review-1&view=reviews&source=notification',
      inviteArtifactHref: 'https://app.verisight.nl/api/action-center-review-invites?reviewItemId=review-1&format=ics',
    })

    expect(rendered.subject).toContain('Reviewmoment')
    expect(rendered.emailText).toContain('Action Center')
    expect(rendered.emailText).toContain('https://app.verisight.nl/dashboard/action-center')
    expect(rendered.emailHtml).toContain('format=ics')
  })

  it('does not instruct recipients to confirm or reschedule by email', () => {
    const rendered = renderActionCenterFollowThroughMail({
      triggerType: 'review_overdue',
      recipientRole: 'manager',
      campaignName: 'ExitScan Q2',
      scopeLabel: 'Sales',
      actionCenterHref: 'https://app.verisight.nl/dashboard/action-center?focus=review-1&view=reviews&source=notification',
    })

    expect(rendered.emailText).not.toMatch(/reply|beantwoord|mail terug|reschedule|verplaats/i)
  })
})
