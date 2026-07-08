'use server'

import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { supabase, user, campaign: null, authorized: false }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  // Moet in sync blijven met is_org_manager() in schema.sql (owner/member,
  // geen viewer) — anders passeert een viewer deze check terwijl de RLS-
  // insert/update-policy op campaign_delivery_records 'm alsnog blokkeert,
  // wat hier als een onbehandelde 500 naar buiten komt i.p.v. een nette
  // 'Niet gemachtigd'.
  const isManager = membership?.role === 'owner' || membership?.role === 'member'
  const authorized = profile?.is_verisight_admin === true || isManager
  return { supabase, user, campaign, authorized }
}

export async function saveLaunchSetupAction(
  campaignId: string,
  launchDate: string,
  invitedCount: number,
): Promise<ActionResult> {
  if (!launchDate) return { ok: false, error: 'Startdatum is verplicht.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(launchDate) || isNaN(new Date(launchDate).getTime())) {
    return { ok: false, error: 'Ongeldige datum.' }
  }
  if (!invitedCount || invitedCount < 1) return { ok: false, error: 'Aantal deelnemers moet minimaal 1 zijn.' }

  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  const { error } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      {
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        launch_date: launchDate,
        invited_count: invitedCount,
      },
      { onConflict: 'campaign_id' },
    )

  if (error) throw new Error(`Opslaan mislukt: ${error.message}`)
  return { ok: true }
}

export async function confirmLaunchAction(campaignId: string): Promise<ActionResult> {
  const { supabase, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized) return { ok: false, error: 'Niet gemachtigd.' }

  const now = new Date().toISOString()
  const { error, count } = await supabase
    .from('campaign_delivery_records')
    .update({ launch_confirmed_at: now }, { count: 'exact' })
    .eq('campaign_id', campaignId)

  if (error) throw new Error(`Bevestigen mislukt: ${error.message}`)
  if (count === 0) throw new Error('Geen delivery record gevonden — sla eerst de startdatum op.')
  return { ok: true }
}
