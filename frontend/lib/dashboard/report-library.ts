import { isDashboardReleaseReady } from '@/lib/response-activation'
import { SCAN_TYPE_LABELS, type CampaignStats, type ScanType } from '@/lib/types'

// ─── HR Report Download Rows ──────────────────────────────────────────────────
// Gebruikt door reports/page.tsx en dashboard/cockpit-index.ts.
// Type is structureel compatibel met ReportDownloadRow in report-download-index.ts.

export type HrReportDownloadRow = {
  campaignId: string
  campaignName: string
  scanType: ScanType
  scanName: string
  periodLabel: string
  createdAt: string
  responseBasis: string
  status: string
  isAvailable: boolean
  extraDisambiguator?: string | null
}

export function buildHrReportDownloadRows(campaigns: CampaignStats[]): {
  availableRows: HrReportDownloadRow[]
  unavailableRows: HrReportDownloadRow[]
} {
  const rows: HrReportDownloadRow[] = campaigns
    // culture_assessment heeft een eigen rapportpad en hoort niet in de
    // HR-report-download (consistent met render_report_html dat culture uitsluit).
    .filter((campaign) => campaign.scan_type !== 'culture_assessment')
    .map((campaign) => {
      const isAvailable = isDashboardReleaseReady(campaign.total_completed, {
        scanType: campaign.scan_type,
        isActive: campaign.is_active,
      })
      const date = new Date(campaign.created_at)
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1
      const periodLabel = `Q${quarter} ${date.getUTCFullYear()}`

      return {
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        scanType: campaign.scan_type,
        scanName: SCAN_TYPE_LABELS[campaign.scan_type],
        periodLabel,
        createdAt: campaign.created_at,
        responseBasis: `${campaign.total_completed} / ${campaign.total_invited ?? '—'}`,
        status: isAvailable ? 'Beschikbaar' : 'Nog onvoldoende respons',
        isAvailable,
        extraDisambiguator: null,
      }
    })
    // Nieuwste campagnes eerst.
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    availableRows: rows.filter((row) => row.isAvailable),
    unavailableRows: rows.filter((row) => !row.isAvailable),
  }
}
