import { describe, expect, it } from 'vitest'
import { getActionCenterEntryState } from './action-center-entry-state'

describe('getActionCenterEntryState', () => {
  it('maps attention to no opened follow-up yet', () => {
    expect(getActionCenterEntryState({ entryStage: 'attention', routeStatus: null })).toMatchObject({
      label: 'Nog geen opvolging geopend',
    })
  })

  it('maps candidate to a route candidate state', () => {
    expect(getActionCenterEntryState({ entryStage: 'candidate', routeStatus: null })).toMatchObject({
      label: 'Route-kandidaat',
    })
  })

  it('maps active routes to active follow-up semantics', () => {
    expect(getActionCenterEntryState({ entryStage: 'active', routeStatus: 'in-uitvoering' })).toMatchObject({
      label: 'Actieve opvolging',
    })
  })
})
