'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full rounded-lg border border-[#0D1B2A]/20 bg-white px-3 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/40 focus:border-[#E8A020] focus:outline-none focus:ring-2 focus:ring-[#E8A020]/40'

const NEXT_STEPS = ['Startdatum en deelnemers', 'Uitnodigen', 'Volgen en afronden']

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
    // (hardcoded in de library, niet via options te overschrijven); die
    // client herkent dus alleen een ?code=-param, nooit een #access_token-
    // hash. Een server-verstuurde activatielink (sendActivationLink) kan
    // echter geen geldige pkce-code leveren: de code_verifier hoort thuis in
    // dezelfde browser die de link verstuurt, en dat is nooit de browser van
    // de ontvanger. Daarom stuurt de activatiemail een token_hash mee
    // (Supabase-template aangepast) die hier expliciet met verifyOtp wordt
    // ingewisseld; dat werkt ongeacht flowType. Bestaat er geen token_hash
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
      setError('De twee wachtwoorden zijn niet gelijk.')
      return
    }

    if (password.length < 8) {
      setError('Kies een wachtwoord van minimaal 8 tekens.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Het wachtwoord kon niet worden opgeslagen. Probeer het opnieuw, of gebruik later Wachtwoord vergeten.')
      return
    }

    setSuccess('Wachtwoord opgeslagen. Loep opent je overzicht.')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#0D1B2A]">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl tracking-[-0.03em] text-[#0D1B2A]">
            Loep <span className="text-[#E8A020]">&bull;</span>
          </Link>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#4A6070]">
            Scherper zien wat telt
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div className="rounded-[22px] border border-[#0D1B2A]/15 bg-white p-8">
            {checking ? (
              <div className="text-center">
                <h1 className="mb-2 text-lg font-semibold">Activatielink controleren</h1>
                <p className="text-sm text-[#4A6070]">Even geduld. Loep controleert je link.</p>
              </div>
            ) : (
              <>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#B07A10]">Welkom bij Loep</p>
                <h1 className="mt-2 font-serif text-[2rem] leading-[1.05] tracking-[-0.03em]">Kies een wachtwoord</h1>
                <p className="mb-6 mt-3 text-sm leading-6 text-[#4A6070]">
                  Je bent ingelogd via de activatiemail voor {email ?? 'jouw account'}. Kies nu een wachtwoord,
                  dan kun je later gewoon via de inlogpagina terugkomen.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium">
                      Nieuw wachtwoord
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="password2" className="mb-1 block text-sm font-medium">
                      Herhaal het wachtwoord
                    </label>
                    <input
                      id="password2"
                      type="password"
                      required
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Minimaal 8 tekens"
                      className={inputClass}
                    />
                  </div>

                  {error ? (
                    <div role="alert" className="rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-2 text-sm text-[#8E2A1F]">
                      {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div role="status" className="rounded-lg border border-[#3C8D8A]/30 bg-[#3C8D8A]/10 px-3 py-2 text-sm text-[#2A6663]">
                      {success}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#0D1B2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Opslaan...' : 'Wachtwoord instellen'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="mt-3 w-full rounded-lg border border-[#0D1B2A]/20 px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] hover:bg-[#F4F1EA]"
                >
                  Later, ga naar mijn overzicht
                </button>

                <p className="mt-4 text-xs text-[#4A6070]">
                  Liever later? Via{' '}
                  <Link href="/forgot-password" className="font-semibold text-[#0D1B2A] underline underline-offset-4">
                    Wachtwoord vergeten
                  </Link>{' '}
                  stel je altijd alsnog een wachtwoord in.
                </p>
              </>
            )}
          </div>

          <aside className="rounded-[22px] bg-[#0D1B2A] p-8 text-white">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#E8A020]">Wat je hierna doet</p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Loep heeft je organisatie en je eerste meting al aangemaakt. Daarna richt je in drie stappen je eerste
              meting in:
            </p>
            <ol className="mt-4 space-y-3">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8A020] text-xs font-bold text-[#0D1B2A]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs leading-5 text-white/60">
              Je verstuurt de uitnodiging zelf vanuit je eigen mail; Loep slaat geen mailadressen van je medewerkers op.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
