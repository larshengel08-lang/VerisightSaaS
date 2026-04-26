import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildSuiteAccessContext,
  type ActionCenterWorkspaceMember,
  type SuiteAccessContext,
  type SuiteOrgMembership,
} from '@/lib/suite-access'

type ProfileRow = {
  is_verisight_admin: boolean | null
}

export async function loadSuiteAccessContext(supabase: SupabaseClient, userId: string): Promise<{
  context: SuiteAccessContext
  profile: ProfileRow | null
  orgMemberships: SuiteOrgMembership[]
  workspaceMemberships: ActionCenterWorkspaceMember[]
}> {
  const [{ data: profile }, { data: orgMembershipsRaw }, { data: workspaceMembershipsRaw }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', userId).maybeSingle(),
    supabase.from('org_members').select('org_id, role').eq('user_id', userId),
    supabase
      .from('action_center_workspace_members')
      .select(
        'id, org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, can_assign, can_schedule_review, created_at, updated_at',
      )
      .eq('user_id', userId),
  ])

  const context = buildSuiteAccessContext({
    isVerisightAdmin: profile?.is_verisight_admin === true,
    orgMemberships: (orgMembershipsRaw ?? []) as SuiteOrgMembership[],
    workspaceMemberships: (workspaceMembershipsRaw ?? []) as ActionCenterWorkspaceMember[],
  })

  return {
    context,
    profile: (profile ?? null) as ProfileRow | null,
    orgMemberships: (orgMembershipsRaw ?? []) as SuiteOrgMembership[],
    workspaceMemberships: (workspaceMembershipsRaw ?? []) as ActionCenterWorkspaceMember[],
  }
}
