import type { ScanType } from '@/lib/types'

export const FIRST_DASHBOARD_THRESHOLD = 5
export const FIRST_INSIGHT_THRESHOLD = 10
export const CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD = 30
export const CULTURE_ASSESSMENT_INSIGHT_THRESHOLD = 30

export type ResponseActivationStage =
  | 'collecting_responses'
  | 'dashboard_active'
  | 'insights_active'

export interface ResponseActivationState {
  stage: ResponseActivationStage
  readinessLabel: string
  dashboardVisible: boolean
  reportVisible: boolean
  deeperInsightsVisible: boolean
  remainingToDashboard: number
  remainingToInsights: number
  statusDetail: string
  heroActionLabel: string
}

export interface ResponseActivationThresholds {
  dashboardMin: number
  insightMin: number
  releaseOnCampaignClose: boolean
}

export interface ResponseActivationOptions {
  scanType?: ScanType
  isActive?: boolean
}

function formatResponseCount(count: number) {
  return `${count} response${count === 1 ? '' : 's'}`
}

export function getResponseActivationThresholds(scanType?: ScanType): ResponseActivationThresholds {
  if (scanType === 'culture_assessment') {
    return {
      dashboardMin: CULTURE_ASSESSMENT_DASHBOARD_THRESHOLD,
      insightMin: CULTURE_ASSESSMENT_INSIGHT_THRESHOLD,
      releaseOnCampaignClose: true,
    }
  }

  return {
    dashboardMin: FIRST_DASHBOARD_THRESHOLD,
    insightMin: FIRST_INSIGHT_THRESHOLD,
    releaseOnCampaignClose: false,
  }
}

export function isDashboardReleaseReady(totalCompleted: number, options: ResponseActivationOptions = {}) {
  const completed = Number.isFinite(totalCompleted) ? Math.max(0, Math.floor(totalCompleted)) : 0
  const thresholds = getResponseActivationThresholds(options.scanType)
  const isActive = options.isActive ?? true

  if (completed < thresholds.dashboardMin) return false
  if (thresholds.releaseOnCampaignClose && isActive) return false
  return true
}

export function isInsightReleaseReady(totalCompleted: number, options: ResponseActivationOptions = {}) {
  const completed = Number.isFinite(totalCompleted) ? Math.max(0, Math.floor(totalCompleted)) : 0
  const thresholds = getResponseActivationThresholds(options.scanType)
  const isActive = options.isActive ?? true

  if (completed < thresholds.insightMin) return false
  if (thresholds.releaseOnCampaignClose && isActive) return false
  return true
}

export function buildResponseActivationState(
  totalCompleted: number,
  options: ResponseActivationOptions = {},
): ResponseActivationState {
  const completed = Number.isFinite(totalCompleted) ? Math.max(0, Math.floor(totalCompleted)) : 0
  const thresholds = getResponseActivationThresholds(options.scanType)
  const isActive = options.isActive ?? true
  const remainingToDashboard = Math.max(0, thresholds.dashboardMin - completed)
  const remainingToInsights = Math.max(0, thresholds.insightMin - completed)

  if (completed < thresholds.dashboardMin) {
    return {
      stage: 'collecting_responses',
      readinessLabel: 'Nog in opbouw',
      dashboardVisible: false,
      reportVisible: false,
      deeperInsightsVisible: false,
      remainingToDashboard,
      remainingToInsights,
      statusDetail:
        remainingToDashboard === 1
          ? 'Nog 1 response tot de eerste dashboardread. Tot die drempel is gehaald blijven dashboard en rapport bewust gesloten.'
          : `Nog ${formatResponseCount(remainingToDashboard)} tot de eerste dashboardread. Tot die drempel is gehaald blijven dashboard en rapport bewust gesloten.`,
      heroActionLabel:
        remainingToDashboard === 1
          ? 'Nog 1 response tot dashboardread'
          : `Nog ${formatResponseCount(remainingToDashboard)} tot dashboardread`,
    }
  }

  if (thresholds.releaseOnCampaignClose && isActive) {
    return {
      stage: 'collecting_responses',
      readinessLabel: 'Baseline loopt nog',
      dashboardVisible: false,
      reportVisible: false,
      deeperInsightsVisible: false,
      remainingToDashboard,
      remainingToInsights,
      statusDetail:
        'De responsbasis is sterk genoeg voor Loep Culture Assessment, maar resultaten blijven bewust dicht tot de baseline formeel is gesloten. Sluit eerst de jaarlijkse meting om executive read, board-output en governed vervolg vrij te geven.',
      heroActionLabel: 'Sluit baseline voor resultaatvrijgave',
    }
  }

  if (completed < thresholds.insightMin) {
    return {
      stage: 'dashboard_active',
      readinessLabel: 'Indicatief beeld',
      dashboardVisible: true,
      reportVisible: true,
      deeperInsightsVisible: false,
      remainingToDashboard,
      remainingToInsights,
      statusDetail:
        remainingToInsights === 1
          ? 'Dashboard en rapport zijn nu zichtbaar. Nog 1 response tot eerste patroonduiding; gebruik deze fase om first management use te plannen en de eerste eigenaar alvast scherp te zetten.'
          : `Dashboard en rapport zijn nu zichtbaar. Nog ${formatResponseCount(remainingToInsights)} tot eerste patroonduiding; gebruik deze fase om first management use te plannen en de eerste eigenaar alvast scherp te zetten.`,
      heroActionLabel:
        remainingToInsights === 1
          ? 'Nog 1 response tot eerste inzichten'
          : `Nog ${formatResponseCount(remainingToInsights)} tot eerste inzichten`,
    }
  }

  return {
    stage: 'insights_active',
    readinessLabel: 'Eerste patroonduiding beschikbaar',
    dashboardVisible: true,
    reportVisible: true,
    deeperInsightsVisible: true,
    remainingToDashboard,
    remainingToInsights,
    statusDetail:
      'De campagne heeft nu genoeg respons voor veilige dashboardactivatie, rapportvrijgave en eerste patroonduiding. Gebruik dit moment om first management use te houden en eigenaar, reviewmoment en follow-up expliciet vast te leggen.',
    heroActionLabel: 'Eerste inzichten actief',
  }
}
