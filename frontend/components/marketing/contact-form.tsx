'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { contactTrustSignals } from '@/components/marketing/site-content'
import {
  CONTACT_DESIRED_TIMING_OPTIONS,
  CONTACT_ROUTE_OPTIONS,
  getContactDesiredTimingLabel,
  getContactFirstStepLabel,
  getContactRouteLabel,
  inferRouteInterestFromSource,
  normalizeContactCtaSource,
  normalizeContactDesiredTiming,
  normalizeContactRouteInterest,
  type ContactDesiredTiming,
  type ContactRouteInterest,
} from '@/lib/contact-funnel'
import { getBillingReadinessCopy } from '@/lib/billing-registry'

interface FormState {
  name: string
  workEmail: string
  organization: string
  employeeCount: string
  routeInterest: ContactRouteInterest
  desiredTiming: ContactDesiredTiming
  currentQuestion: string
  website: string
}

interface ContactFormProps {
  surface?: 'dark' | 'light'
  defaultRouteInterest?: ContactRouteInterest
  defaultCtaSource?: string
  mode?: 'full' | 'compact'
  questionPlaceholder?: string
}

interface SuccessState {
  leadId: string | null
  routeLabel: string
  firstStepLabel: string
  desiredTimingLabel: string
}

const initialState: FormState = {
  name: '',
  workEmail: '',
  organization: '',
  employeeCount: '',
  routeInterest: 'exitscan',
  desiredTiming: 'orienterend',
  currentQuestion: '',
  website: '',
}

