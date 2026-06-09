import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildLaunchControlState,
  createDefaultParticipantCommunicationConfig,
  createDefaultReminderConfig,
  normalizeParticipantCommunicationConfig,
  normalizeReminderConfig,
  validateParticipantCommunicationConfig,
  validateReminderConfig,
  type ParticipantCommunicationConfig,
  type ReminderConfig,
} from '@/lib/launch-controls'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateLaunchConfigBody = {
  launch_date?: string | null
  participant_comms_config?: Partial<ParticipantCommunicationConfig> | null
  reminder_config?: Partial<ReminderConfig> | null
  confirm_launch?: boolean
}

function isDateOnly(value: string | null | undefined) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
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
    .select('organization_id')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }

  const [
    { data: profile },
    { data: membership },
    { data: deliveryRecord },
  ] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('campaign_delivery_records')
      .select('id, launch_date, launch_confirmed_at, participant_comms_config, reminder_config')
      .eq('campaign_id', id)
      .maybeSingle(),
  ])

  const isOrgManager = membership?.role === 'owner' || membership?.role === 'member'
  const canExecuteCampaign = profile?.is_verisight_admin === true || isOrgManager
  if (!canExecuteCampaign) {
    return NextResponse.json(
      { detail: 'Je hebt geen rechten om launchinstellingen voor deze campaign te beheren.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => null)) as UpdateLaunchConfigBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const nextLaunchDate =
    'launch_date' in body ? body.launch_date ?? null : (deliveryRecord?.launch_date as string | null) ?? null
  const nextParticipantComms =
    'participant_comms_config' in body
      ? normalizeParticipantCommunicationConfig(body.participant_comms_config)
      : normalizeParticipantCommunicationConfig(
          deliveryRecord?.participant_comms_config ?? createDefaultParticipantCommunicationConfig(),
        )
  const nextReminderConfig =
    'reminder_config' in body
      ? normalizeReminderConfig(body.reminder_config)
      : normalizeReminderConfig(deliveryRecord?.reminder_config ?? createDefaultReminderConfig())

  const validationErrors = [
    ...(nextLaunchDate === null || isDateOnly(nextLaunchDate) ? [] : ['Startdatum moet een geldige datum zijn.']),
    ...validateParticipantCommunicationConfig(nextParticipantComms),
    ...validateReminderConfig(nextReminderConfig),
  ]

  if (validationErrors.length > 0) {
    return NextResponse.json({ detail: validationErrors.join(' ') }, { status: 400 })
  }

  const currentParticipantComms = normalizeParticipantCommunicationConfig(
    deliveryRecord?.participant_comms_config ?? createDefaultParticipantCommunicationConfig(),
  )
  const currentReminderConfig = normalizeReminderConfig(
    deliveryRecord?.reminder_config ?? createDefaultReminderConfig(),
  )
  const launchConfigChanged =
    nextLaunchDate !== ((deliveryRecord?.launch_date as string | null) ?? null) ||
    JSON.stringify(nextParticipantComms) !== JSON.stringify(currentParticipantComms) ||
    JSON.stringify(nextReminderConfig) !== JSON.stringify(currentReminderConfig)

  const nowIso = new Date().toISOString()
  let nextLaunchConfirmedAt = launchConfigChanged
    ? null
    : ((deliveryRecord?.launch_confirmed_at as string | null) ?? null)

  if (body.confirm_launch === false) {
    nextLaunchConfirmedAt = null
  }
  if (body.confirm_launch === true) {
    const confirmationState = buildLaunchControlState({
      launchDate: nextLaunchDate,
      participantCommsConfig: nextParticipantComms,
      reminderConfig: nextReminderConfig,
      launchConfirmedAt: nowIso,
    })
    if (!confirmationState.ready) {
      return NextResponse.json(
        { detail: `Launch kan nog niet worden bevestigd: ${confirmationState.blockers.join(' ')}` },
        { status: 400 },
      )
    }
    nextLaunchConfirmedAt = nowIso
  }

  const writePayload = {
    launch_date: nextLaunchDate,
    participant_comms_config: nextParticipantComms,
    reminder_config: nextReminderConfig,
    launch_confirmed_at: nextLaunchConfirmedAt,
    updated_at: nowIso,
  }

  const { error } = deliveryRecord
    ? await supabase
        .from('campaign_delivery_records')
        .update(writePayload)
        .eq('id', deliveryRecord.id)
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
    launch_date: nextLaunchDate,
    participant_comms_config: nextParticipantComms,
    reminder_config: nextReminderConfig,
    launch_confirmed_at: nextLaunchConfirmedAt,
    message: body.confirm_launch === true ? 'Launch bevestigd.' : 'Launchinstellingen bijgewerkt.',
  })
}
