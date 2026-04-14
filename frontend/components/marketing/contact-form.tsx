'use client'

import { useState } from 'react'

interface FormState {
  name: string
  workEmail: string
  organization: string
  employeeCount: string
  currentQuestion: string
  website: string
}

interface ContactFormProps {
  surface?: 'dark' | 'light'
}

const initialState: FormState = {
  name: '',
  workEmail: '',
  organization: '',
  employeeCount: '',
  currentQuestion: '',
  website: '',
}

export function ContactForm({ surface = 'dark' }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isLight = surface === 'light'

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage(null)
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

      setSuccessMessage(payload.message ?? 'Verstuurd')
      if (payload.notification_sent === false) {
        const reference = payload.lead_id ? ` Referentie: ${payload.lead_id}.` : ''
        setWarningMessage(
          `${payload.warning ?? 'Je aanvraag is opgeslagen, maar de e-mailnotificatie liep vast.'}${reference}`,
        )
      }
      setForm(initialState)
    } catch {
      setErrorMessage('Je aanvraag kon niet worden verzonden. Probeer het opnieuw of mail naar hallo@verisight.nl.')
    } finally {
      setLoading(false)
    }
  }

  const shellClass = isLight
    ? 'rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)]'
    : 'rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.22)]'

  const labelClass = isLight ? 'text-slate-700' : 'text-slate-200'
  const inputClass = isLight
    ? 'border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/25'
    : 'border-white/10 bg-slate-950/40 text-white placeholder:text-slate-400 focus:border-blue-300 focus:ring-blue-400/30'
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
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-blue-700 hover:bg-blue-800'

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      <div className={`mb-5 rounded-2xl border px-4 py-4 text-sm leading-7 ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/10 bg-white/5 text-slate-200'}`}>
        Gebruik dit formulier voor ExitScan, RetentieScan of de combinatie. We helpen eerst kiezen welke productroute logisch is en pas daarna hoe een traject eruit moet zien.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
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
      </div>

      <div className="mt-4">
        <label htmlFor="currentQuestion" className={`mb-2 block text-sm font-medium ${labelClass}`}>
          Wat wil je nu vooral begrijpen van behoud of uitstroom?
        </label>
        <textarea
          id="currentQuestion"
          required
          rows={5}
          value={form.currentQuestion}
          onChange={(event) => updateField('currentQuestion', event.target.value)}
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${inputClass}`}
          placeholder="Bijvoorbeeld: we doen al exitgesprekken, maar missen overzicht. Of: we willen eerder zien waar behoud onder druk staat in specifieke teams."
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

      {successMessage ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${successClass}`}>{successMessage}</div>
      ) : null}

      {warningMessage ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${warningClass}`}>{warningMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${errorClass}`}>{errorMessage}</div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm leading-6 ${helperClass}`}>
          Verkennend gesprek van 20 minuten. Eerst productkeuze, daarna aanpak en prijs. Reactie meestal binnen 1 werkdag.
        </p>
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${buttonClass}`}
        >
          {loading ? 'Verstuur bericht...' : 'Verstuur bericht'}
        </button>
      </div>
    </form>
  )
}
