import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type {
  HrRouteBeheerPhaseDetail,
  HrRouteBeheerPhaseSummary,
  RouteBeheerPageData,
} from './beheer-data'

vi.mock('../campaign-actions', () => ({
  CampaignActions: () => createElement('div', null, 'CampaignActions'),
}))

vi.mock('../pdf-download-button', () => ({
  PdfDownloadButton: () => createElement('div', null, 'PdfDownloadButton'),
}))

vi.mock('@/components/dashboard/guided-self-serve-panel', () => ({
  GuidedSelfServePanel: () => createElement('div', null, 'GuidedSelfServePanel'),
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

const routeBeheerData: RouteBeheerPageData = {
  campaignId: 'cmp-1',
  campaignName: 'RetentionScan Demo',
  organizationName: 'Acme',
  scanType: 'retention',
  scanTypeLabel: 'RetentieScan',
  deliveryModeLabel: 'Baseline',
  routePeriodLabel: 'Q2 2026',
  isActive: true,
  statusBadgeLabel: 'Live',
  statusBadgeTone: 'emerald',
  lastActivityAt: '2026-05-10T10:00:00.000Z',
  launchDate: '2026-05-10',
  totalInvited: 12,
  totalCompleted: 6,
  pendingCount: 6,
  completionRatePct: 50,
  invitesNotSent: 0,
  hasMinDisplay: true,
  hasEnoughData: false,
  readabilityLabel: 'Indicatief beeld',
  readabilityBody: 'Dashboard zichtbaar.',
  nextActionTitle: 'Open dashboard',
  nextActionBody: 'Dashboard beschikbaar.',
  blockers: [],
  lifecycleStage: 'first_value_reached',
  lifecycleSteps: [],
  nowDoing: null,
  phaseSummaries: phases,
  phaseDetails: [
    {
      key: 'live',
      label: 'Live zetten & volgen',
      status: 'current',
      body: 'Uitnodigingen en respons',
      items: [
        { label: 'Respons', value: '6/12 ingevuld' },
        { label: 'Openstaand', value: '6' },
      ],
      links: [
        {
          label: 'Open uitnodigingen',
          href: '/campaigns/cmp-1/beheer?fase=live#uitnodigingen-en-respons',
        },
      ],
    },
  ],
  outputSummary: {
    dashboardReady: true,
    reportReady: true,
    dashboardHref: '/campaigns/cmp-1',
    reportHref: null,
    label: 'Dashboard / rapportstatus',
  },
  respondentCount: 12,
  routeSettingsLabel: 'RetentieScan / Baseline / Q2 2026',
  routeSettingsBody: 'Startdatum: 10 mei 2026',
  outputStatusLabel: 'Dashboard / rapportstatus',
  latestAuditSummary: 'Invites verstuurd',
  reportAvailable: true,
  canExecuteCampaign: true,
  canManageCampaign: true,
  membershipRole: 'owner',
  selfServe: {
    currentStep: 'active',
    phaseKey: 'live',
    deliveryMode: 'baseline',
    importReady: true,
    hasSegmentDeepDive: false,
    importQaConfirmed: true,
    launchTimingConfirmed: true,
    communicationReady: true,
    remindableCount: 6,
    unsentRespondents: [],
    launchConfirmedAt: '2026-05-10T10:00:00.000Z',
    participantCommsConfig: null,
    reminderConfig: null,
  },
}

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

  it('renders the guided self-serve workspace inside routebeheer when HR can execute campaign actions', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerPhaseDetailPanel, {
        phases: routeBeheerData.phaseDetails,
        selectedPhaseKey: 'live',
        data: routeBeheerData,
      }),
    )

    expect(markup).toContain('GuidedSelfServePanel')
    expect(markup).toContain('CampaignActions')
  })

  it('does not render the self-serve workspace on non-matching phases or closed routes', () => {
    const nonMatchingMarkup = renderToStaticMarkup(
      createElement(RouteBeheerPhaseDetailPanel, {
        phases: [
          {
            key: 'communicatie',
            label: 'Communicatie instellen',
            status: 'current',
            body: 'Route en startdatum',
            items: [],
            links: [{ label: 'Bekijk instellingen', href: '/campaigns/cmp-1/beheer?fase=communicatie#route-instellingen' }],
          },
        ],
        selectedPhaseKey: 'communicatie',
        data: routeBeheerData,
      }),
    )

    const closedMarkup = renderToStaticMarkup(
      createElement(RouteBeheerPhaseDetailPanel, {
        phases: routeBeheerData.phaseDetails,
        selectedPhaseKey: 'live',
        data: {
          ...routeBeheerData,
          isActive: false,
        },
      }),
    )

    expect(nonMatchingMarkup).not.toContain('GuidedSelfServePanel')
    expect(closedMarkup).not.toContain('GuidedSelfServePanel')
  })

  it('keeps the always-visible output summary compact and action-only', () => {
    const markup = renderToStaticMarkup(
      createElement(RouteBeheerOutputSummary, {
        data: routeBeheerData,
      }),
    )

    expect(markup).toContain('Dashboard / rapportstatus')
    expect(markup).toContain('href="/campaigns/cmp-1"')
    expect(markup).toContain('PdfDownloadButton')
    expect(markup).not.toContain('readiness')
  })
})
