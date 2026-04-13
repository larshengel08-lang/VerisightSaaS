import { FACTOR_LABELS } from '@/lib/types'
import type { ScanType } from '@/lib/types'
import { getProductModule } from '@/lib/products/shared/registry'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function RecommendationList({ factorAverages, scanType }: Props) {
  const questionSet = getProductModule(scanType).getFocusQuestions()
  const items = ORG_FACTORS
    .filter(f => f in factorAverages)
    .map(f => {
      const score = factorAverages[f]
      const signalValue = 11 - score
      const band = signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      return { factor: f, score, signalValue, band, questions: questionSet[f]?.[band] ?? [] }
    })
    .sort((a, b) => b.signalValue - a.signalValue)
    .filter(item => item.questions.length > 0)

  const bandStyle: Record<string, { wrapper: string; badge: string }> = {
    HOOG: { wrapper: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
    MIDDEN: { wrapper: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
    LAAG: { wrapper: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.factor} className={`rounded-lg border p-4 ${bandStyle[item.band].wrapper}`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{FACTOR_LABELS[item.factor]}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">prioriteit {item.signalValue.toFixed(1)}/10</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${bandStyle[item.band].badge}`}>
                {item.band === 'HOOG' ? 'URGENT' : item.band === 'MIDDEN' ? 'AANDACHT' : 'OK'}
              </span>
            </div>
          </div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Focusvragen</div>
          <ul className="space-y-1">
            {item.questions.map((question, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 text-gray-400">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
