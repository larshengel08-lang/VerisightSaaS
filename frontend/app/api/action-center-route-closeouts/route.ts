import { NextResponse } from 'next/server'
import { buildDepartmentScopeValue } from '@/lib/action-center-manager-responses'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import { resolveActionCenterHrWriteAccess } from '@/lib/action-center-governance'
import { getActionCenterEnabledRouteDefaults } from '@/lib/action-center-route-defaults'
import {
  ActionCenterRouteCloseoutMutationError,
  isActionCenterRouteCloseoutReason,
  isActionCenterRouteCloseoutStatus,
  projectActionCenterRouteCloseout,
  assertActionCenterRouteCloseoutMutationAllowed,
  type ActionCenterRouteCloseoutRecord,
  type ActionCenterRouteCloseoutReason,
  type ActionCenterRouteCloseoutStatus,
} from '@/lib/action-center-route-closeout'
import {
  projectActionCenterRouteLifecycle,
  projectActionCenterRouteReopen,
  type ActionCenterRouteReopenRecord,
} from '@/lib/action-center-route-reopen'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

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

type CampaignRow = {
  id: string
  organization_id: string | null
  scan_type: string | null
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
  const closeoutStatus = normalizeText(input?.closeout_status)
  const closeoutReason = normalizeText(input?.closeout_reason)
  const closeoutNote = normalizeText(input?.closeout_note)

  if (
    !campaignId ||
    (routeScopeType !== 'department' && routeScopeType !== 'item') ||
    !routeScopeValue ||
    !isActionCenterRouteCloseoutStatus(closeoutStatus) ||
    !isActionCenterRouteCloseoutReason(closeoutReason)
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
    .select('id, organization_id, scan_type')
    .eq('id', input.campaignId)
    .maybeSingle()

  if (campaignError || !campaign?.id || !campaign.organization_id) {
    return { campaign: null, visibleDepartmentLabels: [] as string[] }
  }

  if (input.routeScopeType !== 'department') {
    return { campaign: campaign as CampaignRow, visibleDepartmentLabels: [] as string[] }
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

  return { campaign: campaign as CampaignRow, visibleDepartmentLabels }
}

function resolveRouteCloseoutIdentity(args: {
  parsed: ReturnType<typeof parseRouteCloseoutInput>
  campaignOrgId: string
  visibleDepartmentLabels: string[]
}) {
  let canonicalScopeValue = args.parsed.route_scope_value

  if (args.parsed.route_scope_type === 'department') {
    const departmentLabel = args.parsed.route_scope_value.toLocaleLowerCase('nl-NL').split('::').at(-1) ?? ''
    if (!args.visibleDepartmentLabels.includes(departmentLabel)) {
      throw new Error('Route closeout route bestaat niet voor deze campagne.')
    }

    canonicalScopeValue = buildDepartmentScopeValue(args.campaignOrgId, departmentLabel)
  }

  if (
    args.parsed.route_scope_type === 'item' &&
    args.parsed.route_scope_value !== buildCampaignFallbackScopeValue(args.campaignOrgId, args.parsed.campaign_id)
  ) {
    throw new Error('Route closeout route bestaat niet voor deze campagne.')
  }

  return {
    route_id: buildActionCenterRouteId(args.parsed.campaign_id, canonicalScopeValue),
    campaign_id: args.parsed.campaign_id,
    org_id: args.campaignOrgId,
    route_scope_type: args.parsed.route_scope_type,
    route_scope_value: canonicalScopeValue,
  }
}

async function loadRouteCloseoutMutationState(args: {
  adminClient: ReturnType<typeof createAdminClient>
  routeId: string
}) {
  const [closeoutResult, latestReopenResult] = await Promise.all([
    args.adminClient.from('action_center_route_closeouts').select('*').eq('route_id', args.routeId).maybeSingle(),
    args.adminClient
      .from('action_center_route_reopens')
      .select('*')
      .eq('route_id', args.routeId)
      .order('reopened_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (closeoutResult.error) {
    throw new Error(closeoutResult.error.message)
  }

  if (latestReopenResult.error) {
    throw new Error(latestReopenResult.error.message)
  }

  const routeCloseout = closeoutResult.data
    ? projectActionCenterRouteCloseout(closeoutResult.data as Record<string, unknown>)
    : null
  const latestReopen = latestReopenResult.data
    ? projectActionCenterRouteReopen(latestReopenResult.data as Record<string, unknown>)
    : null
  const lifecycle = projectActionCenterRouteLifecycle({
    routeCloseout: routeCloseout as ActionCenterRouteCloseoutRecord | null,
    routeReopens: latestReopen ? ([latestReopen] as ActionCenterRouteReopenRecord[]) : [],
  })

  if (lifecycle.activeCloseout) {
    return 'closed' as const
  }

  if (lifecycle.isCurrentlyReopened) {
    return 'reopened' as const
  }

  return 'open' as const
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

  if (!getActionCenterEnabledRouteDefaults(routeTruth.campaign.scan_type)) {
    return NextResponse.json(
      { detail: 'Route closeout blijft in deze slice beperkt tot ingeschakelde follow-through-routes.' },
      { status: 409 },
    )
  }

  const writeAccess = resolveActionCenterHrWriteAccess({
    context,
    orgMemberships,
    workspaceMemberships,
    orgId: routeTruth.campaign.organization_id,
  })

  if (!writeAccess.allowed || !writeAccess.auditRole) {
    return NextResponse.json({ detail: 'Alleen HR of Loep kan deze route afsluiten.' }, { status: 403 })
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

  const adminClient = createAdminClient()
  let currentState
  try {
    currentState = await loadRouteCloseoutMutationState({
      adminClient,
      routeId: identity.route_id,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Route closeout opslaan mislukt.' },
      { status: 500 },
    )
  }

  try {
    assertActionCenterRouteCloseoutMutationAllowed({
      actorRole: writeAccess.auditRole,
      currentState,
      closeoutReason: parsed.closeout_reason,
    })
  } catch (error) {
    if (error instanceof ActionCenterRouteCloseoutMutationError) {
      const status = error.code === 'missing_closeout_reason' ? 400 : 409
      const detail =
        error.code === 'missing_closeout_reason'
          ? 'Ongeldige route closeout input.'
          : 'Route closeout is niet toegestaan vanuit de huidige canonieke toestand.'

      return NextResponse.json({ detail }, { status })
    }

    return NextResponse.json({ detail: 'Route closeout opslaan mislukt.' }, { status: 500 })
  }

  const closedAt = new Date().toISOString()
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
