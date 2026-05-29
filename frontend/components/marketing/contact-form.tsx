'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { contactTrustSignals } from '@/components/marketing/site-content'
import {
  CONTACT_DESIRED_TIMING_OPTIONS,
  CONTACT_ROUTE_OPTIONS,
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
  variant?: 'default' | 'simplified'
  questionPlaceholder?: string
}

interface SuccessState {
  leadId: string | null
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
  variant = 'default',
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isLight = surface === 'light'
  const isCompact = mode === 'compact'
  const isSimplified = variant === 'simplified'

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
            : payload.detail ?? 'Je aanvraag kon niet worden verzonden. Probeer het later opnieuw of mail naar hallo@getloep.nl.',
        )
        return
      }

      setSuccessState({
        leadId: payload.lead_id ?? null,
      })
      setForm((current) => ({
        ...initialState,
        routeInterest: current.routeInterest,
        desiredTiming: current.desiredTiming,
      }))
    } catch {
      setErrorMessage('Je aanvraag kon niet worden verzonden. Probeer het opnieuw of mail naar hallo@getloep.nl.')
    } finally {
      setLoading(false)
    }
  }

  const shellClass = isLight
    ? 'w-full'
    : 'rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.22)]'

  const labelClass = isLight ? 'text-slate-700' : 'text-slate-200'
  const inputClass = isLight
    ? 'border-[#E5E0D6] bg-white text-slate-950 placeholder:text-slate-400 focus:border-[#C96A4B] focus:ring-[#C96A4B]/20'
    : 'border-white/10 bg-slate-950/40 text-white placeholder:text-slate-400 focus:border-[#F3E4DA] focus:ring-[#C96A4B]/30'
  const helperClass = isLight ? 'text-slate-500' : 'text-slate-300'
  const successClass = isLight
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
  const errorClass = isLight
    ? 'border-red-200 bg-red-50 text-red-800'
    : 'border-red-400/30 bg-red-400/10 text-red-100'
  const buttonClass = isLight
    ? 'bg-[#C96A4B] hover:bg-[#B85D41]'
    : 'bg-[#C96A4B] hover:bg-[#B85D41]'
  const panelSpacingClass = isCompact
    ? 'mb-5 rounded-[1.35rem] px-4 py-4 leading-6 sm:px-5 sm:py-5 sm:leading-7'
    : isSimplified
      ? 'mb-2 rounded-[1.2rem] px-0 py-0 leading-7'
      : 'mb-4 rounded-[1.2rem] px-0 py-0 leading-7'
  const fieldGridClass = isCompact ? 'grid gap-4 sm:grid-cols-2' : isSimplified ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-5 sm:grid-cols-2'
  const fieldClass = `block min-w-0 w-full rounded-2xl border px-4 ${isCompact || isSimplified ? 'py-2.5 sm:py-3' : 'py-3'} text-sm outline-none transition focus:ring-2 ${inputClass}`
  const billingReadinessCopy = getBillingReadinessCopy({
    contractSigned: false,
    paymentMethodConfirmed: false,
  })

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      {!isSimplified ? (
        <div className={panelSpacingClass}>
          <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'} ${isCompact ? 'leading-6' : 'leading-7'}`}>
            {isCompact
              ? 'Gebruik dit formulier om snel te bepalen welke eerste route nu het best past en welke eerste output daarna logisch is.'
              : 'Gebruik dit formulier om te bepalen welke eerste route nu het best past en welke eerste output daarna logisch is.'}
          </p>
        </div>
      ) : null}

      {!isCompact && !isSimplified ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {contactTrustSignals.map((signal) => (
            <span
              key={signal}
              className={`rounded-2xl px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] ${isLight ? 'border border-[#E5E0D6] bg-[#F3E4DA] text-[#4A5563]' : 'border border-white/10 bg-white/5 text-slate-200'}`}
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

        {!isSimplified ? (
          <div className={isCompact ? '' : 'sm:col-span-2'}>
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
        ) : null}

        {!isCompact ? (
          <div className={isSimplified ? '' : 'sm:col-span-2'}>
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

      <div className={isCompact ? 'mt-4' : isSimplified ? 'mt-4' : 'mt-5'}>
        <label htmlFor="currentQuestion" className={`mb-2 block text-sm font-medium ${labelClass}`}>
          {isCompact
            ? 'Korte toelichting (optioneel)'
            : isSimplified
              ? 'Wat vraagt nu het eerst duidelijkheid?'
              : 'Wat wil je nu vooral begrijpen van behoud of uitstroom?'}
        </label>
        <textarea
          id="currentQuestion"
          required={!isCompact}
          rows={isCompact ? 2 : isSimplified ? 4 : 5}
          value={form.currentQuestion}
          onChange={(event) => updateField('currentQuestion', event.target.value)}
          className={`block min-w-0 w-full rounded-2xl border px-4 ${isCompact || isSimplified ? 'py-2.5 sm:py-3' : 'py-3'} text-sm outline-none transition focus:ring-2 ${inputClass}`}
          placeholder={
            isCompact
              ? 'Optioneel: licht kort toe wat nu bestuurlijke aandacht vraagt.'
              : isSimplified
                ? 'Beschrijf kort wat nu het eerst aandacht of duidelijkheid vraagt.'
              : (questionPlaceholder ?? 'Beschrijf kort wat u nu vooral wilt begrijpen of waar de vraag vastloopt.')
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
          <p className="font-semibold">Geslaagd</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className={`mt-5 rounded-[1.5rem] border px-5 py-4 text-sm ${errorClass}`}>{errorMessage}</div>
      ) : null}

      <div className={`flex flex-col gap-4 ${isSimplified ? 'mt-5 pt-4' : 'mt-6 border-t border-[var(--border)] pt-5 sm:mt-7 sm:pt-6'}`}>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:min-w-[14rem] sm:w-auto ${buttonClass}`}
        >
                {loading ? 'Kennismaking wordt verstuurd...' : 'Plan een kennismaking'}
        </button>
        {!isCompact && !isSimplified ? <p className={`text-xs leading-6 ${helperClass}`}>{billingReadinessCopy}</p> : null}
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

