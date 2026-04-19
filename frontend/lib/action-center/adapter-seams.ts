import type {
  ManagementActionRecord,
  ManagementActionSourceReadStage,
  ManagementActionSourceScopeType,
} from '@/lib/management-actions'
import type { ScanType } from '@/lib/types'

export interface ActionCenterSourceReference {
  product: ScanType
  scope: {
    type: ManagementActionSourceScopeType
    key: string | null
    label: string | null
  }
  readStage: ManagementActionSourceReadStage
  factor: {
    key: string | null
    label: string | null
    signalValue: number | null
  } | null
  question: {
    key: string | null
    label: string | null
  } | null
}

export function buildActionCenterSourceReferenceFromAction(action: Pick<
  ManagementActionRecord,
  | 'source_product'
  | 'source_scope_type'
  | 'source_scope_key'
  | 'source_scope_label'
  | 'source_read_stage'
  | 'source_factor_key'
  | 'source_factor_label'
  | 'source_signal_value'
  | 'source_question_key'
  | 'source_question_label'
>): ActionCenterSourceReference {
  return {
    product: action.source_product,
    scope: {
      type: action.source_scope_type,
      key: action.source_scope_key,
      label: action.source_scope_label,
    },
    readStage: action.source_read_stage,
    factor: action.source_factor_key || action.source_factor_label || action.source_signal_value !== null
      ? {
          key: action.source_factor_key,
          label: action.source_factor_label,
          signalValue: action.source_signal_value,
        }
      : null,
    question: action.source_question_key || action.source_question_label
      ? {
          key: action.source_question_key,
          label: action.source_question_label,
        }
      : null,
  }
}
