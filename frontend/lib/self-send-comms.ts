// Self-send mode — pure helpers. No e-mail addresses are stored server-side;
// these builders only produce copy-paste text and compute display values.

import { SURVEY_DURATION_LABEL } from '@/lib/campaign-setup'
import type { ScanType } from '@/lib/types'

export const MIN_INVITED_COUNT = 5

export interface SelfSendConfig {
  senderName: string
  endDate: string | null // YYYY-MM-DD
  inviteSubject: string
  inviteBody: string
  reminderSubject: string
  reminderBody: string
}

export type ReminderKind = 'relative' | 'absolute'

export interface SelfSendReminder {
  id: string
  kind: ReminderKind
  daysBeforeEnd: number | null
  date: string | null // YYYY-MM-DD (absolute, or resolved)
  notifiedAt: string | null
}

export interface EmailTemplate {
  subject: string
  body: string
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function trimStr(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function createDefaultSelfSendConfig(): SelfSendConfig {
  return {
    senderName: '',
    endDate: null,
    inviteSubject: '',
    inviteBody: '',
    reminderSubject: '',
    reminderBody: '',
  }
}

export function normalizeSelfSendConfig(value: unknown): SelfSendConfig {
  const c = (value ?? {}) as Partial<SelfSendConfig>
  const endDate = trimStr(c.endDate)
  return {
    senderName: trimStr(c.senderName),
    endDate: DATE_ONLY.test(endDate) ? endDate : null,
    inviteSubject: trimStr(c.inviteSubject),
    inviteBody: typeof c.inviteBody === 'string' ? c.inviteBody : '',
    reminderSubject: trimStr(c.reminderSubject),
    reminderBody: typeof c.reminderBody === 'string' ? c.reminderBody : '',
  }
}

export function validateInvitedCount(value: unknown): string[] {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n < MIN_INVITED_COUNT) {
    return [`Aantal uitgenodigde deelnemers moet minimaal ${MIN_INVITED_COUNT} zijn.`]
  }
  return []
}

export function computeResponseRatePct(completed: number, invitedCount: number | null): number | null {
  if (!invitedCount || invitedCount <= 0) return null
  return Math.min(100, Math.round((completed / invitedCount) * 100))
}

// Eerlijke degradatie (spec 2026-07-12 §6): zonder bekende noemer alleen het
// aantal, geen fake percentage.
export function formatDepartmentProgress(completed: number, invited?: number | null): string {
  if (!invited || invited <= 0) return `${completed} ingevuld`
  const pct = computeResponseRatePct(completed, invited)
  return `${completed} van ${invited} ingevuld (${pct}%)`
}

export function buildSurveyLink(frontendBaseUrl: string, publicSurveyToken: string): string {
  return `${frontendBaseUrl.replace(/\/+$/, '')}/survey/open/${publicSurveyToken}`
}

export interface SegmentDepartment {
  label: string
  slug: string
}

// Zelfde regels als backend/segments.py's _slugify (Python), maar zonder gedeeld
// codepad (Python-backend + TS-frontend). Bij aanpassing hier: ook daar bijwerken.
// Geëxporteerd zodat andere TS-callers (bijv. een live link-preview tijdens
// typen) deze niet opnieuw hoeven te implementeren — één TS-kopie i.p.v. twee.
export function slugify(label: string): string {
  return label
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Zelfde regels als backend/segments.py: lege labels en slug-botsingen weigeren.
export function buildSegmentDepartments(labels: string[]): SegmentDepartment[] {
  const out: SegmentDepartment[] = []
  const seen = new Set<string>()
  for (const raw of labels) {
    const label = (raw ?? '').trim()
    if (!label) throw new Error('Lege afdelingsnaam is niet toegestaan.')
    const slug = slugify(label)
    if (!slug) throw new Error(`Afdelingsnaam '${label}' levert geen bruikbare slug op.`)
    if (seen.has(slug)) throw new Error(`Dubbele afdeling (zelfde slug): '${label}'.`)
    seen.add(slug)
    out.push({ label, slug })
  }
  return out
}

export function buildSegmentSurveyLinks(
  frontendBaseUrl: string,
  publicSurveyToken: string,
  departments: SegmentDepartment[],
): Array<{ label: string; url: string }> {
  const base = buildSurveyLink(frontendBaseUrl, publicSurveyToken)
  return departments.map((d) => ({ label: d.label, url: `${base}?afd=${d.slug}` }))
}

export interface SegmentDepartmentInput {
  label: string
  invited_count: number
}

// Shape-uitbreiding (spec 2026-07-12): invited_count is optioneel op bestaande
// data (oude campagnes hebben alleen {label, slug}); nieuwe writes zetten hem altijd.
export interface SegmentDepartmentStored extends SegmentDepartment {
  invited_count?: number
}

export interface SegmentDepartmentsUpdate {
  departments: Array<{ label: string; slug: string; invited_count: number }>
  totalInvited: number
}

/**
 * Valideert een volledige nieuwe afdelingslijst tegen de vergrendelregels
 * (spec 2026-07-12 §3): toevoegen altijd; hernoemen/verwijderen alleen als
 * de afdeling niet vergrendeld is (lockedLabels = labels met >=1 respondent);
 * aantallen altijd aanpasbaar. Pure functie — de server action levert
 * lockedLabels uit de database en is de echte grens.
 */
export function prepareSegmentDepartmentsUpdate(
  existing: SegmentDepartmentStored[],
  incoming: SegmentDepartmentInput[],
  lockedLabels: Set<string>,
): SegmentDepartmentsUpdate {
  if (incoming.length < 2) throw new Error('Segmentrapportage vraagt minimaal 2 afdelingen.')
  for (const item of incoming) {
    if (!Number.isInteger(item.invited_count) || item.invited_count < 1) {
      throw new Error(`Vul een geldig aantal deelnemers in voor '${(item.label ?? '').trim() || '?'}' (minimaal 1).`)
    }
  }
  // Hergebruik de bestaande label/slug-validatie (leeg, duplicaat):
  const validated = buildSegmentDepartments(incoming.map((i) => i.label))
  const incomingLabels = new Set(validated.map((d) => d.label))
  // Vergrendelde afdelingen moeten ongewijzigd (zelfde label) terugkomen:
  for (const label of lockedLabels) {
    if (!incomingLabels.has(label)) {
      throw new Error(
        `Afdeling '${label}' heeft al responses en kan niet hernoemd of verwijderd worden.`,
      )
    }
  }
  // Koppel invited_count via label (niet index): buildSegmentDepartments gooit
  // vandaag bij lege/dubbele labels i.p.v. stil te filteren/herordenen, maar
  // een index-zip zou bij toekomstig ander gedrag stilzwijgend aantallen aan
  // de verkeerde afdeling toekennen. Label-lookup is even goedkoop en robuust.
  const invitedByLabel = new Map(incoming.map((i) => [i.label.trim(), i.invited_count]))
  const departments = validated.map((d) => ({
    ...d,
    invited_count: invitedByLabel.get(d.label)!,
  }))
  return {
    departments,
    totalInvited: departments.reduce((sum, d) => sum + d.invited_count, 0),
  }
}

export function normalizeSelfSendReminders(value: unknown): SelfSendReminder[] {
  if (!Array.isArray(value)) return []
  return value.map((raw, index) => {
    const r = (raw ?? {}) as Partial<SelfSendReminder>
    const kind: ReminderKind = r.kind === 'absolute' ? 'absolute' : 'relative'
    const date = trimStr(r.date)
    return {
      id: trimStr(r.id) || `reminder-${index}`,
      kind,
      daysBeforeEnd:
        kind === 'relative' && typeof r.daysBeforeEnd === 'number' ? r.daysBeforeEnd : kind === 'relative' ? 3 : null,
      date: kind === 'absolute' && DATE_ONLY.test(date) ? date : null,
      notifiedAt: trimStr(r.notifiedAt) || null,
    }
  })
}

function addDays(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function resolveReminderDate(reminder: SelfSendReminder, endDate: string | null): string | null {
  if (reminder.kind === 'absolute') {
    return reminder.date && DATE_ONLY.test(reminder.date) ? reminder.date : null
  }
  if (!endDate || !DATE_ONLY.test(endDate) || reminder.daysBeforeEnd == null) return null
  return addDays(endDate, -reminder.daysBeforeEnd)
}

export function getDueReminders(
  reminders: SelfSendReminder[],
  endDate: string | null,
  today: string,
): SelfSendReminder[] {
  return reminders.filter((reminder) => {
    if (reminder.notifiedAt) return false
    const resolved = resolveReminderDate(reminder, endDate)
    return resolved !== null && resolved <= today
  })
}

/**
 * Waarom deze scan de moeite waard is, in de stem van de organisatie. Stond
 * eerder alleen in de setup-wizard; hier staat hij één keer, zodat de
 * uitnodiging op het dashboard en in de wizard identiek zijn.
 */
export const SCAN_WHY: Partial<Record<ScanType, string>> = {
  retention: 'Jouw eerlijke inzicht helpt ons gericht te verbeteren wat jij en je collega\'s dagelijks ervaren.',
  exit: 'Jouw eerlijke inzicht helpt ons begrijpen wat er speelt bij vertrek, voor de mensen die blijven.',
  onboarding: 'Jouw ervaring helpt ons de eerste maanden beter vorm te geven voor nieuwe collega\'s.',
}

const DEFAULT_SCAN_WHY = 'Jouw inzicht helpt ons als organisatie verder.'

interface TemplateArgs {
  senderName: string
  organizationName: string
  scanLabel: string
  scanType: ScanType
  surveyLink: string
  /** Bij afdelingsrapportage: één link per afdeling in plaats van de algemene link. */
  departmentLinks?: Array<{ label: string; url: string }>
}

function buildLinkLines(args: TemplateArgs): string[] {
  const duration = SURVEY_DURATION_LABEL[args.scanType]
  if (args.departmentLinks && args.departmentLinks.length > 0) {
    return [
      `Gebruik de link van je eigen afdeling (invullen kost ${duration}):`,
      ...args.departmentLinks.map((link) => `${link.label}: ${link.url}`),
    ]
  }
  return [`Vul de vragenlijst hier in (${duration}): ${args.surveyLink}`]
}

export function buildInviteTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Uitnodiging: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}).`,
      '',
      SCAN_WHY[args.scanType] ?? DEFAULT_SCAN_WHY,
      '',
      'Je antwoorden worden alleen op groepsniveau gerapporteerd en zijn niet naar jou herleidbaar.',
      '',
      ...buildLinkLines(args),
      '',
      'Alvast bedankt voor je deelname.',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}

export function buildReminderTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Herinnering: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `Een korte herinnering: heb je de anonieme vragenlijst van ${args.organizationName} al ingevuld? Je antwoorden tellen alleen op groepsniveau mee.`,
      '',
      ...buildLinkLines(args),
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren, en bedankt.',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}
