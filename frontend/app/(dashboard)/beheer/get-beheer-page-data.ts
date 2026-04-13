import type { Campaign, CampaignStats, OrgInvite, Organization } from '@/lib/types'

interface BeheerPageData {
  orgs: Organization[]
  activeOrgs: Organization[]
  archivedOrgs: Organization[]
  campaigns: Campaign[]
  campaignCountByOrg: Record<string, number>
  respondentCount: number
  clientAccessCount: number
  campaignStats: CampaignStats[]
  invites: OrgInvite[]
  pendingInviteCount: number
  step1Done: boolean
  step2Done: boolean
  step3Done: boolean
  step4Done: boolean
}

export async function getBeheerPageData(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, userId: string): Promise<BeheerPageData> {
  const { data: memberships } = await supabase
    .from('org_members')
    .select('organizations(*)')
    .eq('user_id', userId)

  const orgs = (memberships?.flatMap(membership => membership.organizations).filter(Boolean) ?? []) as Organization[]
  const activeOrgs = orgs.filter(org => org.is_active)
  const archivedOrgs = orgs.filter(org => !org.is_active)

  const orgIds = orgs.map(org => org.id)
  const { data: campaignsRaw } = orgIds.length
    ? await supabase
        .from('campaigns')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaigns = (campaignsRaw ?? []) as Campaign[]
  const campaignCountByOrg = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.organization_id] = (acc[campaign.organization_id] ?? 0) + 1
    return acc
  }, {})

  const campaignIds = campaigns.map(campaign => campaign.id)
  const { count: respondentCountRaw } = campaignIds.length
    ? await supabase
        .from('respondents')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
    : { count: 0 }

  const { count: clientAccessCountRaw } = orgIds.length
    ? await supabase
        .from('org_members')
        .select('id', { count: 'exact', head: true })
        .in('org_id', orgIds)
        .neq('user_id', userId)
    : { count: 0 }

  const { data: campaignStatsRaw } = orgIds.length
    ? await supabase
        .from('campaign_stats')
        .select('*')
        .in('organization_id', orgIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const campaignStats = (campaignStatsRaw ?? []) as CampaignStats[]

  const { data: invitesRaw } = orgIds.length
    ? await supabase
        .from('org_invites')
        .select('id, org_id, email, full_name, role, invited_by, invited_at, accepted_at, organizations(id, name)')
        .in('org_id', orgIds)
        .order('accepted_at', { ascending: true, nullsFirst: true })
        .order('invited_at', { ascending: false })
    : { data: [] }

  const invites = (invitesRaw ?? []).map(invite => ({
    ...invite,
    organizations: Array.isArray(invite.organizations) ? invite.organizations[0] : invite.organizations,
  })) as OrgInvite[]

  const respondentCount = respondentCountRaw ?? 0
  const clientAccessCount = clientAccessCountRaw ?? 0
  const pendingInviteCount = invites.filter(invite => !invite.accepted_at).length
  const step1Done = activeOrgs.length > 0
  const step2Done = campaigns.some(campaign => campaign.is_active)
  const step3Done = respondentCount > 0
  const step4Done = step2Done && (clientAccessCount > 0 || invites.length > 0)

  return {
    orgs,
    activeOrgs,
    archivedOrgs,
    campaigns,
    campaignCountByOrg,
    respondentCount,
    clientAccessCount,
    campaignStats,
    invites,
    pendingInviteCount,
    step1Done,
    step2Done,
    step3Done,
    step4Done,
  }
}
