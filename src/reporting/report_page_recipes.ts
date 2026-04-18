import type { ReportPageId, ReportProduct } from './report_scene_schema'
import { EXIT_MAIN_REPORT_ORDER, RETENTION_MAIN_REPORT_ORDER } from './report_scene_schema'

export interface PageRecipe {
  id: ReportPageId
  title: string
  reportZoneCount: number
  appendix: boolean
  conditional: boolean
  products: ReportProduct[]
  zones: string[]
  usesMicroStructure?: boolean
}

export const REPORT_PAGE_RECIPES: Record<ReportPageId, PageRecipe> = {
  P1: {
    id: 'P1',
    title: 'Cover',
    reportZoneCount: 3,
    appendix: false,
    conditional: false,
    products: ['ES', 'RS'],
    zones: ['brand-header', 'client-period', 'compact-metadata']
  },
  P2: {
    id: 'P2',
    title: 'Respons',
    reportZoneCount: 3,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['response-metric-band', 'response-chart', 'response-interpretation']
  },
  P3: {
    id: 'P3',
    title: 'Bestuurlijke handoff',
    reportZoneCount: 3,
    appendix: false,
    conditional: false,
    products: ['ES', 'RS'],
    zones: ['handoff-cards', 'first-decision', 'conclusion-note'],
    usesMicroStructure: true
  },
  P4: {
    id: 'P4',
    title: 'Frictiescore & verdeling van het vertrekbeeld',
    reportZoneCount: 3,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['score-band', 'banding-view', 'departure-picture'],
    usesMicroStructure: true
  },
  P5: {
    id: 'P5',
    title: 'Signalen in samenhang',
    reportZoneCount: 4,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['head-reasons', 'cofactors', 'quotes-context', 'prior-signal-context'],
    usesMicroStructure: true
  },
  P6: {
    id: 'P6',
    title: 'Drivers & prioriteitenbeeld',
    reportZoneCount: 3,
    appendix: false,
    conditional: false,
    products: ['ES', 'RS'],
    zones: ['scatter-plus-factor-table', 'top-two-factor-cards', 'micro-copy'],
    usesMicroStructure: true
  },
  P7: {
    id: 'P7',
    title: 'SDT Basisbehoeften',
    reportZoneCount: 2,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['sdt-chart', 'sdt-interpretation'],
    usesMicroStructure: true
  },
  P8: {
    id: 'P8',
    title: 'Organisatiefactoren',
    reportZoneCount: 2,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['org-factor-chart', 'org-factor-table'],
    usesMicroStructure: true
  },
  P9: {
    id: 'P9',
    title: 'Eerste route & actie',
    reportZoneCount: 2,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['route-owner-step-review', 'action-cards-and-steps']
  },
  P10: {
    id: 'P10',
    title: 'Methodiek / leeswijzer',
    reportZoneCount: 2,
    appendix: false,
    conditional: false,
    products: ['ES'],
    zones: ['compact-read-guide', 'guardrails-and-trust'],
    usesMicroStructure: true
  },
  A1: {
    id: 'A1',
    title: 'Segmentanalyse',
    reportZoneCount: 3,
    appendix: true,
    conditional: true,
    products: ['RS'],
    zones: ['department', 'tenure', 'level']
  },
  B1: {
    id: 'B1',
    title: 'Technische verantwoording',
    reportZoneCount: 3,
    appendix: true,
    conditional: false,
    products: ['ES', 'RS'],
    zones: ['sdt-layer', 'factor-weights', 'band-definitions'],
    usesMicroStructure: true
  }
}

export const DEFAULT_REPORTING_GRAMMAR = {
  exit: EXIT_MAIN_REPORT_ORDER,
  retention: RETENTION_MAIN_REPORT_ORDER,
  appendices: ['A1', 'B1'] as const
}

export const FUTURE_REPORT_GRAMMAR_DEFAULTS = {
  reusableGrammar: [
    'cover',
    'response quality',
    'bestuurlijke handoff',
    'score interpretation',
    'signal synthesis',
    'drivers / priorities',
    'method layers where useful',
    'route / action',
    'method guide',
    'technical appendix'
  ],
  products: ['exit', 'retention', 'team', 'onboarding', 'pulse', 'leadership']
}
