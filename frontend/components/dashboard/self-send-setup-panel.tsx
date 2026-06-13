'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'
import {
  MIN_INVITED_COUNT,
  buildInviteTemplate,
  buildReminderTemplate,
  buildSurveyLink,
  computeResponseRatePct,
  normalizeSelfSendConfig,
  normalizeSelfSendReminders,
  type SelfSendConfig,
  type SelfSendReminder,
} from '@/lib/self-send-comms'

interface Props {
  campaignId: string
  scanType: ScanType
  organizationName: string
  publicSurveyToken: string
  frontendBaseUrl: string
  invitedCount: number | null
  config: SelfSendConfig
  reminders: SelfSendReminder[]
  launchConfirmedAt: string | null
  totalCompleted: number
  isActive: boolean
}

const STEP_LABELS = ['Scan', 'Deelnemers', 'E-mailinstellingen', 'Voorbeeld & kopieer', 'Bevestiging'] as const

async function copy(text: string, onDone: () => void) {
  try {
    await navigator.clipboard.writeText(text)
    onDone()
  } catch {
    /* clipboard unavailable — no-op */
  }
}

export function SelfSendSetupPanel({
  campaignId,
  scanType,
  organizationName,
  publicSurveyToken,
  frontendBaseUrl,
  invitedCount: initialInvited,
  config: initialConfig,
  reminders: initialReminders,
  launchConfirmedAt,
  totalCompleted,
  isActive,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState(launchConfirmedAt ? 4 : 0)
  const [invitedCount, setInvitedCount] = useState<number | ''>(initialInvited ?? '')
  const [bccPaste, setBccPaste] = useState('') // browser-only; never sent to the server
  const [config, setConfig] = useState<SelfSendConfig>(normalizeSelfSendConfig(initialConfig))
  const [reminders, setReminders] = useState<SelfSendReminder[]>(normalizeSelfSendReminders(initialReminders))
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const scanLabel = SCAN_TYPE_LABELS[scanType]
  const surveyLink = useMemo(
    () => buildSurveyLink(frontendBaseUrl, publicSurveyToken),
    [frontendBaseUrl, publicSurveyToken],
  )
  const inviteTpl = useMemo(
    () => buildInviteTemplate({ senderName: config.senderName, organizationName, scanLabel, surveyLink }),
    [config.senderName, organizationName, scanLabel, surveyLink],
  )
  const reminderTpl = useMemo(
    () => buildReminderTemplate({ senderName: config.senderName, organizationName, scanLabel, surveyLink }),
    [config.senderName, organizationName, scanLabel, surveyLink],
  )
  const inviteSubject = config.inviteSubject || inviteTpl.subject
  const inviteBody = config.inviteBody || inviteTpl.body
  const reminderSubject = config.reminderSubject || reminderTpl.subject
  const reminderBody = config.reminderBody || reminderTpl.body
  const responseRate = computeResponseRatePct(totalCompleted, typeof invitedCount === 'number' ? invitedCount : null)

  function flash(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function addReminder() {
    setReminders((prev) => [
      ...prev,
      { id: `r-${Date.now()}`, kind: 'relative', daysBeforeEnd: 3, date: null, notifiedAt: null },
    ])
  }

  async function save(confirmLaunch: boolean) {
    setError(null)
    setBusy(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/self-send-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_count: typeof invitedCount === 'number' ? invitedCount : null,
          self_send_config: {
            ...config,
            inviteSubject,
            inviteBody,
            reminderSubject,
            reminderBody,
          },
          self_send_reminders: reminders,
          confirm_launch: confirmLaunch,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as { detail?: string; message?: string }
      if (!response.ok) {
        setError(payload.detail ?? 'Opslaan mislukt.')
        return
      }
      flash(payload.message ?? 'Opgeslagen.')
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens opslaan.')
    } finally {
      setBusy(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100'

  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        {STEP_LABELS.map((label, index) => (
          <span key={label} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-slate-400">›</span> : null}
            <button
              type="button"
              onClick={() => setStep(index)}
              className={index === step ? 'font-semibold text-slate-900' : 'text-slate-500 hover:text-slate-700'}
            >
              {label}
            </button>
          </span>
        ))}
      </div>

      {/* Stap 0 — Scan context */}
      {step === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Afgesproken scan voor deze organisatie:</p>
          <div className="rounded-2xl border border-blue-600 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">{scanLabel}</p>
            <p className="mt-1 text-xs text-blue-700">Actief voor uw organisatie.</p>
          </div>
        </div>
      ) : null}

      {/* Stap 1 — Deelnemers */}
      {step === 1 ? (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Aantal uitgenodigde deelnemers</span>
            <input
              type="number"
              min={MIN_INVITED_COUNT}
              value={invitedCount}
              onChange={(e) => setInvitedCount(e.target.value === '' ? '' : Number(e.target.value))}
              className={fieldClass}
              placeholder="bijv. 34"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Minimaal {MIN_INVITED_COUNT}. Dit is de noemer voor het responspercentage.{' '}
              {typeof invitedCount === 'number' ? `${invitedCount} deelnemers` : ''}
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              BCC-hulp <span className="font-normal text-slate-400">(blijft in je browser, wordt nooit opgeslagen)</span>
            </span>
            <textarea
              rows={3}
              value={bccPaste}
              onChange={(e) => setBccPaste(e.target.value)}
              className={fieldClass}
              placeholder="Plak hier e-mailadressen om makkelijk naar BCC te kopiëren"
            />
            <button
              type="button"
              onClick={() => copy(bccPaste, () => flash('BCC-lijst gekopieerd.'))}
              className="mt-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
            >
              Kopieer BCC-lijst
            </button>
          </label>
        </div>
      ) : null}

      {/* Stap 2 — E-mailinstellingen */}
      {step === 2 ? (
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Afzendernaam (zoals medewerkers die zien)</span>
            <input
              type="text"
              maxLength={80}
              value={config.senderName}
              onChange={(e) => setConfig((c) => ({ ...c, senderName: e.target.value }))}
              className={fieldClass}
              placeholder="bijv. Sarah de Vries, HR"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Einddatum campagne</span>
            <input
              type="date"
              value={config.endDate ?? ''}
              onChange={(e) => setConfig((c) => ({ ...c, endDate: e.target.value || null }))}
              className={fieldClass}
            />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Reminders</span>
              <button
                type="button"
                onClick={addReminder}
                disabled={reminders.length >= 2}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 disabled:opacity-50"
              >
                + Reminder
              </button>
            </div>
            <p className="text-xs text-slate-500">Aanbevolen: 1 reminder, 3 dagen voor sluiting.</p>
            {reminders.map((reminder, index) => (
              <div key={reminder.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
                <select
                  value={reminder.kind}
                  onChange={(e) =>
                    setReminders((prev) =>
                      prev.map((r, i) =>
                        i === index ? { ...r, kind: e.target.value as SelfSendReminder['kind'] } : r,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                >
                  <option value="relative">Dagen voor einddatum</option>
                  <option value="absolute">Vaste datum</option>
                </select>
                {reminder.kind === 'relative' ? (
                  <input
                    type="number"
                    min={1}
                    value={reminder.daysBeforeEnd ?? 3}
                    onChange={(e) =>
                      setReminders((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, daysBeforeEnd: Number(e.target.value) } : r)),
                      )
                    }
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  />
                ) : (
                  <input
                    type="date"
                    value={reminder.date ?? ''}
                    onChange={(e) =>
                      setReminders((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, date: e.target.value || null } : r)),
                      )
                    }
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setReminders((prev) => prev.filter((_, i) => i !== index))}
                  className="ml-auto text-xs font-semibold text-red-600"
                >
                  Verwijder
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Stap 3 — Voorbeeld & kopieer */}
      {step === 3 ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Plak in Outlook of Gmail · Voeg deelnemers toe als BCC · Verstuur
          </div>
          {[
            { title: 'Uitnodiging', subject: inviteSubject, body: inviteBody },
            { title: 'Reminder', subject: reminderSubject, body: reminderBody },
          ].map((tab) => (
            <div key={tab.title} className="space-y-2 rounded-2xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">{tab.title}</p>
              <input readOnly value={tab.subject} className={fieldClass} />
              <textarea readOnly rows={8} value={tab.body} className={`${fieldClass} font-mono text-xs`} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(tab.subject, () => flash('Onderwerp gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer onderwerp
                </button>
                <button
                  type="button"
                  onClick={() => copy(tab.body, () => flash('Tekst gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer tekst
                </button>
                <button
                  type="button"
                  onClick={() => copy(surveyLink, () => flash('Link gekopieerd.'))}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300"
                >
                  Kopieer link
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Stap 4 — Bevestiging & lancering */}
      {step === 4 ? (
        <div className="space-y-4">
          {launchConfirmedAt ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Campagne is live.</p>
              <p className="mt-1">
                {totalCompleted} ingevuld{typeof invitedCount === 'number' ? ` van ${invitedCount}` : ''}
                {responseRate !== null ? ` · ${responseRate}% respons` : ''}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void save(false)}
                disabled={busy}
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : 'Campagne klaarzetten (opslaan)'}
              </button>
              <button
                type="button"
                onClick={() => void save(true)}
                disabled={busy || !isActive}
                className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? 'Bezig…' : 'Ik heb de uitnodiging verstuurd — zet live'}
              </button>
              <p className="text-xs text-slate-500">
                Responsmeting start pas wanneer je bevestigt dat de uitnodiging daadwerkelijk is verstuurd.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {toast ? (
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">{toast}</div>
      ) : null}
    </div>
  )
}
