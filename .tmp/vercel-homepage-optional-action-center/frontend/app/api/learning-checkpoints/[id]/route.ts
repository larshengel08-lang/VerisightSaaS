import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  LEARNING_DESTINATION_OPTIONS,
  LEARNING_STRENGTH_OPTIONS,
  LEARNING_TRIAGE_STATUS_OPTIONS,
} from '@/lib/pilot-learning'

interface Context {
  params: Promise<{ id: string }>
}

type UpdateLearningCheckpointBody = {
  owner_label?: string
  status?: 'nieuw' | 'bevestigd' | 'geparkeerd' | 'uitgevoerd' | 'verworpen'
  objective_signal_notes?: string | null
  qualitative_notes?: string | null
  interpreted_observation?: string | null
  confirmed_lesson?: string | null
  lesson_strength?: 'incidentele_observatie' | 'terugkerend_patroon' | 'direct_uitvoerbare_verbetering'
  destination_areas?: Array<'product' | 'report' | 'onboarding' | 'sales' | 'operations'>
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
      error: NextResponse.json({ detail: 'Alleen Verisight-beheerders kunnen learningcheckpoints beheren.' }, { status: 403 }),
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

  const body = (await request.json().catch(() => null)) as UpdateLearningCheckpointBody | null
  if (!body) {
    return NextResponse.json({ detail: 'Ongeldige request body.' }, { status: 400 })
  }

  const { data: checkpoint } = await admin.supabase
    .from('pilot_learning_checkpoints')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!checkpoint) {
    return NextResponse.json({ detail: 'Learningcheckpoint niet gevonden.' }, { status: 404 })
  }

  const triageValues = new Set(LEARNING_TRIAGE_STATUS_OPTIONS.map((option) => option.value))
  const strengthValues = new Set(LEARNING_STRENGTH_OPTIONS.map((option) => option.value))
  const destinationValues = new Set(LEARNING_DESTINATION_OPTIONS.map((option) => option.value))

  if (body.status && !triageValues.has(body.status)) {
    return NextResponse.json({ detail: 'Ongeldige checkpointstatus.' }, { status: 400 })
  }

  if (body.lesson_strength && !strengthValues.has(body.lesson_strength)) {
    return NextResponse.json({ detail: 'Ongeldige lesson_strength.' }, { status: 400 })
  }

  if (
    body.destination_areas &&
    body.destination_areas.some((destination) => !destinationValues.has(destination))
  ) {
    return NextResponse.json({ detail: 'Ongeldige destination_areas.' }, { status: 400 })
  }

  if (typeof body.owner_label === 'string' && body.owner_label.trim().length < 2) {
    return NextResponse.json({ detail: 'Geef een duidelijke eigenaar op.' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if ('owner_label' in body) {
    updatePayload.owner_label = body.owner_label?.trim()
  }
  if ('status' in body) {
    updatePayload.status = body.status
  }
  if ('objective_signal_notes' in body) {
    updatePayload.objective_signal_notes = cleanOptionalText(body.objective_signal_notes)
  }
  if ('qualitative_notes' in body) {
    updatePayload.qualitative_notes = cleanOptionalText(body.qualitative_notes)
  }
  if ('interpreted_observation' in body) {
    updatePayload.interpreted_observation = cleanOptionalText(body.interpreted_observation)
  }
  if ('confirmed_lesson' in body) {
    updatePayload.confirmed_lesson = cleanOptionalText(body.confirmed_lesson)
  }
  if ('lesson_strength' in body) {
    updatePayload.lesson_strength = body.lesson_strength
  }
  if ('destination_areas' in body) {
    updatePayload.destination_areas = body.destination_areas ?? []
  }

  const { error } = await admin.supabase
    .from('pilot_learning_checkpoints')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Learningcheckpoint bijgewerkt.' })
}
