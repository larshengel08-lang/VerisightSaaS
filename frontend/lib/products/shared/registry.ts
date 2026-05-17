import type { ScanType } from '@/lib/types'
import { leadershipProductModule } from '@/lib/products/leadership'
import type { ProductModule } from '@/lib/products/shared/types'
import { exitProductModule } from '@/lib/products/exit'
import { onboardingProductModule } from '@/lib/products/onboarding'
import { pulseProductModule } from '@/lib/products/pulse'
import { retentionProductModule } from '@/lib/products/retention'
import { teamProductModule } from '@/lib/products/team'
import type { ActionPlaybook, DashboardViewModel } from '@/lib/products/shared/types'

const CULTURE_ASSESSMENT_PLACEHOLDER_COPY = {
  title: 'In opbouw',
  body: 'Loep Culture Assessment is als route geregistreerd, maar de executive productmodule is nog niet beschikbaar.',
} as const

function buildCultureAssessmentPlaceholderViewModel(): DashboardViewModel {
  return {
    signaalbandenText:
      'Loep Culture Assessment is in opbouw. Gebruik deze placeholder alleen als veilige route-indicator totdat de dedicated executive module beschikbaar is.',
    topSummaryCards: [
      {
        title: 'Routestatus',
        value: 'In opbouw',
        body: 'De gedeelde routecontracten zijn aangesloten, maar resultaten en executive duiding volgen in een latere taak.',
        tone: 'amber',
      },
    ],
    managementBlocks: [
      {
        title: 'Nog niet beschikbaar',
        intro: 'Deze placeholder voorkomt crashes in gedeelde pagina’s en markeert dat de echte productlogica nog ontbreekt.',
        items: [
          'Geen dashboardduiding of rangorde uit deze placeholder lezen.',
          'Wacht op de dedicated culture-assessment module voor thresholds, focusvragen en playbooks.',
        ],
        tone: 'amber',
      },
    ],
    profileCards: [],
    primaryQuestion: {
      title: CULTURE_ASSESSMENT_PLACEHOLDER_COPY.title,
      body: `${CULTURE_ASSESSMENT_PLACEHOLDER_COPY.body} Resultaten zijn nog niet beschikbaar in deze Task 1 placeholder.`,
      tone: 'amber',
    },
    nextStep: {
      title: 'Volgende stap',
      body: 'Gebruik deze route alleen voor identity plumbing totdat de culture-assessment module in opbouw wordt vervangen door de echte implementatie.',
      tone: 'blue',
    },
    focusSectionIntro:
      'Focusvragen verschijnen pas zodra de dedicated culture-assessment module is opgeleverd.',
    followThroughTitle: 'Placeholder status',
    followThroughIntro:
      'Er zijn nog geen culture-assessment playbooks beschikbaar vanuit deze veilige Task 1 placeholder.',
    followThroughCards: [
      {
        title: 'Executive-safe placeholder',
        body: 'De route bestaat nu als contract, maar zonder inhoudelijke productduiding of ExitScan-erfenis.',
        tone: 'amber',
      },
    ],
    managementBandOverride: null,
  }
}

function buildCultureAssessmentPlaceholderFocusQuestions(): Record<string, Record<string, string[]>> {
  return {}
}

function buildCultureAssessmentPlaceholderPlaybooks(): Record<string, Record<string, ActionPlaybook>> {
  return {}
}

const cultureAssessmentPlaceholderModule: ProductModule = {
  scanType: 'culture_assessment',
  definition: {
    scanType: 'culture_assessment',
    productName: 'Loep Culture Assessment',
    signalLabel: 'Loep Culture Index',
    signalLabelLower: 'loep culture index',
    summaryLabel: 'Executive culture read',
    methodologyText: 'Loep Culture Assessment is in opbouw; deze placeholder levert alleen een veilige Task 1 grens.',
    whatItIsText: 'Een identity-correcte placeholder voor de gedeelde routecontracten totdat de dedicated module bestaat.',
    whatItIsNotText: 'Geen echte culture-assessment dashboardlogica, geen ExitScan-fallback en geen finale executive duiding.',
    howToReadText: 'Lees deze route als in opbouw en wacht op de dedicated module voor echte resultaten en interpretatie.',
    privacyBoundaryText: 'Deze placeholder toont geen inhoudelijke resultaten en houdt de route executive-safe totdat de echte module klaar is.',
    evidenceStatusText: 'Task 1 levert alleen contractplumbing; productgedrag volgt later.',
    signalHelp: 'Loep Culture Index is geregistreerd als identity, maar inhoudelijke runtime is nog niet beschikbaar.',
    reliabilityText: 'De placeholder retourneert een gecontroleerde in-opbouw staat zodat gedeelde pagina’s veilig kunnen renderen.',
    segmentText: 'Focusvragen, playbooks en segmentgedrag blijven leeg totdat de dedicated module wordt toegevoegd.',
  },
  buildDashboardViewModel: () => buildCultureAssessmentPlaceholderViewModel(),
  getFocusQuestions: () => buildCultureAssessmentPlaceholderFocusQuestions(),
  getActionPlaybooks: () => buildCultureAssessmentPlaceholderPlaybooks(),
}

const PRODUCT_MODULES: Record<ScanType, ProductModule> = {
  culture_assessment: cultureAssessmentPlaceholderModule,
  exit: exitProductModule,
  leadership: leadershipProductModule,
  onboarding: onboardingProductModule,
  pulse: pulseProductModule,
  retention: retentionProductModule,
  team: teamProductModule,
}

export function getProductModule(scanType: ScanType): ProductModule {
  return PRODUCT_MODULES[scanType] ?? PRODUCT_MODULES.exit
}
