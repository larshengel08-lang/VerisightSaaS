'use client'

import React from 'react'
import { useEffect, useState, useTransition } from 'react'
import { DashboardChip, DashboardSection } from '@/components/dashboard/dashboard-primitives'
import { isActionCenterRouteDefaultsEnabledScanType } from '@/lib/action-center-route-defaults'
import type { ActionCenterReviewRhythmConfig } from '@/lib/action-center-review-rhythm'

const CADENCE_OPTIONS = [7, 14, 30] as const
const REMINDER_OPTIONS = [1, 3, 5] as const
const ESCALATION_OPTIONS = [3, 7, 14] as const

type ReviewRhythmSummary = {
  staleCount: number
  overdueCount: number
  upcomingCount: number
  reminderManagedCount: number
}

function getRouteScopeValue(selectedRouteId: string | null, selectedRouteSourceId: string | null) {
  if (!selectedRouteId || !selectedRouteSourceId) {
    return null
  }

  const routePrefix = `${selectedRouteSourceId}::`
  if (!selectedRouteId.startsWith(routePrefix)) {
    return null
  }

  return selectedRouteId.slice(routePrefix.length)
}

function getSaveStatusTone(status: 'idle' | 'success' | 'error') {
  if (status === 'success') return 'emerald'
  if (status === 'error') return 'amber'
  return 'slate'
}

function getRouteProductLabel(scanType: string | null | undefined) {
  if (scanType === 'retention') return 'RetentieScan'
  if (scanType === 'exit') return 'ExitScan'
  return 'Follow-through'
}

