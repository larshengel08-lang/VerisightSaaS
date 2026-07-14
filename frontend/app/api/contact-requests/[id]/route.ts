import { NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/server-env'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
  // Autoriseer de aanroeper: contact_requests bevat lead-PII + interne ops-velden
  // en mag alleen door Loep-admins gemuteerd worden. Zonder deze check kan elke
  // ingelogde tenant-gebruiker via de doorgezette admin-token elk lead lezen/wijzigen.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ detail: 'Niet ingelogd.' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_verisight_admin')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.is_verisight_admin !== true) {
    return NextResponse.json({ detail: 'Geen toegang.' }, { status: 403 })
  }

  const adminToken = process.env.BACKEND_ADMIN_TOKEN?.trim()
  if (!adminToken) {
    return NextResponse.json({ detail: 'BACKEND_ADMIN_TOKEN ontbreekt.' }, { status: 500 })
  }

  const { id } = await context.params
  const body = await request.text()

  const backendResponse = await fetch(`${getBackendApiUrl()}/api/contact-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken,
    },
    body,
    cache: 'no-store',
  })

  const payload = await backendResponse.json().catch(() => ({}))
  return NextResponse.json(payload, { status: backendResponse.status })
}
