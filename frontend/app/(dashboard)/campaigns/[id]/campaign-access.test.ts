import { describe, expect, it } from 'vitest'
import { buildCampaignAccessState } from './campaign-access'

describe('campaign access state', () => {
  it('makes viewer read-only scope and Verisight ownership explicit', () => {
    const state = buildCampaignAccessState({
      isVerisightAdmin: false,
      membershipRole: 'viewer',
    })

    expect(state.canRead).toBe(true)
    expect(state.canManage).toBe(false)
    expect(state.roleChip).toBe('Viewer - klantread')
    expect(state.scopeChip).toBe('Alleen lezen')
    expect(state.noteTitle).toBe('Je leest mee, maar Verisight beheert deze route')
    expect(state.noteBody).toContain('Verisight blijft owner')
    expect(state.noteBody).toContain('eerste volgende stap')
  })

  it('keeps member access distinct from the first route owner', () => {
    const state = buildCampaignAccessState({
      isVerisightAdmin: false,
      membershipRole: 'member',
    })

    expect(state.canRead).toBe(true)
    expect(state.canManage).toBe(true)
    expect(state.roleChip).toBe('Member - Verisight delivery')
    expect(state.noteBody).toContain('accountrol')
    expect(state.noteBody).toContain('eerste eigenaar')
  })

  it('returns a denied state when there is no readable relationship to the campaign', () => {
    const state = buildCampaignAccessState({
      isVerisightAdmin: false,
      membershipRole: null,
    })

    expect(state.canRead).toBe(false)
    expect(state.deniedTitle).toBe('Deze campaign is niet beschikbaar')
    expect(state.deniedBody).toContain('geen toegang')
  })
})
