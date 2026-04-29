import type { CampaignStats } from '@/lib/types'

export function selectPrimaryOverviewCampaign(args: {
  campaigns: CampaignStats[]
  hrDemoCampaignId?: string | null
  primaryFirstNextStepCampaign: CampaignStats | null
  primaryGuideCampaign: CampaignStats | null
}) {
  const demoCampaign = args.hrDemoCampaignId
    ? args.campaigns.find((campaign) => campaign.campaign_id === args.hrDemoCampaignId) ?? null
    : null

  return demoCampaign ?? args.primaryFirstNextStepCampaign ?? args.primaryGuideCampaign
}
