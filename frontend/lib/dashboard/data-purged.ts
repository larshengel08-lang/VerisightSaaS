import type { SupabaseClient } from '@supabase/supabase-js'
import { formatDutchDate } from '@/lib/dashboard/format-dutch-date'

/**
 * Deel C (bewaartermijn): na de opschoning bestaan de antwoorden van een meting
 * niet meer. Zonder deze check toont een scherm "te weinig antwoorden" en een
 * downloadknop die 410 geeft. De kolom `campaigns.data_purged_at` bestaat pas na
 * migratie 2026_09_24_add_data_retention.sql; ontbreekt hij, dan kan er ook
 * niets zijn opgeschoond (de opschoning weigert zonder die kolom), dus "niet
 * opgeschoond" is dan de waarheid en geen stille terugval.
 *
 * 42703: Postgres "column does not exist" (PostgREST geeft die door bij een
 * select op een onbekende kolom). PGRST204: PostgREST kent de kolom niet in
 * zijn schema-cache.
 */
const COLUMN_MISSING_CODES = new Set(['42703', 'PGRST204'])

type QueryError = { code?: string; message: string }

function isColumnMissing(error: QueryError): boolean {
  return COLUMN_MISSING_CODES.has(error.code ?? '')
}

/** Wanneer de gegevens van één meting zijn verwijderd, of null. */
export async function loadDataPurgedAt(supabase: SupabaseClient, campaignId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('data_purged_at')
    .eq('id', campaignId)
    .maybeSingle()
  if (error) {
    if (isColumnMissing(error)) return null
    throw new Error(`Kon niet nagaan of de gegevens van deze meting nog bestaan: ${error.message}`)
  }
  const value = (data as { data_purged_at?: string | null } | null)?.data_purged_at
  return value ?? null
}

/**
 * Dezelfde vraag voor een lijst metingen in één query (dashboard, rapporten,
 * beheer). Geeft alleen de opgeschoonde metingen terug: id naar datum. Een
 * meting die ontbreekt in de uitkomst is niet opgeschoond.
 */
export async function loadDataPurgedAtByCampaign(
  supabase: SupabaseClient,
  campaignIds: readonly string[],
): Promise<Map<string, string>> {
  const purged = new Map<string, string>()
  const ids = [...new Set(campaignIds)]
  if (ids.length === 0) return purged
  const { data, error } = await supabase.from('campaigns').select('id, data_purged_at').in('id', ids)
  if (error) {
    if (isColumnMissing(error)) return purged
    throw new Error(`Kon niet nagaan of de gegevens van deze metingen nog bestaan: ${error.message}`)
  }
  for (const row of (data ?? []) as { id: string; data_purged_at: string | null }[]) {
    if (row.data_purged_at) purged.set(row.id, row.data_purged_at)
  }
  return purged
}

/** Dezelfde zin als de 410 van de backend (backend/data_retention.py, ReportDataPurged). */
export function dataPurgedMessage(purgedAtIso: string): string {
  const dag = formatDutchDate(purgedAtIso) ?? 'een onbekende datum'
  return `De gegevens van deze meting zijn op ${dag} verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.`
}
