import {
  getResponseActivationThresholds,
  isDashboardReleaseReady,
  isReportReleaseReady,
} from '@/lib/response-activation'
import { SCAN_TYPE_LABELS, type CampaignStats, type ScanType } from '@/lib/types'

// ─── HR Report Download Rows ──────────────────────────────────────────────────
// Sinds reports/page.tsx op buildReportOverviewRows draait (spec 2026-09-11
// par. 4.3) leest alleen dashboard/cockpit-index.ts dit nog, en dat bestand
// wordt zelf nergens meer geïmporteerd behalve door zijn eigen test. Deze
// keten staat dus op de nominatie om via verify-before-delete te verdwijnen;
// dat is een los traject, niet dit plan.
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

// ─── Rapportenoverzicht ───────────────────────────────────────────────────────
// Gebruikt door reports/page.tsx (spec 2026-09-11 par. 4.3). De oudere
// buildHrReportDownloadRows hierboven blijft ongemoeid: die hangt aan de
// dashboarddrempel en wordt alleen nog door dashboard/cockpit-index.ts gelezen.

/**
 * Een rapport bestaat pas als de meting gesloten is én de rapportdrempel is
 * gehaald. Een lopende meting is dus nooit "beschikbaar", ook niet met veel
 * respons. Bij self_send maakt het platform geen respondenten vooraf aan, dus
 * staat total_invited in campaign_stats op 0; dan tonen we alleen het aantal
 * ingevulde vragenlijsten in plaats van een onjuiste noemer.
 */
export function buildReportOverviewRows(campaigns: CampaignStats[]): HrReportDownloadRow[] {
  return campaigns
    .filter((campaign) => campaign.scan_type !== 'culture_assessment')
    .map((campaign) => {
      const thresholds = getResponseActivationThresholds(campaign.scan_type)
      const isAvailable =
        !campaign.is_active &&
        isReportReleaseReady(campaign.total_completed, { scanType: campaign.scan_type })
      const date = new Date(campaign.created_at)
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1
      const invited = campaign.total_invited ?? 0

      let status: string
      if (isAvailable) {
        status = 'Beschikbaar nu'
      } else if (campaign.is_active) {
        status = 'Meting loopt'
      } else {
        status = `Gesloten met ${campaign.total_completed} ingevuld. Minimaal ${thresholds.insightMin} nodig voor een rapport.`
      }

      return {
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        scanType: campaign.scan_type,
        scanName: SCAN_TYPE_LABELS[campaign.scan_type],
        periodLabel: `Q${quarter} ${date.getUTCFullYear()}`,
        createdAt: campaign.created_at,
        responseBasis:
          invited > 0
            ? `${campaign.total_completed} van ${invited} ingevuld`
            : `${campaign.total_completed} ingevuld`,
        status,
        isAvailable,
        extraDisambiguator: null,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
