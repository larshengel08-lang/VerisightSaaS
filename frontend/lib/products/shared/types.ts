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

export interface ActionPlaybook {
  title: string
  validate: string
  actions: string[]
  caution: string
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
  supplementalCards: DashboardStatCard[]
  managementBlocks: DashboardListBlock[]
  profileCards: DashboardStatCard[]
}

export interface ProductModule {
  scanType: ScanType
  definition: ScanDefinition
  buildDashboardViewModel(args: {
    signalLabelLower: string
    engagement: number | null
    turnoverIntention: number | null
    stayIntent: number | null
    hasEnoughData: boolean
    factorAverages: Record<string, number>
  }): DashboardViewModel
  getFocusQuestions(): Record<string, Record<string, string[]>>
  getActionPlaybooks(): Record<string, Record<string, ActionPlaybook>>
  getActionPlaybookCalibrationNote?(): string
}
