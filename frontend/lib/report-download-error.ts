import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

const MAX_TECHNICAL_DETAIL_LENGTH = 300

/**
 * De rapportproxy (app/api/campaigns/[id]/report/route.ts) geeft bij een
 * mislukte download de ruwe body van de backend of van Railway zelf door als
 * JSON `{ detail: string }`. Die ruwe body kan zijn:
 * - een geneste JSON-string van FastAPI (`{"detail":"..."}` als tekst),
 * - een hele HTML-foutpagina (Railway 502/504),
 * - gewone platte tekst.
 * Deze pure functie zet dat om in iets dat een klant/Loep-medewerker kan
 * lezen, zonder ooit ruwe HTML te tonen (Fail Loud, geen stille fallback).
 */
export function summarizeTechnicalDetail(detail: unknown): string | null {
  const value = unwrapDetail(detail)
  if (value === null) return null

  if (looksLikeHtml(value)) {
    return 'Serverfoutpagina ontvangen in plaats van een foutmelding.'
  }

  if (value.length > MAX_TECHNICAL_DETAIL_LENGTH) {
    return `${value.slice(0, MAX_TECHNICAL_DETAIL_LENGTH)}...`
  }

  return value
}

/**
 * De tekst uit de ruwe body: de geneste FastAPI-`detail` als die er is, anders
 * de tekst zelf. Null bij lege of niet-tekst invoer.
 */
function unwrapDetail(detail: unknown): string | null {
  if (typeof detail !== 'string') return null

  const trimmed = detail.trim()
  if (!trimmed) return null
  if (looksLikeHtml(trimmed)) return trimmed

  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'detail' in parsed &&
      typeof (parsed as { detail?: unknown }).detail === 'string' &&
      (parsed as { detail: string }).detail.trim()
    ) {
      return (parsed as { detail: string }).detail.trim()
    }
  } catch {
    // Geen geldige JSON: gebruik de tekst zoals die is.
  }

  return trimmed
}

/** Begin van de 410-melding van de backend (backend/data_retention.py, ReportDataPurged). */
const PURGED_DETAIL_PREFIX = 'De gegevens van deze meting zijn op '

/**
 * Bij een 410 na de opschoning noemt de backendmelding de datum van
 * verwijdering. Die zin is dan de beste hoofdmelding; een aparte technische
 * regel zou hem alleen herhalen. Null als het geen herkende 410-melding is:
 * dan blijven downloadErrorMessage plus de technische melding gelden. Een
 * onverwacht lange tekst telt ook niet als herkend (de echte zin is kort).
 */
export function purgedDownloadMessage(status: number, detail: unknown): string | null {
  if (status !== 410) return null
  const value = unwrapDetail(detail)
  if (value === null || !value.startsWith(PURGED_DETAIL_PREFIX)) return null
  if (value.length > MAX_TECHNICAL_DETAIL_LENGTH) return null
  return value
}

function looksLikeHtml(value: string): boolean {
  return /^\s*</.test(value)
}

/**
 * Statusgebonden Nederlandse hoofdmelding voor een mislukte rapportdownload.
 * De technische melding (summarizeTechnicalDetail) blijft daarnaast altijd
 * zichtbaar; deze functie bepaalt alleen de zin die uitlegt wat de klant kan
 * doen.
 */
export function downloadErrorMessage(status: number): string {
  if (status === 401) {
    return 'Je sessie is verlopen. Log opnieuw in en probeer het nog eens.'
  }

  if (status === 403 || status === 404) {
    return `Je hebt geen toegang tot dit rapport met dit account. Mail ${LOEP_CONTACT_EMAIL} als dit niet klopt.`
  }

  // 410: de gegevens van de meting zijn na de bewaartermijn (of op verzoek)
  // verwijderd. Opnieuw proberen helpt dan nooit; zelfde strekking als de
  // backendmelding (backend/data_retention.py, ReportDataPurged). De datum
  // staat in de technische melding die de knop daarnaast toont.
  if (status === 410) {
    return 'De gegevens van deze meting zijn verwijderd, volgens de bewaartermijn of op verzoek van jullie organisatie. Een nieuw rapport maken kan daarom niet meer. Een rapport dat eerder is gedownload, blijft geldig.'
  }

  return `Het rapport kon niet worden opgehaald (fout ${status}). Probeer het later opnieuw of mail ${LOEP_CONTACT_EMAIL}.`
}
