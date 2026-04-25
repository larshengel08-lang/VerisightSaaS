import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PilotLearningWorkbench } from '@/components/dashboard/pilot-learning-workbench'
import {
  buildMtoActionCenterWorkspace,
  normalizeMtoManagerLabel,
  type MtoCarrierStatus,
} from '@/lib/action-center-mto'
import type {
  ActionCenterAssignmentState,
  ActionCenterFollowUpSignalKind,
} from '@/lib/action-center-shared-core'
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

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : null
}

const ACTION_ASSIGNMENT_STATE_LABELS: Record<ActionCenterAssignmentState, string> = {
  queued: 'In wachtrij',
  active: 'Loopt',
  blocked: 'Geblokkeerd',
  waiting: 'Geparkeerd',
  completed: 'Afgerond',
  cancelled: 'Gestopt',
}

const ACTION_SIGNAL_KIND_LABELS: Record<ActionCenterFollowUpSignalKind, string> = {
  decision_due: 'Besluit nog vast te leggen',
  owner_missing: 'Eigenaar ontbreekt',
  review_due: 'Reviewmoment ontbreekt',
  blocked_assignment: 'Eerste stap ontbreekt',
  awaiting_input: 'Input nodig',
  closure_ready: 'Klaar voor afsluiting',
}

