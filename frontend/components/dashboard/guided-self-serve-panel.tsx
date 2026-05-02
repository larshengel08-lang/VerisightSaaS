'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { resendPendingAction } from '@/app/(dashboard)/campaigns/[id]/actions'
import { buildResendResultMessage } from '@/app/(dashboard)/campaigns/[id]/reminder-feedback'
import { getCustomerActionPermission } from '@/lib/customer-permissions'
import { type DeliveryMode, type MemberRole, type ScanType } from '@/lib/types'

interface Props {
  campaignId: string
  scanType: ScanType
  isActive: boolean
  deliveryMode: DeliveryMode | null
  importReady: boolean
  hasSegmentDeepDive: boolean
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  pendingCount: number
  importQaConfirmed: boolean
  launchTimingConfirmed: boolean
  communicationReady: boolean
  remindableCount: number
  unsentRespondents: Array<{ token: string; email: string | null }>
  launchDate: string | null
  launchConfirmedAt: string | null
  participantCommsConfig: unknown
  reminderConfig: unknown
  memberRole: MemberRole | null
}

interface ImportIssue {
  row_number: number
  field: string
  message: string
}

interface ImportPreviewRow {
  row_number: number
  email: string
  department: string | null
  role_level: string | null
  exit_month: string | null
}

interface ImportResponse {
  dry_run: boolean
  total_rows: number
  valid_rows: number
  invalid_rows: number
  duplicate_existing: number
  recognized_columns: string[]
  ignored_columns: string[]
  blocking_messages: string[]
  preview_rows: ImportPreviewRow[]
  errors: ImportIssue[]
  imported: number
  emails_sent: number
  launch_blocked: boolean
  readiness_label: string
  recovery_hint: string
  invite_queue: Array<{ token: string; email: string | null }>
}

