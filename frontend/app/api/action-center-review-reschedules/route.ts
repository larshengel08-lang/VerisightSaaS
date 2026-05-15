import { NextResponse } from 'next/server'
import { resolveActionCenterReviewRhythmWriteAccess } from '@/lib/action-center-governance'
import {
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
  normalizeCampaignIdentifier,
  parseActionCenterManagerResponseScopeValue,
} from '@/lib/action-center-manager-responses'
import {
  buildNextActionCenterReviewScheduleRevision,
  validateActionCenterReviewRescheduleInput,
} from '@/lib/action-center-review-reschedule'
import { loadActionCenterReviewRescheduleData } from '@/lib/action-center-review-reschedule-data'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type RollbackLatestRevisionRow = {
  revision: number | null
  operation: 'reschedule' | 'cancel' | null
  review_date: string | null
}

type RollbackReadManagerResponseRow = {
  review_scheduled_for: string | null
}

type RollbackOutcome =
  | { status: 'restored' }
  | { status: 'skipped' }
  | { status: 'failed'; detail: string }
  | {
      status: 'winner-already-persisted'
      revision: number
      operation: 'reschedule' | 'cancel'
      reviewDate: string | null
    }

function resolveCanonicalWriteIdentity(input: { orgId: string; routeScopeValue: string }) {
  const canonicalOrgId = normalizeCampaignIdentifier(input.orgId)
  if (!canonicalOrgId) {
    return null
  }

  let parsedScope
  try {
    parsedScope = parseActionCenterManagerResponseScopeValue(input.routeScopeValue)
  } catch {
    return null
  }

  if (normalizeCampaignIdentifier(parsedScope.orgId) !== canonicalOrgId) {
    return null
  }

  return {
    orgId: canonicalOrgId,
    routeScopeValue:
      parsedScope.scopeType === 'department'
        ? buildDepartmentScopeValue(canonicalOrgId, parsedScope.scopeKey)
        : buildCampaignItemScopeValue(canonicalOrgId, parsedScope.scopeKey),
  }
}

