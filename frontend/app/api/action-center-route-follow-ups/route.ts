import { NextResponse } from 'next/server'
import { buildActionCenterRouteId } from '@/lib/action-center-route-contract'
import {
  projectActionCenterRouteFollowUpRelation,
  type ActionCenterRouteFollowUpRelationRecord,
} from '@/lib/action-center-route-reopen'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type FollowUpRequestBody = {
  source_campaign_id?: string
  source_route_scope_value?: string
  target_campaign_id?: string
  target_route_scope_value?: string
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function parseFollowUpInput(input: FollowUpRequestBody | null) {
  const sourceCampaignId = normalizeText(input?.source_campaign_id)
  const sourceRouteScopeValue = normalizeText(input?.source_route_scope_value)
  const targetCampaignId = normalizeText(input?.target_campaign_id)
  const targetRouteScopeValue = normalizeText(input?.target_route_scope_value)

  if (!sourceCampaignId || !sourceRouteScopeValue || !targetCampaignId || !targetRouteScopeValue) {
    throw new Error('Ongeldige follow-up input.')
  }

  return {
    source_campaign_id: sourceCampaignId,
    source_route_scope_value: sourceRouteScopeValue,
    target_campaign_id: targetCampaignId,
    target_route_scope_value: targetRouteScopeValue,
  }
}

async function loadCampaignOrg(adminClient: ReturnType<typeof createAdminClient>, campaignId: string) {
  const { data, error } = await adminClient
    .from('campaigns')
    .select('id, organization_id')
    .eq('id', campaignId)
    .maybeSingle()

  if (error || !data?.id || !data.organization_id) {
    return null
  }

  return data
}

function buildFollowUpRelation(args: {
  sourceCampaignId: string
  sourceRouteScopeValue: string
  targetCampaignId: string
  targetRouteScopeValue: string
}): ActionCenterRouteFollowUpRelationRecord {
  const recordedAt = new Date().toISOString()
  return projectActionCenterRouteFollowUpRelation({
    route_relation_type: 'follow-up-from',
    source_route_id: buildActionCenterRouteId(args.sourceCampaignId, args.sourceRouteScopeValue),
    target_route_id: buildActionCenterRouteId(args.targetCampaignId, args.targetRouteScopeValue),
    recorded_at: recordedAt,
    recorded_by_role: 'hr',
  })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FollowUpRequestBody | null

  let parsed
  try {
    parsed = parseFollowUpInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige follow-up input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { context, orgMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const adminClient = createAdminClient()
  const [sourceCampaign, targetCampaign] = await Promise.all([
    loadCampaignOrg(adminClient, parsed.source_campaign_id),
    loadCampaignOrg(adminClient, parsed.target_campaign_id),
  ])

  if (!sourceCampaign?.organization_id || !targetCampaign?.organization_id) {
    return NextResponse.json({ detail: 'Source of target route bestaat niet.' }, { status: 400 })
  }

  const hasHrAccess =
    context.isVerisightAdmin ||
    orgMemberships.some(
      (membership) =>
        (membership.org_id === sourceCampaign.organization_id || membership.org_id === targetCampaign.organization_id) &&
        membership.role === 'owner',
    )

  if (!hasHrAccess) {
    return NextResponse.json({ detail: 'Alleen HR of Verisight kan een vervolgroute koppelen.' }, { status: 403 })
  }

  const relation = buildFollowUpRelation({
    sourceCampaignId: parsed.source_campaign_id,
    sourceRouteScopeValue: parsed.source_route_scope_value,
    targetCampaignId: parsed.target_campaign_id,
    targetRouteScopeValue: parsed.target_route_scope_value,
  })

  const { data, error } = await adminClient
    .from('action_center_route_relations')
    .upsert(
      {
        campaign_id: targetCampaign.id,
        org_id: targetCampaign.organization_id,
        route_relation_type: relation.routeRelationType,
        source_route_id: relation.sourceRouteId,
        target_route_id: relation.targetRouteId,
        recorded_at: relation.recordedAt,
        recorded_by_role: relation.recordedByRole,
        created_by: user.id,
        updated_by: user.id,
        updated_at: relation.recordedAt,
      },
      { onConflict: 'source_route_id,target_route_id,route_relation_type' },
    )
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Vervolgroute opslaan mislukt.' }, { status: 500 })
  }

  try {
    const followUp = projectActionCenterRouteFollowUpRelation(data as Record<string, unknown>)
    return NextResponse.json({ followUp }, { status: 200 })
  } catch {
    return NextResponse.json({ detail: 'Vervolgroute opslaan mislukt.' }, { status: 500 })
  }
}
