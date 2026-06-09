import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'

interface Context {
  params: Promise<{ id: string }>
}

type ReportDownloadFormat = 'pdf' | 'segment_summary'

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

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id, name, scan_type')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ detail: 'Campaign niet gevonden of niet toegankelijk.' }, { status: 404 })
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

export function buildFallbackReportFilename(
  scanType: ScanType,
  campaignName: string,
  format: ReportDownloadFormat = 'pdf',
) {
  const label = sanitizeFilenameSegment(SCAN_TYPE_LABELS[scanType] ?? 'Verisight')
  const campaignSegment = sanitizeFilenameSegment(campaignName || 'campaign')
  const extension = format === 'segment_summary' ? 'csv' : 'pdf'
  return `${label}_${campaignSegment}.${extension}`
}

function sanitizeFilenameSegment(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || 'campaign'
}
