import type { ScanType } from '@/lib/types'
import { getProductModule } from '@/lib/products/shared/registry'

export interface ScanDefinition {
  scanType: ScanType
  productName: string
  signalLabel: string
  signalLabelLower: string
  summaryLabel: string
  methodologyText: string
  signalHelp: string
  reliabilityText: string
  segmentText: string
}

export function getScanDefinition(scanType: ScanType): ScanDefinition {
  return getProductModule(scanType).definition
}
