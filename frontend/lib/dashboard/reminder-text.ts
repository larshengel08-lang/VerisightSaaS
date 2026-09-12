import { buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import {
  buildReminderTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import type { CommsMode, DeliveryMode, ScanType } from '@/lib/types'

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
      return [
        'Er is nog geen surveylink beschikbaar voor deze meting.',
        '',
        'Loep kan de herinneringstekst pas klaarzetten zodra de link er is. Mail hallo@getloep.nl, dan zetten we dit recht.',
      ].join('\n')
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
