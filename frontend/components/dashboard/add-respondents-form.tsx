'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Campaign } from '@/lib/types'

const ROLE_LEVELS = [
  { value: '',          label: '— niet opgegeven —' },
  { value: 'uitvoerend', label: 'Uitvoerend' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'senior',     label: 'Senior specialist' },
  { value: 'manager',    label: 'Manager' },
  { value: 'director',   label: 'Director' },
  { value: 'c_level',    label: 'C-level' },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Props { campaigns: Campaign[] }

export function AddRespondentsForm({ campaigns }: Props) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '')
  const [count,      setCount]      = useState(5)
  const [department, setDepartment] = useState('')
  const [roleLevel,  setRoleLevel]  = useState('')
  const [salary,     setSalary]     = useState('')
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [newTokens,  setNewTokens]  = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNewTokens([])

    const rows = Array.from({ length: count }, () => ({
      campaign_id:       campaignId,
      department:        department || null,
      role_level:        roleLevel  || null,
      annual_salary_eur: salary ? parseFloat(salary) : null,
    }))

    const { data, error } = await supabase
      .from('respondents')
      .insert(rows)
      .select('token')

    if (error) { setError(error.message); setLoading(false); return }

    const tokens = (data ?? []).map((r: { token: string }) => r.token)
    setNewTokens(tokens)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Campaign */}
        <div className="sm:col-span-2 lg:col-span-1">
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
                {c.name} ({c.scan_type === 'exit' ? 'Exit' : 'Retentie'})
              </option>
            ))}
          </select>
        </div>

        {/* Aantal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aantal</label>
          <input
            type="number" min={1} max={200} value={count}
            onChange={e => setCount(parseInt(e.target.value))}
            className={inputCls}
          />
        </div>

        {/* Afdeling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Afdeling <span className="text-gray-400 font-normal text-xs">(optioneel)</span>
          </label>
          <input
            type="text" value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="Operations"
            className={inputCls}
          />
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Functieniveau <span className="text-gray-400 font-normal text-xs">(optioneel)</span>
          </label>
          <select value={roleLevel} onChange={e => setRoleLevel(e.target.value)} className={selectCls}>
            {ROLE_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {/* Salaris */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bruto jaarsalaris € <span className="text-gray-400 font-normal text-xs">(optioneel)</span>
          </label>
          <input
            type="number" min={0} value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="55000"
            className={inputCls}
          />
        </div>

        {/* Submit */}
        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          {error && <p className="text-sm text-red-600 mr-4">{error}</p>}
          <button type="submit" disabled={loading} className={btnCls}>
            {loading ? 'Bezig…' : `+ ${count} respondenten aanmaken`}
          </button>
        </div>
      </form>

      {/* Gegenereerde links */}
      {newTokens.length > 0 && (
        <div>
          <p className="text-sm font-medium text-green-700 mb-2">
            ✓ {newTokens.length} respondenten aangemaakt — kopieer de survey-links:
          </p>
          <textarea
            readOnly
            className="w-full font-mono text-xs bg-blue-50 border border-blue-200 rounded-lg p-3 h-32 resize-none focus:outline-none"
            value={newTokens.map(t => `${API_BASE}/survey/${t}`).join('\n')}
          />
        </div>
      )}
    </div>
  )
}

const inputCls  = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnCls    = 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors'
