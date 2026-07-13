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

    const timeout = setTimeout(() => {
      if (mounted) router.replace('/login?error=invite')
    }, 5000)

    function applySession(userEmail: string | null | undefined) {
      if (!mounted) return
      clearTimeout(timeout)
      setEmail(userEmail ?? null)
      setChecking(false)
    }

    // @supabase/ssr's createBrowserClient forceert altijd flowType 'pkce'
    // (hardcoded in de library, niet via options te overschrijven) — die
    // client herkent dus alleen een ?code=-param, nooit een #access_token-
    // hash. Een server-verstuurde activatielink (sendActivationLink) kan
    // echter geen geldige pkce-code leveren: de code_verifier hoort thuis in
    // dezelfde browser die de link verstuurt, en dat is nooit de browser van
    // de ontvanger. Daarom stuurt de activatiemail nu een token_hash mee
    // (Supabase-template aangepast) die hier expliciet met verifyOtp wordt
    // ingewisseld — dat werkt ongeacht flowType. Bestaat er geen token_hash
    // (bv. een teruggekeerde, al ingelogde gebruiker), dan valt dit terug op
    // de gewone getUser()-check.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) applySession(session.user.email)
    })

    async function verifyFromTokenHash(): Promise<boolean> {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type = params.get('type')
      if (!tokenHash || !type) return false

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as 'magiclink' | 'invite' | 'recovery' | 'email' | 'signup' | 'email_change',
      })
      if (!mounted) return true
      if (error || !data.user) {
        router.replace('/login?error=invite')
        return true
      }
      // L5: strip het (nu verbruikte) token_hash uit de URL zodat het niet in de
      // browser-history/adresbalk blijft staan op een gedeeld apparaat.
      window.history.replaceState({}, '', window.location.pathname)
      applySession(data.user.email)
      return true
    }

    async function loadExistingSession() {
      const handledViaTokenHash = await verifyFromTokenHash()
      if (handledViaTokenHash) return

      const { data } = await supabase.auth.getUser()
      if (data.user) applySession(data.user.email)
    }
    void loadExistingSession()

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
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
            Loep
          </Link>
          <p className="mt-2 text-sm text-gray-500">Account activeren voor dashboardtoegang</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr),minmax(320px,0.95fr)]">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {checking ? (
              <div className="text-center">
                <h1 className="mb-2 text-lg font-semibold text-gray-900">Activatielink verifiëren...</h1>
                <p className="text-sm text-gray-500">Even geduld. We ronden je dashboardtoegang af.</p>
              </div>
            ) : (
              <>
                <h1 className="mb-2 text-xl font-semibold text-gray-900">Kies direct een wachtwoord</h1>
                <p className="mb-6 text-sm text-gray-500">
                  Je bent ingelogd via de activatiemail voor {email ?? 'jouw account'}. Stel nu meteen een wachtwoord in,
                  zodat je later gewoon via de inlogpagina kunt terugkomen. Na deze stap is je account klaar voor
                  het juiste dashboard en de juiste campagne.
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
                      placeholder="••••••••"
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Begeleide inrichting</p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Je account gaat pas open als het dashboard, de campagne en de respondentgroep voor je klaarstaan.
                Daardoor kom je niet in een lege omgeving terecht, maar meteen in de juiste werkomgeving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

