import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')
const migrationPath = fileURLToPath(new URL('../../supabase/action_center_review_rhythm_console.sql', import.meta.url))
const migrationSql = readFileSync(migrationPath, 'utf8')

function assertBoundedReviewRhythmPolicy(sql: string) {
  expect(sql).toMatch(/create policy "hr_and_admins_can_select_action_center_review_rhythm_configs"/i)
  expect(sql).toMatch(/create policy "hr_and_admins_can_insert_action_center_review_rhythm_configs"/i)
  expect(sql).toMatch(/create policy "hr_and_admins_can_update_action_center_review_rhythm_configs"/i)
  expect(sql).not.toMatch(/create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"/i)
  expect(sql).not.toMatch(/action_center_review_rhythm_configs\s+for all/i)
  expect(sql).not.toMatch(/action_center_review_rhythm_configs\s+for delete/i)
  expect(sql).toMatch(/action_center_review_rhythm_configs for insert/i)
  expect(sql).toMatch(/action_center_review_rhythm_configs for update/i)
  expect(sql).toMatch(/public\.is_verisight_admin_user\(\)/i)
  expect(sql).toMatch(/public\.is_org_owner\(org_id\)/i)
  expect(sql).toMatch(/m\.access_role in \('hr_owner', 'hr_member'\)/i)
  expect(sql).toMatch(/m\.scope_type = 'org'/i)
  expect(sql).toMatch(/m\.scope_value = action_center_review_rhythm_configs\.route_scope_value/i)
  expect(sql).toMatch(/m\.can_view/i)
  expect(sql).toMatch(/m\.can_update/i)
  expect(sql).toMatch(/m\.can_schedule_review/i)
}

describe('action center review rhythm schema policy', () => {
  it('keeps the consolidated schema aligned to the bounded review rhythm write policy', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_review_rhythm_configs/i)
    expect(schemaSql).toMatch(/scan_type\s+text\s+not null/i)
    expect(schemaSql).toMatch(/cadence_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/reminder_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/escalation_lead_days\s+smallint\s+not null/i)
    expect(schemaSql).toMatch(/updated_by_role\s+text\s+not null/i)
    expect(schemaSql).toMatch(/constraint action_center_review_rhythm_configs_reminder_window_check/i)
    expect(schemaSql).toMatch(/check \(\(not reminders_enabled\) or \(reminder_lead_days < cadence_days\)\)/i)
    expect(schemaSql).toMatch(/constraint action_center_review_rhythm_configs_escalation_window_check/i)
    expect(schemaSql).toMatch(/check \(escalation_lead_days > reminder_lead_days\)/i)

    assertBoundedReviewRhythmPolicy(schemaSql)
  })

  it('keeps the review rhythm migration aligned to the same bounded write policy', () => {
    expect(migrationSql).toMatch(/create table if not exists public\.action_center_review_rhythm_configs/i)
    assertBoundedReviewRhythmPolicy(migrationSql)
  })
})
