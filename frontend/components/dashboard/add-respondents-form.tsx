'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasCampaignAddOn, REPORT_ADD_ON_LABELS, type Campaign, type Organization } from '@/lib/types'
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
  preview_rows: ImportPreviewRow[]
  errors: ImportIssue[]
  imported: number
  emails_sent: number
}

export function AddRespondentsForm({ campaigns, organizations }: Props) {
  const router = useRouter()

  const [campaignId, setCampaignId] = useState(getDefaultCampaignId(campaigns))
  const selectedCampaign = useMemo(
    () => campaigns.find(campaign => campaign.id === campaignId) ?? null,
    [campaignId, campaigns],
  )
  const organizationById = useMemo(
    () => Object.fromEntries(organizations.map(organization => [organization.id, organization.name])),
    [organizations],
  )
  const hasSegmentDeepDive = hasCampaignAddOn(selectedCampaign, 'segment_deep_dive')
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

    const respondents = mode === 'emails'
      ? emails.map(email => ({
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

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const rows = respondents.map(r => ({
      campaign_id: campaignId,
      department: r.department,
      role_level: r.role_level,
      exit_month: r.exit_month,
      annual_salary_eur: r.annual_salary_eur,
      email: r.email,
    }))

    const { data, error: supabaseError } = await supabase
      .from('respondents')
      .insert(rows)
      .select('token, email')

    if (supabaseError || !data) {
      setError(supabaseError?.message ?? 'Aanmaken mislukt.')
      setLoading(null)
      return
    }

    let emailsSent = 0
    if (mode === 'emails' && emails.length > 0) {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/respondents/send-invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            data.map((row: { token: string; email: string }) => ({
              token: row.token,
              email: row.email,
            })),
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
  const canImportPreview = !!previewResult && !hasPreviewErrors && previewResult.valid_rows > 0

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold mb-1">Rol van Verisight en rol van de klant</p>
        <p className="text-blue-800">
          Deze setup is voor Verisight-beheerders. De klant levert een respondentbestand aan; Verisight zet de
          campagne op, controleert de import en verstuurt uitnodigingen. Daarna krijgt de organisatie toegang tot
          het eigen dashboard en rapport.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Canonieke klantaanlevering</p>
          <p className="mt-2 leading-6">
            Gebruik bij voorkeur een eenvoudig Excel- of CSV-bestand met minimaal <code className="font-mono">email</code>.
            Voor segmentatie en scherpere opvolging blijven <code className="font-mono">department</code> en{' '}
            <code className="font-mono">role_level</code> de aanbevolen standaard.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Verplicht: {CLIENT_FILE_SPEC.required.join(', ')}. Aanbevolen: {CLIENT_FILE_SPEC.recommended.join(', ')}.
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">Acceptance-gate voor import</p>
          <p className="mt-2 leading-6">
            Importeer pas definitief nadat preview, foutregels en dubbelen kloppen. Zo blijft de handoff van klantbestand
            naar inviteflow controleerbaar en hoeft de klant geen technische correcties in de app te doen.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ModeButton current={mode} value="emails" onClick={setMode} label="Via e-mail" />
        <ModeButton current={mode} value="bulk" onClick={setMode} label="Anonieme links" />
        <ModeButton current={mode} value="upload" onClick={setMode} label="Bestand uploaden" />
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign <span className="text-red-500">*</span>
          </label>
          <select
            value={campaignId}
            onChange={e => {
              setCampaignId(e.target.value)
              resetFeedback()
              resetUploadState()
            }}
            className={selectCls}
          >
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {organizationById[campaign.organization_id] ?? 'Onbekende organisatie'} — {campaign.name} ({campaign.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'})
                {campaign.is_active ? '' : ' — gearchiveerd'}
              </option>
            ))}
          </select>
        </div>

        {hasSegmentDeepDive && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <p className="font-semibold mb-1">{REPORT_ADD_ON_LABELS.segment_deep_dive} staat aan voor deze campaign</p>
            <p className="text-blue-800">
              Voor deze rapportverdieping zijn <code className="font-mono">department</code> en <code className="font-mono">role_level</code>
              {' '}sterk aanbevolen. Diensttijd wordt al uit de survey gehaald; de rest van de segmentanalyse valt of staat met nette metadata per respondent.
            </p>
            <p className="mt-2 text-blue-800">
              Aan te leveren Excel-kolommen: <code className="font-mono">email</code> (verplicht), <code className="font-mono">department</code> en <code className="font-mono">role_level</code> (sterk aanbevolen), <code className="font-mono">annual_salary_eur</code> (optioneel).
            </p>
            <p className="mt-2 text-blue-800">
              Gebruik bij retrospectieve batches ook <code className="font-mono">exit_month</code> in formaat <code className="font-mono">YYYY-MM</code>, zodat recency en recall bias beter te duiden zijn in het rapport.
            </p>
          </div>
        )}

        {selectedCampaign?.scan_type === 'retention' && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <p className="font-semibold mb-1">RetentieScan: minimale datadiscipline voor v1.1</p>
            <p className="text-emerald-900">
              Lever voor RetentieScan bij voorkeur altijd <code className="font-mono">email</code>, <code className="font-mono">department</code> en <code className="font-mono">role_level</code> aan.
              Zonder afdeling en functieniveau wordt niet alleen het dashboard beperkter, maar ook de latere validatie van segmentverschillen en pragmatische follow-up.
            </p>
            <p className="mt-2 text-emerald-900">
              Zet na de baseline ook een follow-up bestand klaar met team- of segmentuitkomsten zoals uitstroom, verzuim of vervolgmeting. Gebruik hiervoor het template <code className="font-mono">data/templates/retentionscan_followup_outcomes_template.csv</code>.
            </p>
          </div>
        )}

        {mode === 'emails' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadressen <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">(één per regel of komma-gescheiden)</span>
            </label>
            <textarea
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder={'anne@bedrijf.nl\nkarim@bedrijf.nl\nsanne@bedrijf.nl'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {emailInput && (
              <p className="text-xs text-gray-400 mt-1">
                {parseEmails(emailInput).length} e-mailadres(sen) herkend
              </p>
            )}
          </div>
        )}

        {mode === 'bulk' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aantal links</label>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={e => setCount(parseInt(e.target.value, 10))}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              Er worden {count} anonieme survey-links gegenereerd. De klant verstuurt deze dan zelf.
            </p>
          </div>
        )}

        {mode !== 'upload' && (
          <>
            <div className="grid sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Afdeling <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Operations"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
                </label>
                <select value={roleLevel} onChange={e => setRoleLevel(e.target.value)} className={selectCls}>
                  {ROLE_LEVELS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exitmaand <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
                </label>
                <input
                  type="month"
                  value={exitMonth}
                  onChange={e => setExitMonth(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bruto jaarsalaris € <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                  placeholder="55000"
                  className={inputCls}
                />
              </div>
            </div>

            <button type="submit" disabled={loading !== null} className={btnCls}>
              {loading === 'submit'
                ? 'Bezig…'
                : mode === 'emails'
                  ? `Uitnodigingen versturen (${parseEmails(emailInput).length || '?'})`
                  : `${count} links genereren`}
            </button>
          </>
        )}
      </form>

      {mode === 'upload' && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Upload respondentbestand</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Gebruik één rij per respondent met minimaal een kolom <code className="font-mono">email</code>. Optioneel
              kun je <code className="font-mono">department</code>, <code className="font-mono">role_level</code>, <code className="font-mono">exit_month</code> en
              <code className="font-mono">annual_salary_eur</code> meesturen. Upload een <code className="font-mono">.csv</code>
              {' '}of <code className="font-mono">.xlsx</code> bestand.
            </p>
            {selectedCampaign?.scan_type === 'retention' && (
              <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                Voor RetentieScan v1.1-validatie zijn <code className="font-mono">department</code> en <code className="font-mono">role_level</code> de aanbevolen standaard. Daarmee kunnen we later betrouwbaarheid, segmentverschillen en pragmatische follow-up veel netter toetsen.
              </p>
            )}
            {hasSegmentDeepDive && (
              <p className="mt-2 text-xs leading-relaxed text-blue-800">
                Voor {REPORT_ADD_ON_LABELS.segment_deep_dive.toLowerCase()} zijn ingevulde kolommen <code className="font-mono">department</code>
                {' '}en <code className="font-mono">role_level</code> sterk aanbevolen. Zonder die velden blijft het rapport beperkter op subgroepniveau.
                Gebruik bij voorkeur exact deze kolommen: <code className="font-mono">email</code>, <code className="font-mono">department</code>, <code className="font-mono">role_level</code>, <code className="font-mono">exit_month</code>, <code className="font-mono">annual_salary_eur</code>.
              </p>
            )}
            <a
              href="/templates/verisight-respondenten-template.xlsx"
              download
              className="inline-flex mt-3 text-xs font-medium text-blue-600 hover:underline"
            >
              Download Excel-template
            </a>
            {selectedCampaign?.scan_type === 'retention' && (
              <p className="mt-2 text-xs text-gray-500">
                Voor follow-up uitkomsten gebruik je daarna het CSV-template <code className="font-mono">retentionscan_followup_outcomes_template.csv</code> uit de repo.
              </p>
            )}
          </div>

          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={e => {
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
              onChange={e => setUploadSendInvites(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span>
              Verstuur direct uitnodigingen na import
              <span className="block text-xs text-gray-400">
                Zet dit uit als je eerst alleen respondenten wilt klaarzetten.
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
              {loading === 'preview' ? 'Bestand controleren…' : 'Bestand controleren'}
            </button>
            {canImportPreview && (
              <button
                type="button"
                onClick={() => void requestImport(false)}
                disabled={loading !== null}
                className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors"
              >
                {loading === 'import' ? 'Importeren…' : `Importeer ${previewResult.valid_rows} respondenten`}
              </button>
            )}
          </div>

          {previewResult && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div className="grid sm:grid-cols-4 gap-3 text-sm">
                <ImportMetric label="Rijen" value={previewResult.total_rows} />
                <ImportMetric label="Geldig" value={previewResult.valid_rows} />
                <ImportMetric label="Fouten" value={previewResult.invalid_rows} />
                <ImportMetric label="Bestaat al" value={previewResult.duplicate_existing} />
              </div>

              {previewResult.preview_rows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Preview van geldige rijen</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-white text-gray-500">
                        <tr>
                          <th className="px-2 py-2 text-left">Rij</th>
                          <th className="px-2 py-2 text-left">E-mail</th>
                          <th className="px-2 py-2 text-left">Afdeling</th>
                          <th className="px-2 py-2 text-left">Niveau</th>
                          <th className="px-2 py-2 text-left">Exitmaand</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.preview_rows.map(row => (
                          <tr key={`${row.row_number}-${row.email}`} className="border-t border-gray-200 bg-white">
                            <td className="px-2 py-2">{row.row_number}</td>
                            <td className="px-2 py-2 font-mono">{row.email}</td>
                            <td className="px-2 py-2">{row.department || '—'}</td>
                            <td className="px-2 py-2">{row.role_level || '—'}</td>
                            <td className="px-2 py-2">{row.exit_month || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {previewResult.errors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-700 mb-2">Fouten die je eerst moet oplossen</p>
                  <ul className="space-y-1 text-xs text-red-700">
                    {previewResult.errors.slice(0, 12).map(issue => (
                      <li key={`${issue.row_number}-${issue.field}-${issue.message}`}>
                        Rij {issue.row_number} — {issue.field}: {issue.message}
                      </li>
                    ))}
                  </ul>
                  {previewResult.errors.length > 12 && (
                    <p className="text-xs text-red-600 mt-2">
                      + {previewResult.errors.length - 12} extra fout(en)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              {result.tokens.length} respondenten aangemaakt
            </p>
            {mode === 'bulk' ? (
              <p className="text-sm text-green-700">
                Anonieme survey-links zijn gegenereerd. Deel deze links rechtstreeks met de klant of intern team.
              </p>
            ) : result.emailsSent > 0 ? (
              <p className="text-sm text-green-700">
                {result.emailsSent} uitnodigingsmail{result.emailsSent !== 1 ? 's' : ''} verstuurd
              </p>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
                E-mails konden niet worden verstuurd. Kopieer de links hieronder als alternatief.
              </p>
            )}
          </div>

          {(mode === 'bulk' || result.emailsSent === 0) && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Survey-links:</p>
              <textarea
                readOnly
                className="w-full font-mono text-xs bg-white border border-gray-200 rounded-lg p-3 h-28 resize-none focus:outline-none"
                value={result.tokens.map(token => `${API_BASE}/survey/${token}`).join('\n')}
              />
            </div>
          )}
        </div>
      )}

      {importSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">
            {importSuccess.imported} respondenten geïmporteerd
          </p>
          <p className="text-sm text-green-700">
            {uploadSendInvites
              ? `${importSuccess.emails_sent} uitnodigingen direct verstuurd.`
              : 'Respondenten zijn toegevoegd zonder directe uitnodiging.'}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">
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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        current === value
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnCls = 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors'
