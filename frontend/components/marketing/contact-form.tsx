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

const initialState: FormState = {
  name: '',
  workEmail: '',
  organization: '',
  employeeCount: '',
  currentQuestion: '',
  website: '',
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSuccessMessage(null)
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

      setSuccessMessage(payload.message ?? 'Bedankt. We reageren meestal binnen 1 werkdag.')
      setForm(initialState)
    } catch {
      setErrorMessage('Je aanvraag kon niet worden verzonden. Probeer het opnieuw of mail naar hallo@verisight.nl.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.22)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
            Naam
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
            placeholder="Voor- en achternaam"
          />
        </div>

        <div>
          <label htmlFor="workEmail" className="mb-2 block text-sm font-medium text-slate-200">
            Werk e-mail
          </label>
          <input
            id="workEmail"
            type="email"
            required
            value={form.workEmail}
            onChange={(event) => updateField('workEmail', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
            placeholder="naam@organisatie.nl"
          />
        </div>

        <div>
          <label htmlFor="organization" className="mb-2 block text-sm font-medium text-slate-200">
            Organisatie
          </label>
          <input
            id="organization"
            type="text"
            required
            value={form.organization}
            onChange={(event) => updateField('organization', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
            placeholder="Naam organisatie"
          />
        </div>

        <div>
          <label htmlFor="employeeCount" className="mb-2 block text-sm font-medium text-slate-200">
            Omvang organisatie
          </label>
          <select
            id="employeeCount"
            required
            value={form.employeeCount}
            onChange={(event) => updateField('employeeCount', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
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
        <label htmlFor="currentQuestion" className="mb-2 block text-sm font-medium text-slate-200">
          Wat wil je nu vooral begrijpen van uitstroom?
        </label>
        <textarea
          id="currentQuestion"
          required
          rows={5}
          value={form.currentQuestion}
          onChange={(event) => updateField('currentQuestion', event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/30"
          placeholder="Bijvoorbeeld: we doen exitgesprekken, maar missen overzicht over terugkerende redenen per team."
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

      {successMessage && (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-300">
          Verkennend gesprek van 20 minuten. Reactie meestal binnen 1 werkdag.
        </p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verstuur bericht...' : 'Verstuur bericht'}
        </button>
      </div>
    </form>
  )
}
