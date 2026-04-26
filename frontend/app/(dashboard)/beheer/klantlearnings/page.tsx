import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PilotLearningWorkbench } from '@/components/dashboard/pilot-learning-workbench'
import {
  buildExitActionCenterWorkspace,
  isExitActionCenterCandidate,
} from '@/lib/action-center-exit'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
  DashboardSummaryBar,
} from '@/components/dashboard/dashboard-primitives'
import { getContactRequestsForAdmin } from '@/lib/contact-requests'
import { createClient } from '@/lib/supabase/server'
import type {
  ContactRequestRecord,
  PilotLearningCheckpoint,
  PilotLearningDossier,
} from '@/lib/pilot-learning'
import type { Campaign, CampaignStats, Organization } from '@/lib/types'

type SearchParams = Record<string, string | string[] | undefined>

interface Props {
  searchParams?: Promise<SearchParams>
}

const REVIEW_MOMENT_PENDING_LABEL = 'Exit reviewmoment nog vastleggen'

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

function isReviewMomentPlanned(value: string) {
  return value !== REVIEW_MOMENT_PENDING_LABEL
}

export default async function KlantLearningsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const initialLeadId = getSingleValue(resolvedSearchParams.lead)
  const initialCampaignId = getSingleValue(resolvedSearchParams.campaign)

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

  const openLessons = exitCheckpoints.filter((checkpoint) => checkpoint.status === 'nieuw').length
  const confirmedLessons = exitCheckpoints.filter((checkpoint) => checkpoint.status === 'bevestigd').length
  const campaignLinkedDossiers = exitDossiers.filter((dossier) => dossier.campaign_id).length
  const leadLinkedDossiers = exitDossiers.filter((dossier) => dossier.contact_request_id).length
  const checkpointsByDossier = exitCheckpoints.reduce<Record<string, PilotLearningCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.dossier_id] ??= []
    acc[checkpoint.dossier_id].push(checkpoint)
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

  const openExitDossiers = exitWorkspace.dossiers.filter((dossier) => dossier.status === 'open')
  const openReviewMoments = exitWorkspace.reviewMoments.filter(
    (reviewMoment) => reviewMoment.state === 'due' || reviewMoment.state === 'scheduled',
  )
  const openSignals = exitWorkspace.followUpSignals.filter((signal) => signal.state === 'open')
  const explicitOwnerCount = exitWorkspace.dossiers.filter((dossier) => dossier.ownerId).length
  const explicitOwnerOpenCount = openExitDossiers.filter((dossier) => dossier.ownerId).length
  const dueReviewCount = openReviewMoments.filter((reviewMoment) => reviewMoment.state === 'due').length
  const scheduledReviewCount = openReviewMoments.length - dueReviewCount
  const activeClientAccessCount = Object.values(exitActiveClientAccessByOrg).reduce((sum, count) => sum + count, 0)
  const initialExitLeadId = exitLeads.some((lead) => lead.id === initialLeadId) ? initialLeadId : null
  const initialExitCampaignId = exitCampaigns.some((campaign) => campaign.id === initialCampaignId)
    ? initialCampaignId
    : null

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        eyebrow="Action Center voor ExitScan-follow-through"
        title="Operations Action Center"
        description="ExitScan follow-through als zelfstandige productlaag: deze live slice voedt de bestaande Action Center-core rechtstreeks met echte ExitScan-dossiers, checkpoints en campaigncontext zonder andere productadapters of dashboardsporen te openen."
        tone="slate"
        meta={
          <>
            <DashboardChip
              surface="ops"
              label={`${exitDossiers.length} dossier${exitDossiers.length === 1 ? '' : 's'}`}
              tone="slate"
            />
            <DashboardChip surface="ops" label={`${openLessons} open checkpoints`} tone={openLessons > 0 ? 'amber' : 'slate'} />
            <DashboardChip surface="ops" label={`${confirmedLessons} bevestigd`} tone={confirmedLessons > 0 ? 'emerald' : 'slate'} />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Terug naar setup
            </Link>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open leadlijst
            </Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Vaste checkpointvolgorde</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Lead en routehypothese</li>
              <li>Implementation intake</li>
              <li>Launch en eerste output</li>
              <li>Eerste managementgebruik</li>
              <li>30-90 dagen review</li>
            </ol>
            <p className="text-xs text-slate-500">
              Manual-first blijft prima zolang de les hier expliciet wordt vastgelegd. Geen MTO-framing, geen buyer-facing claims en geen portfolioverbreding via deze route; dit blijft een interne ExitScan-adminlaag.
            </p>
          </div>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'ExitScan dossiers',
            value: `${exitWorkspace.summary.openDossierCount}`,
            tone: exitWorkspace.summary.openDossierCount > 0 ? 'slate' : 'amber',
          },
          {
            label: 'Reviewdruk',
            value: `${exitWorkspace.summary.reviewDueCount}`,
            tone: exitWorkspace.summary.reviewDueCount > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Dossiers',
            value: `${exitDossiers.length} actief`,
            tone: exitDossiers.length > 0 ? 'slate' : 'amber',
          },
          {
            label: 'Open checkpoints',
            value: `${openLessons}`,
            tone: openLessons > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Leadkoppeling',
            value: `${leadLinkedDossiers}/${exitDossiers.length || 0}`,
            tone: leadLinkedDossiers > 0 ? 'slate' : 'slate',
          },
          {
            label: 'Campaignkoppeling',
            value: `${campaignLinkedDossiers}/${exitDossiers.length || 0}`,
            tone: campaignLinkedDossiers > 0 ? 'slate' : 'slate',
          },
        ]}
        anchors={[
          { id: 'action-center', label: 'Action Center' },
          { id: 'dekking', label: 'Dekking' },
          { id: 'issues', label: 'Issues' },
          { id: 'workbench', label: 'Workbench' },
        ]}
      />

      <DashboardSection
        id="action-center"
        surface="ops"
        eyebrow="ExitScan live consumer"
        title="Shared follow-through voor ExitScan-dossiers, reviews en workbench"
        description="Deze live consumer blijft read-only voor de adminroute, leest alleen bounded ExitScan-dossiers in en toont eigenaar- en reviewstatus zonder extra claims over permissions of andere productsporen."
        aside={
          <DashboardChip
            surface="ops"
            label={`${exitWorkspace.carrier.label} - ${exitWorkspace.carrier.status}`}
            tone="slate"
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <DashboardPanel
            surface="ops"
            eyebrow="Ownerduiding"
            title="Expliciete dossierhouders"
            value={
              openExitDossiers.length > 0
                ? `${explicitOwnerOpenCount}/${openExitDossiers.length} expliciet`
                : explicitOwnerCount > 0
                  ? `${explicitOwnerCount}/${exitWorkspace.dossiers.length} expliciet`
                  : 'Nog niet expliciet'
            }
            body="Deze admin-surface neemt eigenaarschap niet over. Hij leest alleen expliciete manager- of reviewhouders uit ExitScan-checkpoints."
            tone="slate"
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Permissions"
            title="Surface-rechten"
            value={exitWorkspace.dossiers.some((dossier) => dossier.permissionEnvelope.canUpdateAssignments) ? 'Bewerkbaar' : 'Read-only'}
            body="De huidige adminroute kijkt mee als shared-core member. Assignment-, permission- en close-acties blijven dus buiten deze surface totdat een echte product-owner ze opent."
            tone="slate"
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Reviewstatus"
            title="Open reviewdruk"
            value={
              openReviewMoments.length > 0
                ? `${scheduledReviewCount}/${openReviewMoments.length} gepland`
                : 'Geen open reviews'
            }
            body="Open dossiers blijven in reviewflow; zonder expliciet reviewmoment blijft de status ook zichtbaar als nog niet gepland."
            tone={dueReviewCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Bounded scope"
            title="Exit-only filter"
            value={exitWorkspace.carrier.routeScope}
            body="Dossiers blijven alleen binnen deze surface als scan_type exit is, een exit-campaign is gekoppeld, of de intake nog ongebonden ExitScan-route is."
            tone="slate"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dossiers</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Open ExitScan follow-through</h3>
              </div>
              <DashboardChip
                surface="ops"
                label={`${openExitDossiers.length} open`}
                tone={openExitDossiers.length > 0 ? 'amber' : 'slate'}
              />
            </div>
            <div className="mt-4 space-y-3">
              {openExitDossiers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  Nog geen open ExitScan-dossiers. Zodra ExitScan follow-through leerwaarde geeft, verschijnt de dossierqueue hier automatisch.
                </p>
              ) : (
                openExitDossiers.slice(0, 5).map((dossier) => {
                  const assignment = exitWorkspace.assignments.find((item) => item.dossierId === dossier.id)

                  return (
                    <div key={dossier.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">{dossier.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Eerste stap: {assignment?.title ?? 'Nog niet vastgelegd'}.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Dossierhouder: {dossier.ownerId ?? 'Nog niet expliciet'}.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Status {assignment?.state ?? 'onbekend'} - Surface: {dossier.permissionEnvelope.canUpdateAssignments ? 'bewerkbaar' : 'read-only'}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reviews</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Reviewdruk en open signalen</h3>
              </div>
              <DashboardChip
                surface="ops"
                label={`${openReviewMoments.length} review${openReviewMoments.length === 1 ? '' : 's'}`}
                tone={dueReviewCount > 0 ? 'amber' : 'slate'}
              />
            </div>
            <div className="mt-4 space-y-3">
              {openReviewMoments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  Geen open reviewstatus. Zodra ExitScan-dossiers openstaan, verschijnt de reviewflow hier automatisch.
                </p>
              ) : (
                openReviewMoments.slice(0, 5).map((reviewMoment) => {
                  const dossier = exitWorkspace.dossiers.find((item) => item.id === reviewMoment.dossierId)
                  const signals = openSignals.filter((signal) => signal.dossierId === reviewMoment.dossierId)

                  return (
                    <div key={reviewMoment.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">{dossier?.title ?? reviewMoment.dossierId}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{reviewMoment.scheduledFor}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Reviewstatus: {reviewMoment.state === 'scheduled' && isReviewMomentPlanned(reviewMoment.scheduledFor) ? 'Gepland' : 'Nog niet gepland'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Open signalen: {signals.map((signal) => signal.kind).join(', ') || 'geen'}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </DashboardSection>

      <div id="dekking" className="grid gap-4 xl:grid-cols-4">
        <DashboardPanel
          surface="ops"
          eyebrow="Leads"
          title="Lead-koppeling"
          value={`${leadLinkedDossiers}/${exitDossiers.length || 0}`}
          body="Exit-intake hoort niet in losse mailtjes te blijven hangen. Gebruik contactaanvragen als vaste eerste routehypothese voor ExitScan-follow-through."
          tone={leadLinkedDossiers > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Delivery"
          title="Campaign-koppeling"
          value={`${campaignLinkedDossiers}/${exitDossiers.length || 0}`}
          body="Koppel zodra ExitScan implementation, launch of managementgebruik echt in delivery meelopen."
          tone={campaignLinkedDossiers > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Coverage"
          title="Recente Exit-leads"
          value={`${exitLeads.length}`}
          body="Nieuwe ExitScan-aanvragen kunnen direct in een learningdossier landen zodra route, koopreden of trustfrictie leerwaarde geeft."
          tone={exitLeads.length > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Ops"
          title="Actieve klanttoegang"
          value={`${activeClientAccessCount}`}
          body="Gebruik managementread en follow-up vooral bij ExitScan-campaigns waar klanttoegang al actief is of net is uitgenodigd."
          tone="slate"
        />
      </div>

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
        id="workbench"
        surface="ops"
        eyebrow="Workbench"
        title="ExitScan learninglog en dossiers"
        description="Elke ExitScan-route hoort minimale learning-output op te leveren: objective signals, interpreted observation, confirmed lesson, triagebestemming en bounded follow-through zonder andere productsporen te openen."
        aside={
          <DashboardChip
            surface="ops"
            label={`${exitOrgs.length} actieve organisatie${exitOrgs.length === 1 ? '' : 's'}`}
            tone="slate"
          />
        }
      >
        <PilotLearningWorkbench
          orgs={exitOrgs}
          campaigns={exitCampaigns}
          campaignStats={exitCampaignStats}
          leads={exitLeads as ContactRequestRecord[]}
          dossiers={exitDossiers}
          checkpoints={exitCheckpoints}
          activeClientAccessByOrg={exitActiveClientAccessByOrg}
          pendingClientInvitesByOrg={exitPendingClientInvitesByOrg}
          initialLeadId={initialExitLeadId}
          initialCampaignId={initialExitCampaignId}
        />
      </DashboardSection>
    </div>
  )
}
