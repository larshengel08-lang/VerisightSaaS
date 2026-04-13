'use client'

import { useEffect, useState } from 'react'

interface Props {
  campaignId: string
  scanType: 'exit' | 'retention'
  totalInvited: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
}

export function PreflightChecklist({
  campaignId,
  scanType,
  totalInvited,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
}: Props) {
  const storageKey = `verisight_preflight_${campaignId}`
  const [manualChecked, setManualChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setManualChecked(JSON.parse(saved))
    } catch {
      // ignore localStorage parse errors
    }
  }, [storageKey])

  function toggleManual(key: string) {
    setManualChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // ignore localStorage write errors
      }
      return next
    })
  }

  if (totalInvited === 0) return null

  const items: Array<{ key: string; label: string; auto: boolean; checked: boolean; note?: string }> = [
    { key: 'test_survey', label: 'Testsurvey doorlopen als respondent (eigen mailadres)', auto: false, checked: manualChecked.test_survey ?? false },
    { key: 'invites_sent', label: 'Alle uitnodigingen verstuurd', auto: true, checked: invitesNotSent === 0, note: invitesNotSent > 0 ? `${invitesNotSent} nog niet verstuurd` : undefined },
    { key: 'thank_you', label: 'Bedankpagina gecontroleerd na testinvul', auto: false, checked: manualChecked.thank_you ?? false },
    { key: 'test_report', label: 'Testrapport gegenereerd en score gecontroleerd', auto: false, checked: hasMinDisplay ? (manualChecked.test_report ?? false) : false, note: !hasMinDisplay ? 'Wacht op min. 5 responses' : undefined },
    { key: 'email_template', label: 'Mailtemplate gecontroleerd (naam, organisatie, link)', auto: false, checked: manualChecked.email_template ?? false },
    ...(scanType === 'retention'
      ? [{ key: 'followup_template', label: 'Follow-up outcomes-template klaargezet voor v1.1-validatie', auto: false, checked: manualChecked.followup_template ?? false, note: 'Leg team- of segmentuitkomsten vast na de baseline.' }]
      : []),
    { key: 'complete_scores', label: 'Geen incomplete scores in responses', auto: true, checked: incompleteScores === 0, note: incompleteScores > 0 ? `${incompleteScores} response(s) met ontbrekende scores` : undefined },
    { key: 'sentry', label: 'Sentry actief en getest op deze omgeving', auto: false, checked: manualChecked.sentry ?? false },
  ]

  const doneCount = items.filter((item) => item.checked).length

  return (
    <details className="group rounded-[22px] border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Pre-flight checklist</p>
          <p className="mt-1 text-sm text-slate-500">Gebruik deze lijst vóór livegang of vóór je de campagne actief met een klant doorloopt.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {doneCount}/{items.length} gedaan
        </span>
      </summary>
      <div className="border-t border-slate-100 px-4 py-4">
        {scanType === 'retention' ? (
          <p className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            Voor RetentieScan hoort bij livegang ook dat follow-up uitkomsten later op team- of segmentniveau kunnen worden vastgelegd. Zo blijft de v1.1-validatie niet afhankelijk van losse reconstructies.
          </p>
        ) : null}
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.key}
              className={`rounded-2xl border px-4 py-3 ${item.checked ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/70'} ${!item.auto && !(item.key === 'test_report' && !hasMinDisplay) ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (!item.auto && !(item.key === 'test_report' && !hasMinDisplay)) toggleManual(item.key)
              }}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${item.checked ? 'bg-emerald-100 text-emerald-700' : item.auto ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-400 border border-slate-300'}`}>
                  {item.auto ? (item.checked ? '✓' : '!') : item.checked ? '✓' : '○'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.checked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{item.label}</p>
                  {item.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p> : null}
                  {item.auto ? <span className="mt-2 inline-flex rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">auto</span> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
