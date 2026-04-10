import 'server-only'

import type { createClient } from '@/lib/supabase/server'

type ServerSupabase = Awaited<ReturnType<typeof createClient>>

export async function syncPendingOrgInvitesForUser(supabase: ServerSupabase) {
  try {
    const { data, error } = await supabase.rpc('accept_org_invites_for_current_user')

    if (error || typeof data !== 'number') {
      return { acceptedCount: 0 }
    }

    return { acceptedCount: data }
  } catch {
    return { acceptedCount: 0 }
  }
}
