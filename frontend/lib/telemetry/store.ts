import 'server-only'

import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isSuiteTelemetryEventType,
  type SuiteTelemetryEvent,
  type SuiteTelemetryEventRow,
  type SuiteTelemetryEventType,
} from '@/lib/telemetry/events'
import { isMissingSchemaError, readFallbackRegistryFile, writeFallbackRegistryFile } from '@/lib/runtime-registry-fallback'

type SuiteTelemetryDbRow = {
  id: string
  event_type: string
  org_id: string | null
  campaign_id: string | null
  actor_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

export async function listSuiteTelemetryEventRows(limit = 60) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('suite_telemetry_events')
    .select('id, event_type, org_id, campaign_id, actor_id, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingSchemaError(error)) {
      const fallbackRows = await readFallbackRegistryFile<SuiteTelemetryEventRow[]>('suite-telemetry-events.json', [])
      return fallbackRows.slice(0, limit)
    }
    throw error
  }

  return ((data ?? []) as SuiteTelemetryDbRow[])
    .filter((row) => isSuiteTelemetryEventType(row.event_type))
    .map(
      (row) =>
        ({
          id: row.id,
          eventType: row.event_type as SuiteTelemetryEventType,
          orgId: row.org_id,
          campaignId: row.campaign_id,
          actorId: row.actor_id,
          payload: row.payload ?? {},
          createdAt: row.created_at,
        }) satisfies SuiteTelemetryEventRow,
    )
}

export async function insertSuiteTelemetryEvents(events: SuiteTelemetryEvent[]) {
  if (events.length === 0) return []

  const admin = createAdminClient()
  const payload = events.map((event) => ({
    event_type: event.eventType,
    org_id: event.orgId,
    campaign_id: event.campaignId,
    actor_id: event.actorId,
    payload: event.payload,
  }))

  const { error } = await admin.from('suite_telemetry_events').insert(payload)
  if (error) {
    if (isMissingSchemaError(error)) {
      const existing = await readFallbackRegistryFile<SuiteTelemetryEventRow[]>('suite-telemetry-events.json', [])
      const appended = [
        ...events.map(
          (event) =>
            ({
              id: randomUUID(),
              eventType: event.eventType,
              orgId: event.orgId,
              campaignId: event.campaignId,
              actorId: event.actorId,
              payload: event.payload,
              createdAt: new Date().toISOString(),
            }) satisfies SuiteTelemetryEventRow,
        ),
        ...existing,
      ]
      await writeFallbackRegistryFile('suite-telemetry-events.json', appended)
      return appended.slice(0, Math.max(20, events.length))
    }
    throw error
  }

  return listSuiteTelemetryEventRows(Math.max(20, events.length))
}
