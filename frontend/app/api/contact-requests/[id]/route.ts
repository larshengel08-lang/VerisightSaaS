import { NextResponse } from 'next/server'
import { getBackendApiUrl } from '@/lib/server-env'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: Context) {
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
