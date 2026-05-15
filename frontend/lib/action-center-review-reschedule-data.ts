import { createAdminClient } from '@/lib/supabase/admin'
import {
  getActionCenterEnabledRouteDefaults,
  type ActionCenterRouteDefaultsEnabledScanType,
} from './action-center-route-defaults'
import {
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
  normalizeCampaignIdentifier,
  parseActionCenterManagerResponseScopeValue,
} from './action-center-manager-responses'
import { buildActionCenterRouteId } from './action-center-route-contract'
import type { ActionCenterReviewRescheduleOperation } from './action-center-review-reschedule'

type CampaignRow = {
  id: string
  organization_id: string | null
  scan_type: string | null
}

type ManagerResponseRow = {
  campaign_id: string | null
  org_id: string | null
  route_scope_type: 'department' | 'item' | null
  route_scope_value: string | null
  review_scheduled_for: string | null
}

type LatestRevisionRow = {
  revision: number | null
  operation: ActionCenterReviewRescheduleOperation | null
  review_date: string | null
  previous_review_date: string | null
}

type ActionCenterReviewRescheduleDataInput = {
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  orgId: string
}

type ActionCenterReviewRescheduleDataSuccess = {
  status: 'ok'
  campaignId: string
  orgId: string
  routeId: string
  routeScopeValue: string
  routeScopeType: 'department' | 'item'
  scanType: ActionCenterRouteDefaultsEnabledScanType
  reviewDate: string | null
  latestRevision: number | null
  latestOperation: ActionCenterReviewRescheduleOperation | null
  latestReviewDate: string | null
  latestPreviousReviewDate: string | null
}

type ActionCenterReviewRescheduleDataFailure =
  | { status: 'not-found' }
  | { status: 'unsupported-scan-type' }
  | { status: 'missing-canonical-review-truth' }

export type ActionCenterReviewRescheduleDataResult =
  | ActionCenterReviewRescheduleDataSuccess
  | ActionCenterReviewRescheduleDataFailure

function matchesCanonicalRoute(input: ActionCenterReviewRescheduleDataInput, campaign: CampaignRow) {
  const canonicalOrgId = normalizeCampaignIdentifier(campaign.organization_id)
  if (!canonicalOrgId || normalizeCampaignIdentifier(input.orgId) !== canonicalOrgId) {
    return null
  }

  let parsedScope
  try {
    parsedScope = parseActionCenterManagerResponseScopeValue(input.routeScopeValue)
  } catch {
    return null
  }

  if (normalizeCampaignIdentifier(parsedScope.orgId) !== canonicalOrgId) {
    return null
  }

  const canonicalScopeValue =
    parsedScope.scopeType === 'department'
      ? buildDepartmentScopeValue(canonicalOrgId, parsedScope.scopeKey)
      : buildCampaignItemScopeValue(canonicalOrgId, parsedScope.scopeKey)

  const canonicalRouteId = buildActionCenterRouteId(campaign.id, canonicalScopeValue)
  if (input.routeId.toLowerCase() !== canonicalRouteId.toLowerCase()) {
    return null
  }

  if (parsedScope.scopeType === 'item' && parsedScope.scopeKey !== campaign.id) {
    return null
  }

  return {
    campaignId: campaign.id,
    orgId: canonicalOrgId,
    routeId: canonicalRouteId,
    routeScopeType: parsedScope.scopeType,
    routeScopeValue: canonicalScopeValue,
  }
}

export async function loadActionCenterReviewRescheduleData(
  input: ActionCenterReviewRescheduleDataInput,
): Promise<ActionCenterReviewRescheduleDataResult> {
  const adminClient = createAdminClient()
  const { data: campaign, error: campaignError } = await adminClient
    .from('campaigns')
    .select('id, organization_id, scan_type')
    .eq('id', input.routeSourceId)
    .maybeSingle()

  if (campaignError) {
    throw new Error(campaignError.message)
  }

  const campaignRow = (campaign ?? null) as CampaignRow | null
  if (!campaignRow?.id) {
    return { status: 'not-found' }
  }

  const canonicalRoute = matchesCanonicalRoute(input, campaignRow)
  if (!canonicalRoute) {
    return { status: 'not-found' }
  }

  const routeDefaults = getActionCenterEnabledRouteDefaults(campaignRow.scan_type)
  if (!routeDefaults) {
    return { status: 'unsupported-scan-type' }
  }

  const canonicalCampaignId = canonicalRoute.campaignId
  const canonicalRouteId = canonicalRoute.routeId
  const [{ data: managerResponse, error: managerResponseError }, { data: latestRevision, error: latestRevisionError }] =
    await Promise.all([
      adminClient
        .from('action_center_manager_responses')
        .select('campaign_id, org_id, route_scope_type, route_scope_value, review_scheduled_for')
        .eq('campaign_id', canonicalCampaignId)
        .eq('route_scope_type', canonicalRoute.routeScopeType)
        .eq('route_scope_value', canonicalRoute.routeScopeValue)
        .maybeSingle(),
      adminClient
        .from('action_center_review_schedule_revisions')
        .select('revision, operation, review_date, previous_review_date')
        .eq('route_id', canonicalRouteId)
        .order('revision', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  if (managerResponseError) {
    throw new Error(managerResponseError.message)
  }

  if (latestRevisionError) {
    throw new Error(latestRevisionError.message)
  }

  const managerResponseRow = (managerResponse ?? null) as ManagerResponseRow | null
  if (
    !managerResponseRow?.campaign_id ||
    !managerResponseRow.org_id ||
    !managerResponseRow.route_scope_type ||
    !managerResponseRow.route_scope_value ||
    managerResponseRow.campaign_id !== canonicalCampaignId ||
    normalizeCampaignIdentifier(managerResponseRow.org_id) !==
      normalizeCampaignIdentifier(campaignRow.organization_id) ||
    managerResponseRow.route_scope_type !== canonicalRoute.routeScopeType ||
    managerResponseRow.route_scope_value !== canonicalRoute.routeScopeValue
  ) {
    return { status: 'missing-canonical-review-truth' }
  }

  const latestRevisionRow = (latestRevision ?? null) as LatestRevisionRow | null
  if (!managerResponseRow.review_scheduled_for) {
    const hasUsableCancelWinner =
      latestRevisionRow?.operation === 'cancel' &&
      latestRevisionRow.review_date === null &&
      Boolean(latestRevisionRow.previous_review_date)

    if (!hasUsableCancelWinner) {
      return { status: 'missing-canonical-review-truth' }
    }
  }

  return {
    status: 'ok',
    campaignId: canonicalCampaignId,
    orgId: canonicalRoute.orgId,
    routeId: canonicalRouteId,
    routeScopeValue: canonicalRoute.routeScopeValue,
    routeScopeType: canonicalRoute.routeScopeType,
    scanType: routeDefaults.scanType,
    reviewDate: managerResponseRow.review_scheduled_for,
    latestRevision:
      typeof latestRevisionRow?.revision === 'number' ? latestRevisionRow.revision : null,
    latestOperation:
      latestRevisionRow?.operation === 'reschedule' || latestRevisionRow?.operation === 'cancel'
        ? latestRevisionRow.operation
        : null,
    latestReviewDate: latestRevisionRow?.review_date ?? null,
    latestPreviousReviewDate: latestRevisionRow?.previous_review_date ?? null,
  }
}
