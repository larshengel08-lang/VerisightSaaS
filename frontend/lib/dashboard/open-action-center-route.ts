import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'

export function buildActionCenterRouteOpenPatch(openedAt: string): {
  lifecycle_stage: DeliveryLifecycleStage
  first_management_use_confirmed_at: string
} {
  return {
    lifecycle_stage: 'first_management_use',
    first_management_use_confirmed_at: openedAt,
  }
}

export function buildActionCenterRouteOpenRedirect(campaignId: string) {
  return `/action-center?focus=${campaignId}`
}
