// Self-send mode — pure helpers. No e-mail addresses are stored server-side;
// these builders only produce copy-paste text and compute display values.

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

export function buildSurveyLink(frontendBaseUrl: string, publicSurveyToken: string): string {
  return `${frontendBaseUrl.replace(/\/+$/, '')}/survey/open/${publicSurveyToken}`
}

export interface SegmentDepartment {
  label: string
  slug: string
}

// Zelfde regels als backend/segments.py's _slugify (Python), maar zonder gedeeld
// codepad (Python-backend + TS-frontend). Bij aanpassing hier: ook daar bijwerken.
function slugify(label: string): string {
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

interface TemplateArgs {
  senderName: string
  organizationName: string
  scanLabel: string
  surveyLink: string
}

export function buildInviteTemplate(args: TemplateArgs): EmailTemplate {
  const sender = args.senderName || 'HR'
  return {
    subject: `Uitnodiging: korte vragenlijst - ${args.organizationName}`,
    body: [
      'Beste collega,',
      '',
      `${args.organizationName} houdt een korte, anonieme vragenlijst (${args.scanLabel}). Je antwoorden worden alleen op groepsniveau gerapporteerd en zijn niet naar jou herleidbaar.`,
      '',
      `Vul de vragenlijst hier in (10–15 minuten): ${args.surveyLink}`,
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
      'Een korte herinnering: heb je de anonieme vragenlijst al ingevuld? Het kost ongeveer 10–15 minuten en je antwoorden tellen alleen op groepsniveau mee.',
      '',
      `Vul de vragenlijst hier in: ${args.surveyLink}`,
      '',
      'Heb je hem al ingevuld? Dan kun je deze mail negeren — dank je wel!',
      '',
      'Met vriendelijke groet,',
      sender,
    ].join('\n'),
  }
}
