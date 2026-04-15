import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CASE_APPROVAL_STATUS_OPTIONS,
  CASE_EVIDENCE_CLOSURE_OPTIONS,
  CASE_OUTCOME_CLASS_OPTIONS,
  CASE_OUTCOME_QUALITY_OPTIONS,
  CASE_PERMISSION_STATUS_OPTIONS,
  CASE_POTENTIAL_OPTIONS,
  createDefaultLearningCheckpoints,
} from '@/lib/pilot-learning'

type CreateLearningDossierBody = {
  organization_id?: string | null
  campaign_id?: string | null
  contact_request_id?: string | null
  title?: string
  route_interest?: 'exitscan' | 'retentiescan' | 'combinatie' | 'nog-onzeker'
  buyer_question?: string | null
  expected_first_value?: string | null
  buying_reason?: string | null
  trust_friction?: string | null
  implementation_risk?: string | null
  first_management_value?: string | null
  first_action_taken?: string | null
  review_moment?: string | null
  case_evidence_closure_status?: 'lesson_only' | 'internal_proof_only' | 'sales_usable' | 'public_usable' | 'rejected'
  case_approval_status?: 'draft' | 'internal_review' | 'claim_check' | 'customer_permission' | 'approved'
  case_permission_status?: 'not_requested' | 'internal_only' | 'anonymous_case_only' | 'named_quote_allowed' | 'named_case_allowed' | 'reference_only' | 'declined'
  case_quote_potential?: 'laag' | 'middel' | 'hoog'
  case_reference_potential?: 'laag' | 'middel' | 'hoog'
  case_outcome_quality?: 'nog_onvoldoende' | 'indicatief' | 'stevig'
  case_outcome_classes?: Array<'kwalitatieve_les' | 'operationele_uitkomst' | 'management_adoptie' | 'herhaalgebruik' | 'kwantitatieve_uitkomst'>
  claimable_observations?: string | null
  supporting_artifacts?: string | null
  case_public_summary?: string | null
  lead_contact_name?: string | null
  lead_organization_name?: string | null
  lead_work_email?: string | null
  lead_employee_count?: string | null
}

function cleanOptionalText(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return value ?? null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function requireVerisightAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_verisight_admin !== true) {
    return {
      supabase,
      user: null,
      error: NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen learningdossiers beheren.' }, { status: 403 }),
    }
  }

  return { supabase, user, error: null }
}

