import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type CreateManagementActionReviewBody = {
  action_id?: string
  summary?: string
  outcome?: 'continue' | 'close' | 'reopen' | 'follow_up_needed'
  next_review_date?: string | null
}

const REVIEW_OUTCOMES = ['continue', 'close', 'reopen', 'follow_up_needed'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as CreateManagementActionReviewBody | null
  if (!body?.action_id || !body.summary?.trim() || !body.outcome || !REVIEW_OUTCOMES.includes(body.outcome)) {
    return NextResponse.json({ detail: 'action_id, summary en outcome zijn verplicht.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('management_action_reviews')
    .insert({
      action_id: body.action_id,
      summary: body.summary.trim(),
      outcome: body.outcome,
      next_review_date: body.next_review_date ?? null,
      created_by: user.id,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 400 })
  }

  const reviewUpdatePayload: Record<string, unknown> = {
    last_review_outcome: body.outcome,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  if (body.next_review_date !== undefined) {
    reviewUpdatePayload.review_date = body.next_review_date ?? null
  }
  if (body.outcome === 'close') {
    reviewUpdatePayload.status = 'closed'
  }
  if (body.outcome === 'follow_up_needed') {
    reviewUpdatePayload.status = 'follow_up_needed'
  }
  if (body.outcome === 'reopen') {
    reviewUpdatePayload.status = 'open'
  }

  await supabase.from('management_actions').update(reviewUpdatePayload).eq('id', body.action_id)

  return NextResponse.json({ review: data, message: 'Review opgeslagen.' })
}
