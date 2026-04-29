import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'

const ACTION_CENTER_ROUTE_OPENABLE_STAGES: DeliveryLifecycleStage[] = [
  'setup_in_progress',
  'import_cleared',
  'invites_live',
  'client_activation_pending',
  'client_activation_confirmed',
  'first_value_reached',
]

const ACTION_CENTER_ROUTE_EXISTING_STAGES: DeliveryLifecycleStage[] = [
  'first_management_use',
  'follow_up_decided',
  'learning_closed',
]

export interface ActionCenterRouteOpenRecord {
  lifecycle_stage: DeliveryLifecycleStage | null
  first_management_use_confirmed_at: string | null
}

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

export function hasOpenedActionCenterRoute(record: ActionCenterRouteOpenRecord) {
  return (
    Boolean(record.first_management_use_confirmed_at) ||
    (record.lifecycle_stage !== null && ACTION_CENTER_ROUTE_EXISTING_STAGES.includes(record.lifecycle_stage))
  )
}

export function canOpenActionCenterRoute(record: ActionCenterRouteOpenRecord) {
  return (
    !hasOpenedActionCenterRoute(record) &&
    record.lifecycle_stage !== null &&
    ACTION_CENTER_ROUTE_OPENABLE_STAGES.includes(record.lifecycle_stage)
  )
}

export function getActionCenterRouteOpenableStages() {
  return [...ACTION_CENTER_ROUTE_OPENABLE_STAGES]
}
