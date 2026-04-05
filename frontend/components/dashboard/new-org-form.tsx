'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function NewOrgForm() {
  const [name,  setName]  = useState('')
  const [slug,  setSlug]  = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Auto-genereer slug vanuit naam
  function handleNameChange(v: string) {
    setName(v)
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('organizations')
      .insert({ name, slug, contact_email: email })

    if (error) {
      setError(error.message.includes('unique') ? 'Slug is al in gebruik.' : error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setName(''); setSlug(''); setEmail('')
    setTimeout(() => { setSuccess(false); router.refresh() }, 1500)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Naam organisatie" required>
        <input
          type="text" required value={name}
          onChange={e => handleNameChange(e.target.value)}
          placeholder="Acme BV"
          className={inputCls}
        />
      </Field>

      <Field label="Slug" required hint="Alleen a–z, 0–9, koppelstreep">
        <input
          type="text" required value={slug}
          onChange={e => setSlug(e.target.value)}
          pattern="[a-z0-9\-]+"
          placeholder="acme-bv"
          className={inputCls}
        />
      </Field>

      <Field label="Contacte-mail" required>
        <input
          type="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="hr@acme.nl"
          className={inputCls}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Organisatie aangemaakt!</p>}

      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Bezig…' : '+ Aanmaken'}
      </button>
    </form>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const btnCls   = 'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors'
