import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL } from '@/lib/response-activation'
import { EXTENSION_DAYS, MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'

/**
 * Copy van /help (spec 2026-09-16 par. 6.4), los van React zodat de tests
 * de tekst kunnen lezen. Gewone taal, je/jij, Loep als onderwerp; de
 * drempels komen uit dezelfde constanten als de wizard en het rapport.
 */
export const HELP_STEPS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: '1. Inrichten',
    body: 'Kies de startdatum, de sluitdatum en de herinneringsdag, en vul in hoeveel medewerkers je uitnodigt. Loep zet de uitnodigingstekst en de link voor je klaar. Tot je op "Ja, verstuurd" klikt kun je alles nog aanpassen.',
  },
  {
    title: '2. Uitnodigen en herinneren',
    body: 'Je verstuurt de uitnodiging zelf vanuit je eigen mail. Loep mailt je medewerkers niet en slaat geen mailadressen van ze op. Heb je een herinneringsdag gekozen, dan staat op die dag de herinneringstekst klaar op je overzicht; ook die verstuur je zelf.',
  },
  {
    title: '3. Sluiten en rapport',
    body: `Na de sluitdatum kan niemand meer invullen. Op je overzicht sluit je de meting, of je verlengt met ${EXTENSION_DAYS} dagen (maximaal ${MAX_EXTENSIONS} keer). Zodra de meting gesloten is met minimaal ${MIN_INVITED_TOTAL} ingevulde vragenlijsten, staat het rapport direct klaar als PDF.`,
  },
]

export const HELP_THRESHOLDS = {
  total: MIN_INVITED_TOTAL,
  perDepartment: MIN_INVITED_PER_DEPARTMENT,
  why: `Loep rapporteert alleen op groepsniveau. Onder ${MIN_INVITED_TOTAL} ingevulde vragenlijsten is een patroon niet te onderscheiden van toeval; dan maakt Loep geen rapport. Een afdeling met minder dan ${MIN_INVITED_PER_DEPARTMENT} ingevulde vragenlijsten krijgt geen eigen regel, omdat een antwoord dan herleidbaar kan zijn. Samen vormen die afdelingen de regel "Overige afdelingen", als ze met elkaar op ${MIN_INVITED_PER_DEPARTMENT} komen. Hebben minder dan twee afdelingen er ${MIN_INVITED_PER_DEPARTMENT}, dan laat Loep de uitsplitsing per afdeling weg. Alle antwoorden tellen wel mee in het beeld van de hele organisatie.`,
}

export const HELP_ROLES = {
  you: [
    'De meting inrichten: datums, aantal deelnemers, afdelingen.',
    'De uitnodiging en de herinnering versturen vanuit je eigen mail.',
    'De meting sluiten of verlengen, en het rapport downloaden.',
    'Het gesprek met je managementteam voeren; het rapport is daarvoor het script.',
  ],
  loep: [
    'Je organisatie en je meting aanmaken na de intake.',
    'De vragenlijst, de uitnodigingstekst en de herinneringstekst klaarzetten.',
    'Antwoorden verwerken tot een rapport op groepsniveau, nooit per persoon, en je mailen zodra het klaarstaat.',
    'Vragen beantwoorden en een nieuwe meting klaarzetten als je die aanvraagt.',
  ],
}

export const HELP_CONTACT = {
  email: LOEP_CONTACT_EMAIL,
  promise: 'Loep reageert binnen één werkdag.',
}
