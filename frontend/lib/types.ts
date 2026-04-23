// Verisight — gedeelde TypeScript types

export type ScanType = 'exit' | 'retention' | 'pulse' | 'team' | 'onboarding' | 'leadership'
export type RiskBand = 'HOOG' | 'MIDDEN' | 'LAAG'
export type CampaignAddOn = 'segment_deep_dive'
export type DeliveryMode = 'baseline' | 'live'
// Access roles only. These are not billable seats or plan licenses.
// owner  = Verisight-beheerder (volledige toegang)
// member = intern Verisight (zelfde rechten als owner)
// viewer = HR-klant in guided self-serve uitvoering (deelnemers aanleveren, uitnodigingen volgen, dashboard lezen)
export type MemberRole = 'owner' | 'member' | 'viewer'
export type Preventability = 'STERK_WERKSIGNAAL' | 'GEMENGD_WERKSIGNAAL' | 'BEPERKT_WERKSIGNAAL'
export const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  exit: 'ExitScan',
  retention: 'RetentieScan',
  pulse: 'Pulse',
  team: 'TeamScan',
  onboarding: 'Onboarding 30-60-90',
  leadership: 'Leadership Scan',
}

// Current tenant boundary and v1 customer account boundary.
// A separate billing account abstraction does not exist in runtime yet.
export interface Organization {
  id: string
  name: string
  slug: string
  contact_email: string
  is_active: boolean
  created_at: string
}

// Campaigns are operational fulfillment units.
// They are not subscriptions, seats, or standalone billing units.
export interface Campaign {
  id: string
  organization_id: string
  name: string
  scan_type: ScanType
  delivery_mode: DeliveryMode | null
  is_active: boolean
  enabled_modules: string[] | null
  created_at: string
  closed_at: string | null
}

export interface CampaignStats {
  campaign_id: string
  campaign_name: string
  scan_type: ScanType
  organization_id: string
  is_active: boolean
  created_at: string
  total_invited: number
  total_completed: number
  completion_rate_pct: number
  avg_risk_score: number | null
  avg_signal_score?: number | null
  band_high: number
  band_medium: number
  band_low: number
}

export interface Respondent {
  id: string
  campaign_id: string
  token: string
  email: string | null
  department: string | null
  role_level: string | null
  exit_month: string | null
  annual_salary_eur: number | null
  sent_at: string | null
  opened_at: string | null
  completed: boolean
  completed_at: string | null
}

export interface SurveyResponse {
  id: string
  respondent_id: string
  risk_score: number | null
  signal_score?: number | null
  risk_band: RiskBand | null
  preventability: Preventability | null
  exit_reason_code: string | null
  sdt_scores: Record<string, number>
  org_scores: Record<string, number>
  stay_intent_score?: number | null
  direction_signal_score?: number | null
  uwes_score?: number | null
  turnover_intention_score?: number | null
  open_text_raw?: string | null
  open_text_analysis?: string | null
  full_result: Record<string, unknown>
  submitted_at: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export interface OrgInvite {
  id: string
  org_id: string
  email: string
  full_name: string | null
  role: 'viewer' | 'member'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  organizations?: Pick<Organization, 'id' | 'name'>
}

// Scoring constanten (gespiegeld van Python backend)
export const FACTOR_LABELS: Record<string, string> = {
  leadership:   'Leiderschap',
  culture:      'Psychologische veiligheid & cultuurmatch',
  growth:       'Groeiperspectief',
  compensation: 'Beloning & voorwaarden',
  workload:     'Werkbelasting',
  role_clarity: 'Rolhelderheid',
  autonomy:     'Autonomie',
  competence:   'Competentie',
  relatedness:  'Verbondenheid',
}

export const RISK_COLORS: Record<RiskBand, string> = {
  HOOG:   '#DC2626',
  MIDDEN: '#F59E0B',
  LAAG:   '#16A34A',
}

export const EXIT_REASON_LABELS: Record<string, string> = {
  P1:  'Leiderschap / management',
  P2:  'Organisatiecultuur',
  P3:  'Gebrek aan groei',
  P4:  'Beloning',
  P5:  'Werkdruk / stress',
  P6:  'Rolonduidelijkheid',
  PL1: 'Beter aanbod elders',
  PL2: 'Carrièreswitch',
  PL3: 'Ondernemerschap',
  S1:  'Persoonlijke omstandigheid',
  S2:  'Verhuizing / partner',
  S3:  'Studie / pensioen',
}

export const REPORT_ADD_ON_LABELS: Record<CampaignAddOn, string> = {
  segment_deep_dive: 'Segment deep dive',
}

export const REPORT_ADD_ON_DESCRIPTIONS: Record<CampaignAddOn, string> = {
  segment_deep_dive:
    'Extra segmentanalyse in het rapport, met scherpere uitsplitsing naar afdeling, functieniveau en diensttijd. Werkt het best als department en role_level zijn aangeleverd.',
}

export function getCampaignAverageSignalScore(
  stats: Pick<CampaignStats, 'avg_signal_score' | 'avg_risk_score'>,
): number | null {
  return stats.avg_signal_score ?? stats.avg_risk_score ?? null
}

export function getResponseSignalScore(
  response: Pick<SurveyResponse, 'signal_score' | 'risk_score'>,
): number | null {
  return response.signal_score ?? response.risk_score ?? null
}

export function getResponseDirectionSignalScore(
  response: Pick<SurveyResponse, 'direction_signal_score' | 'stay_intent_score'>,
): number | null {
  return response.direction_signal_score ?? response.stay_intent_score ?? null
}

export function hasCampaignAddOn(
  campaign: Pick<Campaign, 'enabled_modules'> | null | undefined,
  addOn: CampaignAddOn,
) {
  return campaign?.enabled_modules?.includes(addOn) ?? false
}
