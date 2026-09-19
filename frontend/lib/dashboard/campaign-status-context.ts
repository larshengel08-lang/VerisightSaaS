import type { SupabaseClient } from '@supabase/supabase-js'
import type { CampaignDeliveryLite, CampaignStatusContext } from '@/lib/dashboard/campaign-status'

/**
 * Standaard max-rows van Supabase/PostgREST. Een resultaat van precies deze
 * lengte kan afgekapt zijn; zie de controle in loadCampaignStatusContext.
 */
export const SUPABASE_ROW_CAP = 1000

/**
 * Laadt in twee queries (met .in()) wat deriveCampaignStatusFor per meting
 * nodig heeft: het delivery record (lancering, noemer, herinnering) en het
 * nieuwste send_reminders-event. Gebruikt door /dashboard (lijst) en /reports.
 *
 * Fail Loud: een mislukte query wordt een fout. Een lege map zou lezen als
 * "niets gelanceerd, geen noemer" en dat is een leugen, geen degradatie.
 * Hetzelfde geldt voor een resultaat dat de rijlimiet van Supabase raakt: dat
 * is mogelijk afgekapt, dus ook een fout.
 *
 * Alleen de client van de ingelogde gebruiker (createClient uit
 * lib/supabase/server): de tenant-isolatie komt uit RLS. Geef hier nooit een
 * service-role client aan, dan leest de lijst metingen van andere organisaties.
 */
export async function loadCampaignStatusContext(
  supabase: SupabaseClient,
  campaignIds: string[],
  today: string,
): Promise<CampaignStatusContext> {
  if (campaignIds.length === 0) {
    return { deliveryByCampaign: new Map(), lastReminderEventAtByCampaign: new Map(), today }
  }

  // De .in()-lijsten gaan als GET-querystring mee; de URL groeit met het aantal
  // metingen. Voor één klant (pre eerste klant: een handvol metingen) ruim
  // binnen de grens. Groeit het operatoroverzicht, dan de ids in blokken opdelen.
  const [{ data: deliveries, error: deliveryError }, { data: events, error: eventError }] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('campaign_id, launch_confirmed_at, launch_date, invited_count, reminder_config')
      .in('campaign_id', campaignIds),
    // Alleen de twee kolommen die nodig zijn, nieuwste eerst: raakt de lijst
    // toch de rijlimiet, dan vangt de controle hieronder dat af.
    supabase
      .from('campaign_action_audit_events')
      .select('campaign_id, created_at')
      .in('campaign_id', campaignIds)
      .eq('action_key', 'send_reminders')
      .eq('outcome', 'completed')
      .order('created_at', { ascending: false }),
  ])

  if (deliveryError) throw new Error(`Kon de metinggegevens niet laden: ${deliveryError.message}`)
  if (eventError) throw new Error(`Kon de herinneringsgeschiedenis niet laden: ${eventError.message}`)
  if ((deliveries?.length ?? 0) >= SUPABASE_ROW_CAP) {
    throw new Error(
      `Metinggegevens raken de rijlimiet van ${SUPABASE_ROW_CAP}: het resultaat is mogelijk afgekapt, dus de status per meting is niet betrouwbaar.`,
    )
  }
  if ((events?.length ?? 0) >= SUPABASE_ROW_CAP) {
    throw new Error(
      `Herinneringsgeschiedenis raakt de rijlimiet van ${SUPABASE_ROW_CAP}: het resultaat is mogelijk afgekapt, dus de herinneringsstatus is niet betrouwbaar.`,
    )
  }

  const deliveryByCampaign = new Map<string, CampaignDeliveryLite>()
  for (const row of deliveries ?? []) {
    deliveryByCampaign.set(row.campaign_id as string, {
      launchConfirmedAt: (row.launch_confirmed_at as string | null) ?? null,
      launchDate: (row.launch_date as string | null) ?? null,
      invitedCount: (row.invited_count as number | null) ?? null,
      reminderConfig: row.reminder_config,
    })
  }

  // Nieuwste eerst (order desc): het eerste event per campagne is het laatste.
  const lastReminderEventAtByCampaign = new Map<string, string>()
  for (const row of events ?? []) {
    const id = row.campaign_id as string
    if (!lastReminderEventAtByCampaign.has(id)) lastReminderEventAtByCampaign.set(id, row.created_at as string)
  }

  return { deliveryByCampaign, lastReminderEventAtByCampaign, today }
}
