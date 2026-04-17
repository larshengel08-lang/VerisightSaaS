import { getManagementBandBadgeClasses, getManagementBandLabel, getRiskBandFromScore } from '@/lib/management-language'

export function RiskBadge({ score, band }: { score?: number; band?: string }) {
  const resolved = band ?? (
    score !== undefined
      ? getRiskBandFromScore(score)
      : null
  )

  if (!resolved) return null

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getManagementBandBadgeClasses(resolved as 'HOOG' | 'MIDDEN' | 'LAAG')}`}>
      {getManagementBandLabel(resolved as 'HOOG' | 'MIDDEN' | 'LAAG')}
    </span>
  )
}
