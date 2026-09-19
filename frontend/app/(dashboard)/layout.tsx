import { DashboardShellFrame } from '@/components/dashboard/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { syncPendingOrgInvitesForUser } from '@/lib/supabase/sync-org-invites'
import { buildClosedCampaignNavItems } from '@/lib/dashboard/shell-navigation'
import { loadAccountOrganizations } from '@/lib/dashboard/account-organization'
import { resolveAccountHeading } from '@/lib/dashboard/account-heading'
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

  // Eerst uitnodigingen accepteren: dat kan een lidmaatschap toevoegen dat de
  // organisatienaam en de campagnelijst hieronder nodig hebben.
  const { acceptedCount } = await syncPendingOrgInvitesForUser(supabase)
  const [{ context }, { data: stats, error: statsError }, accountOrganizations] = await Promise.all([
    loadSuiteAccessContext(supabase, user.id),
    supabase
      .from('campaign_stats')
      .select('campaign_id, campaign_name, scan_type, is_active, created_at, closed_at, total_invited, total_completed'),
    loadAccountOrganizations(supabase, user.id),
  ])
  // Fail loud, net als dashboard/page.tsx: geen lege sidebar en nultellingen
  // alsof er geen metingen zijn.
  if (statsError) throw new Error(`Kon de metingen voor de navigatie niet laden: ${statsError.message}`)

  const accountHeading = resolveAccountHeading({
    names: accountOrganizations.names,
    error: accountOrganizations.error,
    isAdmin: context.isVerisightAdmin,
  })

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
    campaign_name: campaign.campaign_name,
    scan_type: campaign.scan_type,
    is_active: campaign.is_active,
    created_at: campaign.created_at,
    closed_at: campaign.closed_at ?? null,
    total_completed: campaign.total_completed ?? 0,
  }))
  const closedCampaigns = buildClosedCampaignNavItems(shellCampaigns)

  return (
    <DashboardShellFrame
      isAdmin={context.isVerisightAdmin}
      canManageActionCenterAssignments={context.canManageActionCenterAssignments}
      shellMode={context.managerOnly ? 'action_center_only' : 'full'}
      userEmail={user.email ?? ''}
      accountHeading={accountHeading}
      acceptedCount={acceptedCount}
      portfolioCounts={portfolioCounts}
      campaigns={shellCampaigns}
      closedCampaigns={closedCampaigns}
    >
      {children}
    </DashboardShellFrame>
  )
}
