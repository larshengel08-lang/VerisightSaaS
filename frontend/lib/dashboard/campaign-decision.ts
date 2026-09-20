/**
 * Het besluit van het MT bij een meting (plan 3b, spec 2026-09-16 par. 7).
 * Pure module: vorm, normalisatie, validatie en de vertaling van en naar een
 * rij van `campaign_decisions`. Bevat alleen wat het MT zelf invult; er is geen
 * koppeling met antwoorden of respondenten.
 */

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

function dateOrNull(value: unknown): string | null {
  const trimmed = text(value)
  return trimmed.length > 0 ? trimmed : null
}

/** Alleen de bekende velden, getrimd; een lege datum wordt null. */
export function normalizeDecisionInput(raw: Record<string, unknown>): CampaignDecisionInput {
  return {
    decidedAt: dateOrNull(raw.decidedAt),
    primaryTopic: text(raw.primaryTopic),
    primaryAction: text(raw.primaryAction),
    owner: text(raw.owner),
    followUpDate: dateOrNull(raw.followUpDate),
    secondaryTopic: text(raw.secondaryTopic),
    secondaryAction: text(raw.secondaryAction),
    feedbackPlan: text(raw.feedbackPlan),
    successCriterion: text(raw.successCriterion),
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

/** Null als het besluit opgeslagen mag worden, anders één melding voor de klant. */
export function validateDecisionInput(input: CampaignDecisionInput): string | null {
  if (!input.primaryTopic) return 'Vul in over welk onderwerp het besluit gaat.'
  if (!input.primaryAction) return 'Vul in wat jullie precies gaan doen. Een onderwerp is nog geen afspraak.'
  if (!input.owner) return 'Vul in wie eigenaar is van dit besluit.'
  if (input.secondaryAction && !input.secondaryTopic) return 'Vul bij het tweede punt ook het onderwerp in.'
  for (const field of TEXT_FIELDS) {
    const { label, max } = FIELD_LABELS[field]
    if (input[field].length > max) return `${label} is te lang (maximaal ${max} tekens).`
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
