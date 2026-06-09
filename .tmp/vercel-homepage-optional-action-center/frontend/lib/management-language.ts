import type { Preventability, RiskBand } from '@/lib/types'

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
