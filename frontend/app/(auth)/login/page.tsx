'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LOEP_CONTACT_EMAIL } from '@/lib/loep-contact'
import { inviteLinkNoticeFromSearch } from '@/lib/invite-link-notice'

const inputClass =
  'w-full rounded-lg border border-[#0D1B2A]/20 bg-white px-3 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/40 focus:border-[#E8A020] focus:outline-none focus:ring-2 focus:ring-[#E8A020]/40'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [linkNotice, setLinkNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // complete-account stuurt hierheen met ?error=invite als de activatielink
  // niet meer geldig is (zie lib/invite-link-notice). window.location in
  // plaats van useSearchParams: die laatste vraagt een Suspense-grens in de
  // App Router. Na het lezen halen we de parameter uit de URL, zodat een
  // refresh de melding niet opnieuw toont.
  useEffect(() => {
    const notice = inviteLinkNoticeFromSearch(window.location.search)
    if (notice) {
      setLinkNotice(notice)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Dit e-mailadres en wachtwoord horen niet bij elkaar. Probeer het opnieuw.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#0D1B2A]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl tracking-[-0.03em] text-[#0D1B2A]">
            Loep <span className="text-[#E8A020]">&bull;</span>
          </Link>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#4A6070]">
            Scherper zien wat telt
          </p>
        </div>

        <div className="rounded-[22px] border border-[#0D1B2A]/15 bg-white p-8">
          <h1 className="mb-6 font-serif text-[1.75rem] leading-[1.05] tracking-[-0.03em]">Log in bij Loep</h1>

          {linkNotice ? (
            <div role="status" className="mb-4 rounded-lg border border-[#E8A020]/50 bg-[#E8A020]/15 px-3 py-2 text-sm text-[#7A5410]">
              {linkNotice}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@organisatie.nl"
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Wachtwoord
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-[#0D1B2A] underline underline-offset-4">
                  Wachtwoord vergeten?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Je wachtwoord"
                className={inputClass}
              />
            </div>

            {error ? (
              <div role="alert" className="rounded-lg border border-[#C0392B]/30 bg-[#C0392B]/10 px-3 py-2 text-sm text-[#8E2A1F]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0D1B2A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Bezig met inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[#4A6070]">
          Nog geen toegang, of moet je organisatie nog worden ingericht?{' '}
          <a href={`mailto:${LOEP_CONTACT_EMAIL}`} className="font-semibold text-[#0D1B2A] underline underline-offset-4">
            Mail {LOEP_CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  )
}
