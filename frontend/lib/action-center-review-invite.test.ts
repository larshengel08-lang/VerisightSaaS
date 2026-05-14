import { describe, expect, it } from 'vitest'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import {
  actionCenterBaseUrl,
  buildActionCenterReviewInviteDraft,
} from '@/lib/action-center-review-invite'

describe('action center review invite draft contract', () => {
  const baseInput = {
    actionCenterOrigin: 'https://app.verisight.nl',
    campaignId: 'campaign-exit-q2',
    campaignName: 'ExitScan Q2',
    managerEmail: 'manager@example.com',
    phase: 1,
    reviewDate: '2026-05-20',
    reviewItemId: 'review-item-42',
    routeStatus: 'in-uitvoering' as const,
    scanType: 'exit' as const,
    scopeLabel: 'Operations',
  }

  it('builds a bounded email-ics organizer draft with an absolute Action Center link', () => {
    const result = buildActionCenterReviewInviteDraft(baseInput)

    expect(result).toEqual({
      eligible: true,
      draft: {
        campaignId: 'campaign-exit-q2',
        reviewItemId: 'review-item-42',
        reviewDate: '2026-05-20',
        managerEmail: 'manager@example.com',
        subject: 'Reviewmoment ExitScan Q2 / Operations',
        actionCenterUrl: `${actionCenterBaseUrl('https://app.verisight.nl')}${buildActionCenterEntryHref({
          focus: 'review-item-42',
          view: 'reviews',
          source: 'notification',
        })}`,
        deliveryModel: {
          channel: 'email-ics',
          mode: 'organizer',
          nativeMicrosoftRequired: false,
        },
        writePolicy: {
          calendarRsvp: 'hint-only',
          canonicalReviewState: 'action-center-only',
        },
        emailText: expect.stringContaining(
          'Leg reviewuitkomst en vervolg alleen in Action Center vast.',
        ),
        emailHtml: expect.stringContaining(
          'Leg reviewuitkomst en vervolg alleen in Action Center vast.',
        ),
      },
    })

    if (result.eligible) {
      expect(result.draft.emailText).toContain(result.draft.actionCenterUrl)
      expect(result.draft.emailHtml).toContain(result.draft.actionCenterUrl)
      expect(result.draft.emailHtml).toContain('href=')
    }
  })

  it.each([
    {
      name: 'unsupported scan type outside ExitScan phase 1',
      override: { scanType: 'retention' as const },
      reason: 'unsupported-scan-type',
    },
    {
      name: 'missing review date',
      override: { reviewDate: null },
      reason: 'missing-review-date',
    },
    {
      name: 'missing manager email',
      override: { managerEmail: '   ' },
      reason: 'missing-manager-email',
    },
    {
      name: 'closed route for afgerond',
      override: { routeStatus: 'afgerond' as const },
      reason: 'closed-route',
    },
    {
      name: 'closed route for gestopt',
      override: { routeStatus: 'gestopt' as const },
      reason: 'closed-route',
    },
    {
      name: 'non-phase-1 ExitScan',
      override: { phase: 2 },
      reason: 'unsupported-scan-type',
    },
  ])('returns $reason for $name', ({ override, reason }) => {
    expect(
      buildActionCenterReviewInviteDraft({
        ...baseInput,
        ...override,
      }),
    ).toEqual({
      eligible: false,
      reason,
    })
  })

  it('normalizes the Action Center origin before composing the absolute URL', () => {
    expect(actionCenterBaseUrl('https://app.verisight.nl///')).toBe('https://app.verisight.nl')
  })
})
