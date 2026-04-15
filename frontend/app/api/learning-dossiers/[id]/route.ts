import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  CASE_APPROVAL_STATUS_OPTIONS,
  CASE_EVIDENCE_CLOSURE_OPTIONS,
  CASE_OUTCOME_CLASS_OPTIONS,
  CASE_OUTCOME_QUALITY_OPTIONS,
  CASE_PERMISSION_STATUS_OPTIONS,
  CASE_POTENTIAL_OPTIONS,
  LEARNING_ROUTE_OPTIONS,
  LEARNING_TRIAGE_STATUS_OPTIONS,
} from '@/lib/pilot-learning'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateLearningDossierBody = {
  organization_id?: string | null
  campaign_id?: string | null
  contact_request_id?: string | null
  title?: string
  route_interest?: 'exitscan' | 'retentiescan' | 'combinatie' | 'nog-onzeker'
  triage_status?: 'nieuw' | 'bevestigd' | 'geparkeerd' | 'uitgevoerd' | 'verworpen'
  buyer_question?: string | null
  expected_first_value?: string | null
  buying_reason?: string | null
  trust_friction?: string | null
  implementation_risk?: string | null
  first_management_value?: string | null
  first_action_taken?: string | null
  review_moment?: string | null
  adoption_outcome?: string | null
  management_action_outcome?: string | null
  next_route?: string | null
  stop_reason?: string | null
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

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params
  const admin = await requireVerisightAdmin()
  if (admin.error || !admin.user) {
    return admin.error
  }

  const body = (await request.json().catch(() => null)) as UpdateLearningDossierBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const { data: existing } = await admin.supabase
    .from('pilot_learning_dossiers')
    .select('id, campaign_id, organization_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ detail: 'Learningdossier niet gevonden.' }, { status: 404 })
  }

  const routeValues = new Set(LEARNING_ROUTE_OPTIONS.map((option) => option.value))
  const triageValues = new Set(LEARNING_TRIAGE_STATUS_OPTIONS.map((option) => option.value))
  const caseClosureValues = new Set(CASE_EVIDENCE_CLOSURE_OPTIONS.map((option) => option.value))
  const caseApprovalValues = new Set(CASE_APPROVAL_STATUS_OPTIONS.map((option) => option.value))
  const casePermissionValues = new Set(CASE_PERMISSION_STATUS_OPTIONS.map((option) => option.value))
  const casePotentialValues = new Set(CASE_POTENTIAL_OPTIONS.map((option) => option.value))
  const caseOutcomeQualityValues = new Set(CASE_OUTCOME_QUALITY_OPTIONS.map((option) => option.value))
  const caseOutcomeClassValues = new Set(CASE_OUTCOME_CLASS_OPTIONS.map((option) => option.value))

  if (body.route_interest && !routeValues.has(body.route_interest)) {
    return NextResponse.json({ detail: 'Ongeldige route_interest.' }, { status: 400 })
  }

  if (body.triage_status && !triageValues.has(body.triage_status)) {
    return NextResponse.json({ detail: 'Ongeldige triage_status.' }, { status: 400 })
  }
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

  if (typeof body.title === 'string' && body.title.trim().length < 3) {
    return NextResponse.json({ detail: 'Geef een duidelijke dossiernaam op.' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    updated_by: admin.user.id,
    updated_at: new Date().toISOString(),
  }

  let resolvedCampaignId = existing.campaign_id
  let resolvedOrganizationId = existing.organization_id

  if ('campaign_id' in body) {
    resolvedCampaignId = body.campaign_id ?? null
  }
  if ('organization_id' in body) {
    resolvedOrganizationId = body.organization_id ?? null
  }

  if (resolvedCampaignId) {
    const { data: campaign } = await admin.supabase
      .from('campaigns')
      .select('id, organization_id, scan_type, delivery_mode')
      .eq('id', resolvedCampaignId)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ detail: 'Gekoppelde campaign niet gevonden.' }, { status: 404 })
    }

    resolvedOrganizationId = campaign.organization_id
    updatePayload.campaign_id = campaign.id
    updatePayload.organization_id = campaign.organization_id
    updatePayload.scan_type = campaign.scan_type
    updatePayload.delivery_mode = campaign.delivery_mode
  } else if ('campaign_id' in body) {
    updatePayload.campaign_id = null
    updatePayload.scan_type = null
    updatePayload.delivery_mode = null
  }

  if (!resolvedCampaignId && 'organization_id' in body) {
    updatePayload.organization_id = resolvedOrganizationId
  }

  if ('contact_request_id' in body) {
    updatePayload.contact_request_id = body.contact_request_id ?? null
  }
  if ('title' in body) {
    updatePayload.title = body.title?.trim()
  }
  if ('route_interest' in body) {
    updatePayload.route_interest = body.route_interest
  }
  if ('triage_status' in body) {
    updatePayload.triage_status = body.triage_status
  }
  if ('lead_contact_name' in body) {
    updatePayload.lead_contact_name = cleanOptionalText(body.lead_contact_name)
  }
  if ('lead_organization_name' in body) {
    updatePayload.lead_organization_name = cleanOptionalText(body.lead_organization_name)
  }
  if ('lead_work_email' in body) {
    updatePayload.lead_work_email = cleanOptionalText(body.lead_work_email)
  }
  if ('lead_employee_count' in body) {
    updatePayload.lead_employee_count = cleanOptionalText(body.lead_employee_count)
  }
  if ('buyer_question' in body) {
    updatePayload.buyer_question = cleanOptionalText(body.buyer_question)
  }
  if ('expected_first_value' in body) {
    updatePayload.expected_first_value = cleanOptionalText(body.expected_first_value)
  }
  if ('buying_reason' in body) {
    updatePayload.buying_reason = cleanOptionalText(body.buying_reason)
  }
  if ('trust_friction' in body) {
    updatePayload.trust_friction = cleanOptionalText(body.trust_friction)
  }
  if ('implementation_risk' in body) {
    updatePayload.implementation_risk = cleanOptionalText(body.implementation_risk)
  }
  if ('first_management_value' in body) {
    updatePayload.first_management_value = cleanOptionalText(body.first_management_value)
  }
  if ('first_action_taken' in body) {
    updatePayload.first_action_taken = cleanOptionalText(body.first_action_taken)
  }
  if ('review_moment' in body) {
    updatePayload.review_moment = cleanOptionalText(body.review_moment)
  }
  if ('adoption_outcome' in body) {
    updatePayload.adoption_outcome = cleanOptionalText(body.adoption_outcome)
  }
  if ('management_action_outcome' in body) {
    updatePayload.management_action_outcome = cleanOptionalText(body.management_action_outcome)
  }
  if ('next_route' in body) {
    updatePayload.next_route = cleanOptionalText(body.next_route)
  }
  if ('stop_reason' in body) {
    updatePayload.stop_reason = cleanOptionalText(body.stop_reason)
  }
  if ('case_evidence_closure_status' in body) {
    updatePayload.case_evidence_closure_status = body.case_evidence_closure_status
  }
  if ('case_approval_status' in body) {
    updatePayload.case_approval_status = body.case_approval_status
  }
  if ('case_permission_status' in body) {
    updatePayload.case_permission_status = body.case_permission_status
  }
  if ('case_quote_potential' in body) {
    updatePayload.case_quote_potential = body.case_quote_potential
  }
  if ('case_reference_potential' in body) {
    updatePayload.case_reference_potential = body.case_reference_potential
  }
  if ('case_outcome_quality' in body) {
    updatePayload.case_outcome_quality = body.case_outcome_quality
  }
  if ('case_outcome_classes' in body) {
    updatePayload.case_outcome_classes = body.case_outcome_classes ?? []
  }
  if ('claimable_observations' in body) {
    updatePayload.claimable_observations = cleanOptionalText(body.claimable_observations)
  }
  if ('supporting_artifacts' in body) {
    updatePayload.supporting_artifacts = cleanOptionalText(body.supporting_artifacts)
  }
  if ('case_public_summary' in body) {
    updatePayload.case_public_summary = cleanOptionalText(body.case_public_summary)
  }

  const { error } = await admin.supabase
    .from('pilot_learning_dossiers')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Learningdossier bijgewerkt.' })
}
