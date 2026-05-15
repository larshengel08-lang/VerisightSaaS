import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')
const migrationPath = fileURLToPath(new URL('../../supabase/action_center_review_rhythm_console.sql', import.meta.url))
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

function assertBoundedReviewRhythmPolicy(sql: string) {
  expect(sql).not.toMatch(/create policy "hr_and_admins_can_upsert_action_center_review_rhythm_configs"/i)
  expect(sql).not.toMatch(/action_center_review_rhythm_configs\s+for all/i)
  expect(sql).not.toMatch(/action_center_review_rhythm_configs\s+for delete/i)

  const selectPolicy = extractPolicyBlock(sql, 'hr_and_admins_can_select_action_center_review_rhythm_configs')
  const insertPolicy = extractPolicyBlock(sql, 'hr_and_admins_can_insert_action_center_review_rhythm_configs')
  const updatePolicy = extractPolicyBlock(sql, 'hr_and_admins_can_update_action_center_review_rhythm_configs')

  expect(selectPolicy).toMatch(/action_center_review_rhythm_configs for select/i)
  expect(selectPolicy).toMatch(/public\.is_verisight_admin_user\(\)/i)
  expect(selectPolicy).toMatch(/public\.is_org_owner\(org_id\)/i)
  expect(selectPolicy).toMatch(/m\.access_role in \('hr_owner', 'hr_member'\)/i)
  expect(selectPolicy).toMatch(/m\.scope_type = 'org'/i)
  expect(selectPolicy).toMatch(/m\.scope_value = action_center_review_rhythm_configs\.route_scope_value/i)
  expect(selectPolicy).toMatch(/m\.can_view/i)

  expect(insertPolicy).toMatch(/action_center_review_rhythm_configs for insert/i)
  expect(insertPolicy).toMatch(/public\.is_verisight_admin_user\(\)/i)
  expect(insertPolicy).toMatch(/public\.is_org_owner\(org_id\)/i)
  expect(insertPolicy).toMatch(/m\.access_role in \('hr_owner', 'hr_member'\)/i)
  expect(insertPolicy).toMatch(/m\.scope_type = 'org'/i)
  expect(insertPolicy).toMatch(/m\.scope_value = action_center_review_rhythm_configs\.route_scope_value/i)
  expect(insertPolicy).toMatch(/m\.can_view/i)
  expect(insertPolicy).toMatch(/m\.can_update/i)
  expect(insertPolicy).toMatch(/m\.can_schedule_review/i)

  expect(updatePolicy).toMatch(/action_center_review_rhythm_configs for update/i)
  expect(updatePolicy).toMatch(/public\.is_verisight_admin_user\(\)/i)
  expect(updatePolicy).toMatch(/public\.is_org_owner\(org_id\)/i)
  expect(updatePolicy).toMatch(/m\.access_role in \('hr_owner', 'hr_member'\)/i)
  expect(updatePolicy).toMatch(/m\.scope_type = 'org'/i)
  expect(updatePolicy).toMatch(/m\.scope_value = action_center_review_rhythm_configs\.route_scope_value/i)
  expect(updatePolicy).toMatch(/m\.can_view/i)
  expect(updatePolicy).toMatch(/m\.can_update/i)
  expect(updatePolicy).toMatch(/m\.can_schedule_review/i)
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
