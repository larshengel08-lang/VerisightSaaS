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

  async function handleDelete() {
    const warning = campaignCount > 0
      ? `Weet je zeker dat je ${orgName} wilt verwijderen? Dit verwijdert ook ${campaignCount} campaign(s), alle respondenten, uitnodigingen en dashboardtoegang.`
      : `Weet je zeker dat je ${orgName} wilt verwijderen?`

    if (!window.confirm(warning)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${orgId}`, { method: 'DELETE' })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? 'Organisatie verwijderen mislukt.')
        setLoading(false)
        return
      }

      router.refresh()
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
      {error && <p className="max-w-52 text-right text-xs text-red-600">{error}</p>}
    </div>
  )
}
