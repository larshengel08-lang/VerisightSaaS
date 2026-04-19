'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildManagementActionSeedFromDepartmentRead,
  type ManagementActionDepartmentOwnerDefault,
} from '@/lib/management-actions'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'

interface Props {
  card: MtoActionCenterThemeCard
  organizationId: string
  campaignId: string
  ownerDefault?: ManagementActionDepartmentOwnerDefault | null
}

export function MtoActionComposer({ card, organizationId, campaignId, ownerDefault }: Props) {
  const router = useRouter()
  const [selectedQuestionKey, setSelectedQuestionKey] = useState(card.questionOptions[0]?.key ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedQuestion = useMemo(
    () => card.questionOptions.find((question) => question.key === selectedQuestionKey) ?? null,
    [card.questionOptions, selectedQuestionKey],
  )

  async function createAction() {
    setBusy(true)
    setError(null)

    try {
      const response = await fetch('/api/management-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          buildManagementActionSeedFromDepartmentRead({
            organizationId,
            campaignId,
            departmentRead: card.departmentRead,
            ownerDefault: ownerDefault ?? null,
            question: selectedQuestion,
          }),
        ),
      })

      const payload = (await response.json().catch(() => null)) as { detail?: string } | null
      if (!response.ok) {
        setError(payload?.detail ?? 'Actie openen mislukt.')
        return
      }

      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens openen van de actie.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nieuwe actie</p>
      <select
        value={selectedQuestionKey}
        onChange={(event) => setSelectedQuestionKey(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Alleen thema</option>
        {card.questionOptions.map((question) => (
          <option key={question.key} value={question.key}>
            {question.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={() => void createAction()}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Openen...' : 'Open actie'}
      </button>
    </div>
  )
}
