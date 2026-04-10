'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CompleteAccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getUser()

      if (!mounted) {
        return
      }

      if (!data.user) {
        router.replace('/login?error=invite')
        return
      }

      setEmail(data.user.email ?? null)
      setChecking(false)
    }

    void loadSession()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== password2) {
      setError('Wachtwoorden komen niet overeen.')
      return
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Wachtwoord instellen mislukt. Probeer het opnieuw of gebruik later Wachtwoord vergeten.')
      return
    }

    setSuccess('Account geactiveerd. Je wordt doorgestuurd naar het dashboard...')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Verisight
          </Link>
          <p className="mt-2 text-sm text-gray-500">Account activeren voor dashboardtoegang</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {checking ? (
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Activatielink verifiëren...</h1>
              <p className="text-sm text-gray-500">
                Even geduld. We ronden je dashboardtoegang af.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Kies direct een wachtwoord</h1>
              <p className="text-sm text-gray-500 mb-6">
                Je bent ingelogd via de activatiemail voor {email ?? 'jouw account'}. Stel nu meteen een wachtwoord in,
                zodat je later gewoon via de inlogpagina kunt terugkomen.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nieuw wachtwoord
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimaal 8 tekens"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                    Bevestig wachtwoord
                  </label>
                  <input
                    id="password2"
                    type="password"
                    required
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Opslaan...' : 'Wachtwoord instellen'}
                </button>
              </form>

              <button
                type="button"
                onClick={handleSkip}
                className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Nu overslaan en doorgaan naar dashboard
              </button>

              <p className="mt-4 text-xs text-gray-400">
                Liever later? Dat kan ook. Je kunt altijd via{' '}
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Wachtwoord vergeten
                </Link>{' '}
                alsnog een vast wachtwoord instellen.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
