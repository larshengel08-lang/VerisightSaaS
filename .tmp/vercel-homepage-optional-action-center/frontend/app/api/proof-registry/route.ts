import { NextResponse } from 'next/server'
import { listProofRegistryEntries, upsertProofRegistryEntry } from '@/lib/proof-registry-server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('is_verisight_admin').eq('id', user.id).maybeSingle()
  if (profile?.is_verisight_admin !== true) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  }

  return null
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  const items = await listProofRegistryEntries()
  return NextResponse.json({ ok: true, items })
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await request.json().catch(() => null)
  if (!body?.route || !body?.summary) {
    return NextResponse.json({ error: 'Missing proof registry payload.' }, { status: 400 })
  }

  const items = await upsertProofRegistryEntry({
    id: body.id,
    orgId: body.orgId ?? null,
    campaignId: body.campaignId ?? null,
    route: body.route,
    proofState: body.proofState ?? 'lesson_only',
    approvalState: body.approvalState ?? 'draft',
    summary: body.summary,
    claimableObservation: body.claimableObservation ?? null,
    supportingArtifacts: Array.isArray(body.supportingArtifacts) ? body.supportingArtifacts : [],
  })

  return NextResponse.json({ ok: true, items })
}
