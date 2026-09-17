'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  closeCampaignAction,
  confirmReminderSentAction,
  extendCampaignAction,
  skipReminderAction,
  type DashboardActionResult,
} from '@/app/(dashboard)/dashboard/dashboard-actions'
import type { DashboardSecondaryAction, DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { ConfirmDialog, type ConfirmDialogAction } from './confirm-dialog'

type Busy = 'idle' | 'closing' | 'extending' | 'skipping' | 'confirming'

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--dashboard-ink)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:opacity-50'
const secondaryButtonClass =
  'text-sm font-semibold text-[color:var(--dashboard-accent-strong)] underline-offset-4 hover:underline disabled:opacity-50'

/**
 * Het enige interactieve stuk van de statuskaarten (spec 2026-09-16 par. 4.3
 * en 4.4). Alle knoppen komen uit de resolverstaat; dit eiland rendert ze en
 * roept de server actions aan. Sluiten gaat altijd via de eigen dialoog die
 * de gevolgen benoemt (boven én onder de rapportdrempel); verlengen en
 * herinnering overslaan zijn omkeerbaar genoeg om direct te doen.
 */
export function DashboardStateActions({ state, reminderText }: { state: DashboardState; reminderText: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<Busy>('idle')
  const [copied, setCopied] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const campaignId = state.campaignId

  // Eén plek voor de notice (Fail Loud): hij overleeft de state-overgang na
  // sluiten of verlengen omdat de kaart dit eiland altijd gemount houdt en
  // elke return-tak hieronder 'm meerendert.
  const noticeBlock = notice ? (
    <p role="status" className="max-w-md text-xs text-[color:var(--dashboard-muted)]">
      {notice}
    </p>
  ) : null
  const errorBlock = error ? (
    <p role="alert" className="text-xs text-red-600">
      {error}
    </p>
  ) : null

  async function run(kind: Busy, action: () => Promise<DashboardActionResult>, failLabel: string) {
    setError(null)
    setNotice(null)
    setBusy(kind)
    const result = await action()
    setBusy('idle')
    if (!result.ok) {
      setError(result.error ?? failLabel)
      return
    }
    setNotice(result.warning ?? null)
    router.refresh()
  }

  if (!campaignId) {
    return noticeBlock ? <div className="mt-6 flex flex-col items-start gap-2">{noticeBlock}</div> : null
  }

  const isBusy = busy !== 'idle'

  async function handleCopyReminder() {
    try {
      await navigator.clipboard.writeText(reminderText)
    } catch {
      // Clipboard can fail silently in some browsers; still advance so HR can confirm manual send.
    }
    setCopied(true)
  }

  function handleConfirmReminder() {
    return run('confirming', () => confirmReminderSentAction(campaignId!), 'Bevestigen mislukt.')
  }

  function handleClose() {
    setCloseDialogOpen(false)
    return run('closing', () => closeCampaignAction(campaignId!), 'Sluiten mislukt.')
  }

  function handleExtend() {
    setCloseDialogOpen(false)
    return run('extending', () => extendCampaignAction(campaignId!), 'Verlengen mislukt.')
  }

  function handleSkipReminder() {
    return run('skipping', () => skipReminderAction(campaignId!), 'Overslaan mislukt.')
  }

  function handleSecondary(action: DashboardSecondaryAction) {
    switch (action.kind) {
      case 'skip_reminder':
        return handleSkipReminder()
      case 'extend':
        return handleExtend()
      case 'close_campaign':
        setCloseDialogOpen(true)
        return
      case 'link':
      default:
        return
    }
  }

  const closeDialog = buildCloseDialog(state, {
    onClose: handleClose,
    onExtend: handleExtend,
    onCancel: () => setCloseDialogOpen(false),
  })

  const secondaryActions = state.secondaryActions.filter((action) => action.kind !== 'link')

  return (
    <div className="mt-6 flex flex-col items-start gap-3">
      {state.ctaKind === 'copy_reminder' ? (
        !copied ? (
          <button type="button" onClick={handleCopyReminder} className={primaryButtonClass}>
            Kopieer herinneringstekst
          </button>
        ) : (
          <button type="button" onClick={handleConfirmReminder} disabled={isBusy} className={primaryButtonClass}>
            {busy === 'confirming' ? 'Bevestigen...' : 'Ik heb de herinnering verstuurd'}
          </button>
        )
      ) : null}

      {state.ctaKind === 'close_campaign' ? (
        <button type="button" onClick={() => setCloseDialogOpen(true)} disabled={isBusy} className={primaryButtonClass}>
          {busy === 'closing' ? 'Sluiten...' : state.ctaLabel ?? 'Meting sluiten'}
        </button>
      ) : null}

      {state.ctaKind === 'extend' ? (
        <button type="button" onClick={handleExtend} disabled={isBusy} className={primaryButtonClass}>
          {busy === 'extending' ? 'Verlengen...' : state.ctaLabel ?? 'Twee weken verlengen'}
        </button>
      ) : null}

      {secondaryActions.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {secondaryActions.map((action) => (
            <button
              key={action.kind}
              type="button"
              onClick={() => handleSecondary(action)}
              disabled={isBusy}
              className={secondaryButtonClass}
            >
              {busy === 'skipping' && action.kind === 'skip_reminder'
                ? 'Overslaan...'
                : busy === 'extending' && action.kind === 'extend'
                  ? 'Verlengen...'
                  : action.label}
            </button>
          ))}
        </div>
      ) : null}

      {errorBlock}
      {noticeBlock}

      <ConfirmDialog
        open={closeDialogOpen}
        title="Meting sluiten"
        onClose={() => setCloseDialogOpen(false)}
        actions={closeDialog.actions}
      >
        {closeDialog.body}
      </ConfirmDialog>
    </div>
  )
}

/**
 * De sluitdialoog benoemt de gevolgen (spec 2026-09-16 par. 4.3). Onder de
 * drempel is verlengen de aangeraden weg zolang dat nog kan.
 */
function buildCloseDialog(
  state: DashboardState,
  handlers: { onClose: () => void; onExtend: () => void; onCancel: () => void },
): { body: ReactNode; actions: ConfirmDialogAction[] } {
  const counts = `Je sluit met ${state.totalCompleted} van ${state.totalInvited} ingevuld.`
  const cancel: ConfirmDialogAction = { label: 'Annuleren', onClick: handlers.onCancel }

  if (state.reportReady) {
    return {
      body: <p>{counts} Daarna kan niemand meer invullen en staat het rapport klaar.</p>,
      actions: [cancel, { label: 'Meting sluiten', onClick: handlers.onClose, variant: 'primary' }],
    }
  }

  const noReport = `Voor een rapport zijn minimaal ${state.reportThreshold} antwoorden nodig; die komen er dan niet.`
  if (state.canExtend) {
    return {
      body: (
        <p>
          {counts} {noReport} Wil je liever twee weken verlengen?
        </p>
      ),
      actions: [
        { label: 'Toch sluiten', onClick: handlers.onClose },
        { label: 'Twee weken verlengen', onClick: handlers.onExtend, variant: 'primary' },
      ],
    }
  }

  return {
    body: (
      <p>
        {counts} {noReport} Je hebt de meting al drie keer verlengd; verlengen kan niet meer.
      </p>
    ),
    actions: [cancel, { label: 'Toch sluiten', onClick: handlers.onClose, variant: 'primary' }],
  }
}
