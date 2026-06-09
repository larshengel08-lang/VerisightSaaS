import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isActionCenterDecisionCheckpointKey,
  validateActionCenterReviewDecisionWriteInput,
} from '@/lib/action-center-review-decisions'

interface Context {
  params: Promise<{ id: string }>
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
      error: NextResponse.json(
        { detail: 'Alleen Verisight-beheerders kunnen authored review decisions beheren.' },
        { status: 403 },
      ),
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

  const body = await request.json().catch(() => null)

  let parsed
  try {
    parsed = validateActionCenterReviewDecisionWriteInput(body)
  } catch {
    return NextResponse.json({ detail: 'Ongeldige authored review decision input.' }, { status: 400 })
  }

  const { data: existing } = await admin.supabase
    .from('action_center_review_decisions')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ detail: 'Authored review decision niet gevonden.' }, { status: 404 })
  }

  const { data: checkpoint } = await admin.supabase
    .from('pilot_learning_checkpoints')
    .select('id, checkpoint_key')
    .eq('id', parsed.checkpoint_id)
    .maybeSingle()

  if (!checkpoint) {
    return NextResponse.json({ detail: 'Learningcheckpoint niet gevonden.' }, { status: 404 })
  }

  if (!isActionCenterDecisionCheckpointKey(checkpoint.checkpoint_key)) {
    return NextResponse.json(
      { detail: 'Authored review decisions zijn alleen toegestaan op reviewcheckpoints.' },
      { status: 400 },
    )
  }

  const { error } = await admin.supabase
    .from('action_center_review_decisions')
    .update({
      ...parsed,
      updated_by: admin.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Authored review decision bijgewerkt.' })
}
