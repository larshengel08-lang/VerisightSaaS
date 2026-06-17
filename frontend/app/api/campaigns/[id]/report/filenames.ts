import { type ScanType } from '@/lib/types'

import type { ReportDownloadFormat } from './permissions'

// Technische, stabiele bestandsnaam-prefix per scantype. Bewust losgekoppeld van
// SCAN_TYPE_LABELS (de klantgerichte displaynaam): displaynamen mogen wijzigen
// zonder downloadbestandsnamen en hun tests te breken.
const SCAN_TYPE_FILE_PREFIX: Record<ScanType, string> = {
  exit: 'ExitScan',
  retention: 'RetentieScan',
  pulse: 'Pulse',
  team: 'TeamScan',
  onboarding: 'Onboarding 30-60-90',
  leadership: 'Leadership Scan',
  culture_assessment: 'Loep Culture Assessment',
}

export function buildFallbackReportFilename(
  scanType: ScanType,
  campaignName: string,
  format: ReportDownloadFormat = 'pdf',
) {
  const label = sanitizeFilenameSegment(SCAN_TYPE_FILE_PREFIX[scanType] ?? 'Verisight')
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
