import { describe, expect, it } from 'vitest'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import type { ActionCenterPreviewStatus } from '@/lib/action-center-preview-model'
import type { ScanType } from '@/lib/types'
import {
  actionCenterBaseUrl,
  buildActionCenterReviewInviteDraft,
  getActionCenterReviewInviteEligibility,
  type ActionCenterReviewInviteContext,
} from '@/lib/action-center-review-invite'

describe('action center review invite draft contract', () => {
  const baseContext: ActionCenterReviewInviteContext = {
    actionCenterOrigin: 'https://app.verisight.nl',
    campaignId: 'campaign-exit-q2',
    campaignName: 'ExitScan Q2',
    managerEmail: 'manager@example.com',
    managerName: 'M. Manager',
    phase: 1,
    reviewDate: '2026-05-20',
    reviewItemId: 'review-item-42',
    routeId: 'route-42',
    routeStatus: 'in-uitvoering',
    scanType: 'exit',
    scopeLabel: 'Operations',
  }

  it('reports an eligible ExitScan review invite context', () => {
    expect(getActionCenterReviewInviteEligibility(baseContext)).toEqual({
      ok: true,
      reason: null,
    })
  })

  it('reports an eligible RetentieScan review invite context in the bounded parity slice', () => {
    expect(
      getActionCenterReviewInviteEligibility({
        ...baseContext,
        scanType: 'retention',
        campaignId: 'campaign-retention-q2',
        campaignName: 'RetentieScan Q2',
      }),
    ).toEqual({
      ok: true,
      reason: null,
    })
  })

  it('accepts a reviewbaar preview status from the Action Center caller path', () => {
    expect(
      getActionCenterReviewInviteEligibility({
        ...baseContext,
        routeStatus: 'reviewbaar',
      }),
    ).toEqual({
      ok: true,
      reason: null,
    })
  })

  it('builds a bounded email-ics organizer draft with an absolute Action Center link', () => {
    const draft = buildActionCenterReviewInviteDraft(baseContext)

    expect(draft).toEqual({
      reviewItemId: 'review-item-42',
      routeId: 'route-42',
      campaignId: 'campaign-exit-q2',
      recipientEmail: 'manager@example.com',
      recipientName: 'M. Manager',
      subject: 'Reviewmoment ExitScan Q2 / Operations',
      actionCenterHref: `${actionCenterBaseUrl('https://app.verisight.nl')}${buildActionCenterEntryHref({
        focus: 'review-item-42',
        view: 'reviews',
        source: 'notification',
      })}`,
      reviewDate: '2026-05-20',
      deliveryModel: {
        channel: 'email-ics',
        organizerMode: 'organizer',
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
    })

    expect(draft.emailText).toContain(draft.actionCenterHref)
    expect(draft.emailHtml).toContain(draft.actionCenterHref)
    expect(draft.emailHtml).toContain('href=')
  })

  it.each([
    {
      name: 'unsupported scan type outside the enabled parity routes',
      override: { scanType: 'pulse' as ScanType },
      reason: 'unsupported-scan-type',
    },
    {
      name: 'non-phase-1 ExitScan',
      override: { phase: 2 },
      reason: 'unsupported-scan-type',
    },
    {
      name: 'missing review date',
      override: { reviewDate: null },
      reason: 'missing-review-date',
    },
    {
      name: 'blank review date',
      override: { reviewDate: '   ' },
      reason: 'missing-review-date',
    },
    {
      name: 'non-iso review date',
      override: { reviewDate: '2026/05/20' },
      reason: 'missing-review-date',
    },
    {
      name: 'invalid iso review date',
      override: { reviewDate: '2026-02-30' },
      reason: 'missing-review-date',
    },
    {
      name: 'missing manager email',
      override: { managerEmail: '   ' },
      reason: 'missing-manager-email',
    },
    {
      name: 'closed route for afgerond',
      override: { routeStatus: 'afgerond' as ActionCenterPreviewStatus },
      reason: 'closed-route',
    },
    {
      name: 'closed route for gestopt',
      override: { routeStatus: 'gestopt' as ActionCenterPreviewStatus },
      reason: 'closed-route',
    },
    {
      name: 'closed route with whitespace and casing drift',
      override: { routeStatus: ' Afgerond ' as unknown as ActionCenterPreviewStatus },
      reason: 'closed-route',
    },
  ])('returns $reason for $name', ({ override, reason }) => {
    expect(
      getActionCenterReviewInviteEligibility({
        ...baseContext,
        ...override,
      }),
    ).toEqual({
      ok: false,
      reason,
    })
  })

  it('throws when building a draft for an ineligible context', () => {
    expect(() =>
      buildActionCenterReviewInviteDraft({
        ...baseContext,
        reviewDate: 'not-a-date',
      }),
    ).toThrow('missing-review-date')
  })

  it('throws when building a draft with a blank review item id to avoid an unfocused Action Center link', () => {
    expect(getActionCenterReviewInviteEligibility(baseContext)).toEqual({
      ok: true,
      reason: null,
    })

    expect(() =>
      buildActionCenterReviewInviteDraft({
        ...baseContext,
        reviewItemId: '   ',
      }),
    ).toThrow('reviewItemId')
  })

  it('normalizes the Action Center origin before composing the absolute URL', () => {
    expect(actionCenterBaseUrl(' https://app.verisight.nl/path/// ')).toBe('https://app.verisight.nl')
  })
})
