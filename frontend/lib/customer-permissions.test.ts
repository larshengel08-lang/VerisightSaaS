import { describe, expect, it } from 'vitest'

import {
  getCustomerActionPermission,
  getCustomerRoleSummary,
  getPermissionDeniedMessage,
} from './customer-permissions'

describe('customer execution permissions', () => {
  it('keeps viewers read-first and outside launch-critical execution', () => {
    expect(getCustomerActionPermission('viewer', 'view_dashboard')).toBe(true)
    expect(getCustomerActionPermission('viewer', 'view_report')).toBe(true)
    expect(getCustomerActionPermission('viewer', 'import_respondents')).toBe(false)
    expect(getCustomerActionPermission('viewer', 'launch_invites')).toBe(false)
    expect(getCustomerActionPermission('viewer', 'send_reminders')).toBe(false)
    expect(getPermissionDeniedMessage('launch_invites')).toContain('klant owner')
  })

  it('keeps member access outside customer launch execution', () => {
    expect(getCustomerActionPermission('member', 'view_dashboard')).toBe(true)
    expect(getCustomerActionPermission('member', 'import_respondents')).toBe(false)
    expect(getCustomerActionPermission('member', 'launch_invites')).toBe(false)
    expect(getCustomerActionPermission('member', 'send_reminders')).toBe(false)
  })

  it('lets the owner carry critical customer execution safely', () => {
    expect(getCustomerActionPermission('owner', 'import_respondents')).toBe(true)
    expect(getCustomerActionPermission('owner', 'launch_invites')).toBe(true)
    expect(getCustomerActionPermission('owner', 'send_reminders')).toBe(true)

    const summary = getCustomerRoleSummary('owner')
    expect(summary.label).toBe('Klant owner')
    expect(summary.allowedActions.join(' ').toLowerCase()).toContain('deelnemers')
    expect(summary.allowedActions.join(' ').toLowerCase()).toContain('uitnodigingen')
  })
})
