import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'
import { canDownloadCampaignReport, type ReportDownloadFormat } from './permissions'
import { buildFallbackReportFilename } from './filenames'

interface Context {
  params: Promise<{ id: string }>
}

const BACKEND_ONBEREIKBAAR = 'De rapportserver is nu niet bereikbaar. Probeer het later opnieuw.'

// Statussen waarmee de backend bewust weigert (opgeschoonde data, bedrijfsregel).
// Elke andere niet-ok status na onze eigen rechtencheck wijst op een fout of
// een verkeerde configuratie en wordt gelogd.
const VERWACHTE_STATUS = new Set([410, 422])

// De frontend-Sentry staat uit; deze regels landen in de Vercel-logs. Alleen
// het campagne-id en de fout, nooit de organisatiesleutel of de campagnenaam.
function logProxyFout(campaignId: string, stap: string, fout: unknown) {
  const melding = fout instanceof Error ? fout.message : String(fout)
  // Node-fetch (undici) geeft alleen 'fetch failed'; de echte oorzaak
  // (ECONNREFUSED, ENOTFOUND, UND_ERR_CONNECT_TIMEOUT) zit in error.cause.
  const oorzaak = fout instanceof Error && fout.cause
    ? (fout.cause as { code?: string; message?: string })
    : undefined
  console.error(`[rapportproxy] ${stap}`, { campaignId, fout: melding, oorzaak: oorzaak?.code ?? oorzaak?.message })
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
  if (!canDownloadCampaignReport({ format, scanType: campaign.scan_type, isVerisightAdmin, membershipRole })) {
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

  async function fetchInternalReport() {
    const headers: Record<string, string> = {}
    if (adminToken) {
      headers['x-admin-token'] = adminToken
    }
    return fetch(backendInternalUrl, {
      headers,
      cache: 'no-store',
    })
  }

  let backendResponse: globalThis.Response

  try {
    if (format === 'segment_summary') {
      backendResponse = await fetchInternalReport()
    } else {
      // Alleen het ophalen van de sleutel en de eerste poging staan hierbinnen;
      // een fout in de terugval valt zo in de buitenste catch.
      let eerstePoging: globalThis.Response | null = null
      try {
        const apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
        eerstePoging = await fetch(backendUrl, {
          headers: {
            'x-api-key': apiKey,
          },
          cache: 'no-store',
        })
      } catch (error) {
        logProxyFout(id, 'eerste poging via de organisatiesleutel mislukt, terugval op de interne route', error)
      }

      if (eerstePoging && eerstePoging.status !== 401 && eerstePoging.status !== 403) {
        backendResponse = eerstePoging
      } else {
        if (eerstePoging) {
          // De ongelezen body houdt anders de verbinding bezet. Een fout bij het
          // afbreken mag de terugval niet als onbereikbare backend laten eindigen.
          await eerstePoging.body?.cancel().catch(() => undefined)
          console.warn('[rapportproxy] organisatiesleutel geweigerd, terugval op de interne route', {
            campaignId: id,
            status: eerstePoging.status,
          })
        }
        backendResponse = await fetchInternalReport()
      }
    }
  } catch (error) {
    logProxyFout(id, 'backend niet bereikbaar', error)
    return NextResponse.json({ detail: BACKEND_ONBEREIKBAAR }, { status: 502 })
  }

  if (!backendResponse.ok) {
    const detail = await backendResponse.text()
    if (!VERWACHTE_STATUS.has(backendResponse.status)) {
      logProxyFout(id, `backend gaf status ${backendResponse.status}`, detail.slice(0, 300))
    }
    return NextResponse.json(
      { detail: detail || 'Rapport kon niet worden gegenereerd.' },
      { status: backendResponse.status },
    )
  }

  if (!backendResponse.body) {
    logProxyFout(id, 'backend gaf status 200 zonder inhoud', 'leeg antwoord')
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
