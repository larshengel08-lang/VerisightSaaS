'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  closeCampaignAction,
  confirmReminderSentAction,
  extendCampaignAction,
  skipReminderAction,
  type DashboardActionResult,
} from '@/app/(dashboard)/dashboard/dashboard-actions'
import type { DashboardSecondaryAction, DashboardState } from '@/lib/dashboard/dashboard-state-resolver'
import { MAX_EXTENSIONS } from '@/lib/dashboard/campaign-extension'
import { isReminderTextAvailable, splitReminderText } from '@/lib/dashboard/reminder-text'
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
    try {
      const result = await action()
      if (!result.ok) {
        setError(result.error ?? failLabel)
        return
      }
      setNotice(result.warning ?? null)
      router.refresh()
    } catch (err) {
      // Een afgewezen server action (netwerk, verouderde deploy) mag de knop
      // niet stil laten hangen: melden en de knoppen weer vrijgeven.
      console.error('[DashboardStateActions] actie mislukt:', err)
      setError(`${failLabel} Controleer je verbinding en probeer het opnieuw.`)
    } finally {
      setBusy('idle')
    }
  }

  if (!campaignId) {
    return noticeBlock ? <div className="mt-6 flex flex-col items-start gap-2">{noticeBlock}</div> : null
  }

  const isBusy = busy !== 'idle'

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
        <>
          {isReminderTextAvailable(reminderText) ? (
            <ReminderComposer key={reminderText} reminderText={reminderText} onCopied={() => setCopied(true)} />
          ) : (
            <p role="alert" className="max-w-md whitespace-pre-line text-xs text-red-600">
              {reminderText}
            </p>
          )}
          <button type="button" onClick={handleConfirmReminder} disabled={!copied || isBusy} className={primaryButtonClass}>
            {busy === 'confirming' ? 'Bevestigen...' : 'Ik heb de herinnering verstuurd'}
          </button>
          {isReminderTextAvailable(reminderText) && !copied ? (
            <p className="text-xs text-[color:var(--dashboard-muted)]">
              Kopieer eerst het onderwerp en het bericht; daarna bevestig je hier dat je de herinnering hebt verstuurd.
            </p>
          ) : null}
        </>
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
        {counts} {noReport} Je hebt de meting al {MAX_EXTENSIONS} keer verlengd; verlengen kan niet meer.
      </p>
    ),
    actions: [cancel, { label: 'Toch sluiten', onClick: handlers.onClose, variant: 'primary' }],
  }
}

/**
 * Onderwerp en bericht van de herinnering, bewerkbaar en elk apart te
 * kopiëren (spec 2026-09-16 par. 4.4), zoals de wizard en de vroegere
 * "Campagne loopt"-kaart dat al deden. Eén blok kopiëren zette het onderwerp
 * in de mailtekst; dat is precies wat hier niet meer kan. Bevestigen ontgrendelt
 * pas als beide velden zijn gekopieerd (via de knop of handmatig met Ctrl+C),
 * en een mislukte klembordactie toont een melding in plaats van een valse
 * bevestiging (Fail Loud, spec-review 2026-09-17).
 */
function ReminderComposer({ reminderText, onCopied }: { reminderText: string; onCopied: () => void }) {
  const initial = splitReminderText(reminderText)
  const [subject, setSubject] = useState(initial.subject)
  const [body, setBody] = useState(initial.body)
  const [flashField, setFlashField] = useState<'subject' | 'body' | null>(null)
  const [errorField, setErrorField] = useState<'subject' | 'body' | null>(null)
  const copiedRef = useRef<{ subject: boolean; body: boolean }>({ subject: false, body: false })
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    }
  }, [])

  function flash(which: 'subject' | 'body') {
    setFlashField(which)
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    flashTimeoutRef.current = setTimeout(() => setFlashField(null), 2000)
  }

  // Een ref naast de state omdat de twee copy-acties na elkaar synchroon
  // moeten optellen: pas als subject en body allebei zijn gekopieerd (in
  // welke volgorde dan ook) mag de ouder bevestigen ontgrendelen.
  function markCopied(which: 'subject' | 'body') {
    copiedRef.current = { ...copiedRef.current, [which]: true }
    setErrorField((current) => (current === which ? null : current))
    flash(which)
    if (copiedRef.current.subject && copiedRef.current.body) {
      onCopied()
    }
  }

  async function copy(which: 'subject' | 'body') {
    const text = which === 'subject' ? subject : body
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fail Loud: geen fake "gekopieerd" tonen als het klembord dit weigert.
      // De klant krijgt een melding en de tekst wordt geselecteerd, zodat
      // handmatig kopiëren (Ctrl+C) meteen kan.
      setErrorField(which)
      ;(which === 'subject' ? subjectRef : bodyRef).current?.select()
      return
    }
    markCopied(which)
  }

  return (
    <div className="w-full max-w-lg rounded-[16px] border border-[color:var(--dashboard-frame-border)] bg-white p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--dashboard-muted)]">
        Herinneringsmail: pas aan en stuur vanuit je eigen e-mail
      </p>

      <p role="status" aria-live="polite" className="sr-only">
        {flashField === 'subject' ? 'Onderwerp gekopieerd.' : flashField === 'body' ? 'Bericht gekopieerd.' : ''}
      </p>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="reminder-subject" className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Onderwerp</label>
          <button
            type="button"
            onClick={() => copy('subject')}
            aria-label="Kopieer onderwerp"
            className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75"
          >
            {flashField === 'subject' ? 'Gekopieerd ✓' : 'Kopieer'}
          </button>
        </div>
        <input
          id="reminder-subject"
          ref={subjectRef}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onCopy={() => markCopied('subject')}
          className="w-full rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-base sm:text-xs text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
        />
        {errorField === 'subject' ? (
          <p role="alert" className="mt-1 text-[10px] text-red-600">
            Kopiëren lukte niet. Selecteer de tekst en kopieer met Ctrl+C.
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="reminder-body" className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--dashboard-muted)]">Bericht</label>
          <button
            type="button"
            onClick={() => copy('body')}
            aria-label="Kopieer bericht"
            className="text-[10px] font-semibold text-[#E8A020] hover:opacity-75"
          >
            {flashField === 'body' ? 'Gekopieerd ✓' : 'Kopieer'}
          </button>
        </div>
        <textarea
          id="reminder-body"
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onCopy={() => markCopied('body')}
          rows={10}
          className="w-full resize-y rounded-lg border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] px-3 py-2 text-base sm:text-xs leading-relaxed text-[color:var(--dashboard-ink)] focus:outline-none focus:ring-1 focus:ring-[#E8A020]/50"
        />
        {errorField === 'body' ? (
          <p role="alert" className="mt-1 text-[10px] text-red-600">
            Kopiëren lukte niet. Selecteer de tekst en kopieer met Ctrl+C.
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-[10px] text-[color:var(--dashboard-muted)]">
        Je kunt de tekst aanpassen voor je kopieert. Vergeet niet je naam in te vullen bij &ldquo;Met vriendelijke groet&rdquo;.
      </p>
    </div>
  )
}
