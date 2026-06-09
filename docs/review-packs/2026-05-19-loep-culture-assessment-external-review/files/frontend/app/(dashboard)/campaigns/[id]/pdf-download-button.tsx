'use client'

import { useState } from 'react'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'

interface Props {
  campaignId: string
  campaignName: string
  scanType?: string
  showSegmentSummaryExport?: boolean
}

const UNSUPPORTED_REPORT_MESSAGES: Record<string, string> = {}

type DownloadFormat = 'pdf' | 'segment_summary'

export function PdfDownloadButton({
  campaignId,
  campaignName,
  scanType,
  showSegmentSummaryExport = false,
}: Props) {
  const [loadingFormat, setLoadingFormat] = useState<DownloadFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(format: DownloadFormat) {
    const unsupportedMessage = scanType ? UNSUPPORTED_REPORT_MESSAGES[scanType] : undefined
    if (unsupportedMessage) {
      setError(unsupportedMessage)
      return
    }

    setLoadingFormat(format)
    setError(null)

    try {
      const url = format === 'segment_summary'
        ? `/api/campaigns/${campaignId}/report?format=segment_summary`
        : `/api/campaigns/${campaignId}/report`
      const response = await fetch(url)
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
      link.download =
        extractFilenameFromDisposition(response.headers.get('content-disposition')) ??
        buildFallbackDownloadFilename(scanType, campaignName, format)
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError('Verbindingsfout. Controleer of de backend bereikbaar is.')
    } finally {
      setLoadingFormat(null)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          onClick={() => handleDownload('pdf')}
          disabled={loadingFormat !== null}
          className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingFormat === 'pdf' ? 'Rapport ophalen...' : 'Rapport downloaden'}
        </button>
        {showSegmentSummaryExport ? (
          <button
            onClick={() => handleDownload('segment_summary')}
            disabled={loadingFormat !== null}
            className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingFormat === 'segment_summary' ? 'Export ophalen...' : 'Segmentexport downloaden'}
          </button>
        ) : null}
      </div>
      {error ? <p className="max-w-48 text-xs text-red-600 sm:text-right">{error}</p> : null}
    </div>
  )
}

function extractFilenameFromDisposition(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? null
}

function buildFallbackDownloadFilename(
  scanType: string | undefined,
  campaignName: string,
  format: DownloadFormat,
) {
  const routeLabel = scanType && scanType in SCAN_TYPE_LABELS
    ? SCAN_TYPE_LABELS[scanType as ScanType]
    : 'Loep'
  const scanLabel = sanitizeFilenameSegment(routeLabel)
  const campaignSegment = sanitizeFilenameSegment(campaignName)
  const extension = format === 'segment_summary' ? 'csv' : 'pdf'
  return `${scanLabel}_${campaignSegment}.${extension}`
}

function sanitizeFilenameSegment(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || 'campaign'
}
