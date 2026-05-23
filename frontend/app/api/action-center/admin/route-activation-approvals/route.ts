import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import {
  ACTION_CENTER_APPROVED_ROUTE_FAMILIES,
  canAccessActionCenterAdminOrg,
  type ActionCenterApprovedRouteFamily,
} from '../../../../../lib/action-center-admin-governance'

type RouteActivationApprovalBody = {
  orgId?: string
  routeFamily?: string
  scopeValue?: string
  rationale?: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseBody(body: RouteActivationApprovalBody | null) {
  const orgId = normalizeText(body?.orgId)
  const routeFamily = normalizeText(body?.routeFamily) as ActionCenterApprovedRouteFamily | null
  const scopeValue = normalizeText(body?.scopeValue)
  const rationale = normalizeText(body?.rationale)

  if (
    !orgId ||
    !scopeValue ||
    !routeFamily ||
    !ACTION_CENTER_APPROVED_ROUTE_FAMILIES.includes(routeFamily)
  ) {
    throw new Error('Ongeldige route activation approval input.')
  }

  return {
    orgId,
    routeFamily,
    scopeValue,
    rationale,
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RouteActivationApprovalBody | null

  let parsed
  try {
    parsed = parseBody(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route activation approval input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canApproveRouteActivation) {
    return NextResponse.json({ detail: 'Alleen bounded tenant-admin actors mogen route activatie goedkeuren.' }, { status: 403 })
  }

  if (
    !canAccessActionCenterAdminOrg({
      isVerisightAdmin: context.isVerisightAdmin,
      organizationIds: context.organizationIds,
      workspaceOrgIds: context.workspaceOrgIds,
      orgId: parsed.orgId,
    })
  ) {
    return NextResponse.json({ detail: 'Geen toegang tot deze organisatie voor route activatie.' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('action_center_route_activation_approvals')
    .upsert(
      {
        org_id: parsed.orgId,
        route_family: parsed.routeFamily,
        scope_value: parsed.scopeValue,
        requested_by: user.id,
        approved_by: user.id,
        approval_status: 'approved',
        rationale: parsed.rationale,
        updated_by: user.id,
      },
      { onConflict: 'org_id,route_family,scope_value' },
    )
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Route activation approval opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json(
    {
      approval: {
        id: data.id,
        routeFamily: data.route_family,
        approvalStatus: data.approval_status,
        scopeValue: data.scope_value,
        rationale: data.rationale,
        createdAt: data.created_at,
      },
    },
    { status: 200 },
  )
}
