import { NextResponse } from 'next/server'
import { listBillingRegistryRows, upsertBillingRegistryRow } from '@/lib/billing-registry-server'
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

  const items = await listBillingRegistryRows()
  return NextResponse.json({ ok: true, items })
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await request.json().catch(() => null)
  if (!body?.orgId || !body?.legalCustomerName) {
    return NextResponse.json({ error: 'Missing billing registry payload.' }, { status: 400 })
  }

  const items = await upsertBillingRegistryRow({
    orgId: body.orgId,
    legalCustomerName: body.legalCustomerName,
    contractState: body.contractState ?? 'draft',
    billingState: body.billingState ?? 'draft',
    paymentMethodConfirmed: body.paymentMethodConfirmed === true,
    notes: body.notes ?? null,
  })

  return NextResponse.json({ ok: true, items })
}
