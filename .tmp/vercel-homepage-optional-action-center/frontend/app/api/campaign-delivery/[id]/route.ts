import { NextResponse } from 'next/server'
import { insertCampaignAuditEvent } from '@/lib/campaign-audit'
import { createClient } from '@/lib/supabase/server'
import {
  buildDeliveryCheckpointMap,
  type CampaignDeliveryCheckpoint,
  DELIVERY_CHECKPOINT_DEFINITIONS,
  type DeliveryExceptionStatus,
  type DeliveryLifecycleStage,
  DELIVERY_EXCEPTION_OPTIONS,
  DELIVERY_LIFECYCLE_OPTIONS,
  validateDeliveryLifecycleTransition,
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
    .select('id, organization_id, campaign_id, contact_request_id, lifecycle_stage, exception_status, launch_date, launch_confirmed_at, participant_comms_config, reminder_config, first_management_use_confirmed_at, follow_up_decided_at, learning_closed_at')
    .eq('campaign_id', id)
    .maybeSingle()

  if (!record) {
    return NextResponse.json({ detail: 'Deliveryrecord niet gevonden.' }, { status: 404 })
  }

  const { data: checkpointRows } = await admin.supabase
    .from('campaign_delivery_checkpoints')
    .select('id, delivery_record_id, checkpoint_key, auto_state, manual_state, exception_status, last_auto_summary, operator_note, created_at, updated_at')
    .eq('delivery_record_id', record.id)

  const checkpoints = ((checkpointRows ?? []) as CampaignDeliveryCheckpoint[])

  const { data: campaign } = await admin.supabase
    .from('campaigns')
    .select('scan_type')
    .eq('id', id)
    .maybeSingle()

  if (!campaign?.scan_type) {
    return NextResponse.json({ detail: 'Campaign niet gevonden.' }, { status: 404 })
  }

  let hasLearningCloseoutEvidence = true
  if (body.lifecycle_stage === 'learning_closed') {
    const { data: linkedDossiers } = await admin.supabase
      .from('pilot_learning_dossiers')
      .select('id, review_moment, next_route, stop_reason, management_action_outcome, adoption_outcome')
      .eq('campaign_id', id)

    hasLearningCloseoutEvidence = (linkedDossiers ?? []).some((dossier) =>
      Boolean(
        dossier.review_moment ||
          dossier.next_route ||
          dossier.stop_reason ||
          dossier.management_action_outcome ||
          dossier.adoption_outcome,
      ),
    )
  }

  const checkpointMap = buildDeliveryCheckpointMap(checkpoints)
  const autoSignals = Object.fromEntries(
    DELIVERY_CHECKPOINT_DEFINITIONS.map((definition) => {
      const checkpoint = checkpointMap[definition.key]
      return [
        definition.key,
        {
          autoState: checkpoint?.auto_state ?? 'unknown',
          summary: checkpoint?.last_auto_summary ?? 'Nog geen autosamenvatting opgeslagen.',
        },
      ]
    }),
  ) as Record<
    (typeof DELIVERY_CHECKPOINT_DEFINITIONS)[number]['key'],
    { autoState: 'unknown' | 'not_ready' | 'warning' | 'ready'; summary: string }
  >

  const effectiveRecord = {
    ...record,
    contact_request_id:
      'contact_request_id' in body ? body.contact_request_id ?? null : record.contact_request_id,
    exception_status: body.exception_status ?? record.exception_status,
    lifecycle_stage: body.lifecycle_stage ?? record.lifecycle_stage,
  }

  if (body.lifecycle_stage) {
    const transition = validateDeliveryLifecycleTransition({
      scanType: campaign.scan_type,
      currentStage: record.lifecycle_stage as DeliveryLifecycleStage,
      targetStage: body.lifecycle_stage,
      record: effectiveRecord,
      checkpoints,
      autoSignals,
      hasLearningCloseoutEvidence,
    })

    if (!transition.allowed) {
      return NextResponse.json(
        {
          detail: `Lifecycle kan nog niet naar ${body.lifecycle_stage}: ${transition.blockers.join(' ')}`,
        },
        { status: 400 },
      )
    }
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

  if ('lifecycle_stage' in body && body.lifecycle_stage && body.lifecycle_stage !== record.lifecycle_stage) {
    await insertCampaignAuditEvent({
      supabase: admin.supabase,
      organizationId: record.organization_id,
      campaignId: id,
      actorUserId: admin.user.id,
      actorRole: 'verisight_admin',
      action: 'delivery_lifecycle_changed',
      outcome: 'completed',
      summary: `Lifecycle verschoven van ${record.lifecycle_stage} naar ${body.lifecycle_stage}.`,
      metadata: {
        from: record.lifecycle_stage,
        to: body.lifecycle_stage,
      },
    })
  }

  return NextResponse.json({ message: 'Deliveryrecord bijgewerkt.' })
}
