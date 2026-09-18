'use server'

import { createClient } from '@/lib/supabase/server'
import {
  prepareSegmentDepartmentsUpdate,
  type SegmentDepartmentInput,
  type SegmentDepartmentStored,
  type SegmentDepartmentsUpdate,
} from '@/lib/self-send-comms'

export interface ActionResult {
  ok: boolean
  error?: string
}

/** Bij succes de opgeslagen afdelingen mét slug, zodat de wizard de links in de uitnodiging kan bijwerken. */
export type SaveSegmentDepartmentsResult =
  | { ok: true; departments: SegmentDepartmentsUpdate['departments'] }
  | { ok: false; error: string }

// Zelfde patroon als launch-setup-actions.ts: owner/member of verisight-admin.
// Moet in sync blijven met is_org_manager() in schema.sql.
async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id, segment_departments, is_active, closed_at')
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
): Promise<SaveSegmentDepartmentsResult> {
  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  // Zelfde grens als saveLaunchSetupAction: na lancering of sluiting mag stap 1
  // de afdelingen (en dus de links en het totaal) niet meer herschrijven.
  if (campaign.is_active === false || campaign.closed_at) {
    return { ok: false, error: 'De meting is al gesloten; stap 1 kun je niet meer wijzigen.' }
  }
  const { data: delivery, error: deliveryReadError } = await supabase
    .from('campaign_delivery_records')
    .select('launch_confirmed_at')
    .eq('campaign_id', campaignId)
    .maybeSingle()
  if (deliveryReadError) {
    return { ok: false, error: `Opslaan mislukt: de huidige planning kon niet worden gelezen (${deliveryReadError.message}).` }
  }
  if (delivery?.launch_confirmed_at) {
    return { ok: false, error: 'De meting is al gestart; stap 1 kun je niet meer wijzigen.' }
  }

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

  return { ok: true, departments: update.departments }
}
