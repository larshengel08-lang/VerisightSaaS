import type { ReactNode } from 'react'
import { getProductModule } from '@/lib/products/shared/registry'
import type { SegmentPlaybookEntry, SignalTrendCard } from '@/lib/products/shared/types'
import { buildFactorPresentation, getManagementBandLabel } from '@/lib/management-language'
import { getScanDefinition } from '@/lib/scan-definitions'
import {
  EXIT_REASON_LABELS,
  FACTOR_LABELS,
  getResponseDirectionSignalScore,
  getResponseSignalScore,
} from '@/lib/types'
import type { CampaignStats, Respondent, ScanType, SurveyResponse } from '@/lib/types'
import { DashboardPanel } from '@/components/dashboard/dashboard-primitives'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity']

export const MIN_N_PATTERNS = 10
export const MIN_N_DISPLAY = 5

export type RetentionSignalAverages = {
  retentionSignal: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
}

export type PulseSignalAverages = {
  pulseSignal: number | null
  stayIntent: number | null
  factorAverages: Record<string, number>
}

export type PulseComparisonState =
  | { status: 'no_previous' }
  | {
      status: 'insufficient_data'
      current: PulseSignalAverages
      previous: PulseSignalAverages
      currentResponsesLength: number
      previousResponsesLength: number
    }
  | {
      status: 'ready'
      current: PulseSignalAverages
      previous: PulseSignalAverages
      signalDelta: number | null
      stayIntentDelta: number | null
      direction: 'improved' | 'worsened' | 'stable'
      trendCards: SignalTrendCard[]
      sharedFactorCount: number
    }

export type RetentionTheme = {
  key: string
  title: string
  count: number
  implication: string
  sample: string
}

export type DecisionPanel = {
  eyebrow: string
  title: string
  value?: string
  body: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber'
}

export type InsightNotice = {
  title: string
  body: string
  tone: 'blue' | 'amber' | 'red'
}

export type ResponseReadState = {
  title: string
  body: string
  badge: string
  badgeTone: 'slate' | 'blue' | 'emerald' | 'amber'
  quickLabel: string
  caution: string
  nextStep: string
}

export type ScoreInterpretationGuide = {
  intro: string
  steps: Array<{
    title: string
    body: string
  }>
}

export type DriverDrilldownFactor = {
  factorKey: string
  factorLabel: string
  score: number
  signalValue: number
}

export type DriverDrilldownModel = {
  availableFactors: DriverDrilldownFactor[]
  highlightedFactors: DriverDrilldownFactor[]
  selectedFactorKey: string | null
  selectedFactor: DriverDrilldownFactor | null
}

export function buildHeroDescription({
  scanType,
  isActive,
  completionRate,
  pendingCount,
  hasEnoughData,
  averageRiskScore,
  scanDefinition,
}: {
  scanType: ScanType
  isActive: boolean
  completionRate: number
  pendingCount: number
  hasEnoughData: boolean
  averageRiskScore: number | null
  scanDefinition: ReturnType<typeof getScanDefinition>
}) {
  if (!hasEnoughData) {
    return isActive
      ? `Deze ${scanDefinition.productName}-campagne bouwt nog op. Met ${completionRate}% respons en ${pendingCount} openstaande respondent(en) is de focus nu vooral: responses laten binnenkomen en pas daarna het patroon lezen.`
      : `Deze ${scanDefinition.productName}-campagne is gesloten, maar heeft nog geen stevig analysetniveau bereikt. Lees de huidige uitkomsten voorzichtig en gebruik ze vooral voor richting, niet voor harde conclusies.`
  }

  if (scanType === 'retention') {
    return `Deze RetentieScan laat zien waar behoud onder druk staat op groepsniveau. Gebruik het beslisoverzicht eerst om te bepalen waar verificatie nodig is, en ga daarna pas de verdieping in. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '-'} /10 als samenvattend groepssignaal.`
  }

  if (scanType === 'pulse') {
    return `Deze Pulse laat een compacte managementread zien van werkbeleving en geselecteerde werkfactoren. Lees de uitkomst als bounded reviewlaag voor dit meetmoment, met alleen een beperkte vergelijking naar de vorige vergelijkbare Pulse. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '-'} /10.`
  }

  if (scanType === 'team') {
    return `Deze TeamScan laat een begrensde lokale read zien van het huidige teamsignaal. Gebruik de uitkomst om veilig te bepalen welke afdelingen eerst verificatie vragen, met expliciete onderdrukking zodra metadata of groepsgrootte dat niet dragen. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '-'} /10.`
  }

  if (scanType === 'onboarding') {
    return `Deze onboarding-campaign laat een begrensde checkpoint-read zien van nieuwe instroom op groepsniveau. Gebruik de uitkomst om te bepalen welke vroege succes- of frictiefactor nu eerst aandacht vraagt, zonder dit al als volledige 30-60-90-journey of individuele voorspelling te lezen. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '-'} /10.`
  }

  if (scanType === 'leadership') {
    return `Deze Leadership Scan laat een begrensde managementcontext-read zien op groepsniveau. Gebruik de uitkomst om te bepalen welke leiderschaps- of prioriteringscontext nu eerst duiding vraagt, zonder dit te lezen als named leader view, 360-output of performance-oordeel. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '-'} /10.`
  }

  return 'Deze ExitScan helpt het vertrekverhaal terugbrengen tot de factoren die het meest beinvloedbaar lijken. Start bovenaan met het beslisoverzicht en gebruik daarna de verdieping om teams, factoren en vervolgacties scherper te maken.'
}

export function getTopFactorLabel(factorAverages: Record<string, number>) {
  const topFactor = Object.entries(factorAverages)
    .map(([factor, score]) => ({ factor, signalValue: 11 - score }))
    .sort((left, right) => right.signalValue - left.signalValue)[0]

  return topFactor ? (FACTOR_LABELS[topFactor.factor] ?? topFactor.factor) : null
}

export function buildDriverDrilldownModel(args: {
  factorAverages: Record<string, number>
  selectedFactorKey: string | null
}): DriverDrilldownModel {
  const availableFactors = Object.entries(args.factorAverages)
    .map(([factorKey, score]) => ({
      factorKey,
      factorLabel: FACTOR_LABELS[factorKey] ?? factorKey,
      score,
      signalValue: Number((11 - score).toFixed(1)),
    }))
    .sort((left, right) => right.signalValue - left.signalValue)

  const fallbackFactor = availableFactors[0] ?? null
  const selectedFactor =
    availableFactors.find((factor) => factor.factorKey === args.selectedFactorKey) ?? fallbackFactor

  return {
    availableFactors,
    highlightedFactors: availableFactors.slice(0, 2),
    selectedFactorKey: selectedFactor?.factorKey ?? null,
    selectedFactor,
  }
}

