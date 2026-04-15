import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDefaultLearningCheckpoints } from '@/lib/pilot-learning'

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
  lead_contact_name?: string | null
  lead_organization_name?: string | null
  lead_work_email?: string | null
  lead_employee_count?: string | null
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
