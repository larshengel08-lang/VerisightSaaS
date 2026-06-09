import { ONBOARDING_ACTION_PLAYBOOKS } from '@/lib/products/onboarding/action-playbooks'
import { buildOnboardingDashboardViewModel } from '@/lib/products/onboarding/dashboard'
import { onboardingScanDefinition } from '@/lib/products/onboarding/definition'
import { ONBOARDING_FOCUS_QUESTIONS } from '@/lib/products/onboarding/focus-questions'
import type { ProductModule } from '@/lib/products/shared/types'

export const onboardingProductModule: ProductModule = {
  scanType: 'onboarding',
  definition: onboardingScanDefinition,
  buildDashboardViewModel: (args) => buildOnboardingDashboardViewModel(args),
  getFocusQuestions: () => ONBOARDING_FOCUS_QUESTIONS,
  getActionPlaybooks: () => ONBOARDING_ACTION_PLAYBOOKS,
}
