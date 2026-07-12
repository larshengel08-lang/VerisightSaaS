'use server'

import { createClient } from '@/lib/supabase/server'
import {
  prepareSegmentDepartmentsUpdate,
  type SegmentDepartmentInput,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'

export interface ActionResult {
  ok: boolean
  error?: string
}

// Zelfde patroon als launch-setup-actions.ts: owner/member of verisight-admin.
// Moet in sync blijven met is_org_manager() in schema.sql.
async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id, segment_departments')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { supabase, user, campaign: null, authorized: false }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  const isManager = membership?.role === 'owner' || membership?.role === 'member'
  const authorized = profile?.is_verisight_admin === true || isManager
  return { supabase, user, campaign, authorized }
}

export async function saveSegmentDepartmentsAction(
  campaignId: string,
  incoming: SegmentDepartmentInput[],
): Promise<ActionResult> {
  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  // Vergrendelde afdelingen uit de database (Fail Loud: onafhankelijk van
  // wat de client beweert). Elke respondent-rij telt — ook niet-afgeronde:
  // de link is dan al gebruikt.
  const { data: respondentDepts, error: deptError } = await supabase
    .from('respondents')
    .select('department')
    .eq('campaign_id', campaignId)
    .not('department', 'is', null)
  if (deptError) return { ok: false, error: `Controle mislukt: ${deptError.message}` }
  const lockedLabels = new Set(
    (respondentDepts ?? []).map((r) => r.department as string).filter(Boolean),
  )

  let update
  try {
    update = prepareSegmentDepartmentsUpdate(
      (campaign.segment_departments ?? []) as SegmentDepartmentStored[],
      incoming,
      lockedLabels,
    )
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Ongeldige afdelingslijst.' }
  }

  const { error: campError } = await supabase
    .from('campaigns')
    .update({ segment_departments: update.departments })
    .eq('id', campaignId)
  if (campError) return { ok: false, error: `Opslaan mislukt: ${campError.message}` }

  // Campagne-totaal = som (spec §4) — bestaande weergaves blijven werken.
  const { error: deliveryError } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      {
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        invited_count: update.totalInvited,
      },
      { onConflict: 'campaign_id' },
    )
  if (deliveryError) return { ok: false, error: `Totaal opslaan mislukt: ${deliveryError.message}` }

  return { ok: true }
}