const MTO_CARRIER_STATUS_LABELS: Record<MtoCarrierStatus, string> = {
  active: 'actief',
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

  const openLessons = checkpoints.filter((checkpoint) => checkpoint.status === 'nieuw').length
  const confirmedLessons = checkpoints.filter((checkpoint) => checkpoint.status === 'bevestigd').length
  const campaignLinkedDossiers = dossiers.filter((dossier) => dossier.campaign_id).length
  const leadLinkedDossiers = dossiers.filter((dossier) => dossier.contact_request_id).length
  const checkpointsByDossier = checkpoints.reduce<Record<string, PilotLearningCheckpoint[]>>((acc, checkpoint) => {
    acc[checkpoint.dossier_id] ??= []
    acc[checkpoint.dossier_id].push(checkpoint)
    return acc
  }, {})
  const mtoWorkspace = buildMtoActionCenterWorkspace({
    role: 'owner',
    dossiers: dossiers
      .filter((dossier) => dossier.scan_type === 'team' || dossier.route_interest === 'teamscan')
      .map((dossier) => {
        const dossierCheckpoints = checkpointsByDossier[dossier.id] ?? []
        const firstManagementCheckpoint =
          dossierCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'first_management_use') ?? null

        return {
          id: dossier.id,
          title: dossier.title,
          triageStatus: dossier.triage_status,
          departmentLabel: null,
          managerLabel: normalizeMtoManagerLabel(firstManagementCheckpoint?.owner_label ?? null),
          firstActionTaken: dossier.first_action_taken,
          reviewMoment: dossier.review_moment,
          managementActionOutcome: dossier.management_action_outcome,
          nextRoute: dossier.next_route,
          stopReason: dossier.stop_reason,
        }
      }),
  })
  const openMtoDossiers = mtoWorkspace.dossiers.filter((dossier) => dossier.status === 'open')
  const reviewPressureItems = mtoWorkspace.reviewMoments.filter((reviewMoment) => reviewMoment.state === 'due')
  const openSignals = mtoWorkspace.followUpSignals.filter((signal) => signal.state === 'open')

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        eyebrow="Action Center voor MTO-follow-through"
        title="Operations Action Center"
        description="Laat MTO als eerste actieve carrier landen op de shared Action Center-core: HR blijft centraal, reviewdruk blijft zichtbaar en dossiers houden de follow-through bij elkaar zonder andere productkoppelingen te openen."
        tone="slate"
        meta={
          <>
            <DashboardChip surface="ops" label={`${dossiers.length} dossier${dossiers.length === 1 ? '' : 's'}`} tone="slate" />
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
              Manual-first blijft prima zolang de les hier expliciet wordt vastgelegd. Geen buyer-facing claims of portfolioverbreding via deze route; dit blijft een interne adminlog.
            </p>
          </div>
        }
      />

      <DashboardSummaryBar
        surface="ops"
        items={[
          {
            label: 'MTO dossiers',
            value: `${mtoWorkspace.summary.openDossierCount}`,
            tone: mtoWorkspace.summary.openDossierCount > 0 ? 'slate' : 'amber',
          },
          {
            label: 'Reviewdruk',
            value: `${mtoWorkspace.summary.reviewDueCount}`,
            tone: mtoWorkspace.summary.reviewDueCount > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Dossiers',
            value: `${dossiers.length} actief`,
            tone: dossiers.length > 0 ? 'slate' : 'amber',
          },
          {
            label: 'Open checkpoints',
            value: `${openLessons}`,
            tone: openLessons > 0 ? 'amber' : 'slate',
          },
          {
            label: 'Leadkoppeling',
            value: `${leadLinkedDossiers}/${dossiers.length || 0}`,
            tone: leadLinkedDossiers > 0 ? 'slate' : 'slate',
          },
          {
            label: 'Campaignkoppeling',
            value: `${campaignLinkedDossiers}/${dossiers.length || 0}`,
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
        eyebrow="MTO carrier"
        title="Shared follow-through voor cockpit, dossiers en reviews"
        description="Deze bovenlaag gebruikt dezelfde shared Action Center-core voor dossierstatus, reviewdruk en follow-through-signalen. HR blijft de centrale eigenaar; afdelingsscope blijft pas actief zodra een dossier of lokale read die expliciet maakt."
        aside={
          <DashboardChip
            surface="ops"
            label={`${mtoWorkspace.carrier.label} · ${MTO_CARRIER_STATUS_LABELS[mtoWorkspace.carrier.status]}`}
            tone="slate"
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <DashboardPanel
            surface="ops"
            eyebrow="HR centraal"
            title="Shared eigenaar"
            value="HR centraal"
            body="Deze carrier houdt de centrale follow-through bij HR. Managers landen alleen op hun eigen afdeling zodra die lokale context expliciet en veilig leesbaar is."
            tone="slate"
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Reviewdruk"
            title="Actieve reviewqueue"
            value={`${mtoWorkspace.summary.reviewDueCount}`}
            body="Elke open MTO-dossierregel blijft zichtbaar in de reviewdruk tot reviewmoment, uitkomst of stopbesluit expliciet zijn vastgelegd."
            tone={mtoWorkspace.summary.reviewDueCount > 0 ? 'amber' : 'slate'}
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Dossier-first"
            title="Open follow-through"
            value={`${mtoWorkspace.summary.openDossierCount}`}
            body="Besluiten, eerste stap en vervolgrichting blijven dossier-first gegroepeerd in plaats van te verspreiden over losse campaignnotities."
            tone={mtoWorkspace.summary.openDossierCount > 0 ? 'slate' : 'amber'}
          />
          <DashboardPanel
            surface="ops"
            eyebrow="Afdelingsscope"
            title="Managerbinding"
            value={
              mtoWorkspace.managerDepartmentLabels.length > 0
                ? `${mtoWorkspace.managerDepartmentLabels.length} afdeling${mtoWorkspace.managerDepartmentLabels.length === 1 ? '' : 'en'}`
                : 'Nog niet expliciet'
            }
            body={
              mtoWorkspace.managerDepartmentLabels.length > 0
                ? `Actieve afdelingssporen: ${mtoWorkspace.managerDepartmentLabels.join(', ')}.`
                : 'Maak de afdeling expliciet in de lokale read of het dossier zodra managergebonden follow-through echt nodig is.'
            }
            tone="slate"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dossiers</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">Open MTO follow-through</h3>
              </div>
              <DashboardChip
                surface="ops"
                label={`${openMtoDossiers.length} open`}
                tone={openMtoDossiers.length > 0 ? 'amber' : 'slate'}
              />
            </div>
            <div className="mt-4 space-y-3">
              {openMtoDossiers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  Nog geen open MTO-dossiers. Zodra TeamScan/MTO follow-through leerwaarde geeft, verschijnt de dossierqueue hier automatisch.
                </p>
              ) : (
                openMtoDossiers.slice(0, 5).map((dossier) => {
                  const assignment = mtoWorkspace.assignments.find((item) => item.dossierId === dossier.id)
                  return (
                    <div key={dossier.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">{dossier.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Eerste stap: {assignment?.title ?? 'Nog niet vastgelegd'}.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Status {assignment ? ACTION_ASSIGNMENT_STATE_LABELS[assignment.state] : 'Onbekend'} · Bewerkbaarheid:{' '}
                        {dossier.permissionEnvelope.canUpdateAssignments ? 'Bewerkbaar' : 'Alleen lezen'}
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
                label={`${reviewPressureItems.length} review${reviewPressureItems.length === 1 ? '' : 's'}`}
                tone={reviewPressureItems.length > 0 ? 'amber' : 'slate'}
              />
            </div>
            <div className="mt-4 space-y-3">
              {reviewPressureItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  Geen actieve reviewdruk. De shared core houdt deze lijst leeg zodra dossiers geparkeerd, uitgevoerd of bewust gestopt zijn.
                </p>
              ) : (
                reviewPressureItems.slice(0, 5).map((reviewMoment) => {
                  const dossier = mtoWorkspace.dossiers.find((item) => item.id === reviewMoment.dossierId)
                  const signals = openSignals.filter((signal) => signal.dossierId === reviewMoment.dossierId)

                  return (
                    <div key={reviewMoment.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">{dossier?.title ?? reviewMoment.dossierId}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{reviewMoment.scheduledFor}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Open signalen: {signals.map((signal) => ACTION_SIGNAL_KIND_LABELS[signal.kind]).join(', ') || 'geen'}
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
          value={`${leadLinkedDossiers}/${dossiers.length || 0}`}
          body="Leadcontext hoort niet meer in losse mailtjes te blijven hangen. Gebruik contactaanvragen als vaste eerste hypotheselaag."
          tone={leadLinkedDossiers > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Delivery"
          title="Campaign-koppeling"
          value={`${campaignLinkedDossiers}/${dossiers.length || 0}`}
          body="Koppel zodra implementation, launch of managementgebruik echt in delivery meelopen."
          tone={campaignLinkedDossiers > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Coverage"
          title="Recente leads"
          value={`${leads.length}`}
          body="Nieuwe aanvragen kunnen direct in een learningdossier landen zodra route, koopreden of trustfrictie leerwaarde geeft."
          tone={leads.length > 0 ? 'slate' : 'slate'}
        />
        <DashboardPanel
          surface="ops"
          eyebrow="Ops"
          title="Actieve klanttoegang"
          value={`${Object.values(activeClientAccessByOrg).reduce((sum, count) => sum + count, 0)}`}
          body="Gebruik managementread en follow-up vooral bij campagnes waar klanttoegang al actief is of net is uitgenodigd."
          tone="slate"
        />
      </div>

      {configError ? (
        <DashboardSection
          id="issues"
          surface="ops"
          eyebrow="Config"
          title="Leadinput is niet volledig beschikbaar"
          description="De workbench werkt wel, maar kan de server-side leadlijst nog niet ophalen."
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
          description="De learningworkbench blijft bruikbaar, maar recente contactaanvragen konden niet worden opgehaald voor triage."
        >
          <DashboardPanel surface="ops" title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        id="workbench"
        surface="ops"
        eyebrow="Workbench"
        title="Learninglog en dossiers"
        description="Elke vroege klantroute hoort minimale learning-output op te leveren: objective signals, interpreted observation, confirmed lesson, triagebestemming en case-readiness zodra buyer-safe bewijs in zicht komt."
        aside={<DashboardChip surface="ops" label={`${activeOrgs.length} actieve organisatie${activeOrgs.length === 1 ? '' : 's'}`} tone="slate" />}
      >
        <PilotLearningWorkbench
          orgs={activeOrgs}
          campaigns={campaigns}
          campaignStats={campaignStats}
          leads={leads as ContactRequestRecord[]}
          dossiers={dossiers}
          checkpoints={checkpoints}
          activeClientAccessByOrg={activeClientAccessByOrg}
          pendingClientInvitesByOrg={pendingClientInvitesByOrg}
          initialLeadId={initialLeadId}
          initialCampaignId={initialCampaignId}
        />
      </DashboardSection>
    </div>
  )
}
