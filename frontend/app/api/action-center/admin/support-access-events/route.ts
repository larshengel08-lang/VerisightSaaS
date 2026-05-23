import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import {
  ACTION_CENTER_SUPPORT_ACCESS_KINDS,
  canAccessActionCenterAdminOrg,
  type ActionCenterSupportAccessKind,
} from '../../../../../lib/action-center-admin-governance'

type SupportAccessEventBody = {
  orgId?: string
  routeId?: string | null
  scopeValue?: string | null
  accessKind?: string
  accessReason?: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseBody(body: SupportAccessEventBody | null) {
  const orgId = normalizeText(body?.orgId)
  const routeId = normalizeText(body?.routeId)
  const scopeValue = normalizeText(body?.scopeValue)
  const accessKind = normalizeText(body?.accessKind) as ActionCenterSupportAccessKind | null
  const accessReason = normalizeText(body?.accessReason)

  if (
    !orgId ||
    !accessReason ||
    !accessKind ||
    !ACTION_CENTER_SUPPORT_ACCESS_KINDS.includes(accessKind)
  ) {
    throw new Error('Ongeldige support access input.')
  }

  return {
    orgId,
    routeId,
    scopeValue,
    accessKind,
    accessReason,
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SupportAccessEventBody | null

  let parsed
  try {
    parsed = parseBody(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige support access input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context } = await loadSuiteAccessContext(supabase, user.id)

  if (!context.canLogSupportAccess) {
    return NextResponse.json({ detail: 'Alleen bounded tenant-admin actors mogen support access loggen.' }, { status: 403 })
  }

  if (
    !canAccessActionCenterAdminOrg({
      isVerisightAdmin: context.isVerisightAdmin,
      organizationIds: context.organizationIds,
      workspaceOrgIds: context.workspaceOrgIds,
      orgId: parsed.orgId,
    })
  ) {
    return NextResponse.json({ detail: 'Geen toegang tot deze organisatie voor support access logging.' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('action_center_support_access_events')
    .insert({
      org_id: parsed.orgId,
      route_id: parsed.routeId,
      scope_value: parsed.scopeValue,
      accessed_by: user.id,
      access_kind: parsed.accessKind,
      access_reason: parsed.accessReason,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Support access event opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json(
    {
      supportAccessEvent: {
        id: data.id,
        routeId: data.route_id,
        scopeValue: data.scope_value,
        accessKind: data.access_kind,
        accessReason: data.access_reason,
        createdAt: data.created_at,
      },
    },
    { status: 200 },
  )
}
