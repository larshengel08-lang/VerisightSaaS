import { describe, expect, it } from 'vitest'
import {
  buildDashboardArchitecture,
  buildDashboardVisibilityState,
  getScoreInterpretationTitle,
} from './dashboard-architecture'

describe('dashboard architecture', () => {
  it('uses a reduced primary navigation with management reading first', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'exit',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    expect(architecture.primaryViews.map((view) => view.label)).toEqual([
      'Overzicht',
      'Onderbouwing',
      'Actie',
      'Campagne',
    ])
    expect(architecture.primaryViews[0]?.kind).toBe('overview')
    expect(architecture.primaryViews[3]?.kind).toBe('campaign')
  })

  it('keeps response, handoff and score interpretation explicit in the overview order', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'exit',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    expect(architecture.overviewSections.map((section) => section.id)).toEqual([
      'cover',
      'response',
      'handoff',
      'score',
      'synthesis',
      'drivers',
      'action',
      'methodology',
    ])
    expect(architecture.overviewSections.find((section) => section.id === 'response')?.emphasis).toBe(
      'secondary',
    )
    expect(architecture.overviewSections.find((section) => section.id === 'handoff')?.emphasis).toBe(
      'hero',
    )
    expect(architecture.overviewSections.find((section) => section.id === 'score')?.emphasis).toBe(
      'primary',
    )
  })

  it('keeps methodology and segment analysis out of the primary navigation headline layer', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'retention',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    expect(architecture.primaryViews.some((view) => view.label === 'Methodiek')).toBe(false)
    expect(architecture.overviewSections.find((section) => section.id === 'methodology')?.emphasis).toBe(
      'secondary',
    )
    expect(
      architecture.evidenceSections.find((section) => section.id === 'segments')?.requiresSegmentDeepDive,
    ).toBe(true)
    expect(architecture.evidenceSections.find((section) => section.id === 'segments')?.emphasis).toBe(
      'secondary',
    )
  })

  it('marks the drivers layer as top-2-first drilldown instead of a flat factor dump', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'retention',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    const driversSection = architecture.overviewSections.find((section) => section.id === 'drivers')

    expect(driversSection?.interaction).toBe('drilldown')
    expect(driversSection?.highlightCount).toBe(2)
  })

  it('keeps campaign operations in a separate view and only when operational detail exists', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'exit',
      canManageCampaign: false,
      hasSegmentDeepDive: false,
    })

    expect(architecture.campaignSections.map((section) => section.id)).toEqual([
      'campaign-status',
      'respondents',
    ])
  })

  it('keeps bounded fallback guidance explicit for non-core routes', () => {
    const teamArchitecture = buildDashboardArchitecture({
      scanType: 'team',
      canManageCampaign: true,
      hasSegmentDeepDive: false,
    })
    const leadershipArchitecture = buildDashboardArchitecture({
      scanType: 'leadership',
      canManageCampaign: true,
      hasSegmentDeepDive: false,
    })

    expect(teamArchitecture.actionSections.find((section) => section.id === 'bounded-fallback')?.title).toContain(
      'bredere duiding',
    )
    expect(
      leadershipArchitecture.actionSections.find((section) => section.id === 'bounded-fallback')?.title,
    ).toContain('bredere duiding')
  })
})

describe('score interpretation titles', () => {
  it('keeps frictiescore language only on ExitScan', () => {
    expect(getScoreInterpretationTitle('exit')).toContain('Frictiescore')
    expect(getScoreInterpretationTitle('retention')).not.toContain('Frictiescore')
    expect(getScoreInterpretationTitle('retention')).toContain('Retentiesignaal')
  })
})

describe('dashboard visibility state', () => {
  it('keeps response interpretation visible while deeper evidence stays collapsed under low-n', () => {
    const visibility = buildDashboardVisibilityState({
      scanType: 'retention',
      hasMinDisplay: true,
      hasEnoughData: false,
      hasSegmentDeepDive: true,
      canManageCampaign: true,
      respondentsCount: 6,
      isArchivedPeriod: false,
    })

    expect(visibility.showResponseInterpretation).toBe(true)
    expect(visibility.showScoreInterpretation).toBe(true)
    expect(visibility.showDriverDrilldown).toBe(false)
    expect(visibility.showSegmentAnalysis).toBe(false)
    expect(visibility.showActionPlaybooks).toBe(false)
  })

  it('keeps segment analysis hidden when deep dive is unavailable even if the pattern is strong enough', () => {
    const visibility = buildDashboardVisibilityState({
      scanType: 'retention',
      hasMinDisplay: true,
      hasEnoughData: true,
      hasSegmentDeepDive: false,
      canManageCampaign: true,
      respondentsCount: 18,
      isArchivedPeriod: false,
    })

    expect(visibility.showDriverDrilldown).toBe(true)
    expect(visibility.showSegmentAnalysis).toBe(false)
    expect(visibility.showActionPlaybooks).toBe(true)
  })

  it('keeps campaign operations non-central and permission-aware', () => {
    const visibility = buildDashboardVisibilityState({
      scanType: 'exit',
      hasMinDisplay: true,
      hasEnoughData: true,
      hasSegmentDeepDive: false,
      canManageCampaign: false,
      respondentsCount: 0,
      isArchivedPeriod: true,
    })

    expect(visibility.showCampaignView).toBe(true)
    expect(visibility.showCampaignControls).toBe(false)
    expect(visibility.showRespondentTable).toBe(false)
    expect(visibility.showArchivedNotice).toBe(true)
  })
})
