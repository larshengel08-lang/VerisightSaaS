'use client'

import { useState } from 'react'
import { RiskBadge } from '@/components/ui/risk-badge'
import type { Preventability, Respondent, RiskBand } from '@/lib/types'

interface Props {
  respondents: Respondent[]
  responses: Array<{
    respondent_id: string
    risk_score?: number | null
    risk_band?: RiskBand | null
    preventability?: Preventability | null
  }>
  scanType: string
  /** Wanneer false (n < 5) worden individuele frictiescores verborgen vanwege herleidbaarheidsrisico. */
  hasMinDisplay: boolean
  canManageCampaign: boolean
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const PREVENTABILITY_LABELS: Record<string, string> = {
  STERK_WERKSIGNAAL: 'Sterk werksignaal',
  GEMENGD_WERKSIGNAAL: 'Gemengd werksignaal',
  BEPERKT_WERKSIGNAAL: 'Beperkt werksignaal',
}

export function RespondentTable({ respondents, responses, scanType, hasMinDisplay, canManageCampaign }: Props) {
  const [copied, setCopied] = useState(false)
  const responseMap = new Map(responses.map(r => [r.respondent_id, r]))
  const pending = respondents.filter(r => !r.completed)
  const showIndividualScores = hasMinDisplay && scanType === 'exit'

  const pendingLinks = pending.map(r => `${API_BASE}/survey/${r.token}`).join('\n')

  async function copyLinks() {
    try {
      await navigator.clipboard.writeText(pendingLinks)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.getElementById('pending-links-textarea') as HTMLTextAreaElement | null
      el?.select()
    }
  }

  return (
    <div className="space-y-4">
      {!hasMinDisplay && responses.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Individuele frictiescores worden pas getoond vanaf 5 ingevulde responses (nu: {responses.length}).
          Dit beschermt de anonimiteit van respondenten.
        </div>
      )}
      {scanType === 'retention' && responses.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Bij RetentieScan tonen we in deze tabel bewust geen individuele scores of vertrekintentie. De uitkomsten zijn alleen bedoeld voor groeps- en segmentinzichten.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                {canManageCampaign ? 'Token' : 'Referentie'}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Afdeling</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Niveau</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
              {showIndividualScores && (
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Frictiescore
                  <span
                    className="ml-1 cursor-help text-gray-300"
                    title="Frictieschaal 1-10: hogere score = sterker signaal van ervaren werkfrictie. HOOG >= 7, MIDDEN 4.5-7, LAAG < 4.5."
                  >
                    i
                  </span>
                </th>
              )}
              {showIndividualScores && scanType === 'exit' && (
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Werksignaal
                  <span
                    className="ml-1 cursor-help text-gray-300"
                        title="Dit label vat samen hoe sterk de antwoorden wijzen op beïnvloedbare werkfactoren rondom vertrek. Het is een signaal, geen harde diagnose."
                  >
                    i
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
                  <td className="px-3 py-2 font-mono text-xs text-gray-400">
                    {canManageCampaign ? `${r.token.slice(0, 8)}...` : 'Verborgen'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{r.department ?? '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{r.role_level ?? '-'}</td>
                  <td className="px-3 py-2">
                    {r.completed ? (
                      <span className="text-xs font-medium text-green-600">Ingevuld</span>
                    ) : (
                      <span className="text-xs text-gray-400">Nog niet gestart</span>
                    )}
                  </td>
                  {showIndividualScores && (
                    <td className="px-3 py-2 text-right">
                      {resp?.risk_score ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-semibold text-gray-800">{resp.risk_score.toFixed(1)}</span>
                          <RiskBadge band={resp.risk_band ?? undefined} />
                        </div>
                      ) : '-'}
                    </td>
                  )}
                  {showIndividualScores && scanType === 'exit' && (
                    <td className="px-3 py-2 text-right text-xs text-gray-500">
                      {resp?.preventability
                        ? (PREVENTABILITY_LABELS[resp.preventability] ?? resp.preventability.replaceAll('_', ' '))
                        : '-'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {canManageCampaign && pending.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Openstaande survey-links ({pending.length})
            </h3>
            <button
              onClick={copyLinks}
              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
            >
              {copied ? 'Gekopieerd' : 'Kopieer alle links'}
            </button>
          </div>
          <textarea
            id="pending-links-textarea"
            readOnly
            className="h-28 w-full resize-none rounded-lg border border-blue-200 bg-blue-50 p-3 font-mono text-xs focus:outline-none"
            value={pendingLinks}
          />
        </div>
      )}
    </div>
  )
}
