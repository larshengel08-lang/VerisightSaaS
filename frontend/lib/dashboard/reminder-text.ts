import { buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import {
  buildReminderTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import type { CommsMode, DeliveryMode, ScanType } from '@/lib/types'

/**
 * Tekst die de klant ziet zolang er nog geen surveylink is (spec 2026-09-16
 * par. 4.4). Vastgelegd als module-constante zodat isReminderTextAvailable
 * 'm woordelijk kan herkennen, ongeacht wie buildReminderText aanroept.
 */
const REMINDER_TEXT_UNAVAILABLE = [
  'Er is nog geen surveylink beschikbaar voor deze meting.',
  '',
  'Loep kan de herinneringstekst pas klaarzetten zodra de link er is. Mail hallo@getloep.nl, dan zetten we dit recht.',
].join('\n')

export interface ReminderTextInput {
  commsMode: CommsMode | null | undefined
  scanType: ScanType
  scanLabel: string
  organizationName: string
  publicSurveyToken: string | null | undefined
  frontendBaseUrl: string
  segmentDepartments?: SegmentDepartmentStored[] | null
  deliveryMode: DeliveryMode | null | undefined
  launchDate: string | null
  participantCommsConfig: unknown
}

/**
 * Eén bron voor de herinneringstekst die de klant kopieert (spec 2026-09-11
 * par. 6). Bij self_send verstuurt de klant zelf, dus de tekst moet de
 * surveylink bevatten; de legacy managed-preview belooft juist dat Loep
 * verstuurt en blijft daarom alleen voor oude managed-campagnes.
 */
export function buildReminderText(input: ReminderTextInput): string {
  if (input.commsMode === 'self_send') {
    // Bij self_send mag de tekst NOOIT terugvallen op de managed-preview
    // hieronder: die belooft "Loep verzorgt de uitnodiging, verzending en
    // verwerking" en bevat geen surveylink, wat bij self_send niet waar is
    // (de klant verstuurt zelf). Zonder bruikbare token kan de echte
    // uitnodigingstekst niet gebouwd worden, dus geven we een zichtbaar
    // gedegradeerde tekst terug in plaats van een onbruikbare of misleidende.
    // Een token van alleen spaties is in JS waar, maar levert een kapotte
    // link op. Trimmen, zodat ook die vorm de gedegradeerde tekst krijgt.
    if (!input.publicSurveyToken?.trim()) {
      return REMINDER_TEXT_UNAVAILABLE
    }

    const departments = input.segmentDepartments ?? null
    const template = buildReminderTemplate({
      senderName: '',
      organizationName: input.organizationName,
      scanLabel: input.scanLabel,
      scanType: input.scanType,
      surveyLink: buildSurveyLink(input.frontendBaseUrl, input.publicSurveyToken),
      departmentLinks:
        departments && departments.length > 0
          ? buildSegmentSurveyLinks(input.frontendBaseUrl, input.publicSurveyToken, departments)
          : undefined,
    })
    return `${template.subject}\n\n${template.body}`
  }

  const preview = buildParticipantCommunicationPreview({
    scanType: input.scanType,
    deliveryMode: input.deliveryMode,
    launchDate: input.launchDate,
    participantCommsConfig: input.participantCommsConfig,
  })
  return `${preview.subject}\n\n${preview.body.join('\n\n')}`
}

/**
 * Inverse van de `subject\n\nbody`-vorm die buildReminderText teruggeeft, zodat
 * de herinneringskaart onderwerp en bericht apart kan tonen en kopiëren (spec
 * 2026-09-16 par. 4.4). Splitst op de eerste lege regel; zonder lege regel is
 * alles onderwerp. Let op: de gedegradeerde tekst (geen surveylink) bevat zelf
 * een lege regel en wordt dus ook gesplitst in een onderwerp en bericht die
 * geen van beide kloppen. Gebruik isReminderTextAvailable om die tekst te
 * herkennen voordat je dit aanroept.
 */
export function splitReminderText(text: string): { subject: string; body: string } {
  const firstBreak = text.indexOf('\n\n')
  if (firstBreak < 0) return { subject: text, body: '' }
  return { subject: text.slice(0, firstBreak), body: text.slice(firstBreak + 2) }
}

/**
 * True zodra buildReminderText een echte, kopieerbare herinnering teruggaf;
 * false voor de gedegradeerde tekst (geen surveylink). De herinneringskaart
 * gebruikt dit om de composer over te slaan in plaats van 'm te vullen met
 * een nep-onderwerp en -bericht (spec-review 2026-09-17).
 */
export function isReminderTextAvailable(text: string): boolean {
  return text !== REMINDER_TEXT_UNAVAILABLE
}
