import { describe, expect, it } from 'vitest'
import {
  ACTION_CENTER_MANAGER_RESPONSE_THEME_OPTIONS,
  getActionCenterManagerResponseLabel,
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
})
