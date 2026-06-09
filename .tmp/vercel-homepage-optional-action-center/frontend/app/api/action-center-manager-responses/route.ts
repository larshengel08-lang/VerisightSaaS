import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import type { ActionCenterWorkspaceMember } from '@/lib/suite-access'
import {
  resolveManagerResponseWriteIdentity,
  validateActionCenterManagerResponseWriteInput,
} from '@/lib/action-center-manager-responses'

type RespondentDepartmentRow = {
  department: string | null
}

function normalizeDepartmentLabel(value: string | null | undefined) {
  return value?.trim() || null
}

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
    return { user, membership: null, isVerisightAdmin: true, error: null }
  }

  const assignment =
    workspaceMemberships.find(
      (membership) =>
        membership.org_id === input.orgId &&
        membership.access_role === 'manager_assignee' &&
        membership.scope_type === input.scopeType &&
        membership.scope_value === input.scopeValue &&
        membership.can_view &&
        membership.can_update,
    ) ?? null

  const canRespond = Boolean(assignment)

  if (!canRespond) {
    return {
      user: null,
      membership: null,
      isVerisightAdmin: false,
      error: NextResponse.json(
        { detail: 'Alleen de toegewezen manager kan op dit open verzoek reageren.' },
        { status: 403 },
      ),
    }
  }

  return {
    user,
    membership: assignment as ActionCenterWorkspaceMember,
    isVerisightAdmin: false,
    error: null,
  }
}

async function loadManagerResponseRouteTruth(input: {
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
    return { campaign: null, visibleDepartmentLabels: [] }
  }

  if (input.routeScopeType !== 'department') {
    return { campaign, visibleDepartmentLabels: [] }
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

function buildValidatedWritePayload(args: {
  parsed: ReturnType<typeof validateActionCenterManagerResponseWriteInput>
  currentUserId: string
  membership: Pick<
    ActionCenterWorkspaceMember,
    'org_id' | 'user_id' | 'access_role' | 'scope_type' | 'scope_value' | 'can_view' | 'can_update'
  > | null
  isVerisightAdmin: boolean
  campaignOrgId: string
  visibleDepartmentLabels: string[]
}) {
  const identity = resolveManagerResponseWriteIdentity({
    submitted: {
      campaign_id: args.parsed.campaign_id,
      org_id: args.parsed.org_id,
      route_scope_type: args.parsed.route_scope_type,
      route_scope_value: args.parsed.route_scope_value,
      manager_user_id: args.parsed.manager_user_id,
    },
    currentUserId: args.currentUserId,
    campaignOrgId: args.campaignOrgId,
    visibleDepartmentLabels: args.visibleDepartmentLabels,
    membership: args.membership,
    isVerisightAdmin: args.isVerisightAdmin,
  })

  return {
    ...identity,
    response_type: args.parsed.response_type,
    response_note: args.parsed.response_note,
    review_scheduled_for: args.parsed.review_scheduled_for,
    primary_action_theme_key: args.parsed.primary_action_theme_key,
    primary_action_text: args.parsed.primary_action_text,
    primary_action_expected_effect: args.parsed.primary_action_expected_effect,
    primary_action_status: args.parsed.primary_action_status,
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  let parsed
  try {
    parsed = validateActionCenterManagerResponseWriteInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige manager response input.' }, { status: 400 })
  }

  const routeTruth = await loadManagerResponseRouteTruth({
    campaignId: parsed.campaign_id,
    routeScopeType: parsed.route_scope_type,
  })

  if (!routeTruth.campaign?.organization_id) {
    return NextResponse.json({ detail: 'Manager response route bestaat niet voor deze campagne.' }, { status: 400 })
  }

  const access = await requireManagerResponseAccess({
    orgId: routeTruth.campaign.organization_id,
    scopeType: parsed.route_scope_type,
    scopeValue: parsed.route_scope_value,
  })
  if (access.error || !access.user) {
    return access.error
  }

  let writePayload
  try {
    writePayload = buildValidatedWritePayload({
      parsed,
      currentUserId: access.user.id,
      membership: access.membership,
      isVerisightAdmin: access.isVerisightAdmin,
      campaignOrgId: routeTruth.campaign.organization_id,
      visibleDepartmentLabels: routeTruth.visibleDepartmentLabels,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Ongeldige manager response route-identiteit.' },
      { status: 400 },
    )
  }

  const adminClient = createAdminClient()
  const now = new Date().toISOString()

  const { data, error } = await adminClient
    .from('action_center_manager_responses')
    .upsert(
      {
        ...writePayload,
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
