import { TEAM_ACTION_PLAYBOOKS } from '@/lib/products/team/action-playbooks'
import {
  buildTeamDashboardViewModel,
  buildTeamLocalReadState,
  buildTeamPriorityReadState,
} from '@/lib/products/team/dashboard'
import { teamScanDefinition } from '@/lib/products/team/definition'
import { TEAM_FOCUS_QUESTIONS } from '@/lib/products/team/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const teamProductModule: ProductModule = {
  scanType: 'team',
  definition: teamScanDefinition,
  buildDashboardViewModel: (args) => buildTeamDashboardViewModel(args),
  getFocusQuestions: () => TEAM_FOCUS_QUESTIONS,
  getActionPlaybooks: () => TEAM_ACTION_PLAYBOOKS,
}

export { buildTeamLocalReadState, buildTeamPriorityReadState }
