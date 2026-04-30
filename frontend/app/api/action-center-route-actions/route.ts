import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { validateActionCenterRouteActionWriteInput } from '@/lib/action-center-route-actions'
import { resolveRouteActionWriteIdentity } from '@/lib/action-center-route-write-access'
import type { ActionCenterWorkspaceMember } from '@/lib/suite-access'

type RespondentDepartmentRow = {
  department: string | null
}

type RouteActionRequestBody = {
  campaign_id?: string
  route_scope_type?: 'department' | 'item'
  route_scope_value?: string
  manager_user_id?: string | null
  primary_action_theme_key?: string | null
  primary_action_text?: string | null
  primary_action_expected_effect?: string | null
  primary_action_status?: string | null
  review_scheduled_for?: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  const normalized = normalizeText(value)
  return normalized ? normalized.toLocaleLowerCase('nl-NL') : null
}

function parseRouteActionRequestInput(input: RouteActionRequestBody | null) {
  const campaignId = normalizeText(input?.campaign_id)
  const routeScopeType = input?.route_scope_type
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const managerUserId = normalizeText(input?.manager_user_id)
  const themeKey = normalizeText(input?.primary_action_theme_key)
  const actionText = normalizeText(input?.primary_action_text)
  const expectedEffect = normalizeText(input?.primary_action_expected_effect)
  const reviewScheduledFor = normalizeText(input?.review_scheduled_for)
  const status = normalizeText(input?.primary_action_status) ?? 'open'

  if (
    !campaignId ||
    (routeScopeType !== 'department' && routeScopeType !== 'item') ||
    !routeScopeValue ||
    !themeKey ||
    !actionText ||
    !expectedEffect ||
    !reviewScheduledFor
  ) {
    throw new Error('Ongeldige route action input.')
  }

  return {
    campaign_id: campaignId,
    route_scope_type: routeScopeType,
    route_scope_value: routeScopeValue,
    manager_user_id: managerUserId,
    primary_action_theme_key: themeKey,
    primary_action_text: actionText,
    primary_action_expected_effect: expectedEffect,
    primary_action_status: status,
    review_scheduled_for: reviewScheduledFor,
  }
}

