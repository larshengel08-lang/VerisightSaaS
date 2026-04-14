import { getProductModule } from '@/lib/products/shared/registry'
import type { SegmentPlaybookEntry, SignalTrendCard } from '@/lib/products/shared/types'
import { getScanDefinition } from '@/lib/scan-definitions'
import { EXIT_REASON_LABELS, FACTOR_LABELS } from '@/lib/types'
import type { CampaignStats, Respondent, SurveyResponse } from '@/lib/types'
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

export function buildHeroDescription({
  scanType,
  isActive,
  completionRate,
  pendingCount,
  hasEnoughData,
  averageRiskScore,
  scanDefinition,
}: {
  scanType: 'exit' | 'retention'
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
      return `Deze RetentieScan laat zien waar behoud onder druk staat op groepsniveau. Gebruik het beslisoverzicht eerst om te bepalen waar verificatie nodig is, en ga daarna pas de verdieping in. Huidig ${scanDefinition.signalLabelLower}: ${averageRiskScore?.toFixed(1) ?? '–'}/10 als samenvattend groepssignaal.`
  }

  return 'Deze ExitScan helpt het vertrekverhaal terugbrengen tot de factoren die het meest beïnvloedbaar lijken. Start bovenaan met het beslisoverzicht en gebruik daarna de verdieping om teams, factoren en vervolgacties scherper te maken.'
}

export function getTopFactorLabel(factorAverages: Record<string, number>) {
  const topFactor = Object.entries(factorAverages)
    .map(([factor, score]) => ({ factor, signalValue: 11 - score }))
    .sort((left, right) => right.signalValue - left.signalValue)[0]

  return topFactor ? (FACTOR_LABELS[topFactor.factor] ?? topFactor.factor) : null
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
      value: averageRiskScore !== null ? `${averageRiskScore.toFixed(1)}/10` : '–',
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
        value: retentionSupplemental.engagement !== null ? `${retentionSupplemental.engagement.toFixed(1)}/10` : '–',
        body: topFactorLabel
          ? `Gebruik bevlogenheid samen met ${topFactorLabel.toLowerCase()} en vertrekintentie om te bepalen hoe scherp het behoudssignaal echt is.`
          : 'Gebruik bevlogenheid samen met stay-intent en vertrekintentie om te bepalen hoe scherp het behoudssignaal echt is.',
        tone: 'emerald',
      },
    ]
  }

  return [
    ...sharedPanels,
    {
      eyebrow: 'Beïnvloedbaarheid',
      title: 'Sterk werksignaal',
      value: strongWorkSignalRate !== null ? `${strongWorkSignalRate}%` : '–',
      body: topFactorLabel
        ? `${topFactorLabel} is nu de eerste factor om te valideren. Het werksignaal helpt bepalen of het vertrekverhaal vooral binnen beïnvloedbare werkcontexten ligt.`
        : 'Gebruik dit om te bepalen in hoeverre vertrek vooral samenhangt met beïnvloedbare werkfactoren.',
      tone: strongWorkSignalRate !== null && strongWorkSignalRate >= 50 ? 'amber' : 'blue',
    },
  ]
}

export function buildNextStepTitle(scanType: 'exit' | 'retention', hasEnoughData: boolean, hasMinDisplay: boolean) {
  if (!hasMinDisplay) return 'Eerst respons opbouwen'
  if (!hasEnoughData) return 'Voorzichtig verdiepen'
  return scanType === 'retention' ? 'Valideren en prioriteren' : 'Duiden en verbeteren'
}

export function buildNextStepBody({
  scanType,
  hasEnoughData,
  hasMinDisplay,
  pendingCount,
  topFactor,
}: {
  scanType: 'exit' | 'retention'
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
  scanType: 'exit' | 'retention'
  hasEnoughData: boolean
  hasMinDisplay: boolean
  respondentsLength: number
  canManageCampaign: boolean
}) {
  return {
    analysisOpen: false,
    focusOpen: hasEnoughData,
    respondentsOpen: respondentsLength === 0 || (canManageCampaign && !hasMinDisplay),
    methodologyOpen: !hasEnoughData || scanType === 'exit',
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
  scanType: 'exit' | 'retention'
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
      title: scanType === 'retention' ? 'Lees de signalen als groepsinput' : 'Lees dit als managementinput',
      body:
        scanType === 'retention'
          ? 'RetentieScan blijft een groeps- en segmentinstrument. Gebruik signalen voor prioritering en verificatie, niet als individuele voorspelling.'
          : 'ExitScan bundelt vertrekervaringen tot managementpatronen. Gebruik deze uitkomsten om gesprekken te richten, niet om één score als sluitend bewijs te behandelen.',
      tone: 'blue',
    })
  }

  return items
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
  scanType: 'exit' | 'retention'
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
        value={signalDelta === null ? '–' : `${signalDelta > 0 ? '+' : ''}${signalDelta.toFixed(1)}`}
        body={`Vergeleken met ${previousCampaignName} van ${formattedDate} veranderde het gemiddelde retentiesignaal van ${previous.retentionSignal?.toFixed(1) ?? '–'}/10 naar ${current.retentionSignal?.toFixed(1) ?? '–'}/10.`}
        tone={tone}
      />

      {trendCards.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {trendCards.map((card) => (
            <DashboardPanel
              key={card.key}
              eyebrow={`${card.title} · vorige ${card.previousValue.toFixed(1)}/10`}
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
    values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100 : 5.5

  return {
    orgAverages: Object.fromEntries(ORG_FACTORS.map((factor) => [factor, average(orgTotals[factor] ?? [])])),
    sdtAverages: {
      autonomy: average(sdtTotals.autonomy ?? []),
      competence: average(sdtTotals.competence ?? []),
      relatedness: average(sdtTotals.relatedness ?? []),
    },
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
    .map((response) => response.stay_intent_score)
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
    retentionSignal: computeAverageRiskScore(responses),
    ...computeRetentionSupplementalAverages(responses),
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

      const avgSignal = computeAverageRiskScore(group.responses)
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
  scanType: 'exit' | 'retention',
  responses: (SurveyResponse & { respondents: Respondent })[],
) {
  if (scanType === 'exit') return responses
  return responses.map((response) => ({ respondent_id: response.respondent_id }))
}

export function buildRiskHistogram(responses: SurveyResponse[]) {
  const bins = ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10']
  const counts = Object.fromEntries(bins.map((bin) => [bin, 0])) as Record<string, number>
  for (const response of responses) {
    if (typeof response.risk_score !== 'number') continue
    const lower = Math.max(1, Math.min(9, Math.floor(response.risk_score)))
    counts[`${lower}-${lower + 1}`] += 1
  }
  return bins.map((range) => ({ range, count: counts[range] }))
}

export function computeAverageRiskScore(responses: SurveyResponse[]) {
  const values = responses.map((response) => response.risk_score).filter((value): value is number => typeof value === 'number')
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
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
              <span className={check.ok ? 'text-emerald-600' : check.warn ? 'text-amber-600' : 'text-red-600'}>{check.ok ? '✓' : check.warn ? '!' : '✕'}</span>
              <p className="text-sm font-semibold text-slate-900">{check.label}</p>
            </div>
            {check.detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
