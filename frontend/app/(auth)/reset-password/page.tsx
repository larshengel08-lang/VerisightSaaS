'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [ready,     setReady]     = useState(false)
  const router  = useRouter()

  // Supabase verwerkt de reset-token via de URL-hash zodra de client laadt
  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
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
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Er is iets misgegaan. Probeer opnieuw of vraag een nieuwe herstelLink aan.')
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Verisight
          </Link>
          <p className="mt-2 text-sm text-gray-500">Nieuw wachtwoord instellen</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ✅
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Wachtwoord opgeslagen</h1>
              <p className="text-sm text-gray-500">Je wordt doorgestuurd naar het dashboard…</p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⏳
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Link verifiëren…</h1>
              <p className="text-sm text-gray-500 mb-4">
                Jouw herstelLink wordt geverifieerd. Even geduld.
              </p>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Nieuwe herstelLink aanvragen
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-6">Nieuw wachtwoord</h1>
              <form onSubmit={handleReset} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Opslaan…' : 'Wachtwoord opslaan'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