export function ReviewRhythmConsole({
  selectedRouteId,
  selectedRouteLabel,
  selectedRouteSourceId = null,
  selectedRouteOrgId = null,
  selectedRouteScanType = 'exit',
  canManageReviewRhythm,
  config,
  summary,
  onConfigSaved,
}: {
  selectedRouteId: string | null
  selectedRouteLabel: string | null
  selectedRouteSourceId?: string | null
  selectedRouteOrgId?: string | null
  selectedRouteScanType?: string | null
  canManageReviewRhythm: boolean
  config: ActionCenterReviewRhythmConfig
  summary: ReviewRhythmSummary
  onConfigSaved?: ((nextConfig: ActionCenterReviewRhythmConfig) => void) | undefined
}) {
  const [draft, setDraft] = useState(config)
  const [saveState, setSaveState] = useState<{
    status: 'idle' | 'success' | 'error'
    message: string | null
  }>({
    status: 'idle',
    message: null,
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setDraft(config)
  }, [config])

  useEffect(() => {
    setSaveState({
      status: 'idle',
      message: null,
    })
  }, [selectedRouteId, selectedRouteSourceId, selectedRouteOrgId, selectedRouteScanType])

  const routeScopeValue = getRouteScopeValue(selectedRouteId, selectedRouteSourceId)
  const hasBoundedSelection = Boolean(
    selectedRouteId &&
      selectedRouteSourceId &&
      selectedRouteOrgId &&
      routeScopeValue &&
      isActionCenterRouteDefaultsEnabledScanType(selectedRouteScanType),
  )
  const canSave = canManageReviewRhythm && hasBoundedSelection

  function updateDraft<K extends keyof ActionCenterReviewRhythmConfig>(
    key: K,
    value: ActionCenterReviewRhythmConfig[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
    setSaveState({ status: 'idle', message: null })
  }

  async function persistDraft() {
    if (
      !selectedRouteId ||
      !selectedRouteSourceId ||
      !selectedRouteOrgId ||
      !routeScopeValue ||
      !isActionCenterRouteDefaultsEnabledScanType(selectedRouteScanType)
    ) {
      setSaveState({
        status: 'error',
        message: 'Kies eerst een zichtbare follow-through-route om reviewritme vast te leggen.',
      })
      return
    }

    try {
      const response = await fetch('/api/action-center-review-rhythm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routeId: selectedRouteId,
          routeScopeValue,
          routeSourceId: selectedRouteSourceId,
          orgId: selectedRouteOrgId,
          scanType: selectedRouteScanType,
          cadenceDays: draft.cadenceDays,
          reminderLeadDays: draft.reminderLeadDays,
          escalationLeadDays: draft.escalationLeadDays,
          remindersEnabled: draft.remindersEnabled,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { detail?: string } | null

      if (!response.ok) {
        setSaveState({
          status: 'error',
          message: payload?.detail ?? 'Reviewritme kon niet worden opgeslagen.',
        })
        return
      }

      setSaveState({
        status: 'success',
        message: 'Reviewritme opgeslagen voor deze follow-through-route.',
      })
      onConfigSaved?.(draft)
    } catch {
      setSaveState({
        status: 'error',
        message: 'Reviewritme kon niet worden opgeslagen.',
      })
    }
  }

  function handleSave() {
    startTransition(() => {
      void persistDraft()
    })
  }

  return (
    <DashboardSection
      surface="ops"
      eyebrow="Reviewritme"
      title="HR Rhythm Console"
      description="Beheer voor zichtbare follow-through-routes het reviewritme, reminder-venster en escalatiemoment zonder een generieke laag toe te voegen."
      aside={
        <div className="flex justify-start sm:justify-end">
          <DashboardChip
            surface="ops"
            tone={canManageReviewRhythm ? 'emerald' : 'slate'}
            label={canManageReviewRhythm ? 'HR beheer actief' : 'Alleen lezen'}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 shadow-[0_8px_22px_rgba(19,32,51,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
              Achter cadans
            </p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--dashboard-ink)]">{summary.staleCount}</p>
          </div>
          <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 shadow-[0_8px_22px_rgba(19,32,51,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
              Over tijd
            </p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--dashboard-ink)]">{summary.overdueCount}</p>
          </div>
          <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 shadow-[0_8px_22px_rgba(19,32,51,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
              Binnen cadans
            </p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--dashboard-ink)]">{summary.upcomingCount}</p>
          </div>
          <div className="rounded-[18px] border border-[color:var(--dashboard-frame-border)] bg-white p-4 shadow-[0_8px_22px_rgba(19,32,51,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
              Met reminder
            </p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--dashboard-ink)]">
              {summary.reminderManagedCount}
            </p>
          </div>
        </div>

        <div className="rounded-[22px] border border-[color:var(--dashboard-frame-border)] bg-white p-5 shadow-[0_10px_24px_rgba(19,32,51,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--dashboard-text)]">
                Gekozen route
              </p>
              <p className="text-lg font-semibold text-[color:var(--dashboard-ink)]">
                {selectedRouteLabel ?? 'Selecteer een reviewmoment'}
              </p>
              <p className="max-w-3xl text-sm leading-6 text-[color:var(--dashboard-text)]">
                Alleen ritmegegevens voor ingeschakelde follow-through-routes worden hier bijgehouden. Verzendlogica en eigenaarschap
                blijven buiten deze console.
              </p>
            </div>
            <DashboardChip surface="ops" tone="slate" label={getRouteProductLabel(selectedRouteScanType)} />
          </div>

          {hasBoundedSelection ? (
            <>
              <div className="mt-5 grid gap-3 lg:grid-cols-[repeat(3,minmax(0,200px)),minmax(0,1fr)]">
                <label className="space-y-2 text-sm text-[color:var(--dashboard-ink)]">
                  <span className="block font-medium">Cadans</span>
                  <select
                    aria-label="Cadans"
                    disabled={!canManageReviewRhythm}
                    value={String(draft.cadenceDays)}
                    onChange={(event) => updateDraft('cadenceDays', Number(event.target.value) as 7 | 14 | 30)}
                    className="w-full rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
                  >
                    {CADENCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} dagen
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-[color:var(--dashboard-ink)]">
                  <span className="block font-medium">Herinnering</span>
                  <select
                    aria-label="Herinnering"
                    disabled={!canManageReviewRhythm || !draft.remindersEnabled}
                    value={String(draft.reminderLeadDays)}
                    onChange={(event) => updateDraft('reminderLeadDays', Number(event.target.value) as 1 | 3 | 5)}
                    className="w-full rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
                  >
                    {REMINDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} dagen vooraf
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-[color:var(--dashboard-ink)]">
                  <span className="block font-medium">Escalatie</span>
                  <select
                    aria-label="Escalatie"
                    disabled={!canManageReviewRhythm}
                    value={String(draft.escalationLeadDays)}
                    onChange={(event) => updateDraft('escalationLeadDays', Number(event.target.value) as 3 | 7 | 14)}
                    className="w-full rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-3 text-sm text-[color:var(--dashboard-ink)]"
                  >
                    {ESCALATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} dagen na overschrijding
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-4 py-3 text-sm text-[color:var(--dashboard-ink)]">
                  <input
                    type="checkbox"
                    checked={draft.remindersEnabled}
                    disabled={!canManageReviewRhythm}
                    onChange={(event) => updateDraft('remindersEnabled', event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--dashboard-frame-border)]"
                  />
                  <span>
                    Herinneringen aan
                    <span className="block text-xs text-[color:var(--dashboard-text)]">
                      Alleen timing, geen verzending vanuit deze pagina.
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[color:var(--dashboard-text)]">
                  {saveState.message ? (
                    <span className={saveState.status === 'error' ? 'text-[#8C6B1F]' : 'text-[#2C6E68]'}>
                      {saveState.message}
                    </span>
                  ) : (
                    'Reviewritme wordt op routeniveau bewaard binnen Action Center.'
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || isPending}
                  className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--dashboard-ink)] transition hover:bg-[color:var(--dashboard-muted-surface)] disabled:cursor-not-allowed disabled:opacity-60"
                  data-save-tone={getSaveStatusTone(saveState.status)}
                >
                  {isPending ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-muted-surface)] px-4 py-4 text-sm leading-6 text-[color:var(--dashboard-text)]">
              Selecteer een reviewmoment om ritme-instellingen te bekijken.
            </div>
          )}
        </div>
      </div>
    </DashboardSection>
  )
}
