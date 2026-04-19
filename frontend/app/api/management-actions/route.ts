import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type {
  ManagementActionSourceReadStage,
  ManagementActionSourceScopeType,
  ManagementActionStatus,
} from '@/lib/management-actions'
import type { ScanType } from '@/lib/types'

type CreateManagementActionBody = {
  organization_id?: string
  campaign_id?: string | null
  source_product?: ScanType
  source_scope_type?: ManagementActionSourceScopeType
  source_scope_key?: string | null
  source_scope_label?: string | null
  source_read_stage?: ManagementActionSourceReadStage
  source_factor_key?: string | null
  source_factor_label?: string | null
  source_signal_value?: number | null
  title?: string
  decision_context?: string | null
  expected_outcome?: string | null
  status?: ManagementActionStatus
  owner_label?: string | null
  owner_email?: string | null
  due_date?: string | null
  review_date?: string | null
}

const PRODUCTS: ScanType[] = ['exit', 'retention', 'pulse', 'team', 'onboarding', 'leadership', 'mto']
const SCOPE_TYPES: ManagementActionSourceScopeType[] = ['organization', 'department']
const READ_STAGES: ManagementActionSourceReadStage[] = [
  'mto_department_intelligence',
  'mto_closed_improvement_loop',
  'shared_contract_seed',
]
const STATUSES: ManagementActionStatus[] = ['open', 'assigned', 'in_progress', 'in_review', 'closed', 'follow_up_needed']

function cleanOptionalText(value: string | null | undefined) {
  if (typeof value !== 'string') return value ?? null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }) }
  }

  return { supabase, user, error: null }
}

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth.error || !auth.user) return auth.error

  const body = (await request.json().catch(() => null)) as CreateManagementActionBody | null
  if (!body?.organization_id || !body.title?.trim()) {
    return NextResponse.json({ detail: 'organization_id en title zijn verplicht.' }, { status: 400 })
  }

  if (!body.source_product || !PRODUCTS.includes(body.source_product)) {
    return NextResponse.json({ detail: 'Ongeldige source_product.' }, { status: 400 })
  }
  if (!body.source_scope_type || !SCOPE_TYPES.includes(body.source_scope_type)) {
    return NextResponse.json({ detail: 'Ongeldige source_scope_type.' }, { status: 400 })
  }
  if (!body.source_read_stage || !READ_STAGES.includes(body.source_read_stage)) {
    return NextResponse.json({ detail: 'Ongeldige source_read_stage.' }, { status: 400 })
  }
  if (!body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ detail: 'Ongeldige status.' }, { status: 400 })
  }

  const { error } = await auth.supabase.from('management_actions').insert({
    organization_id: body.organization_id,
    campaign_id: body.campaign_id ?? null,
    source_product: body.source_product,
    source_scope_type: body.source_scope_type,
    source_scope_key: cleanOptionalText(body.source_scope_key),
    source_scope_label: cleanOptionalText(body.source_scope_label),
    source_read_stage: body.source_read_stage,
    source_factor_key: cleanOptionalText(body.source_factor_key),
    source_factor_label: cleanOptionalText(body.source_factor_label),
    source_signal_value: typeof body.source_signal_value === 'number' ? body.source_signal_value : null,
    title: body.title.trim(),
    decision_context: cleanOptionalText(body.decision_context),
    expected_outcome: cleanOptionalText(body.expected_outcome),
    status: body.status,
    owner_label: cleanOptionalText(body.owner_label),
    owner_email: cleanOptionalText(body.owner_email),
    due_date: cleanOptionalText(body.due_date),
    review_date: cleanOptionalText(body.review_date),
    created_by: auth.user.id,
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Action-log entry aangemaakt.' }, { status: 201 })
}
