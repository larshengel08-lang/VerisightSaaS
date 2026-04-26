import { DashboardShellFrame } from '@/components/dashboard/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { syncPendingOrgInvitesForUser } from '@/lib/supabase/sync-org-invites'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { acceptedCount } = await syncPendingOrgInvitesForUser(supabase)
  const { context } = await loadSuiteAccessContext(supabase, user.id)
  const { data: stats } = await supabase
    .from('campaign_stats')
    .select('campaign_id, scan_type, is_active, created_at, total_invited, total_completed')

  const portfolioCounts = {
    ready: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_completed ?? 0) >= 5).length,
    building: (stats ?? []).filter(
      (campaign) => campaign.is_active && (campaign.total_invited ?? 0) > 0 && (campaign.total_completed ?? 0) < 5,
    ).length,
    setup: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_invited ?? 0) === 0).length,
    closed: (stats ?? []).filter((campaign) => !campaign.is_active).length,
  }
  const shellCampaigns = (stats ?? []).map((campaign) => ({
    campaign_id: campaign.campaign_id,
    scan_type: campaign.scan_type,
    is_active: campaign.is_active,
    created_at: campaign.created_at,
    total_completed: campaign.total_completed ?? 0,
  }))

  return (
    <DashboardShellFrame
      isAdmin={context.isVerisightAdmin}
      shellMode={context.managerOnly ? 'action_center_only' : 'full'}
      userEmail={user.email ?? ''}
      acceptedCount={acceptedCount}
      portfolioCounts={portfolioCounts}
      campaigns={shellCampaigns}
    >
      {children}
    </DashboardShellFrame>
  )
}
