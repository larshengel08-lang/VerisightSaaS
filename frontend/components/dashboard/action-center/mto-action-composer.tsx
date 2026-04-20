'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildManagementActionSeedFromDepartmentRead,
  validateManagementActionCreationDraft,
  type ManagementActionDepartmentOwnerDefault,
} from '@/lib/management-actions'
import type { MtoActionCenterThemeCard } from '@/lib/action-center/mto-cockpit'

interface Props {
  card: MtoActionCenterThemeCard
  organizationId: string
  campaignId: string
  ownerDefault?: ManagementActionDepartmentOwnerDefault | null
  mode?: 'inline' | 'detail'
}

export function MtoActionComposer({ card, organizationId, campaignId, ownerDefault, mode = 'inline' }: Props) {
  const router = useRouter()
  const [selectedQuestionKey, setSelectedQuestionKey] = useState(card.questionOptions[0]?.key ?? '')
  const [title, setTitle] = useState(`${card.departmentLabel}: ${card.factorLabel}`)
  const [ownerLabel, setOwnerLabel] = useState(ownerDefault?.owner_label ?? card.departmentRead.owner)
  const [ownerEmail, setOwnerEmail] = useState(ownerDefault?.owner_email ?? '')
  const [reviewDate, setReviewDate] = useState('')
  const [expectedOutcome, setExpectedOutcome] = useState('Heldere prioriteit, expliciete eigenaar en eerste reviewmoment.')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'owner_label' | 'review_date' | 'expected_outcome', string>>>({})
  const selectedQuestion = useMemo(
    () => card.questionOptions.find((question) => question.key === selectedQuestionKey) ?? null,
    [card.questionOptions, selectedQuestionKey],
  )

  async function createAction() {
    const validationErrors = validateManagementActionCreationDraft({
      title,
      owner_label: ownerLabel,
      owner_email: ownerEmail,
      review_date: reviewDate,
      expected_outcome: expectedOutcome,
    })
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

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
            guidedFields: {
              title,
              owner_label: ownerLabel,
              owner_email: ownerEmail,
              review_date: reviewDate,
              expected_outcome: expectedOutcome,
            },
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
    <div className={`space-y-3 rounded-2xl border border-slate-200 p-4 ${mode === 'detail' ? 'bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]' : 'bg-white'}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nieuwe actie</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {mode === 'detail'
            ? 'Open vanuit deze themadetail de eerste managementcommitment. Houd het bounded, maar leg wel direct eigenaar, reviewmoment en beoogde uitkomst vast.'
            : 'Open hier de eerste managementcommitment voor dit thema. Houd het bounded, maar leg wel direct eigenaar, reviewmoment en beoogde uitkomst vast.'}
        </p>
      </div>
      <label className="space-y-1 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Titel</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Eigenaar</span>
          <input
            type="text"
            value={ownerLabel}
            onChange={(event) => setOwnerLabel(event.target.value)}
            className={inputClass}
          />
          {fieldErrors.owner_label ? <span className="text-xs text-red-700">{fieldErrors.owner_label}</span> : null}
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Owner email</span>
          <input
            type="email"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <select
        value={selectedQuestionKey}
        onChange={(event) => setSelectedQuestionKey(event.target.value)}
        className={inputClass}
      >
        <option value="">Alleen thema</option>
        {card.questionOptions.map((question) => (
          <option key={question.key} value={question.key}>
            {question.label}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Eerste reviewmoment</span>
          <input
            type="date"
            value={reviewDate}
            onChange={(event) => setReviewDate(event.target.value)}
            className={inputClass}
          />
          {fieldErrors.review_date ? <span className="text-xs text-red-700">{fieldErrors.review_date}</span> : null}
        </label>
      </div>
      <label className="space-y-1 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Verwachte uitkomst</span>
        <textarea
          value={expectedOutcome}
          onChange={(event) => setExpectedOutcome(event.target.value)}
          rows={3}
          className={`${inputClass} min-h-24 resize-y`}
        />
        {fieldErrors.expected_outcome ? <span className="text-xs text-red-700">{fieldErrors.expected_outcome}</span> : null}
      </label>
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

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
