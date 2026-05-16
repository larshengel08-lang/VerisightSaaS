import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')

describe('action center follow-through mail schema policy', () => {
  it('defines a bounded ledger table with dedupe uniqueness and service-only policies', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_follow_through_mail_events/i)
    expect(schemaSql).toMatch(/scan_type\s+text\s+not null\s+check \(scan_type in \('exit', 'retention'\)\)/i)
    expect(schemaSql).toMatch(/trigger_type\s+text\s+not null/i)
    expect(schemaSql).toMatch(/recipient_email\s+text\s+not null/i)
    expect(schemaSql).toMatch(/dedupe_key\s+text\s+not null/i)
    expect(schemaSql).toMatch(/delivery_status\s+text\s+not null/i)
    expect(schemaSql).toMatch(/unique\s*\(\s*dedupe_key\s*\)/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_select_action_center_follow_through_mail_events"/i)
    expect(schemaSql).toMatch(/create policy "service_role_can_insert_action_center_follow_through_mail_events"/i)
  })
})
