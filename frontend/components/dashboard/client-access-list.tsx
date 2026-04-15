'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { OrgInvite } from '@/lib/types'

interface Props {
  invites: OrgInvite[]
}

const RESEND_COOLDOWN_MINUTES = 10

export function ClientAccessList({ invites }: Props) {
  const router = useRouter()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function getRemainingCooldownMinutes(invitedAt: string) {
    const cooldownMs = RESEND_COOLDOWN_MINUTES * 60 * 1000
    const sentAt = new Date(invitedAt).getTime()
    const elapsedMs = Date.now() - sentAt
    if (elapsedMs >= cooldownMs) {
      return 0
    }
    return Math.max(1, Math.ceil((cooldownMs - elapsedMs) / (60 * 1000)))
  }

  async function handleResend(invite: OrgInvite) {
    setBusyKey(invite.id)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/org-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend',
          orgId: invite.org_id,
          email: invite.email,
          fullName: invite.full_name,
          role: invite.role,
        }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? 'Opnieuw uitnodigen mislukt.')
        setBusyKey(null)
        return
      }

      setMessage(json.message ?? 'Activatiemail opnieuw verstuurd.')
      router.refresh()
    } catch {
      setError('Verbindingsfout tijdens opnieuw uitnodigen.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-3">
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {invites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Er zijn nog geen klantaccounts of uitnodigingen voor deze organisaties.
        </div>
      ) : (
        invites.map(invite => {
          const isActive = Boolean(invite.accepted_at)
          const cooldownMinutes = !isActive ? getRemainingCooldownMinutes(invite.invited_at) : 0
          const resendBlocked = cooldownMinutes > 0
          const statusLabel = isActive ? 'Actieve dashboardtoegang' : 'Wacht op accountactivatie'
          const statusCls = isActive
            ? 'bg-green-50 text-green-700 border-green-100'
            : 'bg-amber-50 text-amber-700 border-amber-100'

          return (
            <div key={invite.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {invite.full_name?.trim() || invite.email}
                    </p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusCls}`}>
                      {statusLabel}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {invite.role === 'member' ? 'Member' : 'Viewer'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{invite.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {invite.organizations?.name ?? 'Organisatie onbekend'} · Laatste update{' '}
                    {new Date(invite.accepted_at ?? invite.invited_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {isActive
                      ? 'Dashboardtoegang is actief. Volgende stap: bevestig het eerste dashboard- of rapportgebruik.'
                      : 'Activatie loopt nog. Bevestig de activatiemail en plan daarna het eerste klantcontact rond dashboardtoegang.'}
                  </p>
                  {!isActive && resendBlocked && (
                    <p className="mt-1 text-xs text-amber-700">
                      Activatiemail recent verstuurd. Opnieuw uitnodigen kan over ongeveer {cooldownMinutes} minuut{cooldownMinutes === 1 ? '' : 'en'}.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      disabled={busyKey === invite.id || resendBlocked}
                      onClick={() => handleResend(invite)}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {busyKey === invite.id ? 'Bezig...' : resendBlocked ? 'Even wachten' : 'Opnieuw uitnodigen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
