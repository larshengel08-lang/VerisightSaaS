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
            sourceLabel: 'RetentieScan',
            reviewDateLabel: '20 mei',
          },
          {
            routeId: 'route-2',
            state: 'stale',
            scopeLabel: 'Support',
            sourceLabel: 'ExitScan',
            reviewDateLabel: 'Nog niet gepland',
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
    expect(markup).toContain('Operations')
    expect(markup).toContain('RetentieScan')
    expect(markup).not.toContain('workflow')
    expect(markup).not.toContain('task board')
    expect(markup).not.toContain('project planning')
  })
})
