'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { resendPendingAction } from '@/app/(dashboard)/campaigns/[id]/actions'
import { buildResendResultMessage } from '@/app/(dashboard)/campaigns/[id]/reminder-feedback'
import {
  DashboardChip,
  DashboardPanel,
} from '@/components/dashboard/dashboard-primitives'
import { CLIENT_FILE_SPEC } from '@/lib/client-onboarding'
import { buildGuidedSelfServeState } from '@/lib/guided-self-serve'
import {
  getDeliveryModeDescription,
  getInviteDefaultForDeliveryMode,
  getDeliveryModeLabel,
} from '@/lib/implementation-readiness'
import {
  type DeliveryMode,
  REPORT_ADD_ON_LABELS,
  SCAN_TYPE_LABELS,
  type ScanType,
} from '@/lib/types'

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
  remindableCount: number
  unsentRespondents: Array<{ token: string; email: string | null }>
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
}

function getStatusTone(status: 'done' | 'current' | 'blocked') {
  if (status === 'done') return 'emerald' as const
  if (status === 'current') return 'blue' as const
  return 'slate' as const
}

export function GuidedSelfServePanel({
  campaignId,
  scanType,
  isActive,
  deliveryMode,
  importReady,
  hasSegmentDeepDive,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  hasMinDisplay,
  hasEnoughData,
  pendingCount,
  remindableCount,
  unsentRespondents,
}: Props) {
  const router = useRouter()
  const guidedState = useMemo(
    () =>
      buildGuidedSelfServeState({
        isActive,
        totalInvited,
        totalCompleted,
        invitesNotSent,
        hasMinDisplay,
        hasEnoughData,
        importReady,
      }),
    [hasEnoughData, hasMinDisplay, importReady, invitesNotSent, isActive, totalCompleted, totalInvited],
  )
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadSendInvites, setUploadSendInvites] = useState(true)
  const [previewResult, setPreviewResult] = useState<ImportResponse | null>(null)
  const [importSuccess, setImportSuccess] = useState<ImportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'preview' | 'import' | 'launch' | 'remind' | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setUploadSendInvites(getInviteDefaultForDeliveryMode(deliveryMode))
  }, [campaignId, deliveryMode])

  async function requestImport(dryRun: boolean) {
    setError(null)
    setImportSuccess(null)

    if (!uploadFile) {
      setError('Kies eerst een CSV- of Excel-bestand met deelnemers.')
      return
    }

    setLoading(dryRun ? 'preview' : 'import')
    const body = new FormData()
    body.append('file', uploadFile)
    body.append('dry_run', String(dryRun))
    body.append('send_invites', String(uploadSendInvites))

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
        router.refresh()
      }
    } catch {
      setError('Verbindingsfout tijdens import.')
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

  async function startInvites() {
    setError(null)
    setLoading('launch')

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/respondents/send-invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          unsentRespondents
            .filter((respondent) => respondent.email)
            .map((respondent) => ({
              token: respondent.token,
              email: respondent.email,
            })),
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
      setTimeout(() => setToast(null), 4000)
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens het starten van uitnodigingen.')
    } finally {
      setLoading(null)
    }
  }

  const hasPreviewErrors = (previewResult?.errors.length ?? 0) > 0
  const canImportPreview =
    Boolean(previewResult) &&
    !hasPreviewErrors &&
    (previewResult?.valid_rows ?? 0) > 0 &&
    previewResult?.launch_blocked !== true
  const previewMissingDepartmentCount =
    previewResult?.preview_rows.filter((row) => !row.department?.trim()).length ?? 0
  const previewMissingRoleLevelCount =
    previewResult?.preview_rows.filter((row) => !row.role_level?.trim()).length ?? 0
  const localValidationState =
    previewResult && hasPreviewErrors
      ? 'Import validatie vereist'
      : previewResult && canImportPreview
        ? 'Import klaar voor launch'
        : null

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#d6e4e8] bg-[#f6fafb] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Begeleide uitvoering
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{guidedState.headline}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{guidedState.detail}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">
              Volgende stap: {guidedState.nextAction.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{guidedState.nextAction.body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardChip
              label={guidedState.dashboardVisible ? 'Dashboard vrijgegeven' : 'Dashboard nog niet actief'}
              tone={guidedState.dashboardVisible ? 'emerald' : 'amber'}
            />
            {localValidationState ? (
              <DashboardChip
                label={localValidationState}
                tone={hasPreviewErrors ? 'amber' : 'blue'}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {guidedState.statusBlocks.map((item) => (
            <DashboardChip
              key={item.key}
              label={item.label}
              tone={getStatusTone(item.status)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardPanel
          eyebrow="Verisight doet"
          title="Provisioning en campaigngrenzen"
          body="Account, campaign, productkaders en de begrensde outputroute staan al klaar. Je hoeft geen surveytool of setuparchitectuur te beheren."
          tone="blue"
        />
        <DashboardPanel
          eyebrow="Jij doet nu"
          title={
            totalInvited === 0
              ? 'Lever deelnemers aan'
              : invitesNotSent > 0
                ? 'Start de inviteflow'
                : pendingCount > 0
                  ? 'Volg respons en reminders'
                  : guidedState.deeperInsightsVisible
                    ? 'Maak de eerste stap expliciet'
                    : 'Lees eerst de compacte output'
          }
          body={guidedState.nextAction.body}
          tone="emerald"
        />
        <DashboardPanel
          eyebrow="Dashboardactivatie"
          title="5 responses voor eerste read, 10 voor verdieping"
          body="Het dashboard gaat pas zichtbaar open zodra de eerste veilige responsdrempel is gehaald. Verdiepende patronen en scherpere prioritering volgen bewust pas vanaf 10 responses."
          tone={guidedState.deeperInsightsVisible ? 'emerald' : 'amber'}
        />
      </div>

      {isActive ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(19,32,51,0.05)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Deelnemers importeren
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                Upload het deelnemersbestand in dezelfde begrensde flow
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Gebruik bij voorkeur een eenvoudig Excel- of CSV-bestand met minimaal{' '}
                <code className="font-mono">email</code>. Aanbevolen: {CLIENT_FILE_SPEC.recommended.join(', ')}
                . {scanType === 'exit' ? `Exit-specifiek optioneel: ${CLIENT_FILE_SPEC.exitOptional.join(', ')}.` : ''}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Lever minimaal {CLIENT_FILE_SPEC.minimumParticipants} deelnemers aan voordat launch kan worden vrijgegeven.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Route: {SCAN_TYPE_LABELS[scanType]} {getDeliveryModeLabel(deliveryMode, scanType)}.{' '}
                {getDeliveryModeDescription(deliveryMode, scanType)}
              </p>
              {hasSegmentDeepDive ? (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Voor {REPORT_ADD_ON_LABELS.segment_deep_dive.toLowerCase()} zijn{' '}
                  <code className="font-mono">department</code> en{' '}
                  <code className="font-mono">role_level</code> sterk aanbevolen.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/templates/verisight-respondenten-template.xlsx"
                download
                className="inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
              >
                Download Excel-template
              </a>
              <a
                href="/templates/verisight-respondenten-template.csv"
                download
                className="inline-flex rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3]"
              >
                Download CSV-template
              </a>
            </div>
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
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />

            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={uploadSendInvites}
                onChange={(event) => setUploadSendInvites(event.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                Verstuur direct uitnodigingen na een geslaagde import
                <span className="block text-xs leading-5 text-slate-500">
                  Zet dit uit als je eerst alleen de import wilt valideren en de launch later bewust wilt starten.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void requestImport(true)}
                disabled={loading !== null || !uploadFile}
                className="rounded-full border border-[#d6e4e8] bg-[#f3f8f8] px-4 py-2 text-sm font-semibold text-[#234B57] transition-colors hover:border-[#bfd3d8] hover:bg-[#e9f2f3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === 'preview' ? 'Bestand controleren...' : 'Bestand controleren'}
              </button>
              {canImportPreview ? (
                <button
                  type="button"
                  onClick={() => void requestImport(false)}
                  disabled={loading !== null}
                  className="rounded-full bg-[#234B57] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === 'import'
                    ? 'Importeren...'
                    : uploadSendInvites
                      ? `Importeer en nodig ${previewResult?.valid_rows ?? 0} deelnemers uit`
                      : `Importeer ${previewResult?.valid_rows ?? 0} deelnemers`}
                </button>
              ) : null}
              {importReady && invitesNotSent > 0 && unsentRespondents.length > 0 ? (
                <button
                  type="button"
                  onClick={() => void startInvites()}
                  disabled={loading !== null}
                  className="rounded-full bg-[#234B57] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === 'launch'
                    ? 'Uitnodigingen starten...'
                    : `Start uitnodigingen (${unsentRespondents.length})`}
                </button>
              ) : null}
              {remindableCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void resendPendingInvites()}
                  disabled={loading !== null}
                  className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === 'remind' ? 'Herinneringen versturen...' : `Stuur reminder naar ${remindableCount}`}
                </button>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {toast ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white">
                {toast}
              </div>
            ) : null}

            {importSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-semibold">
                  {importSuccess.imported} deelnemer(s) toegevoegd
                </p>
                <p className="mt-1 leading-6">
                  {importSuccess.emails_sent > 0
                    ? `${importSuccess.emails_sent} uitnodiging(en) zijn direct verstuurd.`
                    : 'De deelnemers zijn toegevoegd. Start de inviteflow zodra timing en communicatie kloppen.'}
                </p>
              </div>
            ) : null}

            {previewResult ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <DashboardPanel eyebrow="Preview" title={`${previewResult.total_rows}`} body="Rijen aangeleverd" tone="slate" />
                  <DashboardPanel eyebrow="Geldig" title={`${previewResult.valid_rows}`} body="Rijen zonder fouten" tone="emerald" />
                  <DashboardPanel eyebrow="Fouten" title={`${previewResult.invalid_rows}`} body="Rijen die eerst gecorrigeerd moeten worden" tone={previewResult.invalid_rows > 0 ? 'amber' : 'slate'} />
                  <DashboardPanel eyebrow="Bestaat al" title={`${previewResult.duplicate_existing}`} body="Dubbele adressen in deze campagne" tone={previewResult.duplicate_existing > 0 ? 'amber' : 'slate'} />
                </div>

                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    previewResult.launch_blocked
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  }`}
                >
                  <p className="font-semibold">{previewResult.readiness_label}</p>
                  <p className="mt-1 leading-6">{previewResult.recovery_hint}</p>
                  {previewResult.ignored_columns.length > 0 ? (
                    <p className="mt-2 text-xs leading-5">
                      Niet herkend: {previewResult.ignored_columns.join(', ')}.
                    </p>
                  ) : null}
                </div>

                {previewResult.blocking_messages.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <p className="font-semibold">Je kunt nog niet verder</p>
                    <ul className="mt-2 space-y-1 text-xs leading-5">
                      {previewResult.blocking_messages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(previewMissingDepartmentCount > 0 || previewMissingRoleLevelCount > 0) ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">Metadata verdient nog controle</p>
                    <p className="mt-1 leading-6">
                      {previewMissingDepartmentCount > 0
                        ? `${previewMissingDepartmentCount} rij(en) missen afdeling. `
                        : ''}
                      {previewMissingRoleLevelCount > 0
                        ? `${previewMissingRoleLevelCount} rij(en) missen functieniveau. `
                        : ''}
                      Zonder nette metadata blijft segmentatie en vervolguitleg beperkter.
                    </p>
                  </div>
                ) : null}

                {previewResult.errors.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Import validatie vereist</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Corrigeer eerst deze rijen en controleer daarna opnieuw. Pas zonder fouten wordt uitnodigen vrijgegeven.
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Rij</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Veld</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Uitleg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewResult.errors.slice(0, 8).map((issue) => (
                            <tr key={`${issue.row_number}-${issue.field}-${issue.message}`}>
                              <td className="px-3 py-2 text-slate-700">{issue.row_number}</td>
                              <td className="px-3 py-2 font-mono text-xs text-slate-600">{issue.field}</td>
                              <td className="px-3 py-2 text-slate-700">{issue.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {previewResult.preview_rows.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-950">Preview van geldige rijen</p>
                    <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Rij</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">E-mail</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Afdeling</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Niveau</th>
                            {scanType === 'exit' ? (
                              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.18em]">Exitmaand</th>
                            ) : null}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewResult.preview_rows.slice(0, 8).map((row) => (
                            <tr key={`${row.row_number}-${row.email}`}>
                              <td className="px-3 py-2 text-slate-700">{row.row_number}</td>
                              <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.email}</td>
                              <td className="px-3 py-2 text-slate-700">{row.department || '-'}</td>
                              <td className="px-3 py-2 text-slate-700">{row.role_level || '-'}</td>
                              {scanType === 'exit' ? (
                                <td className="px-3 py-2 text-slate-700">{row.exit_month || '-'}</td>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
