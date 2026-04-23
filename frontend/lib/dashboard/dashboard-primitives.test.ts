import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  DashboardChartPanel,
  DashboardRecommendationRail,
  DashboardStatCard,
} from '../../components/dashboard/dashboard-primitives'

describe('dashboard primitives', () => {
  it('renders stat cards with premium metric framing', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DashboardStatCard, {
        eyebrow: 'Management-ready',
        title: 'Campagnes',
        value: '4',
        body: 'Campagnes met genoeg respons om verantwoord te lezen.',
        tone: 'blue',
      }),
    )

    expect(markup).toContain('data-dashboard-primitive="stat-card"')
    expect(markup).toContain('Management-ready')
    expect(markup).toContain('Campagnes')
    expect(markup).toContain('4')
  })

  it('renders chart and recommendation rails as separate dashboard surfaces', () => {
    const chartMarkup = renderToStaticMarkup(
      React.createElement(
        DashboardChartPanel,
        {
          eyebrow: 'Signaalbeeld',
          title: 'Verdeling',
          description: 'Hoe breed het patroon nu zichtbaar wordt.',
        },
        React.createElement('div', null, 'chart'),
      ),
    )

    const railMarkup = renderToStaticMarkup(
      React.createElement(
        DashboardRecommendationRail,
        {
          eyebrow: 'Wat eerst',
          title: 'Aanbevelingsrail',
          description: 'Begrens de eerste managementvragen.',
          tone: 'emerald',
        },
        React.createElement('div', null, 'rail'),
      ),
    )

    expect(chartMarkup).toContain('data-dashboard-primitive="chart-panel"')
    expect(chartMarkup).toContain('Verdeling')
    expect(railMarkup).toContain('data-dashboard-primitive="recommendation-rail"')
    expect(railMarkup).toContain('Aanbevelingsrail')
  })
})
