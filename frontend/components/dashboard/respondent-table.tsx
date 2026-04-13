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
  const responseMap = new Map(responses.map((response) => [response.respondent_id, response]))
  const pending = respondents.filter((respondent) => !respondent.completed)
  const showIndividualScores = hasMinDisplay && scanType === 'exit'
  const pendingLinks = pending.map((respondent) => `${API_BASE}/survey/${respondent.token}`).join('\n')

  async function copyLinks() {
    try {
      await navigator.clipboard.writeText(pendingLinks)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const element = document.getElementById('pending-links-textarea') as HTMLTextAreaElement | null
      element?.select()
    }
  }

  return (
    <div className="space-y-4">
      {!hasMinDisplay && responses.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Individuele frictiescores worden pas getoond vanaf 5 ingevulde responses. Daarmee beschermen we anonimiteit en voorkomen we te vroege detailduiding.
        </div>
      ) : null}

      {scanType === 'retention' && responses.length > 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Bij RetentieScan tonen we in deze tabel bewust geen individuele scores of vertrekintentie. De tabel blijft operationeel, terwijl de interpretatie op groepsniveau plaatsvindt.
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-[22px] border border-slate-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {canManageCampaign ? 'Token' : 'Referentie'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Afdeling</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Niveau</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</th>
              {showIndividualScores ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Frictiescore
                </th>
              ) : null}
              {showIndividualScores && scanType === 'exit' ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Werksignaal
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {respondents.map((respondent) => {
              const response = responseMap.get(respondent.id)
              return (
                <tr key={respondent.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {canManageCampaign ? `${respondent.token.slice(0, 8)}...` : 'Verborgen'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{respondent.department ?? '–'}</td>
                  <td className="px-4 py-3 text-slate-700">{respondent.role_level ?? '–'}</td>
                  <td className="px-4 py-3">
                    {respondent.completed ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Ingevuld
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Nog niet gestart
                      </span>
                    )}
                  </td>
                  {showIndividualScores ? (
                    <td className="px-4 py-3 text-right">
                      {response?.risk_score ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-slate-900">{response.risk_score.toFixed(1)}</span>
                          <RiskBadge band={response.risk_band ?? undefined} />
                        </div>
                      ) : (
                        '–'
                      )}
                    </td>
                  ) : null}
                  {showIndividualScores && scanType === 'exit' ? (
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {response?.preventability
                        ? PREVENTABILITY_LABELS[response.preventability] ?? response.preventability.replaceAll('_', ' ')
                        : '–'}
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {canManageCampaign && pending.length > 0 ? (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Openstaande survey-links</h3>
              <p className="mt-1 text-xs text-slate-500">{pending.length} respondent(en) wachten nog op een uitnodiging of reminder.</p>
            </div>
            <button
              onClick={copyLinks}
              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {copied ? 'Gekopieerd' : 'Kopieer alle links'}
            </button>
          </div>
          <textarea
            id="pending-links-textarea"
            readOnly
            className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={pendingLinks}
          />
        </div>
      ) : null}
    </div>
  )
}
