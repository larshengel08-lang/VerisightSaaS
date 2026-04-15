import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  DELIVERY_EXCEPTION_OPTIONS,
  DELIVERY_LIFECYCLE_OPTIONS,
  type DeliveryExceptionStatus,
  type DeliveryLifecycleStage,
} from '@/lib/ops-delivery'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateCampaignDeliveryBody = {
  contact_request_id?: string | null
  lifecycle_stage?: DeliveryLifecycleStage
  exception_status?: DeliveryExceptionStatus
  operator_owner?: string | null
  next_step?: string | null
  operator_notes?: string | null
  customer_handoff_note?: string | null
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
      error: NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen deliverystatus beheren.' }, { status: 403 }),
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

  const body = (await request.json().catch(() => null)) as UpdateCampaignDeliveryBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const lifecycleValues = new Set(DELIVERY_LIFECYCLE_OPTIONS.map((option) => option.value))
  const exceptionValues = new Set(DELIVERY_EXCEPTION_OPTIONS.map((option) => option.value))

  if (body.lifecycle_stage && !lifecycleValues.has(body.lifecycle_stage)) {
    return NextResponse.json({ detail: 'Ongeldige lifecycle_stage.' }, { status: 400 })
  }

  if (body.exception_status && !exceptionValues.has(body.exception_status)) {
    return NextResponse.json({ detail: 'Ongeldige exception_status.' }, { status: 400 })
  }

  const { data: record } = await admin.supabase
    .from('campaign_delivery_records')
    .select('id, campaign_id, first_management_use_confirmed_at, follow_up_decided_at, learning_closed_at')
    .eq('campaign_id', id)
    .maybeSingle()

  if (!record) {
    return NextResponse.json({ detail: 'Deliveryrecord niet gevonden.' }, { status: 404 })
  }

  const nowIso = new Date().toISOString()
  const updatePayload: Record<string, unknown> = {
    updated_at: nowIso,
  }

  if ('contact_request_id' in body) {
    updatePayload.contact_request_id = body.contact_request_id ?? null
  }
  if ('lifecycle_stage' in body) {
    updatePayload.lifecycle_stage = body.lifecycle_stage
    if (body.lifecycle_stage === 'first_management_use' && !record.first_management_use_confirmed_at) {
      updatePayload.first_management_use_confirmed_at = nowIso
    }
    if (body.lifecycle_stage === 'follow_up_decided' && !record.follow_up_decided_at) {
      updatePayload.follow_up_decided_at = nowIso
    }
    if (body.lifecycle_stage === 'learning_closed' && !record.learning_closed_at) {
      updatePayload.learning_closed_at = nowIso
    }
  }
  if ('exception_status' in body) {
    updatePayload.exception_status = body.exception_status
  }
  if ('operator_owner' in body) {
    updatePayload.operator_owner = cleanOptionalText(body.operator_owner)
  }
  if ('next_step' in body) {
    updatePayload.next_step = cleanOptionalText(body.next_step)
  }
  if ('operator_notes' in body) {
    updatePayload.operator_notes = cleanOptionalText(body.operator_notes)
  }
  if ('customer_handoff_note' in body) {
    updatePayload.customer_handoff_note = cleanOptionalText(body.customer_handoff_note)
  }

  const { error } = await admin.supabase
    .from('campaign_delivery_records')
    .update(updatePayload)
    .eq('id', record.id)

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deliveryrecord bijgewerkt.' })
}
