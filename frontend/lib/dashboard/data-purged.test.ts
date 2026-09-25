import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  dataPurgedDecisionMessage,
  dataPurgedLabel,
  dataPurgedMessage,
  dataPurgedReason,
  loadDataPurgedAt,
  loadDataPurgedAtByCampaign,
} from '@/lib/dashboard/data-purged'

type Result = { data: unknown; error: { code?: string; message: string } | null }

/** Nep-client voor één meting; houdt bij welke tabel, kolommen en id zijn opgevraagd. */
function fakeSupabase(result: Result) {
  const calls: { table: string; columns: string; column: string; value: string }[] = []
  const client = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: string) => ({
          maybeSingle: async () => {
            calls.push({ table, columns, column, value })
            return result
          },
        }),
      }),
    }),
  } as unknown as SupabaseClient
  return { client, calls }
}

const KOLOM_ONTBREEKT = { code: '42703', message: 'column campaigns.data_purged_at does not exist' }

/** Nep-client voor de lijstvariant; houdt bij welke id's zijn opgevraagd. */
function fakeListSupabase(result: Result) {
  const calls: { table: string; columns: string; ids: readonly string[] }[] = []
  const client = {
    from: (table: string) => ({
      select: (columns: string) => ({
        in: async (_col: string, ids: readonly string[]) => {
          calls.push({ table, columns, ids })
          return result
        },
      }),
    }),
  } as unknown as SupabaseClient
  return { client, calls }
}

describe('opgeschoonde meting (Deel C, bewaartermijn)', () => {
  it('geeft de datum terug als de gegevens verwijderd zijn', async () => {
    const { client, calls } = fakeSupabase({ data: { data_purged_at: '2028-06-16T03:00:00Z' }, error: null })
    expect(await loadDataPurgedAt(client, 'c1')).toBe('2028-06-16T03:00:00Z')
    expect(calls).toEqual([{ table: 'campaigns', columns: 'data_purged_at', column: 'id', value: 'c1' }])
  })

  it('geeft null als de meting niet is opgeschoond', async () => {
    const { client } = fakeSupabase({ data: { data_purged_at: null }, error: null })
    expect(await loadDataPurgedAt(client, 'c1')).toBeNull()
  })

  it('geeft null als de meting niet zichtbaar is (geen rij)', async () => {
    const { client } = fakeSupabase({ data: null, error: null })
    expect(await loadDataPurgedAt(client, 'c1')).toBeNull()
  })

  it('geeft null als de kolom nog niet bestaat: zonder kolom kan er niets zijn opgeschoond', async () => {
    const { client } = fakeSupabase({ data: null, error: KOLOM_ONTBREEKT })
    expect(await loadDataPurgedAt(client, 'c1')).toBeNull()
  })

  it('valt luid om als een andere kolom ontbreekt (tikfout of hernoeming)', async () => {
    const { client } = fakeSupabase({
      data: null,
      error: { code: '42703', message: 'column campaigns.data_purged_att does not exist' },
    })
    await expect(loadDataPurgedAt(client, 'c1')).rejects.toThrow('Kon niet nagaan of de gegevens van deze meting nog bestaan')
  })

  it('valt luid om bij een andere fout', async () => {
    const { client } = fakeSupabase({ data: null, error: { code: '500', message: 'kapot' } })
    await expect(loadDataPurgedAt(client, 'c1')).rejects.toThrow('Kon niet nagaan of de gegevens van deze meting nog bestaan')
  })

  it('zegt wanneer en wat dat betekent', () => {
    expect(dataPurgedMessage('2028-06-16T03:00:00Z')).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.',
    )
  })

  it('leest de dag in Nederlandse tijd, net als de backend', () => {
    expect(dataPurgedMessage('2028-06-15T22:30:00Z')).toContain('op 16 juni 2028 verwijderd')
  })

  it('noemt een onleesbare datum eerlijk onbekend in plaats van een lege plek', () => {
    expect(dataPurgedMessage('geen-datum')).toContain('zijn op een onbekende datum verwijderd')
  })

  it('bevat geen em-dash of en-dash', () => {
    expect(dataPurgedMessage('2028-06-16T03:00:00Z')).not.toMatch(/[–—]/)
  })

  it('de campagnepagina gebruikt het en toont dan geen downloadknop', () => {
    const page = readFileSync(path.join(process.cwd(), 'app/(dashboard)/campaigns/[id]/page.tsx'), 'utf8')
    expect(page).toContain('loadDataPurgedAt')
    const start = page.indexOf('if (purgedAt)')
    const eind = page.indexOf('const [{ data: campaignMeta')
    expect(start).toBeGreaterThan(-1)
    expect(eind).toBeGreaterThan(start)
    const tak = page.slice(start, eind)
    // Taak 20c: de kaart staat in één gedeeld component (ook voor dashboard,
    // open antwoorden en routebeheer); dat component toont dataPurgedMessage.
    expect(tak).toContain('<DataPurgedCard purgedAt={purgedAt}')
    expect(tak).not.toContain('PdfDownloadButton')
    expect(tak).not.toContain('DecisionBlock')
    const kaart = readFileSync(path.join(process.cwd(), 'components/dashboard/data-purged-card.tsx'), 'utf8')
    expect(kaart).toContain('{dataPurgedMessage(purgedAt)}')
    expect(kaart).toContain('Gegevens verwijderd')
  })

  it('geeft een korte status met datum voor lijsten en tabellen', () => {
    expect(dataPurgedLabel('2028-06-15T22:30:00Z')).toBe('Gegevens verwijderd op 16 juni 2028')
    expect(dataPurgedLabel('geen-datum')).toBe('Gegevens verwijderd op een onbekende datum')
  })

  it('zegt bij een besluit dat vastleggen niet meer kan, met dezelfde reden', () => {
    expect(dataPurgedDecisionMessage('2028-06-16T03:00:00Z')).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een besluit vastleggen kan daarom niet meer.',
    )
    expect(dataPurgedReason('2028-06-16T03:00:00Z')).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie.',
    )
    for (const tekst of [dataPurgedLabel('2028-06-16'), dataPurgedDecisionMessage('2028-06-16')]) {
      expect(tekst).not.toMatch(/[–—]/)
    }
  })
})

