'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRespondentsAction } from '@/app/(dashboard)/beheer/respondent-actions'
import {
  getDeliveryModeDescription,
  getDeliveryModeLabel,
  getInviteDefaultForDeliveryMode,
  normalizeDeliveryMode,
} from '@/lib/implementation-readiness'
import {
  SCAN_TYPE_LABELS,
  type Campaign,
  type Organization,
} from '@/lib/types'
import { CLIENT_FILE_SPEC } from '@/lib/client-onboarding'
import {
  getDefaultCampaignId,
  parseEmails as parseEmailList,
} from '@/components/dashboard/add-respondents-form.shared'

const ROLE_LEVELS = [
  { value: '', label: '— niet opgegeven —' },
  { value: 'uitvoerend', label: 'Uitvoerend' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'senior', label: 'Senior specialist' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'c_level', label: 'C-level' },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Props {
  campaigns: Campaign[]
  organizations: Organization[]
}

type Mode = 'emails' | 'bulk' | 'upload'

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
  annual_salary_eur: number | null
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

export function AddRespondentsForm({ campaigns, organizations }: Props) {
  const router = useRouter()

  const [campaignId, setCampaignId] = useState(getDefaultCampaignId(campaigns))
  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === campaignId) ?? null,
    [campaignId, campaigns],
  )
  const organizationById = useMemo(
    () => Object.fromEntries(organizations.map((organization) => [organization.id, organization.name])),
    [organizations],
  )
  const selectedDeliveryMode = normalizeDeliveryMode(selectedCampaign?.delivery_mode)
  const isExitCampaign = selectedCampaign?.scan_type === 'exit'
  const [mode, setMode] = useState<Mode>('emails')

  const [emailInput, setEmailInput] = useState('')
  const [department, setDepartment] = useState('')
  const [roleLevel, setRoleLevel] = useState('')
  const [exitMonth, setExitMonth] = useState('')
  const [salary, setSalary] = useState('')
  const [count, setCount] = useState(5)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadSendInvites, setUploadSendInvites] = useState(true)
  const [previewResult, setPreviewResult] = useState<ImportResponse | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'submit' | 'preview' | 'import' | null>(null)
  const [result, setResult] = useState<{ tokens: string[]; emailsSent: number } | null>(null)
  const [importSuccess, setImportSuccess] = useState<ImportResponse | null>(null)

  useEffect(() => {
    setUploadSendInvites(getInviteDefaultForDeliveryMode(selectedCampaign?.delivery_mode))
  }, [selectedCampaign?.id, selectedCampaign?.delivery_mode])

  function parseEmails(raw: string): string[] {
    return parseEmailList(raw)
  }

  function resetFeedback() {
    setError(null)
    setResult(null)
    setImportSuccess(null)
  }

  function resetUploadState() {
    setPreviewResult(null)
    setImportSuccess(null)
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()
    setLoading('submit')

    const emails = mode === 'emails' ? parseEmails(emailInput) : []
    if (mode === 'emails' && emails.length === 0) {
      setError('Voer minimaal één geldig e-mailadres in.')
      setLoading(null)
      return
    }
    if (!department.trim()) {
      setError('Afdeling is verplicht voor deze respondentimport.')
      setLoading(null)
      return
    }
    if (!roleLevel) {
      setError('Functieniveau is verplicht voor deze respondentimport.')
      setLoading(null)
      return
    }

    const respondents =
      mode === 'emails'
        ? emails.map((email) => ({
            email,
            department: department || null,
            role_level: roleLevel || null,
            exit_month: exitMonth || null,
            annual_salary_eur: salary ? parseFloat(salary) : null,
          }))
        : Array.from({ length: count }, () => ({
            email: null,
            department: department || null,
            role_level: roleLevel || null,
            exit_month: exitMonth || null,
            annual_salary_eur: salary ? parseFloat(salary) : null,
          }))

    const rows = respondents.map((respondent) => ({
      campaign_id: campaignId,
      department: respondent.department,
      role_level: respondent.role_level,
      exit_month: respondent.exit_month,
      annual_salary_eur: respondent.annual_salary_eur,
      email: respondent.email,
    }))

    // Insert loopt na de audit-lockdown (H1) via een service-role server-action:
    // token/email zijn niet meer via de browser-client leesbaar.
    const actionResult = await createRespondentsAction(rows)
    if (!actionResult.ok) {
      setError(actionResult.error)
      setLoading(null)
      return
    }
    const data = actionResult.created

    let emailsSent = 0
    if (mode === 'emails' && emails.length > 0) {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/respondents/send-invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            data
              .filter((row): row is { token: string; email: string } => row.email !== null)
              .map((row) => ({ token: row.token, email: row.email })),
          ),
        })
        if (response.ok) {
          const json = await response.json()
          emailsSent = json.sent ?? 0
        }
      } catch {
        // Niet blokkerend; links blijven bruikbaar.
      }
    }

    setResult({ tokens: data.map((row: { token: string }) => row.token), emailsSent })
    setLoading(null)
    router.refresh()
  }

  async function requestImport(dryRun: boolean) {
    resetFeedback()

    if (!uploadFile) {
      setError('Kies eerst een .csv of .xlsx bestand.')
      return
    }
    if (!campaignId) {
      setError('Kies eerst een campaign.')
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
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? 'Import kon niet worden verwerkt.')
        setLoading(null)
        return
      }

      const payload = json as ImportResponse
      if (dryRun) {
        setPreviewResult(payload)
      } else {
        setImportSuccess(payload)
        setPreviewResult(null)
        router.refresh()
      }
    } catch {
      setError('Verbindingsfout tijdens import.')
    } finally {
      setLoading(null)
    }
  }

  const hasPreviewErrors = (previewResult?.errors.length ?? 0) > 0
  const canImportPreview =
    !!previewResult &&
    !hasPreviewErrors &&
    previewResult.valid_rows > 0 &&
    previewResult.launch_blocked !== true
  const previewMissingDepartmentCount =
    previewResult?.preview_rows.filter((row) => !row.department?.trim()).length ?? 0
  const previewMissingRoleLevelCount =
    previewResult?.preview_rows.filter((row) => !row.role_level?.trim()).length ?? 0

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Standaard uploadvelden</p>
        <p className="mt-2 leading-6">
          Gebruik per respondent altijd <code className="font-mono">email</code>, <code className="font-mono">department</code> en{' '}
          <code className="font-mono">role_level</code>.
          {isExitCampaign ? (
            <>
              {' '}Voor Loep Vertrek kun je daarnaast <code className="font-mono">exit_month</code> en{' '}
              <code className="font-mono">annual_salary_eur</code> meesturen.
            </>
          ) : (
            <>
              {' '}Optioneel blijft <code className="font-mono">annual_salary_eur</code>.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ModeButton current={mode} value="emails" onClick={setMode} label="Via e-mail" />
        <ModeButton current={mode} value="bulk" onClick={setMode} label="Anonieme links" />
        <ModeButton current={mode} value="upload" onClick={setMode} label="Bestand uploaden" />
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Campaign <span className="text-red-500">*</span>
          </label>
          <select
            value={campaignId}
            onChange={(e) => {
              setCampaignId(e.target.value)
              resetFeedback()
              resetUploadState()
            }}
            className={selectCls}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {organizationById[campaign.organization_id] ?? 'Onbekende organisatie'} — {campaign.name} (
                {SCAN_TYPE_LABELS[campaign.scan_type]})
                {campaign.is_active ? '' : ' — gearchiveerd'}
              </option>
            ))}
          </select>
        </div>

        {selectedCampaign ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              selectedDeliveryMode === 'baseline'
                ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
                : 'border-amber-100 bg-amber-50 text-amber-950'
            }`}
          >
            <p className="mb-1 font-semibold">
              {SCAN_TYPE_LABELS[selectedCampaign.scan_type]}{' '}
              {getDeliveryModeLabel(selectedDeliveryMode, selectedCampaign.scan_type)}
            </p>
            <p>{getDeliveryModeDescription(selectedDeliveryMode, selectedCampaign.scan_type)}</p>
            <p className="mt-2 text-xs">
              Standaard invite-instelling voor deze route:{' '}
              {uploadSendInvites
                ? 'direct uitnodigen na gecontroleerde import'
                : 'eerst klaarzetten, daarna bewust uitnodigen'}
              .
            </p>
          </div>
        ) : null}

        {selectedCampaign?.scan_type === 'retention' ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <p className="mb-1 font-semibold">Loep Behoud: standaard metadata</p>
            <p className="text-emerald-900">
              Lever voor Loep Behoud altijd <code className="font-mono">email</code>, <code className="font-mono">department</code> en{' '}
              <code className="font-mono">role_level</code> aan. Zonder afdeling en functieniveau wordt segmentatie direct te grof.
            </p>
            <p className="mt-2 text-emerald-900">
              Zet na de baseline ook een follow-up bestand klaar met team- of segmentuitkomsten zoals uitstroom,
              verzuim of vervolgmeting. Gebruik hiervoor het template{' '}
              <code className="font-mono">data/templates/retentionscan_followup_outcomes_template.csv</code>.
            </p>
          </div>
        ) : null}

        {mode === 'emails' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              E-mailadressen <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">(één per regel of komma-gescheiden)</span>
            </label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={'anne@bedrijf.nl\nkarim@bedrijf.nl\nsanne@bedrijf.nl'}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailInput ? (
              <p className="mt-1 text-xs text-gray-400">{parseEmails(emailInput).length} e-mailadres(sen) herkend</p>
            ) : null}
          </div>
        ) : null}

        {mode === 'bulk' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Aantal links</label>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">
              Er worden {count} anonieme survey-links gegenereerd. De klant verstuurt deze dan zelf.
            </p>
          </div>
        ) : null}

        {mode !== 'upload' ? (
          <>
            <div className={`grid gap-3 pt-1 ${isExitCampaign ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Afdeling <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Operations"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select value={roleLevel} onChange={(e) => setRoleLevel(e.target.value)} className={selectCls}>
                  {ROLE_LEVELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {isExitCampaign ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Exitmaand <span className="text-xs font-normal text-gray-400">(optioneel)</span>
                  </label>
                  <input
                    type="month"
                    value={exitMonth}
                    onChange={(e) => setExitMonth(e.target.value)}
                    className={inputCls}
                  />
                </div>
              ) : null}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bruto jaarsalaris € <span className="text-xs font-normal text-gray-400">(optioneel)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="55000"
                  className={inputCls}
                />
              </div>
            </div>

            <button type="submit" disabled={loading !== null} className={btnCls}>
              {loading === 'submit'
                ? 'Bezig...'
                : mode === 'emails'
                  ? `Uitnodigingen versturen (${parseEmails(emailInput).length || '?'})`
                  : `${count} links genereren`}
            </button>
          </>
        ) : null}
      </form>

      {mode === 'upload' ? (
        <div className="space-y-4 rounded-xl border border-gray-200 p-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-800">Upload respondentbestand</p>
            <p className="text-xs leading-relaxed text-gray-500">
              Gebruik één rij per respondent met minimaal <code className="font-mono">email</code>,{' '}
              <code className="font-mono">department</code> en <code className="font-mono">role_level</code>.
              {isExitCampaign ? <>, Voeg waar relevant ook <code className="font-mono">exit_month</code></> : null}{' '}
              toe. <code className="font-mono">annual_salary_eur</code> blijft optioneel. Upload een{' '}
              <code className="font-mono">.csv</code> of <code className="font-mono">.xlsx</code> bestand.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Lever minimaal {CLIENT_FILE_SPEC.minimumParticipants} deelnemers aan en gebruik alleen herkenbare
              standaardkolommen.
            </p>
            {selectedCampaign?.scan_type === 'retention' ? (
              <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                Voor Loep Behoud horen <code className="font-mono">department</code> en <code className="font-mono">role_level</code> standaard in elk bestand.
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
              <a
                href="/templates/loep-respondenten-template.xlsx"
                download
                className="inline-flex text-blue-600 hover:underline"
              >
                Download Excel-template
              </a>
              <a
                href="/templates/loep-respondenten-template.csv"
                download
                className="inline-flex text-blue-600 hover:underline"
              >
                Download CSV-template
              </a>
            </div>
            {selectedCampaign?.scan_type === 'retention' ? (
              <p className="mt-2 text-xs text-gray-500">
                Voor follow-up uitkomsten gebruik je daarna het CSV-template{' '}
                <code className="font-mono">retentionscan_followup_outcomes_template.csv</code> uit de repo.
              </p>
            ) : null}
          </div>

          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => {
              const nextFile = e.target.files?.[0] ?? null
              setUploadFile(nextFile)
              resetFeedback()
              resetUploadState()
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={uploadSendInvites}
              onChange={(e) => setUploadSendInvites(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span>
              Verstuur direct uitnodigingen na import
              <span className="block text-xs text-gray-400">
                {selectedDeliveryMode === 'live'
                  ? 'Voor live of ritme is eerst klaarzetten vaak veiliger, zodat timing en klantcommunicatie nog één keer gecontroleerd kunnen worden.'
                  : 'Voor baseline is direct uitnodigen logisch nadat preview, foutregels en dubbelen zijn gecontroleerd.'}
              </span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void requestImport(true)}
              disabled={loading !== null || !uploadFile}
              className={btnCls}
            >
              {loading === 'preview' ? 'Bestand controleren...' : 'Bestand controleren'}
            </button>
            {canImportPreview ? (
              <button
                type="button"
                onClick={() => void requestImport(false)}
                disabled={loading !== null}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {loading === 'import' ? 'Importeren...' : `Importeer ${previewResult.valid_rows} respondenten`}
              </button>
            ) : null}
          </div>

          {previewResult ? (
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                <ImportMetric label="Rijen" value={previewResult.total_rows} />
                <ImportMetric label="Geldig" value={previewResult.valid_rows} />
                <ImportMetric label="Fouten" value={previewResult.invalid_rows} />
                <ImportMetric label="Bestaat al" value={previewResult.duplicate_existing} />
              </div>

              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  previewResult.launch_blocked
                    ? 'border-amber-200 bg-amber-50 text-amber-950'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
              >
                <p className="font-semibold">{previewResult.readiness_label}</p>
                <p className="mt-1 leading-6">{previewResult.recovery_hint}</p>
                {previewResult.ignored_columns.length > 0 ? (
                  <p className="mt-2 text-xs leading-5">Niet herkend: {previewResult.ignored_columns.join(', ')}.</p>
                ) : null}
              </div>

              {previewResult.blocking_messages.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <p className="font-semibold">Je kunt nog niet verder</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5">
                    {previewResult.blocking_messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {previewResult.preview_rows.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Preview van geldige rijen</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full overflow-hidden rounded-lg border border-gray-200 text-xs">
                      <thead className="bg-white text-gray-500">
                        <tr>
                          <th className="px-2 py-2 text-left">Rij</th>
                          <th className="px-2 py-2 text-left">E-mail</th>
                          <th className="px-2 py-2 text-left">Afdeling</th>
                          <th className="px-2 py-2 text-left">Niveau</th>
                          {isExitCampaign ? <th className="px-2 py-2 text-left">Exitmaand</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.preview_rows.map((row) => (
                          <tr key={`${row.row_number}-${row.email}`} className="border-t border-gray-200 bg-white">
                            <td className="px-2 py-2">{row.row_number}</td>
                            <td className="px-2 py-2 font-mono">{row.email}</td>
                            <td className="px-2 py-2">{row.department || '—'}</td>
                            <td className="px-2 py-2">{row.role_level || '—'}</td>
                            {isExitCampaign ? <td className="px-2 py-2">{row.exit_month || '—'}</td> : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {!hasPreviewErrors && previewResult.preview_rows.length > 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-6 text-slate-700">
                  <p className="font-semibold text-slate-900">Implementation checks vóór definitieve import</p>
                  <p className="mt-1">
                    {selectedDeliveryMode === 'baseline'
                      ? 'Baseline-route: import pas definitief nadat preview, duplicaten en invitekeuze kloppen.'
                      : 'Live-route: import pas definitief nadat preview, timing en klantcommunicatie nog één keer zijn gecontroleerd.'}
                  </p>
                  {selectedCampaign?.scan_type === 'retention' ? (
                    <p className="mt-1">
                      Metadata-alert: {previewMissingDepartmentCount} rij(en) zonder{' '}
                      <code className="font-mono">department</code> en {previewMissingRoleLevelCount} rij(en) zonder{' '}
                      <code className="font-mono">role_level</code>.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {previewResult.errors.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold text-red-700">Fouten die je eerst moet oplossen</p>
                  <ul className="space-y-1 text-xs text-red-700">
                    {previewResult.errors.slice(0, 12).map((issue) => (
                      <li key={`${issue.row_number}-${issue.field}-${issue.message}`}>
                        Rij {issue.row_number} — {issue.field}: {issue.message}
                      </li>
                    ))}
                  </ul>
                  {previewResult.errors.length > 12 ? (
                    <p className="mt-2 text-xs text-red-600">+ {previewResult.errors.length - 12} extra fout(en)</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <div>
            <p className="mb-1 text-sm font-semibold text-green-800">{result.tokens.length} respondenten aangemaakt</p>
            {mode === 'bulk' ? (
              <p className="text-sm text-green-700">
                Anonieme survey-links zijn gegenereerd. Deel deze links rechtstreeks met de klant of intern team.
              </p>
            ) : result.emailsSent > 0 ? (
              <p className="text-sm text-green-700">
                {result.emailsSent} uitnodigingsmail{result.emailsSent !== 1 ? 's' : ''} verstuurd
              </p>
            ) : (
              <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                E-mails konden niet worden verstuurd. Kopieer de links hieronder als alternatief.
              </p>
            )}
          </div>

          {mode === 'bulk' || result.emailsSent === 0 ? (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Survey-links:</p>
              <textarea
                readOnly
                className="h-28 w-full resize-none rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs focus:outline-none"
                value={result.tokens.map((token) => `${API_BASE}/survey/${token}`).join('\n')}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {importSuccess ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-1 text-sm font-semibold text-green-800">
            {importSuccess.imported} respondenten geïmporteerd
          </p>
          <p className="text-sm text-green-700">
            {uploadSendInvites
              ? `${importSuccess.emails_sent} uitnodigingen direct verstuurd.`
              : 'Respondenten zijn toegevoegd zonder directe uitnodiging.'}
          </p>
          <p className="mt-2 text-xs text-green-800">
            Volgende stap:{' '}
            {uploadSendInvites
              ? 'controleer campagnestatus en klantactivatie.'
              : 'verstuur uitnodigingen pas nadat timing en contactmoment bevestigd zijn.'}
          </p>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-gray-400">
        E-mailadressen worden uitsluitend gebruikt voor uitnodiging en herinneringen. In het dashboard draait het om
        groepsinzichten; individuele e-mailadressen worden daar niet getoond.
      </p>
    </div>
  )
}

function ModeButton({
  current,
  value,
  onClick,
  label,
}: {
  current: Mode
  value: Mode
  onClick: (value: Mode) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        current === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

function ImportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnCls =
  'rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
