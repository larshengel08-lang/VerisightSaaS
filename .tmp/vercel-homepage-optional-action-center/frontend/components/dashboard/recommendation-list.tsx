import { getProductModule } from '@/lib/products/shared/registry'
import { buildFactorPresentation, getManagementBandBadgeClasses, getManagementBandLabel, getRiskBandFromScore } from '@/lib/management-language'
import type { ScanType } from '@/lib/types'
import { FACTOR_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const

interface Props {
  factorAverages: Record<string, number>
  scanType: ScanType
  bandOverride?: 'HOOG' | 'MIDDEN' | 'LAAG' | null
}

export function RecommendationList({ factorAverages, scanType, bandOverride }: Props) {
  const productModule = getProductModule(scanType)
  const questionSet = productModule.getFocusQuestions()
  const playbooks = productModule.getActionPlaybooks()
  const items = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
    .map((factor) => {
      const score = factorAverages[factor]
      const signalValue = 11 - score
      const band = bandOverride ?? getRiskBandFromScore(signalValue)
      const presentation = buildFactorPresentation({ score, signalScore: signalValue, managementLabel: getManagementBandLabel(band) })
      return {
        factor,
        score,
        signalValue,
        band,
        presentation,
        questions: questionSet[factor]?.[band] ?? [],
        playbook: playbooks[factor]?.[band] ?? null,
      }
    })
    .sort((a, b) => b.signalValue - a.signalValue)
    .filter((item) => item.questions.length > 0)

  const bandStyle: Record<string, { wrapper: string }> = {
    HOOG: {
      wrapper: 'border-[#e7d8d0] bg-[#fcf5f1]',
    },
    MIDDEN: {
      wrapper: 'border-[#eadfbe] bg-[#faf6ea]',
    },
    LAAG: {
      wrapper: 'border-[#d2e6e0] bg-[#eef7f4]',
    },
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.factor}
          open={index === 0}
          className={`group rounded-[20px] border p-4 shadow-[0_8px_24px_rgba(19,32,51,0.04)] ${bandStyle[item.band].wrapper}`}
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[color:var(--ink)]">{FACTOR_LABELS[item.factor]}</p>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getManagementBandBadgeClasses(item.band)}`}>
                  {item.presentation.managementLabel}
                </span>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {scanType === 'exit' ? 'Ervaren score' : 'Ervaren score'} {item.presentation.scoreDisplay}
              </p>
              <p className="text-sm leading-6 text-[color:var(--text)]">
                Gebruik deze laag alleen om te toetsen wat speelt. Eigenaar, route en eerste actie landen pas in Wat nu.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
              <span className="group-open:hidden">Open</span>
              <span className="hidden group-open:inline">Verberg</span>
              {' '}spoor
            </span>
          </summary>
          <div className="mt-4 border-t border-white/70 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {scanType === 'exit' ? 'Validatievragen' : 'Verificatievragen'}
            </p>
            <ul className="space-y-2">
              {item.questions.map((question) => (
                <li key={question} className="flex gap-2 text-sm leading-6 text-[color:var(--text)]">
                  <span className="text-[color:var(--muted)]">&bull;</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--text)]">
              {item.presentation.managementLabel}
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}
