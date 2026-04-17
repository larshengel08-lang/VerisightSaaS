'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getDeliveryModeDescription } from '@/lib/implementation-readiness'
import type { DeliveryMode, Organization, ScanType } from '@/lib/types'
import { FACTOR_LABELS, REPORT_ADD_ON_DESCRIPTIONS, REPORT_ADD_ON_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']
const REPORT_ADD_ONS = ['segment_deep_dive'] as const
const PULSE_DEFAULT_MODULES = ['leadership', 'growth', 'workload']

interface Props {
  orgs: Organization[]
}

export function NewCampaignForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [name, setName] = useState('')
  const [scanType, setScanType] = useState<ScanType>('exit')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('baseline')
  const [modules, setModules] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasSelectedFactorSubset = modules.some((module) => ORG_FACTORS.includes(module))
  const hasSegmentDeepDive = modules.includes('segment_deep_dive')
  const campaignNamePlaceholder =
    scanType === 'exit'
      ? 'ExitScan Q2 2026'
      : scanType === 'retention'
        ? 'RetentieScan Voorjaar 2026'
        : 'Pulse April 2026'

  function toggleModule(module: string) {
    setModules((prev) => (prev.includes(module) ? prev.filter((entry) => entry !== module) : [...prev, module]))
  }

  function handleScanTypeChange(nextScanType: ScanType) {
    setScanType(nextScanType)

    if (nextScanType === 'pulse') {
      setDeliveryMode('baseline')
      setModules(PULSE_DEFAULT_MODULES)
      return
    }

    setModules((current) => current.filter((module) => module !== 'segment_deep_dive'))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('campaigns').insert({
      organization_id: orgId,
      name,
      scan_type: scanType,
      delivery_mode: deliveryMode,
      enabled_modules: modules.length > 0 ? modules : null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setName('')
    setDeliveryMode('baseline')
    setTimeout(() => {
      setSuccess(false)
      router.refresh()
    }, 1500)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">1. Kies organisatie en campagnenaam</p>
        <p className="mt-1 text-sm text-slate-600">
          Leg eerst vast voor welke klant de campagne draait en hoe de campagne in het dashboard moet terugkomen.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Organisatie</label>
        <select value={orgId} onChange={(event) => setOrgId(event.target.value)} className={fieldClass}>
          {orgs.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Naam campaign</label>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={campaignNamePlaceholder}
          className={fieldClass}
        />
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">2. Kies product en verdiepniveau</p>
        <p className="mt-1 text-sm text-slate-600">
          Hier bepaal je of de campagne als ExitScan, RetentieScan of Pulse wordt opgezet en of je de standaarddiepte gebruikt of een bewuste subset.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(['exit', 'retention', 'pulse'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleScanTypeChange(option)}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              scanType === option ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-semibold">
              {option === 'exit' ? 'ExitScan' : option === 'retention' ? 'RetentieScan' : 'Pulse'}
            </p>
            <p className={`mt-1 text-sm ${scanType === option ? 'text-blue-100' : 'text-slate-500'}`}>
              {option === 'exit'
                ? 'Terugkijken op vertrek, frictie en beinvloedbare werkfactoren.'
                : option === 'retention'
                  ? 'Vroeg signaleren waar behoud onder druk komt te staan.'
                  : 'Korte check-in om te zien of signalen of acties nu bijsturing vragen.'}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">Onboardingverwachting voor deze route</p>
        <p className="mt-2">
          {deliveryMode === 'live'
            ? scanType === 'exit'
              ? 'Je kiest nu bewust voor een live / doorlopende ExitScan-route. Gebruik dit alleen als baseline, volumelogica en intern eigenaarschap al staan.'
              : scanType === 'retention'
                ? 'Je kiest nu bewust voor een ritme- of live-route voor RetentieScan. Gebruik dit alleen als baseline, eerste opvolging en meetritme al scherp zijn.'
                : 'Pulse live of ritme is nog niet opengezet in deze wave. Gebruik Pulse nu alleen als eerste compacte baseline-snapshot.'
            : scanType === 'exit'
              ? 'ExitScan wordt meestal eerst als baseline opgezet. Live opvolging wordt pas logisch nadat de nulmeting, het volume en het eigenaarschap scherp staan.'
              : scanType === 'retention'
                ? 'RetentieScan start meestal als baseline. Ritme of herhaalmeting komt pas daarna, zodra de eerste duiding en opvolging helder zijn.'
                : 'Pulse start in deze wave altijd als baseline. Eerst bewijzen we de compacte snapshot en reviewlus; echte ritme- of trendlogica volgt later.'}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Deze setup blijft assisted: Verisight beheert campaign, importcontrole en activatie; de klant levert input en gebruikt daarna dashboard en rapport.
        </p>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">3. Kies implementatieroute</p>
        <p className="mt-1 text-sm text-slate-600">
          Baseline is de standaard eerste route. Kies live alleen als je bewust afwijkt van de canonical assisted flow.
        </p>
      </div>

      <div className={`grid gap-2 ${scanType === 'pulse' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
        {([
          {
            value: 'baseline',
            title: 'Baseline',
            body: 'Standaard eerste route voor gecontroleerde setup, import en eerste managementwaarde.',
            disabled: false,
          },
          {
            value: 'live',
            title: 'Live / vervolgroute',
            body: 'Bewuste vervolgroute voor doorlopend of ritmisch gebruik nadat baseline en eigenaarschap staan.',
            disabled: scanType === 'pulse',
          },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && setDeliveryMode(option.value)}
            disabled={option.disabled}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              deliveryMode === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            } ${option.disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <p className="text-sm font-semibold">{option.title}</p>
            <p className={`mt-1 text-sm ${deliveryMode === option.value ? 'text-blue-100' : 'text-slate-500'}`}>
              {option.disabled ? 'Niet beschikbaar in Pulse wave 1.' : option.body}
            </p>
          </button>
        ))}
      </div>

      <div
        className={`rounded-[22px] border p-4 text-sm leading-6 ${
          deliveryMode === 'baseline'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
            : 'border-amber-100 bg-amber-50 text-amber-950'
        }`}
      >
        <p className="font-semibold">
          {deliveryMode === 'baseline' ? 'Aanbevolen default' : 'Bewuste afwijking op de standaardroute'}
        </p>
        <p className="mt-2">{getDeliveryModeDescription(deliveryMode, scanType)}</p>
        {deliveryMode === 'live' ? (
          <p className="mt-2 text-xs text-amber-900">
            Gebruik live pas nadat importkwaliteit, inviteflow en eerste klantread bij eerdere trajecten stabiel genoeg zijn.
          </p>
        ) : null}
      </div>

      {scanType === 'retention' ? (
        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-950">
          <p className="font-semibold">RetentieScan v1.1-validatievoorbereiding</p>
          <p className="mt-1 text-emerald-900">
            Gebruik bij respondentimport bij voorkeur altijd <code className="font-mono">email</code>, <code className="font-mono">department</code> en <code className="font-mono">role_level</code>.
            Daarmee houd je niet alleen segmentanalyse bruikbaar, maar ook de latere validatie van betrouwbaarheid, factorcontrole en pragmatische follow-up op orde.
          </p>
        </div>
      ) : null}

      {scanType === 'pulse' ? (
        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          <p className="font-semibold">Pulse wave 1-boundary</p>
          <p className="mt-1 text-blue-900">
            Pulse blijft in deze wave bewust compact: korte werkbelevingscheck, geselecteerde werkfactoren en een eerste managementsnapshot zonder trendclaims of PDF-rapport.
          </p>
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Surveymodules <span className="text-xs font-normal text-slate-400">(leeg = volledige scan)</span>
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {ORG_FACTORS.map((factor) => (
            <label key={factor} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={modules.includes(factor)}
                onChange={() => toggleModule(factor)}
                className="rounded"
              />
              {FACTOR_LABELS[factor]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {scanType === 'pulse'
            ? 'Pulse start standaard met leiderschap, groeiperspectief en werkbelasting. Pas dit alleen aan als je bewust een andere compacte focus wilt meten.'
            : `Laat dit leeg als je de volledige ${scanType === 'exit' ? 'ExitScan' : 'RetentieScan'} wilt draaien.`}
        </p>
      </div>

      {scanType !== 'pulse' ? (
        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Rapport-add-ons</p>
          <div className="mt-3 space-y-3">
            {REPORT_ADD_ONS.map((addOn) => (
              <label key={addOn} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={modules.includes(addOn)}
                  onChange={() => toggleModule(addOn)}
                  className="mt-1 rounded"
                />
                <span>
                  <span className="block font-medium text-slate-900">{REPORT_ADD_ON_LABELS[addOn]}</span>
                  <span className="block text-xs leading-5 text-slate-500">{REPORT_ADD_ON_DESCRIPTIONS[addOn]}</span>
                </span>
              </label>
            ))}
          </div>
          {hasSegmentDeepDive ? (
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              Segment deep dive gebruikt bestaande metadata in het rapport. Zorg daarom bij de respondentimport bij voorkeur voor ingevulde kolommen <code className="font-mono">email</code>, <code className="font-mono">department</code> en <code className="font-mono">role_level</code>.
            </p>
          ) : null}
          {!hasSelectedFactorSubset && hasSegmentDeepDive ? (
            <p className="mt-2 text-xs text-blue-800">
              De add-on wijzigt de survey niet: alle standaardfactoren blijven actief en het rapport krijgt extra segmentanalyse.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Campaign aangemaakt.</p> : null}

      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? 'Bezig...' : '+ Aanmaken'}
      </button>
    </form>
  )
}

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

const buttonClass =
  'w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