export function ContactForm({
  surface = 'dark',
  defaultRouteInterest = 'exitscan',
  defaultCtaSource = 'website_contact_form',
  mode = 'full',
  questionPlaceholder,
}: ContactFormProps) {
  const searchParams = useSearchParams()
  const [form, setForm] = useState<FormState>({
    ...initialState,
    routeInterest: defaultRouteInterest,
  })
  const [ctaSource, setCtaSource] = useState(normalizeContactCtaSource(defaultCtaSource))
  const [loading, setLoading] = useState(false)
  const [successState, setSuccessState] = useState<SuccessState | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isLight = surface === 'light'
  const isCompact = mode === 'compact'

  useEffect(() => {
    const sourceFromQuery = searchParams.get('cta_source')
    const routeFromQuery = searchParams.get('route_interest')
    const desiredTimingFromQuery = searchParams.get('desired_timing')
    const resolvedSource = normalizeContactCtaSource(sourceFromQuery ?? defaultCtaSource)
    const resolvedRoute =
      routeFromQuery?.trim()
        ? normalizeContactRouteInterest(routeFromQuery)
        : inferRouteInterestFromSource(resolvedSource) || defaultRouteInterest

    setForm((current) => ({
      ...current,
      routeInterest: resolvedRoute,
      desiredTiming: desiredTimingFromQuery
        ? normalizeContactDesiredTiming(desiredTimingFromQuery)
        : current.desiredTiming,
    }))
    setCtaSource(resolvedSource)
  }, [defaultCtaSource, defaultRouteInterest, searchParams])

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSuccessState(null)
    setWarningMessage(null)
    setErrorMessage(null)

    if (
      form.name.trim().length < 2 ||
      form.workEmail.trim().length < 5 ||
      form.organization.trim().length < 2 ||
      form.employeeCount.trim().length < 2 ||
      (!isCompact && form.currentQuestion.trim().length < 5)
    ) {
      setErrorMessage('Vul naam, werk e-mail, organisatie, omvang en een korte vraag of context in.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          work_email: form.workEmail,
          organization: form.organization,
          employee_count: form.employeeCount,
          route_interest: form.routeInterest,
          cta_source: ctaSource,
          desired_timing: form.desiredTiming,
          current_question:
            form.currentQuestion.trim() ||
            `We willen de juiste eerste managementroute bepalen voor ${getContactRouteLabel(form.routeInterest)}.`,
          website: form.website,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrorMessage(
          payload.detail === 'Vul alle verplichte velden volledig in.'
            ? 'Vul naam, werk e-mail, organisatie, omvang en een korte vraag of context in.'
            : payload.detail ?? 'Je aanvraag kon niet worden verzonden. Probeer het later opnieuw of mail naar hallo@verisight.nl.',
        )
        return
      }

      const routeLabel = getContactRouteLabel(form.routeInterest)
      const firstStepLabel = getContactFirstStepLabel(form.routeInterest)
      const desiredTimingLabel = getContactDesiredTimingLabel(form.desiredTiming)
      setSuccessState({
        leadId: payload.lead_id ?? null,
        routeLabel,
        firstStepLabel,
        desiredTimingLabel,
      })
      if (payload.notification_sent === false) {
        const reference = payload.lead_id ? ` Referentie: ${payload.lead_id}.` : ''
        setWarningMessage(
          `${payload.warning ?? 'Je aanvraag is opgeslagen, maar de e-mailnotificatie liep vast.'}${reference} Je aanvraag blijft wel veilig geregistreerd in Verisight.`,
        )
      }
      setForm((current) => ({
        ...initialState,
        routeInterest: current.routeInterest,
        desiredTiming: current.desiredTiming,
      }))
    } catch {
      setErrorMessage('Je aanvraag kon niet worden verzonden. Probeer het opnieuw of mail naar hallo@verisight.nl.')
    } finally {
      setLoading(false)
    }
  }

  const shellClass = isLight
    ? 'w-full'
    : 'rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.22)]'

  const labelClass = isLight ? 'text-slate-700' : 'text-slate-200'
  const inputClass = isLight
    ? 'border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-[#3C8D8A] focus:ring-[#3C8D8A]/25'
    : 'border-white/10 bg-slate-950/40 text-white placeholder:text-slate-400 focus:border-[#DCEFEA] focus:ring-[#3C8D8A]/30'
  const helperClass = isLight ? 'text-slate-500' : 'text-slate-300'
  const successClass = isLight
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
  const errorClass = isLight
    ? 'border-red-200 bg-red-50 text-red-800'
    : 'border-red-400/30 bg-red-400/10 text-red-100'
  const warningClass = isLight
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  const buttonClass = isLight
    ? 'bg-[#3C8D8A] hover:bg-[#2d6e6b]'
    : 'bg-[#3C8D8A] hover:bg-[#2d6e6b]'
  const panelSpacingClass = isCompact ? 'mb-5 rounded-[1.35rem] px-4 py-4 leading-6 sm:px-5 sm:py-5 sm:leading-7' : 'mb-6 rounded-[1.5rem] px-5 py-5 leading-7'
  const fieldGridClass = isCompact ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-5 sm:grid-cols-2'
  const fieldClass = `block min-w-0 w-full rounded-2xl border px-4 ${isCompact ? 'py-2.5 sm:py-3' : 'py-3'} text-sm outline-none transition focus:ring-2 ${inputClass}`
  const billingReadinessCopy = getBillingReadinessCopy({
    contractSigned: false,
    paymentMethodConfirmed: false,
  })

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      <div
        className={`${panelSpacingClass} border text-sm ${
          isLight ? 'border-[#E5E0D6] bg-[#F7F5F1] text-slate-700' : 'border-white/10 bg-white/5 text-slate-200'
        }`}
      >
        {isCompact
          ? 'Gebruik dit formulier om snel te bepalen welke eerste route nu het best past en welke eerste output daarna logisch is.'
          : 'Gebruik dit formulier in de eerste plaats om te bepalen of ExitScan, RetentieScan of de combinatieroute nu de juiste eerste stap is. Tijdens de intake toetsen we ook wanneer vervolgroutes logisch worden en welke eerste output daarna past.'}
        {!isCompact ? <span className={`mt-3 block text-xs ${helperClass}`}>{billingReadinessCopy}</span> : null}
      </div>

      {!isCompact ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {contactTrustSignals.map((signal) => (
            <span
              key={signal}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isLight ? 'border border-[#E5E0D6] bg-white text-slate-600' : 'border border-white/10 bg-white/5 text-slate-200'}`}
            >
              {signal}
            </span>
          ))}
        </div>
      ) : null}

      <div className={fieldGridClass}>
        <div>
          <label htmlFor="name" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            Naam
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className={fieldClass}
            placeholder="Voor- en achternaam"
          />
        </div>

        <div>
          <label htmlFor="workEmail" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            Werk e-mail
          </label>
          <input
            id="workEmail"
            type="email"
            required
            value={form.workEmail}
            onChange={(event) => updateField('workEmail', event.target.value)}
            className={fieldClass}
            placeholder="naam@organisatie.nl"
          />
        </div>

        <div>
          <label htmlFor="organization" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            Organisatie
          </label>
          <input
            id="organization"
            type="text"
            required
            value={form.organization}
            onChange={(event) => updateField('organization', event.target.value)}
            className={fieldClass}
            placeholder="Naam organisatie"
          />
        </div>

        <div>
          <label htmlFor="employeeCount" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            Omvang organisatie
          </label>
          <select
            id="employeeCount"
            required
            value={form.employeeCount}
            onChange={(event) => updateField('employeeCount', event.target.value)}
            className={fieldClass}
          >
            <option value="" disabled>
              Kies een range
            </option>
            <option value="200 - 400 medewerkers">200 - 400 medewerkers</option>
            <option value="400 - 700 medewerkers">400 - 700 medewerkers</option>
            <option value="700 - 1.000 medewerkers">700 - 1.000 medewerkers</option>
            <option value="Anders / nog niet zeker">Anders / nog niet zeker</option>
          </select>
        </div>

        <div>
          <label htmlFor="routeInterest" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            {isCompact ? 'Primaire managementvraag' : 'Welke route lijkt nu het best te passen?'}
          </label>
          <select
            id="routeInterest"
            required
            value={form.routeInterest}
            onChange={(event) => updateField('routeInterest', normalizeContactRouteInterest(event.target.value))}
            className={fieldClass}
          >
            {CONTACT_ROUTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {!isCompact ? (
          <div>
            <label htmlFor="desiredTiming" className={`mb-2 block text-sm font-medium ${labelClass}`}>
              Wanneer wil je de eerste stap zetten?
            </label>
            <select
              id="desiredTiming"
              required
              value={form.desiredTiming}
              onChange={(event) => updateField('desiredTiming', normalizeContactDesiredTiming(event.target.value))}
              className={fieldClass}
            >
              {CONTACT_DESIRED_TIMING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className={isCompact ? 'mt-4' : 'mt-5'}>
        <label htmlFor="currentQuestion" className={`mb-2 block text-sm font-medium ${labelClass}`}>
          {isCompact ? 'Korte toelichting (optioneel)' : 'Wat wil je nu vooral begrijpen van behoud of uitstroom?'}
        </label>
        <textarea
          id="currentQuestion"
          required={!isCompact}
          rows={isCompact ? 2 : 5}
          value={form.currentQuestion}
          onChange={(event) => updateField('currentQuestion', event.target.value)}
          className={`block min-w-0 w-full rounded-2xl border px-4 ${isCompact ? 'py-2.5 sm:py-3' : 'py-3'} text-sm outline-none transition focus:ring-2 ${inputClass}`}
          placeholder={
            isCompact
              ? 'Optioneel: licht kort toe wat nu bestuurlijke aandacht vraagt.'
              : (questionPlaceholder ?? 'Bijvoorbeeld: we doen al exitgesprekken, maar missen een vergelijkbaar beeld voor management. Of: we willen eerder zien waar behoud in specifieke teams begint te schuiven.')
          }
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => updateField('website', event.target.value)}
        />
      </div>

      {successState ? (
        <div className={`mt-5 rounded-[1.5rem] border px-5 py-5 text-sm ${successClass}`}>
          <p className="font-semibold">Suite-demo aangevraagd.</p>
          <div className="mt-2 space-y-2 leading-7">
            <p>
              We reageren meestal binnen 1 werkdag met een eerste route-inschatting voor{' '}
              <span className="font-semibold">{successState.routeLabel}</span> en of{' '}
              <span className="font-semibold">{successState.firstStepLabel}</span> nu logisch is.
            </p>
            <p>
              In de suite-demo toetsen we jullie managementvraag, gewenste timing (
              <span className="font-semibold">{successState.desiredTimingLabel}</span>) en welke intake of
              databasis nodig is om vlot naar dashboard, rapport, Action Center en eerste waarde te gaan.
            </p>
            <p>Een vervolgroute of combinatieroute wordt pas concreet zodra de eerste route en eerste managementwaarde helder zijn.</p>
            <p>In deze stap krijg je nog geen live inrichting of definitieve offerte zonder intake.</p>
            {successState.leadId ? <p className="text-xs opacity-80">Referentie: {successState.leadId}.</p> : null}
          </div>
        </div>
      ) : null}

      {warningMessage ? (
        <div className={`mt-5 rounded-[1.5rem] border px-5 py-4 text-sm ${warningClass}`}>{warningMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className={`mt-5 rounded-[1.5rem] border px-5 py-4 text-sm ${errorClass}`}>{errorMessage}</div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:mt-7 sm:pt-6">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:min-w-[14rem] sm:w-auto ${buttonClass}`}
        >
              {loading ? 'Route-inschatting wordt verstuurd...' : 'Plan een eerste route-inschatting'}
        </button>
      </div>

      <p className={`mt-4 text-[11px] leading-6 sm:text-xs ${helperClass}`}>
        Bekijk ook{' '}
        <Link href="/vertrouwen" className="underline">
          Trust & privacy
        </Link>
        , het{' '}
        <Link href="/privacy" className="underline">
          privacybeleid
        </Link>{' '}
        en de{' '}
        <Link href="/dpa" className="underline">
          verwerkersovereenkomst
        </Link>{' '}
        voor de publieke basis.
      </p>
    </form>
  )
}
