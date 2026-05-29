import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { canAccessActionCenterAdminOrg } from '../../../../../lib/action-center-admin-governance'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId')?.trim() ?? null

  if (!orgId) {
    return NextResponse.json({ detail: 'orgId is verplicht.' }, { status: 400 })
  }

  if (!context.canRequestAuditExport) {
    return NextResponse.json({ detail: 'Alleen bounded tenant-admin actors mogen audit exports opvragen.' }, { status: 403 })
  }

  if (
    !canAccessActionCenterAdminOrg({
      isVerisightAdmin: context.isVerisightAdmin,
      organizationIds: context.organizationIds,
      workspaceOrgIds: context.workspaceOrgIds,
      orgId,
    })
  ) {
    return NextResponse.json({ detail: 'Geen toegang tot deze organisatie voor audit export readback.' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const { error: requestError } = await adminClient
    .from('action_center_audit_export_requests')
    .insert({
      org_id: orgId,
      requested_by: user.id,
      export_scope: 'bounded_summary',
      request_status: 'generated',
    })
    .select('*')
    .single()

  if (requestError) {
    return NextResponse.json({ detail: requestError.message }, { status: 500 })
  }

  const [
    { data: routeActivationsRaw, error: routeActivationsError },
    { data: supportAccessEventsRaw, error: supportAccessEventsError },
  ] = await Promise.all([
    adminClient
      .from('action_center_route_activation_approvals')
      .select('route_family, approval_status, scope_value, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
    adminClient
      .from('action_center_support_access_events')
      .select('access_kind, access_reason, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false }),
  ])

  if (routeActivationsError || supportAccessEventsError) {
    return NextResponse.json(
      {
        detail:
          routeActivationsError?.message ??
          supportAccessEventsError?.message ??
          'Audit export readback laden mislukt.',
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      routeActivations: (routeActivationsRaw ?? []).map((row) => ({
        routeFamily: row.route_family,
        approvalStatus: row.approval_status,
        scopeValue: row.scope_value,
        createdAt: row.created_at,
      })),
      supportAccessEvents: (supportAccessEventsRaw ?? []).map((row) => ({
        accessKind: row.access_kind,
        accessReason: row.access_reason,
        createdAt: row.created_at,
      })),
    },
    { status: 200 },
  )
}
