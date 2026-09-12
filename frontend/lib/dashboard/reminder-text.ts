import { buildParticipantCommunicationPreview } from '@/lib/launch-controls'
import {
  buildReminderTemplate,
  buildSegmentSurveyLinks,
  buildSurveyLink,
  type SegmentDepartmentStored,
} from '@/lib/self-send-comms'
import type { DeliveryMode, ScanType } from '@/lib/types'

export interface ReminderTextInput {
  commsMode: string | null | undefined
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
  if (input.commsMode === 'self_send' && input.publicSurveyToken) {
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
