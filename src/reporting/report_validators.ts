import { PRODUCT_TERMINOLOGY_GUARDRAILS, REPORT_STATIC_COPY_V3 } from './report_copy_rules'
import { DISALLOWED_V2_MAIN_FLOW_MODULES } from './report_module_mapping'
import { hasSegmentAppendix, resolvePageOrder, resolvePageStates } from './report_fallback_rules'
import { EXIT_MAIN_REPORT_ORDER, REPORT_SCENE_SCHEMA_V3, type ReportPageId, type ReportSceneV3, type SchemaFieldRule } from './report_scene_schema'

export interface ValidationIssue {
  code: string
  message: string
}

function getPageValue(scene: ReportSceneV3, pageId: ReportPageId, field: string): unknown {
  const page = pageId === 'A1' || pageId === 'B1' ? scene.appendices[pageId] : scene.main[pageId]
  if (!page) return undefined
  return (page as Record<string, unknown>)[field]
}

function validateFieldRule(scene: ReportSceneV3, pageId: ReportPageId, rule: SchemaFieldRule): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const applicable = rule.requiredIn.includes(scene.product)
  const value = getPageValue(scene, pageId, rule.field)

  if (applicable && (value === undefined || value === null || value === '')) {
    issues.push({
      code: 'required-field-missing',
      message: `${pageId}.${rule.field} is required for ${scene.product}.`
    })
    return issues
  }

  if (typeof value === 'string' && rule.maxChars && value.length > rule.maxChars) {
    issues.push({
      code: 'max-chars-exceeded',
      message: `${pageId}.${rule.field} exceeds ${rule.maxChars} chars.`
    })
  }

  if (Array.isArray(value) && rule.maxItems && value.length > rule.maxItems) {
    issues.push({
      code: 'max-items-exceeded',
      message: `${pageId}.${rule.field} exceeds ${rule.maxItems} items.`
    })
  }

  return issues
}

export function validateSceneAgainstSchema(scene: ReportSceneV3): ValidationIssue[] {
  return (Object.entries(REPORT_SCENE_SCHEMA_V3) as [ReportPageId, SchemaFieldRule[]][])
    .flatMap(([pageId, rules]) => rules.flatMap((rule) => validateFieldRule(scene, pageId, rule)))
}

export function validateTerminologySeparation(scene: ReportSceneV3): ValidationIssue[] {
  const payload = JSON.stringify(scene).toLowerCase()
  const rules = REPORT_STATIC_COPY_V3[scene.product]

  return rules.forbiddenTerms.flatMap((term) =>
    payload.includes(term.toLowerCase())
      ? [{
          code: 'forbidden-product-term',
          message: `${scene.product} scene contains forbidden term "${term}".`
        }]
      : []
  )
}

export function validateConditionalDisappearance(scene: ReportSceneV3): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const p2 = resolvePageStates(scene).find((page) => page.id === 'P2')
  const synthesisPage = resolvePageStates(scene).find((page) => page.id === (scene.product === 'ES' ? 'P5' : 'P4'))
  const sceneQuotes = scene.product === 'ES'
    ? (((scene.main.P5 as Record<string, unknown> | undefined)?.quotes as string[] | undefined) ?? [])
    : (((scene.main.P4 as Record<string, unknown> | undefined)?.quotes as string[] | undefined) ?? [])

  if (!hasSegmentAppendix(scene) && resolvePageOrder(scene).includes('A1')) {
    issues.push({
      code: 'appendix-gating-failed',
      message: 'A1 should not resolve when segment threshold is not satisfied.'
    })
  }
  if (!sceneQuotes.length && !synthesisPage?.hiddenZones.includes(scene.product === 'ES' ? 'quotes-context' : 'zone-d')) {
    issues.push({
      code: 'quotes-fallback-failed',
      message: 'Quote context must disappear when quotes are insufficient.'
    })
  }
  if (scene.product === 'ES' && (scene.main.P2 as Record<string, unknown>).exposure_eur == null && !p2?.hiddenZones.includes('optional-exposure-card')) {
    issues.push({
      code: 'exposure-fallback-failed',
      message: 'P2 exposure card must disappear when exposure is null.'
    })
  }
  return issues
}

export function validateMigrationSafety(args: {
  pageOrder: ReportPageId[]
  referencedLegacyModules: string[]
}): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (args.pageOrder.join(',') !== EXIT_MAIN_REPORT_ORDER.join(',')) {
    issues.push({
      code: 'page-order-drift',
      message: 'Exit main report no longer follows the embedded baseline order P1–P10.'
    })
  }

  args.referencedLegacyModules.forEach((moduleId) => {
    if (DISALLOWED_V2_MAIN_FLOW_MODULES.includes(moduleId)) {
      issues.push({
        code: 'legacy-module-reintroduced',
        message: `Legacy module ${moduleId} must not be reintroduced into the v3 main flow.`
      })
    }
  })

  return issues
}

export function validateNoPlaceholderCopy(scene: ReportSceneV3): ValidationIssue[] {
  const payload = JSON.stringify(scene).toLowerCase()
  return PRODUCT_TERMINOLOGY_GUARDRAILS.sharedDoNotUseAsPlaceholders.flatMap((needle) =>
    payload.includes(needle)
      ? [{ code: 'placeholder-copy', message: `Scene contains forbidden placeholder copy "${needle}".` }]
      : []
  )
}

export function validateReportScene(scene: ReportSceneV3): ValidationIssue[] {
  return [
    ...validateSceneAgainstSchema(scene),
    ...validateTerminologySeparation(scene),
    ...validateConditionalDisappearance(scene),
    ...validateNoPlaceholderCopy(scene)
  ]
}
