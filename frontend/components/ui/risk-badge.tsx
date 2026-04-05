export function RiskBadge({ score, band }: { score?: number; band?: string }) {
  const resolved = band ?? (
    score !== undefined
      ? score >= 7 ? 'HOOG' : score >= 4.5 ? 'MIDDEN' : 'LAAG'
      : null
  )

  if (!resolved) return null

  const styles: Record<string, string> = {
    HOOG:   'bg-red-100 text-red-700',
    MIDDEN: 'bg-amber-100 text-amber-700',
    LAAG:   'bg-green-100 text-green-700',
  }

  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${styles[resolved] ?? 'bg-gray-100 text-gray-600'}`}>
      {resolved}
    </span>
  )
}
