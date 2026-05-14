import {
  EXIT_REASON_LABELS,
  FACTOR_LABELS,
  type ScanType,
  type SurveyResponse,
} from '@/lib/types'

export type OpenAnswerItem = {
  id: string
  theme: string
  text: string
  submittedAt?: string
}

export type OpenAnswerTheme = {
  title: string
  count: number
  anchorId: string
}

export type OpenAnswerGroup = {
  title: string
  count: number
  anchorId: string
  answers: OpenAnswerItem[]
}

const MIN_OPEN_ANSWER_LENGTH = 24

function sanitizeOpenAnswerText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[verwijderd]')
    .replace(/https?:\/\/\S+/gi, '[link verwijderd]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[verwijderd]')
    .trim()
}

function inferExitTheme(code: string | null) {
  if (!code) return null
  return EXIT_REASON_LABELS[code] ?? null
}

function inferTopFactorTheme(orgScores: SurveyResponse['org_scores']) {
  const topFactor = Object.entries(orgScores ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .sort((left, right) => left[1] - right[1])[0]

  return topFactor ? (FACTOR_LABELS[topFactor[0]] ?? topFactor[0]) : null
}

function inferTheme(scanType: ScanType, response: SurveyResponse) {
  if (scanType === 'exit') {
    return inferExitTheme(response.exit_reason_code) ?? inferTopFactorTheme(response.org_scores) ?? 'Overig'
  }

  return inferTopFactorTheme(response.org_scores) ?? 'Overig'
}

function toAnchorId(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'overig'
}

export function buildOpenAnswerItems(scanType: ScanType, responses: SurveyResponse[]) {
  const seen = new Set<string>()
  const items: OpenAnswerItem[] = []

  for (const response of responses) {
    const rawText = response.open_text_raw?.trim() || response.open_text_analysis?.trim() || ''
    const text = sanitizeOpenAnswerText(rawText)

    if (text.length < MIN_OPEN_ANSWER_LENGTH) continue

    const normalized = text.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)

    items.push({
      id: response.id,
      theme: inferTheme(scanType, response),
      text,
      submittedAt: response.submitted_at,
    })
  }

  return items
}

export function buildOpenAnswersViewModel(items: OpenAnswerItem[]) {
  const grouped = new Map<string, OpenAnswerItem[]>()

  for (const item of items) {
    const key = item.theme.trim() || 'Overig'
    const bucket = grouped.get(key) ?? []
    bucket.push(item)
    grouped.set(key, bucket)
  }

  const groups = Array.from(grouped.entries())
    .map(([title, answers]) => ({
      title,
      count: answers.length,
      anchorId: toAnchorId(title),
      answers: [...answers].sort((left, right) =>
        (right.submittedAt ?? '').localeCompare(left.submittedAt ?? ''),
      ),
    }))
    .sort((left, right) => right.count - left.count || left.title.localeCompare(right.title, 'nl'))

  return {
    isEmpty: groups.length === 0,
    themes: groups.map(
      (group) =>
        ({
          title: group.title,
          count: group.count,
          anchorId: group.anchorId,
        }) satisfies OpenAnswerTheme,
    ),
    groups: groups.map((group) => ({ ...group })) satisfies OpenAnswerGroup[],
  }
}
