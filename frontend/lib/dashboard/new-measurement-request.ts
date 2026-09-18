import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'

/** Prijs van de vervolgmeting zoals publiek op /producten (beslissing 2026-07-09). */
export const NEW_MEASUREMENT_PRICE_LABEL = '€1.250 excl. btw'

/**
 * Mailto voor "nieuwe meting aanvragen" (spec 2026-09-16 par. 6.3): geen
 * formulier, geen tabel. Onderwerp en tekst zijn voorgevuld zodat Lars in één
 * oogopslag ziet wie wat wil; de klant vult scan, datum en aantal aan.
 * Fail Loud: zonder organisatienaam staat er zichtbaar "organisatie niet
 * bekend", nooit een naam die uit een maildomein geraden is.
 */
export function buildNewMeasurementMailto(organizationName: string | null | undefined): string {
  const org = organizationName?.trim() || 'organisatie niet bekend'
  const subject = `Nieuwe meting aanvragen: ${org}`
  const body = [
    'Hallo Loep,',
    '',
    `${org} wil een nieuwe meting. Kunnen jullie die klaarzetten?`,
    '',
    'Welke scan (Loep Behoud, Loep Vertrek of Loep Start): ',
    'Gewenste startdatum: ',
    'Aantal deelnemers, ongeveer: ',
    '',
    'Met vriendelijke groet,',
    '',
  ].join('\n')
  return `mailto:${LOEP_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
