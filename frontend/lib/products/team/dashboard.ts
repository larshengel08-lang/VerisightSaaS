import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'
import type { Respondent, SurveyResponse } from '@/lib/types'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog teamsignaal geven alleen de scherpte van het huidige lokale aandachtssignaal weer. Lees TeamScan als een compacte lokalisatieread van werkbeleving, actieve werkfactoren en een lokale richtingsvraag op groepsniveau, niet als manager ranking of individueel oordeel.'

const ORG_FACTORS = ['leadership', 'culture', 'growth', 'compensation', 'workload', 'role_clarity'] as const
const MIN_TEAM_GROUP_N = 5
const MIN_PRIORITY_SIGNAL = 4.5
const MIN_PRIORITY_DELTA = 0.6
const MIN_PRIORITY_DELTA_VS_ORG = 0.4
const WATCH_DELTA_VS_ORG = 0.2
const TEAM_METHOD_READ =
  'TeamScan combineert een korte werkbelevingscheck, actieve werkfactoren en een lokale richtingsvraag om te bepalen waar eerst verificatie nodig is.'

function getReviewWindow(signalState: 'hoog' | 'midden' | 'laag' | 'in_opbouw') {
  if (signalState === 'hoog') return 'Binnen 30 dagen herlezen'
  if (signalState === 'midden') return 'Binnen 30-45 dagen herlezen'
  return 'Na eerste lokale check herlezen'
}

export type TeamLocalGroupCard = {
  label: string
  n: number
  avgSignal: number
  deltaVsOrg: number
  topFactorKey: string
  topFactorLabel: string
  topFactorSignalValue: number
  summary: string
  tone: 'blue' | 'amber'
}

export type TeamPriorityGroupCard = TeamLocalGroupCard & {
  priorityState: 'first_verify' | 'watch_next' | 'monitor_only' | 'no_hard_order'
  priorityTitle: string
  priorityBody: string
  priorityTone: 'blue' | 'amber' | 'emerald'
  isPrimary: boolean
}

export type TeamLocalReadState =
  | {
      status: 'needs_more_responses' | 'needs_metadata' | 'needs_safe_groups'
      totalResponses: number
      coverageCount: number
      safeGroupCount: 0
      suppressedGroupCount: number
      groups: TeamLocalGroupCard[]
      summaryTitle: string
      summaryBody: string
      caution: string
    }
  | {
      status: 'ready'
      totalResponses: number
      coverageCount: number
      safeGroupCount: number
      suppressedGroupCount: number
      groups: TeamLocalGroupCard[]
      summaryTitle: string
      summaryBody: string
      caution: string
    }

export type TeamPriorityReadState =
  | {
      status: 'not_available'
      summaryTitle: string
      summaryBody: string
      caution: string
      groups: TeamPriorityGroupCard[]
    }
  | {
      status: 'ready' | 'no_hard_order'
      summaryTitle: string
      summaryBody: string
      caution: string
      groups: TeamPriorityGroupCard[]
      firstPriorityLabel: string | null
    }

function getTopFactors(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .map(([factor, score]) => ({
      factor,
      score,
      signalValue: 11 - score,
    }))
    .sort((left, right) => right.signalValue - left.signalValue)
    .slice(0, 2)
}

function getSignalState(averageSignal: number | null) {
  if (averageSignal === null) return 'in_opbouw'
  if (averageSignal >= 7) return 'hoog'
  if (averageSignal >= 4.5) return 'midden'
  return 'laag'
}

