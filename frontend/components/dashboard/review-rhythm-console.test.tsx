import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewRhythmConsole } from './review-rhythm-console'

describe('review rhythm console', () => {
  it('renders bounded HR rhythm controls and overview copy', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewRhythmConsole, {
        selectedRouteId: 'cmp-exit-1::org-1::department::operations',
        selectedRouteLabel: 'Operations',
        canManageReviewRhythm: true,
        config: {
          cadenceDays: 14,
          reminderLeadDays: 3,
          escalationLeadDays: 7,
          remindersEnabled: true,
        },
        summary: {
          staleCount: 1,
          overdueCount: 2,
          upcomingCount: 4,
          reminderManagedCount: 5,
        },
      }),
    )

    expect(markup).toContain('HR Rhythm Console')
    expect(markup).toContain('Cadans')
    expect(markup).toContain('Herinnering')
    expect(markup).toContain('Escalatie')
    expect(markup).toContain('ExitScan')
    expect(markup).not.toContain('workflow')
  })

  it('keeps Graph, Outlook, reschedule and mail-sending language out of the bounded console', () => {
    const source = readFileSync(new URL('./review-rhythm-console.tsx', import.meta.url), 'utf8').toLowerCase()

    for (const forbidden of ['graph', 'outlook', 'reschedule', 'mail', 'workflow', 'planner']) {
      expect(source).not.toContain(forbidden)
    }
  })
})
