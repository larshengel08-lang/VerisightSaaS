/**
 * Open survey proxy — stuurt GET door naar de FastAPI backend.
 * Maakt /survey/open/{public_survey_token} bereikbaar via localhost:3000
 * zodat de Chrome preview-tunnel de intropagina kan laden.
 */

import { type NextRequest } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Params {
  params: Promise<{ token: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params
  const res = await fetch(`${BACKEND}/survey/open/${token}`, {
    headers: { 'Accept': 'text/html' },
    cache: 'no-store',
  })
  const html = await res.text()
  return new Response(html, {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
