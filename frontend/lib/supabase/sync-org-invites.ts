import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export async function syncPendingOrgInvitesForUser({
  userId,
  email,
}: {
  userId: string
  email: string | null | undefined
}) {
  if (!email) {
    return { acceptedCount: 0 }
  }

  try {
    const admin = createAdminClient()
    const normalizedEmail = email.trim().toLowerCase()

    const { data: invites, error: inviteError } = await admin
      .from('org_invites')
      .select('id, org_id, role')
      .eq('email', normalizedEmail)
      .is('accepted_at', null)

    if (inviteError || !invites?.length) {
      return { acceptedCount: 0 }
    }

    const membershipRows = invites.map(invite => ({
      org_id: invite.org_id,
      user_id: userId,
      role: invite.role === 'member' ? 'member' : 'viewer',
    }))

    const { error: membershipError } = await admin
      .from('org_members')
      .upsert(membershipRows, { onConflict: 'org_id,user_id' })

    if (membershipError) {
      return { acceptedCount: 0 }
    }

    const inviteIds = invites.map(invite => invite.id)
    await admin
      .from('org_invites')
      .update({ accepted_at: new Date().toISOString() })
      .in('id', inviteIds)

    return { acceptedCount: invites.length }
  } catch {
    return { acceptedCount: 0 }
  }
}
