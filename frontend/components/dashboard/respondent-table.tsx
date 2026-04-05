import { RiskBadge } from '@/components/ui/risk-badge'
import type { Respondent, SurveyResponse } from '@/lib/types'

interface Props {
  respondents: Respondent[]
  responses: (SurveyResponse & { respondents: Respondent })[]
  scanType: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export function RespondentTable({ respondents, responses, scanType }: Props) {
  const responseMap = new Map(responses.map(r => [r.respondent_id, r]))
  const pending = respondents.filter(r => !r.completed)

  return (
    <div className="space-y-4">
      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Token</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Afdeling</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Niveau</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Risico</th>
              {scanType === 'exit' && (
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Vermijdbaar</th>
              )}
            </tr>
          </thead>
          <tbody>
            {respondents.map(r => {
              const resp = responseMap.get(r.id)
              return (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-xs text-gray-400">
                    {r.token.slice(0, 8)}…
                  </td>
                  <td className="py-2 px-3 text-gray-600">{r.department ?? '–'}</td>
                  <td className="py-2 px-3 text-gray-600">{r.role_level ?? '–'}</td>
                  <td className="py-2 px-3">
                    {r.completed ? (
                      <span className="text-xs text-green-600 font-medium">✓ Ingevuld</span>
                    ) : (
                      <span className="text-xs text-gray-400">⏳ Open</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {resp?.risk_score ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-semibold text-gray-800">
                          {resp.risk_score.toFixed(1)}
                        </span>
                        <RiskBadge band={resp.risk_band ?? undefined} />
                      </div>
                    ) : '–'}
                  </td>
                  {scanType === 'exit' && (
                    <td className="py-2 px-3 text-right text-xs text-gray-500">
                      {resp?.preventability?.replace('_', ' ') ?? '–'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Openstaande links */}
      {pending.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Openstaande survey-links ({pending.length})
          </h3>
          <textarea
            readOnly
            className="w-full font-mono text-xs bg-blue-50 border border-blue-200 rounded-lg p-3 h-28 resize-none focus:outline-none"
            value={pending.map(r => `${API_BASE}/survey/${r.token}`).join('\n')}
          />
        </div>
      )}
    </div>
  )
}
