import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PilotLearningWorkbench } from '@/components/dashboard/pilot-learning-workbench'
import {
  DashboardChip,
  DashboardHero,
  DashboardPanel,
  DashboardSection,
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
        eyebrow="Internal learning system"
        title="Pilot- en early-customer-learning"
        description="Gebruik deze workbench als vaste source of truth voor wat pilots en vroege klanttrajecten Verisight echt leren over product, report, onboarding, sales en operations. Start vanuit lead of campaign, capture daarna dezelfde vijf lifecycle-checkpoints en leg ook case-readiness, approval en buyer-safe claimruimte vast voordat iets als klantbewijs mag bewegen."
        tone="blue"
        meta={
          <>
            <DashboardChip label={`${dossiers.length} dossier${dossiers.length === 1 ? '' : 's'}`} tone="blue" />
            <DashboardChip label={`${openLessons} open checkpoints`} tone={openLessons > 0 ? 'amber' : 'slate'} />
            <DashboardChip label={`${confirmedLessons} bevestigd`} tone={confirmedLessons > 0 ? 'emerald' : 'slate'} />
          </>
        }
        actions={
          <>
            <Link
              href="/beheer"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              Terug naar setup
            </Link>
            <Link
              href="/beheer/contact-aanvragen"
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
              Manual-first blijft prima, zolang de les hier expliciet wordt vastgelegd en terugkrijgt waar die moet landen. Sample-output blijft deliverable-proof; echte case-proof groeit pas uit dossiers met approval.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <DashboardPanel
          eyebrow="Leads"
          title="Lead-koppeling"
          value={`${leadLinkedDossiers}/${dossiers.length || 0}`}
          body="Leadcontext hoort niet meer in losse mailtjes te blijven hangen. Gebruik contactaanvragen als vaste eerste hypotheselaag."
          tone={leadLinkedDossiers > 0 ? 'blue' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Delivery"
          title="Campaign-koppeling"
          value={`${campaignLinkedDossiers}/${dossiers.length || 0}`}
          body="Koppel zodra implementation, launch of managementgebruik echt in delivery meelopen."
          tone={campaignLinkedDossiers > 0 ? 'amber' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Coverage"
          title="Recente leads"
          value={`${leads.length}`}
          body="Nieuwe aanvragen kunnen direct in een learningdossier landen zodra route, koopreden of trustfrictie leerwaarde geeft."
          tone={leads.length > 0 ? 'emerald' : 'slate'}
        />
        <DashboardPanel
          eyebrow="Ops"
          title="Actieve klanttoegang"
          value={`${Object.values(activeClientAccessByOrg).reduce((sum, count) => sum + count, 0)}`}
          body="Use managementread en follow-up vooral bij campagnes waar klanttoegang al actief is of net is uitgenodigd."
          tone="slate"
        />
      </div>

      {configError ? (
        <DashboardSection
          eyebrow="Config"
          title="Leadinput is nog niet volledig beschikbaar"
          description="De workbench werkt wel, maar kan de server-side leadlijst nog niet ophalen."
        >
          <DashboardPanel title="Ontbrekende configuratie" body={configError} tone="amber" />
        </DashboardSection>
      ) : null}

      {loadError ? (
        <DashboardSection
          eyebrow="Load"
          title="Leadlijst kon niet worden geladen"
          description="De learningworkbench blijft bruikbaar, maar recente contactaanvragen konden niet worden opgehaald."
        >
          <DashboardPanel title="Backendfout" body={loadError} tone="amber" />
        </DashboardSection>
      ) : null}

      <DashboardSection
        eyebrow="Workbench"
        title="Canonical learning source of truth"
        description="Elke vroege klantroute hoort vanaf nu dezelfde minimale learning-output op te leveren: objective signals, interpreted observation, confirmed lesson, triagebestemming en case-readiness zodra buyer-safe bewijs in zicht komt."
        aside={<DashboardChip label={`${activeOrgs.length} actieve organisatie${activeOrgs.length === 1 ? '' : 's'}`} tone="slate" />}
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
