import type { ScanDefinition } from '@/lib/scan-definitions'
import type { ScanType } from '@/lib/types'

export interface DashboardStatCard {
  title: string
  value: string
  body: string
  tone: 'blue' | 'emerald' | 'amber'
}

export interface DashboardListBlock {
  title: string
  intro?: string
  items: string[]
  tone: 'blue' | 'emerald' | 'amber'
}

export interface DashboardDecisionCard {
  title: string
  body: string
  tone: 'blue' | 'emerald' | 'amber'
}

export interface ActionPlaybook {
  title: string
  decision: string
  validate: string
  owner: string
  actions: string[]
  caution: string
  review?: string
}

export interface DashboardFollowThroughCard {
  title: string
  body: string
  tone: 'blue' | 'emerald' | 'amber'
}

export interface SignalTrendCard {
  key: string
  title: string
  currentValue: number
  previousValue: number
  delta: number
  direction: 'improved' | 'worsened' | 'stable'
  tone: 'blue' | 'emerald' | 'amber'
  body: string
}

export interface SegmentPlaybookEntry extends ActionPlaybook {
  segmentType: 'department' | 'role_level'
  segmentLabel: string
  factorKey: string
  factorLabel: string
  n: number
  avgSignal: number
  deltaVsOrg: number
  signalValue: number
}

export interface DashboardViewModel {
  signaalbandenText: string
  topSummaryCards: DashboardStatCard[]
  managementBlocks: DashboardListBlock[]
  profileCards: DashboardStatCard[]
  interpretationState?: string
  primaryQuestion: DashboardDecisionCard
  nextStep: DashboardDecisionCard
  focusSectionIntro: string
  followThroughTitle: string
  followThroughIntro: string
  followThroughCards: DashboardFollowThroughCard[]
  managementBandOverride?: 'HOOG' | 'MIDDEN' | 'LAAG' | null
}

export interface ProductModule {
  scanType: ScanType
  definition: ScanDefinition
  buildDashboardViewModel(args: {
    signalLabelLower: string
    averageSignal: number | null
    strongWorkSignalRate: number | null
    engagement: number | null
    turnoverIntention: number | null
    stayIntent: number | null
    hasEnoughData: boolean
    hasMinDisplay: boolean
    pendingCount: number
    factorAverages: Record<string, number>
    topExitReasonLabel?: string | null
    topContributingReasonLabel?: string | null
    signalVisibilityAverage?: number | null
  }): DashboardViewModel
  getFocusQuestions(): Record<string, Record<string, string[]>>
  getActionPlaybooks(): Record<string, Record<string, ActionPlaybook>>
  getActionPlaybookCalibrationNote?(): string
}