export function buildDecisionPanels({
  stats,
  averageRiskScore,
  scanDefinition,
  strongWorkSignalRate,
  retentionSupplemental,
  factorAverages,
  hasEnoughData,
  hasMinDisplay,
}: {
  stats: CampaignStats
  averageRiskScore: number | null
  scanDefinition: ReturnType<typeof getScanDefinition>
  strongWorkSignalRate: number | null
  retentionSupplemental: ReturnType<typeof computeRetentionSupplementalAverages>
  factorAverages: Record<string, number>
  hasEnoughData: boolean
  hasMinDisplay: boolean
}): DecisionPanel[] {
  const topFactorLabel = getTopFactorLabel(factorAverages)

  const sharedPanels: DecisionPanel[] = [
    {
      eyebrow: 'Primair signaal',
      title: scanDefinition.signalLabel,
      value: averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : '-',
      body: averageRiskScore !== null
        ? `Gebruik dit als samenvattend managementsignaal. Lees de score altijd samen met ${topFactorLabel ? topFactorLabel.toLowerCase() : 'de topfactoren'} en de responskwaliteit.`
        : 'Nog geen score zichtbaar zolang er te weinig responses zijn om veilig te tonen.',
      tone: hasEnoughData ? 'blue' : hasMinDisplay ? 'amber' : 'amber',
    },
    {
      eyebrow: 'Responskwaliteit',
      title: hasEnoughData ? 'Stevig genoeg om te verdiepen' : hasMinDisplay ? 'Indicatief beeld' : 'Nog te vroeg',
      value: `${stats.completion_rate_pct ?? 0}%`,
      body: hasEnoughData
        ? 'Het dashboard heeft nu genoeg respons voor patroonanalyse, vergelijkingen en een betekenisvoller managementgesprek.'
        : hasMinDisplay
          ? 'Er is genoeg respons om voorzichtig te lezen, maar nog niet genoeg voor een volwaardig patroonbeeld.'
          : 'Wacht op meer responses voordat je individuele verschillen of scherpe patronen gaat duiden.',
      tone: hasEnoughData ? 'emerald' : 'amber',
    },
  ]

  if (stats.scan_type === 'retention') {
    return [
      ...sharedPanels,
      {
        eyebrow: 'Aanvullend signaal',
        title: 'Bevlogenheid',
        value: retentionSupplemental.engagement !== null ? `${retentionSupplemental.engagement.toFixed(1)}/10` : '-',
        body: topFactorLabel
          ? `Gebruik bevlogenheid samen met ${topFactorLabel.toLowerCase()} en vertrekintentie om te bepalen hoe scherp het retentiesignaal echt is.`
          : 'Gebruik bevlogenheid samen met stay-intent en vertrekintentie om te bepalen hoe scherp het retentiesignaal echt is.',
        tone: 'emerald',
      },
    ]
  }

  if (stats.scan_type === 'pulse') {
    return [
      ...sharedPanels,
      {
        eyebrow: 'Richting nu',
        title: 'Check-in richting',
        value: retentionSupplemental.stayIntent !== null ? `${retentionSupplemental.stayIntent.toFixed(1)}/10` : '-',
        body: topFactorLabel
          ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste reviewspoor en lees de richtingsvraag als extra indicatie of het beeld nu stabiliseert of juist extra aandacht vraagt.`
          : 'Gebruik de richtingsvraag als extra indicatie of deze Pulse vooral stabiliteit of bijsturing laat zien.',
        tone: retentionSupplemental.stayIntent !== null && retentionSupplemental.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
    ]
  }

  if (stats.scan_type === 'team') {
    return [
      ...sharedPanels,
      {
        eyebrow: 'Lokale richting',
        title: 'Department-first read',
        value: retentionSupplemental.stayIntent !== null ? `${retentionSupplemental.stayIntent.toFixed(1)}/10` : '-',
        body: topFactorLabel
          ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste lokaal verificatiespoor en lees de richtingsvraag alleen als extra indicatie of afdelingscontext nu steunend of juist schurend voelt.`
          : 'Gebruik de richtingsvraag als extra indicatie of de huidige werkcontext vooral lokale stabiliteit of juist lokale frictie laat zien.',
        tone: retentionSupplemental.stayIntent !== null && retentionSupplemental.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
    ]
  }

  if (stats.scan_type === 'onboarding') {
    return [
      ...sharedPanels,
      {
        eyebrow: 'Checkpoint richting',
        title: 'Richting in deze fase',
        value: retentionSupplemental.stayIntent !== null ? `${retentionSupplemental.stayIntent.toFixed(1)}/10` : '-',
        body: topFactorLabel
          ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste checkpointspoor en lees de richtingsvraag als extra indicatie of deze instroomfase nu stabiliseert of juist meer steun vraagt.`
          : 'Gebruik de richtingsvraag als extra indicatie of deze onboardingfase nu vooral stabiel of juist frictievol voelt.',
        tone: retentionSupplemental.stayIntent !== null && retentionSupplemental.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
    ]
  }

  if (stats.scan_type === 'leadership') {
    return [
      ...sharedPanels,
      {
        eyebrow: 'Managementrichting',
        title: 'Geaggregeerde context-read',
        value: retentionSupplemental.stayIntent !== null ? `${retentionSupplemental.stayIntent.toFixed(1)}/10` : '-',
        body: topFactorLabel
          ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste managementspoor en lees de richtingsvraag alleen als extra indicatie of de huidige aansturing werkbaarder of juist frictievoller voelt.`
          : 'Gebruik de richtingsvraag als extra indicatie of de huidige managementcontext vooral stabiliteit of juist meer frictie laat zien.',
        tone: retentionSupplemental.stayIntent !== null && retentionSupplemental.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
    ]
  }

  return [
    ...sharedPanels,
    {
      eyebrow: 'Beinvloedbaarheid',
      title: 'Sterk werksignaal',
      value: strongWorkSignalRate !== null ? `${strongWorkSignalRate}%` : '-',
      body: topFactorLabel
        ? `${topFactorLabel} is nu de eerste factor om te valideren. Het werksignaal helpt bepalen of het vertrekverhaal vooral binnen beinvloedbare werkcontexten ligt.`
        : 'Gebruik dit om te bepalen in hoeverre vertrek vooral samenhangt met beinvloedbare werkfactoren.',
      tone: strongWorkSignalRate !== null && strongWorkSignalRate >= 50 ? 'amber' : 'blue',
    },
  ]
}

export function buildNextStepTitle(scanType: ScanType, hasEnoughData: boolean, hasMinDisplay: boolean) {
  if (!hasMinDisplay) return 'Eerst respons opbouwen'
  if (!hasEnoughData) return 'Voorzichtig verdiepen'
  if (scanType === 'pulse') return 'Reviewen en bijsturen'
  if (scanType === 'team') return 'Lokaal verifieren'
  if (scanType === 'onboarding') return 'Checkpoint duiden'
  if (scanType === 'leadership') return 'Managementcontext duiden'
  return scanType === 'retention' ? 'Valideren en prioriteren' : 'Duiden en verbeteren'
}

export function buildNextStepBody({
  scanType,
  hasEnoughData,
  hasMinDisplay,
  pendingCount,
  topFactor,
}: {
  scanType: ScanType
  hasEnoughData: boolean
  hasMinDisplay: boolean
  pendingCount: number
  topFactor: string | null
}) {
  if (!hasMinDisplay) {
    return pendingCount > 0
      ? `Nodig de resterende ${pendingCount} respondent(en) eerst uit of stuur een reminder. Pas vanaf 5 responses wordt detailweergave veilig zichtbaar.`
      : 'Zorg eerst voor voldoende ingevulde responses voordat je deze campagne als besluitinput gebruikt.'
  }

  if (!hasEnoughData) {
    return topFactor
      ? `Gebruik ${topFactor.toLowerCase()} als eerste gesprekshaak, maar houd conclusies voorlopig indicatief totdat minimaal 10 responses binnen zijn.`
      : 'Lees de huidige signalen nog als richting, niet als vast patroon.'
  }

  if (scanType === 'retention') {
    return topFactor
      ? `Start met ${topFactor.toLowerCase()}, toets waar het patroon het sterkst zichtbaar is en gebruik daarna pas trend, segmenten en playbooks voor prioritering.`
      : 'Start met de laagst scorende werkfactor en valideer die in de eerstvolgende managementronde.'
  }

  if (scanType === 'pulse') {
    return topFactor
      ? `Gebruik ${topFactor.toLowerCase()} als eerste reviewspoor, kies een kleine correctie en leg direct vast wanneer je de volgende managementcheck of bounded Pulse-hercheck doet.`
      : 'Gebruik de compact gemeten werkfactoren om te kiezen welk spoor nu de eerste review of bijsturing vraagt.'
  }

  if (scanType === 'team') {
    return topFactor
      ? `Gebruik ${topFactor.toLowerCase()} als eerste lokaal verificatiespoor en bepaal welke afdeling of werkcontext nu eerst een beperkte check of correctie vraagt.`
      : 'Gebruik de compact gemeten werkfactoren om te kiezen welke lokale context nu als eerste verificatie verdient.'
  }

  if (scanType === 'onboarding') {
    return topFactor
      ? `Gebruik ${topFactor.toLowerCase()} als eerste checkpointspoor en bepaal welke beperkte correctie of extra steun in deze instroomfase nu het meest logisch is.`
      : 'Gebruik de compact gemeten werkfactoren om te kiezen welke vroege succes- of frictiefactor nu als eerste aandacht vraagt.'
  }

  if (scanType === 'leadership') {
    return topFactor
      ? `Gebruik ${topFactor.toLowerCase()} als eerste managementspoor en bepaal welke geaggregeerde managementcontext nu eerst een korte check of kleine correctie vraagt.`
      : 'Gebruik de compact gemeten werkfactoren om te kiezen welke managementcontext nu als eerste duiding verdient.'
  }

  return topFactor
    ? `Gebruik ${topFactor.toLowerCase()} en het werksignaal om te bepalen waar management eerst moet doorvragen en welke verbeteractie binnen 30-90 dagen het meest logisch is.`
    : 'Gebruik het werksignaal en de topfactoren om het eerstvolgende verbetergesprek te richten.'
}

export function getDisclosureDefaults({
  scanType,
  hasEnoughData,
  hasMinDisplay,
  respondentsLength,
  canManageCampaign,
}: {
  scanType: ScanType
  hasEnoughData: boolean
  hasMinDisplay: boolean
  respondentsLength: number
  canManageCampaign: boolean
}) {
  return {
    analysisOpen: false,
    focusOpen: hasEnoughData,
    respondentsOpen: respondentsLength === 0 || (canManageCampaign && !hasMinDisplay),
    methodologyOpen:
      !hasEnoughData ||
      scanType === 'exit' ||
      scanType === 'pulse' ||
      scanType === 'onboarding' ||
      scanType === 'leadership',
  }
}

export function buildInsightWarnings({
  responsesLength,
  hasMinDisplay,
  hasEnoughData,
  scanType,
}: {
  responsesLength: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  scanType: ScanType
}) {
  const items: InsightNotice[] = []

  if (!hasMinDisplay && responsesLength > 0) {
    items.push({
      title: 'Nog onvoldoende responses voor veilige detailweergave',
      body: `Met minder dan ${MIN_N_DISPLAY} responses blijven individuele details en scores bewust beperkt. Voeg meer responses toe voordat je conclusies trekt.`,
      tone: 'red',
    })
  } else if (hasMinDisplay && !hasEnoughData) {
    items.push({
      title: 'Beeld is nog indicatief',
      body: `Grafieken, patronen en diepere interpretatie worden steviger vanaf ${MIN_N_PATTERNS} responses. Gebruik de huidige inzichten vooral om gerichte vervolgvragen te kiezen.`,
      tone: 'amber',
    })
  }

  if (hasEnoughData) {
    items.push({
      title:
        scanType === 'retention'
          ? 'Lees de signalen als groepsinput'
          : scanType === 'pulse'
            ? 'Lees Pulse als snapshot'
            : scanType === 'team'
              ? 'Lees TeamScan als lokale contextlaag'
              : scanType === 'onboarding'
                ? 'Lees onboarding als checkpoint-read'
                : scanType === 'leadership'
                  ? 'Lees Leadership Scan als managementcontext-read'
            : 'Lees dit als managementinput',
      body:
        scanType === 'retention'
          ? 'RetentieScan blijft een groeps- en segmentinstrument. Gebruik signalen voor prioritering en verificatie, niet als individuele voorspelling.'
          : scanType === 'pulse'
            ? 'Pulse blijft een compacte groepsread. Gebruik de uitkomst voor review, bijsturing en een bounded hercheck op dit meetmoment, niet als breed trendbewijs of individuele score.'
            : scanType === 'team'
              ? 'TeamScan blijft een privacy-first lokale read. Gebruik de uitkomst om afdelingen te lokaliseren en te verifieren, niet om managers of individuen te rangschikken.'
              : scanType === 'onboarding'
                ? 'Onboarding blijft een checkpoint-read op groepsniveau. Gebruik de uitkomst om vroege integratie en frictie te duiden, niet als performance-oordeel, retentievoorspelling of volledige 30-60-90-journey.'
                : scanType === 'leadership'
                  ? 'Leadership Scan blijft een geaggregeerde managementread op groepsniveau. Gebruik de uitkomst om managementcontext te duiden, niet om individuele leidinggevenden te beoordelen of named leaders te rangschikken.'
            : 'ExitScan bundelt vertrekervaringen tot managementpatronen. Gebruik deze uitkomsten om gesprekken te richten, niet om een score als sluitend bewijs te behandelen.',
      tone: 'blue',
    })
  }

  return items
}

export function buildResponseReadState(args: {
  totalInvited: number
  totalCompleted: number
  completionRate: number
  pendingCount: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  isActive: boolean
}): ResponseReadState {
  if (args.totalInvited === 0) {
    return {
      title: 'Nog geen responsbasis',
      body: 'Er zijn nog geen uitnodigingen verstuurd of zichtbaar. Gebruik deze laag pas als eerste responses binnenkomen.',
      badge: 'Nog leeg',
      badgeTone: 'amber',
      quickLabel: 'Wacht nog',
      caution: 'Er is nog geen leesbasis om managementduiding op te openen.',
      nextStep: 'Zet eerst livegang en eerste responsstroom aan.',
    }
  }

  if (args.hasEnoughData) {
    return {
      title: 'Respons sterk genoeg voor managementlezing',
      body:
        args.pendingCount > 0
          ? `Met ${args.totalCompleted} van ${args.totalInvited} responses ligt er een stevig patroonbeeld. Er staan nog ${args.pendingCount} responses open, maar de hoofdlijn is nu leesbaar.`
          : `Met ${args.totalCompleted} van ${args.totalInvited} responses ligt er een stevig patroonbeeld. De wave kan nu als volwaardige managementread worden gelezen.`,
      badge: 'Stevige respons',
      badgeTone: 'emerald',
      quickLabel: 'Nu lezen',
      caution:
        args.pendingCount > 0
          ? 'Openstaande responses kunnen nog nuance toevoegen, niet de hoofdlijn vervangen.'
          : 'De responsbasis is nu stevig genoeg om synthese en drivers serieus te lezen.',
      nextStep: 'Lees nu via handoff, scorelaag en daarna pas synthese en drivers.',
    }
  }

  if (args.hasMinDisplay) {
    return {
      title: 'Indicatief beeld, nog geen volle patroonlaag',
      body: args.isActive
        ? 'Er is al genoeg respons om richting te lezen, maar nog niet genoeg om de diepere driverlaag en bredere routes volledig vrij te geven.'
        : 'De wave is gesloten, maar blijft qua onderbouwing indicatief. Lees de uitkomst als eerste richting en houd diepe duiding beperkt.',
      badge: 'Indicatief',
      badgeTone: 'amber',
      quickLabel: 'Lees voorzichtig',
      caution: 'Gebruik dit vooral als eerste richting en niet als volledig patroonbeeld.',
      nextStep: 'Houd de focus bovenin: handoff en score eerst, diepere drivers later.',
    }
  }

  return {
    title: 'Nog in opbouw',
    body: `Met ${args.totalCompleted} van ${args.totalInvited} responses is dit nog te smal voor patroonanalyse. Gebruik voorlopig alleen de contextlaag en laat de wave eerst verder vullen.`,
    badge: 'In opbouw',
    badgeTone: 'amber',
    quickLabel: 'Nog te vroeg',
    caution: 'De huidige basis is nog te smal voor een betrouwbare patroonread.',
    nextStep: 'Bouw eerst respons op voordat je score, synthese of drivers zwaar laat meewegen.',
  }
}

export function buildScoreInterpretationGuide(scanType: ScanType): ScoreInterpretationGuide {
  switch (scanType) {
    case 'exit':
      return {
        intro:
          'Lees deze laag als interpretatiehulp: eerst de frictiescoreband, daarna de verdeling van het vertrekbeeld en pas daarna de bestuurlijke synthese.',
        steps: [
          {
            title: 'Lees eerst de Frictiescore',
            body: 'De score geeft de hoofdrichting van het vertrekbeeld op groepsniveau.',
          },
          {
            title: 'Lees daarna de Verdeling',
            body: 'Kijk hoe breed en hoe scherp het vertrekbeeld in de groep terugkomt voordat je gaat verklaren.',
          },
          {
            title: 'Ga dan pas naar synthese en drivers',
            body: 'Gebruik factoren en managementsynthese pas nadat de scorelaag bestuurlijk is geland.',
          },
        ],
      }
    case 'retention':
      return {
        intro:
          'Lees deze laag eerst als groepssignaal: waar staat behoud onder druk, hoe breed komt dat terug en welke verdieping hoort daar pas daarna achteraan.',
        steps: [
          {
            title: 'Lees eerst het Retentiesignaal',
            body: 'Het signaal geeft de hoofdrichting van behoudsdruk op groepsniveau.',
          },
          {
            title: 'Lees daarna de Signaalverdeling',
            body: 'Kijk hoe breed het beeld terugkomt voordat je factoren of segmenten zwaarder laat wegen.',
          },
          {
            title: 'Ga dan pas naar synthese en drivers',
            body: 'Open daarna pas factoren, open signalen en actie om de eerste route te kiezen.',
          },
        ],
      }
    default:
      return {
        intro:
          'Lees deze laag eerst als interpretatiehulp: score of signaal geeft richting, verdeling geeft context en daarna pas volgt verdieping.',
        steps: [
          {
            title: 'Lees eerst het hoofdsignaal',
            body: 'Gebruik de score of signaalwaarde als eerste leesrichting op groepsniveau.',
          },
          {
            title: 'Lees daarna de verdeling',
            body: 'Kijk hoe breed het beeld terugkomt voordat je verklarende lagen opent.',
          },
          {
            title: 'Ga dan pas naar synthese en drivers',
            body: 'Gebruik de verdieping daarna pas om het eerste managementspoor te kiezen.',
          },
        ],
      }
  }
}

export function SdtGauge({ label, score }: { label: string; score: number }) {
  const percentage = ((score - 1) / 9) * 100
  const color = score >= 7 ? 'bg-emerald-500' : score >= 4.5 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 7 ? 'text-emerald-700' : score >= 4.5 ? 'text-amber-700' : 'text-red-700'

  return (
    <div className="rounded-[20px] border border-white/80 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{score.toFixed(1)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  )
}

export function MethodologyCard({
  scanType,
  hasSegmentDeepDive,
  signalLabel,
  embedded = false,
}: {
  scanType: ScanType
  hasSegmentDeepDive: boolean
  signalLabel: string
  embedded?: boolean
}) {
  const scanDefinition = getScanDefinition(scanType)
  const productModule = getProductModule(scanType)
  const signaalbandenText = productModule.buildDashboardViewModel({
    signalLabelLower: scanDefinition.signalLabelLower,
    averageSignal: null,
    strongWorkSignalRate: null,
    engagement: null,
    turnoverIntention: null,
    stayIntent: null,
    hasEnoughData: true,
    hasMinDisplay: true,
    pendingCount: 0,
    factorAverages: {},
  }).signaalbandenText

  return (
    <div className={embedded ? 'space-y-4' : 'rounded-[24px] border border-slate-200 bg-white p-5'}>
      <div>
        <h3 className="text-base font-semibold text-slate-950">Methodologie, trust en leeswijzer</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{scanDefinition.methodologyText}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <InfoBlock title="Wat dit product wel is" body={scanDefinition.whatItIsText} />
        <InfoBlock title="Niet voor bedoeld" body={scanDefinition.whatItIsNotText} />
        <InfoBlock title="Hoe je de output leest" body={scanDefinition.howToReadText} />
        <InfoBlock title="Privacy- en gebruiksgrens" body={scanDefinition.privacyBoundaryText} />
        <InfoBlock title="Bewijsstatus nu" body={scanDefinition.evidenceStatusText} />
        <InfoBlock title={signalLabel} body={scanDefinition.signalHelp} />
        <InfoBlock title="Signaalbanden" body={signaalbandenText} />
        <InfoBlock title="Betrouwbaarheid" body={scanDefinition.reliabilityText} />
        <InfoBlock
          title="Segment deep dive"
          body={
            hasSegmentDeepDive
              ? `${scanDefinition.segmentText} Deze campagne gebruikt die add-on al.`
              : scanDefinition.segmentText
          }
        />
      </div>
    </div>
  )
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{body}</p>
    </div>
  )
}

export function RetentionTrendSection({
  current,
  previous,
  previousDate,
  previousCampaignName,
  trendCards,
}: {
  current: RetentionSignalAverages
  previous: RetentionSignalAverages
  previousDate: string
  previousCampaignName: string
  trendCards: SignalTrendCard[]
}) {
  const signalDelta = current.retentionSignal !== null && previous.retentionSignal !== null
    ? Number((current.retentionSignal - previous.retentionSignal).toFixed(1))
    : null
  const isImproving = signalDelta !== null && signalDelta < -0.1
  const isWorsening = signalDelta !== null && signalDelta > 0.1
  const tone = isImproving ? 'emerald' : isWorsening ? 'amber' : 'blue'

  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(previousDate))

  return (
    <div className="space-y-4">
      <DashboardPanel
        eyebrow="Trend sinds vorige meting"
        title={isImproving ? 'Verbeterd' : isWorsening ? 'Verslechterd' : 'Stabiel'}
        value={signalDelta === null ? '-' : `${signalDelta > 0 ? '+' : ''}${signalDelta.toFixed(1)}`}
        body={`Vergeleken met ${previousCampaignName} van ${formattedDate} veranderde het gemiddelde retentiesignaal van ${previous.retentionSignal?.toFixed(1) ?? '-'} /10 naar ${current.retentionSignal?.toFixed(1) ?? '-'} /10.`}
        tone={tone}
      />

      {trendCards.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {trendCards.map((card) => (
            <DashboardPanel
              key={card.key}
              eyebrow={`${card.title} | vorige ${card.previousValue.toFixed(1)}/10`}
              title={`${card.currentValue.toFixed(1)}/10`}
              body={`${card.body} Delta ${card.delta > 0 ? '+' : ''}${card.delta.toFixed(1)}.`}
              tone={card.tone}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PulseTrendSection({
  comparison,
  previousDate,
  previousCampaignName,
}: {
  comparison: PulseComparisonState
  previousDate: string
  previousCampaignName: string
}) {
  if (comparison.status === 'no_previous') return null

  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(previousDate))

  if (comparison.status === 'insufficient_data') {
    return (
      <div className="space-y-4">
        <DashboardPanel
          eyebrow="Sinds vorige Pulse"
          title="Vergelijking nog niet veilig"
          value={`${comparison.currentResponsesLength}/${comparison.previousResponsesLength}`}
          body={`Er is wel een vorige Pulse-campaign (${previousCampaignName} van ${formattedDate}), maar een veilige deltalezing vraagt minimaal ${MIN_N_PATTERNS} responses in beide cycli. Lees de huidige Pulse daarom nog als snapshot met reviewcontext, niet als hard trendbeeld.`}
          tone="amber"
        />
      </div>
    )
  }

  const signalDeltaText =
    comparison.signalDelta === null
      ? '-'
      : `${comparison.signalDelta > 0 ? '+' : ''}${comparison.signalDelta.toFixed(1)}`
  const tone =
    comparison.direction === 'improved'
      ? 'emerald'
      : comparison.direction === 'worsened'
        ? 'amber'
        : 'blue'

  return (
    <div className="space-y-4">
      <DashboardPanel
        eyebrow="Sinds vorige Pulse"
        title={
          comparison.direction === 'improved'
            ? 'Verbeterd'
            : comparison.direction === 'worsened'
              ? 'Verslechterd'
              : 'Stabiel'
        }
        value={signalDeltaText}
        body={`Vergeleken met ${previousCampaignName} van ${formattedDate} verschoof het gemiddelde pulssignaal van ${comparison.previous.pulseSignal?.toFixed(1) ?? '-'} /10 naar ${comparison.current.pulseSignal?.toFixed(1) ?? '-'} /10. Gebruik dit als reviewrichting voor deze cycle, niet als bewijs dat een actieplan definitief werkt.`}
        tone={tone}
      />

      {comparison.trendCards.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {comparison.trendCards.map((card) => (
            <DashboardPanel
              key={card.key}
              eyebrow={`${card.title} | vorige ${card.previousValue.toFixed(1)}/10`}
              title={`${card.currentValue.toFixed(1)}/10`}
              body={`${card.body} Delta ${card.delta > 0 ? '+' : ''}${card.delta.toFixed(1)}.`}
              tone={card.tone}
            />
          ))}
        </div>
      ) : null}

      {comparison.sharedFactorCount === 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Factorvergelijking nu nog begrensd</p>
          <p className="mt-1 leading-6">
            Deze twee Pulse-cycli delen geen volledig vergelijkbare actieve werkfactoren. Lees daarom vooral het totale pulssignaal en de richtingsvraag, en gebruik factoruitleg per cycle afzonderlijk.
          </p>
        </div>
      ) : comparison.sharedFactorCount === 1 ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Beperkte factoroverlap</p>
          <p className="mt-1 leading-6">
            Er is maar één volledig gedeelde werkfactor tussen beide Pulse-cycli. Lees de factorvergelijking daarom voorzichtig en gebruik hem vooral als reviewhaak.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function computeFactorAverages(responses: SurveyResponse[]) {
  const orgTotals: Record<string, number[]> = {}
  const sdtTotals: Record<string, number[]> = {}

  for (const response of responses) {
    for (const factor of ORG_FACTORS) {
      const value = response.org_scores?.[factor]
      if (typeof value === 'number') {
        orgTotals[factor] = [...(orgTotals[factor] ?? []), value]
      }
    }

    for (const dimension of ['autonomy', 'competence', 'relatedness']) {
      const value = response.sdt_scores?.[dimension]
      if (typeof value === 'number') {
        sdtTotals[dimension] = [...(sdtTotals[dimension] ?? []), value]
      }
    }
  }

  const average = (values: number[]) =>
    Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100

  return {
    orgAverages: Object.fromEntries(
      ORG_FACTORS
        .filter((factor) => (orgTotals[factor] ?? []).length > 0)
        .map((factor) => [factor, average(orgTotals[factor] ?? [])]),
    ),
    sdtAverages: Object.fromEntries(
      (['autonomy', 'competence', 'relatedness'] as const)
        .filter((dimension) => (sdtTotals[dimension] ?? []).length > 0)
        .map((dimension) => [dimension, average(sdtTotals[dimension] ?? [])]),
    ) as { autonomy?: number; competence?: number; relatedness?: number },
  }
}

export function computeStrongWorkSignalRate(responses: SurveyResponse[]) {
  const total = responses.filter((response) => response.preventability).length
  const strongSignal = responses.filter((response) => response.preventability === 'STERK_WERKSIGNAAL').length
  if (!total) return 0
  return Math.round((strongSignal / total) * 100)
}

function getExitContextSummary(response: SurveyResponse) {
  const fullResult = response.full_result as Record<string, unknown> | null | undefined
  const exitContext = fullResult?.exit_context_summary
  return exitContext && typeof exitContext === 'object'
    ? exitContext as Record<string, unknown>
    : null
}

export function getTopExitReasonLabel(responses: SurveyResponse[]) {
  const counts = new Map<string, number>()

  for (const response of responses) {
    const code = response.exit_reason_code
    if (!code) continue
    counts.set(code, (counts.get(code) ?? 0) + 1)
  }

  const top = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]
  return top ? (EXIT_REASON_LABELS[top[0]] ?? top[0]) : null
}

export function getTopContributingReasonLabel(responses: SurveyResponse[]) {
  const counts = new Map<string, number>()

  for (const response of responses) {
    const summary = getExitContextSummary(response)
    const codes = summary?.['contributing_reason_codes']
    if (!Array.isArray(codes)) continue

    for (const code of codes) {
      if (typeof code !== 'string') continue
      counts.set(code, (counts.get(code) ?? 0) + 1)
    }
  }

  const top = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]
  return top ? (EXIT_REASON_LABELS[top[0]] ?? top[0]) : null
}

export function computeAverageSignalVisibility(responses: SurveyResponse[]) {
  const values = responses
    .map((response) => getExitContextSummary(response)?.['signal_visibility_score'])
    .filter((value): value is number => typeof value === 'number')

  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function computeRetentionSupplementalAverages(responses: SurveyResponse[]) {
  const engagement = responses
    .map((response) => response.uwes_score)
    .filter((value): value is number => typeof value === 'number')
  const turnoverIntention = responses
    .map((response) => response.turnover_intention_score)
    .filter((value): value is number => typeof value === 'number')
  const stayIntent = responses
    .map((response) => getResponseDirectionSignalScore(response))
    .filter((value): value is number => typeof value === 'number')
    .map((value) => ((value - 1) / 4) * 9 + 1)

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null

  return {
    engagement: average(engagement),
    turnoverIntention: average(turnoverIntention),
    stayIntent: average(stayIntent),
  }
}

export function computeRetentionSignalAverages(responses: SurveyResponse[]): RetentionSignalAverages {
  return {
    retentionSignal: computeAverageSignalScore(responses),
    ...computeRetentionSupplementalAverages(responses),
  }
}

export function computePulseSignalAverages(responses: SurveyResponse[]): PulseSignalAverages {
  return {
    pulseSignal: computeAverageSignalScore(responses),
    stayIntent: computeRetentionSupplementalAverages(responses).stayIntent,
    factorAverages: computeFactorAverages(responses).orgAverages,
  }
}

function getRiskDeltaDirection(delta: number | null): 'improved' | 'worsened' | 'stable' {
  if (delta === null || Math.abs(delta) < 0.1) return 'stable'
  return delta < 0 ? 'improved' : 'worsened'
}

function getPositiveDeltaDirection(delta: number | null): 'improved' | 'worsened' | 'stable' {
  if (delta === null || Math.abs(delta) < 0.1) return 'stable'
  return delta > 0 ? 'improved' : 'worsened'
}

export function buildPulseTrendCards(args: {
  current: PulseSignalAverages
  previous: PulseSignalAverages
}): { cards: SignalTrendCard[]; sharedFactorCount: number } {
  const cards: SignalTrendCard[] = []

  if (args.current.stayIntent !== null && args.previous.stayIntent !== null) {
    const delta = Number((args.current.stayIntent - args.previous.stayIntent).toFixed(1))
    const direction = getPositiveDeltaDirection(delta)
    cards.push({
      key: 'pulse_stay_intent',
      title: 'Trend richtingsvraag',
      currentValue: args.current.stayIntent,
      previousValue: args.previous.stayIntent,
      delta,
      direction,
      tone: direction === 'improved' ? 'emerald' : direction === 'worsened' ? 'amber' : 'blue',
      body:
        direction === 'improved'
          ? 'De richtingsvraag is gunstiger dan in de vorige Pulse. Toets vooral welke kleine correctie je wilt vasthouden.'
          : direction === 'worsened'
            ? 'De richtingsvraag is teruggevallen. Dit is een signaal om sneller te toetsen of de gekozen opvolging nog voldoende werkt.'
            : 'De richtingsvraag beweegt beperkt. Gebruik dit om te toetsen of stabiliteit echt gewenst is of dat actie nog onvoldoende zichtbaar is.',
    })
  }

  const sharedFactors = Object.keys(args.current.factorAverages).filter(
    (factor) => typeof args.previous.factorAverages[factor] === 'number',
  )

  const factorCards = sharedFactors
    .map((factor) => {
      const currentAverage = args.current.factorAverages[factor]
      const previousAverage = args.previous.factorAverages[factor]
      const currentValue = Number((11 - currentAverage).toFixed(1))
      const previousValue = Number((11 - previousAverage).toFixed(1))
      const delta = Number((currentValue - previousValue).toFixed(1))
      const direction = getRiskDeltaDirection(delta)

      return {
        key: `pulse_factor_${factor}`,
        title: `Verschuiving ${FACTOR_LABELS[factor] ?? factor}`,
        currentValue,
        previousValue,
        delta,
        direction,
        tone: direction === 'improved' ? 'emerald' : direction === 'worsened' ? 'amber' : 'blue',
        body:
          direction === 'improved'
            ? `${FACTOR_LABELS[factor] ?? factor} vraagt minder aandacht dan in de vorige Pulse. Kijk vooral wat je hier wilt behouden.`
            : direction === 'worsened'
              ? `${FACTOR_LABELS[factor] ?? factor} vraagt nu meer aandacht dan in de vorige Pulse. Toets snel wat in dit werkspoor verschuift.`
              : `${FACTOR_LABELS[factor] ?? factor} beweegt beperkt ten opzichte van de vorige Pulse. Gebruik dit als check of het beeld bewust stabiel blijft.`,
      } satisfies SignalTrendCard
    })
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 2)

  return {
    cards: [...cards, ...factorCards],
    sharedFactorCount: sharedFactors.length,
  }
}

export function buildPulseComparisonState(args: {
  current: PulseSignalAverages
  previous: PulseSignalAverages | null
  currentResponsesLength: number
  previousResponsesLength: number
}): PulseComparisonState {
  if (!args.previous) {
    return { status: 'no_previous' }
  }

  if (args.currentResponsesLength < MIN_N_PATTERNS || args.previousResponsesLength < MIN_N_PATTERNS) {
    return {
      status: 'insufficient_data',
      current: args.current,
      previous: args.previous,
      currentResponsesLength: args.currentResponsesLength,
      previousResponsesLength: args.previousResponsesLength,
    }
  }

  const signalDelta =
    args.current.pulseSignal !== null && args.previous.pulseSignal !== null
      ? Number((args.current.pulseSignal - args.previous.pulseSignal).toFixed(1))
      : null
  const stayIntentDelta =
    args.current.stayIntent !== null && args.previous.stayIntent !== null
      ? Number((args.current.stayIntent - args.previous.stayIntent).toFixed(1))
      : null
  const { cards, sharedFactorCount } = buildPulseTrendCards({
    current: args.current,
    previous: args.previous,
  })

  return {
    status: 'ready',
    current: args.current,
    previous: args.previous,
    signalDelta,
    stayIntentDelta,
    direction: getRiskDeltaDirection(signalDelta),
    trendCards: cards,
    sharedFactorCount,
  }
}

export function buildRetentionTrendCards(args: {
  current: RetentionSignalAverages
  previous: RetentionSignalAverages
}): SignalTrendCard[] {
  const metricDefinitions = [
    {
      key: 'engagement',
      title: 'Trend bevlogenheid',
      currentValue: args.current.engagement,
      previousValue: args.previous.engagement,
      improvingDelta: 0.1,
      improvedBody: 'De energie en positieve betrokkenheid zijn hoger dan in de vorige meting. Toets vooral wat je wilt behouden.',
      worsenedBody: 'De energie is gedaald ten opzichte van de vorige meting. Kijk vooral of werkdruk, leiderschap of perspectief mee verschuiven.',
      stableBody: 'Bevlogenheid beweegt beperkt. Gebruik dit om te toetsen of acties al effect hebben of nog onvoldoende zichtbaar zijn.',
    },
    {
      key: 'stay_intent',
      title: 'Trend stay-intent',
      currentValue: args.current.stayIntent,
      previousValue: args.previous.stayIntent,
      improvingDelta: 0.1,
      improvedBody: 'De expliciete bereidheid om te blijven ligt hoger dan in de vorige meting. Leg vast welke werkfactoren en keuzes je hier wilt behouden.',
      worsenedBody: 'Stay-intent is gedaald. Dit is vaak een signaal dat managementgesprekken en vervolgacties niet te lang moeten wachten.',
      stableBody: 'Stay-intent is stabiel. Kijk vooral of dat past bij de ontwikkeling van werkfactoren en vertrekintentie.',
    },
    {
      key: 'turnover_intention',
      title: 'Trend vertrekintentie',
      currentValue: args.current.turnoverIntention,
      previousValue: args.previous.turnoverIntention,
      improvingDelta: -0.1,
      improvedBody: 'Vertrekintentie is lager dan in de vorige meting. Dat is positief, maar alleen geloofwaardig als werkfactoren mee verbeteren.',
      worsenedBody: 'Vertrekintentie is opgelopen. Toets snel of dit vooral geconcentreerd zit in specifieke teams of rollen.',
      stableBody: 'Vertrekintentie blijft ongeveer gelijk. Gebruik segmentvergelijking om te zien waar het beeld het meest afwijkt.',
    },
  ] as const

  return metricDefinitions
    .filter(
      (
        metric,
      ): metric is (typeof metricDefinitions)[number] & {
        currentValue: number
        previousValue: number
      } => metric.currentValue !== null && metric.previousValue !== null,
    )
    .map((metric) => {
      const delta = Number((metric.currentValue - metric.previousValue).toFixed(1))
      const improved = metric.improvingDelta > 0 ? delta >= metric.improvingDelta : delta <= metric.improvingDelta
      const worsened = metric.improvingDelta > 0 ? delta <= -Math.abs(metric.improvingDelta) : delta >= Math.abs(metric.improvingDelta)

      return {
        key: metric.key,
        title: metric.title,
        currentValue: metric.currentValue,
        previousValue: metric.previousValue,
        delta,
        direction: improved ? 'improved' : worsened ? 'worsened' : 'stable',
        tone: improved ? 'emerald' : worsened ? 'amber' : 'blue',
        body: improved ? metric.improvedBody : worsened ? metric.worsenedBody : metric.stableBody,
      } satisfies SignalTrendCard
    })
}

export function buildRetentionSegmentPlaybooks(args: {
  responses: (SurveyResponse & { respondents: Respondent })[]
  orgAverageSignal: number | null
  playbooks: Record<string, Record<string, { title: string; decision: string; validate: string; owner: string; actions: string[]; caution: string }>>
}): SegmentPlaybookEntry[] {
  if (args.orgAverageSignal === null) return []
  const orgAverageSignal = args.orgAverageSignal
  const groups = new Map<string, {
    segmentType: 'department' | 'role_level'
    segmentLabel: string
    responses: (SurveyResponse & { respondents: Respondent })[]
  }>()

  for (const response of args.responses) {
    const department = response.respondents.department?.trim()
    if (department) {
      const key = `department:${department}`
      const group = groups.get(key) ?? { segmentType: 'department' as const, segmentLabel: department, responses: [] }
      group.responses.push(response)
      groups.set(key, group)
    }

    const roleLevel = response.respondents.role_level?.trim()
    if (roleLevel) {
      const key = `role_level:${roleLevel}`
      const group = groups.get(key) ?? { segmentType: 'role_level' as const, segmentLabel: formatRoleLevel(roleLevel), responses: [] }
      group.responses.push(response)
      groups.set(key, group)
    }
  }

  return Array.from(groups.values())
    .filter((group) => group.responses.length >= 5)
    .map((group) => {
      const segmentFactorAverages = computeFactorAverages(group.responses).orgAverages
      const sortedFactors = Object.entries(segmentFactorAverages)
        .map(([factor, score]) => ({ factor, factorLabel: FACTOR_LABELS[factor] ?? factor, signalValue: 11 - score }))
        .sort((left, right) => right.signalValue - left.signalValue)
      const topFactor = sortedFactors[0]
      if (!topFactor) return null

      const avgSignal = computeAverageSignalScore(group.responses)
      if (avgSignal === null) return null

      const band = topFactor.signalValue >= 7 ? 'HOOG' : topFactor.signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
      const playbook = args.playbooks[topFactor.factor]?.[band]
      if (!playbook) return null

      return {
        segmentType: group.segmentType,
        segmentLabel: group.segmentLabel,
        factorKey: topFactor.factor,
        factorLabel: topFactor.factorLabel,
        n: group.responses.length,
        avgSignal,
        deltaVsOrg: Number((avgSignal - orgAverageSignal).toFixed(1)),
        signalValue: Number(topFactor.signalValue.toFixed(1)),
        title: playbook.title,
        decision: playbook.decision,
        validate: playbook.validate,
        owner: playbook.owner,
        actions: playbook.actions,
        caution: playbook.caution,
      } satisfies SegmentPlaybookEntry
    })
    .filter((segment): segment is SegmentPlaybookEntry => Boolean(segment))
    .filter((segment) => segment.avgSignal >= 4.5 || segment.deltaVsOrg >= 0.4)
    .sort((left, right) => (right.deltaVsOrg - left.deltaVsOrg) || (right.avgSignal - left.avgSignal))
    .slice(0, 3)
}

function formatRoleLevel(value: string) {
  const labels: Record<string, string> = {
    uitvoerend: 'Uitvoerend',
    specialist: 'Specialist',
    senior: 'Senior',
    manager: 'Manager',
    director: 'Director',
    c_level: 'C-level',
  }

  return labels[value] ?? value
}

export function clusterRetentionOpenSignals(responses: SurveyResponse[]): RetentionTheme[] {
  const definitions = [
    { key: 'leadership', title: 'Leiderschap en ondersteuning', keywords: ['leidinggevende', 'manager', 'feedback', 'aansturing', 'sturing', 'coach'], implication: 'Dit wijst vaak op een behoefte aan duidelijker leiderschap, betere feedback of meer autonomie-ondersteuning.' },
    { key: 'culture', title: 'Veiligheid en samenwerking', keywords: ['cultuur', 'veilig', 'samenwerking', 'team', 'vertrouwen', 'uitspreken'], implication: 'Dit signaal vraagt meestal om verificatie van psychologische veiligheid, teamdynamiek en cultuurfit.' },
    { key: 'growth', title: 'Groei en perspectief', keywords: ['groei', 'ontwikkeling', 'loopbaan', 'doorgroei', 'perspectief', 'leren'], implication: 'Dit signaal wijst vaak op behoefte aan ontwikkelruimte of een geloofwaardig toekomstperspectief.' },
    { key: 'compensation', title: 'Beloning en voorwaarden', keywords: ['salaris', 'beloning', 'voorwaarden', 'arbeidsvoorwaarden', 'vergoeding', 'loon'], implication: 'Dit gaat vaak niet alleen over hoogte, maar ook over ervaren eerlijkheid en passendheid van voorwaarden.' },
    { key: 'workload', title: 'Werkdruk en herstel', keywords: ['werkdruk', 'druk', 'belasting', 'uren', 'drukte', 'overwerk', 'pauze'], implication: 'Dit wijst vaak op structurele druk, onvoldoende herstel of beperkte regelruimte in het werk.' },
    { key: 'role_clarity', title: 'Rolhelderheid en prioriteiten', keywords: ['rol', 'duidelijk', 'verwachting', 'prioriteit', 'verantwoordelijkheid', 'taak'], implication: 'Dit signaal vraagt meestal om helderder prioriteiten, eigenaarschap en besluitvorming.' },
  ] as const

  const counts = new Map<string, { definition: typeof definitions[number]; texts: string[] }>()
  for (const definition of definitions) counts.set(definition.key, { definition, texts: [] })

  for (const response of responses) {
    const text = response.open_text_raw?.trim()
    if (!text) continue
    const normalized = text.toLowerCase()
    for (const definition of definitions) {
      if (definition.keywords.some((keyword) => normalized.includes(keyword))) {
        counts.get(definition.key)?.texts.push(text)
        break
      }
    }
  }

  return Array.from(counts.values())
    .filter((entry) => entry.texts.length > 0)
    .map((entry) => ({ key: entry.definition.key, title: entry.definition.title, count: entry.texts.length, implication: entry.definition.implication, sample: entry.texts[0] }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)
}

export function buildSafeTableResponses(
  scanType: ScanType,
  responses: (SurveyResponse & { respondents: Respondent })[],
) {
  if (scanType === 'exit') return responses
  return responses.map((response) => ({ respondent_id: response.respondent_id }))
}

export function buildRiskHistogram(responses: SurveyResponse[]) {
  const bins = ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10']
  const counts = Object.fromEntries(bins.map((bin) => [bin, 0])) as Record<string, number>
  for (const response of responses) {
    const signalScore = getResponseSignalScore(response)
    if (typeof signalScore !== 'number') continue
    const lower = Math.max(1, Math.min(9, Math.floor(signalScore)))
    counts[`${lower}-${lower + 1}`] += 1
  }
  return bins.map((range) => ({ range, count: counts[range] }))
}

export function computeAverageRiskScore(responses: SurveyResponse[]) {
  const values = responses
    .map((response) => getResponseSignalScore(response))
    .filter((value): value is number => typeof value === 'number')
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export const computeAverageSignalScore = computeAverageRiskScore

export function RecommendationList({
  factorAverages,
  scanType,
  bandOverride,
}: {
  factorAverages: Record<string, number>
  scanType: ScanType
  bandOverride?: 'HOOG' | 'MIDDEN' | 'LAAG' | null
}) {
  const focusQuestions = getProductModule(scanType).getFocusQuestions()
  const items = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
      .map((factor) => {
        const score = factorAverages[factor]
        const signalValue = 11 - score
        const band = bandOverride ?? (signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG')
        const questions = focusQuestions[factor]?.[band] ?? []
        const presentation = buildFactorPresentation({ score, signalScore: signalValue, managementLabel: getManagementBandLabel(band) })

      return {
        factor,
        score,
        signalValue,
        band,
        presentation,
        questions,
      }
    })
    .filter((item) => item.questions.length > 0)
    .sort((a, b) => b.signalValue - a.signalValue)
    .slice(0, 3)

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.factor} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {FACTOR_LABELS[item.factor]} · {item.band === 'HOOG' ? 'scherp reviewsignaal' : 'gerichte reviewvraag'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">
                Wat moet management nu eerst uitvragen op {FACTOR_LABELS[item.factor].toLowerCase()}?
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Ervaren score {item.presentation.scoreDisplay}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {item.questions.map((question) => (
              <li key={question} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="mt-1 text-slate-400">&bull;</span>
                <span className="text-sm leading-6 text-slate-700">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function ActionPlaybookList({
  factorAverages,
  scanType,
  bandOverride,
}: {
  factorAverages: Record<string, number>
  scanType: ScanType
  bandOverride?: 'HOOG' | 'MIDDEN' | 'LAAG' | null
}) {
  const playbooks = getProductModule(scanType).getActionPlaybooks()
  const items = ORG_FACTORS
    .filter((factor) => factor in factorAverages)
      .map((factor) => {
        const score = factorAverages[factor]
        const signalValue = 11 - score
        const band = bandOverride ?? (signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG')
        const presentation = buildFactorPresentation({ score, signalScore: signalValue, managementLabel: getManagementBandLabel(band) })
        return {
        factor,
        score,
        signalValue,
        band,
        presentation,
        playbook: playbooks[factor]?.[band] ?? null,
      }
    })
    .filter((item) => item.playbook)
    .sort((a, b) => b.signalValue - a.signalValue)
    .slice(0, 2)

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.factor} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {FACTOR_LABELS[item.factor]} · {item.band === 'HOOG' ? 'urgent playbook' : 'aandacht playbook'}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">{item.playbook?.title}</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Ervaren score {item.presentation.scoreDisplay}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CardColumn title="Eerste besluit" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.decision}</p>
            </CardColumn>
            <CardColumn title="Eerste eigenaar" tone="slate">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.owner}</p>
            </CardColumn>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <CardColumn title="Eerst valideren" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.validate}</p>
            </CardColumn>
            <CardColumn title="Logische acties" tone="emerald">
              <ul className="space-y-2">
                {item.playbook?.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="text-slate-400">&bull;</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardColumn>
            <CardColumn title="Niet overhaasten" tone="amber">
              <p className="text-sm leading-6 text-slate-700">{item.playbook?.caution}</p>
            </CardColumn>
          </div>

          <div className="mt-4">
            <CardColumn title="Reviewmoment" tone="slate">
              <p className="text-sm leading-6 text-slate-700">
                {item.playbook?.review ??
                  (scanType === 'exit'
                    ? 'Plan binnen 60-90 dagen een review op dit spoor: wat is gekozen, wat is uitgevoerd en wat keert terug in de volgende exitbatch?'
                    : 'Plan binnen 45-90 dagen een review of vervolgmeting: wat is geverifieerd, welke eerste stap loopt en wat verschuift er in het retentiesignaal?')}
              </p>
            </CardColumn>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SegmentPlaybookList({ segments }: { segments: SegmentPlaybookEntry[] }) {
  if (segments.length === 0) return null

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <div
          key={`${segment.segmentType}-${segment.segmentLabel}-${segment.factorKey}`}
          className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {segment.segmentType === 'department' ? 'Afdeling' : 'Functieniveau'} · {segment.segmentLabel}
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-950">{segment.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Binnen deze groep geeft <span className="font-semibold">{segment.factorLabel}</span> het scherpste signaal.
                De gemiddelde signalering ligt op {segment.avgSignal.toFixed(1)}/10 en wijkt{' '}
                {segment.deltaVsOrg > 0
                  ? `${segment.deltaVsOrg.toFixed(1)} punt hoger`
                  : `${Math.abs(segment.deltaVsOrg).toFixed(1)} punt lager`}{' '}
                af dan het organisatieniveau.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Segment</p>
              <p className="mt-1 font-semibold text-slate-950">n = {segment.n}</p>
              <p className="mt-1">Topfactor: {segment.factorLabel}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CardColumn title="Eerste besluit" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{segment.decision}</p>
            </CardColumn>
            <CardColumn title="Eerste eigenaar" tone="slate">
              <p className="text-sm leading-6 text-slate-700">{segment.owner}</p>
            </CardColumn>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <CardColumn title="Eerst valideren" tone="blue">
              <p className="text-sm leading-6 text-slate-700">{segment.validate}</p>
            </CardColumn>
            <CardColumn title="Logische acties" tone="emerald">
              <ul className="space-y-2">
                {segment.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="text-slate-400">&bull;</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardColumn>
            <CardColumn title="Niet overhaasten" tone="amber">
              <p className="text-sm leading-6 text-slate-700">{segment.caution}</p>
            </CardColumn>
          </div>
        </div>
      ))}
    </div>
  )
}

function CardColumn({
  title,
  tone,
  children,
}: {
  title: string
  tone: 'slate' | 'blue' | 'emerald' | 'amber'
  children: ReactNode
}) {
  const classes =
    tone === 'slate'
      ? 'border-slate-200 bg-slate-50'
      : tone === 'emerald'
        ? 'border-emerald-100 bg-emerald-50'
        : tone === 'amber'
          ? 'border-amber-100 bg-amber-50'
          : 'border-blue-100 bg-blue-50'
  const labelClass =
    tone === 'slate'
      ? 'text-slate-600'
      : tone === 'emerald'
        ? 'text-emerald-700'
        : tone === 'amber'
          ? 'text-amber-700'
          : 'text-blue-700'

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${labelClass}`}>{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function CampaignHealthIndicator({
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasEnoughData,
  hasMinDisplay,
}: {
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasEnoughData: boolean
  hasMinDisplay: boolean
}) {
  const checks: { label: string; ok: boolean; warn?: boolean; detail?: string }[] = [
    { label: 'Uitnodigingen verstuurd', ok: invitesNotSent === 0, warn: invitesNotSent > 0, detail: invitesNotSent > 0 ? `${invitesNotSent} respondent(en) hebben nog geen uitnodiging ontvangen` : undefined },
    { label: 'Minimum responses bereikt', ok: hasMinDisplay, warn: !hasMinDisplay && totalCompleted > 0, detail: !hasMinDisplay ? `${totalCompleted} van min. 5 vereist voor weergave` : undefined },
    { label: 'Voldoende data voor analyse', ok: hasEnoughData, warn: hasMinDisplay && !hasEnoughData, detail: !hasEnoughData ? `${totalCompleted} van min. 10 vereist voor patroonanalyse` : undefined },
    { label: 'Alle scores volledig', ok: incompleteScores === 0, warn: incompleteScores > 0, detail: incompleteScores > 0 ? `${incompleteScores} response(s) met ontbrekende scores` : undefined },
  ]

  if (totalInvited === 0) return null
  const warnings = checks.filter((check) => !check.ok)
  const headline = warnings.length === 0 ? 'Alles in orde' : warnings.length === 1 ? '1 aandachtspunt' : `${warnings.length} aandachtspunten`
  const tone = warnings.length === 0 ? 'emerald' : 'amber'

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${tone === 'emerald' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Campaign health</p>
          <p className="mt-1 text-base font-semibold text-slate-950">{headline}</p>
        </div>
        <p className="text-sm leading-6 text-slate-700">
          {warnings.length === 0 ? 'Campaign en data staan er operationeel goed voor.' : 'Gebruik deze checks om snel te zien of rapportage, reminders of verdieping nog eerst operationeel werk vragen.'}
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={check.ok ? 'text-emerald-600' : check.warn ? 'text-amber-600' : 'text-red-600'}>{check.ok ? 'OK' : check.warn ? '!' : 'X'}</span>
              <p className="text-sm font-semibold text-slate-900">{check.label}</p>
            </div>
            {check.detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