function computeAverageRiskScore(responses: SurveyResponse[]) {
  const values = responses
    .map((response) => response.risk_score)
    .filter((value): value is number => typeof value === 'number')
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function computeFactorAverages(responses: (SurveyResponse & { respondents: Respondent })[]) {
  const factorScores = Object.fromEntries(ORG_FACTORS.map((factor) => [factor, [] as number[]])) as Record<
    (typeof ORG_FACTORS)[number],
    number[]
  >

  for (const response of responses) {
    const scores = response.org_scores ?? {}
    for (const factor of ORG_FACTORS) {
      const value = scores[factor]
      if (typeof value === 'number') factorScores[factor].push(value)
    }
  }

  return Object.fromEntries(
    ORG_FACTORS.map((factor) => {
      const values = factorScores[factor]
      const average = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 5.5
      return [factor, average]
    }),
  ) as Record<string, number>
}

export function buildTeamLocalReadState(
  responses: (SurveyResponse & { respondents: Respondent })[],
): TeamLocalReadState {
  const totalResponses = responses.length
  const withDepartment = responses.filter((response) => Boolean(response.respondents.department?.trim()))
  const coverageCount = withDepartment.length

  if (totalResponses < MIN_TEAM_GROUP_N) {
    return {
      status: 'needs_more_responses',
      totalResponses,
      coverageCount,
      safeGroupCount: 0,
      suppressedGroupCount: 0,
      groups: [],
      summaryTitle: 'Lokale read nog in opbouw',
      summaryBody:
        'TeamScan toont lokale context pas zodra er genoeg groepsresponses zijn om afdelingsuitsplitsing veilig te lezen.',
      caution:
        'Gebruik TeamScan nu nog niet om afdelingen te vergelijken. Bouw eerst genoeg responses op voor een veilige lokale read en schakel intussen terug naar bredere diagnose of organisatieniveau.',
    }
  }

  if (coverageCount < MIN_TEAM_GROUP_N) {
    return {
      status: 'needs_metadata',
      totalResponses,
      coverageCount,
      safeGroupCount: 0,
      suppressedGroupCount: 0,
      groups: [],
      summaryTitle: 'Onvoldoende afdelingsmetadata',
      summaryBody:
        'Er zijn wel genoeg responses voor een algemene TeamScan-read, maar te weinig responses bevatten een bruikbare afdeling om lokale context veilig te tonen.',
      caution:
        'Laat TeamScan hier bewust op organisatieniveau staan, verbeter eerst department-metadata en schakel terug naar bredere diagnose totdat lokale uitsplitsing eerlijk leesbaar is.',
    }
  }

  const groups = new Map<string, (SurveyResponse & { respondents: Respondent })[]>()
  for (const response of withDepartment) {
    const department = response.respondents.department?.trim()
    if (!department) continue
    const group = groups.get(department) ?? []
    group.push(response)
    groups.set(department, group)
  }

  const orgAverageSignal = computeAverageRiskScore(responses) ?? 0
  const safeGroups = Array.from(groups.entries())
    .filter(([, items]) => items.length >= MIN_TEAM_GROUP_N)
    .map(([label, items]) => {
      const avgSignal = computeAverageRiskScore(items) ?? 0
      const factorAverages = computeFactorAverages(items)
      const topFactor = getTopFactors(factorAverages)[0]
      const topFactorKey = topFactor?.factor ?? 'workload'
      const topFactorLabel = topFactor ? FACTOR_LABELS[topFactor.factor] ?? topFactor.factor : 'Werkcontext'
      const topFactorSignalValue = topFactor ? Number(topFactor.signalValue.toFixed(1)) : 5.5
      const deltaVsOrg = Number((avgSignal - orgAverageSignal).toFixed(1))
      const tone = avgSignal >= 7 || deltaVsOrg >= 0.5 ? 'amber' : 'blue'
      const deltaText =
        deltaVsOrg > 0
          ? `${deltaVsOrg.toFixed(1)} punt hoger`
          : deltaVsOrg < 0
            ? `${Math.abs(deltaVsOrg).toFixed(1)} punt lager`
            : 'ongeveer gelijk'

      return {
        label,
        n: items.length,
        avgSignal: Number(avgSignal.toFixed(1)),
        deltaVsOrg,
        topFactorKey,
        topFactorLabel,
        topFactorSignalValue,
        summary: `${topFactorLabel} is hier het scherpste lokale spoor. Het teamsignaal ligt ${deltaText} dan het organisatieniveau.`,
        tone,
      } satisfies TeamLocalGroupCard
    })
    .sort((left, right) => (right.avgSignal - left.avgSignal) || (right.deltaVsOrg - left.deltaVsOrg))
    .slice(0, 3)

  const suppressedGroupCount = Math.max(groups.size - safeGroups.length, 0)

  if (safeGroups.length === 0) {
    return {
      status: 'needs_safe_groups',
      totalResponses,
      coverageCount,
      safeGroupCount: 0,
      suppressedGroupCount,
      groups: [],
      summaryTitle: 'Nog geen veilige afdelingsgroepen',
      summaryBody:
        'Afdelingsmetadata is aanwezig, maar nog geen enkele afdeling haalt de minimale groepsgrootte voor veilige lokale weergave.',
      caution:
        `Lees TeamScan nu alleen als organisatieniveau. ${suppressedGroupCount} afdeling(en) blijven bewust onderdrukt totdat ze voldoende responses hebben, dus schakel terug naar bredere diagnose in plaats van lokale volgorde te suggereren.`,
    }
  }

  const suppressedSummary =
    suppressedGroupCount > 0
      ? ` ${suppressedGroupCount} kleinere afdeling(en) blijven bewust onderdrukt en vragen nu geen aparte lokale conclusie.`
      : ''

  return {
    status: 'ready',
    totalResponses,
    coverageCount,
    safeGroupCount: safeGroups.length,
    suppressedGroupCount,
    groups: safeGroups,
    summaryTitle: 'Veilige lokale read beschikbaar',
    summaryBody:
      `De afdelingsuitsplitsing hieronder laat zien waar het huidige teamsignaal lokaal het scherpst speelt. Lees dit als verificatiehulp, niet als bewijs dat de oorzaak vaststaat.${suppressedSummary}`,
    caution:
      'Gebruik deze lokale read om het eerste afdelingsgesprek te richten. Kleine of ontbrekende groepen blijven bewust buiten beeld; zodra lokale leesbaarheid te dun wordt, schakel je terug naar bredere diagnose in plaats van naar schijnprecisie.',
  }
}

function getPriorityBand(signalValue: number) {
  if (signalValue >= 7) return 'HOOG'
  if (signalValue >= 4.5) return 'MIDDEN'
  return 'LAAG'
}

function buildPriorityGroup(
  group: TeamLocalGroupCard,
  priorityState: TeamPriorityGroupCard['priorityState'],
  isPrimary: boolean,
): TeamPriorityGroupCard {
  if (priorityState === 'first_verify') {
    return {
      ...group,
      priorityState,
      priorityTitle: 'Eerst verifieren',
      priorityBody: `${group.label} verdient nu de eerste bounded check op ${group.topFactorLabel.toLowerCase()}, zodat management kan toetsen of een kleine lokale correctie genoeg is.`,
      priorityTone: 'amber',
      isPrimary,
    }
  }

  if (priorityState === 'watch_next') {
    return {
      ...group,
      priorityState,
      priorityTitle: 'Daarna meekijken',
      priorityBody: `${group.label} blijft zichtbaar als tweede lokale context, maar hoort pas na de eerste verificatie opnieuw te worden gewogen.`,
      priorityTone: 'blue',
      isPrimary,
    }
  }

  if (priorityState === 'monitor_only') {
    return {
      ...group,
      priorityState,
      priorityTitle: 'Alleen monitoren',
      priorityBody: `${group.label} blijft bruikbaar als lokale context, maar vraagt nu geen eerste bounded interventie of harde escalatie.`,
      priorityTone: 'emerald',
      isPrimary,
    }
  }

  return {
    ...group,
    priorityState,
    priorityTitle: 'Nog geen harde volgorde',
    priorityBody: `${group.label} is zichtbaar in de lokale read, maar de verschillen zijn nu te beperkt voor een eerlijke eerste volgorde.`,
    priorityTone: 'blue',
    isPrimary,
  }
}

export function buildTeamPriorityReadState(localRead: TeamLocalReadState): TeamPriorityReadState {
  if (localRead.status !== 'ready') {
    return {
      status: 'not_available',
      summaryTitle: 'Lokale prioriteit nog niet beschikbaar',
      summaryBody:
        'TeamScan toont pas een bounded eerste verificatieprioriteit zodra er veilige afdelingen zichtbaar zijn en de lokale verschillen scherp genoeg uit elkaar lopen om management echt richting te geven.',
      caution:
        'Gebruik de huidige TeamScan-uitkomst nu alleen als lokale contextlaag. Harde volgorde blijft bewust uit totdat metadata, groepsgrootte en verschilsterkte dat eerlijk dragen; schakel anders terug naar bredere diagnose.',
      groups: [],
    }
  }

  if (localRead.groups.length < 2) {
    return {
      status: 'no_hard_order',
      summaryTitle: 'Nog geen harde eerste lokale prioriteit',
      summaryBody:
        'Er is nu maar een beperkte veilige afdelingsuitsplitsing zichtbaar. TeamScan kan daardoor wel lokaliseren, maar nog geen betrouwbare eerste managementvolgorde tussen afdelingen claimen.',
      caution:
        'Gebruik de zichtbare afdeling als lokale verificatiehaak, maar lees dit nog niet als brede ranking, escalatielijst of definitieve prioriteitenvolgorde.',
      firstPriorityLabel: null,
      groups: localRead.groups.map((group) => buildPriorityGroup(group, 'no_hard_order', false)),
    }
  }

  const [topGroup, secondGroup] = localRead.groups
  const topQualifies =
    topGroup.avgSignal >= MIN_PRIORITY_SIGNAL || topGroup.deltaVsOrg >= MIN_PRIORITY_DELTA_VS_ORG
  const scoreGap = Number((topGroup.avgSignal - secondGroup.avgSignal).toFixed(1))
  const orgGap = Number((topGroup.deltaVsOrg - secondGroup.deltaVsOrg).toFixed(1))
  const hasHardOrder =
    topQualifies &&
    (scoreGap >= MIN_PRIORITY_DELTA ||
      orgGap >= MIN_PRIORITY_DELTA_VS_ORG ||
      (topGroup.avgSignal >= 7 && scoreGap >= 0.3))

  if (!hasHardOrder) {
    return {
      status: 'no_hard_order',
      summaryTitle: 'Veilige lokale read, maar nog geen harde volgorde',
      summaryBody:
        'De zichtbare afdelingen geven wel richting, maar liggen nu te dicht bij elkaar om een betrouwbare eerste verificatieprioriteit en heldere managementvolgorde hard aan te wijzen.',
      caution:
        'Gebruik TeamScan hier om 2 tot 3 lokale contexten te bespreken, een eigenaar te benoemen en pas na de eerste lokale check te bepalen of een hardere volgorde nodig is.',
      firstPriorityLabel: null,
      groups: localRead.groups.map((group) => buildPriorityGroup(group, 'no_hard_order', false)),
    }
  }

  const groups = localRead.groups.map((group, index) => {
    if (index === 0) return buildPriorityGroup(group, 'first_verify', true)
    if (group.avgSignal >= MIN_PRIORITY_SIGNAL || group.deltaVsOrg >= WATCH_DELTA_VS_ORG) {
      return buildPriorityGroup(group, 'watch_next', false)
    }
    return buildPriorityGroup(group, 'monitor_only', false)
  })

  return {
    status: 'ready',
    summaryTitle: 'Eerste lokale verificatieprioriteit is beschikbaar',
    summaryBody: `${topGroup.label} lijkt nu de eerste afdeling om te verifieren. ${topGroup.topFactorLabel} geeft daar het scherpste lokale spoor, terwijl het teamsignaal ${topGroup.deltaVsOrg > 0 ? `${topGroup.deltaVsOrg.toFixed(1)} punt boven` : 'ongeveer op'} organisatieniveau ligt en daarmee als eerste managementcheck logisch wordt.`,
    caution:
      'Gebruik deze prioriteit als eerste verificatierichting, niet als manageroordeel of hard oorzakelijk bewijs. Andere zichtbare afdelingen blijven relevant als watch-list en reviewcontext.',
    firstPriorityLabel: topGroup.label,
    groups,
  }
}

export function buildTeamDashboardViewModel(args: {
  signalLabelLower: string
  averageSignal: number | null
  strongWorkSignalRate: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
  hasEnoughData: boolean
  hasMinDisplay: boolean
  pendingCount: number
  factorAverages: Record<string, number>
  topExitReasonLabel?: string | null
  topContributingReasonLabel?: string | null
  signalVisibilityAverage?: number | null
}): DashboardViewModel {
  const topFactors = getTopFactors(args.factorAverages)
  const topFactorLabel = topFactors[0] ? FACTOR_LABELS[topFactors[0].factor] ?? topFactors[0].factor : 'de lokale werkcontext'
  const secondFactorLabel = topFactors[1] ? FACTOR_LABELS[topFactors[1].factor] ?? topFactors[1].factor : null
  const signalState = getSignalState(args.averageSignal)
  const topFactorBand = getPriorityBand(topFactors[0]?.signalValue ?? 5.5)
  const localDirectionText =
    typeof args.stayIntent === 'number'
      ? `De lokale richtingsvraag staat op ${args.stayIntent.toFixed(1)}/10.`
      : 'De lokale richtingsvraag wordt zichtbaar zodra er responses zijn.'
  const reviewWindow = getReviewWindow(signalState)

  if (!args.hasMinDisplay) {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [
        {
          title: 'Meetmodel',
          value: 'Compacte lokale triade',
          body: TEAM_METHOD_READ,
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Eerste lokale vraag',
        body:
          args.pendingCount > 0
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste veilige TeamScan-read op te bouwen?`
            : 'Welke extra responses en metadata zijn nog nodig voordat deze TeamScan veilig als lokale read gelezen kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body:
          args.pendingCount > 0
            ? `Stuur eerst de resterende ${args.pendingCount} respondent(en) een reminder. TeamScan wordt pas bruikbaar zodra er genoeg groepsinput is voor veilige lokale duiding.`
            : 'Gebruik deze TeamScan nog niet als lokale managementread. Bouw eerst genoeg responses op voor veilige groepsduiding.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt TeamScan vooral om te kiezen welke afdeling of lokale context eerst verificatie vraagt.',
      followThroughTitle: 'Van eerste signaal naar lokale check',
      followThroughIntro:
        'De vaste lokalisatieroute verschijnt zodra TeamScan veilig genoeg is om als lokale groepsread te gebruiken.',
      followThroughCards: [],
    }
  }

  if (!args.hasEnoughData) {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [
        {
          title: 'Meetmodel',
          value: 'Compacte lokale triade',
          body: TEAM_METHOD_READ,
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Eerste lokale vraag',
        body: `Lijkt ${topFactorLabel.toLowerCase()} nu het eerste spoor om per afdeling te toetsen, of verschuift dat beeld nog zodra de groep vollediger is?`,
        tone: 'blue',
      },
      nextStep: {
        title: 'Voorzichtig lokaliseren',
        body: `Gebruik ${topFactorLabel.toLowerCase()} alvast als eerste gesprekshaak, maar behandel TeamScan nog als indicatieve lokale read totdat minimaal 10 responses binnen zijn.`,
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik de vragen hieronder nu vooral om te bepalen welke beperkte lokale verificatie als eerste logisch is en wie die check trekt.',
      followThroughTitle: 'Van eerste signaal naar lokale check',
      followThroughIntro:
        'Bij een indicatieve TeamScan blijft de route bewust compact: kies een eerste lokale verificatievraag, eigenaar en checkmoment, maar claim nog geen vast lokaal patroon.',
      followThroughCards: [
        {
          title: 'Prioriteit nu',
          body: `${topFactorLabel} is voorlopig het eerste lokale spoor om te toetsen.`,
          tone: 'blue',
        },
        {
          title: 'Eerste eigenaar',
          body: 'HR met betrokken afdelingsleider; deze combinatie trekt de eerste lokale check en bewaakt de begrenzing.',
          tone: 'emerald',
        },
        {
          title: 'Eerste bounded check',
          body: `Gebruik een kort afdelings- of teamgesprek om te toetsen wat ${topFactorLabel.toLowerCase()} nu precies vraagt.`,
          tone: 'blue',
        },
        {
          title: 'Reviewmoment',
          body: 'Herlees deze lokale read zodra minimaal 10 responses binnen zijn of de eerste lokale check is gedaan.',
          tone: 'amber',
        },
      ],
    }
  }

  const signalRead =
    signalState === 'hoog'
      ? `Deze TeamScan laat lokaal een direct aandachtspunt zien. ${topFactorLabel} vraagt nu als eerste verificatie op afdelingsniveau.`
      : signalState === 'midden'
        ? `Deze TeamScan laat lokaal zien waar aandacht nodig is. ${topFactorLabel} verdient nu de eerste lokale managementcheck.`
        : `Deze TeamScan oogt voorlopig stabiel. Gebruik vooral ${topFactorLabel.toLowerCase()} als lokaal monitoringsspoor om te toetsen waar het beeld nog kan verscherpen.`

  const localDirection = secondFactorLabel
    ? `${topFactorLabel} en ${secondFactorLabel.toLowerCase()} vormen samen de eerste lokale verificatierichting.`
    : `${topFactorLabel} vormt de eerste lokale verificatierichting.`

  return {
    signaalbandenText: SIGNAL_BANDS_TEXT,
    topSummaryCards: [
      {
        title: 'Managementread nu',
        value:
          signalState === 'hoog'
            ? 'Direct aandachtspunt'
            : signalState === 'midden'
              ? 'Aandacht nodig'
              : 'Voorlopig stabiel',
        body: signalRead,
        tone: signalState === 'hoog' ? 'amber' : signalState === 'laag' ? 'emerald' : 'blue',
      },
      {
        title: 'Eerste beslisroute',
        value: 'Eerst verifieren, dan begrenzen',
        body: 'TeamScan helpt management kiezen waar een eerste bounded check nodig is, wie die trekt en wanneer je weer terugschakelt naar bredere diagnose.',
        tone: 'blue',
      },
      {
        title: 'Primair lokaal spoor',
        value: topFactorLabel,
        body: `${localDirection} Gebruik dit spoor als eerste bounded prioriterichting, niet als sluitend bewijs dat de oorzaak al vaststaat.`,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        value: 'HR + afdelingsleider',
        body: 'Gebruik deze TeamScan eerst voor een lokale managementhuddle met HR en de betrokken afdelingsleider, met een begrensde eerste stap, expliciete eigenaar en duidelijke reviewgrens.',
        tone: 'emerald',
      },
      {
        title: 'Reviewgrens',
        value: reviewWindow,
        body: `Leg na de eerste lokale check expliciet vast of TeamScan nog een extra lokale review verdient, of dat de vraag terug moet naar bredere diagnose. ${localDirectionText}`,
        tone: typeof args.stayIntent === 'number' && args.stayIntent < 5.5 ? 'amber' : 'blue',
      },
      {
        title: 'Meetmodel',
        value: 'Compacte lokale triade',
        body: 'Werkbeleving, actieve werkfactoren en de lokale richtingsvraag worden samen gelezen om te bepalen welke afdeling eerst verificatie vraagt.',
        tone: 'blue',
      },
      {
        title: 'Boundary',
        value: 'Veilige afdelingsread',
        body: 'Lokale uitsplitsing verschijnt alleen wanneer responses en afdelingsmetadata veilig genoeg zijn. Kleine groepen blijven onderdrukt.',
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat vraagt nu als eerste verificatie?',
        intro: `${signalRead} ${TEAM_METHOD_READ}`,
        items: [
          `${topFactorLabel} is nu het eerste lokale spoor (${topFactorBand.toLowerCase()} signaalband) om per afdeling gericht te toetsen.`,
          secondFactorLabel ? `${secondFactorLabel} blijft het tweede spoor om mee te lezen zodra de eerste bounded check is gedaan.` : 'Lees dit samen met de korte werkbelevingscheck en de lokale richtingsvraag.',
          'Gebruik deze read om te kiezen welke afdeling, welke eigenaar en welke eerste bounded check nu het meest logisch zijn.',
        ],
        tone: 'blue',
      },
      {
        title: 'Wie beslist wat nu eerst gebeurt?',
        items: [
          'HR en de betrokken afdelingsleider trekken samen de eerste lokale managementcheck; de sponsor van het bredere spoor kijkt alleen mee waar dat echt nodig is.',
          `Laat de eerste bounded stap direct aansluiten op ${topFactorLabel.toLowerCase()}, zodat prioriteit, eigenaar en eerste actie in dezelfde lijn blijven.`,
          `Leg meteen een reviewgrens vast: ${reviewWindow.toLowerCase()}.`,
        ],
        tone: 'emerald',
      },
      {
        title: 'Wanneer escaleren, wanneer stoppen?',
        items: [
          `Gebruik ${topFactorLabel.toLowerCase()} nu als eerste verificatiespoor, niet als sluitende teamoorzaak of lokale einddiagnose.`,
          'Segment Deep Dive blijft een beschrijvende add-on; TeamScan blijft een eigen lokalisatie- en verificatieroute.',
          'Zonder lokale bevestiging hoort TeamScan niet vanzelf door te groeien naar brede team-, leiderschaps- of performanceclaims.',
        ],
        tone: 'amber',
      },
      {
        title: 'Welke productgrens blijft staan?',
        items: [
          'Een lokale bounded check is pas geslaagd als eigenaar, eerste stap en reviewmoment expliciet zijn vastgelegd.',
          'Segment Deep Dive blijft een beschrijvende add-on; TeamScan blijft een eigen lokalisatie- en verificatieroute.',
          'Als de lokale onderbouwing smal blijft, kies je expliciet voor stoppen met verder lokaliseren in plaats van kunstmatig meer diepte te forceren.',
        ],
        tone: 'blue',
      },
    ],
    profileCards: [
      {
        title: 'Leeswijze',
        value: 'Lokalisatielaag',
        body: 'TeamScan is bedoeld als department-first managementhandoff: actuele lokale read, veilige uitsplitsing en een expliciete eerste verificatievraag.',
        tone: 'blue',
      },
      {
        title: 'Methodische kern',
        value: 'Werkbeleving + factoren + richting',
        body: 'De TeamScan-read rust op drie compacte bronnen tegelijk: korte werkbeleving, actieve werkfactoren en de lokale richtingsvraag.',
        tone: 'blue',
      },
      {
        title: 'Managementpatroon',
        value: 'Lokaliseren -> verifieren -> begrenzen',
        body: 'De managementwaarde zit niet in meer detail, maar in een strakke keuze: welke lokale check eerst, welke eigenaar, welke bounded stap en welk reviewmoment.',
        tone: 'emerald',
      },
    ],
    primaryQuestion: {
      title: 'Eerste managementvraag',
      body: `Welke afdeling verdient nu de eerste bounded check op ${topFactorLabel.toLowerCase()}, wie trekt die check en wanneer besluit je of TeamScan nog een tweede lokale stap verdient?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Leg eigenaar, check en review vast',
      body: `Gebruik ${topFactorLabel.toLowerCase()} als eerste lokale verificatierichting, kies daarna een begrensde eerste stap, benoem de eigenaar en leg vast dat je ${reviewWindow.toLowerCase()}.`,
      tone: signalState === 'hoog' ? 'amber' : 'emerald',
    },
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van TeamScan naar een begrensde lokale verificatieroute, eigenaar en uitvoerlaag te gaan.',
    followThroughTitle: 'Van TeamScan naar lokale verificatie',
    followThroughIntro:
      'De waarde van TeamScan zit in een snelle en begrensde lokale follow-up: eerst lokaliseren, dan verifieren, daarna expliciet kiezen of een lokale vervolgstap genoeg is of dat bredere diagnose terug nodig is.',
    followThroughCards: [
      {
        title: 'Prioriteit nu',
        body: `${topFactorLabel} is het eerste lokale spoor voor deze campaign.`,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        body: 'HR met betrokken afdelingsleider; deze combinatie trekt de eerste lokale duiding en houdt de begrenzing scherp.',
        tone: 'emerald',
      },
      {
        title: 'Eerste bounded check',
        body: `Bespreek binnen 2 weken welke afdeling op ${topFactorLabel.toLowerCase()} als eerste verificatie vraagt en welke lokale observatie je daar expliciet wilt toetsen.`,
        tone: 'blue',
      },
      {
        title: 'Eerste bounded actie',
        body: 'Kies een beperkte lokale verificatie of correctie die binnen 30 dagen zichtbaar moet worden en toetsbaar terugkomt in de review.',
        tone: 'amber',
      },
      {
        title: 'Reviewmoment',
        body: `Leg vast dat je ${reviewWindow.toLowerCase()} en dan expliciet kiest of TeamScan nog een tweede lokale stap nodig heeft.`,
        tone: 'emerald',
      },
      {
        title: 'Escalatiegrens',
        body: 'Kies daarna bewust: nog een lokale check, terug naar bredere diagnose, of stoppen met verder lokaliseren zolang de onderbouwing te smal blijft.',
        tone: 'amber',
      },
    ],
  }
}