describe('opgeschoonde metingen in een lijst (voor dashboard, rapporten en beheer)', () => {
  it('geeft per opgeschoonde meting de datum en laat de rest weg', async () => {
    const { client, calls } = fakeListSupabase({
      data: [
        { id: 'c1', data_purged_at: '2028-06-16T03:00:00Z' },
        { id: 'c2', data_purged_at: null },
      ],
      error: null,
    })
    const map = await loadDataPurgedAtByCampaign(client, ['c1', 'c2'])
    expect(map.get('c1')).toBe('2028-06-16T03:00:00Z')
    expect(map.has('c2')).toBe(false)
    expect(map.size).toBe(1)
    expect(calls).toEqual([{ table: 'campaigns', columns: 'id, data_purged_at', ids: ['c1', 'c2'] }])
  })

  it('vraagt niets op zonder metingen', async () => {
    const { client, calls } = fakeListSupabase({ data: [], error: null })
    const map = await loadDataPurgedAtByCampaign(client, [])
    expect(map.size).toBe(0)
    expect(calls).toHaveLength(0)
  })

  it('vraagt elke id één keer op', async () => {
    const { client, calls } = fakeListSupabase({ data: [], error: null })
    await loadDataPurgedAtByCampaign(client, ['c1', 'c1', 'c2'])
    expect(calls[0].ids).toEqual(['c1', 'c2'])
  })

  it('geeft een lege lijst als de kolom nog niet bestaat', async () => {
    const { client } = fakeListSupabase({ data: null, error: KOLOM_ONTBREEKT })
    expect((await loadDataPurgedAtByCampaign(client, ['c1'])).size).toBe(0)
  })

  it('valt luid om als een andere kolom ontbreekt', async () => {
    const { client } = fakeListSupabase({
      data: null,
      error: { code: '42703', message: 'column campaigns.idd does not exist' },
    })
    await expect(loadDataPurgedAtByCampaign(client, ['c1'])).rejects.toThrow(
      'Kon niet nagaan of de gegevens van deze metingen nog bestaan',
    )
  })

  it('valt luid om bij een andere fout', async () => {
    const { client } = fakeListSupabase({ data: null, error: { code: '500', message: 'kapot' } })
    await expect(loadDataPurgedAtByCampaign(client, ['c1'])).rejects.toThrow(
      'Kon niet nagaan of de gegevens van deze metingen nog bestaan',
    )
  })
})
