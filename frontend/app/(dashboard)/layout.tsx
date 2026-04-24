import { DashboardShellFrame } from '@/components/dashboard/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()
  const { data: stats } = await supabase.from('campaign_stats').select('is_active, total_invited, total_completed')

  const isAdmin = profile?.is_verisight_admin === true
  const portfolioCounts = {
    ready: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_completed ?? 0) >= 5).length,
    building: (stats ?? []).filter(
      (campaign) => campaign.is_active && (campaign.total_invited ?? 0) > 0 && (campaign.total_completed ?? 0) < 5,
    ).length,
    setup: (stats ?? []).filter((campaign) => campaign.is_active && (campaign.total_invited ?? 0) === 0).length,
    closed: (stats ?? []).filter((campaign) => !campaign.is_active).length,
  }

  return (
    <DashboardShellFrame
      isAdmin={isAdmin}
      userEmail={user.email ?? ''}
      acceptedCount={acceptedCount}
      portfolioCounts={portfolioCounts}
    >
      {children}
    </DashboardShellFrame>
  )
}
