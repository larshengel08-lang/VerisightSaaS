import { isHealthScaleSignal, type Preventability, type RiskBand, type ScanType } from '@/lib/types'

export interface FactorPresentation {
  scoreDisplay: string
  managementLabel: string
  signalDisplay: string
  showSignal: boolean
}

export const MANAGEMENT_BAND_LABELS: Record<RiskBand, string> = {
  LAAG: 'Volgen',
  MIDDEN: 'Eerst toetsen',
  HOOG: 'Direct prioriteren',
}

export const MANAGEMENT_CONTEXT_LABELS = {
  verification: 'Eerst toetsen',
  stabilizing: 'Stabiliserende factor',
} as const

export function getRiskBandFromScore(score: number): RiskBand {
  if (score >= 7) return 'HOOG'
  if (score >= 4.5) return 'MIDDEN'
  return 'LAAG'
}

// Rapportbanden op de gezondheidsschaal (hoog = goed). Dezelfde ladder als het PDF-rapport:
// kwetsbaar < 5,0, aandachtspunt 5,0-6,5, relatief sterk >= 6,5.
export const HEALTH_BAND_VULNERABLE_BELOW = 5.0
export const HEALTH_BAND_STRONG_FROM = 6.5

export type DisplaySignalBand = 'red' | 'amber' | 'emerald'

/**
 * Kleurband voor een al omgezette weergavescore (zie toDisplaySignalScore in lib/types).
 *
 * De twee takken zijn bewust GEEN spiegelbeeld van elkaar: de gezondheidsschaal
 * (retention/onboarding) volgt de rapportbanden 5,0 / 6,5, de risicoschaal (overige scans)
 * volgt getRiskBandFromScore met 4,5 / 7. Elke schaal houdt dus de drempels die de klant
 * elders in dat product al kent; ze gelijktrekken is een ontwerpvraag, geen bugfix.
 */
export function getDisplaySignalBand(scanType: ScanType, displayScore: number): DisplaySignalBand {
  if (isHealthScaleSignal(scanType)) {
    if (displayScore >= HEALTH_BAND_STRONG_FROM) return 'emerald'
    if (displayScore >= HEALTH_BAND_VULNERABLE_BELOW) return 'amber'
    return 'red'
  }
  const riskBand = getRiskBandFromScore(displayScore)
  if (riskBand === 'HOOG') return 'red'
  if (riskBand === 'MIDDEN') return 'amber'
  return 'emerald'
}

export function getManagementBandLabel(input: RiskBand | number): string {
  const band = typeof input === 'number' ? getRiskBandFromScore(input) : input
  return MANAGEMENT_BAND_LABELS[band]
}

export const RISK_COLORS: Record<RiskBand, string> = {
  HOOG: '#C65B52',
  MIDDEN: '#C88C20',
  LAAG: '#2E7C6D',
}

export const RISK_BG_COLORS: Record<RiskBand, string> = {
  HOOG: 'rgba(198,91,82,0.12)',
  MIDDEN: 'rgba(200,140,32,0.12)',
  LAAG: 'rgba(46,124,109,0.12)',
}

export function getRiskColor(input: RiskBand | number): string {
  const band = typeof input === 'number' ? getRiskBandFromScore(input) : input
  return RISK_COLORS[band]
}

export function getManagementBandBadgeClasses(input: RiskBand | number): string {
  const band = typeof input === 'number' ? getRiskBandFromScore(input) : input
  return {
    HOOG: 'bg-red-100 text-red-700',
    MIDDEN: 'bg-amber-100 text-amber-700',
    LAAG: 'bg-emerald-100 text-emerald-700',
  }[band]
}

export function getManagementBandTone(input: RiskBand | number): 'red' | 'amber' | 'emerald' {
  const band = typeof input === 'number' ? getRiskBandFromScore(input) : input
  const toneByBand = {
    HOOG: 'red',
    MIDDEN: 'amber',
    LAAG: 'emerald',
  } as const
  return toneByBand[band]
}

export function getManagementPreventabilityLabel(value: Preventability | string | null | undefined) {
  if (!value) return null
  return {
    STERK_WERKSIGNAAL: MANAGEMENT_BAND_LABELS.HOOG,
    GEMENGD_WERKSIGNAAL: MANAGEMENT_BAND_LABELS.MIDDEN,
    BEPERKT_WERKSIGNAAL: MANAGEMENT_BAND_LABELS.LAAG,
  }[value] ?? value
}

export function buildFactorPresentation(args: {
  score: number
  signalScore: number
  managementLabel?: string
  showSignal?: boolean
}): FactorPresentation {
  return {
    scoreDisplay: `${args.score.toFixed(1)}/10`,
    managementLabel: args.managementLabel ?? getManagementBandLabel(args.signalScore),
    signalDisplay: `${args.signalScore.toFixed(1)}/10`,
    showSignal: args.showSignal ?? false,
  }
}
