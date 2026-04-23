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

  const isAdmin = profile?.is_verisight_admin === true

  return (
    <DashboardShellFrame isAdmin={isAdmin} userEmail={user.email ?? ''} acceptedCount={acceptedCount}>
      {children}
    </DashboardShellFrame>
  )
}
