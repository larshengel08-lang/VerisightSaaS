import type { ScanType } from '@/lib/types'
import { getProductModule } from '@/lib/products/shared/registry'

export interface ScanDefinition {
  scanType: ScanType
  productName: string
  signalLabel: string
  signalLabelLower: string
  summaryLabel: string
  methodologyText: string
  whatItIsText: string
  whatItIsNotText: string
  howToReadText: string
  privacyBoundaryText: string
  evidenceStatusText: string
  signalHelp: string
  reliabilityText: string
  segmentText: string
  launchStatus?: string[]
  deploymentProfiles?: {
    enterprise: string
    mkb: string
  }
  standardOutputs?: string[]
  optionalOutputs?: string[]
  outputReadiness?: Record<string, string>
  outputSequenceNote?: string
  followOnOutcomes?: string[]
  followOnDecisionNote?: string
}

export function getScanDefinition(scanType: ScanType): ScanDefinition {
  return getProductModule(scanType).definition
}
