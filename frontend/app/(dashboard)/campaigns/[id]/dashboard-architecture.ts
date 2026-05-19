import type { ScanType } from '@/lib/types'
import { CULTURE_ASSESSMENT_CONTRACT } from '@/lib/products/culture_assessment/contract'

export type DashboardViewKind = 'overview' | 'evidence' | 'action' | 'campaign'
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
    case 'culture_assessment':
      return 'Loep Culture Index en domeinverdeling'
    default:
      return 'Signaalinterpretatie'
  }
}

export function buildDashboardArchitecture(args: {
  scanType: ScanType
  canManageCampaign: boolean
  hasSegmentDeepDive: boolean
}): DashboardArchitecture {
  if (args.scanType === 'culture_assessment') {
    return {
      primaryViews: [
        { id: 'overview', label: 'Overzicht', kind: 'overview' },
        { id: 'evidence', label: 'Onderbouwing', kind: 'evidence' },
        { id: 'action', label: 'Actie', kind: 'action' },
        { id: 'campaign', label: 'Campagne', kind: 'campaign' },
      ],
      overviewSections: [
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[0], title: 'Responsbasis & meetdekking', emphasis: 'secondary' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[1], title: 'Executive culture read', emphasis: 'hero' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[2], title: 'Loep Culture Index', emphasis: 'primary' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[3], title: 'Board attention points', emphasis: 'primary', interaction: 'drilldown', highlightCount: 5 },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[4], title: 'Domeinbeeld', emphasis: 'primary' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[5], title: 'Patronen in samenhang', emphasis: 'primary' },
        {
          id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[6],
          title: 'Segmentcontrasten',
          emphasis: 'secondary',
          requiresSegmentDeepDive: true,
        },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[7], title: 'Verdiepingslagen', emphasis: 'secondary' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[8], title: 'Open signalen', emphasis: 'secondary' },
        { id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[9], title: 'Board-read & vervolgritme', emphasis: 'primary' },
        {
          id: CULTURE_ASSESSMENT_CONTRACT.canonicalBlockOrder[10],
          title: 'Rapport, export & methodiek',
          emphasis: 'secondary',
          interaction: 'disclosure',
        },
      ],
      evidenceSections: [
        { id: 'domain_view', title: 'Domeinbeeld', emphasis: 'secondary' },
        { id: 'pattern_view', title: 'Patronen in samenhang', emphasis: 'secondary' },
        {
          id: 'segment_contrasts',
          title: 'Governed segmentcontrasten',
          emphasis: 'secondary',
          requiresSegmentDeepDive: true,
        },
        { id: 'deepening_layers', title: 'Verdiepingslagen', emphasis: 'secondary' },
        { id: 'open_signals', title: 'Open signalen', emphasis: 'secondary' },
        {
          id: 'report_export_methodology',
          title: 'Rapport, export & methodiek',
          emphasis: 'secondary',
          interaction: 'disclosure',
        },
      ],
      actionSections: [
        { id: 'board_attention_points', title: 'Board attention points', emphasis: 'primary' },
        { id: 'board_read_follow_on', title: 'Board-read & vervolgritme', emphasis: 'primary' },
      ],
      campaignSections: [
        {
          id: 'campaign-status',
          title: args.canManageCampaign ? 'Campagnestatus en readiness' : 'Campagnestatus',
          emphasis: 'secondary',
        },
        { id: 'respondents', title: 'Respondenten en uitnodigingen', emphasis: 'secondary' },
      ],
    }
  }

  return {
    primaryViews: [
      { id: 'overview', label: 'Overzicht', kind: 'overview' },
      { id: 'evidence', label: 'Onderbouwing', kind: 'evidence' },
      { id: 'action', label: 'Actie', kind: 'action' },
      { id: 'campaign', label: 'Campagne', kind: 'campaign' },
    ],
    overviewSections: [
      { id: 'cover', title: 'Cover en context', emphasis: 'secondary' },
      { id: 'response', title: 'Response interpretation', emphasis: 'secondary' },
      { id: 'handoff', title: 'Bestuurlijke handoff', emphasis: 'hero' },
      { id: 'score', title: getScoreInterpretationTitle(args.scanType), emphasis: 'primary' },
      { id: 'synthesis', title: 'Signalen in samenhang', emphasis: 'primary' },
      {
        id: 'drivers',
        title: 'Drivers en prioriteiten',
        emphasis: 'primary',
        interaction: 'drilldown',
        highlightCount: 2,
      },
      { id: 'action', title: 'Eerste route en actie', emphasis: 'primary' },
      {
        id: 'methodology',
        title: 'Compacte methodiek en leeswijzer',
        emphasis: 'secondary',
        interaction: 'disclosure',
      },
    ],
    evidenceSections: [
      { id: 'sdt', title: 'SDT basislaag', emphasis: 'secondary' },
      { id: 'org-factors', title: 'Organisatiefactoren', emphasis: 'secondary' },
      {
        id: 'segments',
        title: 'Conditionele segmentanalyse',
        emphasis: 'secondary',
        requiresSegmentDeepDive: true,
      },
      {
        id: 'methodology',
        title: 'Methodologie, privacy en drempels',
        emphasis: 'secondary',
        interaction: 'disclosure',
      },
      { id: 'technical', title: 'Technische verantwoording', emphasis: 'secondary' },
      { id: 'report', title: 'Volledig rapport', emphasis: 'secondary' },
    ],
    actionSections: [
      { id: 'route', title: 'Eerste route, eigenaar en review', emphasis: 'primary' },
      { id: 'playbooks', title: 'Verificatievragen en playbooks', emphasis: 'primary' },
      ...(args.scanType === 'team' || args.scanType === 'leadership'
        ? [
            {
              id: 'bounded-fallback',
              title: 'Terug naar bredere duiding wanneer deze bounded route te smal wordt',
              emphasis: 'secondary' as const,
            },
          ]
        : []),
    ],
    campaignSections: [
      {
        id: 'campaign-status',
        title: args.canManageCampaign ? 'Campagnestatus en readiness' : 'Campagnestatus',
        emphasis: 'secondary',
      },
      { id: 'respondents', title: 'Respondenten en uitnodigingen', emphasis: 'secondary' },
    ],
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
    showSegmentAnalysis:
      args.hasEnoughData &&
      args.hasSegmentDeepDive &&
      (args.scanType === 'retention' || args.scanType === 'culture_assessment'),
    showActionPlaybooks: args.hasEnoughData,
    showCampaignView: args.canManageCampaign || args.respondentsCount > 0 || args.isArchivedPeriod,
    showCampaignControls: args.canManageCampaign,
    showRespondentTable: args.respondentsCount > 0,
    showArchivedNotice: args.isArchivedPeriod,
  }
}
