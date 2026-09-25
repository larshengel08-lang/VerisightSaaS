/**
 * Het besluit van het MT bij een meting (plan 3b, spec 2026-09-16 par. 7).
 * Pure module: vorm, normalisatie, validatie en de vertaling van en naar een
 * rij van `campaign_decisions`. Bevat alleen wat het MT zelf invult; er is geen
 * koppeling met antwoorden of respondenten.
 */

import type { ScanType } from '@/lib/types'

export interface CampaignDecisionInput {
  decidedAt: string | null
  primaryTopic: string
  primaryAction: string
  owner: string
  followUpDate: string | null
  secondaryTopic: string
  secondaryAction: string
  feedbackPlan: string
  successCriterion: string
}

export interface CampaignDecision extends CampaignDecisionInput {
  updatedAt: string | null
}

export const DECISION_LIMITS = { topic: 120, owner: 120, action: 600, text: 600 } as const

// Labels en hints van het blok "Besluit vastleggen". Dezelfde tekst als op de
// besluitpagina van het rapport (fixronde 24-9, R4, R8, V4): BESLUIT_SLOTLABEL,
// BESLUIT_PARKEERREGEL, BESLUIT_DATUM_HINT, BESLUIT_TERUGKOPPELING en
// BESLUIT_REVIEW_HINT in backend/report_html.py.
// tests/test_report_leesronde_fixes.py leest dit bestand en houdt ze gelijk.
export const DECISION_SUCCESS_LABEL = 'Waaraan zien we bij het startpunt dat het werkt'
export const DECISION_SECOND_POINT_HINT =
  'Spreken jullie hier vandaag iets over af, schrijf dan bij ‘Wat precies’ ook wie het oppakt. Anders parkeren jullie dit punt: de eigenaar van het startpunt zet het op de agenda van het vervolgmoment.'
export const DECISION_FOLLOW_UP_DATE_HINT = 'Kies een datum, geen termijn.'

const DECISION_FEEDBACK_HINTS: Partial<Record<ScanType, string>> = {
  retention:
    'Deel het startpunt, het beeld van de hele organisatie en wat het MT besluit. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
  exit: 'Wie invulde, is vertrokken: koppel terug aan wie er nu werkt, over wat het MT met de vertrekredenen doet. Deel geen open antwoorden en geen uitkomsten van afdelingen met minder dan 10 antwoorden.',
  onboarding: 'Je mensen vulden in; ze horen wat het MT ermee doet.',
}

const DECISION_REVIEW_HINTS: Partial<Record<ScanType, string>> = {
  retention: 'Richtlijn: 45 tot 90 dagen na dit gesprek.',
  exit: 'Richtlijn: 45 tot 90 dagen na dit gesprek.',
  onboarding: 'Richtlijn: rond het volgende checkpoint.',
}

function hintForScan(hints: Partial<Record<ScanType, string>>, scanType: string | null | undefined): string | null {
  if (!scanType || !Object.prototype.hasOwnProperty.call(hints, scanType)) return null
  return hints[scanType as ScanType] ?? null
}

/**
 * De terugkoppelhint van de besluitpagina voor dit scantype. Alleen Loep
 * Behoud, Loep Vertrek en Loep Start hebben een besluitpagina; voor elk ander
 * of ontbrekend scantype geen hint, nooit de tekst van een andere scan.
 */
export function decisionFeedbackHintFor(scanType: string | null | undefined): string | null {
  return hintForScan(DECISION_FEEDBACK_HINTS, scanType)
}

/**
 * De hint bij "Datum vervolgmoment": de datumregel geldt altijd, de richtlijn
 * alleen voor een scan met een besluitpagina (zelfde regel als de
 * terugkoppelhint), nooit de richtlijn van een andere scan.
 */
export function decisionFollowUpHintFor(scanType: string | null | undefined): string {
  const review = hintForScan(DECISION_REVIEW_HINTS, scanType)
  return review ? DECISION_FOLLOW_UP_DATE_HINT + ' ' + review : DECISION_FOLLOW_UP_DATE_HINT
}

const TEXT_FIELDS = [
  'primaryTopic',
  'primaryAction',
  'owner',
  'secondaryTopic',
  'secondaryAction',
  'feedbackPlan',
  'successCriterion',
] as const

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Leest een veld als tekst zonder te trimmen; niet-string wordt ''. Voor
 * gebruik ná normalisatie, waar de waarde al getrimd is en trimmen dus geen
 * verschil maakt, maar een ontbrekend veld (`undefined`) niet mag crashen. */
