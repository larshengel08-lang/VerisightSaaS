import type { DashboardState } from '@/lib/dashboard/dashboard-state-resolver'

/**
 * Een kaart op de campagnepagina mag geen knop tonen die naar die pagina
 * zelf linkt (walkthrough 5.2: "Open rapport" deed zichtbaar niets). De
 * resolver blijft pagina-onafhankelijk; de pagina haalt de zelf-link weg.
 */
export function withoutSelfLink(state: DashboardState, currentPath: string): DashboardState {
  if (state.ctaKind !== 'link' || state.ctaHref !== currentPath) return state
  return { ...state, ctaLabel: null, ctaHref: null, ctaKind: null }
}
