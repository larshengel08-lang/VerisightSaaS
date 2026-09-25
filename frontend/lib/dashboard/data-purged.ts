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
 * Alleen 42703 ("column does not exist", door PostgREST doorgegeven bij een
 * select op een onbekende kolom) waarvan de melding precies data_purged_at noemt, telt
 * als "kolom ontbreekt". Een 42703 over een andere kolom (tikfout, hernoeming)
 * valt luid om: anders ziet elke opgeschoonde meting er stil weer normaal uit.
 */
const COLUMN_NAMED = /\bdata_purged_at\b/

type QueryError = { code?: string; message: string }

function isPurgedColumnMissing(error: QueryError): boolean {
  return error.code === '42703' && COLUMN_NAMED.test(error.message)
}

/** Wanneer de gegevens van één meting zijn verwijderd, of null. */
export async function loadDataPurgedAt(supabase: SupabaseClient, campaignId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('data_purged_at')
    .eq('id', campaignId)
    .maybeSingle()
  if (error) {
    if (isPurgedColumnMissing(error)) return null
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
  // Alleen de opgeschoonde rijen terug: kleinere payload, en de PostgREST-
  // rijlimiet telt dan alleen metingen die er echt toe doen.
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, data_purged_at')
    .in('id', ids)
    .not('data_purged_at', 'is', null)
  if (error) {
    if (isPurgedColumnMissing(error)) return purged
    throw new Error(`Kon niet nagaan of de gegevens van deze metingen nog bestaan: ${error.message}`)
  }
  for (const row of (data ?? []) as { id: string; data_purged_at: string | null }[]) {
    if (row.data_purged_at) purged.set(row.id, row.data_purged_at)
  }
  return purged
}

/**
 * Dezelfde map uit rijen die al geladen zijn met select('*') op campaigns. Na
 * de migratie zit data_purged_at daarin; ervoor ontbreekt het veld (undefined)
 * en kan er ook niets zijn opgeschoond. Zo is geen extra query nodig.
 */
export function purgedAtFromRows(
  rows: ReadonlyArray<{ id: string; data_purged_at?: string | null }>,
): Map<string, string> {
  const purged = new Map<string, string>()
  for (const row of rows) if (row.data_purged_at) purged.set(row.id, row.data_purged_at)
  return purged
}

/** Tweede helft van de 410-zin: wat de opschoning betekent voor het rapport. */
const PURGED_REPORT_TAIL = 'Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.'

/**
 * Eerste zin van de 410-melding: wanneer en waarom de gegevens weg zijn. Een
 * pariteitstest (tests/test_data_retention_api.py) vergelijkt deze zin plus
 * PURGED_REPORT_TAIL met ReportDataPurged in backend/data_retention.py.
 */
export function dataPurgedReason(purgedAtIso: string): string {
  const dag = formatDutchDate(purgedAtIso) ?? 'een onbekende datum'
  return `De gegevens van deze meting zijn op ${dag} verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie.`
}

/** Dezelfde zin als de 410 van de backend (backend/data_retention.py, ReportDataPurged). */
export function dataPurgedMessage(purgedAtIso: string): string {
  return `${dataPurgedReason(purgedAtIso)} ${PURGED_REPORT_TAIL}`
}

/** Korte status voor lijsten en tabellen: "Gegevens verwijderd op 16 juni 2028". */
export function dataPurgedLabel(purgedAtIso: string): string {
  return `Gegevens verwijderd op ${formatDutchDate(purgedAtIso) ?? 'een onbekende datum'}`
}

/**
 * Weigering bij het vastleggen van een besluit: na de opschoning zijn eigenaar
 * en vrije tekst van het besluit bewust leeggemaakt, dus opnieuw schrijven zou
 * die persoonsgegevens na de bewaartermijn terugzetten.
 */
export function dataPurgedDecisionMessage(purgedAtIso: string): string {
  return `${dataPurgedReason(purgedAtIso)} Een besluit vastleggen kan daarom niet meer.`
}
