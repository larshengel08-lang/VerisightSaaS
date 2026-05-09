import type { CampaignCompositionState } from '@/lib/dashboard/dashboard-state-composition'

export function getCtaHrefForState(state: CampaignCompositionState, campaignId: string) {
  if (state === 'partial' || state === 'full') return `/campaigns/${campaignId}`
  if (state === 'closed') return `/campaigns/${campaignId}`
  return `/campaigns/${campaignId}/beheer`
}
