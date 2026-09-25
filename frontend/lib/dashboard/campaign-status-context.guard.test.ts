import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const src = readFileSync(new URL('./campaign-status-context.ts', import.meta.url), 'utf8')

describe('loadCampaignStatusContext (spec 2026-09-16 par. 6.2: één query met in(campaign_id, ...))', () => {
  it('haalt delivery records en herinneringsevents voor alle metingen tegelijk op', () => {
    expect(src.match(/\.in\('campaign_id', campaignIds\)/g)?.length).toBe(2)
    expect(src).toContain("select('campaign_id, launch_confirmed_at, launch_date, invited_count, reminder_config')")
    expect(src).toContain(".eq('action_key', 'send_reminders')")
    expect(src).toContain(".eq('outcome', 'completed')")
    expect(src).toContain("order('created_at', { ascending: false })")
  })

  it('faalt luid: een mislukte query wordt een fout, geen lege map', () => {
    expect(src).toContain('if (deliveryError) throw new Error(')
    expect(src).toContain('if (eventError) throw new Error(')
  })

  it('faalt luid bij de Supabase-rijlimiet in plaats van stil af te kappen', () => {
    expect(src).toContain('export const SUPABASE_ROW_CAP = 1000')
    expect(src).toContain('(deliveries?.length ?? 0) >= SUPABASE_ROW_CAP')
    expect(src).toContain('(events?.length ?? 0) >= SUPABASE_ROW_CAP')
  })

  it('draait alleen met de client van de ingelogde gebruiker (RLS), nooit met service-role', () => {
    expect(src).toContain('Alleen de client van de ingelogde gebruiker')
    expect(src).not.toContain('supabase/admin')
  })

  it('laadt ook welke metingen zijn opgeschoond, in dezelfde ronde (Deel C)', () => {
    expect(src).toContain('loadDataPurgedAtByCampaign(supabase, campaignIds)')
    expect(src).toContain('dataPurgedAtByCampaign: new Map()')
  })

  it('houdt per campagne alleen het nieuwste herinneringsevent', () => {
    expect(src).toContain('if (!lastReminderEventAtByCampaign.has(id))')
  })
})
