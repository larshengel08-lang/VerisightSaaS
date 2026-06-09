import type { ScanType } from '@/lib/types'

export type CampaignCompositionState =
  | 'setup'
  | 'ready_to_launch'
  | 'running'
  | 'sparse'
  | 'partial'
  | 'full'
  | 'closed'

export const HOME_STATE_ORDER: CampaignCompositionState[] = [
  'full',
  'partial',
  'sparse',
  'running',
  'ready_to_launch',
  'setup',
  'closed',
]

export function getCampaignCompositionState({
  scanType,
  isActive,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
  hasEnoughData,
}: {
  scanType: ScanType
  isActive: boolean
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
}): CampaignCompositionState {
  if (!isActive) {
    return 'closed'
  }

  if (totalInvited === 0) {
    return 'setup'
  }

  if (invitesNotSent > 0) {
    return 'ready_to_launch'
  }

  if (scanType === 'culture_assessment') {
    return 'running'
  }

  if (totalCompleted === 0) {
    return 'running'
  }

  if (!hasMinDisplay) {
    return 'sparse'
  }

  if (!hasEnoughData || incompleteScores > 0) {
    return 'partial'
  }

  return 'full'
}

export function isManagementVisibleState(state: CampaignCompositionState) {
  return state === 'partial' || state === 'full' || state === 'closed'
}

export function isRecommendationReadyState(state: CampaignCompositionState) {
  return state === 'full' || state === 'closed'
}

export function isReportFirstState(state: CampaignCompositionState) {
  return state === 'closed'
}
