import { redirect } from 'next/navigation'
import { ActionCenterPreview } from '@/components/dashboard/action-center-preview'
import { buildLiveActionCenterItems, getLiveActionCenterSummary } from '@/lib/action-center-live'
import { createClient } from '@/lib/supabase/server'
import type { CampaignDeliveryCheckpoint, CampaignDeliveryRecord } from '@/lib/ops-delivery'
import type { PilotLearningCheckpoint, PilotLearningDossier } from '@/lib/pilot-learning'
import type { Campaign, CampaignStats, MemberRole, Organization } from '@/lib/types'

type MembershipRow = {
  org_id: string
  role: MemberRole
}

function getRoleRank(role: MemberRole) {
  switch (role) {
    case 'owner':
      return 3
    case 'member':
      return 2
    case 'viewer':
    default:
      return 1
  }
}

function getDisplayName(email: string | null | undefined) {
  if (!email) return 'Verisight klant'
  const localPart = email.split('@')[0] ?? 'verisight-klant'
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function ActionCenterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { data: membershipsRaw }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).single(),
    supabase.from('org_members').select('org_id, role').eq('user_id', user.id),
  ])

  const memberships = (membershipsRaw ?? []) as MembershipRow[]
  const orgIds = [...new Set(memberships.map((membership) => membership.org_id))]
  const isAdmin = profile?.is_verisight_admin === true

  if (orgIds.length === 0 && !isAdmin) {
    redirect('/dashboard')
  }

  const [
    { data: organizationsRaw },
    { data: campaignsRaw },
    { data: statsRaw },
    { data: deliveryRecordsRaw },
    { data: dossiersRaw },
  ] = await Promise.all([
    orgIds.length > 0
      ? supabase.from('organizations').select('id, name, slug, contact_email, is_active, created_at').in('id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? supabase.from('campaigns').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? supabase.from('campaign_stats').select('*').in('organization_id', orgIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? supabase.from('campaign_delivery_records').select('*').in('organization_id', orgIds)
      : Promise.resolve({ data: [] }),
    orgIds.length > 0
      ? supabase.from('pilot_learning_dossiers').select('*').in('organization_id', orgIds)
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

  const [{ data: deliveryCheckpointsRaw }, { data: learningCheckpointsRaw }] = await Promise.all([
    deliveryRecords.length > 0
      ? supabase
          .from('campaign_delivery_checkpoints')
          .select('*')
          .in(
            'delivery_record_id',
            deliveryRecords.map((record) => record.id),
          )
      : Promise.resolve({ data: [] }),
    dossiers.length > 0
      ? supabase
          .from('pilot_learning_checkpoints')
          .select('*')
          .in(
            'dossier_id',
            dossiers.map((dossier) => dossier.id),
          )
      : Promise.resolve({ data: [] }),
  ])

  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as CampaignDeliveryCheckpoint[]
  const learningCheckpoints = (learningCheckpointsRaw ?? []) as PilotLearningCheckpoint[]

  const roleByOrgId = memberships.reduce<Record<string, MemberRole>>((acc, membership) => {
    const current = acc[membership.org_id]
    if (!current || getRoleRank(membership.role) > getRoleRank(current)) {
      acc[membership.org_id] = membership.role
    }
    return acc
  }, {})
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const statsByCampaignId = new Map(stats.map((entry) => [entry.campaign_id, entry]))
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

  const items = buildLiveActionCenterItems(
    campaigns.map((campaign) => {
      const deliveryRecord = deliveryRecordByCampaignId.get(campaign.id) ?? null
      const learningDossier = learningDossierByCampaignId.get(campaign.id) ?? null

      return {
        campaign,
        stats: statsByCampaignId.get(campaign.id) ?? null,
        organizationName: organizationById.get(campaign.organization_id)?.name ?? 'Verisight organisatie',
        memberRole: roleByOrgId[campaign.organization_id] ?? null,
        deliveryRecord,
        deliveryCheckpoints: deliveryRecord ? (deliveryCheckpointMap[deliveryRecord.id] ?? []) : [],
        learningDossier,
        learningCheckpoints: learningDossier ? (learningCheckpointMap[learningDossier.id] ?? []) : [],
      }
    }),
  )

  const ownerOptions = [...new Set(items.map((item) => item.ownerName).filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right))
  const itemHrefs = Object.fromEntries(campaigns.map((campaign) => [campaign.id, `/campaigns/${campaign.id}`]))
  const summary = getLiveActionCenterSummary(items)
  const workspaceSubtitle =
    summary.productCount > 0
      ? `Live opvolging over ${summary.productCount} product${summary.productCount === 1 ? '' : 'en'} in dezelfde suite-shell`
      : 'Live opvolging binnen dezelfde suite-shell'

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-6 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--dashboard-muted)]">
          Action Center
        </p>
        <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-[color:var(--dashboard-ink)]">
          Nog geen live opvolging zichtbaar
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--dashboard-text)]">
          Zodra er actieve campaigns, bounded deliverycontext of bestaande follow-through dossiers voor jouw organisaties
          staan, opent deze module automatisch in dezelfde ingelogde suite-shell.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-5 py-4 text-sm text-[color:var(--dashboard-text)]">
        Action Center is hier een aparte module binnen dezelfde ingelogde suite-shell. Je leest opvolging nu live mee per
        productlijn; bounded owner-mutaties openen we pas waar bronlaag en roltoegang dat veilig dragen.
      </div>
      <ActionCenterPreview
        initialItems={items}
        initialView="overview"
        fallbackOwnerName={getDisplayName(user.email)}
        ownerOptions={ownerOptions}
        workbenchHref="/dashboard"
        workbenchLabel="Open broncampaign"
        workspaceName={getDisplayName(user.email)}
        workspaceSubtitle={workspaceSubtitle}
        readOnly
        itemHrefs={itemHrefs}
      />
    </div>
  )
}
