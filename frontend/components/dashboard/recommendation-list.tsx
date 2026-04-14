import { getProductModule } from '@/lib/products/shared/registry'
import type { ScanType } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
}

export function RecommendationList({ factorAverages, scanType }: Props) {
  const questionSet = getProductModule(scanType).getFocusQuestions()
  const items = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const signalValue = 11 - score
      const band = signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      return { factor, signalValue, band, questions: questionSet[factor]?.[band] ?? [] }
    })
    .sort((a, b) => b.signalValue - a.signalValue)
    .filter((item) => item.questions.length > 0)

  const bandStyle: Record<string, { wrapper: string; badge: string }> = {
    HOOG: { wrapper: 'border-red-200 bg-red-50/80', badge: 'bg-red-100 text-red-700' },
    MIDDEN: { wrapper: 'border-amber-200 bg-amber-50/80', badge: 'bg-amber-100 text-amber-700' },
    LAAG: { wrapper: 'border-emerald-200 bg-emerald-50/80', badge: 'bg-emerald-100 text-emerald-700' },
  }

  const badgeCopy =
    scanType === 'exit'
      ? { HOOG: 'Nu kiezen', MIDDEN: 'Eerst toetsen', LAAG: 'Monitoren' }
      : { HOOG: 'Nu prioriteren', MIDDEN: 'Eerst valideren', LAAG: 'Monitoren' }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.factor} className={`rounded-[20px] border p-4 ${bandStyle[item.band].wrapper}`}>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{FACTOR_LABELS[item.factor]}</p>
              <p className="mt-1 text-xs text-slate-500">
                {scanType === 'exit' ? 'Verificatiespoor' : 'Prioriteit'} {item.signalValue.toFixed(1)}/10
              </p>
            </div>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${bandStyle[item.band].badge}`}>
              {badgeCopy[item.band as keyof typeof badgeCopy]}
            </span>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {scanType === 'exit' ? 'Validatie- en besluitvragen' : 'Validatie- en opvolgvragen'}
          </p>
          <ul className="space-y-2">
            {item.questions.map((question) => (
              <li key={question} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="text-slate-400">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
