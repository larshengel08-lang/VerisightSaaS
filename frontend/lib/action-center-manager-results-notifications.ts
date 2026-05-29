import 'server-only'

import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import type { DeliveryLifecycleStage } from '@/lib/ops-delivery'
import { buildResponseActivationState } from '@/lib/response-activation'
import { getBackendApiUrl } from '@/lib/server-env'
import { createAdminClient } from '@/lib/supabase/admin'

type CampaignRow = {
  id: string
  organization_id: string
  name: string
}

type CampaignStatsRow = {
  campaign_id: string
  total_completed: number
}

type DeliveryRecordRow = {
  campaign_id: string
  lifecycle_stage: DeliveryLifecycleStage | null
}

type RespondentDepartmentRow = {
  campaign_id: string
  department: string | null
}

type WorkspaceManagerRow = {
  org_id: string
  user_id: string
  display_name: string | null
  login_email: string | null
  access_role: 'manager_assignee'
  scope_type: 'org' | 'department' | 'item'
  scope_value: string
  can_view: boolean
}

type ActionCenterScopeCandidate = {
  scopeType: 'department' | 'item'
  scopeValue: string
  scopeLabel: string
}

const NOTIFIABLE_LIFECYCLE_STAGES = new Set<DeliveryLifecycleStage>([
  'first_management_use',
  'follow_up_decided',
  'learning_closed',
])

function normalizeDepartmentLabel(value: string | null | undefined) {
  return value?.trim() || null
}

function buildDepartmentScopeValue(orgId: string, departmentLabel: string) {
  return `${orgId}::department::${departmentLabel.toLowerCase()}`
}

function buildCampaignFallbackScopeValue(orgId: string, campaignId: string) {
  return `${orgId}::campaign::${campaignId}`
}

function buildScopeCandidates(campaign: CampaignRow, departmentLabels: string[]) {
  const uniqueDepartments = [
    ...new Set(
      departmentLabels
        .map((label) => normalizeDepartmentLabel(label))
        .filter((label): label is string => Boolean(label)),
    ),
  ]

  if (uniqueDepartments.length > 0) {
    return uniqueDepartments.map<ActionCenterScopeCandidate>((departmentLabel) => ({
      scopeType: 'department',
      scopeValue: buildDepartmentScopeValue(campaign.organization_id, departmentLabel),
      scopeLabel: departmentLabel,
    }))
  }

  return [
    {
      scopeType: 'item' as const,
      scopeValue: buildCampaignFallbackScopeValue(campaign.organization_id, campaign.id),
      scopeLabel: campaign.name,
    },
  ]
}

function isLifecycleFollowThroughReady(stage: DeliveryLifecycleStage | null | undefined) {
  return Boolean(stage && NOTIFIABLE_LIFECYCLE_STAGES.has(stage))
}

function isCampaignReadableForManagers(args: {
  totalCompleted: number
  lifecycleStage: DeliveryLifecycleStage | null | undefined
}) {
  return buildResponseActivationState(args.totalCompleted).reportVisible && isLifecycleFollowThroughReady(args.lifecycleStage)
}

async function postManagerResultsNotification(args: {
  managerEmail: string | null
  managerName: string | null
  campaignName: string
  scopeLabel: string
  routeId: string
  responseCount: number | null
}) {
  const adminToken = process.env.BACKEND_ADMIN_TOKEN?.trim()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (adminToken) {
    headers['x-admin-token'] = adminToken
  }

  try {
    const response = await fetch(`${getBackendApiUrl()}/api/internal/action-center/manager-results-notification`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to_email: args.managerEmail,
        manager_name: args.managerName,
        campaign_name: args.campaignName,
        scope_label: args.scopeLabel,
        action_center_path: `/action-center?focus=${encodeURIComponent(args.routeId)}`,
        response_count: args.responseCount,
      }),
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error('Manager-resultaatnotificatie backend gaf geen succesvolle respons terug.', response.status)
    }
  } catch (error) {
    console.error('Manager-resultaatnotificatie kon niet worden verstuurd.', error)
  }
}

