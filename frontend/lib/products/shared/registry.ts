import type { ScanType } from '@/lib/types'
import { leadershipProductModule } from '@/lib/products/leadership'
import { mtoProductModule } from '@/lib/products/mto'
import type { ProductModule } from '@/lib/products/shared/types'
import { exitProductModule } from '@/lib/products/exit'
import { onboardingProductModule } from '@/lib/products/onboarding'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'
import { teamProductModule } from '@/lib/products/team'

const PRODUCT_MODULES: Record<ScanType, ProductModule> = {
  exit: exitProductModule,
  leadership: leadershipProductModule,
  mto: mtoProductModule,
  onboarding: onboardingProductModule,
  pulse: pulseProductModule,
  retention: retentionProductModule,
  team: teamProductModule,
}

export function getProductModule(scanType: ScanType): ProductModule {
  return PRODUCT_MODULES[scanType] ?? PRODUCT_MODULES.exit
}
