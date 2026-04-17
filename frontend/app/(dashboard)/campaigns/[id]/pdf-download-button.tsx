'use client'

import { useState } from 'react'

interface Props {
  campaignId: string
  campaignName: string
  scanType?: string
}

const UNSUPPORTED_REPORT_MESSAGES: Record<string, string> = {
  pulse: 'Pulse ondersteunt in deze fase nog geen formeel PDF-rapport. Gebruik voorlopig de dashboardread als managementoutput.',
}

export function PdfDownloadButton({ campaignId, campaignName, scanType }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    const unsupportedMessage = scanType ? UNSUPPORTED_REPORT_MESSAGES[scanType] : undefined
    if (unsupportedMessage) {
      setError(unsupportedMessage)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/report`)
      if (!response.ok) {
        let detail = `Rapport kon niet worden gegenereerd (${response.status}). Probeer het opnieuw.`
        try {
          const payload = (await response.json()) as { detail?: string }
          if (typeof payload.detail === 'string' && payload.detail.trim()) {
            detail = payload.detail
          }
        } catch {
          // Keep the generic fallback when no JSON detail is available.
        }
        setError(detail)
        setLoading(false)
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `Verisight_${campaignName.replace(/ /g, '_')}.pdf`
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError('Verbindingsfout. Controleer of de backend bereikbaar is.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Rapport genereren...' : 'PDF-rapport'}
      </button>
      {error ? <p className="max-w-48 text-xs text-red-600 sm:text-right">{error}</p> : null}
    </div>
  )
}
