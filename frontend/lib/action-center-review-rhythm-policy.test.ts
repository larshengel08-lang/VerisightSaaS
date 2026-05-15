import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')

describe('action center review rhythm schema policy', () => {
  it('defines a dedicated review rhythm config table and bounded HR/admin policies', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_review_rhythm_configs/i)
    expect(schemaSql).toMatch(/scan_type\s+text\s+not null/i)
    expect(schemaSql).toMatch(/cadence_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/reminder_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/escalation_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/updated_by_role\s+text\s+not null/i)
    expect(schemaSql).toMatch(/create policy "hr_and_admins_can_select_action_center_review_rhythm_configs"/i)
    expect(schemaSql).toMatch(/create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"/i)
    expect(schemaSql).toMatch(/public\.is_verisight_admin_user\(\)/i)
    expect(schemaSql).toMatch(/public\.is_org_owner\(org_id\)/i)
    expect(schemaSql).toMatch(/m\.access_role in \('hr_owner', 'hr_member'\)/i)
  })
})
