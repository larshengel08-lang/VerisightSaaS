import { getResponseActivationThresholds, isDashboardReleaseReady } from '@/lib/response-activation'
import { SCAN_TYPE_LABELS, type CampaignStats, type ScanType } from '@/lib/types'
import {
  CAMPAIGN_STATUS_LABELS,
  denominatorFor,
  deriveCampaignStatusFor,
  type CampaignStatusContext,
  type CampaignStatusKey,
} from '@/lib/dashboard/campaign-status'
import { formatResponseBasis } from '@/lib/dashboard/invited-denominator'

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
  /** Alleen gezet door buildReportOverviewRows; de legacy buildHrReportDownloadRows kent de vocabulaire niet. */
  statusKey?: CampaignStatusKey
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
        responseBasis: `${campaign.total_completed} / ${campaign.total_invited ?? 'n.b.'}`,
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
// Gebruikt door reports/page.tsx (spec 2026-09-11 par. 4.3, 2026-09-16 par. 6.2).
// De oudere buildHrReportDownloadRows hierboven blijft ongemoeid: die hangt aan
// de dashboarddrempel en wordt alleen nog door dashboard/cockpit-index.ts gelezen.

/**
 * Een rapport bestaat pas als de meting gesloten is én de rapportdrempel is
 * gehaald; dat is precies de status 'report_ready' uit de gedeelde
 * vocabulaire. De noemer komt uit het delivery record (invited_count), nooit
 * uit campaign_stats.total_invited alleen (= gestarte respondenten, wat bij
 * self_send "18 van 18" opleverde terwijl er 30 waren uitgenodigd).
 */
export function buildReportOverviewRows(
  campaigns: CampaignStats[],
  context: CampaignStatusContext,
): HrReportDownloadRow[] {
  return campaigns
    .filter((campaign) => campaign.scan_type !== 'culture_assessment')
    .map((campaign) => {
      const thresholds = getResponseActivationThresholds(campaign.scan_type)
      const statusKey = deriveCampaignStatusFor(campaign, context)
      const isAvailable = statusKey === 'report_ready'
      // Dezelfde helper als de status gebruikt: tekst en status delen één noemer.
      const denominator = denominatorFor(campaign, context)
      const date = new Date(campaign.created_at)
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1

      // Gesloten zonder rapport houdt de uitleg met aantal en drempel: dat is
      // wat de klant hier wil weten. De andere vier gebruiken het gedeelde label.
      const status =
        statusKey === 'closed_no_report'
          ? `Gesloten met ${campaign.total_completed} ingevuld. Minimaal ${thresholds.insightMin} nodig voor een rapport.`
          : CAMPAIGN_STATUS_LABELS[statusKey]

      return {
        campaignId: campaign.campaign_id,
        campaignName: campaign.campaign_name,
        scanType: campaign.scan_type,
        scanName: SCAN_TYPE_LABELS[campaign.scan_type],
        periodLabel: `Q${quarter} ${date.getUTCFullYear()}`,
        createdAt: campaign.created_at,
        responseBasis: formatResponseBasis(campaign.total_completed, denominator),
        status,
        statusKey,
        isAvailable,
        extraDisambiguator: null,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
