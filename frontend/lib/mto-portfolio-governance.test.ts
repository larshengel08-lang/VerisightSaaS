import { describe, expect, it } from 'vitest'
import {
  MTO_MAINLINE_TRANSITION_STATE,
  MTO_PORTFOLIO_GOVERNANCE,
} from '@/lib/mto-portfolio-governance'

describe('mto portfolio governance', () => {
  it('keeps mto buyer-facing but not default after gated activation', () => {
    expect(MTO_PORTFOLIO_GOVERNANCE.activationState).toBe('buyer_facing_gated')
    expect(MTO_PORTFOLIO_GOVERNANCE.defaultRouteState).toBe('not_default')
    expect(MTO_PORTFOLIO_GOVERNANCE.suiteRole).toBe('gated_main_measurement')
  })

  it('blocks premature core replacement and mainline migration', () => {
    expect(MTO_PORTFOLIO_GOVERNANCE.blockedMoves).toContain('replace_exitscan_default')
    expect(MTO_PORTFOLIO_GOVERNANCE.blockedMoves).toContain('replace_retentiescan_default')
    expect(MTO_MAINLINE_TRANSITION_STATE).toBe('not_open')
  })
})
