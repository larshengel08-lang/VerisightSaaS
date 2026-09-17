/**
 * Datum zoals de klant hem leest: "21 september 2026". Accepteert YYYY-MM-DD
 * (kolom `campaigns.closes_at` is een date) en een volledige ISO-timestamp
 * (bijv. `closed_at`, auditevents). Null bij lege of onleesbare invoer, zodat
 * de aanroeper eerlijk "onbekend" kan tonen in plaats van een lege string.
 */
export function formatDutchDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam',
  }).format(date)
}
