import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id, name')
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
    return NextResponse.json({ detail: 'Autorisatie voor rapportdownload ontbreekt.' }, { status: 403 })
  }

  const backendResponse = await fetch(`${API_BASE}/api/campaigns/${id}/report`, {
    headers: {
      'x-api-key': organization.api_key,
    },
    cache: 'no-store',
  })

  if (!backendResponse.ok) {
    const detail = await backendResponse.text()
    return NextResponse.json(
      { detail: detail || 'Rapport kon niet worden gegenereerd.' },
      { status: backendResponse.status },
    )
  }

  const pdfBuffer = await backendResponse.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': backendResponse.headers.get('content-disposition') ??
        `attachment; filename="Verisight_${campaign.name.replace(/ /g, '_')}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
