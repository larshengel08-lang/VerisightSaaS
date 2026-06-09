import type { CampaignDeliveryCheckpoint, DeliveryCheckpointKey, DeliveryExceptionStatus } from '@/lib/ops-delivery'
import { getDeliveryCheckpointTitle } from '@/lib/ops-delivery'
import type { Campaign, OrgInvite, Organization } from '@/lib/types'

type SupabaseClientLike = Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>

type DeliveryRecordRow = {
  id: string
  campaign_id: string
  lifecycle_stage: string
  exception_status: DeliveryExceptionStatus | string
  next_step: string | null
  campaigns:
    | { id: string; name: string; scan_type: Campaign['scan_type'] }
    | Array<{ id: string; name: string; scan_type: Campaign['scan_type'] }>
    | null
}

type DeliveryCheckpointRow = Pick<
  CampaignDeliveryCheckpoint,
  'id' | 'delivery_record_id' | 'checkpoint_key' | 'manual_state' | 'exception_status' | 'last_auto_summary'
>

export type SetupBlockerItem = {
  id: string
  category: string
  impactLabel: string | null
  title: string
  description: string
  actionHref: string | null
}

export interface BeheerPageData {
  organizationsAvailable: boolean
  campaignsAvailable: boolean
  accessAvailable: boolean
  deliveryAvailable: boolean
  orgs: Organization[]
  activeOrgs: Organization[]
  archivedOrgs: Organization[]
  campaigns: Campaign[]
  topCampaigns: Campaign[]
  remainingCampaignCount: number
  campaignCountByOrg: Record<string, number>
  respondentCount: number | null
  clientAccessCount: number | null
  invites: OrgInvite[]
  pendingInviteCount: number | null
  activeCampaignCount: number | null
  blockedDeliveriesCount: number | null
  setupBlockers: SetupBlockerItem[]
  dataImportAlert: SetupBlockerItem | null
}

export function mapExceptionToCategory(checkpointKey: DeliveryCheckpointKey): string | null {
  switch (checkpointKey) {
    case 'implementation_intake':
    case 'invite_readiness':
      return 'CAMPAGNES'
    case 'import_qa':
      return 'DATA & IMPORT'
    case 'client_activation':
      return 'TOEGANG & ROLLEN'
    case 'first_value':
    case 'report_delivery':
    case 'first_management_use':
      return null
    default:
      return null
  }
}

export function mapCheckpointToActionHref(checkpointKey: DeliveryCheckpointKey): string | null {
  switch (checkpointKey) {
    case 'implementation_intake':
    case 'invite_readiness':
      return '/beheer#campagnes'
    case 'import_qa':
      return '/beheer#data-import'
    case 'client_activation':
      return '/beheer#toegang'
    case 'first_value':
    case 'report_delivery':
    case 'first_management_use':
      return null
    default:
      return null
  }
}

export function mapExceptionToImpactLabel(
  exceptionStatus: DeliveryExceptionStatus | null | undefined,
): string | null {
  switch (exceptionStatus) {
    case 'blocked':
      return 'KAN NIET VERDER'
    case 'needs_operator_recovery':
      return 'OPERATOR INGREEP NODIG'
    case 'awaiting_client_input':
      return 'WACHT OP KLANTINPUT'
    case 'awaiting_external_delivery':
      return 'WACHT OP EXTERNE STAP'
    case 'none':
    default:
      return null
  }
}

export function getCampaignStatusLabel(campaigns: Array<Pick<Campaign, 'is_active'>>) {
  if (campaigns.length === 0) return 'Geen campaigns'
  return campaigns.some((campaign) => campaign.is_active) ? 'Actief' : 'Geen actieve campaigns'
}

function normalizeInviteRows(invitesRaw: unknown) {
  const rows = Array.isArray(invitesRaw) ? invitesRaw : []
  return rows.map((invite) => {
    const typedInvite = invite as OrgInvite
    return {
      ...typedInvite,
      organizations: Array.isArray(typedInvite.organizations)
        ? typedInvite.organizations[0]
        : typedInvite.organizations,
    }
  }) as OrgInvite[]
}

function getCampaignFromDeliveryRecord(record: DeliveryRecordRow) {
  return Array.isArray(record.campaigns) ? record.campaigns[0] ?? null : record.campaigns
}

function buildSetupBlockers(
  deliveryRecords: DeliveryRecordRow[],
  deliveryCheckpoints: DeliveryCheckpointRow[],
) {
  const recordById = Object.fromEntries(
    deliveryRecords.map((record) => [record.id, record] as const),
  )

  return deliveryCheckpoints
    .filter((checkpoint) => {
      const key = checkpoint.checkpoint_key as DeliveryCheckpointKey
      return (
        mapExceptionToCategory(key) !== null &&
        (checkpoint.exception_status !== 'none' || checkpoint.manual_state === 'pending')
      )
    })
    .map((checkpoint) => {
      const key = checkpoint.checkpoint_key as DeliveryCheckpointKey
      const record = recordById[checkpoint.delivery_record_id]
      const campaign = record ? getCampaignFromDeliveryRecord(record) : null
      const titlePrefix = campaign?.name ? `${campaign.name} / ` : ''

      return {
        id: checkpoint.id,
        category: mapExceptionToCategory(key) ?? 'Onbekend',
        impactLabel: mapExceptionToImpactLabel(
          checkpoint.exception_status as DeliveryExceptionStatus,
        ),
        title: `${titlePrefix}${getDeliveryCheckpointTitle(key)}`,
        description:
          record?.next_step?.trim() ||
          checkpoint.last_auto_summary?.trim() ||
          'Geen omschrijving beschikbaar',
        actionHref: mapCheckpointToActionHref(key),
      } satisfies SetupBlockerItem
    })
}

