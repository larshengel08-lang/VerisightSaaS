import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'
import { validateActionCenterActionReviewInput } from '@/lib/action-center-action-reviews'
import { resolveActionReviewWriteIdentity } from '@/lib/action-center-route-write-access'
import type { ActionCenterWorkspaceMember } from '@/lib/suite-access'

type ActionReviewRequestBody = {
  action_id?: string
  reviewed_at?: string
  observation?: string
  action_outcome?: string
  follow_up_note?: string | null
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseActionReviewRequestInput(input: ActionReviewRequestBody | null) {
  const actionId = normalizeText(input?.action_id)
  const reviewedAt = normalizeText(input?.reviewed_at)
  const observation = normalizeText(input?.observation)
  const actionOutcome = normalizeText(input?.action_outcome)
  const followUpNote = normalizeText(input?.follow_up_note)

  if (!actionId || !reviewedAt || !observation || !actionOutcome) {
    throw new Error('Ongeldige route action review input.')
  }

  return {
    action_id: actionId,
    reviewed_at: reviewedAt,
    observation,
    action_outcome: actionOutcome,
    follow_up_note: followUpNote,
  }
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ActionReviewRequestBody | null

  let parsed
  try {
    parsed = parseActionReviewRequestInput(body)
    validateActionCenterActionReviewInput({
      action_review_id: '00000000-0000-0000-0000-000000000000',
      ...parsed,
    })
  } catch {
    return NextResponse.json({ detail: 'Ongeldige route action review input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const adminClient = createAdminClient()
  const { data: action, error: actionError } = await adminClient
    .from('action_center_route_actions')
    .select('id, org_id, route_scope_type, route_scope_value, manager_user_id')
    .eq('id', parsed.action_id)
    .maybeSingle()

  if (actionError || !action) {
    return NextResponse.json({ detail: 'Route action bestaat niet.' }, { status: 400 })
  }

  const routeScopeType =
    action.route_scope_type === 'department' || action.route_scope_type === 'item'
      ? action.route_scope_type
      : null
  const routeScopeValue = normalizeText(action.route_scope_value)

  const currentUserMembership =
    routeScopeType && routeScopeValue
      ? findWritableMembership(workspaceMemberships, {
          orgId: action.org_id,
          userId: user.id,
          routeScopeType,
          routeScopeValue,
        })
      : null

  try {
    resolveActionReviewWriteIdentity({
      action,
      currentUserId: user.id,
      currentUserMembership,
      isVerisightAdmin: context.isVerisightAdmin,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Ongeldige route action review-identiteit.'
    const status = detail.includes('Alleen de toegewezen manager') ? 403 : 400
    return NextResponse.json({ detail }, { status })
  }

  const { data, error } = await adminClient
    .from('action_center_action_reviews')
    .insert({
      action_id: parsed.action_id,
      reviewed_at: parsed.reviewed_at,
      observation: parsed.observation,
      action_outcome: parsed.action_outcome,
      follow_up_note: parsed.follow_up_note,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Route action review opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ review: data }, { status: 200 })
}
