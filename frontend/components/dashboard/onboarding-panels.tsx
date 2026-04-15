import type { ScanType } from '@/lib/types'
import {
  CANONICAL_CUSTOMER_LIFECYCLE,
  CANONICAL_ONBOARDING_PHASES,
  CLIENT_FILE_SPEC,
  FIRST_VALUE_THRESHOLDS,
  IMPLEMENTATION_INTAKE_INPUTS,
  PRODUCT_ROUTE_VARIANTS,
  getAdoptionSuccessDefinition,
  getFirstManagementReadSteps,
  getLifecycleDecisionCards,
} from '@/lib/client-onboarding'

export function OperatorOnboardingBlueprint() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Canonieke route</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {CANONICAL_ONBOARDING_PHASES.map((phase) => (
              <div key={phase.key} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {phase.boundary}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    Eigenaar: {phase.owner}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-950">{phase.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{phase.outcome}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{phase.customerAction}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Implementation intake</p>
            <p className="mt-3 text-sm leading-6 text-blue-950">
              Voordat je een campaign opzet, moeten deze onboardinginputs expliciet zijn. Zo blijft de handoff van sale naar delivery assisted en controleerbaar.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {IMPLEMENTATION_INTAKE_INPUTS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Klantaanlevering</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">
              <li>Verplicht: <code className="font-mono">email</code></li>
              <li>Sterk aanbevolen: <code className="font-mono">department</code>, <code className="font-mono">role_level</code></li>
              <li>ExitScan extra: <code className="font-mono">exit_month</code>, <code className="font-mono">annual_salary_eur</code></li>
              <li>RetentieScan extra: <code className="font-mono">annual_salary_eur</code></li>
            </ul>
            <p className="mt-3 text-xs leading-5 text-amber-900">{CLIENT_FILE_SPEC.segmentDeepDiveNote}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PRODUCT_ROUTE_VARIANTS.map((route) => (
          <div key={route.title} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{route.fit}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{route.title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{route.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActivationJourneyPanel() {
  return (
    <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Wat gebeurt er nu?</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          'Je account is bedoeld voor dashboardtoegang. Verisight heeft organisatie, campaign en respondentimport al voorbereid.',
          'Open na activatie eerst je campaignoverzicht. Daar zie je welke campagne al klaar is voor eerste managementread en welke nog respons opbouwt.',
          'Gebruik daarna dashboard en rapport samen voor het eerste managementgesprek. Je hoeft geen setup of surveylogica meer te beheren.',
        ].map((item, index) => (
          <div key={item} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Stap {index + 1}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ManagementReadGuide({
  scanType,
  hasMinDisplay,
  hasEnoughData,
}: {
  scanType: ScanType
  hasMinDisplay: boolean
  hasEnoughData: boolean
}) {
  const steps = getFirstManagementReadSteps(scanType)
  const lifecycleDecisionCards = getLifecycleDecisionCards(scanType)
  const stateLabel = hasEnoughData
    ? 'Stevig genoeg voor eerste patroonduiding'
    : hasMinDisplay
      ? 'Al bruikbaar, nog indicatief'
      : 'Nog vooral respons opbouwen'

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{stateLabel}</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {scanType === 'retention' ? 'RetentieScan leesroute' : 'ExitScan leesroute'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Stap {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Adoptie geslaagd</p>
          <p className="mt-3 text-sm leading-6 text-emerald-950">{getAdoptionSuccessDefinition(scanType)}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">First-value drempels</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {FIRST_VALUE_THRESHOLDS.map((threshold) => (
              <div key={threshold.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {threshold.maxResponses === null
                    ? `${threshold.minResponses}+ responses`
                    : `${threshold.minResponses}-${threshold.maxResponses} responses`}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{threshold.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{threshold.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.96fr,1.04fr]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lifecycle na eerste read</p>
          <div className="mt-4 grid gap-3">
            {CANONICAL_CUSTOMER_LIFECYCLE.map((phase) => (
              <div key={phase.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{phase.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{phase.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[22px] border border-blue-100 bg-blue-50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Logische vervolgroutes</p>
          <p className="mt-3 text-sm leading-6 text-blue-950">
            Kies pas nu of je op dezelfde route blijft, verdiept of uitbreidt. Zo blijft expansion een geloofwaardige vervolgstap op basis van eerdere waarde.
          </p>
          <div className="mt-4 grid gap-3">
            {lifecycleDecisionCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{card.fit}</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
