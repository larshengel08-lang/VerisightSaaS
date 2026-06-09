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

export async function POST(request: Request, { params }: Context) {
  const { id } = await params
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
  const canLaunchInvites =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, 'launch_invites')
  if (!canLaunchInvites) {
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'launch_invites',
      outcome: 'blocked',
      summary: getPermissionDeniedMessage('launch_invites'),
    })
    return NextResponse.json(
      { detail: getPermissionDeniedMessage('launch_invites') },
      { status: 403 },
    )
  }

  try {
    const admin = createAdminClient()
    const { data: deliveryRecord } = await admin
      .from('campaign_delivery_records')
      .select('id')
      .eq('campaign_id', id)
      .maybeSingle()

    const { data: checkpoint } = deliveryRecord?.id
      ? await admin
          .from('campaign_delivery_checkpoints')
          .select('auto_state, last_auto_summary')
          .eq('delivery_record_id', deliveryRecord.id)
          .eq('checkpoint_key', 'import_qa')
          .maybeSingle()
      : { data: null }

    if (!checkpoint || checkpoint.auto_state !== 'ready') {
      await insertCampaignAuditEvent({
        supabase,
        organizationId: campaign.organization_id,
        campaignId: id,
        actorUserId: user.id,
        actorRole,
        action: 'launch_invites',
        outcome: 'blocked',
        summary:
          checkpoint?.last_auto_summary ??
          'Het deelnemersbestand is nog niet vrijgegeven voor launch. Controleer eerst de import.',
      })
      return NextResponse.json(
        {
          detail:
            checkpoint?.last_auto_summary ??
            'Het deelnemersbestand is nog niet vrijgegeven voor launch. Controleer eerst de import.',
        },
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json(
      { detail: 'Importcontrole voor launch kon niet worden bevestigd.' },
      { status: 400 },
    )
  }

  let apiKey: string
  try {
    apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
  } catch {
    return NextResponse.json({ detail: 'Autorisatie voor uitnodigingen ontbreekt.' }, { status: 403 })
  }

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
      action: 'launch_invites',
      outcome: 'blocked',
      summary: `Launch kan nog niet starten: ${launchControlState.blockers.join(' ')}`,
    })
    return NextResponse.json(
      { detail: `Launch kan nog niet starten: ${launchControlState.blockers.join(' ')}` },
      { status: 400 },
    )
  }

  const body = await request.text()
  const backendResponse = await fetch(`${getBackendApiUrl()}/api/campaigns/${id}/send-invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body,
    cache: 'no-store',
  })

  const payload = await backendResponse.json().catch(() => ({}))
  await insertCampaignAuditEvent({
    supabase,
    organizationId: campaign.organization_id,
    campaignId: id,
    actorUserId: user.id,
    actorRole,
    action: 'launch_invites',
    outcome: backendResponse.ok ? 'completed' : 'blocked',
    summary:
      backendResponse.ok
        ? `Inviteflow gestart voor ${payload.sent ?? 0} respondent(en).`
        : typeof payload?.detail === 'string'
          ? payload.detail
          : 'Inviteflow kon niet worden gestart.',
    metadata: {
      sent: payload.sent ?? null,
      failed: payload.failed ?? null,
      skipped: payload.skipped ?? null,
    },
  })
  return NextResponse.json(payload, { status: backendResponse.status })
}
