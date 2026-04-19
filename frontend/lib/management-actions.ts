import type { MemberRole, ScanType } from '@/lib/types'

export type ManagementActionStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'in_review'
  | 'closed'
  | 'follow_up_needed'

export type ManagementActionSourceScopeType = 'organization' | 'department'

export type ManagementActionSourceReadStage =
  | 'mto_department_intelligence'
  | 'mto_closed_improvement_loop'
  | 'shared_contract_seed'

export interface ManagementActionDepartmentOwnerDefault {
  id?: string
  organization_id?: string
  department?: string
  owner_label: string | null
  owner_email: string | null
}

export interface ManagementActionRecord {
  id: string
  organization_id: string
  campaign_id: string | null
  source_product: ScanType
  source_scope_type: ManagementActionSourceScopeType
  source_scope_key: string | null
  source_scope_label: string | null
  source_read_stage: ManagementActionSourceReadStage
  source_factor_key: string | null
  source_factor_label: string | null
  source_signal_value: number | null
  source_question_key: string | null
  source_question_label: string | null
  title: string
  decision_context: string | null
  expected_outcome: string | null
  measured_outcome: string | null
  blocker_note: string | null
  last_review_outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed' | null
  status: ManagementActionStatus
  owner_label: string | null
  owner_email: string | null
  due_date: string | null
  review_date: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ManagementActionUpdateRecord {
  id: string
  action_id: string
  note: string
  status_snapshot: ManagementActionStatus | null
  created_by: string | null
  created_by_email: string | null
  created_at: string
}

export interface ManagementActionReviewRecord {
  id: string
  action_id: string
  summary: string
  outcome: 'continue' | 'close' | 'reopen' | 'follow_up_needed'
  next_review_date: string | null
  created_by: string | null
  created_at: string
}

export interface ManagementActionSummary {
  openCount: number
  reviewCount: number
  followUpCount: number
  overdueReviewCount: number
}

export interface ManagementActionCreationDraft {
  title?: string
  owner_label: string
  owner_email?: string
  review_date: string
  expected_outcome: string
}

export const MANAGEMENT_ACTION_STATUS_OPTIONS: Array<{ value: ManagementActionStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Toegewezen' },
  { value: 'in_progress', label: 'In uitvoering' },
  { value: 'in_review', label: 'In review' },
  { value: 'closed', label: 'Gesloten' },
  { value: 'follow_up_needed', label: 'Vervolg nodig' },
]

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null
}

export function getManagementActionStatusLabel(status: ManagementActionStatus) {
  return MANAGEMENT_ACTION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Open'
}

export function buildManagementActionTraceabilitySummary(action: Pick<
  ManagementActionRecord,
  'source_product' | 'source_scope_label' | 'source_factor_label'
>) {
  const productLabel = action.source_product.toUpperCase()
  const scopeLabel = action.source_scope_label ?? 'Onbekende scope'
  const factorLabel = action.source_factor_label ?? 'Onbekende factor'
  return `${productLabel} / ${scopeLabel} / ${factorLabel}`
}

export function validateManagementActionCreationDraft(draft: ManagementActionCreationDraft) {
  const errors: Partial<Record<'owner_label' | 'review_date' | 'expected_outcome', string>> = {}

  if (!draft.owner_label.trim()) {
    errors.owner_label = 'Kies eerst een eigenaar voor deze actie.'
  }
  if (!draft.review_date.trim()) {
    errors.review_date = 'Leg meteen een eerste reviewmoment vast.'
  }
  if (!draft.expected_outcome.trim()) {
    errors.expected_outcome = 'Maak expliciet wat de verwachte uitkomst is.'
  }

  return errors
}

export function canViewManagementAction(args: {
  orgRole: MemberRole | null | undefined
  userEmail: string | null | undefined
  action: Pick<ManagementActionRecord, 'owner_email'>
}) {
  if (args.orgRole === 'owner' || args.orgRole === 'member') return true
  if (args.orgRole !== 'viewer') return false
  return normalizeEmail(args.userEmail) === normalizeEmail(args.action.owner_email)
}

export function canEditManagementAction(args: {
  orgRole: MemberRole | null | undefined
  userEmail: string | null | undefined
  action: Pick<ManagementActionRecord, 'owner_email'>
}) {
  return canViewManagementAction(args)
}

export function buildManagementActionSeedFromDepartmentRead(args: {
  organizationId: string
  campaignId: string
  departmentRead: {
    segmentLabel: string
    factorKey: string
    factorLabel: string
    avgSignal: number
    decision: string
    handoffBody: string
    owner: string
  }
  ownerDefault?: ManagementActionDepartmentOwnerDefault | null
  question?: { key: string; label: string } | null
  guidedFields?: Partial<ManagementActionCreationDraft> | null
}): Omit<
  ManagementActionRecord,
  'id' | 'measured_outcome' | 'created_by' | 'updated_by' | 'created_at' | 'updated_at'
> {
  const ownerLabel =
    args.guidedFields?.owner_label?.trim() ||
    args.ownerDefault?.owner_label?.trim() ||
    args.departmentRead.owner
  const ownerEmail = args.guidedFields?.owner_email?.trim() || args.ownerDefault?.owner_email?.trim() || null
  const title =
    args.guidedFields?.title?.trim() ||
    `${args.departmentRead.segmentLabel}: ${args.departmentRead.factorLabel} vraagt een eerste bounded managementroute`
  const expectedOutcome =
    args.guidedFields?.expected_outcome?.trim() ||
    'Heldere prioriteit, expliciete eigenaar en eerste reviewmoment.'
  const reviewDate = args.guidedFields?.review_date?.trim() || null

  return {
    organization_id: args.organizationId,
    campaign_id: args.campaignId,
    source_product: 'mto',
    source_scope_type: 'department',
    source_scope_key: `department:${args.departmentRead.segmentLabel.toLowerCase()}`,
    source_scope_label: args.departmentRead.segmentLabel,
    source_read_stage: 'mto_department_intelligence',
    source_factor_key: args.departmentRead.factorKey,
    source_factor_label: args.departmentRead.factorLabel,
    source_signal_value: args.departmentRead.avgSignal,
    source_question_key: args.question?.key ?? null,
    source_question_label: args.question?.label ?? null,
    title,
    decision_context: `${args.departmentRead.decision} ${args.departmentRead.handoffBody}`.trim(),
    expected_outcome: expectedOutcome,
    blocker_note: null,
    last_review_outcome: null,
    status: ownerEmail ? 'assigned' : 'open',
    owner_label: ownerLabel,
    owner_email: ownerEmail,
    due_date: null,
    review_date: reviewDate,
  }
}

export function buildManagementActionSummary(actions: ManagementActionRecord[], todayIsoDate?: string): ManagementActionSummary {
  const today = todayIsoDate ?? new Date().toISOString().slice(0, 10)

  return {
    openCount: actions.filter((action) => action.status === 'open' || action.status === 'assigned' || action.status === 'in_progress').length,
    reviewCount: actions.filter((action) => action.status === 'in_review').length,
    followUpCount: actions.filter((action) => action.status === 'follow_up_needed').length,
    overdueReviewCount: actions.filter(
      (action) => action.review_date !== null && action.review_date < today && action.status !== 'closed',
    ).length,
  }
}
