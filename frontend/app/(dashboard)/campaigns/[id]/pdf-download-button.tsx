'use client'

import { useState } from 'react'

interface Props {
  campaignId: string
  campaignName: string
}

export function PdfDownloadButton({ campaignId, campaignName }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)

    try {
      const url = `/api/campaigns/${campaignId}/report`
      const resp = await fetch(url)

      if (!resp.ok) {
        setError(`Rapport kon niet worden gegenereerd (${resp.status}). Probeer het opnieuw.`)
        setLoading(false)
        return
      }

      const blob = await resp.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `Verisight_${campaignName.replace(/ /g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError('Verbindingsfout — controleer of de backend bereikbaar is.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
      >
        {loading ? (
          <>
            <span className="animate-spin text-xs">⟳</span>
            Rapport genereren…
          </>
        ) : (
          <>⬇ PDF-rapport</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-48 text-right">{error}</p>
      )}
    </div>
  )
}
