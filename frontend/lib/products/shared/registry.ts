import type { ScanType } from '@/lib/types'
import type { ProductModule } from '@/lib/products/shared/types'
import { exitProductModule } from '@/lib/products/exit'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'

const PRODUCT_MODULES: Record<ScanType, ProductModule> = {
  exit: exitProductModule,
  pulse: pulseProductModule,
  retention: retentionProductModule,
}

export function getProductModule(scanType: ScanType): ProductModule {
  return PRODUCT_MODULES[scanType] ?? PRODUCT_MODULES.exit
}
