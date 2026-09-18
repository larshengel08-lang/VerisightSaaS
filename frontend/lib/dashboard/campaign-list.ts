import { SCAN_TYPE_LABELS, type CampaignStats } from '@/lib/types'
import {
  CAMPAIGN_STATUS_LABELS,
  deriveCampaignStatusFor,
  type CampaignStatusContext,
  type CampaignStatusKey,
} from '@/lib/dashboard/campaign-status'

function newestFirst<T extends { created_at: string }>(campaigns: readonly T[]): T[] {
  return [...campaigns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * Hoofdkaart op /dashboard (spec 2026-09-16 par. 6.1): de nieuwste actieve
 * meting, of de nieuwste als er geen actieve is. Vóór dit plan koos de pagina
 * blind de nieuwste (limit 1), waardoor een meting die nog ingericht moest
 * worden nergens te vinden was (walkthrough 1.1).
 */
export function pickMainCampaign<T extends { is_active: boolean; created_at: string }>(
  campaigns: readonly T[],
): T | null {
  if (campaigns.length === 0) return null
  const sorted = newestFirst(campaigns)
  return sorted.find((campaign) => campaign.is_active) ?? sorted[0]
}

export interface CampaignListItem {
  campaignId: string
  name: string
  scanLabel: string
  statusKey: CampaignStatusKey
  statusLabel: string
  href: string
  /** Deze meting staat al als hoofdkaart bovenaan. */
  isMain: boolean
}

export function buildCampaignListItems(
  campaigns: readonly CampaignStats[],
  context: CampaignStatusContext,
  mainCampaignId: string | null,
): CampaignListItem[] {
  return newestFirst(campaigns).map((campaign) => {
    const statusKey = deriveCampaignStatusFor(campaign, context)
    return {
      campaignId: campaign.campaign_id,
      name: campaign.campaign_name,
      scanLabel: SCAN_TYPE_LABELS[campaign.scan_type] ?? campaign.scan_type,
      statusKey,
      statusLabel: CAMPAIGN_STATUS_LABELS[statusKey],
      href: `/campaigns/${campaign.campaign_id}`,
      isMain: campaign.campaign_id === mainCampaignId,
    }
  })
}
