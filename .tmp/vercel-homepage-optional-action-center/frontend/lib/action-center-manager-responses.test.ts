import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS,
  buildCampaignItemScopeValue,
  buildDepartmentScopeValue,
  getActionCenterManagerResponseLabel,
  resolveManagerResponseWriteIdentity,
  validateActionCenterManagerResponseWriteInput,
} from './action-center-manager-responses'

describe('action center manager responses', () => {
  it('accepts a bounded watch response without a primary action', () => {
    const parsed = validateActionCenterManagerResponseWriteInput({
      campaign_id: 'campaign-1',
      org_id: 'org-1',
      route_scope_type: 'department',
      route_scope_value: 'org-1::department::operations',
      manager_user_id: 'manager-1',
      response_type: 'watch',
      response_note:
        'Eerst bespreken in het bestaande weekoverleg voordat we hier een lokale interventie aan hangen.',
      review_scheduled_for: '2026-05-12',
    })

    expect(parsed.primary_action_theme_key).toBeNull()
    expect(parsed.primary_action_text).toBeNull()
    expect(parsed.primary_action_expected_effect).toBeNull()
    expect(parsed.primary_action_status).toBeNull()
  })

  it('requires the full small action frame once a primary action is added', () => {
    expect(() =>
      validateActionCenterManagerResponseWriteInput({
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: 'org-1::department::operations',
        manager_user_id: 'manager-1',
        response_type: 'sharpen',
        response_note: 'We pakken dit lokaal op met een eerste gerichte stap.',
        review_scheduled_for: '2026-05-12',
        primary_action_theme_key: 'leadership',
      }),
    ).toThrow('Ongeldige manager response input.')
  })

  it('accepts one primary action with canonical theme and SMART-like effect text', () => {
    const parsed = validateActionCenterManagerResponseWriteInput({
      campaign_id: 'campaign-1',
      org_id: 'org-1',
      route_scope_type: 'department',
      route_scope_value: 'org-1::department::operations',
      manager_user_id: 'manager-1',
      response_type: 'confirm',
      response_note: 'We zetten dit om naar een eerste concrete lokale stap.',
      review_scheduled_for: '2026-05-12',
      primary_action_theme_key: 'leadership',
      primary_action_text: 'Plan deze week een teamgesprek met de leidinggevende over feedbackritme.',
      primary_action_expected_effect:
        'Binnen twee weken moet zichtbaar zijn of de feedbackafspraken in het team duidelijker worden.',
      primary_action_status: 'active',
    })

    expect(parsed.primary_action_theme_key).toBe('leadership')
    expect(parsed.primary_action_status).toBe('active')
  })

  it('exposes stable response labels and fixed theme options', () => {
    expect(getActionCenterManagerResponseLabel('schedule')).toBe('Inplannen')
    expect(ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: 'leadership', label: 'Leiderschap en ondersteuning' },
        { value: 'growth', label: 'Groei en perspectief' },
        { value: 'workload', label: 'Werkdruk en herstel' },
      ]),
    )
  })

  it('derives the write identity from server truth for a valid manager assignment', () => {
    const resolved = resolveManagerResponseWriteIdentity({
      submitted: {
        campaign_id: 'campaign-1',
        org_id: 'org-1',
        route_scope_type: 'department',
        route_scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
        manager_user_id: 'manager-1',
      },
      currentUserId: 'manager-1',
      campaignOrgId: 'org-1',
      visibleDepartmentLabels: ['Operations', 'Finance'],
      membership: {
        org_id: 'org-1',
        user_id: 'manager-1',
        access_role: 'manager_assignee',
        scope_type: 'department',
        scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
        can_view: true,
        can_update: true,
      },
      isVerisightAdmin: false,
    })

    expect(resolved).toEqual({
      campaign_id: 'campaign-1',
      org_id: 'org-1',
      route_scope_type: 'department',
      route_scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
      manager_user_id: 'manager-1',
    })
  })

  it('rejects a forged manager identity even when the scope membership is otherwise valid', () => {
    expect(() =>
      resolveManagerResponseWriteIdentity({
        submitted: {
          campaign_id: 'campaign-1',
          org_id: 'org-1',
          route_scope_type: 'department',
          route_scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
          manager_user_id: 'manager-2',
        },
        currentUserId: 'manager-1',
        campaignOrgId: 'org-1',
        visibleDepartmentLabels: ['Operations'],
        membership: {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
          can_view: true,
          can_update: true,
        },
        isVerisightAdmin: false,
      }),
    ).toThrow('Ongeldige manager response route-identiteit.')
  })

  it('rejects a mismatched campaign org even when the submitted scope matches the membership', () => {
    expect(() =>
      resolveManagerResponseWriteIdentity({
        submitted: {
          campaign_id: 'campaign-1',
          org_id: 'org-1',
          route_scope_type: 'department',
          route_scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
          manager_user_id: 'manager-1',
        },
        currentUserId: 'manager-1',
        campaignOrgId: 'org-2',
        visibleDepartmentLabels: ['Operations'],
        membership: {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'department',
          scope_value: buildDepartmentScopeValue('org-1', 'Operations'),
          can_view: true,
          can_update: true,
        },
        isVerisightAdmin: false,
      }),
    ).toThrow('Manager response route bestaat niet voor deze campagne.')
  })

  it('rejects an item route whose scope value does not match the canonical campaign fallback scope', () => {
    expect(() =>
      resolveManagerResponseWriteIdentity({
        submitted: {
          campaign_id: 'campaign-1',
          org_id: 'org-1',
          route_scope_type: 'item',
          route_scope_value: 'org-1::campaign::ander-campaign-id',
          manager_user_id: 'manager-1',
        },
        currentUserId: 'manager-1',
        campaignOrgId: 'org-1',
        visibleDepartmentLabels: [],
        membership: {
          org_id: 'org-1',
          user_id: 'manager-1',
          access_role: 'manager_assignee',
          scope_type: 'item',
          scope_value: buildCampaignItemScopeValue('org-1', 'campaign-1'),
          can_view: true,
          can_update: true,
        },
        isVerisightAdmin: false,
      }),
    ).toThrow('Manager response route bestaat niet voor deze campagne.')
  })
})
