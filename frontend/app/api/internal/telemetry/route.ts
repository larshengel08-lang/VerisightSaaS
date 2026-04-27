import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.eventType) {
    return NextResponse.json({ error: 'Missing event type.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
