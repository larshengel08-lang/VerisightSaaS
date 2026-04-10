'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Organization } from '@/lib/types'
import { FACTOR_LABELS, REPORT_ADD_ON_DESCRIPTIONS, REPORT_ADD_ON_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']
const REPORT_ADD_ONS = ['segment_deep_dive'] as const

interface Props { orgs: Organization[] }

export function NewCampaignForm({ orgs }: Props) {
  const [orgId,    setOrgId]    = useState(orgs[0]?.id ?? '')
  const [name,     setName]     = useState('')
  const [scanType, setScanType] = useState<'exit' | 'retention'>('exit')
  const [modules,  setModules]  = useState<string[]>([])
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const hasSelectedFactorSubset = modules.some(module => ORG_FACTORS.includes(module))
  const hasSegmentDeepDive = modules.includes('segment_deep_dive')

  function toggleModule(m: string) {
    setModules(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('campaigns').insert({
      organization_id: orgId,
      name,
      scan_type: scanType,
      enabled_modules: modules.length > 0 ? modules : null,
    })

    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setName('')
    setTimeout(() => { setSuccess(false); router.refresh() }, 1500)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Organisatie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organisatie <span className="text-red-500">*</span>
        </label>
        <select value={orgId} onChange={e => setOrgId(e.target.value)} className={selectCls}>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {/* Naam */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Naam campaign <span className="text-red-500">*</span>
        </label>
        <input
          type="text" required value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ExitScan Q2 2025"
          className={inputCls}
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type scan</label>
        <div className="flex gap-2">
          {(['exit', 'retention'] as const).map(t => (
            <button
              key={t} type="button"
              onClick={() => setScanType(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                scanType === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
              }`}
            >
              {t === 'exit' ? 'ExitScan' : 'RetentieScan'}
            </button>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Surveymodules{' '}
          <span className="font-normal text-gray-400 text-xs">(leeg = alle 6 factoren ingeschakeld)</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {ORG_FACTORS.map(f => (
            <label key={f} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={modules.includes(f)}
                onChange={() => toggleModule(f)}
                className="rounded"
              />
              {FACTOR_LABELS[f]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-gray-400">
          Laat dit leeg als je de volledige ExitScan wilt draaien. Beperk alleen factoren als je bewust een kortere of aangepaste campagne wilt opzetten.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rapport-add-ons
          <span className="ml-1 font-normal text-gray-400 text-xs">(optioneel)</span>
        </label>
        <div className="space-y-3">
          {REPORT_ADD_ONS.map(addOn => (
            <label key={addOn} className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={modules.includes(addOn)}
                onChange={() => toggleModule(addOn)}
                className="mt-1 rounded"
              />
              <span>
                <span className="block font-medium text-gray-900">{REPORT_ADD_ON_LABELS[addOn]}</span>
                <span className="block text-xs leading-5 text-gray-500">
                  {REPORT_ADD_ON_DESCRIPTIONS[addOn]}
                </span>
              </span>
            </label>
          ))}
        </div>
        {hasSegmentDeepDive && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Segment deep dive gebruikt bestaande metadata in het rapport. Zorg daarom bij de respondentimport bij voorkeur voor ingevulde kolommen <code className="font-mono">email</code>, <code className="font-mono">department</code> en <code className="font-mono">role_level</code>. Zonder afdeling en functieniveau blijft de verdieping beperkter.
          </p>
        )}
        {!hasSelectedFactorSubset && hasSegmentDeepDive && (
          <p className="mt-2 text-xs text-blue-800">
            De add-on wijzigt de survey niet: alle standaard factoren blijven actief en het rapport krijgt extra segmentanalyse.
          </p>
        )}
      </div>

      {error   && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Campaign aangemaakt!</p>}

      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Bezig…' : '+ Aanmaken'}
      </button>
    </form>
  )
}

const inputCls  = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
const btnCls    = 'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors'
