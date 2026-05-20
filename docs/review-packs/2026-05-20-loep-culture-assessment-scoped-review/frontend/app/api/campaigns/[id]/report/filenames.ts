import { SCAN_TYPE_LABELS, type ScanType } from '@/lib/types'

import type { ReportDownloadFormat } from './permissions'

export function buildFallbackReportFilename(
  scanType: ScanType,
  campaignName: string,
  format: ReportDownloadFormat = 'pdf',
) {
  const label = sanitizeFilenameSegment(SCAN_TYPE_LABELS[scanType] ?? 'Verisight')
  const campaignSegment = sanitizeFilenameSegment(campaignName || 'campaign')
  const extension = format === 'segment_summary' ? 'csv' : 'pdf'
  return `${label}_${campaignSegment}.${extension}`
}

function sanitizeFilenameSegment(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || 'campaign'
}
