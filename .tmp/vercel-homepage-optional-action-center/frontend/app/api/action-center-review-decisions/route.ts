import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isActionCenterDecisionCheckpointKey,
  validateActionCenterReviewDecisionWriteInput,
} from '@/lib/action-center-review-decisions'

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

export async function POST(request: Request) {
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

  const { data, error } = await admin.supabase
    .from('action_center_review_decisions')
    .insert({
      ...parsed,
      created_by: admin.user.id,
      updated_by: admin.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ detail: error?.message ?? 'Authored review decision opslaan mislukt.' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, message: 'Authored review decision opgeslagen.' }, { status: 201 })
}
