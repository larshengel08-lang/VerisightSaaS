import { MTO_ACTION_PLAYBOOKS } from '@/lib/products/mto/action-playbooks'
import { buildMtoDashboardViewModel } from '@/lib/products/mto/dashboard'
import { mtoScanDefinition } from '@/lib/products/mto/definition'
import { MTO_FOCUS_QUESTIONS } from '@/lib/products/mto/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const mtoProductModule: ProductModule = {
  scanType: 'mto',
  definition: mtoScanDefinition,
  buildDashboardViewModel: (args) => buildMtoDashboardViewModel(args),
  getFocusQuestions: () => MTO_FOCUS_QUESTIONS,
  getActionPlaybooks: () => MTO_ACTION_PLAYBOOKS,
}
