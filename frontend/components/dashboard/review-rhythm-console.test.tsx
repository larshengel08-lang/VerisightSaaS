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
        selectedRouteSourceId: 'cmp-exit-1',
        selectedRouteOrgId: 'org-1',
        selectedRouteScanType: 'retention',
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
    expect(markup).toContain('RetentieScan')
    expect(markup).not.toContain('workflow')
  })

  it('hides the edit path when no bounded rhythm route is selected in-surface', () => {
    const markup = renderToStaticMarkup(
      createElement(ReviewRhythmConsole, {
        selectedRouteId: null,
        selectedRouteLabel: null,
        selectedRouteSourceId: null,
        selectedRouteOrgId: null,
        selectedRouteScanType: null,
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

    expect(markup).toContain('Selecteer een reviewmoment om ritme-instellingen te bekijken.')
    expect(markup).not.toContain('Cadans</span><select')
    expect(markup).not.toContain('Opslaan')
  })

  it('keeps Graph, Outlook, reschedule and mail-sending language out of the bounded console', () => {
    const source = readFileSync(new URL('./review-rhythm-console.tsx', import.meta.url), 'utf8').toLowerCase()

    for (const forbidden of ['graph', 'outlook', 'reschedule', 'mail', 'workflow', 'planner']) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('resets sticky save feedback when the selected route context changes', () => {
    const source = readFileSync(new URL('./review-rhythm-console.tsx', import.meta.url), 'utf8')

    expect(source).toContain('setSaveState({')
    expect(source).toContain("status: 'idle'")
    expect(source).toContain('selectedRouteId')
    expect(source).toContain('selectedRouteSourceId')
    expect(source).toContain('selectedRouteOrgId')
    expect(source).toContain('selectedRouteScanType')
  })
})
