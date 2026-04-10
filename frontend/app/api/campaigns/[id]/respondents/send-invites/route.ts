import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    return NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen uitnodigingen versturen.' }, { status: 403 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }

  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('api_key')
    .eq('id', campaign.organization_id)
    .single()

  if (orgError || !organization?.api_key) {
    return NextResponse.json({ detail: 'Autorisatie voor uitnodigingen ontbreekt.' }, { status: 403 })
  }

  const body = await request.text()
  const backendResponse = await fetch(`${API_BASE}/api/campaigns/${id}/send-invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': organization.api_key,
    },
    body,
    cache: 'no-store',
  })

  const payload = await backendResponse.json().catch(() => ({}))
  return NextResponse.json(payload, { status: backendResponse.status })
}
