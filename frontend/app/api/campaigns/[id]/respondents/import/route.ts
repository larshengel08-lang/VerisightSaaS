import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import {
  getCustomerActionPermission,
  getPermissionDeniedMessage,
} from '@/lib/customer-permissions'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { buildLaunchControlState } from '@/lib/launch-controls'
import { getBackendApiUrl } from '@/lib/server-env'

interface Context {
  params: Promise<{ id: string }>
}

interface ImportIssuePayload {
  message?: string
}

interface ImportResponsePayload {
  dry_run?: boolean
  valid_rows?: number
  imported?: number
  detail?: string
  errors?: ImportIssuePayload[]
  blocking_messages?: string[]
  launch_blocked?: boolean
}

export const runtime = 'nodejs'

async function syncImportQaCheckpoint(campaignId: string, launchBlocked: boolean, summary: string) {
  try {
    const supabase = createAdminClient()
    const { data: deliveryRecord } = await supabase
      .from('campaign_delivery_records')
      .select('id')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    if (!deliveryRecord?.id) return

    await supabase
      .from('campaign_delivery_checkpoints')
      .update({
        auto_state: launchBlocked ? 'not_ready' : 'ready',
        last_auto_summary: summary,
      })
      .eq('delivery_record_id', deliveryRecord.id)
      .eq('checkpoint_key', 'import_qa')
  } catch {
    // Launch-gating is enforced separately; checkpoint sync is best-effort.
  }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return NextResponse.json({ detail: 'Upload een .csv of .xlsx bestand.' }, { status: 400 })
  }

  let incoming: FormData
  try {
    incoming = await request.formData()
  } catch {
    return NextResponse.json({ detail: 'Upload een geldig .csv of .xlsx bestand.' }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const actorRole =
    profile?.is_verisight_admin === true ? 'verisight_admin' : membership?.role ?? 'unknown'
  const canImportRespondents =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, 'import_respondents')
  if (!canImportRespondents) {
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'import_respondents',
      outcome: 'blocked',
      summary: getPermissionDeniedMessage('import_respondents'),
    })
    return NextResponse.json(
      { detail: getPermissionDeniedMessage('import_respondents') },
      { status: 403 },
    )
  }

  let apiKey: string
  try {
    apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
  } catch {
    return NextResponse.json({ detail: 'Autorisatie voor import ontbreekt.' }, { status: 403 })
  }

  const file = incoming.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: 'Upload een .csv of .xlsx bestand.' }, { status: 400 })
  }

  const outgoing = new FormData()
  outgoing.append('upload', file, file.name)
  const dryRun = String(incoming.get('dry_run') ?? 'true')
  const sendInvites = String(incoming.get('send_invites') ?? 'true')
  outgoing.append('dry_run', dryRun)
  outgoing.append('send_invites', sendInvites)

  if (dryRun !== 'true' && sendInvites === 'true') {
    const { data: deliveryRecord } = await supabase
      .from('campaign_delivery_records')
      .select('launch_date, launch_confirmed_at, participant_comms_config, reminder_config')
      .eq('campaign_id', id)
      .maybeSingle()

    const launchControlState = buildLaunchControlState({
      launchDate: (deliveryRecord?.launch_date as string | null) ?? null,
      participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
      reminderConfig: deliveryRecord?.reminder_config ?? null,
      launchConfirmedAt: (deliveryRecord?.launch_confirmed_at as string | null) ?? null,
    })

    if (!launchControlState.ready) {
      await insertCampaignAuditEvent({
        supabase,
        organizationId: campaign.organization_id,
        campaignId: id,
        actorUserId: user.id,
        actorRole,
        action: 'import_respondents',
        outcome: 'blocked',
        summary: `Directe launch na import geblokkeerd: ${launchControlState.blockers.join(' ')}`,
        metadata: {
          dry_run: false,
          send_invites: true,
        },
      })
      return NextResponse.json(
        { detail: `Directe launch na import kan nog niet: ${launchControlState.blockers.join(' ')}` },
        { status: 400 },
      )
    }
  }

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/campaigns/${id}/respondents/import`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: outgoing,
    cache: 'no-store',
  })

  const backendContentType = backendResponse.headers.get('content-type') ?? ''
  if (backendContentType.includes('application/json')) {
    const payload = (await backendResponse.json()) as ImportResponsePayload
    const summary =
      payload.blocking_messages?.[0] ??
      payload.errors?.[0]?.message ??
      (payload.imported && payload.imported > 0
        ? `${payload.imported} deelnemer(s) gecontroleerd en vrijgegeven voor launch.`
        : null)

    if (
      summary &&
      (payload.launch_blocked === true || (payload.dry_run === false && (payload.imported ?? 0) > 0))
    ) {
      await syncImportQaCheckpoint(id, payload.launch_blocked === true, summary)
    }
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'import_respondents',
      outcome: backendResponse.ok ? 'completed' : 'blocked',
      summary:
        backendResponse.ok
          ? `Deelnemersimport verwerkt voor ${payload.valid_rows ?? payload.imported ?? 0} rij(en).`
          : typeof payload?.detail === 'string'
            ? payload.detail
            : 'Deelnemersimport kon niet worden verwerkt.',
      metadata: {
        dry_run: String(incoming.get('dry_run') ?? 'true') === 'true',
        valid_rows: payload.valid_rows ?? null,
        imported: payload.imported ?? null,
      },
    })
    return NextResponse.json(payload, { status: backendResponse.status })
  }

  const detail = await backendResponse.text()
  await insertCampaignAuditEvent({
    supabase,
    organizationId: campaign.organization_id,
    campaignId: id,
    actorUserId: user.id,
    actorRole,
    action: 'import_respondents',
    outcome: backendResponse.ok ? 'completed' : 'blocked',
    summary: detail || 'Import kon niet worden verwerkt.',
    metadata: {
      dry_run: String(incoming.get('dry_run') ?? 'true') === 'true',
    },
  })

  return NextResponse.json(
    { detail: detail || 'Import kon niet worden verwerkt.' },
    { status: backendResponse.status || 500 },
  )
}
