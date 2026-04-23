import type { DeliveryMode, ScanType } from '@/lib/types'
import { SCAN_TYPE_LABELS } from '@/lib/types'

export const REMINDER_DELAY_PRESETS = [3, 5, 7] as const
export const REMINDER_MAX_COUNT_PRESETS = [1, 2, 3] as const

export type ReminderDelayPreset = (typeof REMINDER_DELAY_PRESETS)[number]
export type ReminderMaxCountPreset = (typeof REMINDER_MAX_COUNT_PRESETS)[number]

export interface ParticipantCommunicationConfig {
  senderName: string
  replyToEmail: string
  introContext: string
  closingContext: string
}

export interface ReminderConfig {
  enabled: boolean
  firstReminderAfterDays: ReminderDelayPreset
  maxReminderCount: ReminderMaxCountPreset
}

export interface LaunchControlStatusItem {
  key: 'launch_date' | 'participant_comms' | 'reminder_config' | 'launch_confirmation'
  label: string
  ready: boolean
}

export interface LaunchControlState {
  ready: boolean
  blockers: string[]
  statusItems: LaunchControlStatusItem[]
}

export interface ParticipantCommunicationPreview {
  subject: string
  senderName: string
  replyToEmail: string
  body: string[]
}

const MAX_CONTEXT_LENGTH = 180
const MAX_SENDER_NAME_LENGTH = 80
const MAX_REPLY_TO_LENGTH = 160
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidDateOnly(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime())
}

function normalizeContextLine(value: unknown) {
  return asTrimmedString(value).replace(/\s+/g, ' ')
}

export function createDefaultParticipantCommunicationConfig(): ParticipantCommunicationConfig {
  return {
    senderName: 'Verisight',
    replyToEmail: '',
    introContext: '',
    closingContext: '',
  }
}

export function createDefaultReminderConfig(): ReminderConfig {
  return {
    enabled: true,
    firstReminderAfterDays: 5,
    maxReminderCount: 2,
  }
}

export function normalizeParticipantCommunicationConfig(value: unknown): ParticipantCommunicationConfig {
  const config = (value ?? {}) as Partial<ParticipantCommunicationConfig>
  return {
    senderName: asTrimmedString(config.senderName) || 'Verisight',
    replyToEmail: asTrimmedString(config.replyToEmail),
    introContext: normalizeContextLine(config.introContext),
    closingContext: normalizeContextLine(config.closingContext),
  }
}

export function normalizeReminderConfig(value: unknown): ReminderConfig {
  const config = (value ?? {}) as Partial<ReminderConfig>
  return {
    enabled: config.enabled !== false,
    firstReminderAfterDays:
      REMINDER_DELAY_PRESETS.find((preset) => preset === config.firstReminderAfterDays) ?? 5,
    maxReminderCount:
      REMINDER_MAX_COUNT_PRESETS.find((preset) => preset === config.maxReminderCount) ?? 2,
  }
}

export function validateParticipantCommunicationConfig(value: unknown) {
  const config = normalizeParticipantCommunicationConfig(value)
  const errors: string[] = []

  if (config.senderName.length === 0 || config.senderName.length > MAX_SENDER_NAME_LENGTH) {
    errors.push('Afzendernaam moet tussen 1 en 80 tekens blijven.')
  }
  if (config.replyToEmail.length > MAX_REPLY_TO_LENGTH) {
    errors.push('Reply-to adres is te lang.')
  }
  if (config.replyToEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.replyToEmail)) {
    errors.push('Reply-to adres moet een geldig e-mailadres zijn.')
  }
  if (config.introContext.length > MAX_CONTEXT_LENGTH) {
    errors.push('Introcontext moet binnen 180 tekens blijven.')
  }
  if (config.closingContext.length > MAX_CONTEXT_LENGTH) {
    errors.push('Slotcontext moet binnen 180 tekens blijven.')
  }

  return errors
}

