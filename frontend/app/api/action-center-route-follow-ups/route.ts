import { NextResponse } from 'next/server'
import {
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
  inferActionCenterManagerResponseScopeType,
  normalizeCampaignIdentifier,
  parseActionCenterManagerResponseScopeValue,
  type ActionCenterManagerResponseScopeType,
  type ActionCenterManagerResponseWriteInput,
} from '@/lib/action-center-manager-responses'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import { projectActionCenterRouteFollowUpRelation } from '@/lib/action-center-route-reopen'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import type { SupabaseClient } from '@supabase/supabase-js'

type FollowUpRouteBody = {
  source_campaign_id?: string | null
  source_route_scope_value?: string | null
  target_campaign_id?: string | null
  target_route_scope_value?: string | null
  trigger_reason?: string | null
  manager_user_id?: string | null
}

type CampaignRow = {
  id: string
  organization_id: string | null
}

type RouteCloseoutRow = {
  route_id: string
  closed_at: string | null
}

type ManagerResponseCarrierRow = {
  id: string
  campaign_id: string
  route_scope_type: 'department' | 'item'
  route_scope_value: string
}

type FollowUpWriteAccess = {
  recordedByRole: 'verisight_admin' | 'hr'
}

type ManagerAssignmentRow = {
  org_id: string
  user_id: string
  access_role: 'manager_assignee'
  scope_value: string
  can_view: boolean
  can_update: boolean
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function getCanonicalCampaignRouteScope(args: {
  campaignId: string
  campaignOrgId: string
  routeScopeValue: string
}) {
  const parsedScope = parseActionCenterManagerResponseScopeValue(args.routeScopeValue)
  const routeScopeType = inferActionCenterManagerResponseScopeType(args.routeScopeValue)

  if (routeScopeType === 'item') {
    const canonicalItemScopeValue = buildCampaignItemScopeValue(args.campaignOrgId, args.campaignId)
    return {
      routeScopeType,
      routeScopeValue: canonicalItemScopeValue,
      isCanonical:
        parsedScope.orgId === args.campaignOrgId && parsedScope.canonicalScopeValue === canonicalItemScopeValue,
    }
  }

  const canonicalDepartmentScopeValue = buildDepartmentScopeValue(args.campaignOrgId, parsedScope.scopeKey)

  return {
    routeScopeType,
    routeScopeValue: canonicalDepartmentScopeValue,
    isCanonical: parsedScope.orgId === args.campaignOrgId && args.routeScopeValue === canonicalDepartmentScopeValue,
  }
}

function validateFollowUpScopeContext(args: {
  sourceCampaignId: string
  sourceCampaignOrgId: string
  sourceRouteScopeValue: string
  targetCampaignId: string
  targetCampaignOrgId: string
  targetRouteScopeValue: string
}) {
  const sourceScope = getCanonicalCampaignRouteScope({
    campaignId: args.sourceCampaignId,
    campaignOrgId: args.sourceCampaignOrgId,
    routeScopeValue: args.sourceRouteScopeValue,
  })
  const targetScope = getCanonicalCampaignRouteScope({
    campaignId: args.targetCampaignId,
    campaignOrgId: args.targetCampaignOrgId,
    routeScopeValue: args.targetRouteScopeValue,
  })

  if (sourceScope.routeScopeType === 'item' || targetScope.routeScopeType === 'item') {
    throw new Error('V1 follow-up routes worden alleen ondersteund voor department scopes.')
  }

  if (sourceScope.routeScopeType !== targetScope.routeScopeType) {
    throw new Error('V1 follow-up route-triggers moeten binnen dezelfde scope of afdeling-context blijven.')
  }

  if (sourceScope.routeScopeType === 'department') {
    if (!sourceScope.isCanonical || !targetScope.isCanonical) {
      throw new Error(
        'V1 department-scope follow-up route-triggers moeten de canonieke afdeling-scope voor bron en doel gebruiken.',
      )
    }

    if (sourceScope.routeScopeValue !== targetScope.routeScopeValue) {
      throw new Error('V1 follow-up route-triggers moeten binnen dezelfde scope of afdeling-context blijven.')
    }
  }

  return {
    routeScopeType: sourceScope.routeScopeType as ActionCenterManagerResponseScopeType,
    sourceRouteScopeValue: sourceScope.routeScopeValue,
    targetRouteScopeValue: targetScope.routeScopeValue,
  }
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function buildFollowUpManagerResponse(args: {
  campaignId: string
  orgId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
  managerUserId: string
}): ActionCenterManagerResponseWriteInput {
  return {
    campaign_id: args.campaignId,
    org_id: args.orgId,
    route_scope_type: args.routeScopeType,
    route_scope_value: args.routeScopeValue,
    manager_user_id: args.managerUserId,
    response_type: 'schedule',
    response_note: 'Vervolgroute geopend door HR.',
    review_scheduled_for: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    primary_action_theme_key: null,
    primary_action_text: null,
    primary_action_expected_effect: null,
    primary_action_status: null,
  }
}

function parseFollowUpBody(input: FollowUpRouteBody | null) {
  const sourceCampaignId = normalizeCampaignIdentifier(input?.source_campaign_id)
  const sourceRouteScopeValue = normalizeText(input?.source_route_scope_value)
  const targetCampaignId = normalizeCampaignIdentifier(input?.target_campaign_id)
  const targetRouteScopeValue = normalizeText(input?.target_route_scope_value)
  const triggerReason = normalizeText(input?.trigger_reason)
  const managerUserId = normalizeText(input?.manager_user_id)

  if (!sourceCampaignId || !sourceRouteScopeValue || !targetCampaignId || !targetRouteScopeValue) {
    throw new Error('source_campaign_id, source_route_scope_value, target_campaign_id en target_route_scope_value zijn verplicht.')
  }

  if (!triggerReason) {
    throw new Error('trigger_reason is verplicht.')
  }

  if (!managerUserId) {
    throw new Error('manager_user_id is verplicht.')
  }

  if (!isUuidLike(sourceCampaignId)) {
    throw new Error('source_campaign_id moet een geldige UUID zijn.')
  }

  if (!isUuidLike(targetCampaignId)) {
    throw new Error('target_campaign_id moet een geldige UUID zijn.')
  }

  if (!isUuidLike(managerUserId)) {
    throw new Error('manager_user_id moet een geldige UUID zijn.')
  }

  return {
    sourceCampaignId,
    sourceRouteScopeValue,
    targetCampaignId,
    targetRouteScopeValue,
    triggerReason,
    managerUserId,
  }
}

async function loadManagerAssignment(args: {
  adminClient: ReturnType<typeof createAdminClient>
  orgId: string
  managerUserId: string
  scopeValue: string
}) {
  const { data, error } = await args.adminClient
    .from('action_center_workspace_members')
    .select('org_id, user_id, access_role, scope_value, can_view, can_update')
    .eq('org_id', args.orgId)
    .eq('user_id', args.managerUserId)
    .eq('access_role', 'manager_assignee')
    .eq('scope_value', args.scopeValue)
    .maybeSingle()

  if (error) {
    return { assignment: null, error }
  }

  return {
    assignment: (data ?? null) as ManagerAssignmentRow | null,
    error: null,
  }
}

async function resolveFollowUpWriteAccess(args: { supabase: SupabaseClient; userId: string; orgId: string }) {
  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(args.supabase, args.userId)

  if (context.isVerisightAdmin) {
    return { access: { recordedByRole: 'verisight_admin' } satisfies FollowUpWriteAccess, error: null }
  }

  const orgMembership = orgMemberships.find((membership) => membership.org_id === args.orgId) ?? null
  if (orgMembership?.role === 'owner') {
    return { access: { recordedByRole: 'hr' } satisfies FollowUpWriteAccess, error: null }
  }

  const hrWorkspaceMembership =
    workspaceMemberships.find(
      (membership) =>
        membership.org_id === args.orgId &&
        (membership.access_role === 'hr_owner' || membership.access_role === 'hr_member') &&
        membership.can_update,
    ) ?? null

  if (hrWorkspaceMembership) {
    return {
      access: {
        recordedByRole: 'hr',
      } satisfies FollowUpWriteAccess,
      error: null,
    }
  }

  return {
    access: null,
    error: NextResponse.json(
      { detail: 'Alleen HR of Verisight kan een follow-up route-trigger vastleggen.' },
      { status: 403 },
    ),
  }
}

async function loadCampaign(adminClient: ReturnType<typeof createAdminClient>, campaignId: string) {
  const { data, error } = await adminClient
    .from('campaigns')
    .select('id, organization_id')
    .eq('id', campaignId)
    .maybeSingle()

  if (error) {
    return { campaign: null, error }
  }

  return {
    campaign: (data ?? null) as CampaignRow | null,
    error: null,
  }
}

async function loadRouteCloseout(adminClient: ReturnType<typeof createAdminClient>, routeId: string) {
  const { data, error } = await adminClient
    .from('action_center_route_closeouts')
    .select('route_id, closed_at')
    .eq('route_id', routeId)
    .maybeSingle()

  if (error) {
    return { closeout: null, error }
  }

  return {
    closeout: (data ?? null) as RouteCloseoutRow | null,
    error: null,
  }
}

async function loadExistingManagerResponseCarrier(args: {
  adminClient: ReturnType<typeof createAdminClient>
  campaignId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
}) {
  const { data, error } = await args.adminClient
    .from('action_center_manager_responses')
    .select('id, campaign_id, route_scope_type, route_scope_value')
    .eq('campaign_id', args.campaignId)
    .eq('route_scope_type', args.routeScopeType)
    .eq('route_scope_value', args.routeScopeValue)
    .maybeSingle()

  if (error) {
    return { response: null, error }
  }

  return {
    response: (data ?? null) as ManagerResponseCarrierRow | null,
    error: null,
  }
}

async function deleteManagerResponseCarrier(args: {
  adminClient: ReturnType<typeof createAdminClient>
  id: string
  campaignId: string
}) {
  const { error } = await args.adminClient
    .from('action_center_manager_responses')
    .delete()
    .eq('id', args.id)
    .eq('campaign_id', args.campaignId)

  return { error: error ?? null }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FollowUpRouteBody | null

  let parsed
  try {
    parsed = parseFollowUpBody(body)
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige follow-up route request.' },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const [sourceResult, targetResult] = await Promise.all([
    loadCampaign(adminClient, parsed.sourceCampaignId),
    loadCampaign(adminClient, parsed.targetCampaignId),
  ])

  if (sourceResult.error) {
    return NextResponse.json({ detail: sourceResult.error.message }, { status: 500 })
  }

  if (targetResult.error) {
    return NextResponse.json({ detail: targetResult.error.message }, { status: 500 })
  }

  if (!sourceResult.campaign?.id || !sourceResult.campaign.organization_id) {
    return NextResponse.json({ detail: 'Broncampagne niet gevonden.' }, { status: 404 })
  }

  if (!targetResult.campaign?.id || !targetResult.campaign.organization_id) {
    return NextResponse.json({ detail: 'Doelcampagne niet gevonden.' }, { status: 404 })
  }

  if (sourceResult.campaign.organization_id !== targetResult.campaign.organization_id) {
    return NextResponse.json({ detail: 'Source en target moeten binnen dezelfde org vallen.' }, { status: 400 })
  }

  let scopeContext
  try {
    scopeContext = validateFollowUpScopeContext({
      sourceCampaignId: parsed.sourceCampaignId,
      sourceCampaignOrgId: sourceResult.campaign.organization_id,
      sourceRouteScopeValue: parsed.sourceRouteScopeValue,
      targetCampaignId: parsed.targetCampaignId,
      targetCampaignOrgId: targetResult.campaign.organization_id,
      targetRouteScopeValue: parsed.targetRouteScopeValue,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige follow-up route-identiteit.' },
      { status: 400 },
    )
  }

  const access = await resolveFollowUpWriteAccess({
    supabase,
    userId: user.id,
    orgId: sourceResult.campaign.organization_id,
  })
  if (access.error || !access.access) {
    return access.error
  }

  const sourceRouteId = buildActionCenterRouteId(parsed.sourceCampaignId, scopeContext.sourceRouteScopeValue)
  const targetRouteId = buildActionCenterRouteId(parsed.targetCampaignId, scopeContext.targetRouteScopeValue)

  if (sourceRouteId === targetRouteId) {
    return NextResponse.json(
      { detail: 'Een follow-up route-trigger moet een nieuwe route of manager handoff openen, niet dezelfde route hergebruiken.' },
      { status: 409 },
    )
  }

  const sourceCloseoutResult = await loadRouteCloseout(adminClient, sourceRouteId)
  if (sourceCloseoutResult.error) {
    return NextResponse.json({ detail: sourceCloseoutResult.error.message }, { status: 500 })
  }

  if (!sourceCloseoutResult.closeout?.closed_at) {
    return NextResponse.json(
      { detail: 'Een follow-up route-trigger vereist eerst een closed source route.' },
      { status: 409 },
    )
  }

  const managerAssignmentResult = await loadManagerAssignment({
    adminClient,
    orgId: sourceResult.campaign.organization_id,
    managerUserId: parsed.managerUserId,
    scopeValue: scopeContext.targetRouteScopeValue,
  })

  if (managerAssignmentResult.error) {
    return NextResponse.json({ detail: managerAssignmentResult.error.message }, { status: 500 })
  }

  if (
    !managerAssignmentResult.assignment ||
    !managerAssignmentResult.assignment.can_view ||
    !managerAssignmentResult.assignment.can_update
  ) {
    return NextResponse.json(
      { detail: 'manager_user_id moet een toegewezen manager assignee zijn voor deze follow-up route scope.' },
      { status: 400 },
    )
  }

  const nowIso = new Date().toISOString()

  let relationTruth
  try {
    relationTruth = projectActionCenterRouteFollowUpRelation({
      route_relation_type: 'follow-up-from',
      source_route_id: sourceRouteId,
      target_route_id: targetRouteId,
      trigger_reason: parsed.triggerReason,
      recorded_at: nowIso,
      recorded_by_role: access.access.recordedByRole,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige follow-up route-relatie.' },
      { status: 400 },
    )
  }

  const { data: existingRelations, error: existingRelationsError } = await adminClient
    .from('action_center_route_relations')
    .select('id, route_relation_type, source_route_id, target_route_id, trigger_reason, ended_at')
    .eq('route_relation_type', 'follow-up-from')
    .eq('source_route_id', relationTruth.sourceRouteId)
    .is('ended_at', null)

  if (existingRelationsError) {
    return NextResponse.json(
      { detail: existingRelationsError.message ?? 'Bestaande follow-up route-relaties ophalen mislukt.' },
      { status: 500 },
    )
  }

  if ((existingRelations ?? []).length > 0) {
    return NextResponse.json(
      { detail: 'Er bestaat al een active direct follow-up voor deze gesloten bronroute.' },
      { status: 409 },
    )
  }

  const existingManagerResponseResult = await loadExistingManagerResponseCarrier({
    adminClient,
    campaignId: parsed.targetCampaignId,
    routeScopeType: scopeContext.routeScopeType,
    routeScopeValue: scopeContext.targetRouteScopeValue,
  })

  if (existingManagerResponseResult.error) {
    return NextResponse.json(
      { detail: existingManagerResponseResult.error.message ?? 'Bestaande manager handoff ophalen mislukt.' },
      { status: 500 },
    )
  }

  if (existingManagerResponseResult.response) {
    return NextResponse.json(
      { detail: 'Voor deze doelroute bestaat al een manager response carrier; overschrijven is in V1 niet toegestaan.' },
      { status: 409 },
    )
  }

  // V1 follow-up routes are opened through the existing manager-response carrier.
  // HR does not create an action here; it only creates a new manager handoff route.
  const { data: managerResponse, error: managerResponseError } = await adminClient
    .from('action_center_manager_responses')
    .insert({
      ...buildFollowUpManagerResponse({
        campaignId: parsed.targetCampaignId,
        orgId: sourceResult.campaign.organization_id,
        routeScopeType: scopeContext.routeScopeType,
        routeScopeValue: scopeContext.targetRouteScopeValue,
        managerUserId: parsed.managerUserId,
      }),
      created_by: user.id,
      updated_by: user.id,
      updated_at: nowIso,
    })
    .select('*')
    .single()

  if (managerResponseError?.code === '23505') {
    return NextResponse.json(
      { detail: 'Voor deze doelroute bestaat al een manager response carrier; overschrijven is in V1 niet toegestaan.' },
      { status: 409 },
    )
  }

  if (managerResponseError || !managerResponse) {
    return NextResponse.json(
      { detail: managerResponseError?.message ?? 'Vervolgroute openen mislukt.' },
      { status: 500 },
    )
  }

  const { data: insertedRelation, error: insertError } = await adminClient
    .from('action_center_route_relations')
    .insert({
      org_id: sourceResult.campaign.organization_id,
      source_campaign_id: parsed.sourceCampaignId,
      source_route_id: relationTruth.sourceRouteId,
      source_route_scope_value: scopeContext.sourceRouteScopeValue,
      target_campaign_id: parsed.targetCampaignId,
      target_route_id: relationTruth.targetRouteId,
      target_route_scope_value: scopeContext.targetRouteScopeValue,
      route_relation_type: relationTruth.routeRelationType,
      trigger_reason: relationTruth.triggerReason,
      manager_user_id: parsed.managerUserId,
      recorded_by: user.id,
      recorded_by_role: relationTruth.recordedByRole,
      recorded_at: relationTruth.recordedAt,
      ended_at: relationTruth.endedAt ?? null,
    })
    .select('*')
    .single()

  if (insertError || !insertedRelation) {
    const rollbackResult = await deleteManagerResponseCarrier({
      adminClient,
      id: managerResponse.id,
      campaignId: parsed.targetCampaignId,
    })

    if (rollbackResult.error) {
      return NextResponse.json(
        {
          detail:
            rollbackResult.error.message ??
            'Follow-up route-relatie opslaan mislukte en de nieuwe manager handoff kon niet worden teruggedraaid.',
        },
        { status: 500 },
      )
    }
  }

  if (insertError?.code === '23505') {
    return NextResponse.json(
      { detail: 'Er bestaat al een active direct follow-up voor deze gesloten bronroute.' },
      { status: 409 },
    )
  }

  if (insertError || !insertedRelation) {
    return NextResponse.json(
      { detail: insertError?.message ?? 'Follow-up route-relatie opslaan mislukt.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ relation: insertedRelation }, { status: 201 })
}
