import type { Campaign, CampaignStats, MemberRole } from '@/lib/types'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type {
  ActionCenterManagerResponse,
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from './pilot-learning'
import type { ActionCenterRouteActionRecord } from './action-center-route-actions'
import type { ActionCenterActionReviewRecord } from './action-center-action-reviews'

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
  managerResponse?: ActionCenterManagerResponse | null
  reviewDecisions?: ActionCenterReviewDecision[]
  routeActions?: ActionCenterRouteActionRecord[]
  actionReviews?: ActionCenterActionReviewRecord[]
}
