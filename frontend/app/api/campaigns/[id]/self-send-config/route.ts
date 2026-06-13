import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  MIN_INVITED_COUNT,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  validateInvitedCount,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'

interface Context {
  params: Promise<{ id: string }>
}

type Body = {
  invited_count?: number | null
  self_send_config?: Partial<SelfSendConfig> | null
  self_send_reminders?: SelfSendReminder[] | null
  confirm_launch?: boolean
}

export async function PATCH(request: Request, { params }: Context) {
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
    .select('organization_id, comms_mode')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }
  if (campaign.comms_mode !== 'self_send') {
    return NextResponse.json({ detail: 'Deze campaign gebruikt geen self-send modus.' }, { status: 400 })
  }

  const [{ data: profile }, { data: membership }, { data: deliveryRecord }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('id, invited_count, self_send_config, self_send_reminders, launch_confirmed_at')
      .eq('campaign_id', id)
      .maybeSingle(),
  ])

  const isOrgManager = membership?.role === 'owner' || membership?.role === 'member'
  if (profile?.is_verisight_admin !== true && !isOrgManager) {
    return NextResponse.json({ detail: 'Geen rechten om deze campaign te beheren.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const nextInvitedCount =
    'invited_count' in body ? body.invited_count ?? null : (deliveryRecord?.invited_count as number | null) ?? null
  const nextConfig =
    'self_send_config' in body
      ? normalizeSelfSendConfig(body.self_send_config)
      : normalizeSelfSendConfig(deliveryRecord?.self_send_config)
  const nextReminders =
    'self_send_reminders' in body
      ? normalizeSelfSendReminders(body.self_send_reminders)
      : normalizeSelfSendReminders(deliveryRecord?.self_send_reminders)

  // Confirming launch requires a valid invited count and a sender name.
  if (body.confirm_launch === true) {
    const errors = [
      ...validateInvitedCount(nextInvitedCount),
      ...(nextConfig.senderName.length === 0 ? ['Afzendernaam ontbreekt nog.'] : []),
    ]
    if (errors.length > 0) {
      return NextResponse.json({ detail: errors.join(' ') }, { status: 400 })
    }
  } else if (nextInvitedCount !== null && validateInvitedCount(nextInvitedCount).length > 0) {
    return NextResponse.json(
      { detail: `Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.` },
      { status: 400 },
    )
  }

  const nowIso = new Date().toISOString()
  let nextLaunchConfirmedAt = (deliveryRecord?.launch_confirmed_at as string | null) ?? null
  if (body.confirm_launch === true) nextLaunchConfirmedAt = nowIso
  if (body.confirm_launch === false) nextLaunchConfirmedAt = null

  const writePayload = {
    invited_count: nextInvitedCount,
    self_send_config: nextConfig,
    self_send_reminders: nextReminders,
    launch_confirmed_at: nextLaunchConfirmedAt,
    updated_at: nowIso,
  }

  const { error } = deliveryRecord
    ? await supabase.from('campaign_delivery_records').update(writePayload).eq('id', deliveryRecord.id)
    : await supabase.from('campaign_delivery_records').insert({
        organization_id: campaign.organization_id,
        campaign_id: id,
        lifecycle_stage: 'setup_in_progress',
        exception_status: 'none',
        ...writePayload,
      })

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({
    invited_count: nextInvitedCount,
    self_send_config: nextConfig,
    self_send_reminders: nextReminders,
    launch_confirmed_at: nextLaunchConfirmedAt,
    message: body.confirm_launch === true ? 'Campagne live gezet.' : 'Instellingen opgeslagen.',
  })
}
