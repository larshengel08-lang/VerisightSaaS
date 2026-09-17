'use server'

import { createClient } from '@/lib/supabase/server'
import { validateInvitedTotal } from '@/lib/response-activation'
import {
  DEFAULT_REMINDER_AFTER_DAYS,
  readReminderChoice,
  validateSchedule,
  type ReminderChoice,
} from '@/lib/campaign-schedule'

export interface ActionResult {
  ok: boolean
  error?: string
}

/** Stap 1 van de wizard (spec 2026-09-16 par. 4.1 en 5.2). */
export interface LaunchSetupInput {
  launchDate: string
  invitedCount: number
  closesAt: string
  reminderChoice: ReminderChoice
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getAuthAndMembership(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, campaign: null, authorized: false }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('organization_id, is_active, closed_at, closes_at')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { supabase, user, campaign: null, authorized: false }

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle(),
    supabase.from('org_members').select('role').eq('org_id', campaign.organization_id).eq('user_id', user.id).maybeSingle(),
  ])

  // Moet in sync blijven met is_org_manager() in schema.sql (owner/member,
  // geen viewer). Anders passeert een viewer deze check terwijl de RLS-
  // insert/update-policy op campaign_delivery_records 'm alsnog blokkeert,
  // wat hier als een onbehandelde 500 naar buiten komt i.p.v. een nette
  // 'Niet gemachtigd'.
  const isManager = membership?.role === 'owner' || membership?.role === 'member'
  const authorized = profile?.is_verisight_admin === true || isManager
  return { supabase, user, campaign, authorized }
}

/**
 * Slaat stap 1 op: startdatum, aantal en herinnering op het delivery record,
 * de sluitdatum op de campagne (RLS org_managers_can_update_campaigns staat
 * de eigenaar dit toe). Validatie spiegelt de wizard; elke voorspelbare fout
 * komt terug als { ok: false, error }, nooit als throw (spec par. 9).
 */
export async function saveLaunchSetupAction(
  campaignId: string,
  input: LaunchSetupInput,
): Promise<ActionResult> {
  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }

  // Server actions zijn publieke POST-endpoints: na de lancering of sluiting
  // mag stap 1 niets meer herschrijven (anders omzeilt een eigenaar hier de
  // verleng-grens of verschuift hij de startdatum van een lopende meting).
  if (campaign.is_active === false || campaign.closed_at) {
    return { ok: false, error: 'De meting is al gesloten; stap 1 kun je niet meer wijzigen.' }
  }

  const { data: delivery, error: deliveryReadError } = await supabase
    .from('campaign_delivery_records')
    .select('launch_date, launch_confirmed_at')
    .eq('campaign_id', campaignId)
    .maybeSingle()
  if (deliveryReadError) {
    return { ok: false, error: `Opslaan mislukt: de huidige planning kon niet worden gelezen (${deliveryReadError.message}).` }
  }
  if (delivery?.launch_confirmed_at) {
    return { ok: false, error: 'De meting is al gestart; stap 1 kun je niet meer wijzigen.' }
  }

  const schedule = validateSchedule(
    {
      launchDate: input.launchDate,
      closesAt: input.closesAt,
      reminderChoice: input.reminderChoice,
      today: todayIso(),
    },
    { storedLaunchDate: (delivery?.launch_date as string | null | undefined) ?? null },
  )
  if (!schedule.ok) return { ok: false, error: schedule.error }

  const invitedError = validateInvitedTotal(input.invitedCount)
  if (invitedError) return { ok: false, error: invitedError }

  const { error: deliveryError } = await supabase
    .from('campaign_delivery_records')
    .upsert(
      {
        campaign_id: campaignId,
        organization_id: campaign.organization_id,
        launch_date: schedule.value.launchDate,
        invited_count: input.invitedCount,
        reminder_config: schedule.value.reminderConfig,
      },
      { onConflict: 'campaign_id' },
    )
  if (deliveryError) return { ok: false, error: `Opslaan mislukt: ${deliveryError.message}` }

  // count: 'exact', want een door RLS gefilterde UPDATE geeft geen fout maar
  // 0 rijen; zonder deze check zou dat stil als succes doorgaan.
  const { error: closesError, count: closesCount } = await supabase
    .from('campaigns')
    .update({ closes_at: schedule.value.closesAt }, { count: 'exact' })
    .eq('id', campaignId)
  if (closesError || closesCount === 0) {
    const reason = closesError ? closesError.message : 'de meting is niet bijgewerkt'
    return {
      ok: false,
      error: `Startdatum en deelnemers zijn opgeslagen, maar de sluitdatum niet: ${reason}. Probeer opnieuw.`,
    }
  }

  return { ok: true }
}

