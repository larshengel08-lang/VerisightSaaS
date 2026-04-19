import { describe, expect, it } from 'vitest'
import { buildActionCenterSourceReferenceFromAction } from '@/lib/action-center/adapter-seams'

describe('action center adapter seams', () => {
  it('maps an MTO management action into a neutral source reference', () => {
    const reference = buildActionCenterSourceReferenceFromAction({
      source_product: 'mto',
      source_scope_type: 'department',
      source_scope_key: 'department:operations',
      source_scope_label: 'Operations',
      source_read_stage: 'mto_department_intelligence',
      source_factor_key: 'workload',
      source_factor_label: 'Werkbelasting',
      source_signal_value: 7.2,
      source_question_key: 'workload.q1',
      source_question_label: 'Welke brede managementvraag over werkbelasting moet nu eerst expliciet worden beantwoord?',
    })

    expect(reference.product).toBe('mto')
    expect(reference.scope.label).toBe('Operations')
    expect(reference.factor?.key).toBe('workload')
    expect(reference.question?.key).toBe('workload.q1')
  })
})
