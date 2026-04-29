import { redirect } from 'next/navigation'
import type { ActionCenterReviewOutcome } from '@/lib/action-center-route-contract'
import {
  ActionCenterPreview,
} from '@/components/dashboard/action-center-preview'
import { projectActionCenterCoreSemantics } from '@/lib/action-center-core-semantics'
import type {
  ActionCenterPreviewItem,
  ActionCenterPreviewView,
} from '@/lib/action-center-preview-model'
import { PilotLearningWorkbench } from '@/components/dashboard/pilot-learning-workbench'
import {
  buildExitActionCenterWorkspace,
  isExitActionCenterCandidate,
} from '@/lib/action-center-exit'
import {
  DashboardPanel,
  DashboardSection,
} from '@/components/dashboard/dashboard-primitives'
import { finalizeActionCenterPreviewItem } from '@/lib/action-center-live'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionCenterReviewDecision,
  ContactRequestRecord,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'
import { SCAN_TYPE_LABELS, type Campaign, type CampaignStats, type Organization } from '@/lib/types'

type SearchParams = Record<string, string | string[] | undefined>

interface Props {
  searchParams?: Promise<SearchParams>
}

const ACTION_CENTER_VIEWS = new Set<ActionCenterPreviewView>([
  'overview',
  'actions',
  'reviews',
  'managers',
  'teams',
])

const DUTCH_SHORT_DATE = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
})

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : null
}

function isExitRouteInterest(value: ContactRequestRecord['route_interest'] | ContactRequestRecord['qualified_route']) {
  return value === 'exitscan'
}

function filterCountsByOrgIds(source: Record<string, number>, orgIds: Set<string>) {
  return Object.entries(source).reduce<Record<string, number>>((acc, [orgId, count]) => {
    if (orgIds.has(orgId)) {
      acc[orgId] = count
    }
    return acc
  }, {})
}

function getInitialActionCenterView(value: string | null): ActionCenterPreviewView {
  if (value && ACTION_CENTER_VIEWS.has(value as ActionCenterPreviewView)) {
    return value as ActionCenterPreviewView
  }

  return 'overview'
}

function formatPreviewDate(value: string | null) {
  if (!value) return 'Nog niet gepland'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return DUTCH_SHORT_DATE.format(parsed).replace('.', '')
}

function inferPreviewRhythm(reviewMoment: string | null) {
  if (!reviewMoment) return 'Tweewekelijks'

  const parsed = new Date(reviewMoment)
  if (Number.isNaN(parsed.getTime())) return 'Maandelijks'

  const diffDays = Math.ceil((parsed.getTime() - Date.now()) / 86400000)
  if (diffDays <= 7) return 'Wekelijks'
  if (diffDays <= 14) return 'Tweewekelijks'
  if (diffDays <= 45) return 'Maandelijks'
  return 'Per kwartaal'
}

function estimateHeadcount(value: string | null) {
  const match = value?.match(/\d+/)
  return match ? Number.parseInt(match[0], 10) : 0
}

function normalizePreviewReviewOutcome(value: string | null | undefined): ActionCenterReviewOutcome {
  switch (value?.trim()) {
    case 'doorgaan':
    case 'bijstellen':
    case 'opschalen':
    case 'afronden':
    case 'stoppen':
      return value.trim() as ActionCenterReviewOutcome
    default:
      return 'geen-uitkomst'
  }
}

