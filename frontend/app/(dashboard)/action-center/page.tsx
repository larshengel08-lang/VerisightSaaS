import { redirect } from 'next/navigation'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import { buildLiveActionCenterItems, getLiveActionCenterSummary } from '@/lib/action-center-live'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import {
  projectActionCenterRouteFollowUpRelation,
  projectActionCenterRouteReopen,
} from '@/lib/action-center-route-reopen'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isScopeVisibleToActionCenterContext,
  type ActionCenterWorkspaceMember,
} from '@/lib/suite-access'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { createClient } from '@/lib/supabase/server'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type {
  ActionCenterReviewDecision,
  ActionCenterManagerResponse,
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

type ActionCenterScopeRow = {
  scopeType: 'department' | 'item'
  scopeValue: string
  scopeLabel: string
  peopleCount: number
}

function getDisplayName(email: string | null | undefined) {
  if (!email) return 'Verisight gebruiker'
  const localPart = email.split('@')[0] ?? 'verisight-gebruiker'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

export default async function ActionCenterPage({
  searchParams,
}: {
  searchParams?: Promise<{ focus?: string; source?: string }>
}) {
  const params = (await searchParams) ?? {}
  const focusItemId = typeof params.focus === 'string' ? params.focus : null
  const source = typeof params.source === 'string' ? params.source : null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const {
    context,
    orgMemberships,
    workspaceMemberships: currentUserWorkspaceMemberships,
  } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canViewActionCenter) {
    redirect('/dashboard')
  }

  const orgIds = [...new Set([...context.organizationIds, ...context.workspaceOrgIds])]

  if (orgIds.length === 0 && !context.isVerisightAdmin) {
    redirect('/dashboard')
  }

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

  const liveContexts = campaigns.flatMap((campaign) => {
    return (visibleScopesByCampaignId[campaign.id] ?? []).map((scope) => {
        const deliveryRecord = deliveryRecordByCampaignId.get(campaign.id) ?? null
        const learningDossier = learningDossierByCampaignId.get(campaign.id) ?? null
        const assignment = getManagerAssignment(managerWorkspaceRows, campaign.organization_id, scope.scopeValue)
        const routeId = buildActionCenterRouteId(campaign.id, scope.scopeValue)

        return {
          campaign,
          stats: statsByCampaignId.get(campaign.id) ?? null,
          organizationName: organizationById.get(campaign.organization_id)?.name ?? 'Verisight organisatie',
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
          routeFollowUpRelations: routeFollowUpRelationMap[routeId] ?? [],
          routeReopens: routeReopenMap[routeId] ?? [],
        }
      })
  })

  const items = buildLiveActionCenterItems(liveContexts)
  const summary = getLiveActionCenterSummary(items)
  const ownerOptions = [...new Set(items.map((item) => item.ownerName).filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right))
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
  const initialSelectedItemId =
    focusItemId
      ? (items.find((item) => item.id === focusItemId)?.id ??
        items.find((item) => item.coreSemantics.route.campaignId === focusItemId)?.id ??
        null)
      : null
  const workspaceSubtitle =
    source === 'campaign-detail'
      ? 'Geopend vanuit campaign detail: hier worden eigenaarschap, eerste managerstap en reviewritme expliciet.'
      : summary.productCount > 0
        ? `Live opvolging over ${summary.productCount} product${summary.productCount === 1 ? '' : 'en'}`
        : 'Live opvolging'

  if (items.length === 0) {
    return (
      <div className="rounded-[30px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-7 py-8 shadow-[0_18px_48px_rgba(19,32,51,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">
          Action Center
        </p>
        <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.055em] text-[color:var(--dashboard-ink)]">
          Nog geen live opvolging zichtbaar
        </h1>
        <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-[color:var(--dashboard-text)]">
          Zodra er actieve campagnes, open opvolging of bestaande dossiers voor jouw organisaties of
          afdelingen zijn, opent deze module automatisch.
        </p>
        <div className="mt-7 grid gap-4 border-t border-[color:var(--dashboard-frame-border)] pt-6 xl:grid-cols-[minmax(0,1.3fr),minmax(260px,0.7fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Wat hier straks landt
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">
              Samenvatting, reviewritme en eigenaarschap verschijnen hier pas als er echt iets op te volgen is.
              Daardoor blijft Action Center rustig en direct bruikbaar.
            </p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
              Volgende stap
            </p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--dashboard-text)]">
              Wanneer de eerste opvolging live staat, zie je hier direct wat aandacht vraagt, wie eigenaar is
              en wanneer review volgt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ActionCenterPreview
      initialItems={items}
      initialSelectedItemId={initialSelectedItemId}
      initialView="overview"
      fallbackOwnerName={getDisplayName(user.email)}
      ownerOptions={ownerOptions}
      managerOptions={managerOptions}
      canAssignManagers={context.canManageActionCenterAssignments}
      managerAssignmentEndpoint="/api/action-center/workspace-members"
      canRespondToRequests={context.canUpdateActionCenter}
      managerResponseEndpoint="/api/action-center-manager-responses"
      routeFollowUpEndpoint="/api/action-center-route-follow-ups"
      currentUserId={user.id}
      workbenchHref={context.canViewInsights ? '/dashboard' : '/action-center'}
      workbenchLabel={context.canViewInsights ? 'Open broncampagne' : 'Blijf in Action Center'}
      workspaceName={getDisplayName(user.email)}
      workspaceSubtitle={workspaceSubtitle}
      readOnly
      itemHrefs={itemHrefs}
      hideSidebar
    />
  )
}
