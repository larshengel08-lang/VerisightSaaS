'use server'

/**
 * Server actions voor dashboard-beheer (herinnering bevestigen, campagne sluiten).
 * Draaien server-side met sessie-verificatie via Supabase auth; app-level permission
 * gate, met RLS als backstop voor data-isolatie per tenant.
 */

import { createClient } from '@/lib/supabase/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import type { CampaignAuditActorRole } from '@/lib/campaign-audit'
import { getCustomerActionPermission, getPermissionDeniedMessage } from '@/lib/customer-permissions'
import type { MemberRole } from '@/lib/types'

export interface DashboardActionResult {
  ok: boolean
  error?: string
}

type SupabaseClientType = Awaited<ReturnType<typeof createClient>>

type ActorContext =
  | { ok: false; error: string }
  | {
      ok: true
      supabase: SupabaseClientType
      user: NonNullable<Awaited<ReturnType<SupabaseClientType['auth']['getUser']>>['data']['user']>
      organizationId: string
      isAdmin: boolean
      role: MemberRole | null
      actorRole: CampaignAuditActorRole
    }

async function loadActorContext(campaignId: string): Promise<ActorContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Niet ingelogd.' }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()
  if (!campaign) return { ok: false, error: 'Campagne niet gevonden of niet toegankelijk.' }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isAdmin = profile?.is_verisight_admin === true
  const role = (membership?.role ?? null) as MemberRole | null
  const actorRole: CampaignAuditActorRole = isAdmin ? 'verisight_admin' : (role ?? 'unknown')

  return {
    ok: true,
    supabase,
    user,
    organizationId: campaign.organization_id,
    isAdmin,
    role,
    actorRole,
  }
}

/** State 3 reminder confirm: HR sent the reminder manually; record it as handled. No email is sent here. */
export async function confirmReminderSentAction(campaignId: string): Promise<DashboardActionResult> {
  const ctx = await loadActorContext(campaignId)
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canSend = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'send_reminders')
  if (!canSend) return { ok: false, error: getPermissionDeniedMessage('send_reminders') }

  const { error } = await insertCampaignAuditEvent({
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
  if (error) return { ok: false, error: `Bevestigen mislukt: ${error.message}` }

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
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const canArchive = ctx.isAdmin || getCustomerActionPermission(ctx.role, 'review_launch')
  if (!canArchive) return { ok: false, error: getPermissionDeniedMessage('review_launch') }

  const { data: updatedRows, error } = await ctx.supabase
    .from('campaigns')
    .update({ is_active: false, closed_at: new Date().toISOString() })
    .eq('id', campaignId)
    .select('id')

  if (error) return { ok: false, error: `Sluiten mislukt: ${error.message}` }
  if (!updatedRows || updatedRows.length === 0) {
    return { ok: false, error: 'Sluiten mislukt: campagne niet gevonden of geen rechten.' }
  }

  const { error: auditError } = await insertCampaignAuditEvent({
    supabase: ctx.supabase,
    organizationId: ctx.organizationId,
    campaignId,
    actorUserId: ctx.user.id,
    actorRole: ctx.actorRole,
    action: 'delivery_lifecycle_changed',
    outcome: 'completed',
    summary: 'Campagne gesloten vanuit het dashboard.',
  })
  if (auditError) return { ok: false, error: `Sluiten gelukt, maar loggen mislukt: ${auditError.message}` }

  return { ok: true }
}
