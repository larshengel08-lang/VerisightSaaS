'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError('Er is iets misgegaan. Controleer het e-mailadres en probeer opnieuw.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Verisight
          </Link>
          <p className="mt-2 text-sm text-gray-500">Wachtwoord herstellen</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✉️
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-2">E-mail verzonden</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Als <strong>{email}</strong> bekend is in ons systeem, ontvang je een e-mail
                met een link om je wachtwoord opnieuw in te stellen. Controleer ook je spammap.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Terug naar inloggen
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Wachtwoord vergeten?</h1>
              <p className="text-sm text-gray-500 mb-6">
                Vul je e-mailadres in. Als het bekend is, sturen we je een herstelLink.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mailadres
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="naam@organisatie.nl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Bezig…' : 'Herstellink versturen'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            ← Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
