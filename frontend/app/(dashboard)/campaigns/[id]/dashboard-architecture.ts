import type { ScanType } from '@/lib/types'

export type DashboardViewKind = 'results'
export type DashboardSectionEmphasis = 'hero' | 'primary' | 'secondary'

export type DashboardViewDefinition = {
  id: DashboardViewKind
  label: string
  kind: DashboardViewKind
}

export type DashboardSectionDefinition = {
  id: string
  title: string
  emphasis: DashboardSectionEmphasis
  interaction?: 'static' | 'drilldown' | 'disclosure'
  highlightCount?: number
  requiresSegmentDeepDive?: boolean
}

export type DashboardArchitecture = {
  primaryViews: DashboardViewDefinition[]
  overviewSections: DashboardSectionDefinition[]
  evidenceSections: DashboardSectionDefinition[]
  actionSections: DashboardSectionDefinition[]
  campaignSections: DashboardSectionDefinition[]
}

export type DashboardVisibilityState = {
  showResponseInterpretation: boolean
  showScoreInterpretation: boolean
  showDriverDrilldown: boolean
  showSegmentAnalysis: boolean
  showActionPlaybooks: boolean
  showCampaignView: boolean
  showCampaignControls: boolean
  showRespondentTable: boolean
  showArchivedNotice: boolean
}

export function getScoreInterpretationTitle(scanType: ScanType) {
  switch (scanType) {
    case 'exit':
      return 'Frictiescore en verdeling van het vertrekbeeld'
    case 'retention':
      return 'Retentiesignaal en signaalverdeling'
    case 'team':
      return 'Teamsignaal en lokale signaalverdeling'
    case 'onboarding':
      return 'Onboardingsignaal en checkpointverdeling'
    case 'pulse':
      return 'Pulsesignaal en bounded reviewverdeling'
    case 'leadership':
      return 'Leadershipsignaal en managementcontextverdeling'
    default:
      return 'Signaalinterpretatie'
  }
}

export function buildDashboardArchitecture(args: {
  scanType: ScanType
  canManageCampaign: boolean
  hasSegmentDeepDive: boolean
}): DashboardArchitecture {
  return {
    primaryViews: [{ id: 'results', label: 'Resultaten', kind: 'results' }],
    overviewSections: [
      { id: 'response', title: 'Responsbasis', emphasis: 'secondary' },
      { id: 'score', title: getScoreInterpretationTitle(args.scanType), emphasis: 'hero' },
      { id: 'synthesis', title: 'Signalen in samenhang', emphasis: 'primary' },
      {
        id: 'drivers',
        title: 'Drivers & prioriteiten',
        emphasis: 'primary',
        interaction: 'drilldown',
      },
      { id: 'depth', title: 'Verdiepingslagen', emphasis: 'secondary' },
      { id: 'voices', title: 'Survey-stemmen', emphasis: 'secondary' },
    ],
    evidenceSections: [],
    actionSections: [],
    campaignSections: [],
  }
}

export function buildDashboardVisibilityState(args: {
  scanType: ScanType
  hasMinDisplay: boolean
  hasEnoughData: boolean
  hasSegmentDeepDive: boolean
  canManageCampaign: boolean
  respondentsCount: number
  isArchivedPeriod: boolean
}): DashboardVisibilityState {
  return {
    showResponseInterpretation: args.hasMinDisplay || args.respondentsCount > 0,
    showScoreInterpretation: args.hasMinDisplay,
    showDriverDrilldown: args.hasEnoughData,
    showSegmentAnalysis: args.hasEnoughData && args.hasSegmentDeepDive && args.scanType === 'retention',
    showActionPlaybooks: args.hasEnoughData,
    showCampaignView: args.canManageCampaign || args.respondentsCount > 0 || args.isArchivedPeriod,
    showCampaignControls: args.canManageCampaign,
    showRespondentTable: args.respondentsCount > 0,
    showArchivedNotice: args.isArchivedPeriod,
  }
}
