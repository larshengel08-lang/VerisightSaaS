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
  const canLaunchInvites =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, 'launch_invites')
  if (!canLaunchInvites) {
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId: id,
      actorUserId: user.id,
      actorRole,
      action: 'launch_invites',
      outcome: 'blocked',
      summary: getPermissionDeniedMessage('launch_invites'),
    })

    return NextResponse.json(
      { detail: getPermissionDeniedMessage('launch_invites') },
      { status: 403 },
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
  await insertCampaignAuditEvent({
    supabase,
    organizationId: campaign.organization_id,
    campaignId: id,
    actorUserId: user.id,
    actorRole,
    action: 'launch_invites',
    outcome: backendResponse.ok ? 'completed' : 'blocked',
    summary:
      backendResponse.ok
        ? `Inviteflow gestart voor ${payload.sent ?? 0} respondent(en).`
        : typeof payload?.detail === 'string'
          ? payload.detail
          : 'Inviteflow kon niet worden gestart.',
    metadata: {
      sent: payload.sent ?? null,
      failed: payload.failed ?? null,
      skipped: payload.skipped ?? null,
    },
  })
  return NextResponse.json(payload, { status: backendResponse.status })
}
