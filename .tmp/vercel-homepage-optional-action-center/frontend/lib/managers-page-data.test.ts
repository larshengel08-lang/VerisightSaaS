import { describe, expect, it } from 'vitest'
import {
  buildDepartmentScopeValue,
  countUncoveredDepartments,
  deriveManagerAssignmentStatus,
  parseManagerScopeLabel,
  summarizeManagerPermissions,
  type ManagerAssignmentWorkspaceRow,
} from './managers-page-data'

function buildWorkspaceRow(
  overrides: Partial<ManagerAssignmentWorkspaceRow> = {},
): ManagerAssignmentWorkspaceRow {
  return {
    org_id: 'org-1',
    user_id: 'manager-1',
    display_name: 'Manager Operations',
    login_email: 'manager@example.com',
    access_role: 'manager_assignee',
    scope_type: 'department',
    scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
    can_view: true,
    can_update: true,
    can_assign: false,
    can_schedule_review: true,
    created_at: '2026-05-01T09:00:00.000Z',
    updated_at: '2026-05-02T09:00:00.000Z',
    ...overrides,
  }
}

describe('managers page data helpers', () => {
  it('normalizes department scope values from active respondent context', () => {
    expect(buildDepartmentScopeValue('org-1', 'Operations')).toBe('org-1::department::operations')
    expect(buildDepartmentScopeValue('org-1', ' Customer Success ')).toBe('org-1::department::customer success')
  })

  it('parses scope labels from existing assignment scope values', () => {
    expect(parseManagerScopeLabel('org-1::department::operations', 'department', 'Pulse Q2')).toBe('Operations')
    expect(parseManagerScopeLabel('org-1::campaign::camp-1', 'item', 'Pulse Q2')).toBe('Pulse Q2')
    expect(parseManagerScopeLabel('org-1', 'org', 'Pulse Q2')).toBe('Organisatie')
  })

  it('counts only uncovered departments that exist in active campaign respondent context', () => {
    const uncovered = countUncoveredDepartments({
      activeDepartments: [
        buildDepartmentScopeValue('org-1', 'Operations'),
        buildDepartmentScopeValue('org-1', 'People'),
        buildDepartmentScopeValue('org-1', 'People'),
      ],
      managerScopeValues: [buildDepartmentScopeValue('org-1', 'Operations')],
    })

    expect(uncovered).toBe(1)
  })

  it('marks a manager with valid scopes as gekoppeld', () => {
    expect(deriveManagerAssignmentStatus([buildWorkspaceRow()])).toBe('gekoppeld')
  })

  it('marks a manager without visible scopes as nog_niet_gekoppeld', () => {
    expect(
      deriveManagerAssignmentStatus([
        buildWorkspaceRow({
          scope_value: '',
        }),
      ]),
    ).toBe('nog_niet_gekoppeld')
  })

  it('marks org plus department scope combinations in the same org as a scopeconflict', () => {
    expect(
      deriveManagerAssignmentStatus([
        buildWorkspaceRow({
          scope_type: 'org',
          scope_value: 'org-1',
        }),
        buildWorkspaceRow(),
      ]),
    ).toBe('scopeconflict')
  })

  it('summarizes only bounded Action Center permissions without dashboard or rapport toegang', () => {
    expect(summarizeManagerPermissions(buildWorkspaceRow())).toEqual([
      'Dashboardtoegang: Niet toegestaan',
      'Rapporttoegang: Niet toegestaan',
      'Action Center: Beperkt tot scope',
      'Kan opvolgen',
      'Kan review plannen',
    ])
  })
})
