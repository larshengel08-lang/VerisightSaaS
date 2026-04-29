import type { Campaign, CampaignStats, MemberRole } from '@/lib/types'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from './pilot-learning'

export interface LiveActionCenterCampaignContext {
  campaign: Campaign
  stats: CampaignStats | null
  organizationName: string
  memberRole: MemberRole | null
  scopeType: 'department' | 'item'
  scopeValue: string
  scopeLabel: string
  peopleCount: number
  assignedManager: {
    userId: string
    displayName: string | null
    assignedAt?: string | null
  } | null
  deliveryRecord: CampaignDeliveryRecord | null
  deliveryCheckpoints: CampaignDeliveryCheckpoint[]
  learningDossier: PilotLearningDossier | null
  learningCheckpoints: PilotLearningCheckpoint[]
}
