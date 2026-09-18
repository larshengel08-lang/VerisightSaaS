import type { SupabaseClient } from '@supabase/supabase-js'
import type { CampaignDeliveryLite, CampaignStatusContext } from '@/lib/dashboard/campaign-status'

/**
 * Laadt in twee queries (met .in()) wat deriveCampaignStatusFor per meting
 * nodig heeft: het delivery record (lancering, noemer, herinnering) en het
 * nieuwste send_reminders-event. Gebruikt door /dashboard (lijst) en /reports.
 *
 * Fail Loud: een mislukte query wordt een fout. Een lege map zou lezen als
 * "niets gelanceerd, geen noemer" en dat is een leugen, geen degradatie.
 */
export async function loadCampaignStatusContext(
  supabase: SupabaseClient,
  campaignIds: string[],
  today: string,
): Promise<CampaignStatusContext> {
  if (campaignIds.length === 0) {
    return { deliveryByCampaign: new Map(), lastReminderEventAtByCampaign: new Map(), today }
  }

  const [{ data: deliveries, error: deliveryError }, { data: events, error: eventError }] = await Promise.all([
    supabase
      .from('campaign_delivery_records')
      .select('campaign_id, launch_confirmed_at, launch_date, invited_count, reminder_config')
      .in('campaign_id', campaignIds),
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