export async function POST(request: Request) {
  const admin = await requireVerisightAdmin()
  if (admin.error || !admin.user) {
    return admin.error
  }

  const body = (await request.json().catch(() => null)) as CreateLearningDossierBody | null
  if (!body?.title || body.title.trim().length < 3) {
    return NextResponse.json({ detail: 'Geef een duidelijke dossiernaam op.' }, { status: 400 })
  }

  const routeInterest = body.route_interest ?? 'exitscan'
  if (!['exitscan', 'retentiescan', 'combinatie', 'nog-onzeker'].includes(routeInterest)) {
    return NextResponse.json({ detail: 'Ongeldige route_interest.' }, { status: 400 })
  }

  const caseClosureValues = new Set(CASE_EVIDENCE_CLOSURE_OPTIONS.map((option) => option.value))
  const caseApprovalValues = new Set(CASE_APPROVAL_STATUS_OPTIONS.map((option) => option.value))
  const casePermissionValues = new Set(CASE_PERMISSION_STATUS_OPTIONS.map((option) => option.value))
  const casePotentialValues = new Set(CASE_POTENTIAL_OPTIONS.map((option) => option.value))
  const caseOutcomeQualityValues = new Set(CASE_OUTCOME_QUALITY_OPTIONS.map((option) => option.value))
  const caseOutcomeClassValues = new Set(CASE_OUTCOME_CLASS_OPTIONS.map((option) => option.value))

  if (body.case_evidence_closure_status && !caseClosureValues.has(body.case_evidence_closure_status)) {
    return NextResponse.json({ detail: 'Ongeldige case_evidence_closure_status.' }, { status: 400 })
  }
  if (body.case_approval_status && !caseApprovalValues.has(body.case_approval_status)) {
    return NextResponse.json({ detail: 'Ongeldige case_approval_status.' }, { status: 400 })
  }
  if (body.case_permission_status && !casePermissionValues.has(body.case_permission_status)) {
    return NextResponse.json({ detail: 'Ongeldige case_permission_status.' }, { status: 400 })
  }
  if (body.case_quote_potential && !casePotentialValues.has(body.case_quote_potential)) {
    return NextResponse.json({ detail: 'Ongeldige case_quote_potential.' }, { status: 400 })
  }
  if (body.case_reference_potential && !casePotentialValues.has(body.case_reference_potential)) {
    return NextResponse.json({ detail: 'Ongeldige case_reference_potential.' }, { status: 400 })
  }
  if (body.case_outcome_quality && !caseOutcomeQualityValues.has(body.case_outcome_quality)) {
    return NextResponse.json({ detail: 'Ongeldige case_outcome_quality.' }, { status: 400 })
  }
  if (body.case_outcome_classes && body.case_outcome_classes.some((entry) => !caseOutcomeClassValues.has(entry))) {
    return NextResponse.json({ detail: 'Ongeldige case_outcome_classes.' }, { status: 400 })
  }

  let derivedOrganizationId = body.organization_id ?? null
  let derivedScanType: 'exit' | 'retention' | null = null
  let derivedDeliveryMode: 'baseline' | 'live' | null = null

  if (body.campaign_id) {
    const { data: campaign } = await admin.supabase
      .from('campaigns')
      .select('id, organization_id, scan_type, delivery_mode, name')
      .eq('id', body.campaign_id)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ detail: 'Gekoppelde campaign niet gevonden.' }, { status: 404 })
    }

    derivedOrganizationId = campaign.organization_id
    derivedScanType = campaign.scan_type
    derivedDeliveryMode = campaign.delivery_mode
  }

  const { data: dossier, error: dossierError } = await admin.supabase
    .from('pilot_learning_dossiers')
    .insert({
      organization_id: derivedOrganizationId,
      campaign_id: body.campaign_id ?? null,
      contact_request_id: body.contact_request_id ?? null,
      title: body.title.trim(),
      route_interest: routeInterest,
      scan_type: derivedScanType,
      delivery_mode: derivedDeliveryMode,
      triage_status: 'nieuw',
      lead_contact_name: body.lead_contact_name?.trim() || null,
      lead_organization_name: body.lead_organization_name?.trim() || null,
      lead_work_email: body.lead_work_email?.trim() || null,
      lead_employee_count: body.lead_employee_count?.trim() || null,
      buyer_question: body.buyer_question?.trim() || null,
      expected_first_value: body.expected_first_value?.trim() || null,
      buying_reason: body.buying_reason?.trim() || null,
      trust_friction: body.trust_friction?.trim() || null,
      implementation_risk: body.implementation_risk?.trim() || null,
      first_management_value: cleanOptionalText(body.first_management_value),
      first_action_taken: cleanOptionalText(body.first_action_taken),
      review_moment: cleanOptionalText(body.review_moment),
      case_evidence_closure_status: body.case_evidence_closure_status ?? 'lesson_only',
      case_approval_status: body.case_approval_status ?? 'draft',
      case_permission_status: body.case_permission_status ?? 'not_requested',
      case_quote_potential: body.case_quote_potential ?? 'laag',
      case_reference_potential: body.case_reference_potential ?? 'laag',
      case_outcome_quality: body.case_outcome_quality ?? 'nog_onvoldoende',
      case_outcome_classes: body.case_outcome_classes ?? [],
      claimable_observations: cleanOptionalText(body.claimable_observations),
      supporting_artifacts: cleanOptionalText(body.supporting_artifacts),
      case_public_summary: cleanOptionalText(body.case_public_summary),
      created_by: admin.user.id,
      updated_by: admin.user.id,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (dossierError || !dossier) {
    return NextResponse.json({ detail: dossierError?.message ?? 'Learningdossier aanmaken mislukt.' }, { status: 500 })
  }

  const defaultCheckpoints = createDefaultLearningCheckpoints().map((checkpoint) => ({
    dossier_id: dossier.id,
    checkpoint_key: checkpoint.checkpoint_key,
    owner_label: checkpoint.owner_label,
    status: checkpoint.status,
    lesson_strength: checkpoint.lesson_strength,
    destination_areas: checkpoint.destination_areas,
    updated_at: new Date().toISOString(),
  }))

  const { error: checkpointError } = await admin.supabase
    .from('pilot_learning_checkpoints')
    .insert(defaultCheckpoints)

  if (checkpointError) {
    await admin.supabase.from('pilot_learning_dossiers').delete().eq('id', dossier.id)
    return NextResponse.json({ detail: checkpointError.message }, { status: 500 })
  }

  return NextResponse.json({ id: dossier.id, message: 'Learningdossier aangemaakt.' }, { status: 201 })
}
