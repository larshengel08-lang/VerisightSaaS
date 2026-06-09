import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type AssignmentBody = {
  orgId?: string
  scopeType?: 'org' | 'department' | 'item'
  scopeValue?: string
  managerUserId?: string | null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Je moet ingelogd zijn.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as AssignmentBody | null
  if (!body?.orgId || !body.scopeType || !body.scopeValue) {
    return NextResponse.json({ error: 'Onvolledige assignmentpayload.' }, { status: 400 })
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', body.orgId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const isAdmin = profile?.is_verisight_admin === true
  const isOwner = membership?.role === 'owner'

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Alleen Verisight of klant owners mogen managers toewijzen.' }, { status: 403 })
  }

  const adminClient = createAdminClient()

  if (!body.managerUserId) {
    const { error } = await adminClient
      .from('action_center_workspace_members')
      .delete()
      .eq('org_id', body.orgId)
      .eq('access_role', 'manager_assignee')
      .eq('scope_type', body.scopeType)
      .eq('scope_value', body.scopeValue)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  const authLookup = await adminClient.auth.admin.getUserById(body.managerUserId)
  if (authLookup.error || !authLookup.data.user) {
    return NextResponse.json({ error: 'Manageraccount niet gevonden.' }, { status: 404 })
  }

  const managerUser = authLookup.data.user
  const managerDisplayName =
    (typeof managerUser.user_metadata?.full_name === 'string' && managerUser.user_metadata.full_name.trim()) ||
    managerUser.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ||
    'Manager'

  const { error } = await adminClient
    .from('action_center_workspace_members')
    .upsert(
      {
        org_id: body.orgId,
        user_id: body.managerUserId,
        display_name: managerDisplayName,
        login_email: managerUser.email ?? null,
        access_role: 'manager_assignee',
        scope_type: body.scopeType,
        scope_value: body.scopeValue,
        can_view: true,
        can_update: true,
        can_assign: false,
        can_schedule_review: true,
        created_by: user.id,
      },
      {
        onConflict: 'org_id,user_id,access_role,scope_type,scope_value',
      },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    manager: {
      userId: body.managerUserId,
      label: managerDisplayName,
      email: managerUser.email ?? null,
    },
  })
}
