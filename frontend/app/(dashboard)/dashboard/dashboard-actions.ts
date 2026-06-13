'use server'

import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import { getCustomerActionPermission, getPermissionDeniedMessage } from '@/lib/customer-permissions'

export interface DashboardActionResult {
  ok: boolean
  error?: string
}

async function loadActorContext(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, error: 'Niet ingelogd.' as const }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()
  if (!campaign) return { supabase, error: 'Campagne niet gevonden of niet toegankelijk.' as const }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  return {
    supabase,
    user,
    organizationId: campaign.organization_id,
    isAdmin: profile?.is_verisight_admin === true,
    role: membership?.role ?? null,
    actorRole: profile?.is_verisight_admin === true ? 'verisight_admin' : (membership?.role ?? 'unknown'),
  } as const
}

/** State 3 reminder confirm: HR sent the reminder manually; record it as handled. No email is sent here. */
export async function confirmReminderSentAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (ctx.error || !ctx.user) return { ok: false, error: ctx.error ?? 'Niet ingelogd.' }

  const canSend = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'send_reminders')
  if (!canSend) return { ok: false, error: getPermissionDeniedMessage('send_reminders') }

  await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'send_reminders',
    outcome: 'completed',
    summary: 'HR bevestigde dat de herinnering handmatig is verstuurd.',
    metadata: { channel: 'manual_dashboard_confirm' },
  })

  return { ok: true }
}

/**
 * State 3/4 close: archive the campaign.
 * Sets is_active = false and closed_at, then records a delivery_lifecycle_changed audit event.
 * ('archive_campaign' is not a valid CampaignAuditActionKey; delivery_lifecycle_changed is the
 * correct existing key for campaign lifecycle state transitions.)
 */
export async function closeCampaignAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (ctx.error || !ctx.user) return { ok: false, error: ctx.error ?? 'Niet ingelogd.' }

  const canArchive = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canArchive) return { ok: false, error: getPermissionDeniedMessage('review_launch') }

  const { error } = await ctx.supabase
    .from('campaigns')
    .update({ is_active: false, closed_at: new Date().toISOString() })
    .eq('id', campaignId)

  if (error) return { ok: false, error: `Sluiten mislukt: ${error.message}` }

  await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'delivery_lifecycle_changed',
    outcome: 'completed',
    summary: 'Campagne gesloten vanuit het dashboard.',
  })

  return { ok: true }
}
