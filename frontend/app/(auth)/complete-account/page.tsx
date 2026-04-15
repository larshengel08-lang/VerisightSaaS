'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ActivationJourneyPanel } from '@/components/dashboard/onboarding-panels'
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-blue-600">
            Verisight
          </Link>
          <p className="mt-2 text-sm text-gray-500">Account activeren voor dashboardtoegang</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr),minmax(320px,0.95fr)]">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {checking ? (
              <div className="text-center">
                <h1 className="mb-2 text-lg font-semibold text-gray-900">Activatielink verifiÃ«ren...</h1>
                <p className="text-sm text-gray-500">Even geduld. We ronden je dashboardtoegang af.</p>
              </div>
            ) : (
              <>
                <h1 className="mb-2 text-xl font-semibold text-gray-900">Kies direct een wachtwoord</h1>
                <p className="mb-6 text-sm text-gray-500">
                  Je bent ingelogd via de activatiemail voor {email ?? 'jouw account'}. Stel nu meteen een wachtwoord in,
                  zodat je later gewoon via de inlogpagina kunt terugkomen.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                      Nieuw wachtwoord
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password2" className="mb-1 block text-sm font-medium text-gray-700">
                      Bevestig wachtwoord
                    </label>
                    <input
                      id="password2"
                      type="password"
                      required
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      {success}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="space-y-6">
            <ActivationJourneyPanel />
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Assisted onboarding</p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Verisight verkoopt geen self-service surveytool. Dit account is het handoff-moment naar jouw dashboard en
                rapport, nadat de campaign en respondentflow al voor je zijn voorbereid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
