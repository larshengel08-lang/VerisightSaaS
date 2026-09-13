/** Het enige publieke contactadres van Loep. */
export const LOEP_CONTACT_EMAIL = 'hallo@getloep.nl'

/**
 * Adres waarop de operator meeleest (spec 2026-09-11 par. 5), zodat Lars ziet
 * wanneer een klant een rapport heeft gekregen. Instelbaar via env voor het
 * geval dat ooit een apart postvak wordt.
 */
export function getOperatorEmail(): string {
  const configured = process.env.LOEP_OPERATOR_EMAIL?.trim()
  return configured && configured.length > 0 ? configured : LOEP_CONTACT_EMAIL
}
