import { describe, expect, it } from 'vitest'

import {
  CULTURE_ASSESSMENT_BOARD_ATTENTION_LOGIC,
  CULTURE_ASSESSMENT_DOMAIN_MIN_ITEM_COUNT,
  CULTURE_ASSESSMENT_MIN_VALID_RESPONSE_RULES,
  CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS,
  CULTURE_ASSESSMENT_RESPONSE_SCALES,
  CULTURE_ASSESSMENT_SCORING_LOCK,
  CULTURE_ASSESSMENT_TARGET_COMPLETION,
} from '@/lib/products/culture_assessment/questionnaire'

describe('culture assessment questionnaire lock', () => {
  it('locks one fixed 40-item questionnaire across 10 domains', () => {
    const uniqueIds = new Set(CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS.map((item) => item.id))
    const domainCounts = CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS.reduce<Record<string, number>>((acc, item) => {
      acc[item.domainId] = (acc[item.domainId] ?? 0) + 1
      return acc
    }, {})

    expect(CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS).toHaveLength(40)
    expect(uniqueIds.size).toBe(40)
    expect(Object.keys(domainCounts)).toHaveLength(10)
    expect(domainCounts).toEqual(CULTURE_ASSESSMENT_DOMAIN_MIN_ITEM_COUNT)
  })

  it('uses one consistent answer scale and explicit valid-response rules', () => {
    expect(CULTURE_ASSESSMENT_RESPONSE_SCALES.agreement_5pt.labels_nl).toHaveLength(5)
    expect(new Set(CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS.map((item) => item.scaleId))).toEqual(new Set(['agreement_5pt']))
    expect(CULTURE_ASSESSMENT_TARGET_COMPLETION.targetMinutes).toBe(12)
    expect(CULTURE_ASSESSMENT_MIN_VALID_RESPONSE_RULES.minimumClosedItemsAnswered).toBe(32)
    expect(CULTURE_ASSESSMENT_MIN_VALID_RESPONSE_RULES.minimumAnsweredItemsPerDomain).toBe(3)
    expect(CULTURE_ASSESSMENT_MIN_VALID_RESPONSE_RULES.minimumValidDomains).toBe(8)
  })

  it('keeps scoring and board attention logic deterministic and bounded', () => {
    expect(CULTURE_ASSESSMENT_SCORING_LOCK.domainScoreMethod).toBe('mean_of_answered_items_after_reverse_scoring')
    expect(CULTURE_ASSESSMENT_SCORING_LOCK.cultureIndexMethod).toBe('mean_of_valid_domain_scores')
    expect(CULTURE_ASSESSMENT_BOARD_ATTENTION_LOGIC.outputs).toContain('attention_points_max_5')
    expect(CULTURE_ASSESSMENT_BOARD_ATTENTION_LOGIC.forbiddenOutputs).toEqual([
      'causal_diagnosis',
      'automatic_intervention_advice',
      'manager_blame',
    ])
  })
})
