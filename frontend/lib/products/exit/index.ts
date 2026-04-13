import { exitScanDefinition } from '@/lib/products/exit/definition'
import { buildExitDashboardViewModel } from '@/lib/products/exit/dashboard'
import { EXIT_FOCUS_QUESTIONS } from '@/lib/products/exit/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const exitProductModule: ProductModule = {
  scanType: 'exit',
  definition: exitScanDefinition,
  buildDashboardViewModel: (args) => buildExitDashboardViewModel(args),
  getFocusQuestions: () => EXIT_FOCUS_QUESTIONS,
  getActionPlaybooks: () => ({}),
}
