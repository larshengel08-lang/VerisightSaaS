'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  orgId: string
  orgName: string
  isActive: boolean
}

export function ArchiveOrgButton({ orgId, orgName, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggleArchive() {
    const actionLabel = isActive ? 'archiveren' : 'heractiveren'
    const confirmation = isActive
      ? `Weet je zeker dat je ${orgName} wilt archiveren?\n\nDe organisatie blijft bestaan, maar verschijnt niet meer als actieve keuze in de setup. Bestaande campagnes en resultaten blijven behouden.`
      : `Weet je zeker dat je ${orgName} weer actief wilt maken?\n\nDaarna kun je deze organisatie weer gebruiken voor nieuwe campagnes en uitnodigingen.`

    if (!window.confirm(confirmation)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.detail ?? `Organisatie ${actionLabel} mislukt.`)
        setLoading(false)
        return
      }

      router.refresh()
    } catch {
      setError(`Verbindingsfout tijdens ${actionLabel}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggleArchive}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Bezig...' : isActive ? 'Archiveren' : 'Heractiveren'}
      </button>
      {error && <p className="max-w-52 text-right text-xs text-red-600">{error}</p>}
    </div>
  )
}
