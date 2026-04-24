import type { Campaign } from '@/lib/types'

export const ROLE_LEVELS = [
  { value: '', label: '-- niet opgegeven --' },
  { value: 'uitvoerend', label: 'Uitvoerend' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'senior', label: 'Senior specialist' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'c_level', label: 'C-level' },
]

export type AddRespondentsMode = 'emails' | 'bulk' | 'upload'

export interface ImportIssue {
  row_number: number
  field: string
  message: string
}

export interface ImportPreviewRow {
  row_number: number
  email: string
  department: string | null
  role_level: string | null
  exit_month: string | null
  annual_salary_eur: number | null
}

export interface ImportResponse {
  dry_run: boolean
  total_rows: number
  valid_rows: number
  invalid_rows: number
  duplicate_existing: number
  recognized_columns: string[]
  ignored_columns: string[]
  blocking_messages: string[]
  preview_rows: ImportPreviewRow[]
  errors: ImportIssue[]
  imported: number
  emails_sent: number
  launch_blocked: boolean
  readiness_label: string
  recovery_hint: string
}

export function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map(email => email.trim().toLowerCase())
    .filter(email => email.includes('@'))
}

export function getDefaultCampaignId(campaigns: Campaign[]) {
  return campaigns.find(c => c.is_active)?.id ?? campaigns[0]?.id ?? ''
}
