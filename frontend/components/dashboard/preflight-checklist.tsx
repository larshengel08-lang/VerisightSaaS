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

  const items: Array<{
    key: string
    label: string
    auto: boolean
    checked: boolean
    note?: string
  }> = [
    {
      key: 'test_survey',
      label: 'Testsurvey doorlopen als respondent (eigen mailadres)',
      auto: false,
      checked: manualChecked.test_survey ?? false,
    },
    {
      key: 'invites_sent',
      label: 'Alle uitnodigingen verstuurd',
      auto: true,
      checked: invitesNotSent === 0,
      note: invitesNotSent > 0 ? `${invitesNotSent} nog niet verstuurd` : undefined,
    },
    {
      key: 'thank_you',
      label: 'Bedankpagina gecontroleerd na test-invul',
      auto: false,
      checked: manualChecked.thank_you ?? false,
    },
    {
      key: 'test_report',
      label: 'Testrapport gegenereerd en score gecontroleerd',
      auto: false,
      checked: hasMinDisplay ? (manualChecked.test_report ?? false) : false,
      note: !hasMinDisplay ? 'Wacht op min. 5 responses' : undefined,
    },
    {
      key: 'email_template',
      label: 'Mailtemplate gecontroleerd (naam, organisatie, link)',
      auto: false,
      checked: manualChecked.email_template ?? false,
    },
    ...(scanType === 'retention'
      ? [{
          key: 'followup_template',
          label: 'Follow-up outcomes-template klaargezet voor v1.1-validatie',
          auto: false,
          checked: manualChecked.followup_template ?? false,
          note: 'Leg team- of segmentuitkomsten vast na de baseline.',
        }]
      : []),
    {
      key: 'complete_scores',
      label: 'Geen incomplete scores in responses',
      auto: true,
      checked: incompleteScores === 0,
      note: incompleteScores > 0 ? `${incompleteScores} response(s) met ontbrekende scores` : undefined,
    },
    {
      key: 'sentry',
      label: 'Sentry actief en getest op deze omgeving',
      auto: false,
      checked: manualChecked.sentry ?? false,
    },
  ]

  const autoOk = items.filter((item) => item.auto && item.checked).length
  const manualDone = items.filter((item) => !item.auto && item.checked).length
  const total = items.length

  return (
    <details className="mb-4 rounded-xl border border-gray-200 bg-white group">
      <summary className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
        <span>Pre-flight checklist</span>
        <span className="text-xs font-normal text-gray-400 group-open:hidden">
          {autoOk + manualDone}/{total} OK
        </span>
      </summary>
      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
        <p className="mb-3 text-xs text-gray-500">
          Doorloop deze lijst voordat je de campaign live deelt met een klant.
          <span className="mx-1 rounded bg-gray-100 px-1 font-mono text-gray-500">auto</span>
          checks worden real-time bijgewerkt. Handmatige checks klik je zelf aan.
        </p>
        {scanType === 'retention' && (
          <p className="mb-3 text-xs text-emerald-800">
            Voor RetentieScan hoort bij livegang ook dat follow-up uitkomsten later op team- of segmentniveau kunnen worden vastgelegd. Dat is nodig om de v1.1-validatie niet te laten stranden op ontbrekende praktijkdata.
          </p>
        )}
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className={`flex items-start gap-2.5 text-sm ${!item.auto && hasMinDisplay ? 'cursor-pointer group/item' : ''}`}
              onClick={() => {
                if (!item.auto && !(item.key === 'test_report' && !hasMinDisplay)) {
                  toggleManual(item.key)
                }
              }}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-xs font-bold transition-colors ${
                  item.auto && item.checked
                    ? 'border-green-400 bg-green-100 text-green-600'
                    : item.auto && !item.checked
                      ? 'border-amber-400 bg-amber-100 text-amber-600'
                      : item.checked
                        ? 'border-green-400 bg-green-100 text-green-600'
                        : 'border-gray-300 bg-white text-gray-300 hover:border-blue-400'
                }`}
              >
                {item.auto ? (item.checked ? '✓' : '!') : (item.checked ? '✓' : '○')}
              </span>
              <span className="flex-1 select-none">
                <span className={item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}>
                  {item.label}
                </span>
                {item.note && (
                  <span className="ml-1.5 text-xs text-amber-600">({item.note})</span>
                )}
                {item.auto && (
                  <span className="ml-1.5 rounded bg-gray-100 px-1 text-xs font-mono text-gray-400">auto</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
