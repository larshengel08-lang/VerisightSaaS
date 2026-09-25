import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  dataPurgedMessage,
  loadDataPurgedAt,
  loadDataPurgedAtByCampaign,
} from '@/lib/dashboard/data-purged'

type Result = { data: unknown; error: { code?: string; message: string } | null }

function fakeSupabase(result: Result) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => result,
        }),
      }),
    }),
  } as unknown as SupabaseClient
}

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
    const supabase = fakeSupabase({ data: { data_purged_at: '2028-06-16T03:00:00Z' }, error: null })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBe('2028-06-16T03:00:00Z')
  })

  it('geeft null als de meting niet is opgeschoond', async () => {
    const supabase = fakeSupabase({ data: { data_purged_at: null }, error: null })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBeNull()
  })

  it('geeft null als de kolom nog niet bestaat: zonder kolom kan er niets zijn opgeschoond', async () => {
    const supabase = fakeSupabase({ data: null, error: { code: '42703', message: 'column does not exist' } })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBeNull()
  })

  it('geeft ook null bij de schema-cachefout van PostgREST voor een onbekende kolom', async () => {
    const supabase = fakeSupabase({ data: null, error: { code: 'PGRST204', message: 'column not found' } })
    expect(await loadDataPurgedAt(supabase, 'c1')).toBeNull()
  })

  it('valt luid om bij een andere fout', async () => {
    const supabase = fakeSupabase({ data: null, error: { code: '500', message: 'kapot' } })
    await expect(loadDataPurgedAt(supabase, 'c1')).rejects.toThrow('Kon niet nagaan of de gegevens van deze meting nog bestaan')
  })

  it('zegt wanneer en wat dat betekent', () => {
    expect(dataPurgedMessage('2028-06-16T03:00:00Z')).toBe(
      'De gegevens van deze meting zijn op 16 juni 2028 verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.',
    )
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
    expect(page).toContain('dataPurgedMessage')
    const start = page.indexOf('if (purgedAt)')
    const eind = page.indexOf('const [{ data: campaignMeta')
    expect(start).toBeGreaterThan(-1)
    expect(eind).toBeGreaterThan(start)
    const tak = page.slice(start, eind)
    expect(tak).toContain('dataPurgedMessage(purgedAt)')
    expect(tak).not.toContain('PdfDownloadButton')
    expect(tak).not.toContain('DecisionBlock')
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
    const { client } = fakeListSupabase({ data: null, error: { code: '42703', message: 'column does not exist' } })
    expect((await loadDataPurgedAtByCampaign(client, ['c1'])).size).toBe(0)
  })

  it('valt luid om bij een andere fout', async () => {
    const { client } = fakeListSupabase({ data: null, error: { code: '500', message: 'kapot' } })
    await expect(loadDataPurgedAtByCampaign(client, ['c1'])).rejects.toThrow(
      'Kon niet nagaan of de gegevens van deze metingen nog bestaan',
    )
  })
})
