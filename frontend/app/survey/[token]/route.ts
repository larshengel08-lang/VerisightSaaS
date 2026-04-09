/**
 * Survey proxy — stuurt GET en POST door naar de FastAPI backend.
 * Maakt survey-links bereikbaar via localhost:3000/survey/{token}
 * zodat de Chrome preview-tunnel ook de survey kan laden.
 */

import { type NextRequest } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Params {
  params: Promise<{ token: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params
  const res = await fetch(`${BACKEND}/survey/${token}`, {
    headers: { 'Accept': 'text/html' },
  })
  const html = await res.text()
  return new Response(html, {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params
  const body = await req.text()
  const res = await fetch(`${BACKEND}/survey/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': req.headers.get('content-type') ?? 'application/x-www-form-urlencoded' },
    body,
    redirect: 'manual',
  })

  // Backend stuurt redirect na submit — volg die door
  if (res.status === 303 || res.status === 302) {
    const location = res.headers.get('location') ?? '/'
    // Vervang backend-URL door frontend-URL
    const proxyLocation = location.replace(BACKEND, '')
    return new Response(null, {
      status: 303,
      headers: { Location: proxyLocation },
    })
  }

  const html = await res.text()
  return new Response(html, {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