function fieldText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function dateOrNull(value: unknown): string | null {
  const trimmed = text(value)
  return trimmed.length > 0 ? trimmed : null
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Alleen de bekende velden, getrimd; een lege datum wordt null.
 * Dit is de saneringslaag voor onbetrouwbare formulierinvoer: `null`,
 * `undefined`, een array of een primitieve waarde worden behandeld als een
 * leeg object (dus elk veld wordt de lege waarde) in plaats van te crashen.
 */
export function normalizeDecisionInput(raw: unknown): CampaignDecisionInput {
  const source = isPlainObject(raw) ? raw : {}
  return {
    decidedAt: dateOrNull(source.decidedAt),
    primaryTopic: text(source.primaryTopic),
    primaryAction: text(source.primaryAction),
    owner: text(source.owner),
    followUpDate: dateOrNull(source.followUpDate),
    secondaryTopic: text(source.secondaryTopic),
    secondaryAction: text(source.secondaryAction),
    feedbackPlan: text(source.feedbackPlan),
    successCriterion: text(source.successCriterion),
  }
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const FIELD_LABELS: Record<(typeof TEXT_FIELDS)[number], { label: string; max: number }> = {
  primaryTopic: { label: 'Het onderwerp', max: DECISION_LIMITS.topic },
  primaryAction: { label: 'Wat precies', max: DECISION_LIMITS.action },
  owner: { label: 'De eigenaar', max: DECISION_LIMITS.owner },
  secondaryTopic: { label: 'Het tweede onderwerp', max: DECISION_LIMITS.topic },
  secondaryAction: { label: 'Wat precies bij het tweede punt', max: DECISION_LIMITS.action },
  feedbackPlan: { label: 'De terugkoppeling', max: DECISION_LIMITS.text },
  successCriterion: { label: 'Waaraan jullie zien dat het werkt', max: DECISION_LIMITS.text },
}

/**
 * Null als het besluit opgeslagen mag worden, anders één melding voor de klant.
 *
 * Preconditie: deze functie hoort alleen te draaien op de uitvoer van
 * `normalizeDecisionInput`. Een veld dat alleen witruimte bevat ("   ") wordt
 * pas door de normalisatie tot een lege string getrimd; ongenormaliseerde
 * invoer kan zo'n veld dus ten onrechte als ingevuld beoordelen. Taak 11 (de
 * server action) moet daarom altijd eerst normaliseren en pas daarna
 * valideren. Deze functie verdedigt zich wél tegen een ontbrekend optioneel
 * veld (`undefined`): dat geeft nooit een crash, alleen een nette melding of
 * een geslaagde validatie.
 */
export function validateDecisionInput(input: CampaignDecisionInput): string | null {
  if (!input.primaryTopic) return 'Vul in over welk onderwerp het besluit gaat.'
  if (!input.primaryAction) return 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'
  if (!input.owner) return 'Vul in wie eigenaar is van dit besluit.'
  if (input.secondaryAction && !input.secondaryTopic) return 'Vul bij het tweede punt ook het onderwerp in.'
  for (const field of TEXT_FIELDS) {
    const { label, max } = FIELD_LABELS[field]
    if (fieldText(input[field]).length > max) return `${label} is te lang (maximaal ${max} tekens).`
  }
  if (input.decidedAt && !isRealDate(input.decidedAt)) return 'De datum van het gesprek is geen geldige datum.'
  if (input.followUpDate && !isRealDate(input.followUpDate)) {
    return 'De datum van het vervolgmoment is geen geldige datum.'
  }
  if (input.decidedAt && input.followUpDate && input.followUpDate < input.decidedAt) {
    return 'Het vervolgmoment ligt voor de datum van het gesprek.'
  }
  return null
}

/** Rij voor de upsert. `updated_at` ontbreekt bewust: de databasetrigger zet die. */
export function decisionToRow(
  input: CampaignDecisionInput,
  ids: { campaignId: string; organizationId: string; userId: string },
): Record<string, string | null> {
  return {
    campaign_id: ids.campaignId,
    organization_id: ids.organizationId,
    recorded_by: ids.userId,
    decided_at: input.decidedAt,
    primary_topic: input.primaryTopic,
    primary_action: input.primaryAction,
    owner: input.owner,
    follow_up_date: input.followUpDate,
    secondary_topic: input.secondaryTopic,
    secondary_action: input.secondaryAction,
    feedback_plan: input.feedbackPlan,
    success_criterion: input.successCriterion,
  }
}

export function decisionFromRow(row: Record<string, unknown> | null | undefined): CampaignDecision | null {
  if (!row) return null
  return {
    decidedAt: dateOrNull(row.decided_at),
    primaryTopic: text(row.primary_topic),
    primaryAction: text(row.primary_action),
    owner: text(row.owner),
    followUpDate: dateOrNull(row.follow_up_date),
    secondaryTopic: text(row.secondary_topic),
    secondaryAction: text(row.secondary_action),
    feedbackPlan: text(row.feedback_plan),
    successCriterion: text(row.success_criterion),
    updatedAt: dateOrNull(row.updated_at),
  }
}
