import { NextResponse } from 'next/server'
import { isSuiteTelemetryEventType, type SuiteTelemetryEvent } from '@/lib/telemetry/events'
import { insertSuiteTelemetryEvents } from '@/lib/telemetry/store'

export async function POST(request: Request) {
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