export async function notifyManagersForCampaignAvailability(args: {
  campaignId: string
  previousLifecycleStage: DeliveryLifecycleStage | null
  nextLifecycleStage: DeliveryLifecycleStage | null
}) {
  if (
    isLifecycleFollowThroughReady(args.previousLifecycleStage) ||
    !isLifecycleFollowThroughReady(args.nextLifecycleStage)
  ) {
    return
  }

  const admin = createAdminClient()
  const [{ data: campaign }, { data: stats }, { data: respondents }, { data: managerAssignments }] = await Promise.all([
    admin
      .from('campaigns')
      .select('id, organization_id, name')
      .eq('id', args.campaignId)
      .maybeSingle(),
    admin
      .from('campaign_stats')
      .select('campaign_id, total_completed')
      .eq('campaign_id', args.campaignId)
      .maybeSingle(),
    admin.from('respondents').select('campaign_id, department').eq('campaign_id', args.campaignId),
    admin
      .from('action_center_workspace_members')
      .select('org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view')
      .eq('access_role', 'manager_assignee')
      .eq('can_view', true)
      .in('scope_type', ['department', 'item']),
  ])

  if (!campaign) {
    return
  }

  const totalCompleted = stats?.total_completed ?? 0
  if (
    !isCampaignReadableForManagers({
      totalCompleted,
      lifecycleStage: args.nextLifecycleStage,
    })
  ) {
    return
  }

  const scopeCandidates = buildScopeCandidates(
    campaign as CampaignRow,
    ((respondents ?? []) as RespondentDepartmentRow[])
      .map((row) => row.department)
      .filter((value): value is string => Boolean(value)),
  )
  const assignments = ((managerAssignments ?? []) as WorkspaceManagerRow[]).filter(
    (assignment) => assignment.org_id === campaign.organization_id,
  )

  for (const scope of scopeCandidates) {
    const assignment = assignments.find(
      (candidate) => candidate.scope_type === scope.scopeType && candidate.scope_value === scope.scopeValue,
    )
    if (!assignment) {
      continue
    }

    await postManagerResultsNotification({
      managerEmail: assignment.login_email,
      managerName: assignment.display_name,
      campaignName: campaign.name,
      scopeLabel: scope.scopeLabel,
      routeId: buildActionCenterRouteId(campaign.id, scope.scopeValue),
      responseCount: totalCompleted,
    })
  }
}

export async function notifyManagerForAssignmentIfReady(args: {
  orgId: string
  scopeType: 'org' | 'department' | 'item'
  scopeValue: string
  managerEmail: string | null
  managerName: string | null
}) {
  if (args.scopeType === 'org') {
    return
  }

  const admin = createAdminClient()
  const { data: campaigns } = await admin
    .from('campaigns')
    .select('id, organization_id, name')
    .eq('organization_id', args.orgId)

  const eligibleCampaigns = ((campaigns ?? []) as CampaignRow[])
  if (eligibleCampaigns.length === 0) {
    return
  }

  const campaignIds = eligibleCampaigns.map((campaign) => campaign.id)
  const [{ data: statsRows }, { data: deliveryRows }, { data: respondentRows }] = await Promise.all([
    admin.from('campaign_stats').select('campaign_id, total_completed').in('campaign_id', campaignIds),
    admin.from('campaign_delivery_records').select('campaign_id, lifecycle_stage').in('campaign_id', campaignIds),
    admin.from('respondents').select('campaign_id, department').in('campaign_id', campaignIds),
  ])

  const statsByCampaignId = new Map(
    ((statsRows ?? []) as CampaignStatsRow[]).map((row) => [row.campaign_id, row.total_completed]),
  )
  const lifecycleByCampaignId = new Map(
    ((deliveryRows ?? []) as DeliveryRecordRow[]).map((row) => [row.campaign_id, row.lifecycle_stage]),
  )
  const departmentLabelsByCampaignId = ((respondentRows ?? []) as RespondentDepartmentRow[]).reduce<Record<string, string[]>>(
    (acc, row) => {
      const departmentLabel = normalizeDepartmentLabel(row.department)
      if (!departmentLabel) {
        return acc
      }

      acc[row.campaign_id] ??= []
      acc[row.campaign_id].push(departmentLabel)
      return acc
    },
    {},
  )

  for (const campaign of eligibleCampaigns) {
    const totalCompleted = statsByCampaignId.get(campaign.id) ?? 0
    const lifecycleStage = lifecycleByCampaignId.get(campaign.id) ?? null

    if (
      !isCampaignReadableForManagers({
        totalCompleted,
        lifecycleStage,
      })
    ) {
      continue
    }

    const matchingScope = buildScopeCandidates(campaign, departmentLabelsByCampaignId[campaign.id] ?? []).find(
      (scope) => scope.scopeType === args.scopeType && scope.scopeValue === args.scopeValue,
    )

    if (!matchingScope) {
      continue
    }

    await postManagerResultsNotification({
      managerEmail: args.managerEmail,
      managerName: args.managerName,
      campaignName: campaign.name,
      scopeLabel: matchingScope.scopeLabel,
      routeId: buildActionCenterRouteId(campaign.id, matchingScope.scopeValue),
      responseCount: totalCompleted,
    })
  }
}
