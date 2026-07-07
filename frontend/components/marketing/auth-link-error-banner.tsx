'use client'

import { useEffect, useState } from 'react'
import { parseAuthLinkError, type AuthLinkError } from '@/lib/auth-link-error'

// Vangt Supabase's #error=access_denied&error_code=otp_expired-redirect op
// (verlopen/al-gebruikte activatielink) — die kan op elke pagina landen,
// zie lib/auth-link-error.ts. Zonder dit ziet de gebruiker alleen de kale
// technische foutmelding in de adresbalk, zonder uitleg of vervolgstap.
export function AuthLinkErrorBanner() {
  const [error, setError] = useState<AuthLinkError | null>(null)

  useEffect(() => {
    const parsed = parseAuthLinkError(window.location.hash)
    if (parsed) {
      setError(parsed)
      // Hash opschonen zodat een refresh of gedeelde link de fout niet herhaalt.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  if (!error) return null

  return (
    <div
      role="alert"
      style={{
        background: 'var(--navy, #0D1B2A)',
        color: '#F4F1EA',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontSize: 13.5,
        flexWrap: 'wrap',
        textAlign: 'center',
      }}
    >
      <span>
        <strong>{error.title}.</strong> {error.message}
      </span>
      <button
        type="button"
        onClick={() => setError(null)}
        aria-label="Sluiten"
        style={{
          background: 'transparent',
          border: '1px solid rgba(244,241,234,0.4)',
          color: 'inherit',
          borderRadius: 4,
          padding: '2px 10px',
          fontSize: 12,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Sluiten
      </button>
    </div>
  )
}