/**
 * "Ja, verstuurd": zet launch_confirmed_at. Daarna is stap 1 op slot, dus deze
 * action toetst eerst of stap 1 compleet en nog geldig is. Het delivery record
 * bestaat altijd (trigger), dus "er is een rij" zegt niets; een directe aanroep
 * of een tabblad van dagen geleden zou anders een meting starten zonder
 * startdatum of met een sluitdatum die al voorbij is, en die kan de klant dan
 * nooit meer herstellen.
 */
export async function confirmLaunchAction(campaignId: string): Promise<ActionResult> {
  const { supabase, campaign, authorized } = await getAuthAndMembership(campaignId)
  if (!authorized || !campaign) return { ok: false, error: 'Niet gemachtigd.' }
  if (campaign.is_active === false || campaign.closed_at) {
    return { ok: false, error: 'De meting is al gesloten; je kunt hem niet meer als verstuurd bevestigen.' }
  }

  const { data: delivery, error: deliveryReadError } = await supabase
    .from('campaign_delivery_records')
    .select('launch_date, invited_count, reminder_config')
    .eq('campaign_id', campaignId)
    .maybeSingle()
  if (deliveryReadError) {
    return { ok: false, error: `Bevestigen mislukt: de planning kon niet worden gelezen (${deliveryReadError.message}).` }
  }

  const storedLaunchDate = (delivery?.launch_date as string | null | undefined) ?? null
  const storedInvitedCount = (delivery?.invited_count as number | null | undefined) ?? null
  if (!storedLaunchDate || storedInvitedCount === null) {
    return { ok: false, error: 'Sla eerst stap 1 op: startdatum en aantal deelnemers ontbreken nog.' }
  }

  const invitedError = validateInvitedTotal(storedInvitedCount)
  if (invitedError) return { ok: false, error: `Controleer stap 1: ${invitedError}` }

  // saveLaunchSetupAction schrijft altijd een volledige reminder_config. Een
  // lege config ('{}', kolomdefault) betekent dat er nooit gekozen is; het
  // dashboard (normalizeReminderConfig) en de wizard lezen dat allebei als
  // de standaard van 5 dagen, dus toetsen we die ook.
  const reminderChoice: ReminderChoice = readReminderChoice(delivery?.reminder_config) ?? DEFAULT_REMINDER_AFTER_DAYS
  const schedule = validateSchedule(
    {
      launchDate: storedLaunchDate,
      closesAt: (campaign.closes_at as string | null | undefined)?.slice(0, 10) ?? '',
      reminderChoice,
      today: todayIso(),
    },
    { storedLaunchDate },
  )
  if (!schedule.ok) return { ok: false, error: `Controleer stap 1: ${schedule.error}` }

  const now = new Date().toISOString()
  const { error, count } = await supabase
    .from('campaign_delivery_records')
    .update({ launch_confirmed_at: now }, { count: 'exact' })
    .eq('campaign_id', campaignId)

  if (error) return { ok: false, error: `Bevestigen mislukt: ${error.message}` }
  // Een door RLS gefilterde UPDATE geeft geen fout maar 0 rijen.
  if (count === 0) return { ok: false, error: 'Bevestigen mislukt: de meting is niet bijgewerkt. Probeer opnieuw.' }
  return { ok: true }
}
