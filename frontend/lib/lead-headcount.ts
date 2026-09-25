/**
 * Schatting van de organisatiegrootte uit het omvangvak van een lead: het eerste
 * getal, met een duizendtalpunt gelezen als duizendtal ("Boven 1.000" is 1000,
 * niet 1). Oude leads ("100 - 200 medewerkers") geven hetzelfde als voorheen.
 * Alleen voor een interne schatting (beheer/klantlearnings); nooit voor een prijs.
 */
export function estimateHeadcount(value: string | null | undefined): number {
  const match = value?.match(/\d{1,3}(?:\.\d{3})+|\d+/)
  return match ? Number.parseInt(match[0].replace(/\./g, ''), 10) : 0
}
