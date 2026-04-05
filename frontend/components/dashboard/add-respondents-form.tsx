'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Campaign } from '@/lib/types'

const ROLE_LEVELS = [
  { value: '',           label: '— niet opgegeven —' },
  { value: 'uitvoerend', label: 'Uitvoerend' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'senior',     label: 'Senior specialist' },
  { value: 'manager',    label: 'Manager' },
  { value: 'director',   label: 'Director' },
  { value: 'c_level',    label: 'C-level' },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Props { campaigns: Campaign[] }

type Mode = 'emails' | 'bulk'

export function AddRespondentsForm({ campaigns }: Props) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '')
  const [mode,       setMode]       = useState<Mode>('emails')

  // Email-modus: één of meerdere e-mailadressen
  const [emailInput, setEmailInput] = useState('')
  const [department, setDepartment] = useState('')
  const [roleLevel,  setRoleLevel]  = useState('')
  const [salary,     setSalary]     = useState('')

  // Bulk-modus (aantallen, geen e-mail)
  const [count, setCount] = useState(5)

  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<{ tokens: string[]; emailsSent: number } | null>(null)
  const router = useRouter()

  const selectedCampaign = campaigns.find(c => c.id === campaignId)

  function parseEmails(raw: string): string[] {
    return raw
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const emails = mode === 'emails' ? parseEmails(emailInput) : []
    if (mode === 'emails' && emails.length === 0) {
      setError('Voer minimaal één geldig e-mailadres in.')
      setLoading(false)
      return
    }

    // Bouw de respondenten-payload op
    const respondents = mode === 'emails'
      ? emails.map(email => ({
          email,
          department: department || null,
          role_level: roleLevel   || null,
          annual_salary_eur: salary ? parseFloat(salary) : null,
        }))
      : Array.from({ length: count }, () => ({
          email: null,
          department: department || null,
          role_level: roleLevel  || null,
          annual_salary_eur: salary ? parseFloat(salary) : null,
        }))

    // Haal de API-sleutel op via de organisatie (via Supabase direct)
    // Voor nu gebruiken we de respondents Supabase-insert + backend e-mailroute
    // Stap 1: maak respondenten aan via Supabase (tokens genereren)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const rows = respondents.map(r => ({
      campaign_id:       campaignId,
      department:        r.department,
      role_level:        r.role_level,
      annual_salary_eur: r.annual_salary_eur,
      email:             r.email,
    }))

    const { data, error: sbError } = await supabase
      .from('respondents')
      .insert(rows)
      .select('token, email')

    if (sbError || !data) {
      setError(sbError?.message ?? 'Aanmaken mislukt.')
      setLoading(false)
      return
    }

    const tokens = data.map((r: { token: string }) => r.token)

    // Stap 2: stuur uitnodigingsmails via backend (als e-mails opgegeven)
    let emailsSent = 0
    if (mode === 'emails' && emails.length > 0) {
      try {
        const resp = await fetch(`${API_BASE}/api/campaigns/${campaignId}/send-invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            data.map((r: { token: string; email: string }) => ({
              token: r.token,
              email: r.email,
            }))
          ),
        })
        if (resp.ok) {
          const json = await resp.json()
          emailsSent = json.sent ?? 0
        }
      } catch {
        // E-mailfouten blokkeren het aanmaken niet
      }
    }

    setResult({ tokens, emailsSent })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-5">

      {/* Modus-toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('emails')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'emails'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📧 Via e-mail uitnodigen
        </button>
        <button
          type="button"
          onClick={() => setMode('bulk')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'bulk'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🔗 Anonieme links genereren
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Campaign selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign <span className="text-red-500">*</span>
          </label>
          <select
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            className={selectCls}
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'})
              </option>
            ))}
          </select>
        </div>

        {/* E-mail-modus */}
        {mode === 'emails' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mailadressen <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">
                (één per regel, of komma-gescheiden)
              </span>
            </label>
            <textarea
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder={'jan@bedrijf.nl\npiet@bedrijf.nl\nmaria@bedrijf.nl'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {emailInput && (
              <p className="text-xs text-gray-400 mt-1">
                {parseEmails(emailInput).length} e-mailadres(sen) herkend
              </p>
            )}
          </div>
        )}

        {/* Bulk-modus */}
        {mode === 'bulk' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aantal links</label>
            <input
              type="number" min={1} max={200} value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              Er worden {count} anonieme survey-links gegenereerd. Jij verstuurt ze zelf.
            </p>
          </div>
        )}

        {/* Optionele metadata */}
        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Afdeling <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
            </label>
            <input
              type="text" value={department}
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
              {ROLE_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bruto jaarsalaris € <span className="text-gray-400 text-xs font-normal">(optioneel)</span>
            </label>
            <input
              type="number" min={0} value={salary}
              onChange={e => setSalary(e.target.value)}
              placeholder="55000"
              className={inputCls}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button type="submit" disabled={loading} className={btnCls}>
          {loading
            ? 'Bezig…'
            : mode === 'emails'
              ? `📧 Uitnodigingen versturen (${parseEmails(emailInput).length || '?'})`
              : `🔗 ${count} links genereren`}
        </button>
      </form>

      {/* Resultaat */}
      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          {mode === 'emails' ? (
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                ✓ {result.tokens.length} respondenten aangemaakt
              </p>
              {result.emailsSent > 0 ? (
                <p className="text-sm text-green-700">
                  📧 {result.emailsSent} uitnodigingsmail{result.emailsSent !== 1 ? 's' : ''} verstuurd
                </p>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
                  ⚠ E-mails konden niet worden verstuurd. Kopieer de links hieronder als alternatief.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-green-800">
              ✓ {result.tokens.length} survey-links gegenereerd
            </p>
          )}

          {/* Fallback links — altijd tonen bij bulk, bij email alleen als e-mail mislukt */}
          {(mode === 'bulk' || result.emailsSent === 0) && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Survey-links {mode === 'bulk' ? '— verstuur zelf via e-mail of chat' : '— stuur als back-up'}:
              </p>
              <textarea
                readOnly
                className="w-full font-mono text-xs bg-white border border-gray-200 rounded-lg p-3 h-28 resize-none focus:outline-none"
                value={result.tokens.map(t => `${API_BASE}/survey/${t}`).join('\n')}
              />
            </div>
          )}
        </div>
      )}

      {/* Privacy-disclaimer */}
      <p className="text-xs text-gray-400 leading-relaxed">
        E-mailadressen worden uitsluitend gebruikt voor het versturen van de uitnodigingsmail.
        Ze worden niet opgeslagen in het dashboard of gekoppeld aan de ingevulde antwoorden.
      </p>
    </div>
  )
}

const inputCls  = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnCls    = 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors'
