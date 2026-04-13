import type { DashboardViewModel } from '@/lib/products/shared/types'

export function buildExitDashboardViewModel(args: {
  signalLabelLower: string
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
  hasEnoughData: boolean
  factorAverages: Record<string, number>
}): DashboardViewModel {
  return {
    signaalbandenText:
      `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen wat eerst besproken of gevalideerd moet worden.`,
    supplementalCards: [],
    managementBlocks: [],
    profileCards: [],
  }
}
