import { LEADERSHIP_ACTION_PLAYBOOKS } from '@/lib/products/leadership/action-playbooks'
import { buildLeadershipDashboardViewModel } from '@/lib/products/leadership/dashboard'
import { leadershipScanDefinition } from '@/lib/products/leadership/definition'
import { LEADERSHIP_FOCUS_QUESTIONS } from '@/lib/products/leadership/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const leadershipProductModule: ProductModule = {
  scanType: 'leadership',
  definition: leadershipScanDefinition,
  buildDashboardViewModel: (args) => buildLeadershipDashboardViewModel(args),
  getFocusQuestions: () => LEADERSHIP_FOCUS_QUESTIONS,
  getActionPlaybooks: () => LEADERSHIP_ACTION_PLAYBOOKS,
}
