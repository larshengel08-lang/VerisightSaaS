import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ReviewRhythmOversight } from './review-rhythm-oversight'

describe('review rhythm oversight', () => {
  it('renders bounded HR oversight summary and attention items inside reviewmomenten language', () => {
    const markup = renderToStaticMarkup(
      <ReviewRhythmOversight
        summary={{
          upcomingCount: 3,
          overdueCount: 1,
          staleCount: 2,
          escalationSensitiveCount: 1,
          resolvedCount: 4,
        }}
        attentionItems={[
          {
            routeId: 'route-1',
            state: 'escalation-sensitive',
            scopeLabel: 'Operations',
            sourceLabel: 'Loep Behoud',
            reviewDateLabel: '20 mei',
          },
          {
            routeId: 'route-2',
            state: 'stale',
            scopeLabel: 'Support',
            sourceLabel: 'Loep Vertrek',
            reviewDateLabel: 'Nog niet gepland',
            governanceSignals: [
              {
                code: 'stuck_action',
                label: 'Actie blijft hangen',
              },
              {
                code: 'missing_action_review',
                label: 'Actiereview ontbreekt',
              },
            ],
          },
        ]}
      />,
    )

    expect(markup).toContain('HR overzicht')
    expect(markup).toContain('Waar HR nu moet kijken')
    expect(markup).toContain('Escalatiegevoelig')
    expect(markup).toContain('Achter cadans')
    expect(markup).toContain('Achter op review')
    expect(markup).toContain('Binnen cadans')
    expect(markup).toContain('Actie blijft hangen')
    expect(markup).toContain('Actiereview ontbreekt')
    expect(markup).toContain('Operations')
    expect(markup).toContain('Loep Behoud')
    expect(markup).not.toContain('workflow')
    expect(markup).not.toContain('task board')
    expect(markup).not.toContain('project planning')
  })

  it('excludes blocked route family items from the bounded oversight list instead of masking them', () => {
    const markup = renderToStaticMarkup(
      <ReviewRhythmOversight
        summary={{
          upcomingCount: 0,
          overdueCount: 0,
          staleCount: 1,
          escalationSensitiveCount: 0,
          resolvedCount: 0,
        }}
        attentionItems={[
          {
            routeId: 'route-1',
            state: 'stale',
            scopeLabel: 'Operations',
            sourceLabel: 'Pulse',
            reviewDateLabel: 'Nog niet gepland',
          },
        ]}
      />,
    )

    expect(markup).not.toContain('Pulse')
    expect(markup).not.toContain('Leadership')
    expect(markup).not.toContain('Operations')
    expect(markup).not.toContain('Nu aandacht nodig')
  })

  it('renders governance-only closeout and execution-gap routes inside the existing HR oversight surface', () => {
    const markup = renderToStaticMarkup(
      <ReviewRhythmOversight
        summary={{
          upcomingCount: 2,
          overdueCount: 0,
          staleCount: 0,
          escalationSensitiveCount: 0,
          resolvedCount: 0,
        }}
        attentionItems={[
          {
            routeId: 'route-exec-gap',
            state: 'stale',
            scopeLabel: 'Operations',
            sourceLabel: 'Loep Vertrek',
            reviewDateLabel: '5 jun',
            governanceSignals: [
              {
                code: 'missing_action_where_execution_is_expected',
                label: 'Actie ontbreekt',
              },
            ],
          },
          {
            routeId: 'route-closeout-ready',
            state: 'overdue',
            scopeLabel: 'Finance',
            sourceLabel: 'Loep Behoud',
            reviewDateLabel: '8 jun',
            governanceSignals: [
              {
                code: 'route_ready_for_closeout',
                label: 'Klaar voor closeout',
              },
            ],
          },
        ] as never}
      />,
    )

    expect(markup).toContain('Nu aandacht nodig')
    expect(markup).toContain('Actie ontbreekt')
    expect(markup).toContain('Klaar voor closeout')
    expect(markup).toContain('Operations')
    expect(markup).toContain('Finance')
  })
})
