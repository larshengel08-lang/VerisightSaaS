import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildActionCenterGraphCalendarLinkRecord,
  getActionCenterGraphCalendarCapability,
} from './action-center-graph-calendar'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')
const migrationPath = fileURLToPath(new URL('../../supabase/action_center_graph_calendar_links.sql', import.meta.url))
const migrationSql = readFileSync(migrationPath, 'utf8')

function extractPolicyBlock(sql: string, policyName: string) {
  const escapedName = policyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startPattern = new RegExp(`create policy "${escapedName}"`, 'i')
  const startMatch = startPattern.exec(sql)

  expect(startMatch).not.toBeNull()

  const startIndex = startMatch?.index ?? 0
  const rest = sql.slice(startIndex)
  const nextPolicyIndex = rest.slice(1).search(/\ncreate policy "/i)

  if (nextPolicyIndex === -1) {
    return rest
  }

  return rest.slice(0, nextPolicyIndex + 1)
}

function assertGraphCalendarSchema(sql: string) {
  expect(sql).toMatch(/create table if not exists public\.action_center_graph_calendar_links/i)
  expect(sql).toMatch(/route_id\s+text\s+not null/i)
  expect(sql).toMatch(/review_item_id\s+text\s+not null/i)
  expect(sql).toMatch(/route_scope_value\s+text\s+not null/i)
  expect(sql).toMatch(/route_source_id\s+uuid\s+not null/i)
  expect(sql).toMatch(/provider\s+text\s+not null\s+check \(provider in \('microsoft_graph'\)\)/i)
  expect(sql).toMatch(/event_id\s+text\s+not null/i)
  expect(sql).toMatch(/organizer_email\s+text\s+not null/i)
  expect(sql).toMatch(/consent_state\s+text\s+not null\s+check \(consent_state in \('granted', 'missing', 'revoked'\)\)/i)
  expect(sql).toMatch(/sync_state\s+text\s+not null\s+check \(sync_state in \('linked', 'cancelled', 'fallback', 'failed'\)\)/i)
  expect(sql).toMatch(/last_synced_revision\s+integer\s+not null check \(last_synced_revision >= 0\)/i)
  expect(sql).toMatch(/constraint action_center_graph_calendar_links_route_identity_check/i)
  expect(sql).toMatch(/check \(route_id = \(\(route_source_id\)::text \|\| '::' \|\| route_scope_value\)\)/i)
  expect(sql).toMatch(/constraint action_center_graph_calendar_links_review_item_identity_check/i)
  expect(sql).toMatch(/check \(review_item_id = route_id\)/i)
  expect(sql).toMatch(/constraint action_center_graph_calendar_links_event_id_text_check/i)
  expect(sql).toMatch(/check \(length\(btrim\(event_id\)\) > 0\)/i)
  expect(sql).toMatch(/constraint action_center_graph_calendar_links_organizer_email_text_check/i)
  expect(sql).toMatch(/check \(length\(btrim\(organizer_email\)\) > 0\)/i)
  expect(sql).toMatch(/create unique index if not exists idx_action_center_graph_calendar_links_route_provider/i)
  expect(sql).toMatch(/on public\.action_center_graph_calendar_links\(route_id,\s*provider\)/i)
  expect(sql).toMatch(/create unique index if not exists idx_action_center_graph_calendar_links_event_provider/i)
  expect(sql).toMatch(/on public\.action_center_graph_calendar_links\(event_id,\s*provider\)/i)
  expect(sql).toMatch(/alter table public\.action_center_graph_calendar_links enable row level security/i)
  expect(sql).toMatch(/create or replace function public\.set_action_center_graph_calendar_links_updated_at\(\)/i)
  expect(sql).toMatch(/drop trigger if exists action_center_graph_calendar_links_set_updated_at on public\.action_center_graph_calendar_links/i)
  expect(sql).toMatch(/create trigger action_center_graph_calendar_links_set_updated_at/i)
  expect(sql).not.toMatch(/action_center_graph_calendar_links\s+for delete/i)
  expect(sql).not.toMatch(/action_center_graph_calendar_links\s+for all/i)

  const selectPolicy = extractPolicyBlock(sql, 'service_role_can_select_action_center_graph_calendar_links')
  const insertPolicy = extractPolicyBlock(sql, 'service_role_can_insert_action_center_graph_calendar_links')
  const updatePolicy = extractPolicyBlock(sql, 'service_role_can_update_action_center_graph_calendar_links')

  expect(selectPolicy).toMatch(/on public\.action_center_graph_calendar_links for select/i)
  expect(selectPolicy).toMatch(/to service_role/i)
  expect(selectPolicy).toMatch(/using \(true\)/i)

  expect(insertPolicy).toMatch(/on public\.action_center_graph_calendar_links for insert/i)
  expect(insertPolicy).toMatch(/to service_role/i)
  expect(insertPolicy).toMatch(/with check \(true\)/i)

  expect(updatePolicy).toMatch(/on public\.action_center_graph_calendar_links for update/i)
  expect(updatePolicy).toMatch(/to service_role/i)
  expect(updatePolicy).toMatch(/using \(true\)/i)
  expect(updatePolicy).toMatch(/with check \(true\)/i)
}

describe('action center graph calendar capability', () => {
  it('enables Graph for the bounded parity routes with granted consent and a bounded organizer mailbox', () => {
    expect(
      getActionCenterGraphCalendarCapability({
        scanType: 'exit',
        consentState: 'granted',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
      }),
    ).toEqual({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })
  })

  it('enables Graph for RetentieScan when the shared route contract marks the route as provider-eligible', () => {
    expect(
      getActionCenterGraphCalendarCapability({
        scanType: 'retention',
        consentState: 'granted',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
      }),
    ).toEqual({
      mode: 'graph-enabled',
      provider: 'microsoft_graph',
      reason: null,
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: 'hr-organizer@tenant.example',
    })
  })

  it('falls back cleanly when Graph consent is unavailable', () => {
    expect(
      getActionCenterGraphCalendarCapability({
        scanType: 'exit',
        consentState: 'missing',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
      }),
    ).toEqual({
      mode: 'fallback-only',
      provider: 'microsoft_graph',
      reason: 'missing-consent',
      organizerEmail: 'hr@verisight.nl',
      organizerUserId: null,
    })
  })

  it.each(['pulse', 'onboarding', 'leadership', 'team'] as const)(
    'falls back cleanly for blocked route family %s even when consent exists',
    (scanType) => {
      expect(
        getActionCenterGraphCalendarCapability({
          scanType,
          consentState: 'granted',
          organizerEmail: 'hr@verisight.nl',
          organizerUserId: 'hr-organizer@tenant.example',
        }),
      ).toEqual({
        mode: 'fallback-only',
        provider: 'microsoft_graph',
        reason: 'unsupported-scan-type',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: null,
      })
    },
  )

  it('builds a stable provider link record without drifting from canonical route identity', () => {
    expect(
      buildActionCenterGraphCalendarLinkRecord({
        orgId: '22222222-2222-4222-8222-222222222222',
        routeId: '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
        reviewItemId: '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
        routeScopeValue: '22222222-2222-4222-8222-222222222222::department::operations',
        routeSourceId: '11111111-1111-4111-8111-111111111111',
        provider: 'microsoft_graph',
        eventId: 'AAMkAGI0M2I0ZWI0LWIzYjMtNDYyZi1hZGM1LWI0ZDA2YjM3YjJmYQBGAAAAAAD',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
        consentState: 'granted',
        syncState: 'linked',
        lastSyncedRevision: 3,
        iCalUId: '040000008200E00074C5B7101A82E00800000000',
        lastSyncError: null,
      }),
    ).toMatchObject({
      routeId:
        '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
      provider: 'microsoft_graph',
      syncState: 'linked',
      lastSyncedRevision: 3,
    })
  })

  it('rejects a provider link record when the stored routeId no longer matches canonical route identity', () => {
    expect(() =>
      buildActionCenterGraphCalendarLinkRecord({
        orgId: '22222222-2222-4222-8222-222222222222',
        routeId: '33333333-3333-4333-8333-333333333333::22222222-2222-4222-8222-222222222222::department::operations',
        reviewItemId: '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
        routeScopeValue: '22222222-2222-4222-8222-222222222222::department::operations',
        routeSourceId: '11111111-1111-4111-8111-111111111111',
        provider: 'microsoft_graph',
        eventId: 'AAMkAGI0M2I0ZWI0LWIzYjMtNDYyZi1hZGM1LWI0ZDA2YjM3YjJmYQBGAAAAAAD',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
        consentState: 'granted',
        syncState: 'linked',
        lastSyncedRevision: 3,
        iCalUId: null,
        lastSyncError: null,
      }),
    ).toThrow('Ongeldige Action Center Graph calendar link.')
  })

  it('rejects a provider link record when the review item id drifts away from the canonical route id', () => {
    expect(() =>
      buildActionCenterGraphCalendarLinkRecord({
        orgId: '22222222-2222-4222-8222-222222222222',
        routeId: '11111111-1111-4111-8111-111111111111::22222222-2222-4222-8222-222222222222::department::operations',
        reviewItemId: 'review-item-42',
        routeScopeValue: '22222222-2222-4222-8222-222222222222::department::operations',
        routeSourceId: '11111111-1111-4111-8111-111111111111',
        provider: 'microsoft_graph',
        eventId: 'AAMkAGI0M2I0ZWI0LWIzYjMtNDYyZi1hZGM1LWI0ZDA2YjM3YjJmYQBGAAAAAAD',
        organizerEmail: 'hr@verisight.nl',
        organizerUserId: 'hr-organizer@tenant.example',
        consentState: 'granted',
        syncState: 'linked',
        lastSyncedRevision: 3,
        iCalUId: null,
        lastSyncError: null,
      }),
    ).toThrow('Ongeldige Action Center Graph calendar link.')
  })
})

describe('action center graph calendar schema policy', () => {
  it('defines the graph calendar link table with bounded service-role policies in schema.sql', () => {
    assertGraphCalendarSchema(schemaSql)
  })

  it('keeps the graph calendar migration aligned to the same bounded schema contract', () => {
    assertGraphCalendarSchema(migrationSql)
  })
})
