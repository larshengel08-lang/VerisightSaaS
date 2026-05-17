import type { ScanType } from '@/lib/types'
import { leadershipProductModule } from '@/lib/products/leadership'
import type { ProductModule } from '@/lib/products/shared/types'
import { exitProductModule } from '@/lib/products/exit'
import { onboardingProductModule } from '@/lib/products/onboarding'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'
import { teamProductModule } from '@/lib/products/team'

const cultureAssessmentPlaceholderModule: ProductModule = {
  ...exitProductModule,
  scanType: 'culture_assessment',
  definition: {
    ...exitProductModule.definition,
    scanType: 'culture_assessment',
    productName: 'Loep Culture Assessment',
    signalLabel: 'Loep Culture Index',
    signalLabelLower: 'loep culture index',
    summaryLabel: 'Executive culture read',
  },
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
