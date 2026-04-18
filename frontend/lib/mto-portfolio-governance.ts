export type MtoMainlineTransitionState = 'not_open' | 'opened'
export type MtoDefaultRouteState = 'not_default' | 'default_open'

export const MTO_MAINLINE_TRANSITION_STATE: MtoMainlineTransitionState = 'not_open'

export const MTO_PORTFOLIO_GOVERNANCE = {
  activationState: 'buyer_facing_gated',
  suiteRole: 'gated_main_measurement',
  defaultRouteState: 'not_default' as MtoDefaultRouteState,
  allowedMoves: [
    'buyer_facing_mto_page',
    'public_mto_contact_route',
    'gated_mto_cta',
    'internal_assisted_intake',
  ],
  blockedMoves: [
    'replace_exitscan_default',
    'replace_retentiescan_default',
    'homepage_core_swap',
    'suite_mainline_transition',
  ],
} as const

export function isMtoDefaultRouteOpen() {
  return MTO_PORTFOLIO_GOVERNANCE.defaultRouteState === 'default_open'
}
