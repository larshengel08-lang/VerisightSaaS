'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CAMPAIGN_SCAN_OPTIONS,
  getCampaignNamePlaceholder,
  getDefaultModulesForScanType,
  isBaselineOnlyScanType,
  supportsCampaignModuleSelection,
  supportsCampaignReportAddOns,
} from '@/lib/campaign-setup'
import { buildSegmentDepartments, type SegmentDepartment } from '@/lib/self-send-comms'
import { createClient } from '@/lib/supabase/client'
import type { CommsMode, DeliveryMode, Organization, ScanType } from '@/lib/types'
import { FACTOR_LABELS, REPORT_ADD_ON_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']
const REPORT_ADD_ONS = ['segment_deep_dive'] as const

interface Props {
  orgs: Organization[]
}

export function NewCampaignForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [name, setName] = useState('')
  const [scanType, setScanType] = useState<ScanType>('exit')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('baseline')
  // Alleen self_send: platform slaat bewust geen deelnemer-e-mailadressen op.
  // De platform-verzendkeuze is uit de aanmaakflow gehaald (2026-07-08) — bestaande
  // campagnes met de oude modus blijven elders gewoon werken, dit is puur de keuze
  // bij het aanmaken van een nieuwe campagne.
  const commsMode: CommsMode = 'self_send'
  const [modules, setModules] = useState<string[]>([])
  const [useSegments, setUseSegments] = useState(false)
  const [segmentLabels, setSegmentLabels] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasSegmentDeepDive = modules.includes('segment_deep_dive')
  const campaignNamePlaceholder = getCampaignNamePlaceholder(scanType)

  function toggleModule(module: string) {
    setModules((prev) => (prev.includes(module) ? prev.filter((entry) => entry !== module) : [...prev, module]))
  }

  function handleScanTypeChange(nextScanType: ScanType) {
    setScanType(nextScanType)
    if (isBaselineOnlyScanType(nextScanType)) {
      setDeliveryMode('baseline')
    }
    setModules(getDefaultModulesForScanType(nextScanType))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    let segmentDepartments: SegmentDepartment[] | null = null
    if (useSegments) {
      try {
        segmentDepartments = buildSegmentDepartments(
          segmentLabels.split('\n').filter((l) => l.trim()),
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ongeldige afdelingslijst')
        setLoading(false)
        return
      }
      if (segmentDepartments.length < 2) {
        setError('Segmentrapportage vraagt minimaal 2 afdelingen.')
        setLoading(false)
        return
      }
    }

    const { error: insertError } = await supabase.from('campaigns').insert({
      organization_id: orgId,
      name,
      scan_type: scanType,
      delivery_mode: deliveryMode,
      comms_mode: commsMode,
      enabled_modules: modules.length > 0 ? modules : null,
      segment_departments: segmentDepartments,
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Context</p>

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

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kies product</p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {CAMPAIGN_SCAN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleScanTypeChange(option.value)}
            className={`rounded-[22px] border p-4 text-left transition-colors ${
              scanType === option.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-semibold">{option.title}</p>
            <p className={`mt-1 text-sm ${scanType === option.value ? 'text-blue-100' : 'text-slate-500'}`}>{option.short}</p>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kies route</p>
      </div>

      <div className={`grid gap-2 ${isBaselineOnlyScanType(scanType) ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
        {([
          {
            value: 'baseline',
            title: 'Baseline',
            body: 'Standaard eerste route.',
            disabled: false,
          },
          {
            value: 'live',
            title: 'Live / vervolgroute',
            body: 'Alleen voor vervolggebruik.',
            disabled: isBaselineOnlyScanType(scanType),
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
              {option.disabled ? 'Nog niet beschikbaar voor dit product.' : option.body}
            </p>
          </button>
        ))}
      </div>

      <div
        className={`rounded-[22px] border p-3 text-sm ${
          deliveryMode === 'baseline'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
            : 'border-amber-100 bg-amber-50 text-amber-950'
        }`}
      >
        <p className="font-semibold">{deliveryMode === 'baseline' ? 'Baseline is de standaardroute.' : 'Live alleen na een stabiele baseline.'}</p>
      </div>

      <div className="border-t border-slate-200 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">E-mail &amp; deelnemers</p>
      </div>
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">HR verstuurt zelf</p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Kopieer-sjablonen, één campagnelink, geen e-mailopslag op het platform.
        </p>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex items-center gap-2 font-semibold text-slate-900">
          <input
            type="checkbox"
            checked={useSegments}
            onChange={(event) => setUseSegments(event.target.checked)}
            className="rounded"
          />
          Rapporteren op afdelingsniveau
        </label>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Elke afdeling krijgt een eigen variant van de campagnelink. Er is dan bewust géén
          algemene link — elke deelnemer komt binnen via de link van zijn afdeling.
        </p>
        {useSegments ? (
          <div className="mt-3 space-y-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Afdelingen (één per regel, minimaal 2)
            </label>
            <textarea
              value={segmentLabels}
              onChange={(event) => setSegmentLabels(event.target.value)}
              rows={4}
              placeholder={'Sales\nOperations\nKantoor'}
              className={fieldClass}
            />
            <button
              type="button"
              onClick={() =>
                setSegmentLabels((prev) =>
                  prev.trim() ? `${prev.trimEnd()}\nGeen afdeling / overig` : 'Geen afdeling / overig',
                )
              }
              className="text-xs font-medium text-blue-700 underline underline-offset-2"
            >
              Voeg &ldquo;Geen afdeling / overig&rdquo; toe
            </button>
            <p className="text-xs leading-5 text-slate-500">
              Aanbevolen voor iedereen die nergens onder valt (bijv. directie) — anders klikken
              zij mogelijk willekeurig een afdeling aan.
            </p>
          </div>
        ) : null}
      </div>

      {supportsCampaignModuleSelection(scanType) ? (
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
            Pas dit alleen aan wanneer je bewust een compactere subset wilt meten.
          </p>
        </div>
      ) : (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Vaste instrumentroute</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">Deze scan gebruikt een vaste baseline-opzet.</p>
        </div>
      )}

      {supportsCampaignReportAddOns(scanType) ? (
        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Rapport-add-ons</p>
          <div className="mt-3 space-y-2">
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
                  <span className="block text-xs leading-5 text-slate-500">Gebruik alleen wanneer extra segmentdetail nodig is.</span>
                </span>
              </label>
            ))}
          </div>
          {hasSegmentDeepDive ? (
            <p className="mt-3 text-xs leading-5 text-blue-800">Segment deep dive gebruikt bestaande metadata in het rapport.</p>
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
