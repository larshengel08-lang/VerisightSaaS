'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  minimal?: boolean
  submitLabel?: string
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
  minimal = false,
  submitLabel = 'Plan mijn kennismaking',
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
      form.currentQuestion.trim().length < 5
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
          current_question: form.currentQuestion,
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
    : 'rounded-[1.25rem] border border-white/10 bg-white/4 p-6'

  const labelClass = isLight ? 'text-slate-700' : 'text-slate-200'
  const inputClass = isLight
    ? 'border-[#E6DED2] bg-white/88 text-slate-950 placeholder:text-slate-400 focus:border-[#3C8D8A] focus:ring-[#3C8D8A]/20'
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

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      <div className="grid gap-5 sm:grid-cols-2">
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
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            Welke route lijkt nu het meest logisch?
          </label>
          <select
            id="routeInterest"
            required
            value={form.routeInterest}
            onChange={(event) => updateField('routeInterest', normalizeContactRouteInterest(event.target.value))}
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
          >
            {CONTACT_ROUTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="desiredTiming" className={`mb-2 block text-sm font-medium ${labelClass}`}>
            Wanneer wil je de eerste stap zetten?
          </label>
          <select
            id="desiredTiming"
            required
            value={form.desiredTiming}
            onChange={(event) => updateField('desiredTiming', normalizeContactDesiredTiming(event.target.value))}
            className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
          >
            {CONTACT_DESIRED_TIMING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="currentQuestion" className={`mb-2 block text-sm font-medium ${labelClass}`}>
          Wat wil je nu vooral begrijpen van behoud of uitstroom?
        </label>
        <textarea
          id="currentQuestion"
          required
          rows={5}
          value={form.currentQuestion}
          onChange={(event) => updateField('currentQuestion', event.target.value)}
          className={`block min-w-0 w-full rounded-[0.82rem] border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
          placeholder="Bijvoorbeeld: we doen al exitgesprekken, maar missen een vergelijkbaar managementbeeld. Of: we willen eerder zien waar behoud in specifieke teams begint te schuiven."
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
        <div className={`mt-5 rounded-[1rem] border px-5 py-5 text-sm ${successClass}`}>
          <p className="font-semibold">Aanvraag ontvangen.</p>
          <div className="mt-2 space-y-2 leading-7">
            <p>
              We reageren meestal binnen 1 werkdag met een eerste reactie op{' '}
              <span className="font-semibold">{successState.routeLabel}</span> en of{' '}
              <span className="font-semibold">{successState.firstStepLabel}</span> nu logisch is.
            </p>
            <p>
              In het gesprek toetsen we jullie managementvraag, gewenste timing (
              <span className="font-semibold">{successState.desiredTimingLabel}</span>) en welke intake of
              databasis nodig is om vlot naar uitvoering en eerste waarde te gaan.
            </p>
            <p>Een vervolgrichting wordt pas concreet zodra de eerste route en eerste uitkomst helder zijn.</p>
            <p>In deze stap krijgt u nog geen live inrichting of definitieve offerte.</p>
            {successState.leadId ? <p className="text-xs opacity-80">Referentie: {successState.leadId}.</p> : null}
          </div>
        </div>
      ) : null}

      {warningMessage ? (
        <div className={`mt-5 rounded-[1rem] border px-5 py-4 text-sm ${warningClass}`}>{warningMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className={`mt-5 rounded-[1rem] border px-5 py-4 text-sm ${errorClass}`}>{errorMessage}</div>
      ) : null}

      <div className="mt-7 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex min-w-[14rem] items-center justify-center rounded-[0.82rem] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass}`}
        >
          {loading ? 'Bezig met plannen...' : submitLabel}
        </button>
      </div>

      {!minimal ? (
        <p className={`mt-4 text-xs leading-6 ${helperClass}`}>
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
      ) : null}
    </form>
  )
}
