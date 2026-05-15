import { NextResponse } from 'next/server'
import { resolveActionCenterHrWriteAccess } from '@/lib/action-center-governance'
import { validateActionCenterReviewRhythmInput } from '@/lib/action-center-review-rhythm'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import {
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
  parseActionCenterManagerResponseScopeValue,
} from '@/lib/action-center-manager-responses'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type ReviewRhythmRequestBody = {
  routeId?: string | null
  routeScopeValue?: string | null
  routeSourceId?: string | null
  orgId?: string | null
  scanType?: string | null
  cadenceDays?: 7 | 14 | 30
  reminderLeadDays?: 1 | 3 | 5
  escalationLeadDays?: 3 | 7 | 14
  remindersEnabled?: boolean
}

type CampaignRow = {
  id: string
  organization_id: string | null
  scan_type: string | null
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

function parseReviewRhythmInput(input: ReviewRhythmRequestBody | null) {
  const routeId = normalizeText(input?.routeId)
  const routeScopeValue = normalizeText(input?.routeScopeValue)
  const routeSourceId = normalizeText(input?.routeSourceId)
  const orgId = normalizeText(input?.orgId)
  const scanType = normalizeText(input?.scanType)
  const remindersEnabled = input?.remindersEnabled

  if (
    !routeId ||
    !routeScopeValue ||
    !routeSourceId ||
    !orgId ||
    !scanType ||
    typeof remindersEnabled !== 'boolean' ||
    (input?.cadenceDays !== 7 && input?.cadenceDays !== 14 && input?.cadenceDays !== 30) ||
    (input?.reminderLeadDays !== 1 && input?.reminderLeadDays !== 3 && input?.reminderLeadDays !== 5) ||
    (input?.escalationLeadDays !== 3 && input?.escalationLeadDays !== 7 && input?.escalationLeadDays !== 14)
  ) {
    throw new Error('Ongeldige reviewritme input.')
  }

  return {
    routeId,
    routeScopeValue,
    routeSourceId,
    orgId,
    scanType,
    cadenceDays: input.cadenceDays,
    reminderLeadDays: input.reminderLeadDays,
    escalationLeadDays: input.escalationLeadDays,
    remindersEnabled,
  }
}

async function loadCampaign(adminClient: ReturnType<typeof createAdminClient>, routeSourceId: string) {
  const { data, error } = await adminClient
    .from('campaigns')
    .select('id, organization_id, scan_type')
    .eq('id', routeSourceId)
    .maybeSingle()

  return {
    campaign: (data ?? null) as CampaignRow | null,
    error,
  }
}

async function loadVisibleDepartmentLabels(adminClient: ReturnType<typeof createAdminClient>, campaignId: string) {
  const { data } = await adminClient.from('respondents').select('department').eq('campaign_id', campaignId)

  return [
    ...new Set(
      ((data ?? []) as RespondentDepartmentRow[])
        .map((row) => normalizeDepartmentLabel(row.department))
        .filter((value): value is string => Boolean(value)),
    ),
  ]
}

function resolveReviewRhythmIdentity(args: {
  routeId: string
  routeScopeValue: string
  routeSourceId: string
  orgId: string
  campaign: CampaignRow
  visibleDepartmentLabels: string[]
}) {
  if (!args.campaign.organization_id) {
    throw new Error('Route voor reviewritme bestaat niet.')
  }

  const parsedScope = parseActionCenterManagerResponseScopeValue(args.routeScopeValue)
  if (parsedScope.orgId !== args.campaign.organization_id || args.orgId !== args.campaign.organization_id) {
    throw new Error('Route voor reviewritme bestaat niet.')
  }

  let canonicalScopeValue: string
  if (parsedScope.scopeType === 'item') {
    canonicalScopeValue = buildCampaignItemScopeValue(args.campaign.organization_id, args.routeSourceId)
    if (args.routeScopeValue !== canonicalScopeValue) {
      throw new Error('Route voor reviewritme bestaat niet.')
    }
  } else {
    canonicalScopeValue = buildDepartmentScopeValue(args.campaign.organization_id, parsedScope.scopeKey)
    if (
      args.routeScopeValue !== canonicalScopeValue ||
      !args.visibleDepartmentLabels.includes(parsedScope.scopeKey)
    ) {
      throw new Error('Route voor reviewritme bestaat niet.')
    }
  }

  const canonicalRouteId = buildActionCenterRouteId(args.routeSourceId, canonicalScopeValue)
  if (args.routeId !== canonicalRouteId) {
    throw new Error('Route voor reviewritme bestaat niet.')
  }

  return {
    routeId: canonicalRouteId,
    routeScopeValue: canonicalScopeValue,
    routeSourceType: 'campaign' as const,
  }
}

function canManageReviewRhythm(context: {
  canViewActionCenter?: boolean
  canUpdateActionCenter?: boolean
  canScheduleActionCenterReview?: boolean
}) {
  return Boolean(
    context.canViewActionCenter && context.canUpdateActionCenter && context.canScheduleActionCenterReview,
  )
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ReviewRhythmRequestBody | null

  let parsed
  try {
    parsed = parseReviewRhythmInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige reviewritme input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const hrWriteAccess = resolveActionCenterHrWriteAccess({
    context,
    orgMemberships,
    workspaceMemberships,
    orgId: parsed.orgId,
  })

  if (!canManageReviewRhythm(context) || !hrWriteAccess.allowed || !hrWriteAccess.auditRole) {
    return NextResponse.json({ detail: 'Geen toegang om reviewritme te beheren.' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const campaignResult = await loadCampaign(adminClient, parsed.routeSourceId)

  if (campaignResult.error) {
    return NextResponse.json({ detail: campaignResult.error.message }, { status: 500 })
  }

  if (!campaignResult.campaign?.id || !campaignResult.campaign.organization_id) {
    return NextResponse.json({ detail: 'Route voor reviewritme bestaat niet.' }, { status: 404 })
  }

  if (parsed.scanType !== 'exit' || campaignResult.campaign.scan_type !== 'exit') {
    return NextResponse.json({ detail: 'Reviewritme blijft in deze slice beperkt tot ExitScan.' }, { status: 409 })
  }

  const validation = validateActionCenterReviewRhythmInput({
    cadenceDays: parsed.cadenceDays,
    reminderLeadDays: parsed.reminderLeadDays,
    escalationLeadDays: parsed.escalationLeadDays,
    remindersEnabled: parsed.remindersEnabled,
  })

  if (!validation.ok) {
    return NextResponse.json({ detail: validation.reason }, { status: 400 })
  }

  const visibleDepartmentLabels = await loadVisibleDepartmentLabels(adminClient, parsed.routeSourceId)

  let identity
  try {
    identity = resolveReviewRhythmIdentity({
      routeId: parsed.routeId,
      routeScopeValue: parsed.routeScopeValue,
      routeSourceId: parsed.routeSourceId,
      orgId: parsed.orgId,
      campaign: campaignResult.campaign,
      visibleDepartmentLabels,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Route voor reviewritme bestaat niet.' },
      { status: 400 },
    )
  }

  const { data, error } = await adminClient
    .from('action_center_review_rhythm_configs')
    .upsert(
      {
        org_id: campaignResult.campaign.organization_id,
        route_id: identity.routeId,
        route_scope_value: identity.routeScopeValue,
        route_source_type: identity.routeSourceType,
        route_source_id: campaignResult.campaign.id,
        scan_type: 'exit',
        cadence_days: parsed.cadenceDays,
        reminder_lead_days: parsed.reminderLeadDays,
        escalation_lead_days: parsed.escalationLeadDays,
        reminders_enabled: parsed.remindersEnabled,
        updated_by: user.id,
        updated_by_role: hrWriteAccess.auditRole,
      },
      { onConflict: 'route_id' },
    )
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: 'Reviewritme kon niet worden opgeslagen.' }, { status: 500 })
  }

  return NextResponse.json({ config: data }, { status: 200 })
}
