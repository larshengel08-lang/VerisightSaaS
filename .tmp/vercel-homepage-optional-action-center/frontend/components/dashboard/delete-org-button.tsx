'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  orgId: string
  orgName: string
  campaignCount: number
}

export function DeleteOrgButton({ orgId, orgName, campaignCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleDelete() {
    const warning = campaignCount > 0
      ? `Weet je zeker dat je ${orgName} wilt verwijderen?\n\nDit verwijdert ook ${campaignCount} campaign(s), alle respondenten, uitnodigingen en dashboardtoegang.\n\nDeze actie kan niet ongedaan worden gemaakt.`
      : `Weet je zeker dat je ${orgName} wilt verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.`

    if (!window.confirm(warning)) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/organizations/${orgId}`, { method: 'DELETE' })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? 'Organisatie verwijderen mislukt.')
        setLoading(false)
        return
      }

      setSuccess(json.message ?? `Organisatie ${orgName} is verwijderd.`)
      setTimeout(() => {
        router.refresh()
      }, 900)
    } catch {
      setError('Verbindingsfout tijdens verwijderen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? 'Verwijderen...' : 'Verwijderen'}
      </button>
      {success && <p className="max-w-64 text-right text-xs text-emerald-700">{success}</p>}
      {error && <p className="max-w-52 text-right text-xs text-red-600">{error}</p>}
    </div>
  )
}