export default async function KlantLearningsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const initialLeadId = getSingleValue(resolvedSearchParams.lead)
  const initialCampaignId = getSingleValue(resolvedSearchParams.campaign)
  const initialView = getInitialActionCenterView(getSingleValue(resolvedSearchParams.view))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    redirect('/dashboard')
  }

  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', user.id)

  const orgs = (memberships?.flatMap((membership) => membership.organizations).filter(Boolean) ?? []) as Organization[]
  const activeOrgs = orgs.filter((org) => org.is_active)
  const orgIds = activeOrgs.map((org) => org.id)

  const [
    { data: campaignsRaw },
    { data: campaignStatsRaw },
    { data: dossiersRaw },
    { data: checkpointsRaw },
    { data: reviewDecisionsRaw },
    { data: clientAccessRaw },
    { data: pendingInvitesRaw },
  ] = await Promise.all([
    orgIds.length
      ? supabase
          .from('campaigns')
          .select('*')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length
      ? supabase
          .from('campaign_stats')
          .select('*')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from('pilot_learning_dossiers')
      .select('*')
      .order('updated_at', { ascending: false }),
    supabase
      .from('pilot_learning_checkpoints')
      .select('*')
      .order('updated_at', { ascending: false }),
    supabase
      .from('action_center_review_decisions')
      .select('*')
      .eq('route_source_type', 'campaign')
      .order('decision_recorded_at', { ascending: false }),
    orgIds.length
      ? supabase
          .from('org_members')
          .select('org_id, role')
          .in('org_id', orgIds)
          .in('role', ['viewer', 'member'])
      : Promise.resolve({ data: [] }),
    orgIds.length
      ? supabase
          .from('org_invites')
          .select('org_id')
          .in('org_id', orgIds)
          .is('accepted_at', null)
      : Promise.resolve({ data: [] }),
  ])

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const campaignStats = (campaignStatsRaw ?? []) as CampaignStats[]
  const dossiers = (dossiersRaw ?? []) as PilotLearningDossier[]
  const checkpoints = (checkpointsRaw ?? []) as PilotLearningCheckpoint[]
  const reviewDecisions = (reviewDecisionsRaw ?? []) as ActionCenterReviewDecision[]
  const activeClientAccessByOrg = (clientAccessRaw ?? []).reduce<Record<string, number>>((acc, membership) => {
    acc[membership.org_id] = (acc[membership.org_id] ?? 0) + 1
    return acc
  }, {})
  const pendingClientInvitesByOrg = (pendingInvitesRaw ?? []).reduce<Record<string, number>>((acc, invite) => {
    acc[invite.org_id] = (acc[invite.org_id] ?? 0) + 1
    return acc
  }, {})

  const {
    rows: leads,
    configError,
    loadError,
  } = await getContactRequestsForAdmin(50)

  const exitCampaigns = campaigns.filter((campaign) => campaign.scan_type === 'exit')
  const exitCampaignIds = new Set(exitCampaigns.map((campaign) => campaign.id))
  const exitCampaignStats = campaignStats.filter(
    (stats) => stats.scan_type === 'exit' || exitCampaignIds.has(stats.campaign_id),
  )
  const exitDossiers = dossiers.filter((dossier) =>
    isExitActionCenterCandidate({
      dossier: {
        scanType: dossier.scan_type,
        routeInterest: dossier.route_interest,
        campaignId: dossier.campaign_id,
      },
      exitCampaignIds,
    }),
  )
  const exitDossierIds = new Set(exitDossiers.map((dossier) => dossier.id))
  const exitCheckpoints = checkpoints.filter((checkpoint) => exitDossierIds.has(checkpoint.dossier_id))
  const exitLeadIdsFromDossiers = new Set(
    exitDossiers
      .map((dossier) => dossier.contact_request_id)
      .filter((value): value is string => Boolean(value)),
  )
  const exitLeads = leads.filter(
    (lead) =>
      isExitRouteInterest(lead.route_interest) ||
      isExitRouteInterest(lead.qualified_route) ||
      exitLeadIdsFromDossiers.has(lead.id),
  )
  const exitOrgIds = new Set<string>([
    ...exitCampaigns.map((campaign) => campaign.organization_id),
    ...exitDossiers
      .map((dossier) => dossier.organization_id)
      .filter((value): value is string => Boolean(value)),
  ])
  const exitOrgs = activeOrgs.filter((org) => exitOrgIds.has(org.id))
  const exitActiveClientAccessByOrg = filterCountsByOrgIds(activeClientAccessByOrg, exitOrgIds)
  const exitPendingClientInvitesByOrg = filterCountsByOrgIds(pendingClientInvitesByOrg, exitOrgIds)

  const checkpointsByDossier = exitCheckpoints.reduce<Record<string, PilotLearningCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.dossier_id] ??= []
    acc[checkpoint.dossier_id].push(checkpoint)
    return acc
  }, {})
  const exitCampaignById = new Map(exitCampaigns.map((campaign) => [campaign.id, campaign]))
  const exitCampaignStatsById = new Map(exitCampaignStats.map((stats) => [stats.campaign_id, stats]))
  const exitLeadById = new Map(exitLeads.map((lead) => [lead.id, lead]))
  const exitOrgById = new Map(exitOrgs.map((org) => [org.id, org]))
  const reviewDecisionsByRouteId = reviewDecisions.reduce<Record<string, ActionCenterReviewDecision[]>>((acc, decision) => {
    acc[decision.route_source_id] ??= []
    acc[decision.route_source_id].push(decision)
    return acc
  }, {})
  const invitedCountByOrgId = exitCampaignStats.reduce<Record<string, number>>((acc, stats) => {
    acc[stats.organization_id] = (acc[stats.organization_id] ?? 0) + stats.total_invited
    return acc
  }, {})

  const exitWorkspace = buildExitActionCenterWorkspace({
    role: 'member',
    dossiers: exitDossiers.map((dossier) => {
      const dossierCheckpoints = checkpointsByDossier[dossier.id] ?? []
      const firstManagementCheckpoint =
        dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use') ?? null
      const followUpReviewCheckpoint =
        dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'follow_up_review') ?? null

      return {
        id: dossier.id,
        title: dossier.title,
        triageStatus: dossier.triage_status,
        deliveryMode: dossier.delivery_mode,
        managementOwnerLabel: firstManagementCheckpoint?.owner_label ?? null,
        reviewOwnerLabel: followUpReviewCheckpoint?.owner_label ?? null,
        firstActionTaken: dossier.first_action_taken,
        reviewMoment: dossier.review_moment,
        managementActionOutcome: dossier.management_action_outcome,
        nextRoute: dossier.next_route,
        stopReason: dossier.stop_reason,
      }
    }),
  })

  const openSignals = exitWorkspace.followUpSignals.filter((signal) => signal.state === 'open')
  const initialExitLeadId = exitLeads.some((lead) => lead.id === initialLeadId) ? initialLeadId : null
  const initialExitCampaignId = exitCampaigns.some((campaign) => campaign.id === initialCampaignId)
    ? initialCampaignId
    : null
  const fallbackOwnerName = 'Verisight beheer'
  const previewItems: ActionCenterPreviewItem[] = exitDossiers.map((dossier, index) => {
    const dossierCheckpoints = checkpointsByDossier[dossier.id] ?? []
    const managementCheckpoint =
      dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use') ?? null
    const reviewCheckpoint =
      dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'follow_up_review') ?? null
    const assignment = exitWorkspace.assignments.find((item) => item.dossierId === dossier.id) ?? null
    const reviewMoment = exitWorkspace.reviewMoments.find((item) => item.dossierId === dossier.id) ?? null
    const dossierSignals = openSignals.filter((signal) => signal.dossierId === dossier.id)
    const organization = dossier.organization_id ? exitOrgById.get(dossier.organization_id) ?? null : null
    const campaign = dossier.campaign_id ? exitCampaignById.get(dossier.campaign_id) ?? null : null
    const campaignStats = dossier.campaign_id ? exitCampaignStatsById.get(dossier.campaign_id) ?? null : null
    const lead = dossier.contact_request_id ? exitLeadById.get(dossier.contact_request_id) ?? null : null
    const ownerName = managementCheckpoint?.owner_label?.trim() || reviewCheckpoint?.owner_label?.trim() || null
    const teamLabel =
      organization?.name ??
      dossier.lead_organization_name ??
      lead?.organization ??
      campaign?.name ??
      `Dossier ${index + 1}`
    const sourceLabel =
      dossier.route_interest === 'exitscan'
        ? 'ExitScan'
        : dossier.route_interest === 'retentiescan'
          ? 'RetentieScan'
          : dossier.route_interest === 'combinatie'
            ? 'Combinatie'
            : dossier.route_interest === 'teamscan'
              ? 'TeamScan'
              : dossier.scan_type
                ? SCAN_TYPE_LABELS[dossier.scan_type]
                : 'ExitScan'
    const priority =
      dossierSignals.some((signal) => signal.severity === 'critical')
        ? 'hoog'
        : dossierSignals.length > 1
          ? 'midden'
          : 'laag'
    const status =
      assignment?.state === 'completed'
        ? 'afgerond'
        : assignment?.state === 'cancelled'
          ? 'gestopt'
          : assignment?.state === 'waiting' || dossierSignals.some((signal) => signal.severity === 'critical')
            ? 'geblokkeerd'
            : assignment?.state === 'active'
              ? 'in-uitvoering'
              : 'te-bespreken'
    const summary =
      dossier.first_action_taken ??
      dossier.management_action_outcome ??
      dossier.first_management_value ??
      dossier.expected_first_value ??
      lead?.current_question ??
      'Eerste vervolgstap nog vast te leggen.'
    const reason =
      dossier.first_management_value ??
      dossier.buyer_question ??
      dossier.buying_reason ??
      dossier.trust_friction ??
      lead?.current_question ??
      'Nog geen expliciete onderbouwing vastgelegd in de dossierbron.'
    const signalBody =
      managementCheckpoint?.confirmed_lesson ??
      managementCheckpoint?.interpreted_observation ??
      managementCheckpoint?.qualitative_notes ??
      reviewCheckpoint?.confirmed_lesson ??
      reviewCheckpoint?.qualitative_notes ??
      dossier.management_action_outcome ??
      dossier.implementation_risk ??
      'Gebruik dossierbron en checkpoints om de opvolging verder te concretiseren.'
    const updates = [...dossierCheckpoints]
      .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
      .slice(0, 3)
      .map((checkpoint) => ({
        id: checkpoint.id,
        author: checkpoint.owner_label || fallbackOwnerName,
        dateLabel: formatPreviewDate(checkpoint.updated_at),
        note:
          checkpoint.confirmed_lesson ??
          checkpoint.interpreted_observation ??
          checkpoint.qualitative_notes ??
          checkpoint.objective_signal_notes ??
          `${checkpoint.checkpoint_key.replace(/_/g, ' ')} bijgewerkt in dossierbron.`,
      }))

    const previewItem = finalizeActionCenterPreviewItem({
      id: dossier.id,
      code: `ACT-${1041 + index}`,
      title: dossier.title,
      summary,
      reason,
      orgId: organization?.id ?? dossier.organization_id ?? campaign?.organization_id ?? null,
      sourceLabel,
      teamId: organization?.id ?? campaign?.organization_id ?? `team-${dossier.id}`,
      teamLabel,
      ownerName,
      ownerRole: ownerName ? 'Manager' : 'Nog niet toegewezen',
      ownerSubtitle: teamLabel,
      reviewOwnerName: reviewCheckpoint?.owner_label?.trim() || ownerName,
      priority,
      status,
      reviewDate: reviewMoment?.state === 'scheduled' ? reviewMoment.scheduledFor : null,
      expectedEffect: dossier.expected_first_value ?? null,
      reviewReason: reason,
      reviewOutcome: normalizePreviewReviewOutcome(dossier.management_action_outcome),
      reviewDateLabel: formatPreviewDate(reviewMoment?.state === 'scheduled' ? reviewMoment.scheduledFor : null),
      reviewRhythm: inferPreviewRhythm(reviewMoment?.state === 'scheduled' ? reviewMoment.scheduledFor : null),
      signalLabel: `${sourceLabel} - ${teamLabel}`,
      signalBody,
      nextStep: assignment?.title ?? 'Leg eerste opvolgstap vast',
      peopleCount:
        organization?.id && invitedCountByOrgId[organization.id]
          ? invitedCountByOrgId[organization.id]
          : campaignStats?.total_invited ?? estimateHeadcount(dossier.lead_employee_count),
      updates:
        updates.length > 0
          ? updates
          : [
              {
                id: `fallback-${dossier.id}`,
                author: ownerName ?? fallbackOwnerName,
                dateLabel: formatPreviewDate(dossier.updated_at),
                note: summary,
              },
            ],
    })

    if (!campaign) {
      return previewItem
    }

    const authoredReviewDecisions = reviewDecisionsByRouteId[campaign.id] ?? []
    if (authoredReviewDecisions.length === 0) {
      return previewItem
    }

    const coreSemantics = projectActionCenterCoreSemantics({
      campaign,
      assignedManager: null,
      deliveryRecord: null,
      learningDossier: dossier,
      learningCheckpoints: dossierCheckpoints,
      reviewDecisions: authoredReviewDecisions,
      route: {
        ...previewItem.coreSemantics.route,
        campaignId: campaign.id,
      },
      latestVisibleUpdateNote: previewItem.updates[0]?.note ?? null,
      decisionRecords: [],
    })

    return finalizeActionCenterPreviewItem(
      {
        ...previewItem,
        reviewOutcome: coreSemantics.route.reviewOutcome,
        coreSemantics,
      },
      { recomputeCoreSemantics: false },
    )
  })
  const ownerOptions = Array.from(
    new Set(previewItems.map((item) => item.ownerName).filter((value): value is string => Boolean(value))),
  ).sort((left, right) => left.localeCompare(right))

  return (
    <div className="space-y-6">
      <ActionCenterPreview
        initialItems={previewItems}
        initialView={initialView}
        fallbackOwnerName={fallbackOwnerName}
        ownerOptions={ownerOptions}
        workbenchHref="#dossierbron"
      />

      {configError ? (
        <DashboardSection
          id="issues"
          surface="ops"
          eyebrow="Config"
          title="Leadinput is niet volledig beschikbaar"
          description="De ExitScan-workbench werkt wel, maar kan de server-side leadlijst nog niet ophalen."
        >
          <DashboardPanel surface="ops" title="Ontbrekende configuratie" body={configError} tone="amber" />
        </DashboardSection>
      ) : null}

      {loadError ? (
        <DashboardSection
          id={configError ? undefined : 'issues'}
          surface="ops"
          eyebrow="Load"
          title="Leadlijst kon niet worden geladen"
          description="De ExitScan-workbench blijft bruikbaar, maar recente contactaanvragen konden niet worden opgehaald voor triage."
        >
          <DashboardPanel surface="ops" title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id="dossierbron"
        surface="ops"
        eyebrow="Dossierbron"
        title="Dossierlog en bounded opvolging"
        description="Bewuste delta ten opzichte van de preview: de echte dossierbron blijft zichtbaar onder de nieuwe surface, zodat admin-first opvolging en dossierbron op current main bij elkaar blijven."
      >
        <PilotLearningWorkbench
          orgs={exitOrgs}
          campaigns={exitCampaigns}
          campaignStats={exitCampaignStats}
          leads={exitLeads as ContactRequestRecord[]}
          dossiers={exitDossiers}
          checkpoints={exitCheckpoints}
          reviewDecisions={reviewDecisions}
          activeClientAccessByOrg={exitActiveClientAccessByOrg}
          pendingClientInvitesByOrg={exitPendingClientInvitesByOrg}
          initialLeadId={initialExitLeadId}
          initialCampaignId={initialExitCampaignId}
        />
      </DashboardSection>
    </div>
  )
}