export async function getBeheerPageData(
  supabase: SupabaseClientLike,
  userId: string,
): Promise<BeheerPageData> {
  const membershipsResult = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', userId)

  const organizationsAvailable = !membershipsResult.error
  const orgs = organizationsAvailable
    ? ((membershipsResult.data
        ?.flatMap((membership) => membership.organizations)
        .filter(Boolean) ?? []) as Organization[])
    : []
  const activeOrgs = orgs.filter((org) => org.is_active)
  const archivedOrgs = orgs.filter((org) => !org.is_active)
  const orgIds = orgs.map((org) => org.id)

  const campaignsResult =
    organizationsAvailable && orgIds.length > 0
      ? await supabase
          .from('campaigns')
          .select('*')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
      : null
  const campaignsAvailable = organizationsAvailable && (!campaignsResult || !campaignsResult.error)
  const campaigns = campaignsAvailable
    ? ((campaignsResult?.data ?? []) as Campaign[])
    : []
  const topCampaigns = campaigns.slice(0, 3)
  const remainingCampaignCount = Math.max(0, campaigns.length - topCampaigns.length)
  const campaignCountByOrg = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.organization_id] = (acc[campaign.organization_id] ?? 0) + 1
    return acc
  }, {})
  const activeCampaignCount = campaignsAvailable
    ? campaigns.filter((campaign) => campaign.is_active).length
    : null

  const campaignIds = campaigns.map((campaign) => campaign.id)

  const respondentCountResult =
    campaignsAvailable && campaignIds.length > 0
      ? await supabase
          .from('respondents')
          .select('id', { count: 'exact', head: true })
          .in('campaign_id', campaignIds)
      : null
  const respondentCount =
    !campaignsAvailable
      ? null
      : campaignIds.length === 0
        ? 0
        : !respondentCountResult || respondentCountResult.error
          ? null
          : respondentCountResult.count ?? null

  const clientAccessCountResult =
    organizationsAvailable && orgIds.length > 0
      ? await supabase
          .from('org_members')
          .select('id', { count: 'exact', head: true })
          .in('org_id', orgIds)
          .neq('user_id', userId)
      : null

  const invitesResult =
    organizationsAvailable && orgIds.length > 0
      ? await supabase
          .from('org_invites')
          .select(
            'id, org_id, email, full_name, role, invited_by, invited_at, accepted_at, organizations(id, name)',
          )
          .in('org_id', orgIds)
          .order('accepted_at', { ascending: true, nullsFirst: true })
          .order('invited_at', { ascending: false })
      : null

  const accessAvailable =
    organizationsAvailable &&
    (!clientAccessCountResult || !clientAccessCountResult.error) &&
    (!invitesResult || !invitesResult.error)

  const clientAccessCount =
    !accessAvailable
      ? null
      : orgIds.length === 0
        ? 0
        : clientAccessCountResult?.count ?? null
  const invites = accessAvailable ? normalizeInviteRows(invitesResult?.data) : []
  const pendingInviteCount = accessAvailable
    ? invites.filter((invite) => !invite.accepted_at).length
    : null

  const deliveryRecordsResult =
    campaignsAvailable && campaignIds.length > 0
      ? await supabase
          .from('campaign_delivery_records')
          .select('id, campaign_id, lifecycle_stage, exception_status, next_step, campaigns(id, name, scan_type)')
          .in('campaign_id', campaignIds)
          .order('updated_at', { ascending: false })
      : null

  const deliveryRecords =
    campaignsAvailable && deliveryRecordsResult && !deliveryRecordsResult.error
      ? ((deliveryRecordsResult.data ?? []) as DeliveryRecordRow[])
      : []

  const deliveryRecordIds = deliveryRecords.map((record) => record.id)
  const deliveryCheckpointsResult =
    campaignsAvailable && deliveryRecordIds.length > 0
      ? await supabase
          .from('campaign_delivery_checkpoints')
          .select('id, delivery_record_id, checkpoint_key, manual_state, exception_status, last_auto_summary')
          .in('delivery_record_id', deliveryRecordIds)
      : null

  const deliveryAvailable =
    campaignsAvailable &&
    (!deliveryRecordsResult || !deliveryRecordsResult.error) &&
    (!deliveryCheckpointsResult || !deliveryCheckpointsResult.error)

  const deliveryCheckpoints =
    deliveryAvailable
      ? ((deliveryCheckpointsResult?.data ?? []) as DeliveryCheckpointRow[])
      : []

  const blockedDeliveriesCount = deliveryAvailable
    ? deliveryRecords.filter((record) => record.exception_status !== 'none').length
    : null
  const setupBlockers = deliveryAvailable ? buildSetupBlockers(deliveryRecords, deliveryCheckpoints) : []
  const dataImportAlert =
    setupBlockers.find((item) => item.category === 'DATA & IMPORT') ?? setupBlockers[0] ?? null

  return {
    organizationsAvailable,
    campaignsAvailable,
    accessAvailable,
    deliveryAvailable,
    orgs,
    activeOrgs,
    archivedOrgs,
    campaigns,
    topCampaigns,
    remainingCampaignCount,
    campaignCountByOrg,
    respondentCount,
    clientAccessCount,
    invites,
    pendingInviteCount,
    activeCampaignCount,
    blockedDeliveriesCount,
    setupBlockers,
    dataImportAlert,
  }
}
