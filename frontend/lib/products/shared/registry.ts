import type { ScanType } from '@/lib/types'
import { leadershipProductModule } from '@/lib/products/leadership'
import type { ProductModule } from '@/lib/products/shared/types'
import { exitProductModule } from '@/lib/products/exit'
import { onboardingProductModule } from '@/lib/products/onboarding'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'
import { teamProductModule } from '@/lib/products/team'

function failUnimplementedCultureAssessmentRuntime(): never {
  throw new Error('culture_assessment product module is not implemented yet')
}

const cultureAssessmentPlaceholderModule: ProductModule = {
  scanType: 'culture_assessment',
  definition: {
    scanType: 'culture_assessment',
    productName: 'Loep Culture Assessment',
    signalLabel: 'Loep Culture Index',
    signalLabelLower: 'loep culture index',
    summaryLabel: 'Executive culture read',
    methodologyText: 'Culture assessment runtime is not implemented yet.',
    whatItIsText: 'Culture assessment route registration is reserved for the upcoming product module.',
    whatItIsNotText: 'This placeholder must not reuse ExitScan behavior before the dedicated module exists.',
    howToReadText: 'Wait for the dedicated culture assessment module before using dashboard behavior.',
    privacyBoundaryText: 'No runtime views are available from the shared placeholder module.',
    evidenceStatusText: 'Task 1 only wires the shared route contract.',
    signalHelp: 'Loep Culture Index metadata is registered, but runtime behavior is intentionally unavailable.',
    reliabilityText: 'This placeholder fails fast when runtime methods are called.',
    segmentText: 'Segment behavior will arrive with the dedicated culture assessment implementation.',
  },
  buildDashboardViewModel: () => failUnimplementedCultureAssessmentRuntime(),
  getFocusQuestions: () => failUnimplementedCultureAssessmentRuntime(),
  getActionPlaybooks: () => failUnimplementedCultureAssessmentRuntime(),
}

const PRODUCT_MODULES: Record<ScanType, ProductModule> = {
  culture_assessment: cultureAssessmentPlaceholderModule,
  exit: exitProductModule,
  leadership: leadershipProductModule,
  onboarding: onboardingProductModule,
  pulse: pulseProductModule,
  retention: retentionProductModule,
  team: teamProductModule,
}

export function getProductModule(scanType: ScanType): ProductModule {
  return PRODUCT_MODULES[scanType] ?? PRODUCT_MODULES.exit
}
