import { cultureAssessmentProductModule } from '@/lib/products/culture_assessment'
import { exitProductModule } from '@/lib/products/exit'
import { leadershipProductModule } from '@/lib/products/leadership'
import { onboardingProductModule } from '@/lib/products/onboarding'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'
import type { ProductModule } from '@/lib/products/shared/types'
import { teamProductModule } from '@/lib/products/team'
import type { ScanType } from '@/lib/types'

const PRODUCT_MODULES: Record<ScanType, ProductModule> = {
  culture_assessment: cultureAssessmentProductModule,
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
