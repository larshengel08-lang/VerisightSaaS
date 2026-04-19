export type ReportProduct = 'ES' | 'RS'
export type ReportBand = 'voorlopig_stabiel' | 'aandacht_nodig' | 'direct_aandachtspunt'
export type ReportPageId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10' | 'A1' | 'B1'

export interface FactorRecord {
  name: string
  score: number
  signal: number
  band: ReportBand
  definition?: string
}

export interface SegmentRecord {
  label: string
  n: number
  scores: Record<string, number>
}

export interface PriorSignalRecord {
  period: string
  top_factor: string
  score: number
}

export interface ReportSceneV3 {
  schemaVersion: '3.0'
  product: ReportProduct
  reportType: 'exit' | 'retention'
  main: {
    P1: Record<string, unknown>
    P2: Record<string, unknown>
    P3: Record<string, unknown>
    P4: Record<string, unknown>
    P5: Record<string, unknown>
    P6: Record<string, unknown>
    P7?: Record<string, unknown>
    P8?: Record<string, unknown>
    P9?: Record<string, unknown>
    P10?: Record<string, unknown>
  }
  appendices: {
    A1?: {
      segments: {
        department?: SegmentRecord[]
        tenure?: SegmentRecord[]
        level?: SegmentRecord[]
      }
    }
    B1: Record<string, unknown>
  }
}

export interface SchemaFieldRule {
  field: string
  type: string
  maxChars?: number
  maxLines?: number
  maxItems?: number
  requiredIn: ReportProduct[]
}

export const EXIT_MAIN_REPORT_ORDER: ReportPageId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10']
export const RETENTION_MAIN_REPORT_ORDER: ReportPageId[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
export const MAIN_REPORT_ORDER: ReportPageId[] = EXIT_MAIN_REPORT_ORDER
export const APPENDIX_ORDER: ReportPageId[] = ['A1', 'B1']

export const REPORT_SCENE_SCHEMA_V3: Record<ReportPageId, SchemaFieldRule[]> = {
  P1: [
    { field: 'client_name', type: 'string', maxChars: 48, maxLines: 1, requiredIn: ['ES', 'RS'] },
    { field: 'product_label', type: 'string', maxChars: 30, maxLines: 1, requiredIn: ['ES', 'RS'] },
    { field: 'period_label', type: 'string', maxChars: 40, maxLines: 1, requiredIn: ['ES', 'RS'] }
  ],
  P2: [
    { field: 'response_rate', type: 'number', requiredIn: ['ES'] },
    { field: 'handoff_signal', type: 'string', maxChars: 80, maxLines: 3, requiredIn: ['RS'] }
  ],
  P3: [
    { field: 'handoff_signal', type: 'string', maxChars: 80, maxLines: 3, requiredIn: ['ES'] },
    { field: 'factors', type: 'Factor[]', maxItems: 8, requiredIn: ['RS'] }
  ],
  P4: [
    { field: 'signal_score', type: 'number', requiredIn: ['ES', 'RS'] },
    { field: 'quotes', type: 'string[]', maxItems: 2, maxChars: 120, maxLines: 3, requiredIn: [] },
    { field: 'prior_signals', type: 'PriorSignal[]', maxItems: 3, requiredIn: [] }
  ],
  P5: [
    { field: 'exit_reasons', type: 'Reason[]', maxItems: 5, requiredIn: ['ES'] },
    { field: 'priority_now', type: 'string', maxChars: 80, maxLines: 2, requiredIn: ['RS'] }
  ],
  P6: [
    { field: 'factors', type: 'Factor[]', maxItems: 8, requiredIn: ['ES'] },
    { field: 'score_explanation', type: 'string', maxChars: 120, maxLines: 4, requiredIn: ['RS'] }
  ],
  P7: [
    { field: 'dimensions', type: 'Dimension[]', maxItems: 3, requiredIn: ['ES'] }
  ],
  P8: [
    { field: 'factors', type: 'Factor[]', maxItems: 8, requiredIn: ['ES'] }
  ],
  P9: [
    { field: 'first_owner', type: 'string', maxChars: 60, maxLines: 1, requiredIn: ['ES'] },
    { field: 'first_step', type: 'string', maxChars: 80, maxLines: 2, requiredIn: ['ES'] }
  ],
  P10: [
    { field: 'product_is', type: 'string', maxChars: 120, maxLines: 2, requiredIn: ['ES'] },
    { field: 'product_not_for', type: 'string', maxChars: 120, maxLines: 2, requiredIn: ['ES'] }
  ],
  A1: [
    { field: 'segments', type: 'SegmentRecord[]', requiredIn: [] }
  ],
  B1: [
    { field: 'factor_weights', type: 'FactorWeight[]', maxItems: 8, requiredIn: ['ES', 'RS'] },
    { field: 'band_definitions', type: 'BandDef[]', maxItems: 3, requiredIn: ['ES', 'RS'] }
  ]
}
