'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function NewOrgForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    setSlug(normalizeSlug(value))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('organizations')
      .insert({ name, slug: normalizeSlug(slug), contact_email: email })

    if (insertError) {
      setError(insertError.message.includes('unique') ? 'Slug is al in gebruik.' : insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setName('')
    setSlug('')
    setEmail('')
    setTimeout(() => {
      setSuccess(false)
      router.refresh()
    }, 1500)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Naam organisatie" required>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="Acme BV"
          className={inputCls}
        />
      </Field>

      <Field label="Slug" required hint="Alleen a-z, 0-9, koppelstreep">
        <input
          type="text"
          required
          value={slug}
          onChange={(event) => setSlug(normalizeSlug(event.target.value))}
          pattern="[a-z0-9\\-]+"
          placeholder="acme-bv"
          className={inputCls}
        />
      </Field>

      <Field label="Contacte-mail" required>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="hr@acme.nl"
          className={inputCls}
        />
      </Field>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">Organisatie aangemaakt.</p> : null}

      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Bezig...' : '+ Aanmaken'}
      </button>
    </form>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        {hint ? <span className="ml-1 text-xs font-normal text-gray-400">({hint})</span> : null}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
const btnCls =
  'w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
