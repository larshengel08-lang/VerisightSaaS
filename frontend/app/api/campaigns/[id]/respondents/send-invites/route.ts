import { NextResponse } from 'next/server'
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

  const { data: { user } } = await supabase.auth.getUser()
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
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('is_verisight_admin')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const isOrgManager = membership?.role === 'owner' || membership?.role === 'member'
  const canExecuteCampaign = profile?.is_verisight_admin === true || isOrgManager
  if (!canExecuteCampaign) {
    return NextResponse.json(
      { detail: 'Je hebt geen rechten om uitnodigingen voor deze campaign te versturen.' },
      { status: 403 },
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
  return NextResponse.json(payload, { status: backendResponse.status })
}