async function loadWritableRouteTruth(input: {
  campaignId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
}) {
  const adminClient = createAdminClient()
  const [
    { data: campaign, error: campaignError },
    { data: routeContainer, error: routeContainerError },
  ] = await Promise.all([
    adminClient.from('campaigns').select('id, organization_id').eq('id', input.campaignId).maybeSingle(),
    adminClient
      .from('action_center_manager_responses')
      .select('id, campaign_id, org_id, route_scope_type, route_scope_value, manager_user_id')
      .eq('campaign_id', input.campaignId)
      .eq('route_scope_type', input.routeScopeType)
      .eq('route_scope_value', input.routeScopeValue)
      .maybeSingle(),
  ])

  if (campaignError || !campaign?.id || !campaign.organization_id) {
    return { campaign: null, routeContainer: null, visibleDepartmentLabels: [] }
  }

  if (
    routeContainerError ||
    !routeContainer?.id ||
    !routeContainer.campaign_id ||
    !routeContainer.org_id ||
    !routeContainer.route_scope_type ||
    !routeContainer.route_scope_value ||
    !routeContainer.manager_user_id
  ) {
    return { campaign, routeContainer: null, visibleDepartmentLabels: [] }
  }

  if (input.routeScopeType !== 'department') {
    return { campaign, routeContainer, visibleDepartmentLabels: [] }
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

  return { campaign, routeContainer, visibleDepartmentLabels }
}

function findWritableMembership(
  workspaceMemberships: ActionCenterWorkspaceMember[],
  input: {
    orgId: string
    userId: string
    routeScopeType: 'department' | 'item'
    routeScopeValue: string
  },
) {
  return (
    workspaceMemberships.find(
      (membership) =>
        membership.org_id === input.orgId &&
        membership.user_id === input.userId &&
        membership.access_role === 'manager_assignee' &&
        membership.scope_type === input.routeScopeType &&
        membership.scope_value === input.routeScopeValue &&
        membership.can_view &&
        membership.can_update,
    ) ?? null
  )
}

async function loadAssignedManagerMembership(input: {
  orgId: string
  managerUserId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
}) {
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('action_center_workspace_members')
    .select(
      'org_id, user_id, display_name, login_email, access_role, scope_type, scope_value, can_view, can_update, created_at, updated_at',
    )
    .eq('org_id', input.orgId)
    .eq('user_id', input.managerUserId)
    .eq('access_role', 'manager_assignee')
    .eq('scope_type', input.routeScopeType)
    .eq('scope_value', input.routeScopeValue)
    .maybeSingle()

  return (data ?? null) as ActionCenterWorkspaceMember | null
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RouteActionRequestBody | null

  let parsed
  try {
    parsed = parseRouteActionRequestInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route action input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const routeTruth = await loadWritableRouteTruth({
    campaignId: parsed.campaign_id,
    routeScopeType: parsed.route_scope_type,
    routeScopeValue: parsed.route_scope_value,
  })

  if (!routeTruth.campaign?.organization_id) {
    return NextResponse.json({ detail: 'Route action route bestaat niet voor deze campagne.' }, { status: 400 })
  }

  const currentUserMembership = findWritableMembership(workspaceMemberships, {
    orgId: routeTruth.campaign.organization_id,
    userId: user.id,
      routeScopeType: parsed.route_scope_type,
      routeScopeValue: parsed.route_scope_value,
  })

  if (!routeTruth.routeContainer?.id) {
    return NextResponse.json({ detail: 'Route action route-container bestaat niet voor deze route.' }, { status: 400 })
  }

  const assignedManagerMembership = context.isVerisightAdmin
    ? await loadAssignedManagerMembership({
        orgId: routeTruth.campaign.organization_id,
        managerUserId: routeTruth.routeContainer.manager_user_id,
        routeScopeType: parsed.route_scope_type,
        routeScopeValue: parsed.route_scope_value,
      })
    : currentUserMembership

  let identity
  try {
    identity = resolveRouteActionWriteIdentity({
      submitted: {
        campaign_id: parsed.campaign_id,
        route_scope_type: parsed.route_scope_type,
        route_scope_value: parsed.route_scope_value,
        manager_user_id: parsed.manager_user_id,
      },
      routeContainer: routeTruth.routeContainer,
      currentUserId: user.id,
      campaignOrgId: routeTruth.campaign.organization_id,
      visibleDepartmentLabels: routeTruth.visibleDepartmentLabels,
      currentUserMembership,
      assignedManagerMembership,
      isVerisightAdmin: context.isVerisightAdmin,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Ongeldige route action route-identiteit.'
    const status =
      detail.includes('Alleen de toegewezen manager') || detail.includes('Geen geldige manager-toewijzing')
        ? 403
        : 400
    return NextResponse.json({ detail }, { status })
  }

  const now = new Date().toISOString()

  try {
    validateActionCenterRouteActionWriteInput({
      id: '00000000-0000-0000-0000-000000000000',
      route_id: identity.route_id,
      campaign_id: identity.campaign_id,
      route_scope_type: identity.route_scope_type,
      route_scope_value: identity.route_scope_value,
      owner_name: identity.owner_name,
      owner_assigned_at: identity.owner_assigned_at,
      primary_action_theme_key: parsed.primary_action_theme_key,
      primary_action_text: parsed.primary_action_text,
      primary_action_expected_effect: parsed.primary_action_expected_effect,
      primary_action_status: parsed.primary_action_status,
      review_scheduled_for: parsed.review_scheduled_for,
      created_at: now,
      updated_at: now,
    })
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route action input.' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('action_center_route_actions')
    .insert({
      manager_response_id: identity.manager_response_id,
      campaign_id: identity.campaign_id,
      org_id: identity.org_id,
      route_id: identity.route_id,
      route_scope_type: identity.route_scope_type,
      route_scope_value: identity.route_scope_value,
      manager_user_id: identity.manager_user_id,
      owner_name: identity.owner_name,
      owner_assigned_at: identity.owner_assigned_at,
      primary_action_theme_key: parsed.primary_action_theme_key,
      primary_action_text: parsed.primary_action_text,
      primary_action_expected_effect: parsed.primary_action_expected_effect,
      primary_action_status: parsed.primary_action_status,
      review_scheduled_for: parsed.review_scheduled_for,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Route action opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ action: data }, { status: 200 })
}
