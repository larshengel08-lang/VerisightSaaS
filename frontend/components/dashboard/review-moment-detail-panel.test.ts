import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewMomentDetailPanel } from './review-moment-detail-panel'
import { buildActionCenterEntryHref } from '@/lib/action-center-entry'
import type { ActionCenterPreviewItem } from '@/lib/action-center-preview-model'

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
      }),
    )

    expect(markup).toContain(`href="${expectedHref}"`)
    expect(markup).toContain('12 mei 2026')
  })
})