export function GuidedSelfServePanel({
  campaignId,
  scanType,
  isActive,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  pendingCount,
  remindableCount,
  unsentRespondents,
  memberRole,
}: Props) {
  const router = useRouter()
  const canImportRespondents = getCustomerActionPermission(memberRole, 'import_respondents')
  const canLaunchInvites = getCustomerActionPermission(memberRole, 'launch_invites')
  const canSendReminders = getCustomerActionPermission(memberRole, 'send_reminders')

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewResult, setPreviewResult] = useState<ImportResponse | null>(null)
  const [importSuccess, setImportSuccess] = useState<ImportResponse | null>(null)
  const [optimisticInviteQueue, setOptimisticInviteQueue] = useState<
    Array<{ token: string; email: string | null }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'preview' | 'import' | 'launch' | 'remind' | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setOptimisticInviteQueue([])
  }, [campaignId, unsentRespondents])

  const launchableRespondents = useMemo(() => {
    const source = optimisticInviteQueue.length > 0 ? optimisticInviteQueue : unsentRespondents
    return source.filter((r) => r.email)
  }, [optimisticInviteQueue, unsentRespondents])

  const hasPreviewErrors = (previewResult?.errors.length ?? 0) > 0
  const canImportPreview =
    Boolean(previewResult) &&
    !hasPreviewErrors &&
    (previewResult?.valid_rows ?? 0) > 0 &&
    previewResult?.launch_blocked !== true

  // 3-state step logic
  const isAfterImport =
    (importSuccess?.imported ?? 0) > 0 && (importSuccess?.emails_sent ?? 0) === 0
  const effectiveTotalInvited = isAfterImport ? (importSuccess?.imported ?? 0) : totalInvited
  const currentStep: 'upload' | 'launch' | 'active' =
    effectiveTotalInvited === 0
      ? 'upload'
      : invitesNotSent > 0 || isAfterImport
        ? 'launch'
        : 'active'

  async function requestImport(dryRun: boolean) {
    setError(null)
    setImportSuccess(null)
    if (!uploadFile) {
      setError('Kies eerst een CSV- of Excel-bestand.')
      return
    }
    setLoading(dryRun ? 'preview' : 'import')
    const body = new FormData()
    body.append('file', uploadFile)
    body.append('dry_run', String(dryRun))
    body.append('send_invites', 'false')
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/respondents/import`, {
        method: 'POST',
        body,
      })
      const payload = (await response.json().catch(() => ({}))) as Partial<ImportResponse> & {
        detail?: string
      }
      if (!response.ok) {
        setError(payload.detail ?? 'Import kon niet worden verwerkt.')
        setLoading(null)
        return
      }
      const typedPayload = payload as ImportResponse
      if (dryRun) {
        setPreviewResult(typedPayload)
      } else {
        setImportSuccess(typedPayload)
        setPreviewResult(null)
        setOptimisticInviteQueue(
          typedPayload.invite_queue.filter((r) => Boolean(r.email)),
        )
        router.refresh()
      }
    } catch {
      setError('Verbindingsfout tijdens import.')
    } finally {
      setLoading(null)
    }
  }

  async function startInvites() {
    setError(null)
    setLoading('launch')
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/respondents/send-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          launchableRespondents.map((r) => ({ token: r.token, email: r.email })),
        ),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string
        sent?: number
        failed?: number
        skipped?: number
      }
      if (!response.ok) {
        setError(payload.detail ?? 'Uitnodigingen konden niet worden gestart.')
        setLoading(null)
        return
      }
      const sent = payload.sent ?? 0
      const failed = payload.failed ?? 0
      const skipped = payload.skipped ?? 0
      setToast(
        sent > 0
          ? `${sent} uitnodiging(en) gestart.${failed > 0 || skipped > 0 ? ` ${failed} mislukt, ${skipped} overgeslagen.` : ''}`
          : 'Er zijn geen nieuwe uitnodigingen gestart.',
      )
      if (sent > 0) setOptimisticInviteQueue([])
      setTimeout(() => setToast(null), 4000)
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens het starten van uitnodigingen.')
    } finally {
      setLoading(null)
    }
  }

  async function resendPendingInvites() {
    setError(null)
    setLoading('remind')
    const result = await resendPendingAction(campaignId)
    setLoading(null)
    if (result.error) {
      setError(result.error)
      return
    }
    setToast(buildResendResultMessage(result))
    setTimeout(() => setToast(null), 4000)
    router.refresh()
  }

  const stepLabels = ['Aanleveren', 'Uitnodigen', 'Respons'] as const
  const stepKeys = ['upload', 'launch', 'active'] as const

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5 text-sm">
        {stepKeys.map((step, index) => {
          const isDone =
            (step === 'upload' && currentStep !== 'upload') ||
            (step === 'launch' && currentStep === 'active')
          const isCurrentStep = currentStep === step
          return (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-[color:var(--dashboard-muted)]">›</span>
              ) : null}
              <span
                className={
                  isCurrentStep
                    ? 'font-semibold text-[color:var(--dashboard-ink)]'
                    : isDone
                      ? 'text-[color:var(--dashboard-accent-strong)]'
                      : 'text-[color:var(--dashboard-muted)]'
                }
              >
                {stepLabels[index]}
              </span>
            </span>
          )
        })}
      </div>

      {/* STATE A: Upload */}
      {currentStep === 'upload' ? (
        <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-5 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Deelnemers aanleveren
          </h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">
            Upload een CSV- of Excel-bestand met minimaal een{' '}
            <code className="font-mono text-xs">email</code> kolom. Voeg ook afdeling en
            functieniveau toe voor segmentatie.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/templates/verisight-respondenten-template.xlsx"
              download
              className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)]"
            >
              Excel-template
            </a>
            <a
              href="/templates/verisight-respondenten-template.csv"
              download
              className="inline-flex rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)]"
            >
              CSV-template
            </a>
          </div>

          <div className="mt-5 space-y-4">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) => {
                setUploadFile(event.target.files?.[0] ?? null)
                setError(null)
                setPreviewResult(null)
                setImportSuccess(null)
              }}
              className="block w-full text-sm text-[color:var(--dashboard-text)] file:mr-3 file:rounded-lg file:border-0 file:bg-[color:var(--dashboard-soft)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[color:var(--dashboard-ink)] hover:file:bg-white"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void requestImport(true)}
                disabled={loading !== null || !uploadFile || !canImportRespondents}
                className="rounded-full border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:border-[color:var(--dashboard-accent-soft-border)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === 'preview' ? 'Controleren...' : 'Bestand controleren'}
              </button>
              {canImportPreview ? (
                <button
                  type="button"
                  onClick={() => void requestImport(false)}
                  disabled={loading !== null || !canImportRespondents}
                  className="rounded-full bg-[color:var(--dashboard-rail)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === 'import'
                    ? 'Importeren...'
                    : `Importeer ${previewResult?.valid_rows ?? 0} deelnemers`}
                </button>
              ) : null}
            </div>
          </div>

          {previewResult ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-soft)] p-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  <span className="font-semibold text-[color:var(--dashboard-ink)]">
                    {previewResult.valid_rows}
                  </span>{' '}
                  <span className="text-[color:var(--dashboard-muted)]">geldig</span>
                </span>
                {previewResult.invalid_rows > 0 ? (
                  <span>
                    <span className="font-semibold text-amber-700">{previewResult.invalid_rows}</span>{' '}
                    <span className="text-[color:var(--dashboard-muted)]">met fouten</span>
                  </span>
                ) : null}
                {previewResult.duplicate_existing > 0 ? (
                  <span>
                    <span className="font-semibold text-[color:var(--dashboard-muted)]">
                      {previewResult.duplicate_existing}
                    </span>{' '}
                    <span className="text-[color:var(--dashboard-muted)]">dubbel</span>
                  </span>
                ) : null}
              </div>
              {previewResult.blocking_messages.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {previewResult.blocking_messages[0]}
                </div>
              ) : null}
              {previewResult.errors.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--dashboard-frame-border)]">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          Rij
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          Veld
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          Uitleg
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--dashboard-frame-border)]">
                      {previewResult.errors.slice(0, 5).map((issue) => (
                        <tr key={`${issue.row_number}-${issue.field}-${issue.message}`}>
                          <td className="px-3 py-2 text-[color:var(--dashboard-text)]">
                            {issue.row_number}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-[color:var(--dashboard-muted)]">
                            {issue.field}
                          </td>
                          <td className="px-3 py-2 text-[color:var(--dashboard-text)]">
                            {issue.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {previewResult.preview_rows.length > 0 && !hasPreviewErrors ? (
                <div className="overflow-x-auto rounded-xl border border-[color:var(--dashboard-frame-border)] bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--dashboard-frame-border)]">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          E-mail
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          Afdeling
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                          Niveau
                        </th>
                        {scanType === 'exit' ? (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-[color:var(--dashboard-muted)]">
                            Exitmaand
                          </th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--dashboard-frame-border)]">
                      {previewResult.preview_rows.slice(0, 5).map((row) => (
                        <tr key={`${row.row_number}-${row.email}`}>
                          <td className="px-3 py-2 font-mono text-xs text-[color:var(--dashboard-text)]">
                            {row.email}
                          </td>
                          <td className="px-3 py-2 text-[color:var(--dashboard-text)]">
                            {row.department ?? '-'}
                          </td>
                          <td className="px-3 py-2 text-[color:var(--dashboard-text)]">
                            {row.role_level ?? '-'}
                          </td>
                          {scanType === 'exit' ? (
                            <td className="px-3 py-2 text-[color:var(--dashboard-text)]">
                              {row.exit_month ?? '-'}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : null}

          {importSuccess ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">{importSuccess.imported} deelnemer(s) toegevoegd</p>
            </div>
          ) : null}
        </div>
      ) : currentStep === 'launch' ? (
        /* STATE B: Participants loaded, invites not yet sent */
        <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-5 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Uitnodigingen starten
          </h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {launchableRespondents.length} deelnemer(s) klaar voor uitnodiging. Zodra je start,
            ontvangen zij de uitnodigingsmail van Verisight.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => void startInvites()}
              disabled={
                loading !== null || !canLaunchInvites || launchableRespondents.length === 0
              }
              className="rounded-full bg-[color:var(--dashboard-rail)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === 'launch'
                ? 'Uitnodigingen starten...'
                : `Start uitnodigingen (${launchableRespondents.length})`}
            </button>
          </div>
        </div>
      ) : (
        /* STATE C: Live — tracking responses */
        <div className="rounded-[24px] border border-[color:var(--dashboard-frame-border)] bg-[color:var(--dashboard-surface)] p-5 shadow-[0_1px_3px_rgba(10,25,47,0.03)]">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--dashboard-ink)]">
            Respons en reminders
          </h3>
          <p className="mt-1 text-sm leading-6 text-[color:var(--dashboard-text)]">
            {totalCompleted} van {totalInvited} respondenten hebben ingevuld
            {pendingCount > 0 ? ` · ${pendingCount} nog uitstaand` : ''}.
          </p>
          {remindableCount > 0 ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void resendPendingInvites()}
                disabled={loading !== null || !canSendReminders}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === 'remind'
                  ? 'Reminders versturen...'
                  : `Stuur reminder naar ${remindableCount}`}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--dashboard-muted)]">
              {isActive
                ? 'Geen openstaande reminders op dit moment.'
                : 'Campagne is gesloten.'}
            </p>
          )}
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {toast ? (
        <div className="rounded-2xl border border-[color:var(--dashboard-frame-border)] bg-slate-900 px-4 py-3 text-sm text-white">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
