import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'
import { canDownloadCampaignReport, type ReportDownloadFormat } from './permissions'
import { buildFallbackReportFilename } from './filenames'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const url = new URL(request.url)
  const format: ReportDownloadFormat = url.searchParams.get('format') === 'segment_summary'
    ? 'segment_summary'
    : 'pdf'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .maybeSingle()

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id, name, scan_type')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', campaign.organization_id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isVerisightAdmin = profile?.is_verisight_admin === true
  const membershipRole = membership?.role ?? null
  if (!canDownloadCampaignReport({ format, isVerisightAdmin, membershipRole })) {
    return NextResponse.json(
      {
        detail:
          format === 'segment_summary'
            ? 'Governed segmentexport is alleen beschikbaar voor geautoriseerde owner- of adminrollen na baselinevrijgave.'
            : 'Je hebt geen rechten om dit rapport te downloaden.',
      },
      { status: 403 },
    )
  }

  const backendBaseUrl = getBackendApiUrl()
  const adminToken = process.env.BACKEND_ADMIN_TOKEN?.trim()
  const backendUrl = `${backendBaseUrl}/api/campaigns/${id}/report${format === 'segment_summary' ? '?format=segment_summary' : ''}`
  const backendInternalUrl = `${backendBaseUrl}/api/internal/campaigns/${id}/report${format === 'segment_summary' ? '?format=segment_summary' : ''}`

  async function fetchWithAdminFallback() {
    if (!adminToken) {
      return null
    }

    return fetch(backendInternalUrl, {
      headers: {
        'x-admin-token': adminToken,
      },
      cache: 'no-store',
    })
  }

  let backendResponse: globalThis.Response | null = null

  try {
    const apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
    backendResponse = await fetch(backendUrl, {
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

  const fallbackFilename = buildFallbackReportFilename(campaign.scan_type, campaign.name, format)
  const contentType = backendResponse.headers.get('content-type') ??
    (format === 'segment_summary' ? 'text/csv; charset=utf-8' : 'application/pdf')

  return new NextResponse(backendResponse.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': backendResponse.headers.get('content-disposition') ??
        `attachment; filename="${fallbackFilename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
