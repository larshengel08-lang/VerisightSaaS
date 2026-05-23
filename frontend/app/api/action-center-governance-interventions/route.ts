import { NextResponse } from 'next/server'
import { resolveActionCenterHrWriteAccess } from '@/lib/action-center-governance'
import {
  buildActionCenterGovernanceInterventionRecord,
  type ActionCenterGovernanceInterventionType,
} from '@/lib/action-center-governance-interventions'
import type { ActionCenterGovernanceQueueCode } from '@/lib/action-center-governance-queues'
import { getActionCenterEnabledRouteDefaults } from '@/lib/action-center-route-defaults'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loadSuiteAccessContext } from '@/lib/suite-access-server'

type GovernanceInterventionRequestBody = {
  route_id?: string
  route_source_id?: string
  route_scope_value?: string
  org_id?: string
  queue_code?: ActionCenterGovernanceQueueCode | string
  intervention_type?: ActionCenterGovernanceInterventionType | string
  action_id?: string | null
  reason_code?: string | null
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

function parseInput(input: GovernanceInterventionRequestBody | null) {
  const routeId = normalizeText(input?.route_id)
  const routeSourceId = normalizeText(input?.route_source_id)
  const routeScopeValue = normalizeText(input?.route_scope_value)
  const orgId = normalizeText(input?.org_id)
  const queueCode = normalizeText(input?.queue_code) as ActionCenterGovernanceQueueCode | null
  const interventionType = normalizeText(input?.intervention_type)
  const actionId = normalizeText(input?.action_id)
  const reasonCode = normalizeText(input?.reason_code)

  if (!routeId || !routeSourceId || !routeScopeValue || !orgId || !queueCode || !interventionType) {
    throw new Error('Ongeldige governance intervention input.')
  }

  return {
    routeId,
    routeSourceId,
    routeScopeValue,
    orgId,
    queueCode,
    interventionType,
    actionId,
    reasonCode,
  }
}

async function loadRouteTruth(routeSourceId: string) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('campaigns')
    .select('id, organization_id, scan_type')
    .eq('id', routeSourceId)
    .maybeSingle()

  if (error || !data?.id) {
    return null
  }

  return data as CampaignRow
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as GovernanceInterventionRequestBody | null

  let parsed
  try {
    parsed = parseInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige governance intervention input.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const routeTruth = await loadRouteTruth(parsed.routeSourceId)
  if (!routeTruth?.organization_id || routeTruth.organization_id !== parsed.orgId) {
    return NextResponse.json({ detail: 'Governance intervention route bestaat niet.' }, { status: 400 })
  }

  if (!getActionCenterEnabledRouteDefaults(routeTruth.scan_type)) {
    return NextResponse.json(
      { detail: 'Governance interventions blijven in deze slice beperkt tot ingeschakelde follow-through-routes.' },
      { status: 409 },
    )
  }

  const { context, orgMemberships, workspaceMemberships } = await loadSuiteAccessContext(supabase, user.id)
  const writeAccess = resolveActionCenterHrWriteAccess({
    context,
    orgMemberships,
    workspaceMemberships,
    orgId: parsed.orgId,
  })

  if (!writeAccess.allowed || !writeAccess.auditRole) {
    return NextResponse.json({ detail: 'Alleen HR of Loep kan governance-acties vastleggen.' }, { status: 403 })
  }

  let record
  try {
    record = buildActionCenterGovernanceInterventionRecord({
      routeId: parsed.routeId,
      routeSourceId: parsed.routeSourceId,
      routeScopeValue: parsed.routeScopeValue,
      orgId: parsed.orgId,
      queueCode: parsed.queueCode,
      interventionType: parsed.interventionType,
      actionId: parsed.actionId,
      reasonCode: parsed.reasonCode,
      actorRole: writeAccess.auditRole,
      actorUserId: user.id,
    })
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Governance intervention is niet toegestaan.'
    const status = detail === 'Suppression requires a reason code.' ? 400 : 403
    return NextResponse.json({ detail }, { status })
  }

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('action_center_governance_interventions')
    .insert(record)
    .select('*')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { detail: error?.message ?? 'Governance intervention opslaan mislukt.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ intervention: data }, { status: 200 })
}
