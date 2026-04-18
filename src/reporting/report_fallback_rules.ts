import type { ReportPageId, ReportSceneV3, SegmentRecord } from './report_scene_schema'
import { EXIT_MAIN_REPORT_ORDER, RETENTION_MAIN_REPORT_ORDER } from './report_scene_schema'

export interface ResolvedPageState {
  id: ReportPageId
  hiddenZones: string[]
}

function countValidQuotes(scene: ReportSceneV3) {
  const page = scene.product === 'ES' ? (scene.main.P5 as Record<string, unknown> | undefined) : (scene.main.P4 as Record<string, unknown> | undefined)
  const quotes = (page?.quotes as string[] | undefined) ?? []
  return quotes.filter((quote) => quote.trim().length > 0).length
}

function collectSegments(scene: ReportSceneV3): SegmentRecord[] {
  const appendix = scene.appendices.A1
  if (!appendix) return []
  return [
    ...(appendix.segments.department ?? []),
    ...(appendix.segments.tenure ?? []),
    ...(appendix.segments.level ?? [])
  ]
}

export function hasExposureCard(scene: ReportSceneV3) {
  return scene.product === 'ES' && typeof (scene.main.P2 as Record<string, unknown>).exposure_eur === 'number'
}

export function hasQuotesBlock(scene: ReportSceneV3) {
  return countValidQuotes(scene) >= 2
}

export function hasPriorSignals(scene: ReportSceneV3) {
  const page = scene.product === 'ES' ? (scene.main.P5 as Record<string, unknown> | undefined) : (scene.main.P4 as Record<string, unknown> | undefined)
  return ((page?.prior_signals as unknown[] | undefined) ?? []).length >= 1
}

export function hasSegmentAppendix(scene: ReportSceneV3) {
  if (scene.product === 'ES') return false
  const segments = collectSegments(scene)
  return segments.length > 0 && segments.every((segment) => segment.n >= 5)
}

export function resolvePageOrder(scene: ReportSceneV3): ReportPageId[] {
  if (scene.product === 'ES') {
    return [...EXIT_MAIN_REPORT_ORDER, 'B1']
  }
  const appendices = [
    ...(hasSegmentAppendix(scene) ? (['A1'] as ReportPageId[]) : []),
    'B1' as ReportPageId
  ]
  return [...RETENTION_MAIN_REPORT_ORDER, ...appendices]
}

export function resolvePageStates(scene: ReportSceneV3): ResolvedPageState[] {
  return resolvePageOrder(scene).map((id) => {
    const hiddenZones: string[] = []

    if (scene.product === 'ES') {
      if (id === 'P2' && !hasExposureCard(scene)) hiddenZones.push('optional-exposure-card')
      if (id === 'P5' && !hasQuotesBlock(scene)) hiddenZones.push('quotes-context')
      if (id === 'P5' && !hasPriorSignals(scene)) hiddenZones.push('prior-signal-context')
    } else {
      if (id === 'P4' && !hasQuotesBlock(scene)) hiddenZones.push('zone-d')
      if (id === 'P4' && !hasPriorSignals(scene)) hiddenZones.push('zone-e')
    }

    return { id, hiddenZones }
  })
}
