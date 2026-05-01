import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const schemaPath = path.resolve(process.cwd(), '../supabase/schema.sql')

describe('action center route relations select policy', () => {
  it('limits manager reads to relations that match either their source or target scope', () => {
    const schema = readFileSync(schemaPath, 'utf8')
    const policyStart = schema.indexOf('create policy "route_relations_select_visible_to_route_viewers"')
    const nextPolicyStart = schema.indexOf('create policy "route_relations_insert_visible_to_hr"', policyStart)
    const policyBlock = schema.slice(policyStart, nextPolicyStart)

    expect(policyBlock).toContain("m.access_role = 'manager_assignee'")
    expect(policyBlock).toContain("action_center_route_relations.source_route_id like ('%::' || m.scope_value)")
    expect(policyBlock).toContain("action_center_route_relations.target_route_id like ('%::' || m.scope_value)")
  })
})
