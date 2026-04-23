import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
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

  const canExecuteCampaign = profile?.is_verisight_admin === true || Boolean(membership)
  if (!canExecuteCampaign) {
    return NextResponse.json(
      { detail: 'Je hebt geen rechten om uitnodigingen voor deze campaign te versturen.' },
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
