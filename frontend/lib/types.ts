// Verisight — gedeelde TypeScript types

export type ScanType = 'exit' | 'retention'
export type RiskBand = 'HOOG' | 'MIDDEN' | 'LAAG'
// owner  = Verisight-beheerder (volledige toegang)
// member = intern Verisight (zelfde rechten als owner)
// viewer = HR-klant (alleen lezen: dashboard + PDF)
export type MemberRole = 'owner' | 'member' | 'viewer'
export type Preventability = 'REDBAAR' | 'MOGELIJK_REDBAAR' | 'NIET_REDBAAR'

export interface Organization {
  id: string
  name: string
  slug: string
  contact_email: string
  api_key: string
  is_active: boolean
  created_at: string
}

export interface Campaign {
  id: string
  organization_id: string
  name: string
  scan_type: ScanType
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
  band_high: number
  band_medium: number
  band_low: number
}

export interface Respondent {
  id: string
  campaign_id: string
  token: string
  department: string | null
  role_level: string | null
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
  risk_band: RiskBand | null
  preventability: Preventability | null
  exit_reason_code: string | null
  sdt_scores: Record<string, number>
  org_scores: Record<string, number>
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

// Scoring constanten (gespiegeld van Python backend)
export const FACTOR_LABELS: Record<string, string> = {
  leadership:   'Leiderschap',
  culture:      'Cultuur & Veiligheid',
  growth:       'Groei & Ontwikkeling',
  compensation: 'Beloning',
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
