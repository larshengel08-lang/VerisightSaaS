import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'

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

  const backendBaseUrl = getBackendApiUrl()
  const adminToken = process.env.BACKEND_ADMIN_TOKEN?.trim()

  async function fetchWithAdminFallback() {
    if (!adminToken) {
      return null
    }

    return fetch(`${backendBaseUrl}/api/internal/campaigns/${id}/report`, {
      headers: {
        'x-admin-token': adminToken,
      },
      cache: 'no-store',
    })
  }

  let backendResponse: globalThis.Response | null = null

  try {
    const apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
    backendResponse = await fetch(`${backendBaseUrl}/api/campaigns/${id}/report`, {
      headers: {
        'x-api-key': apiKey,
      },
      cache: 'no-store',
    })

    if ((backendResponse.status === 401 || backendResponse.status === 403) && adminToken) {
      backendResponse = await fetchWithAdminFallback()
    }
  } catch {
    backendResponse = await fetchWithAdminFallback()
    if (!backendResponse) {
      return NextResponse.json({ detail: 'Autorisatie voor rapportdownload ontbreekt.' }, { status: 403 })
    }
  }

  if (!backendResponse) {
    return NextResponse.json({ detail: 'Rapportproxy kon niet worden gestart.' }, { status: 502 })
  }

  if (!backendResponse.ok) {
    const detail = await backendResponse.text()
    return NextResponse.json(
      { detail: detail || 'Rapport kon niet worden gegenereerd.' },
      { status: backendResponse.status },
    )
  }

  if (!backendResponse.body) {
    return NextResponse.json(
      { detail: 'Rapport kon niet worden gestreamd.' },
      { status: 502 },
    )
  }

  return new NextResponse(backendResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': backendResponse.headers.get('content-disposition') ??
        `attachment; filename="Verisight_${campaign.name.replace(/ /g, '_')}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
