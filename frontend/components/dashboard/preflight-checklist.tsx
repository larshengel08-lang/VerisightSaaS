'use client'

import { useEffect, useState } from 'react'
import { getDeliveryModeLabel, normalizeDeliveryMode } from '@/lib/implementation-readiness'
import type { DeliveryMode, ScanType } from '@/lib/types'

interface Props {
  campaignId: string
  scanType: ScanType
  deliveryMode: DeliveryMode | null
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  activeClientAccessCount: number
  pendingClientInviteCount: number
}

type ChecklistItem = {
  key: string
  label: string
  auto: boolean
  checked: boolean
  note?: string
}

type ChecklistGroup = {
  title: string
  description: string
  items: ChecklistItem[]
}

export function PreflightChecklist({
  campaignId,
  scanType,
  deliveryMode,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
  hasEnoughData,
  activeClientAccessCount,
  pendingClientInviteCount,
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

  const resolvedMode = normalizeDeliveryMode(deliveryMode)
  const groups: ChecklistGroup[] = [
    {
      title: '1. Setup compleet',
      description: 'Controleer eerst route, setup en importkwaliteit voordat je invites of klantactivatie als live beschouwt.',
      items: [
        {
          key: 'route_confirmed',
          label: `Campaignroute bevestigd als ${getDeliveryModeLabel(resolvedMode, scanType)}`,
          auto: true,
          checked: true,
          note: resolvedMode === 'live'
            ? 'Live blijft een bewuste vervolgroute. Bevestig timing en eigenaarschap extra scherp.'
            : 'Baseline is de standaard eerste route.',
        },
        {
          key: 'test_survey',
          label: 'Testsurvey doorlopen als respondent met eigen e-mailadres',
          auto: false,
          checked: manualChecked.test_survey ?? false,
        },
        {
          key: 'import_quality',
          label: 'Importkwaliteit en metadata handmatig bevestigd',
          auto: false,
          checked: manualChecked.import_quality ?? false,
          note: scanType === 'retention'
            ? 'Voor RetentieScan zijn department en role_level de aanbevolen standaard.'
            : 'Bevestig dat bestand en gekozen route logisch bij elkaar passen.',
        },
      ],
    },
    {
      title: '2. Uitnodigingen live',
      description: 'Laat invites pas als live gelden wanneer de verzendlaag en eerste responssignalen kloppen.',
      items: [
        {
          key: 'invites_sent',
          label: 'Alle uitnodigingen verstuurd',
          auto: true,
          checked: invitesNotSent === 0,
          note: invitesNotSent > 0 ? `${invitesNotSent} respondent(en) missen nog een uitnodiging.` : undefined,
        },
        {
          key: 'email_template',
          label: 'Mailtemplate gecontroleerd op naam, organisatie en juiste link',
          auto: false,
          checked: manualChecked.email_template ?? false,
        },
        {
          key: 'thank_you',
          label: 'Bedankpagina gecontroleerd na testinvul',
          auto: false,
          checked: manualChecked.thank_you ?? false,
        },
      ],
    },
    {
      title: '3. Eerste output bruikbaar',
      description: 'Maak expliciet onderscheid tussen indicatieve output en een steviger eerste managementread.',
      items: [
        {
          key: 'min_display',
          label: 'Minimaal 5 responses bereikt voor veilige detailweergave',
          auto: true,
          checked: hasMinDisplay,
          note: !hasMinDisplay ? `${totalCompleted} van minimaal 5 responses bereikt.` : undefined,
        },
        {
          key: 'pattern_level',
          label: 'Minimaal 10 responses bereikt voor steviger patroonbeeld',
          auto: true,
          checked: hasEnoughData,
          note: !hasEnoughData ? `${totalCompleted} van minimaal 10 responses bereikt.` : undefined,
        },
        {
          key: 'complete_scores',
          label: 'Geen incomplete scoredata in opgeslagen responses',
          auto: true,
          checked: incompleteScores === 0,
          note: incompleteScores > 0 ? `${incompleteScores} response(s) met ontbrekende scoredata.` : undefined,
        },
        {
          key: 'test_report',
          label: 'Testrapport gegenereerd en eerste managementread gecontroleerd',
          auto: false,
          checked: hasMinDisplay ? (manualChecked.test_report ?? false) : false,
          note: !hasMinDisplay ? 'Wacht eerst op minimaal 5 responses.' : undefined,
        },
      ],
    },
    {
      title: '4. Klantactivatie en acceptatie',
      description: 'Gebruik deze laatste laag om dashboardtoegang, eerste contactmoment en adoptie te bevestigen.',
      items: [
        {
          key: 'client_access',
          label: 'Klantdashboardtoegang actief',
          auto: true,
          checked: activeClientAccessCount > 0,
          note: activeClientAccessCount > 0
            ? `${activeClientAccessCount} actieve klantaccount(s) gekoppeld.`
            : pendingClientInviteCount > 0
              ? `${pendingClientInviteCount} klantinvite(s) wachten nog op activatie.`
              : 'Nog geen klantactivatie gestart.',
        },
        {
          key: 'report_walkthrough',
          label: 'Rapportuitleg of walkthrough ingepland',
          auto: false,
          checked: manualChecked.report_walkthrough ?? false,
        },
        {
          key: 'first_management_use',
          label: 'Eerste managementgebruik bevestigd',
          auto: false,
          checked: manualChecked.first_management_use ?? false,
          note: 'Bevestig dat dashboard of rapport echt in een eerste gesprek gebruikt wordt.',
        },
        {
          key: 'sentry',
          label: 'Sentry of omgevingsmonitoring gecontroleerd voor deze campagne',
          auto: false,
          checked: manualChecked.sentry ?? false,
        },
      ],
    },
  ]

  const items = groups.flatMap((group) => group.items)
  const doneCount = items.filter((item) => item.checked).length

  return (
    <details className="group rounded-[22px] border border-slate-200 bg-white" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Launch en acceptance checklist</p>
          <p className="mt-1 text-sm text-slate-500">
            Gebruik deze lijst om setup, invites, eerste output en klantactivatie in een vaste volgorde af te vinken.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {doneCount}/{items.length} gedaan
        </span>
      </summary>
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          Route: <span className="font-semibold text-slate-900">{getDeliveryModeLabel(resolvedMode, scanType)}</span>.{' '}
          {resolvedMode === 'live'
            ? 'Bevestig timing, klantcommunicatie en eigenaarschap scherper dan bij een baseline-route.'
            : 'Gebruik baseline als standaard eerste implementation route en wijk alleen bewust af.'}
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.title} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
              </div>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li
                    key={item.key}
                    className={`rounded-2xl border px-4 py-3 ${
                      item.checked ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'
                    } ${item.auto ? '' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!item.auto) toggleManual(item.key)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                          item.checked
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.auto
                              ? 'bg-amber-100 text-amber-700'
                              : 'border border-slate-300 bg-white text-slate-400'
                        }`}
                      >
                        {item.checked ? 'OK' : item.auto ? '!' : '...'}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${item.checked ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {item.label}
                        </p>
                        {item.note ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p> : null}
                        {item.auto ? (
                          <span className="mt-2 inline-flex rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            auto
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </details>
  )
}
