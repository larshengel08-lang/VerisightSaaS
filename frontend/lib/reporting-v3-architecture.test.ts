import { describe, expect, it } from 'vitest'

import exitLowN from '../../fixtures/exitscan_low_n.json'
import exitMissingData from '../../fixtures/exitscan_missing_data.json'
import exitStandard from '../../fixtures/exitscan_standard.json'
import retentionLowN from '../../fixtures/retentiescan_low_n.json'
import retentionMissingData from '../../fixtures/retentiescan_missing_data.json'
import retentionStandard from '../../fixtures/retentiescan_standard.json'
import { DISALLOWED_V2_MAIN_FLOW_MODULES } from '../../src/reporting/report_module_mapping'
import { resolvePageOrder, resolvePageStates } from '../../src/reporting/report_fallback_rules'
import { validateMigrationSafety, validateReportScene, validateTerminologySeparation } from '../../src/reporting/report_validators'
import type { ReportSceneV3 } from '../../src/reporting/report_scene_schema'

describe('reporting architecture v3', () => {
  it('keeps the standard page order exactly in v3 order with appendices', () => {
    expect(resolvePageOrder(exitStandard as ReportSceneV3)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'B1'])
    expect(resolvePageOrder(retentionStandard as ReportSceneV3)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'A1', 'B1'])
  })

  it('removes conditional blocks instead of inserting placeholders', () => {
    const exitState = resolvePageStates(exitMissingData as ReportSceneV3).find((page) => page.id === 'P5')
    const exitHandoff = resolvePageStates(exitMissingData as ReportSceneV3).find((page) => page.id === 'P2')
    const retentionState = resolvePageStates(retentionMissingData as ReportSceneV3).find((page) => page.id === 'P4')

    expect(exitHandoff?.hiddenZones).toContain('optional-exposure-card')
    expect(exitState?.hiddenZones).toContain('quotes-context')
    expect(exitState?.hiddenZones).toContain('prior-signal-context')
    expect(retentionState?.hiddenZones).toContain('zone-d')
    expect(retentionState?.hiddenZones).toContain('zone-e')
  })

  it('gates appendix A1 away on low-n fixtures but keeps B1 always', () => {
    expect(resolvePageOrder(exitLowN as ReportSceneV3)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'B1'])
    expect(resolvePageOrder(retentionLowN as ReportSceneV3)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'B1'])
    expect(resolvePageOrder(exitMissingData as ReportSceneV3).at(-1)).toBe('B1')
    expect(resolvePageOrder(retentionMissingData as ReportSceneV3).at(-1)).toBe('B1')
  })

  it('preserves terminology separation between ExitScan and RetentieScan', () => {
    expect(validateTerminologySeparation(exitStandard as ReportSceneV3)).toEqual([])
    expect(validateTerminologySeparation(retentionStandard as ReportSceneV3)).toEqual([])

    const brokenExit = {
      ...(exitStandard as ReportSceneV3),
      main: {
        ...(exitStandard as ReportSceneV3).main,
        P2: {
          ...(exitStandard as ReportSceneV3).main.P2,
          handoff_signal: 'Het retentiesignaal is hier het hoofdbeeld.'
        }
      }
    }

    expect(validateTerminologySeparation(brokenExit).map((issue) => issue.code)).toContain('forbidden-product-term')
  })

  it('keeps migration safety from v2 to v3 explicit', () => {
    expect(
      validateMigrationSafety({
        pageOrder: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
        referencedLegacyModules: ['M1', 'M2', 'M3', 'M4', 'M9']
      })
    ).toEqual([])

    const issues = validateMigrationSafety({
      pageOrder: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      referencedLegacyModules: DISALLOWED_V2_MAIN_FLOW_MODULES
    })

    expect(issues.map((issue) => issue.code)).toContain('legacy-module-reintroduced')
  })

  it('validates standard and missing-data fixtures against the v3 scene contract', () => {
    expect(validateReportScene(exitStandard as ReportSceneV3)).toEqual([])
    expect(validateReportScene(retentionStandard as ReportSceneV3)).toEqual([])
    expect(validateReportScene(exitMissingData as ReportSceneV3)).toEqual([])
    expect(validateReportScene(retentionMissingData as ReportSceneV3)).toEqual([])
  })
})