export function validateReminderConfig(value: unknown) {
  const config = value as Partial<ReminderConfig> | null | undefined
  const errors: string[] = []

  if (!config || typeof config.enabled !== 'boolean') {
    errors.push('Reminderinstellingen ontbreken of zijn ongeldig.')
    return errors
  }
  if (!REMINDER_DELAY_PRESETS.includes(config.firstReminderAfterDays as ReminderDelayPreset)) {
    errors.push('De eerste reminder moet een veilige preset gebruiken.')
  }
  if (!REMINDER_MAX_COUNT_PRESETS.includes(config.maxReminderCount as ReminderMaxCountPreset)) {
    errors.push('Het maximum aantal reminders moet een veilige preset gebruiken.')
  }

  return errors
}

export function buildLaunchControlState(args: {
  launchDate: string | null
  participantCommsConfig: unknown
  reminderConfig: unknown
  launchConfirmedAt: string | null
}): LaunchControlState {
  const participantCommsErrors = validateParticipantCommunicationConfig(args.participantCommsConfig)
  const reminderErrors = validateReminderConfig(args.reminderConfig)
  const blockers: string[] = []

  const launchDateReady = Boolean(args.launchDate && isValidDateOnly(args.launchDate))
  if (!launchDateReady) blockers.push('Formele startdatum ontbreekt nog.')
  if (participantCommsErrors.length > 0) blockers.push('Deelnemerscommunicatie is nog niet launch-klaar.')
  if (reminderErrors.length > 0) blockers.push('Reminderinstellingen zijn nog niet launch-klaar.')
  if (!args.launchConfirmedAt) blockers.push('Expliciete launchbevestiging ontbreekt nog.')

  return {
    ready: blockers.length === 0,
    blockers,
    statusItems: [
      { key: 'launch_date', label: 'Startdatum', ready: launchDateReady },
      { key: 'participant_comms', label: 'Communicatie-preview', ready: participantCommsErrors.length === 0 },
      { key: 'reminder_config', label: 'Reminderinstellingen', ready: reminderErrors.length === 0 },
      { key: 'launch_confirmation', label: 'Launchbevestiging', ready: Boolean(args.launchConfirmedAt) },
    ],
  }
}

export function formatLaunchDate(value: string | null) {
  if (!value || !isValidDateOnly(value)) return 'Nog niet gepland'
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'long',
    timeZone: 'Europe/Amsterdam',
  }).format(new Date(`${value}T00:00:00Z`))
}

function getDeliveryModePreviewLabel(mode: DeliveryMode | null | undefined) {
  return mode === 'live' ? 'live vervolgroute' : 'baseline'
}

export function buildParticipantCommunicationPreview(args: {
  scanType: ScanType
  deliveryMode: DeliveryMode | null | undefined
  launchDate: string | null
  participantCommsConfig: unknown
}): ParticipantCommunicationPreview {
  const config = normalizeParticipantCommunicationConfig(args.participantCommsConfig)
  const launchDateLabel = formatLaunchDate(args.launchDate)

  return {
    subject: `Uitnodiging voor de Verisight ${SCAN_TYPE_LABELS[args.scanType]}`,
    senderName: config.senderName,
    replyToEmail: config.replyToEmail,
    body: [
      'Beste collega,',
      ...(config.introContext ? [config.introContext] : []),
      `Op ${launchDateLabel} opent Verisight de ${SCAN_TYPE_LABELS[args.scanType]} als ${getDeliveryModePreviewLabel(args.deliveryMode)} voor deelnemers. Je ontvangt dan een persoonlijke uitnodiging om de vragenlijst in te vullen.`,
      'Verisight verzorgt de uitnodiging, verzending en verwerking binnen de campaigngrenzen. Jullie interne communicatie ondersteunt alleen timing, deelname en opvolging.',
      'De uitkomst wordt op groepsniveau gelezen. Gebruik interne aankondiging daarom alleen om deelname en planning helder te maken, niet om methodiek of productlogica te herschrijven.',
      ...(config.closingContext ? [config.closingContext] : []),
      'Groet,',
      config.senderName,
    ],
  }
}

export function buildReminderPreview(value: unknown) {
  const config = normalizeReminderConfig(value)
  if (!config.enabled) {
    return 'Reminders staan uit. Verisight verstuurt na launch geen automatische herinneringen in deze campaign.'
  }
  return `Verisight verstuurt de eerste reminder ${config.firstReminderAfterDays} dagen na launch en daarna maximaal ${config.maxReminderCount} reminder(s) zolang deelname uitblijft.`
}
