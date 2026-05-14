import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildDashboardArchitecture,
  buildDashboardVisibilityState,
  getScoreInterpretationTitle,
} from './dashboard-architecture'

describe('dashboard architecture', () => {
  it('keeps one fixed HR results order across scans', () => {
    const source = readFileSync(new URL('./dashboard-architecture.ts', import.meta.url), 'utf8')

    expect(source).toContain("id: 'response'")
    expect(source).toContain("id: 'score'")
    expect(source).toContain("id: 'synthesis'")
    expect(source).toContain("id: 'drivers'")
    expect(source).toContain("id: 'depth'")
    expect(source).toContain("id: 'voices'")
    expect(source).not.toContain("id: 'methodology'")
    expect(source).not.toContain("id: 'campaign'")
  })

  it('reduces the shared architecture to one results-first primary view', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'exit',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    expect(architecture.primaryViews).toEqual([{ id: 'results', label: 'Resultaten', kind: 'results' }])
  })

  it('keeps the fixed results section order with score as the hero layer', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'retention',
      canManageCampaign: true,
      hasSegmentDeepDive: true,
    })

    expect(architecture.overviewSections.map((section) => section.id)).toEqual([
      'response',
      'score',
      'synthesis',
      'drivers',
      'depth',
      'voices',
    ])
    expect(architecture.overviewSections.find((section) => section.id === 'response')?.title).toBe(
      'Responsbasis',
    )
    expect(architecture.overviewSections.find((section) => section.id === 'score')?.emphasis).toBe('hero')
    expect(architecture.overviewSections.find((section) => section.id === 'drivers')?.interaction).toBe(
      'drilldown',
    )
    expect(architecture.overviewSections.find((section) => section.id === 'depth')?.title).toBe(
      'Verdiepingslagen',
    )
    expect(architecture.overviewSections.find((section) => section.id === 'voices')?.title).toBe(
      'Survey-stemmen',
    )
  })

  it('drops the old hybrid evidence, action and campaign section arrays', () => {
    const architecture = buildDashboardArchitecture({
      scanType: 'exit',
      canManageCampaign: false,
      hasSegmentDeepDive: false,
    })

    expect(architecture.evidenceSections).toEqual([])
    expect(architecture.actionSections).toEqual([])
    expect(architecture.campaignSections).toEqual([])
  })
})

describe('score interpretation titles', () => {
  it('keeps scan-specific score titles while staying inside the shared results shell', () => {
    expect(getScoreInterpretationTitle('exit')).toContain('Frictiescore')
    expect(getScoreInterpretationTitle('retention')).toContain('Retentiesignaal')
    expect(getScoreInterpretationTitle('onboarding')).toContain('Onboardingsignaal')
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
