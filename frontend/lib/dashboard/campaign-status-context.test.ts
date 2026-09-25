import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ROW_CAP, loadCampaignStatusContext } from './campaign-status-context'

type Result = { data: Record<string, unknown>[] | null; error: { message: string } | null }

/** Minimale nep-client: elke builder-methode geeft zichzelf terug, await levert het resultaat per tabel. */
function fakeClient(results: Record<string, Result>): SupabaseClient {
  return {
    from(table: string) {
      const result = results[table]
      const builder: Record<string, unknown> = {}
      for (const method of ['select', 'in', 'eq', 'order']) builder[method] = () => builder
      builder.then = (resolve: (value: Result) => unknown) => resolve(result)
      return builder
    },
  } as unknown as SupabaseClient
}

function rows(count: number, make: (i: number) => Record<string, unknown>) {
  return Array.from({ length: count }, (_, i) => make(i))
}

describe('loadCampaignStatusContext: gedrag', () => {
  it('bouwt de maps en houdt per meting alleen het nieuwste herinneringsevent', async () => {
    const context = await loadCampaignStatusContext(
      fakeClient({
        campaign_delivery_records: {
          data: [{ campaign_id: 'c1', launch_confirmed_at: '2026-09-13T09:00:00Z', launch_date: '2026-09-13', invited_count: 30, reminder_config: null }],
          error: null,
        },
        campaign_action_audit_events: {
          data: [
            { campaign_id: 'c1', created_at: '2026-09-18T08:00:00Z' },
            { campaign_id: 'c1', created_at: '2026-09-10T08:00:00Z' },
          ],
          error: null,
        },
        campaigns: { data: [{ id: 'c1', data_purged_at: null }], error: null },
      }),
      ['c1'],
      '2026-09-18',
    )
    expect(context.deliveryByCampaign.get('c1')?.invitedCount).toBe(30)
    expect(context.lastReminderEventAtByCampaign.get('c1')).toBe('2026-09-18T08:00:00Z')
    expect(context.dataPurgedAtByCampaign.size).toBe(0)
  })

  it('neemt opgeschoonde metingen mee (Deel C)', async () => {
    const context = await loadCampaignStatusContext(
      fakeClient({
        campaign_delivery_records: { data: [], error: null },
        campaign_action_audit_events: { data: [], error: null },
        campaigns: {
          data: [
            { id: 'c1', data_purged_at: '2028-06-16T03:00:00Z' },
            { id: 'c2', data_purged_at: null },
          ],
          error: null,
        },
      }),
      ['c1', 'c2'],
      '2028-07-01',
    )
    expect([...context.dataPurgedAtByCampaign]).toEqual([['c1', '2028-06-16T03:00:00Z']])
  })

  it('zonder de migratiekolom: niemand opgeschoond en geen crash', async () => {
    const context = await loadCampaignStatusContext(
      fakeClient({
        campaign_delivery_records: { data: [], error: null },
        campaign_action_audit_events: { data: [], error: null },
        campaigns: { data: null, error: { code: '42703', message: 'column campaigns.data_purged_at does not exist' } as never },
      }),
      ['c1'],
      '2028-07-01',
    )
    expect(context.dataPurgedAtByCampaign.size).toBe(0)
  })

  it('faalt luid als niet na te gaan is welke metingen zijn opgeschoond', async () => {
    const client = fakeClient({
      campaign_delivery_records: { data: [], error: null },
      campaign_action_audit_events: { data: [], error: null },
      campaigns: { data: null, error: { message: 'kapot' } },
    })
    await expect(loadCampaignStatusContext(client, ['c1'], '2028-07-01')).rejects.toThrow(/nog bestaan: kapot/)
  })

  it('faalt luid als de delivery records de rijlimiet raken (geen stil afgekapte map)', async () => {
    const client = fakeClient({
      campaign_delivery_records: {
        data: rows(SUPABASE_ROW_CAP, (i) => ({ campaign_id: `c${i}`, launch_confirmed_at: null, launch_date: null, invited_count: null, reminder_config: null })),
        error: null,
      },
      campaign_action_audit_events: { data: [], error: null },
      campaigns: { data: [], error: null },
    })
    await expect(loadCampaignStatusContext(client, ['c0'], '2026-09-18')).rejects.toThrow(/rijlimiet/)
  })

  it('faalt luid als de herinneringsevents de rijlimiet raken', async () => {
    const client = fakeClient({
      campaign_delivery_records: { data: [], error: null },
      campaign_action_audit_events: {
        data: rows(SUPABASE_ROW_CAP, () => ({ campaign_id: 'c1', created_at: '2026-09-18T08:00:00Z' })),
        error: null,
      },
      campaigns: { data: [], error: null },
    })
    await expect(loadCampaignStatusContext(client, ['c1'], '2026-09-18')).rejects.toThrow(/rijlimiet/)
  })

  it('faalt luid bij een queryfout', async () => {
    const client = fakeClient({
      campaign_delivery_records: { data: null, error: { message: 'boom' } },
      campaign_action_audit_events: { data: [], error: null },
      campaigns: { data: [], error: null },
    })
    await expect(loadCampaignStatusContext(client, ['c1'], '2026-09-18')).rejects.toThrow(/boom/)
  })
})
