import { PULSE_ACTION_PLAYBOOKS } from '@/lib/products/pulse/action-playbooks'
import { buildPulseDashboardViewModel } from '@/lib/products/pulse/dashboard'
import { pulseScanDefinition } from '@/lib/products/pulse/definition'
import { PULSE_FOCUS_QUESTIONS } from '@/lib/products/pulse/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const pulseProductModule: ProductModule = {
  scanType: 'pulse',
  definition: pulseScanDefinition,
  buildDashboardViewModel: (args) => buildPulseDashboardViewModel(args),
  getFocusQuestions: () => PULSE_FOCUS_QUESTIONS,
  getActionPlaybooks: () => PULSE_ACTION_PLAYBOOKS,
}
