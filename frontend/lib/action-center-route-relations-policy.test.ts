import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const schemaPath = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url))
const schemaSql = readFileSync(schemaPath, 'utf8')

describe('action center route relations schema policy contract', () => {
  it('defines trigger_reason on action_center_route_relations with the canonical three-value check', () => {
    expect(schemaSql).toMatch(/create table if not exists public\.action_center_route_relations/i)
    expect(schemaSql).toMatch(/trigger_reason text not null/i)
    expect(schemaSql).toMatch(
      /check\s*\(\s*trigger_reason in \('nieuw-campaign-signaal', 'nieuw-segment-signaal', 'hernieuwde-hr-beoordeling'\)\s*\)/i,
    )
  })

  it('keeps the route relation select policy scope-limited for managers', () => {
    expect(schemaSql).toMatch(/create policy "managers_can_select_action_center_route_relations"/i)
    expect(schemaSql).toMatch(/from public\.action_center_workspace_members m/i)
    expect(schemaSql).toMatch(/m\.access_role = 'manager_assignee'/i)
    expect(schemaSql).toMatch(/m\.org_id = action_center_route_relations\.org_id/i)
    expect(schemaSql).toMatch(/m\.scope_value = action_center_route_relations\.source_route_scope_value/i)
    expect(schemaSql).toMatch(/m\.can_view/i)
  })
})
