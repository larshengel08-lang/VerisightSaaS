import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  DELIVERY_CHECKPOINT_DEFINITIONS,
  DELIVERY_EXCEPTION_OPTIONS,
  DELIVERY_MANUAL_STATE_OPTIONS,
  type DeliveryAutoState,
  type DeliveryExceptionStatus,
  type DeliveryManualState,
} from '@/lib/ops-delivery'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateCampaignDeliveryCheckpointBody = {
  manual_state?: DeliveryManualState
  exception_status?: DeliveryExceptionStatus
  operator_note?: string | null
  auto_state?: DeliveryAutoState
  last_auto_summary?: string | null
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
      error: NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen checkpointstatus beheren.' }, { status: 403 }),
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

  const body = (await request.json().catch(() => null)) as UpdateCampaignDeliveryCheckpointBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const manualStateValues = new Set(DELIVERY_MANUAL_STATE_OPTIONS.map((option) => option.value))
  const exceptionValues = new Set(DELIVERY_EXCEPTION_OPTIONS.map((option) => option.value))
  const autoStateValues = new Set<DeliveryAutoState>(['unknown', 'not_ready', 'warning', 'ready'])

  if (body.manual_state && !manualStateValues.has(body.manual_state)) {
    return NextResponse.json({ detail: 'Ongeldige manual_state.' }, { status: 400 })
  }

  if (body.exception_status && !exceptionValues.has(body.exception_status)) {
    return NextResponse.json({ detail: 'Ongeldige exception_status.' }, { status: 400 })
  }

  if (body.auto_state && !autoStateValues.has(body.auto_state)) {
    return NextResponse.json({ detail: 'Ongeldige auto_state.' }, { status: 400 })
  }

  const { data: checkpoint } = await admin.supabase
    .from('campaign_delivery_checkpoints')
    .select('id, checkpoint_key')
    .eq('id', id)
    .maybeSingle()

  if (!checkpoint) {
    return NextResponse.json({ detail: 'Deliverycheckpoint niet gevonden.' }, { status: 404 })
  }

  const validKeys = new Set(DELIVERY_CHECKPOINT_DEFINITIONS.map((definition) => definition.key))
  if (!validKeys.has(checkpoint.checkpoint_key)) {
    return NextResponse.json({ detail: 'Onbekende checkpoint_key.' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if ('manual_state' in body) {
    updatePayload.manual_state = body.manual_state
  }
  if ('exception_status' in body) {
    updatePayload.exception_status = body.exception_status
  }
  if ('operator_note' in body) {
    updatePayload.operator_note = cleanOptionalText(body.operator_note)
  }
  if ('auto_state' in body) {
    updatePayload.auto_state = body.auto_state
  }
  if ('last_auto_summary' in body) {
    updatePayload.last_auto_summary = cleanOptionalText(body.last_auto_summary)
  }

  const { error } = await admin.supabase
    .from('campaign_delivery_checkpoints')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deliverycheckpoint bijgewerkt.' })
}