async function restoreCanonicalReviewDate(args: {
  adminClient: ReturnType<typeof createAdminClient>
  routeId: string
  campaignId: string
  routeScopeType: 'department' | 'item'
  routeScopeValue: string
  previousReviewDate: string | null
  attemptedReviewDate: string | null
  nextRevision: number
  operation: 'reschedule' | 'cancel'
  userId: string
}): Promise<RollbackOutcome> {
  const currentResult = await args.adminClient
    .from('action_center_manager_responses')
    .select('review_scheduled_for')
    .eq('campaign_id', args.campaignId)
    .eq('route_scope_type', args.routeScopeType)
    .eq('route_scope_value', args.routeScopeValue)
    .maybeSingle()

  if (currentResult.error) {
    return {
      status: 'failed',
      detail: currentResult.error.message,
    }
  }

  const currentRow = (currentResult.data ?? null) as RollbackReadManagerResponseRow | null
  if ((currentRow?.review_scheduled_for ?? null) !== args.attemptedReviewDate) {
    return { status: 'skipped' }
  }

  const latestRevisionResult = await args.adminClient
    .from('action_center_review_schedule_revisions')
    .select('revision, operation, review_date')
    .eq('route_id', args.routeId)
    .order('revision', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestRevisionResult.error) {
    return {
      status: 'failed',
      detail: latestRevisionResult.error.message,
    }
  }

  const latestRevision = (latestRevisionResult.data ?? null) as RollbackLatestRevisionRow | null
  if (
    latestRevision?.revision === args.nextRevision &&
    latestRevision.operation === args.operation &&
    (latestRevision.review_date ?? null) === args.attemptedReviewDate
  ) {
    return {
      status: 'winner-already-persisted',
      revision: latestRevision.revision,
      operation: latestRevision.operation,
      reviewDate: latestRevision.review_date ?? null,
    }
  }

  let restoreReviewDate = args.previousReviewDate
  if ((latestRevision?.revision ?? -1) >= args.nextRevision) {
    if ((latestRevision?.review_date ?? null) === args.attemptedReviewDate) {
      return { status: 'skipped' }
    }

    restoreReviewDate = latestRevision?.review_date ?? null
  }

  const rollbackQuery = args.adminClient
    .from('action_center_manager_responses')
    .update({
      review_scheduled_for: restoreReviewDate,
      updated_by: args.userId,
    })
    .eq('campaign_id', args.campaignId)
    .eq('route_scope_type', args.routeScopeType)
    .eq('route_scope_value', args.routeScopeValue)

  const rollbackResult =
    args.attemptedReviewDate === null
      ? await rollbackQuery.is('review_scheduled_for', null).select('review_scheduled_for').maybeSingle()
      : await rollbackQuery
          .eq('review_scheduled_for', args.attemptedReviewDate)
          .select('review_scheduled_for')
          .maybeSingle()

  if (rollbackResult.error) {
    return {
      status: 'failed',
      detail: rollbackResult.error.message,
    }
  }

  if (!rollbackResult.data) {
    return { status: 'skipped' }
  }

  return {
    status: 'restored',
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  let parsed
  try {
    parsed = validateActionCenterReviewRescheduleInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige review reschedule input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const canonicalWriteIdentity = resolveCanonicalWriteIdentity({
    orgId: parsed.orgId,
    routeScopeValue: parsed.routeScopeValue,
  })
  if (!canonicalWriteIdentity) {
    return NextResponse.json({ detail: 'Geen toegang om reviewdatum te beheren.' }, { status: 403 })
  }

  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const hrWriteAccess = resolveActionCenterReviewRhythmWriteAccess({
    context: {
      isVerisightAdmin: context.isVerisightAdmin,
    },
    orgMemberships,
    workspaceMemberships,
    orgId: canonicalWriteIdentity.orgId,
    routeScopeValue: canonicalWriteIdentity.routeScopeValue,
  })

  if (!hrWriteAccess.allowed) {
    return NextResponse.json({ detail: 'Geen toegang om reviewdatum te beheren.' }, { status: 403 })
  }

  const routeData = await loadActionCenterReviewRescheduleData({
    routeId: parsed.routeId,
    routeScopeValue: parsed.routeScopeValue,
    routeSourceId: parsed.routeSourceId,
    orgId: parsed.orgId,
  })

  if (routeData.status === 'unsupported-scan-type') {
    return NextResponse.json(
      { detail: 'Review reschedule blijft in deze slice beperkt tot ExitScan.' },
      { status: 409 },
    )
  }

  if (routeData.status === 'missing-canonical-review-truth') {
    return NextResponse.json(
      { detail: 'Review reschedule vereist bestaande canonieke reviewwaarheid.' },
      { status: 409 },
    )
  }

  if (routeData.status !== 'ok') {
    return NextResponse.json({ detail: 'Review reschedule route bestaat niet.' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const reviewDate = parsed.operation === 'cancel' ? null : parsed.reviewDate
  const previousReviewDate = routeData.reviewDate

  if (parsed.operation === 'cancel' && routeData.reviewDate === null) {
    return NextResponse.json(
      { detail: 'Review reschedule vereist bestaande afwijkende reviewwaarheid.' },
      { status: 409 },
    )
  }

  const updateResult = await adminClient
    .from('action_center_manager_responses')
    .update({
      review_scheduled_for: reviewDate,
      updated_by: user.id,
    })
    .eq('campaign_id', routeData.campaignId)
    .eq('route_scope_type', routeData.routeScopeType)
    .eq('route_scope_value', routeData.routeScopeValue)
    .select('review_scheduled_for')
    .single()

  if (updateResult.error || !updateResult.data) {
    return NextResponse.json(
      { detail: updateResult.error?.message ?? 'Review reschedule opslaan mislukt.' },
      { status: 500 },
    )
  }

  const nextRevision = buildNextActionCenterReviewScheduleRevision(routeData.latestRevision)
  const insertResult = await adminClient
    .from('action_center_review_schedule_revisions')
    .insert({
      org_id: routeData.orgId,
      route_id: routeData.routeId,
      route_scope_value: routeData.routeScopeValue,
      route_source_id: routeData.campaignId,
      scan_type: routeData.scanType,
      revision: nextRevision,
      operation: parsed.operation,
      previous_review_date: previousReviewDate,
      review_date: reviewDate,
      reason: parsed.reason,
      changed_by: user.id,
      changed_by_role: hrWriteAccess.auditRole,
    })
    .select('revision, operation, review_date')
    .single()

  if (insertResult.error || !insertResult.data) {
    const rollback = await restoreCanonicalReviewDate({
      adminClient,
      routeId: routeData.routeId,
      campaignId: routeData.campaignId,
      routeScopeType: routeData.routeScopeType,
      routeScopeValue: routeData.routeScopeValue,
      previousReviewDate: routeData.reviewDate,
      attemptedReviewDate: reviewDate,
      nextRevision,
      operation: parsed.operation,
      userId: user.id,
    }).catch((error) => ({
      status: 'failed' as const,
      detail: error instanceof Error ? error.message : 'rollback failed',
    }))

    if (rollback.status === 'winner-already-persisted') {
      return NextResponse.json(
        {
          revision: rollback.revision,
          operation: rollback.operation,
          reviewDate: rollback.reviewDate,
        },
        { status: 200 },
      )
    }

    if (rollback.status === 'failed') {
      return NextResponse.json(
        {
          detail: insertResult.error?.message ?? 'Review reschedule opslaan mislukt.',
          rollback: 'failed',
          rollbackDetail: rollback.detail,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        detail: insertResult.error?.message ?? 'Review reschedule opslaan mislukt.',
        rollback: rollback.status,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      revision: insertResult.data.revision,
      operation: insertResult.data.operation,
      reviewDate: insertResult.data.review_date,
    },
    { status: 200 },
  )
}
