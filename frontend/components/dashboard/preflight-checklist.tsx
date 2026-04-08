'use client'

import { useState, useEffect } from 'react'

interface Props {
  campaignId: string
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
}

export function PreflightChecklist({
  campaignId,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
}: Props) {
  const STORAGE_KEY = `verisight_preflight_${campaignId}`

  // Handmatige checkstatus laden uit localStorage
  const [manualChecked, setManualChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setManualChecked(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [STORAGE_KEY])

  function toggleManual(key: string) {
    setManualChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  if (totalInvited === 0) return null

  const items: {
    key: string
    label: string
    auto: boolean
    checked: boolean
    note?: string
  }[] = [
    {
      key: 'test_survey',
      label: 'Testsurvey doorlopen als respondent (eigen mailadres)',
      auto: false,
      checked: manualChecked['test_survey'] ?? false,
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
      checked: manualChecked['thank_you'] ?? false,
    },
    {
      key: 'test_report',
      label: 'Testrapport gegenereerd en score gecontroleerd',
      auto: false,
      checked: hasMinDisplay ? (manualChecked['test_report'] ?? false) : false,
      note: !hasMinDisplay ? 'Wacht op min. 5 responses' : undefined,
    },
    {
      key: 'email_template',
      label: 'Mailtemplate gecontroleerd (naam, organisatie, link)',
      auto: false,
      checked: manualChecked['email_template'] ?? false,
    },
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
      checked: manualChecked['sentry'] ?? false,
    },
  ]

  const autoOk     = items.filter(i => i.auto && i.checked).length
  const manualDone = items.filter(i => !i.auto && i.checked).length
  const total      = items.length

  return (
    <details className="bg-white border border-gray-200 rounded-xl mb-4 group">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">
        <span>🛫 Pre-flight checklist</span>
        <span className="text-xs font-normal text-gray-400 group-open:hidden">
          {autoOk + manualDone}/{total} OK
        </span>
      </summary>
      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500 mb-3">
          Doorloop deze lijst vóórdat je de campaign live deelt met een klant.{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">auto</span>-checks worden real-time bijgewerkt.
          Handmatige checks klik je zelf aan.
        </p>
        <ul className="space-y-2">
          {items.map(item => (
            <li
              key={item.key}
              className={`flex items-start gap-2.5 text-sm ${!item.auto && hasMinDisplay ? 'cursor-pointer group/item' : ''}`}
              onClick={() => {
                if (!item.auto && !(item.key === 'test_report' && !hasMinDisplay)) {
                  toggleManual(item.key)
                }
              }}
            >
              <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border text-xs flex items-center justify-center font-bold transition-colors
                ${item.auto && item.checked  ? 'bg-green-100 border-green-400 text-green-600' :
                  item.auto && !item.checked ? 'bg-amber-100 border-amber-400 text-amber-600' :
                  item.checked               ? 'bg-green-100 border-green-400 text-green-600' :
                  'border-gray-300 bg-white text-gray-300 hover:border-blue-400'}`}>
                {item.auto
                  ? (item.checked ? '✓' : '!')
                  : (item.checked ? '✓' : '○')}
              </span>
              <span className="flex-1 select-none">
                <span className={item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}>
                  {item.label}
                </span>
                {item.note && (
                  <span className="ml-1.5 text-xs text-amber-600">({item.note})</span>
                )}
                {item.auto && (
                  <span className="ml-1.5 text-xs font-mono bg-gray-100 text-gray-400 px-1 rounded">auto</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
