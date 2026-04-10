import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Context {
  params: Promise<{ id: string }>
}

export const runtime = 'nodejs'

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
    return NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen respondentimport uitvoeren.' }, { status: 403 })
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
    return NextResponse.json({ detail: 'Autorisatie voor import ontbreekt.' }, { status: 403 })
  }

  const incoming = await request.formData()
  const file = incoming.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: 'Upload een .csv of .xlsx bestand.' }, { status: 400 })
  }

  const outgoing = new FormData()
  outgoing.append('upload', file, file.name)
  outgoing.append('dry_run', String(incoming.get('dry_run') ?? 'true'))
  outgoing.append('send_invites', String(incoming.get('send_invites') ?? 'true'))

  const backendResponse = await fetch(`${API_BASE}/api/campaigns/${id}/respondents/import`, {
    method: 'POST',
    headers: {
      'x-api-key': organization.api_key,
    },
    body: outgoing,
    cache: 'no-store',
  })

  const contentType = backendResponse.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const payload = await backendResponse.json()
    return NextResponse.json(payload, { status: backendResponse.status })
  }

  const detail = await backendResponse.text()
  return NextResponse.json(
    { detail: detail || 'Import kon niet worden verwerkt.' },
    { status: backendResponse.status || 500 },
  )
}
