import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isSuiteTelemetryEventType, type SuiteTelemetryEvent } from '@/lib/telemetry/events'
import { insertSuiteTelemetryEvents } from '@/lib/telemetry/store'

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(request: Request) {
  // Admin token auth — service-role write path (RLS-bypassing), must not trust
  // caller-supplied orgId/campaignId/actorId without a privileged caller.
  const adminToken = process.env.INTERNAL_ADMIN_TOKEN
  if (!adminToken) {
    return NextResponse.json({ error: 'INTERNAL_ADMIN_TOKEN niet geconfigureerd' }, { status: 500 })
  }
  const provided = request.headers.get('x-admin-token')
  if (!provided || !timingSafeEqualStr(provided, adminToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const rawEvents = Array.isArray(body?.events) ? body.events : body ? [body] : []

  if (rawEvents.length === 0) {
    return NextResponse.json({ error: 'Missing event type.' }, { status: 400 })
  }

  const events: SuiteTelemetryEvent[] = []
  for (const rawEvent of rawEvents) {
    if (!rawEvent || !isSuiteTelemetryEventType(rawEvent.eventType)) {
      return NextResponse.json({ error: 'Unknown event type.' }, { status: 400 })
    }

    events.push({
      eventType: rawEvent.eventType,
      orgId: rawEvent.orgId ?? null,
      campaignId: rawEvent.campaignId ?? null,
      actorId: rawEvent.actorId ?? null,
      payload: rawEvent.payload && typeof rawEvent.payload === 'object' ? rawEvent.payload : {},
    })
  }

  const rows = await insertSuiteTelemetryEvents(events)
  return NextResponse.json({ ok: true, inserted: events.length, rows })
}
