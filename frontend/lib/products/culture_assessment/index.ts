import { CULTURE_ASSESSMENT_ACTION_PLAYBOOKS } from '@/lib/products/culture_assessment/action-playbooks'
import { buildCultureAssessmentDashboardViewModel } from '@/lib/products/culture_assessment/dashboard'
import { cultureAssessmentDefinition } from '@/lib/products/culture_assessment/definition'
import { CULTURE_ASSESSMENT_FOCUS_QUESTIONS } from '@/lib/products/culture_assessment/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const cultureAssessmentProductModule: ProductModule = {
  scanType: 'culture_assessment',
  definition: cultureAssessmentDefinition,
  buildDashboardViewModel: (args) => buildCultureAssessmentDashboardViewModel(args),
  getFocusQuestions: () => CULTURE_ASSESSMENT_FOCUS_QUESTIONS,
  getActionPlaybooks: () => CULTURE_ASSESSMENT_ACTION_PLAYBOOKS,
}
