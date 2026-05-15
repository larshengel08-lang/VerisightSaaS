import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')
const migrationPath = fileURLToPath(new URL('../../supabase/action_center_review_reschedule_flows.sql', import.meta.url))
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

function assertAppearsBefore(sql: string, earlierPattern: RegExp, laterPattern: RegExp) {
  const earlierMatch = earlierPattern.exec(sql)
  const laterMatch = laterPattern.exec(sql)

  expect(earlierMatch).not.toBeNull()
  expect(laterMatch).not.toBeNull()
  expect((earlierMatch?.index ?? Number.POSITIVE_INFINITY)).toBeLessThan(
    laterMatch?.index ?? Number.NEGATIVE_INFINITY,
  )
}

function assertReviewScheduleRevisionSchema(sql: string) {
  expect(sql).toMatch(/create table if not exists public\.action_center_review_schedule_revisions/i)
  expect(sql).toMatch(/route_id\s+text\s+not null/i)
  expect(sql).toMatch(/route_scope_value\s+text\s+not null/i)
  expect(sql).toMatch(/route_source_id\s+uuid\s+not null/i)
  expect(sql).toMatch(/scan_type\s+text\s+not null\s+check \(scan_type in \('exit'\)\)/i)
  expect(sql).toMatch(/operation\s+text\s+not null\s+check \(operation in \('reschedule', 'cancel'\)\)/i)
  expect(sql).toMatch(/revision\s+integer\s+not null/i)
  expect(sql).toMatch(/review_date\s+date/i)
  expect(sql).toMatch(/previous_review_date\s+date/i)
  expect(sql).toMatch(/reason\s+text\s+not null/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_route_id_text_check/i)
  expect(sql).toMatch(/check \(length\(btrim\(route_id\)\) > 0\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_route_scope_value_text_check/i)
  expect(sql).toMatch(/check \(length\(btrim\(route_scope_value\)\) > 0\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_reason_text_check/i)
  expect(sql).toMatch(/check \(length\(btrim\(reason\)\) > 0\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_reason_length_check/i)
  expect(sql).toMatch(/check \(char_length\(reason\) <= 160\)/i)
  expect(sql).toMatch(
    /changed_by_role\s+text\s+not null\s+check \(changed_by_role in \('verisight_admin', 'hr_owner', 'hr_member'\)\)/i,
  )
  expect(sql).toMatch(/created_at\s+timestamptz\s+not null\s+default now\(\)/i)
  expect(sql).not.toMatch(/created_at\s+timestamptz\s+not null\s+default timezone\('utc', now\(\)\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_review_date_state_check/i)
  expect(sql).toMatch(
    /check \(\(operation = 'cancel' and review_date is null\) or \(operation = 'reschedule' and review_date is not null\)\)/i,
  )
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_previous_review_date_check/i)
  expect(sql).toMatch(/check \(\(operation = 'cancel' and previous_review_date is not null\) or operation = 'reschedule'\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_review_date_change_check/i)
  expect(sql).toMatch(/check \(\(operation = 'cancel'\) or previous_review_date is null or \(review_date <> previous_review_date\)\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_route_identity_check/i)
  expect(sql).toMatch(
    /check \(route_id = \(\(route_source_id\)::text \|\| '::' \|\| route_scope_value\)\)/i,
  )
  expect(sql).toMatch(/create unique index if not exists idx_campaigns_id_organization_id/i)
  expect(sql).toMatch(/on public\.campaigns\(id,\s*organization_id\)/i)
  expect(sql).toMatch(/constraint action_center_review_schedule_revisions_route_source_campaign_org_fk/i)
  expect(sql).toMatch(
    /foreign key \(route_source_id,\s*org_id\) references public\.campaigns\(id,\s*organization_id\) on delete cascade/i,
  )
  assertAppearsBefore(
    sql,
    /create unique index if not exists idx_campaigns_id_organization_id/i,
    /constraint action_center_review_schedule_revisions_route_source_campaign_org_fk/i,
  )
  expect(sql).toMatch(/create unique index if not exists idx_action_center_review_schedule_revisions_route_revision/i)
  expect(sql).toMatch(/on public\.action_center_review_schedule_revisions\(route_id,\s*revision\)/i)
  expect(sql).toMatch(/alter table public\.action_center_review_schedule_revisions enable row level security/i)
  expect(sql).not.toMatch(/action_center_review_schedule_revisions\s+for all/i)
  expect(sql).not.toMatch(/create policy ".*action_center_review_schedule_revisions.*"\s+on public\.action_center_review_schedule_revisions for update/i)
  expect(sql).not.toMatch(/create policy ".*action_center_review_schedule_revisions.*"\s+on public\.action_center_review_schedule_revisions for delete/i)
  expect(sql).not.toMatch(
    /create policy "(?!service_role_can_select_action_center_review_schedule_revisions)[^"]+"\s+on public\.action_center_review_schedule_revisions for select/i,
  )
  expect(sql).not.toMatch(
    /create policy "(?!service_role_can_insert_action_center_review_schedule_revisions)[^"]+"\s+on public\.action_center_review_schedule_revisions for insert/i,
  )
  const selectPolicy = extractPolicyBlock(sql, 'service_role_can_select_action_center_review_schedule_revisions')
  const insertPolicy = extractPolicyBlock(sql, 'service_role_can_insert_action_center_review_schedule_revisions')

  expect(selectPolicy).toMatch(/on public\.action_center_review_schedule_revisions for select/i)
  expect(selectPolicy).toMatch(/to service_role/i)
  expect(selectPolicy).toMatch(/using \(true\)/i)

  expect(insertPolicy).toMatch(/on public\.action_center_review_schedule_revisions for insert/i)
  expect(insertPolicy).toMatch(/to service_role/i)
  expect(insertPolicy).toMatch(/with check \(true\)/i)
}

describe('action center review reschedule schema policy', () => {
  it('defines a dedicated review schedule revision table with bounded service-role policies in schema.sql', () => {
    assertReviewScheduleRevisionSchema(schemaSql)
  })

  it('keeps the review reschedule migration aligned to the same bounded schema contract', () => {
    assertReviewScheduleRevisionSchema(migrationSql)
  })
})
