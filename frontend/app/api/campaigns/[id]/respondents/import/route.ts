import { NextResponse } from 'next/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import {
  getCustomerActionPermission,
  getPermissionDeniedMessage,
} from '@/lib/customer-permissions'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'

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

  const actorRole =
    profile?.is_verisight_admin === true ? 'verisight_admin' : membership?.role ?? 'unknown'
  const canImportRespondents =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, 'import_respondents')
  if (!canImportRespondents) {
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'import_respondents',
      outcome: 'blocked',
      summary: getPermissionDeniedMessage('import_respondents'),
    })

    return NextResponse.json(
      { detail: getPermissionDeniedMessage('import_respondents') },
      { status: 403 },
    )
  }

  let apiKey: string
  try {
    apiKey = await getOrganizationApiKey(campaign.organization_id)
  } catch {
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

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/campaigns/${id}/respondents/import`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: outgoing,
    cache: 'no-store',
  })

  const contentType = backendResponse.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const payload = await backendResponse.json()
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'import_respondents',
      outcome: backendResponse.ok ? 'completed' : 'blocked',
      summary:
        backendResponse.ok
          ? `Deelnemersimport verwerkt voor ${payload.valid_rows ?? payload.imported ?? 0} rij(en).`
          : typeof payload?.detail === 'string'
            ? payload.detail
            : 'Deelnemersimport kon niet worden verwerkt.',
      metadata: {
        dry_run: String(incoming.get('dry_run') ?? 'true') === 'true',
        valid_rows: payload.valid_rows ?? null,
        imported: payload.imported ?? null,
      },
    })
    return NextResponse.json(payload, { status: backendResponse.status })
  }

  const detail = await backendResponse.text()
  await insertCampaignAuditEvent({
    supabase,
    organizationId: campaign.organization_id,
    campaignId: id,
    actorUserId: user.id,
    actorRole,
    action: 'import_respondents',
    outcome: backendResponse.ok ? 'completed' : 'blocked',
    summary: detail || 'Import kon niet worden verwerkt.',
    metadata: {
      dry_run: String(incoming.get('dry_run') ?? 'true') === 'true',
    },
  })

  return NextResponse.json(
    { detail: detail || 'Import kon niet worden verwerkt.' },
    { status: backendResponse.status || 500 },
  )
}
