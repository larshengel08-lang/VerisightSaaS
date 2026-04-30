import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { validateActionCenterManagerResponseWriteInput } from '@/lib/action-center-manager-responses'

async function requireManagerResponseAccess(input: {
  orgId: string
  scopeType: 'department' | 'item'
  scopeValue: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }) }
  }

  const { context, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)

  if (context.isVerisightAdmin) {
    return { user, error: null }
  }

  const canRespond = workspaceMemberships.some(
    (membership) =>
      membership.org_id === input.orgId &&
      membership.access_role === 'manager_assignee' &&
      membership.scope_type === input.scopeType &&
      membership.scope_value === input.scopeValue &&
      membership.can_view &&
      membership.can_update,
  )

  if (!canRespond) {
    return {
      user: null,
      error: NextResponse.json(
        { detail: 'Alleen de toegewezen manager kan op dit open verzoek reageren.' },
        { status: 403 },
      ),
    }
  }

  return { user, error: null }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  let parsed
  try {
    parsed = validateActionCenterManagerResponseWriteInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige manager response input.' }, { status: 400 })
  }

  const access = await requireManagerResponseAccess({
    orgId: parsed.org_id,
    scopeType: parsed.route_scope_type,
    scopeValue: parsed.route_scope_value,
  })
  if (access.error || !access.user) {
    return access.error
  }

  const adminClient = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await adminClient
    .from('action_center_manager_responses')
    .upsert(
      {
        ...parsed,
        created_by: access.user.id,
        updated_by: access.user.id,
        updated_at: now,
      },
      {
        onConflict: 'campaign_id,route_scope_type,route_scope_value',
      },
    )
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Manager response opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ response: data }, { status: 200 })
}
