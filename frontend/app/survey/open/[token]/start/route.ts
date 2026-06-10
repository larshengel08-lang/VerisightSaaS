/**
 * Open survey start proxy — stuurt POST door naar de FastAPI backend.
 * Backend maakt anonieme respondent aan en stuurt 303-redirect naar /survey/{token}.
 * De proxy volgt die redirect door naar de frontend-URL.
 */

import { type NextRequest } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Params {
  params: Promise<{ token: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  const body = await req.text()
  const res = await fetch(`${BACKEND}/survey/open/${token}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': req.headers.get('content-type') ?? 'application/x-www-form-urlencoded',
    },
    body,
    redirect: 'manual',
    cache: 'no-store',
  })

  // Backend stuurt 303 → /survey/{respondent_token}
  if (res.status === 303 || res.status === 302) {
    const location = res.headers.get('location') ?? '/'
    // Vervang eventuele backend-origin zodat de browser op het frontend-domein blijft
    const proxyLocation = location.replace(BACKEND, '')
    return new Response(null, {
      status: 303,
      headers: { Location: proxyLocation },
    })
  }

  // Error-responses (campagne gesloten, token ongeldig, etc.) — toon HTML status-pagina
  const html = await res.text()
  return new Response(html, {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
