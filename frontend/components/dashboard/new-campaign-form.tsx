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
import { prepareSegmentDepartmentsUpdate } from '@/lib/self-send-comms'
import { MIN_INVITED_PER_DEPARTMENT, MIN_INVITED_TOTAL, validateInvitedTotal } from '@/lib/response-activation'
import { createClient } from '@/lib/supabase/client'
import type { CommsMode, DeliveryMode, Organization, ScanType } from '@/lib/types'
import { FACTOR_LABELS, REPORT_ADD_ON_LABELS } from '@/lib/types'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']
const REPORT_ADD_ONS = ['segment_deep_dive'] as const
const OTHER_DEPARTMENT_LABEL = 'Geen afdeling / overig'

interface Props {
  orgs: Organization[]
}

interface DeptRow {
  label: string
  invitedCount: number | ''
}

export function NewCampaignForm({ orgs }: Props) {
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? '')
  const [name, setName] = useState('')
  const [scanType, setScanType] = useState<ScanType>('exit')
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('baseline')
  // Alleen self_send: platform slaat bewust geen deelnemer-e-mailadressen op.
  // De platform-verzendkeuze is uit de aanmaakflow gehaald (2026-07-08); bestaande
  // campagnes met de oude modus blijven elders gewoon werken, dit is puur de keuze
  // bij het aanmaken van een nieuwe campagne.
  const commsMode: CommsMode = 'self_send'
  const [modules, setModules] = useState<string[]>([])
  const [useSegments, setUseSegments] = useState(false)
  const [deptRows, setDeptRows] = useState<DeptRow[]>([{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }])
  const [targetCount, setTargetCount] = useState<number | ''>('')
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

  function updateDeptRow(index: number, patch: Partial<DeptRow>) {
    setDeptRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function addDeptRow(label = '') {
    setDeptRows((prev) => [...prev, { label, invitedCount: '' }])
  }

  function removeDeptRow(index: number) {
    setDeptRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    // Segment-modus mag met een lege lijst opgeslagen worden (spec 2026-07-12
    // par. 1): de klant vult de afdelingen zelf in via de setup-wizard. Zodra
    // er een rij is ingevuld, gelden dezelfde regels als in de wizard (min. 2,
    // geen dubbele/lege labels, minimaal 5 per afdeling, 10 in totaal). Een
    // half ingevulde lijst mag niet stil worden opgeslagen alsof die compleet is.
    let segmentDepartments: Array<{ label: string; slug: string; invited_count: number }> | null = null
    let invitedCount: number | null = null
    if (useSegments) {
      const filled = deptRows.filter((row) => row.label.trim() || row.invitedCount !== '')
      if (filled.length === 0) {
        segmentDepartments = []
      } else {
        try {
          const update = prepareSegmentDepartmentsUpdate(
            [],
            filled.map((row) => ({
              label: row.label.trim(),
              invited_count: typeof row.invitedCount === 'number' ? row.invitedCount : 0,
            })),
            new Set(),
          )
          segmentDepartments = update.departments
          invitedCount = update.totalInvited
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Ongeldige afdelingslijst')
          setLoading(false)
          return
        }
      }
    } else if (targetCount !== '') {
      const targetError = validateInvitedTotal(targetCount)
      if (targetError) {
        setError(targetError)
        setLoading(false)
        return
      }
      invitedCount = targetCount
    }

    const { data: created, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        organization_id: orgId,
        name,
        scan_type: scanType,
        delivery_mode: deliveryMode,
        comms_mode: commsMode,
        enabled_modules: modules.length > 0 ? modules : null,
        segment_departments: segmentDepartments,
      })
      .select('id')
      .single()

    if (insertError || !created) {
      setError(insertError?.message ?? 'Aanmaken mislukt.')
      setLoading(false)
      return
    }

    // Voorvullen (spec 2026-09-16 par. 5.3): het totaal op het delivery record,
    // dat de trigger on_campaign_created zojuist heeft aangemaakt. Upsert, zodat
    // dit ook werkt als dat record ontbreekt. Fail Loud: de campagne bestaat al,
    // dus zeg precies dat als deze tweede write faalt.
    if (invitedCount !== null) {
      const { error: deliveryError } = await supabase
        .from('campaign_delivery_records')
        .upsert(
          { campaign_id: created.id, organization_id: orgId, invited_count: invitedCount },
          { onConflict: 'campaign_id' },
        )
      if (deliveryError) {
        setError(
          `Campagne is aangemaakt, maar het aantal deelnemers kon niet worden opgeslagen: ${deliveryError.message}. Zet het alsnog via de campagnepagina of laat de klant het in stap 1 invullen.`,
        )
        setLoading(false)
        router.refresh()
        return
      }
    }

    setSuccess(true)
    setName('')
    setDeliveryMode('baseline')
    setDeptRows([{ label: '', invitedCount: '' }, { label: '', invitedCount: '' }])
    setTargetCount('')
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
          Elke afdeling krijgt een eigen variant van de campagnelink. Er is dan bewust geen
          algemene link: elke deelnemer komt binnen via de link van zijn afdeling.
        </p>
        {useSegments ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Afdelingen uit de intake (minimaal 2, elk minimaal {MIN_INVITED_PER_DEPARTMENT} medewerkers), of alles leeg
              laten zodat de klant dit zelf invult bij de setup.
            </p>
            {deptRows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={row.label}
                  placeholder="Afdelingsnaam"
                  onChange={(event) => updateDeptRow(index, { label: event.target.value })}
                  className={`${fieldClass} flex-1`}
                />
                <input
                  type="number"
                  min={MIN_INVITED_PER_DEPARTMENT}
                  value={row.invitedCount}
                  placeholder="Aantal medewerkers"
                  aria-label="Aantal medewerkers"
                  onChange={(event) =>
                    updateDeptRow(index, { invitedCount: event.target.value === '' ? '' : Number(event.target.value) })
                  }
                  className={`${fieldClass} w-44`}
                />
                {deptRows.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeDeptRow(index)}
                    aria-label="Verwijder afdeling"
                    className="rounded-2xl border border-slate-200 px-3 text-sm text-slate-500 hover:bg-white"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => addDeptRow()}
                className="text-xs font-medium text-blue-700 underline underline-offset-2"
              >
                + Afdeling toevoegen
              </button>
              <button
                type="button"
                onClick={() => addDeptRow(OTHER_DEPARTMENT_LABEL)}
                className="text-xs font-medium text-blue-700 underline underline-offset-2"
              >
                Voeg &ldquo;Geen afdeling / overig&rdquo; toe
              </button>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Aanbevolen voor iedereen die nergens onder valt (bijv. directie); anders klikken
              zij mogelijk willekeurig een afdeling aan.
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Aantal in de doelgroep <span className="font-normal text-slate-400">(uit de intake; minimaal {MIN_INVITED_TOTAL}, of leeg laten)</span>
            </label>
            <input
              type="number"
              min={MIN_INVITED_TOTAL}
              value={targetCount}
              placeholder="bijv. 180"
              onChange={(event) => setTargetCount(event.target.value === '' ? '' : Number(event.target.value))}
              className={fieldClass}
            />
            <p className="mt-1 text-xs leading-5 text-slate-500">
              De klant ziet dit voorgevuld in stap 1 van de wizard en corrigeert het daar.
            </p>
          </div>
        )}
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
