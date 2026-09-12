'use client'

import { useState } from 'react'
import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'

interface Props {
  campaignId: string
  campaignName: string
  scanType?: string
  showSegmentSummaryExport?: boolean
  /** Tekst op de primaire knop. Standaard "Rapport downloaden". */
  label?: string
  /** 'end' lijnt knop en foutmelding rechts uit in een tabelrij. */
  align?: 'start' | 'end'
}

const UNSUPPORTED_REPORT_MESSAGES: Record<string, string> = {}

type DownloadFormat = 'pdf' | 'segment_summary'

export function PdfDownloadButton({
  campaignId,
  campaignName,
  scanType,
  showSegmentSummaryExport = false,
  label,
  align = 'start',
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
        setLoadingFormat(null)
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

  const primaryLabel = label ?? 'Rapport downloaden'
  const columnAlign = align === 'end' ? 'items-start sm:items-end' : 'items-start'
  const rowAlign = align === 'end' ? 'sm:justify-end' : ''

  return (
    <div className={`flex flex-col gap-1 ${columnAlign}`}>
      <div className={`flex flex-wrap items-center gap-2 ${rowAlign}`}>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={loadingFormat !== null}
          className="inline-flex rounded-lg bg-[color:var(--dashboard-ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1B2E45] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingFormat === 'pdf' ? 'Rapport ophalen...' : primaryLabel}
        </button>
        {showSegmentSummaryExport ? (
          <button
            onClick={() => handleDownload('segment_summary')}
            disabled={loadingFormat !== null}
            className="inline-flex rounded-lg border border-[color:var(--dashboard-frame-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--dashboard-ink)] transition-colors hover:bg-[color:var(--dashboard-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingFormat === 'segment_summary' ? 'Export ophalen...' : 'Segmentexport downloaden'}
          </button>
        ) : null}
      </div>
      {error ? <p className="max-w-xs text-xs text-red-600">{error}</p> : null}
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
