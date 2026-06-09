import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import { resolveActionCenterHrWriteAccess } from '@/lib/action-center-governance'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import {
  projectActionCenterRouteCloseout,
  type ActionCenterRouteCloseoutReason,
  type ActionCenterRouteCloseoutStatus,
} from '@/lib/action-center-route-closeout'

type RouteCloseoutRequestBody = {
  campaign_id?: string
  route_scope_type?: 'department' | 'item'
  route_scope_value?: string
  closeout_status?: string
  closeout_reason?: string
  closeout_note?: string | null
}

type RespondentDepartmentRow = {
  department: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  const normalized = normalizeText(value)
  return normalized ? normalized.toLocaleLowerCase('nl-NL') : null
}

function buildCampaignFallbackScopeValue(orgId: string, campaignId: string) {
  return `${orgId}::campaign::${campaignId}`
}

function parseRouteCloseoutInput(input: RouteCloseoutRequestBody | null) {
  const campaignId = normalizeText(input?.campaign_id)
  const routeScopeType = input?.route_scope_type
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const closeoutStatus = normalizeText(input?.closeout_status) as ActionCenterRouteCloseoutStatus | null
  const closeoutReason = normalizeText(input?.closeout_reason) as ActionCenterRouteCloseoutReason | null
  const closeoutNote = normalizeText(input?.closeout_note)

  if (
    !campaignId ||
    (routeScopeType !== 'department' && routeScopeType !== 'item') ||
    !routeScopeValue ||
    !closeoutStatus ||
    !closeoutReason
  ) {
    throw new Error('Ongeldige route closeout input.')
  }

  return {
    campaign_id: campaignId,
    route_scope_type: routeScopeType,
    route_scope_value: routeScopeValue,
    closeout_status: closeoutStatus,
    closeout_reason: closeoutReason,
    closeout_note: closeoutNote,
  }
}

async function loadCloseoutRouteTruth(input: {
  campaignId: string
  routeScopeType: 'department' | 'item'
}) {
  const adminClient = createAdminClient()
  const { data: campaign, error: campaignError } = await adminClient
    .from('campaigns')
    .select('id, organization_id')
    .eq('id', input.campaignId)
    .maybeSingle()

  if (campaignError || !campaign?.id || !campaign.organization_id) {
    return { campaign: null, visibleDepartmentLabels: [] as string[] }
  }

  if (input.routeScopeType !== 'department') {
    return { campaign, visibleDepartmentLabels: [] as string[] }
  }

  const { data: respondentsRaw } = await adminClient
    .from('respondents')
    .select('department')
    .eq('campaign_id', input.campaignId)

  const visibleDepartmentLabels = [
    ...new Set(
      ((respondentsRaw ?? []) as RespondentDepartmentRow[])
        .map((row) => normalizeDepartmentLabel(row.department))
        .filter((value): value is string => Boolean(value)),
    ),
  ]

  return { campaign, visibleDepartmentLabels }
}

function resolveRouteCloseoutIdentity(args: {
  parsed: ReturnType<typeof parseRouteCloseoutInput>
  campaignOrgId: string
  visibleDepartmentLabels: string[]
}) {
  if (args.parsed.route_scope_type === 'department') {
    const normalizedScopeValue = args.parsed.route_scope_value.toLocaleLowerCase('nl-NL')
    if (!args.visibleDepartmentLabels.includes(normalizedScopeValue.split('::').at(-1) ?? '')) {
      throw new Error('Route closeout route bestaat niet voor deze campagne.')
    }
  }

  if (
    args.parsed.route_scope_type === 'item' &&
    args.parsed.route_scope_value !== buildCampaignFallbackScopeValue(args.campaignOrgId, args.parsed.campaign_id)
  ) {
    throw new Error('Route closeout route bestaat niet voor deze campagne.')
  }

  return {
    route_id: buildActionCenterRouteId(args.parsed.campaign_id, args.parsed.route_scope_value),
    campaign_id: args.parsed.campaign_id,
    org_id: args.campaignOrgId,
    route_scope_type: args.parsed.route_scope_type,
    route_scope_value: args.parsed.route_scope_value,
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RouteCloseoutRequestBody | null

  let parsed
  try {
    parsed = parseRouteCloseoutInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route closeout input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const routeTruth = await loadCloseoutRouteTruth({
    campaignId: parsed.campaign_id,
    routeScopeType: parsed.route_scope_type,
  })

  if (!routeTruth.campaign?.organization_id) {
    return NextResponse.json({ detail: 'Route closeout route bestaat niet voor deze campagne.' }, { status: 400 })
  }

  const writeAccess = resolveActionCenterHrWriteAccess({
    context,
    orgMemberships,
    workspaceMemberships,
    orgId: routeTruth.campaign.organization_id,
  })

  if (!writeAccess.allowed || !writeAccess.auditRole) {
    return NextResponse.json({ detail: 'Alleen HR of Verisight kan deze route afsluiten.' }, { status: 403 })
  }

  let identity
  try {
    identity = resolveRouteCloseoutIdentity({
      parsed,
      campaignOrgId: routeTruth.campaign.organization_id,
      visibleDepartmentLabels: routeTruth.visibleDepartmentLabels,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige route closeout-identiteit.' },
      { status: 400 },
    )
  }

  const closedAt = new Date().toISOString()
  const adminClient = createAdminClient()
  const persisted = {
    ...identity,
    closeout_status: parsed.closeout_status,
    closeout_reason: parsed.closeout_reason,
    closeout_note: parsed.closeout_note,
    closed_at: closedAt,
    closed_by_role: writeAccess.auditRole,
    created_by: user.id,
    updated_by: user.id,
    updated_at: closedAt,
  }

  const { data, error } = await adminClient
    .from('action_center_route_closeouts')
    .upsert(persisted, { onConflict: 'route_id' })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Route closeout opslaan mislukt.' }, { status: 500 })
  }

  try {
    const closeout = projectActionCenterRouteCloseout(data as Record<string, unknown>)
    return NextResponse.json({ closeout }, { status: 200 })
  } catch {
    return NextResponse.json({ detail: 'Route closeout opslaan mislukt.' }, { status: 500 })
  }
}
