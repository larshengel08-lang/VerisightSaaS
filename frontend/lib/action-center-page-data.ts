import { buildLiveActionCenterItems, getLiveActionCenterSummary } from '@/lib/action-center-live'
import type { ActionCenterPreviewManagerOption } from '@/lib/action-center-preview-model'
import {
  isActionCenterRouteDefaultsEnabledScanType,
  isActionCenterRouteDefaultsKnownScanType,
  type ActionCenterRouteDefaultsKnownScanType,
} from '@/lib/action-center-route-defaults'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import { projectActionCenterRouteCloseout } from '@/lib/action-center-route-closeout'
import {
  projectActionCenterRouteFollowUpRelation,
  projectActionCenterRouteReopen,
} from '@/lib/action-center-route-reopen'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isScopeVisibleToActionCenterContext,
  type ActionCenterWorkspaceMember,
  type SuiteAccessContext,
  type SuiteOrgMembership,
} from '@/lib/suite-access'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type {
  ActionCenterManagerResponse,
  ActionCenterReviewDecision,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'
import type { Campaign, CampaignStats, Organization } from '@/lib/types'

type RespondentDepartmentRow = {
  campaign_id: string
  department: string | null
}

type ActionCenterRouteRelationRow = {
  id: string | null
  source_campaign_id: string | null
  target_campaign_id: string | null
  route_relation_type: string | null
  source_route_id: string | null
  target_route_id: string | null
  trigger_reason: string | null
  recorded_at: string | null
  recorded_by_role: string | null
  ended_at: string | null
}

type ActionCenterRouteReopenRow = {
  id: string | null
  route_id: string | null
  reopened_at: string | null
  reopened_by_role: string | null
}

type ActionCenterRouteCloseoutRow = {
  route_id: string | null
  closeout_status: string | null
  closeout_reason: string | null
  closeout_note: string | null
  closed_at: string | null
  closed_by_role: string | null
}

type ActionCenterScopeRow = {
  scopeType: 'department' | 'item'
  scopeValue: string
  scopeLabel: string
  peopleCount: number
}

export interface ActionCenterPageData {
  items: ReturnType<typeof buildLiveActionCenterItems>
  summary: ReturnType<typeof getLiveActionCenterSummary>
  ownerOptions: string[]
  managerOptions: ActionCenterPreviewManagerOption[]
  itemHrefs: Record<string, string>
  organizationNames: string[]
  inviteDownloadEligibleRouteIds: string[]
  routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType>
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  return value?.trim() || null
}

function buildDepartmentScopeValue(orgId: string, departmentLabel: string) {
  return `${orgId}::department::${departmentLabel.toLowerCase()}`
}

function buildCampaignFallbackScopeValue(orgId: string, campaignId: string) {
  return `${orgId}::campaign::${campaignId}`
}

function buildActionCenterScopes(args: {
  campaign: Campaign
  departmentLabels: string[]
  fallbackPeopleCount: number
}) {
  const departmentCounts = args.departmentLabels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
  const departmentEntries = Object.entries(departmentCounts)

  if (departmentEntries.length > 0) {
    return departmentEntries.map<ActionCenterScopeRow>(([departmentLabel, peopleCount]) => ({
      scopeType: 'department',
      scopeValue: buildDepartmentScopeValue(args.campaign.organization_id, departmentLabel),
      scopeLabel: departmentLabel,
      peopleCount,
    }))
  }

  return [
    {
      scopeType: 'item' as const,
      scopeValue: buildCampaignFallbackScopeValue(args.campaign.organization_id, args.campaign.id),
      scopeLabel: args.campaign.name,
      peopleCount: args.fallbackPeopleCount,
    },
  ]
}

function getManagerAssignment(
  workspaceRows: ActionCenterWorkspaceMember[],
  orgId: string,
  scopeValue: string,
) {
  return (
    workspaceRows.find(
      (row) =>
        row.org_id === orgId &&
        row.access_role === 'manager_assignee' &&
        row.scope_value === scopeValue &&
        row.can_view,
    ) ?? null
  )
}

function hasNonEmptyLoginEmail(value: string | null | undefined) {
  return Boolean(value?.trim())
}

function isInviteDownloadEligibleRoute(args: {
  campaign: Campaign
  routeId: string
  assignment: ActionCenterWorkspaceMember | null
  visibleRouteIdSet: Set<string>
}) {
  if (!args.visibleRouteIdSet.has(args.routeId)) {
    return false
  }

  if (!isActionCenterRouteDefaultsEnabledScanType(args.campaign.scan_type)) {
    return false
  }

  return hasNonEmptyLoginEmail(args.assignment?.login_email)
}

export async function getActionCenterPageData({
  context,
  orgMemberships,
  currentUserWorkspaceMemberships,
}: {
  context: SuiteAccessContext
  orgMemberships: SuiteOrgMembership[]
  currentUserWorkspaceMemberships: ActionCenterWorkspaceMember[]
}): Promise<ActionCenterPageData> {
  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]
  const dataClient = createAdminClient()

  const [
    { data: organizationsRaw },
    { data: campaignsRaw },
    { data: statsRaw },
    { data: deliveryRecordsRaw },
    { data: dossiersRaw },
    { data: managerWorkspaceRowsRaw },
    { data: routeRelationsRaw },
  ] = await Promise.all([
    orgIds.length > 0
      ? dataClient.from('organizations').select('id, name, slug, contact_email, is_active, created_at').in('id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaigns').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaign_stats').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('campaign_delivery_records').select('*').in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient.from('pilot_learning_dossiers').select('*').in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient
          .from('action_center_workspace_members')
          .select(
            'id, org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, can_assign, can_schedule_review, created_at, updated_at',
          )
          .in('org_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? dataClient
          .from('action_center_route_relations')
          .select(
            'id, source_campaign_id, target_campaign_id, route_relation_type, source_route_id, target_route_id, trigger_reason, recorded_at, recorded_by_role, ended_at',
          )
          .in('org_id', orgIds)
          .eq('route_relation_type', 'follow-up-from')
      : Promise.resolve({ data: [] }),
  ])

  const organizations = (organizationsRaw ?? []) as Organization[]
  const campaigns = ((campaignsRaw ?? []) as Campaign[]).filter((campaign) =>
    ['exit', 'retention', 'onboarding', 'pulse', 'leadership'].includes(campaign.scan_type),
  )
  const campaignIds = campaigns.map((campaign) => campaign.id)
  const stats = (statsRaw ?? []) as CampaignStats[]
  const deliveryRecords = (deliveryRecordsRaw ?? []) as CampaignDeliveryRecord[]
  const dossiers = ((dossiersRaw ?? []) as PilotLearningDossier[]).filter((dossier) =>
    dossier.campaign_id ? campaignIds.includes(dossier.campaign_id) : false,
  )
  const inviteEligibilityWorkspaceRows = (managerWorkspaceRowsRaw ?? []) as ActionCenterWorkspaceMember[]
  const managerWorkspaceRows = (
    context.canManageActionCenterAssignments ? managerWorkspaceRowsRaw ?? [] : currentUserWorkspaceMemberships
  ) as ActionCenterWorkspaceMember[]
  const statsByCampaignId = new Map(stats.map((entry) => [entry.campaign_id, entry]))
  const routeRelations = ((routeRelationsRaw ?? []) as ActionCenterRouteRelationRow[]).reduce<
    ReturnType<typeof projectActionCenterRouteFollowUpRelation>[]
  >((acc, relation) => {
    const belongsToVisibleCampaign =
      (relation.source_campaign_id ? campaignIds.includes(relation.source_campaign_id) : false) ||
      (relation.target_campaign_id ? campaignIds.includes(relation.target_campaign_id) : false)

    if (!belongsToVisibleCampaign) {
      return acc
    }

    try {
      acc.push(projectActionCenterRouteFollowUpRelation(relation))
    } catch {
      // Ignore malformed legacy rows so one broken relation does not take down the full Action Center page.
    }

    return acc
  }, [])

  const { data: respondentsWithDepartmentsRaw } =
    campaignIds.length > 0
      ? await dataClient.from('respondents').select('campaign_id, department').in('campaign_id', campaignIds)
      : { data: [] }

  const respondentsWithDepartments = (respondentsWithDepartmentsRaw ?? []) as RespondentDepartmentRow[]
  const respondentDepartmentsByCampaign = respondentsWithDepartments.reduce<Record<string, string[]>>((acc, row) => {
    const departmentLabel = normalizeDepartmentLabel(row.department)
    if (!departmentLabel) return acc
    acc[row.campaign_id] ??= []
    acc[row.campaign_id].push(departmentLabel)
    return acc
  }, {})
  const visibleScopesByCampaignId = campaigns.reduce<Record<string, ActionCenterScopeRow[]>>((acc, campaign) => {
    const scopes = buildActionCenterScopes({
      campaign,
      departmentLabels: respondentDepartmentsByCampaign[campaign.id] ?? [],
      fallbackPeopleCount:
        statsByCampaignId.get(campaign.id)?.total_completed ?? statsByCampaignId.get(campaign.id)?.total_invited ?? 0,
    }).filter((scope) => isScopeVisibleToActionCenterContext(context, scope.scopeValue))

    if (scopes.length > 0) {
      acc[campaign.id] = scopes
    }

    return acc
  }, {})
  const visibleRouteIds = campaigns.flatMap((campaign) =>
    (visibleScopesByCampaignId[campaign.id] ?? []).map((scope) => buildActionCenterRouteId(campaign.id, scope.scopeValue)),
  )
  const visibleRouteIdSet = new Set(visibleRouteIds)

  const [
    { data: deliveryCheckpointsRaw },
    { data: learningCheckpointsRaw },
    { data: reviewDecisionsRaw },
    { data: managerResponsesRaw },
    { data: routeReopensRaw },
    { data: routeCloseoutsRaw },
  ] = await Promise.all([
    deliveryRecords.length > 0
      ? dataClient
          .from('campaign_delivery_checkpoints')
          .select('*')
          .in(
            'delivery_record_id',
            deliveryRecords.map((record) => record.id),
          )
      : Promise.resolve({ data: [] }),
    dossiers.length > 0
      ? dataClient
          .from('pilot_learning_checkpoints')
          .select('*')
          .in(
            'dossier_id',
            dossiers.map((dossier) => dossier.id),
          )
      : Promise.resolve({ data: [] }),
    campaignIds.length > 0
      ? dataClient
          .from('action_center_review_decisions')
          .select('*')
          .eq('route_source_type', 'campaign')
          .in('route_source_id', campaignIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length > 0
      ? dataClient
          .from('action_center_manager_responses')
          .select('*')
          .in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
    visibleRouteIds.length > 0
      ? dataClient
          .from('action_center_route_reopens')
          .select('id, route_id, reopened_at, reopened_by_role')
          .in('route_id', visibleRouteIds)
      : Promise.resolve({ data: [] }),
    visibleRouteIds.length > 0
      ? dataClient
          .from('action_center_route_closeouts')
          .select('route_id, closeout_status, closeout_reason, closeout_note, closed_at, closed_by_role')
          .in('route_id', visibleRouteIds)
      : Promise.resolve({ data: [] }),
  ])

  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as CampaignDeliveryCheckpoint[]
  const learningCheckpoints = (learningCheckpointsRaw ?? []) as PilotLearningCheckpoint[]
  const reviewDecisions = (reviewDecisionsRaw ?? []) as ActionCenterReviewDecision[]
  const managerResponses = (managerResponsesRaw ?? []) as ActionCenterManagerResponse[]
  const routeReopens = ((routeReopensRaw ?? []) as ActionCenterRouteReopenRow[]).reduce<
    ReturnType<typeof projectActionCenterRouteReopen>[]
  >((acc, routeReopen) => {
    try {
      const parsedRouteReopen = projectActionCenterRouteReopen(routeReopen)
      if (visibleRouteIdSet.has(parsedRouteReopen.routeId)) {
        acc.push(parsedRouteReopen)
      }
    } catch {
      // Ignore malformed legacy rows so one broken reopen does not take down the full Action Center page.
    }

    return acc
  }, [])
  const routeCloseoutMap = ((routeCloseoutsRaw ?? []) as ActionCenterRouteCloseoutRow[]).reduce<
    Record<string, ReturnType<typeof projectActionCenterRouteCloseout>>
  >((acc, routeCloseout) => {
    try {
      const parsedRouteCloseout = projectActionCenterRouteCloseout(routeCloseout)
      if (visibleRouteIdSet.has(parsedRouteCloseout.routeId)) {
        acc[parsedRouteCloseout.routeId] = parsedRouteCloseout
      }
    } catch {
      // Ignore malformed legacy closeout rows so one broken record does not take down the full Action Center page.
    }

    return acc
  }, {})

  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const roleByOrgId = orgMemberships.reduce<Record<string, 'owner' | 'member' | 'viewer'>>((acc, membership) => {
    if (!acc[membership.org_id]) {
      acc[membership.org_id] = membership.role
    }
    return acc
  }, {})
  const deliveryRecordByCampaignId = new Map(deliveryRecords.map((record) => [record.campaign_id, record]))
  const deliveryCheckpointMap = deliveryCheckpoints.reduce<Record<string, CampaignDeliveryCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.delivery_record_id] ??= []
    acc[checkpoint.delivery_record_id].push(checkpoint)
    return acc
  }, {})
  const learningDossierByCampaignId = new Map(dossiers.map((dossier) => [dossier.campaign_id ?? dossier.id, dossier]))
  const learningCheckpointMap = learningCheckpoints.reduce<Record<string, PilotLearningCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.dossier_id] ??= []
    acc[checkpoint.dossier_id].push(checkpoint)
    return acc
  }, {})
  const reviewDecisionMap = reviewDecisions.reduce<Record<string, ActionCenterReviewDecision[]>>((acc, record) => {
    acc[record.route_source_id] ??= []
    acc[record.route_source_id].push(record)
    return acc
  }, {})
  const managerResponseByRouteId = new Map(
    managerResponses.map((response) => [
      buildActionCenterRouteId(response.campaign_id, response.route_scope_value),
      response,
    ]),
  )
  const routeFollowUpRelationMap = routeRelations.reduce<Record<string, typeof routeRelations>>((acc, relation) => {
    acc[relation.sourceRouteId] ??= []
    acc[relation.targetRouteId] ??= []
    acc[relation.sourceRouteId].push(relation)
    acc[relation.targetRouteId].push(relation)
    return acc
  }, {})
  const routeReopenMap = routeReopens.reduce<Record<string, typeof routeReopens>>((acc, routeReopen) => {
    acc[routeReopen.routeId] ??= []
    acc[routeReopen.routeId].push(routeReopen)
    return acc
  }, {})

  const inviteDownloadEligibleRouteIds: string[] = []
  const routeScanTypeByRouteId: Record<string, ActionCenterRouteDefaultsKnownScanType> = {}
  const liveContexts = campaigns.flatMap((campaign) => {
    return (visibleScopesByCampaignId[campaign.id] ?? []).map((scope) => {
      const deliveryRecord = deliveryRecordByCampaignId.get(campaign.id) ?? null
      const learningDossier = learningDossierByCampaignId.get(campaign.id) ?? null
      const assignment = getManagerAssignment(managerWorkspaceRows, campaign.organization_id, scope.scopeValue)
      const inviteEligibilityAssignment = getManagerAssignment(
        inviteEligibilityWorkspaceRows,
        campaign.organization_id,
        scope.scopeValue,
      )
      const routeId = buildActionCenterRouteId(campaign.id, scope.scopeValue)

      if (isActionCenterRouteDefaultsKnownScanType(campaign.scan_type)) {
        routeScanTypeByRouteId[routeId] = campaign.scan_type
      }

      if (
        isInviteDownloadEligibleRoute({
          campaign,
          routeId,
          assignment: inviteEligibilityAssignment,
          visibleRouteIdSet,
        })
      ) {
        inviteDownloadEligibleRouteIds.push(routeId)
      }

      return {
        campaign,
        stats: statsByCampaignId.get(campaign.id) ?? null,
        organizationName: organizationById.get(campaign.organization_id)?.name ?? 'Loep organisatie',
        memberRole: roleByOrgId[campaign.organization_id] ?? null,
        scopeType: scope.scopeType,
        scopeValue: scope.scopeValue,
        scopeLabel: scope.scopeLabel,
        peopleCount: scope.peopleCount,
        assignedManager: assignment
          ? {
              userId: assignment.user_id,
              displayName: assignment.display_name ?? assignment.login_email ?? null,
              assignedAt: assignment.created_at ?? null,
            }
          : null,
        deliveryRecord,
        deliveryCheckpoints: deliveryRecord ? (deliveryCheckpointMap[deliveryRecord.id] ?? []) : [],
        learningDossier,
        learningCheckpoints: learningDossier ? (learningCheckpointMap[learningDossier.id] ?? []) : [],
        managerResponse: managerResponseByRouteId.get(routeId) ?? null,
        reviewDecisions: reviewDecisionMap[campaign.id] ?? [],
        routeCloseout: routeCloseoutMap[routeId] ?? null,
        routeFollowUpRelations: routeFollowUpRelationMap[routeId] ?? [],
        routeReopens: routeReopenMap[routeId] ?? [],
      }
    })
  })

  const items = buildLiveActionCenterItems(liveContexts)
  const summary = getLiveActionCenterSummary(items)
  const ownerOptions = [...new Set(items.map((item) => item.ownerName).filter((value): value is string => Boolean(value)))].sort(
    (left, right) => left.localeCompare(right),
  )
  const managerOptions = [...new Map(
    managerWorkspaceRows
      .filter((row) => row.access_role === 'manager_assignee')
      .map((row) => [
        row.user_id,
        {
          value: row.user_id,
          label: row.display_name ?? row.login_email ?? 'Manager',
        },
      ]),
  ).values()].sort((left, right) => left.label.localeCompare(right.label))
  const itemHrefs = context.canViewInsights
    ? Object.fromEntries(items.map((item) => [item.id, `/campaigns/${item.coreSemantics.route.campaignId}`]))
    : {}

  return {
    items,
    summary,
    ownerOptions,
    managerOptions,
    itemHrefs,
    organizationNames: [...new Set(organizations.map((organization) => organization.name).filter(Boolean))],
    inviteDownloadEligibleRouteIds,
    routeScanTypeByRouteId,
  }
}
