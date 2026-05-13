import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { HrRouteBeheerPhaseDetail, HrRouteBeheerPhaseSummary } from './beheer-data'

vi.mock('../campaign-actions', () => ({
  CampaignActions: () => createElement('div', null, 'CampaignActions'),
}))

vi.mock('../pdf-download-button', () => ({
  PdfDownloadButton: () => createElement('div', null, 'PdfDownloadButton'),
}))

import {
  RouteBeheerNowDoingRow,
  RouteBeheerOutputSummary,
  RouteBeheerPhaseDetailPanel,
  RouteBeheerPhaseOverview,
} from './route-beheer-phase-sections'

const phases: HrRouteBeheerPhaseSummary[] = [
  {
    key: 'doelgroep',
    label: 'Doelgroep klaarzetten',
    status: 'current',
    body: '124 deelnemers, 18 ontbreken',
    link: { label: 'Open doelgroep', href: '/campaigns/cmp-1#operatie' },
  },
  {
    key: 'communicatie',
    label: 'Communicatie instellen',
    status: 'open',
    body: 'Route en startdatum',
    link: { label: 'Open communicatie', href: '/campaigns/cmp-1/beheer#route-instellingen' },
  },
]

const phaseDetails: HrRouteBeheerPhaseDetail[] = [
  {
    key: 'communicatie',
    label: 'Communicatie instellen',
    status: 'open',
    body: 'Route en startdatum',
    items: [
      { label: 'Route', value: 'ExitScan / Baseline / Q3 2026' },
      { label: 'Startdatum', value: '10 mei 2026' },
    ],
    links: [
      { label: 'Open uitnodiging', href: '/campaigns/cmp-1#uitnodigingen' },
      { label: 'Bekijk instellingen', href: '/campaigns/cmp-1/beheer#route-instellingen' },
    ],
  },
]

describe('routebeheer phase sections', () => {
  it('renders a subtle now-doing row as a direct action link', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerNowDoingRow, {
        nowDoing: {
          phaseKey: 'live',
          title: 'Verstuur uitnodigingen',
          body: 'Uitnodiging staat klaar, nog niet verstuurd',
          href: '/campaigns/cmp-1#uitnodigingen',
          label: 'Nu doen',
        },
      }),
    )

    expect(markup).toContain('Verstuur uitnodigingen')
    expect(markup).toContain('Uitnodiging staat klaar, nog niet verstuurd')
    expect(markup).toContain('href="/campaigns/cmp-1#uitnodigingen"')
  })

  it('renders all phases collapsed by default and shows fact lines without dominant explanatory copy', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerPhaseOverview, {
        phases,
        selectedPhaseKey: null,
        onSelectPhase: () => undefined,
      }),
    )

    expect(markup).toContain('Doelgroep klaarzetten')
    expect(markup).toContain('124 deelnemers, 18 ontbreken')
    expect(markup).not.toContain('waarom dit belangrijk is')
    expect(markup).not.toContain('aria-expanded="true"')
  })

  it('renders only the selected phase detail surface on demand', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerPhaseDetailPanel, {
        phases: phaseDetails,
        selectedPhaseKey: 'communicatie',
      }),
    )

    expect(markup).toContain('Communicatie instellen')
    expect(markup).toContain('Open uitnodiging')
    expect(markup).toContain('Bekijk instellingen')
    expect(markup).toContain('10 mei 2026')
    expect(markup).not.toContain('launchafspraken')
  })

  it('keeps the always-visible output summary compact and action-only', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerOutputSummary, {
        summary: {
          dashboardReady: true,
          reportReady: false,
          dashboardHref: '/campaigns/cmp-1',
          reportHref: null,
          label: 'Dashboard / rapportstatus',
        },
      }),
    )

    expect(markup).toContain('Dashboard / rapportstatus')
    expect(markup).toContain('href="/campaigns/cmp-1"')
    expect(markup).not.toContain('readiness')
  })
})
