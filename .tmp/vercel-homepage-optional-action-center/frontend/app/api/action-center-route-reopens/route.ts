import { NextResponse } from 'next/server'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import { resolveActionCenterHrWriteAccess } from '@/lib/action-center-governance'
import {
  projectActionCenterRouteReopen,
  type ActionCenterRouteReopenReason,
} from '@/lib/action-center-route-reopen'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type RouteReopenRequestBody = {
  route_id?: string
  campaign_id?: string
  route_scope_type?: 'department' | 'item'
  route_scope_value?: string
  reopen_reason?: string
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

function parseRouteReopenInput(input: RouteReopenRequestBody | null) {
  const routeId = normalizeText(input?.route_id)
  const campaignId = normalizeText(input?.campaign_id)
  const routeScopeType = input?.route_scope_type
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const reopenReason = normalizeText(input?.reopen_reason) as ActionCenterRouteReopenReason | null

  if (
    !routeId ||
    !campaignId ||
    (routeScopeType !== 'department' && routeScopeType !== 'item') ||
    !routeScopeValue ||
    !reopenReason
  ) {
    throw new Error('Ongeldige route reopen input.')
  }

  return {
    route_id: routeId,
    campaign_id: campaignId,
    route_scope_type: routeScopeType,
    route_scope_value: routeScopeValue,
    reopen_reason: reopenReason,
  }
}

async function loadRouteTruth(input: {
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

function resolveRouteReopenIdentity(args: {
  parsed: ReturnType<typeof parseRouteReopenInput>
  campaignOrgId: string
  visibleDepartmentLabels: string[]
}) {
  const canonicalRouteId = buildActionCenterRouteId(args.parsed.campaign_id, args.parsed.route_scope_value)
  if (args.parsed.route_id !== canonicalRouteId) {
    throw new Error('Route reopen route bestaat niet voor deze campagne.')
  }

  if (args.parsed.route_scope_type === 'department') {
    const normalizedScopeValue = args.parsed.route_scope_value.toLocaleLowerCase('nl-NL')
    if (!args.visibleDepartmentLabels.includes(normalizedScopeValue.split('::').at(-1) ?? '')) {
      throw new Error('Route reopen route bestaat niet voor deze campagne.')
    }
  }

  if (
    args.parsed.route_scope_type === 'item' &&
    args.parsed.route_scope_value !== buildCampaignFallbackScopeValue(args.campaignOrgId, args.parsed.campaign_id)
  ) {
    throw new Error('Route reopen route bestaat niet voor deze campagne.')
  }

  return {
    route_id: canonicalRouteId,
    campaign_id: args.parsed.campaign_id,
    org_id: args.campaignOrgId,
    route_scope_type: args.parsed.route_scope_type,
    route_scope_value: args.parsed.route_scope_value,
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RouteReopenRequestBody | null

  let parsed
  try {
    parsed = parseRouteReopenInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route reopen input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const routeTruth = await loadRouteTruth({
    campaignId: parsed.campaign_id,
    routeScopeType: parsed.route_scope_type,
  })

  if (!routeTruth.campaign?.organization_id) {
    return NextResponse.json({ detail: 'Route reopen route bestaat niet voor deze campagne.' }, { status: 400 })
  }

  const writeAccess = resolveActionCenterHrWriteAccess({
    context,
    orgMemberships,
    workspaceMemberships,
    orgId: routeTruth.campaign.organization_id,
  })

  if (!writeAccess.allowed || !writeAccess.auditRole) {
    return NextResponse.json({ detail: 'Alleen HR of Verisight kan deze route heropenen.' }, { status: 403 })
  }

  let identity
  try {
    identity = resolveRouteReopenIdentity({
      parsed,
      campaignOrgId: routeTruth.campaign.organization_id,
      visibleDepartmentLabels: routeTruth.visibleDepartmentLabels,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige route reopen-identiteit.' },
      { status: 400 },
    )
  }

  const reopenedAt = new Date().toISOString()
  const adminClient = createAdminClient()
  const persisted = {
    ...identity,
    reopen_reason: parsed.reopen_reason,
    reopened_at: reopenedAt,
    reopened_by_role: writeAccess.auditRole,
    created_by: user.id,
    updated_by: user.id,
    updated_at: reopenedAt,
  }

  const { data, error } = await adminClient
    .from('action_center_route_reopens')
    .insert(persisted)
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Route heropenen mislukt.' }, { status: 500 })
  }

  try {
    const reopen = projectActionCenterRouteReopen(data as Record<string, unknown>)
    return NextResponse.json({ reopen }, { status: 200 })
  } catch {
    return NextResponse.json({ detail: 'Route heropenen mislukt.' }, { status: 500 })
  }
}
