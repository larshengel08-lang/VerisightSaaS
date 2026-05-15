import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ReviewMomentDetailPanel } from './review-moment-detail-panel'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

const { mockRefresh } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

function createReviewMomentItem(overrides: Partial<ActionCenterPreviewItem> = {}) {
  return {
    id: 'cmp-exit-1::org-1::department::operations',
    code: 'AC-1',
    title: 'Begrens verloop in operations',
    summary: 'Compacte route',
    reason: 'Lees terug',
    sourceLabel: 'ExitScan',
    orgId: 'org-1',
    scopeType: 'department',
    teamId: 'operations',
    teamLabel: 'Operations',
    ownerId: 'manager-1',
    ownerName: 'Mila Jansen',
    ownerRole: 'Manager',
    ownerSubtitle: 'Operations',
    reviewOwnerName: 'Mila Jansen',
    priority: 'hoog',
    status: 'reviewbaar',
    reviewDate: '2026-05-28',
    expectedEffect: null,
    reviewReason: 'Toets effect',
    reviewOutcome: 'geen-uitkomst',
    reviewDateLabel: '28 mei',
    reviewRhythm: 'Tweewekelijks',
    signalLabel: 'Open review',
    signalBody: 'Open review',
    nextStep: 'Open review',
    peopleCount: 12,
    coreSemantics: {
      route: {
        routeId: 'cmp-exit-1::org-1::department::operations',
        campaignId: 'cmp-exit-1',
      },
    },
    openSignals: [],
    updates: [],
    ...overrides,
  } as ActionCenterPreviewItem
}

describe('review moment detail panel entry links', () => {
  it('uses the shared Action Center entry helper for focused review landing', () => {
    const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildActionCenterEntryHref')
    expect(source).toContain("view: 'reviews'")
    expect(source).toContain("source: 'review-moments'")
    expect(source).not.toContain('href={`/action-center?focus=${encodeURIComponent(item.id)}`}')
  })

  it('renders the shared contextual review href and preserves a date-only review date as a local calendar day', () => {
    const item = {
      id: 'route-review-1',
      code: 'ACT-1001',
      title: 'Reviewmoment voor Operations',
      summary: 'Samenvatting',
      reason: 'Reden',
      sourceLabel: 'ExitScan',
      scopeType: 'department',
      teamId: 'team-operations',
      teamLabel: 'Operations',
      ownerId: 'manager-1',
      ownerName: 'Manager Operations',
      ownerRole: 'Manager',
      ownerSubtitle: 'Operations',
      reviewOwnerName: 'HR lead',
      priority: 'hoog',
      status: 'reviewbaar',
      reviewDate: '2026-05-12',
      expectedEffect: null,
      reviewReason: 'Controleer de voortgang van de opvolging.',
      reviewOutcome: 'geen-uitkomst',
      reviewDateLabel: '12 mei 2026',
      reviewRhythm: 'Maandelijks',
      signalLabel: 'Signaal',
      signalBody: 'Signaaltekst',
      nextStep: 'Plan de review.',
      peopleCount: 12,
      coreSemantics: {
        route: {
          routeId: 'route-operations',
        },
      },
      openSignals: ['signal-1', 'signal-2'],
      updates: [],
    } as ActionCenterPreviewItem
    const expectedHref = buildActionCenterEntryHref({
      focus: item.id,
      view: 'reviews',
      source: 'review-moments',
    }).replaceAll('&', '&amp;')

    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        item,
        urgency: 'this-week',
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).toContain(`href="${expectedHref}"`)
    expect(markup).toContain('12 mei 2026')
  })
})

describe('review moment detail panel invite CTA', () => {
  it('keeps the invite CTA bounded to the review-invite route', () => {
    const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

    expect(source).toContain('buildReviewInviteDownloadHref')
    expect(source).toContain('/api/action-center-review-invites?reviewItemId=')
    expect(source).toContain('canDownloadInviteArtifact')
    expect(source).toContain("item.status !== 'afgerond'")
    expect(source).toContain("item.status !== 'gestopt'")
    expect(source).toContain('Download .ics')
    expect(source).not.toContain('Verstuur uitnodiging')
  })

  it('renders the exact ics href when the review is open, dated, and allowed', () => {
    const item = createReviewMomentItem()
    const expectedHref =
      '/api/action-center-review-invites?reviewItemId=cmp-exit-1%3A%3Aorg-1%3A%3Adepartment%3A%3Aoperations&amp;mode=request&amp;format=ics'

    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item,
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).toContain(`href="${expectedHref}"`)
    expect(markup).toContain('Download .ics')
  })

  it('hides the ics link when a review date is missing', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem({
          reviewDate: null,
        }),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).not.toContain('Download .ics')
  })

  it('hides the ics link for closed review statuses', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'completed',
        item: createReviewMomentItem({
          status: 'afgerond',
        }),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).not.toContain('Download .ics')
  })

  it('hides the ics link when invite artifact access is denied', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem(),
        canDownloadInviteArtifact: false,
        canScheduleReviewControls: false,
      }),
    )

    expect(markup).not.toContain('Download .ics')
  })
})

describe('review moment detail panel reschedule controls', () => {
  it('keeps reschedule controls bounded to the existing review detail surface', () => {
    const source = readFileSync(new URL('./review-moment-detail-panel.tsx', import.meta.url), 'utf8')

    expect(source).toContain('Verplaats review')
    expect(source).toContain('Annuleer review')
    expect(source).toContain("item.sourceLabel === 'ExitScan'")
    expect(source).toContain('canScheduleReviewControls')
    expect(source).toContain('/api/action-center-review-reschedules')
    expect(source).not.toContain('workflow builder')
    expect(source).not.toContain('Outlook sync')
  })

  it('renders bounded reschedule controls for an active eligible review', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem(),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).toContain('Reviewdatum beheren')
    expect(markup).toContain('type="date"')
    expect(markup).toContain('Verplaats review')
    expect(markup).toContain('Annuleer review')
  })

  it('hides reschedule controls when review scheduling access is unavailable', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem(),
        canDownloadInviteArtifact: false,
        canScheduleReviewControls: false,
      }),
    )

    expect(markup).not.toContain('Verplaats review')
    expect(markup).not.toContain('Annuleer review')
  })

  it('hides reschedule controls for closed review statuses', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'completed',
        item: createReviewMomentItem({
          status: 'afgerond',
        }),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).not.toContain('Verplaats review')
    expect(markup).not.toContain('Annuleer review')
  })

  it('hides reschedule controls for non-ExitScan routes', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem({
          sourceLabel: 'RetentieScan',
        }),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: true,
      }),
    )

    expect(markup).not.toContain('Verplaats review')
    expect(markup).not.toContain('Annuleer review')
  })

  it('hides reschedule controls when scheduling capability is missing even if invite download stays available', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewMomentDetailPanel, {
        urgency: 'this-week',
        item: createReviewMomentItem(),
        canDownloadInviteArtifact: true,
        canScheduleReviewControls: false,
      }),
    )

    expect(markup).not.toContain('Verplaats review')
    expect(markup).not.toContain('Annuleer review')
  })
})
