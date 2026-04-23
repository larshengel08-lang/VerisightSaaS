import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PilotLearningWorkbench } from '@/components/dashboard/pilot-learning-workbench'
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

  return (
    <div className="space-y-6">
      <DashboardHero
        surface="ops"
        eyebrow="Adminroute voor pilot- en klantlessen"
        title="Operations learninglog"
        description="Leg lessen compact vast per lead of campaign en gebruik deze workbench als interne log voor triage, bewijsstatus en vervolgstappen. Geen buyer-facing claims: alleen operationele observaties, bevestigde lessen en case-readiness."
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
          { id: 'dekking', label: 'Dekking' },
          { id: 'issues', label: 'Issues' },
          { id: 'workbench', label: 'Workbench' },
        ]}
      />

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
