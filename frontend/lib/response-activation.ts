export const FIRST_DASHBOARD_THRESHOLD = 5
export const FIRST_INSIGHT_THRESHOLD = 10

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

function formatResponseCount(count: number) {
  return `${count} response${count === 1 ? '' : 's'}`
}

export function buildResponseActivationState(totalCompleted: number): ResponseActivationState {
  const completed = Number.isFinite(totalCompleted) ? Math.max(0, Math.floor(totalCompleted)) : 0
  const remainingToDashboard = Math.max(0, FIRST_DASHBOARD_THRESHOLD - completed)
  const remainingToInsights = Math.max(0, FIRST_INSIGHT_THRESHOLD - completed)

  if (completed < FIRST_DASHBOARD_THRESHOLD) {
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

  if (completed < FIRST_INSIGHT_THRESHOLD) {
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
          ? 'Dashboard en rapport zijn nu zichtbaar. Nog 1 response tot eerste patroonduiding; tot die tijd blijft de read bewust compact.'
          : `Dashboard en rapport zijn nu zichtbaar. Nog ${formatResponseCount(remainingToInsights)} tot eerste patroonduiding; tot die tijd blijft de read bewust compact.`,
      heroActionLabel:
        remainingToInsights === 1
          ? 'Nog 1 response tot eerste inzichten'
          : `Nog ${formatResponseCount(remainingToInsights)} tot eerste inzichten`,
    }
  }

  return {
    stage: 'insights_active',
    readinessLabel: 'Beslisniveau bereikt',
    dashboardVisible: true,
    reportVisible: true,
    deeperInsightsVisible: true,
    remainingToDashboard,
    remainingToInsights,
    statusDetail:
      'De campagne heeft nu genoeg respons voor veilige dashboardactivatie, rapportvrijgave en eerste patroonduiding.',
    heroActionLabel: 'Eerste inzichten actief',
  }
}
