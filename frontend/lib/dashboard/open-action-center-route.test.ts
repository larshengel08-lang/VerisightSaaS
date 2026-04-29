import { describe, expect, it } from 'vitest'
import {
  buildActionCenterRouteOpenPatch,
  buildActionCenterRouteOpenRedirect,
  canOpenActionCenterRoute,
  hasOpenedActionCenterRoute,
} from './open-action-center-route'

describe('open action center route', () => {
  it('marks first management use as confirmed when opening a route', () => {
    const openedAt = '2026-04-28T10:00:00.000Z'
    expect(buildActionCenterRouteOpenPatch(openedAt)).toEqual({
      lifecycle_stage: 'first_management_use',
      first_management_use_confirmed_at: openedAt,
    })
  })

  it('redirects back into action center with the opened campaign in focus', () => {
    expect(buildActionCenterRouteOpenRedirect('cmp-1')).toBe('/action-center?focus=cmp-1')
  })

  it('does not reopen a route after lifecycle has already advanced past first management use', () => {
    expect(
      canOpenActionCenterRoute({
        lifecycle_stage: 'follow_up_decided',
        first_management_use_confirmed_at: null,
      }),
    ).toBe(false)
  })

  it('treats an already confirmed first management use as an existing route', () => {
    expect(
      hasOpenedActionCenterRoute({
        lifecycle_stage: 'first_value_reached',
        first_management_use_confirmed_at: '2026-04-28T10:00:00.000Z',
      }),
    ).toBe(true)
  })
})
