'use client'

import { useState } from 'react'
import { RiskBadge } from '@/components/ui/risk-badge'
import type { Respondent, SurveyResponse } from '@/lib/types'

interface Props {
  respondents: Respondent[]
  responses: (SurveyResponse & { respondents: Respondent })[]
  scanType: string
  /** Wanneer false (n < 5) worden individuele risicoscores verborgen — AVG herleidbaarheidsdrempel */
  hasMinDisplay: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/** Leesbare labels voor preventability-codes uit de database */
const PREVENTABILITY_LABELS: Record<string, string> = {
  REDBAAR:          'Redbaar',
  MOGELIJK_REDBAAR: 'Mogelijk redbaar',
  NIET_REDBAAR:     'Niet redbaar',
}

export function RespondentTable({ respondents, responses, scanType, hasMinDisplay }: Props) {
  const [copied, setCopied] = useState(false)
  const responseMap = new Map(responses.map(r => [r.respondent_id, r]))
  const pending = respondents.filter(r => !r.completed)

  const pendingLinks = pending.map(r => `${API_BASE}/survey/${r.token}`).join('\n')

  async function copyLinks() {
    try {
      await navigator.clipboard.writeText(pendingLinks)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: selecteer textarea
      const el = document.getElementById('pending-links-textarea') as HTMLTextAreaElement | null
      el?.select()
    }
  }

  return (
    <div className="space-y-4">
      {/* Waarschuwing als scores verborgen zijn */}
      {!hasMinDisplay && responses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
          Individuele scores worden pas getoond vanaf 5 ingevulde responses (nu: {responses.length}).
          Dit beschermt de anonimiteit van respondenten.
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Token</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Afdeling</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Niveau</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              {hasMinDisplay && (
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Risico
                  <span
                    className="ml-1 text-gray-300 cursor-help"
                    title="Risicoschaal 1–10: hogere score = meer verlooprisico. HOOG ≥ 7, MIDDEN 4.5–7, LAAG < 4.5"
                  >
                    ⓘ
                  </span>
                </th>
              )}
              {hasMinDisplay && scanType === 'exit' && (
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Vermijdbaar
                  <span
                    className="ml-1 text-gray-300 cursor-help"
                    title="Redbaar = vertrek was waarschijnlijk te voorkomen. Mogelijk redbaar = onduidelijk. Niet redbaar = persoonlijke of externe reden."
                  >
                    ⓘ
                  </span>
                </th>
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
                      <span className="text-xs text-gray-400">⏳ Nog niet gestart</span>
                    )}
                  </td>
                  {hasMinDisplay && (
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
                  )}
                  {hasMinDisplay && scanType === 'exit' && (
                    <td className="py-2 px-3 text-right text-xs text-gray-500">
                      {resp?.preventability
                        ? (PREVENTABILITY_LABELS[resp.preventability] ?? resp.preventability.replaceAll('_', ' '))
                        : '–'}
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Openstaande survey-links ({pending.length})
            </h3>
            <button
              onClick={copyLinks}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied ? '✓ Gekopieerd!' : '📋 Kopieer alle links'}
            </button>
          </div>
          <textarea
            id="pending-links-textarea"
            readOnly
            className="w-full font-mono text-xs bg-blue-50 border border-blue-200 rounded-lg p-3 h-28 resize-none focus:outline-none"
            value={pendingLinks}
          />
        </div>
      )}
    </div>
  )
}
