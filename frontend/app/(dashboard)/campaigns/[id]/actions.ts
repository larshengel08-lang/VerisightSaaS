'use server'

/**
 * Server actions voor campagnebeheer.
 * Draaien server-side zodat Supabase-sessie beschikbaar is voor auth-verificatie.
 * RLS op de respondenten-tabel zorgt dat alleen geautoriseerde gebruikers data zien.
 */

import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import {
  getCustomerActionPermission,
  getPermissionDeniedMessage,
} from '@/lib/customer-permissions'
import { getOrganizationApiKey } from '@/lib/organization-secrets'
import { getBackendApiUrl } from '@/lib/server-env'
import { formatBackendDetail } from './reminder-feedback'

export interface ResendResult {
  sent: number
  failed: number
  skipped: number
  error?: string
}

/**
 * Stuur uitnodigingen opnieuw naar alle incomplete respondenten met e-mailadres.
 * Auth: vereist geldige Supabase-sessie (server-side cookie verificatie).
 * Data-toegang: bewaakt door RLS — alleen respondenten van eigen org zichtbaar.
 */
export async function resendPendingAction(campaignId: string): Promise<ResendResult> {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { sent: 0, failed: 0, skipped: 0, error: 'Niet ingelogd.' }

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    return { sent: 0, failed: 0, skipped: 0, error: 'Campaign niet gevonden of niet toegankelijk.' }
  }

  const [
    { data: profile },
    { data: membership, error: membershipError },
  ] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', campaign.organization_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const actorRole =
    profile?.is_verisight_admin === true ? 'verisight_admin' : membership?.role ?? 'unknown'
  const canSendReminders =
    profile?.is_verisight_admin === true ||
    getCustomerActionPermission(membership?.role ?? null, 'send_reminders')

  if (membershipError || (!profile?.is_verisight_admin && !membership) || !canSendReminders) {
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId,
      actorUserId: user.id,
      actorRole,
      action: 'send_reminders',
      outcome: 'blocked',
      summary: getPermissionDeniedMessage('send_reminders'),
    })

    return { sent: 0, failed: 0, skipped: 0, error: getPermissionDeniedMessage('send_reminders') }
  }

  let apiKey: string
  try {
    apiKey = await getOrganizationApiKey(campaign.organization_id, { supabase })
  } catch {
    return { sent: 0, failed: 0, skipped: 0, error: 'Autorisatie voor backend-uitnodigingen ontbreekt.' }
  }

  // Get pending respondents — RLS ensures only own-org data is returned
  const { data: respondents, error: fetchError } = await supabase
    .from('respondents')
    .select('token, email')
    .eq('campaign_id', campaignId)
    .eq('completed', false)
    .not('email', 'is', null)

  if (fetchError) return { sent: 0, failed: 0, skipped: 0, error: fetchError.message }
  if (!respondents?.length) return { sent: 0, failed: 0, skipped: 0 }

  try {
    const resp = await fetch(`${getBackendApiUrl()}/api/campaigns/${campaignId}/send-invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(respondents.map(r => ({ token: r.token, email: r.email }))),
      // Server-side fetch: geen browser CORS-restrictie, directe backend-aanroep
      cache: 'no-store',
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return {
        sent: 0,
        failed: respondents.length,
        skipped: 0,
        error: formatBackendDetail(err?.detail ?? err),
      }
    }

    const result = await resp.json()
    await insertCampaignAuditEvent({
      supabase,
      organizationId: campaign.organization_id,
      campaignId,
      actorUserId: user.id,
      actorRole,
      action: 'send_reminders',
      outcome: 'completed',
      summary: `Reminderactie uitgevoerd voor ${result.sent ?? 0} respondent(en).`,
      metadata: {
        sent: result.sent ?? 0,
        failed: result.failed ?? 0,
        skipped: result.skipped ?? 0,
      },
    })

    return {
      sent:    result.sent    ?? 0,
      failed:  result.failed  ?? 0,
      skipped: result.skipped ?? 0,
    }
  } catch {
    return { sent: 0, failed: 0, skipped: 0, error: 'Verbindingsfout met backend.' }
  }
}
