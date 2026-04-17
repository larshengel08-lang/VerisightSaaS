import type { ActionPlaybook, DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'
import { LEADERSHIP_ACTION_PLAYBOOKS } from './action-playbooks'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog leadershipsignaal geven alleen de scherpte van het huidige managementcontextsignaal weer. Gebruik deze banding als geaggregeerde groepshulp, niet als named leader oordeel, manager ranking of performance-indicator.'

const LOW_SIGNAL_THRESHOLD = 4.5
const HIGH_SIGNAL_THRESHOLD = 7
const LOW_DIRECTION_THRESHOLD = 5.5
const HIGH_DIRECTION_THRESHOLD = 6.5

type LeadershipManagementState =
  | 'insufficient_management_read'
  | 'stable_management_context'
  | 'attention_management_context'
  | 'high_attention_management_context'

type LeadershipReadStrength = 'insufficient' | 'indicative' | 'pattern'
type LeadershipManagementBand = 'HOOG' | 'MIDDEN' | 'LAAG'

type LeadershipInterpretation = {
  managementState: LeadershipManagementState
  managementBandOverride: LeadershipManagementBand
  managementReadValue: string
  managementReadBody: string
  managementTone: 'blue' | 'emerald' | 'amber'
  contextValue: string
  contextBody: string
  directionValue: string
  directionBody: string
  directionTone: 'blue' | 'emerald' | 'amber'
  boundaryValue: string
  boundaryBody: string
  profileValue: string
  profileBody: string
  primaryQuestionTitle: string
  primaryQuestionBody: string
  nextStepTitle: string
  nextStepBody: string
  focusSectionIntro: string
  followThroughTitle: string
  followThroughIntro: string
  priorityBody: string
  firstConversationBody: string
  ownerValue: string
  ownerBody: string
  firstActionValue: string
  firstActionBody: string
  reviewBoundaryBody: string
  escalationBoundaryBody: string
  decisionItems: string[]
  scopeItems: string[]
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

function getReadStrength(args: {
  hasMinDisplay: boolean
  hasEnoughData: boolean
}): LeadershipReadStrength {
  if (!args.hasMinDisplay) return 'insufficient'
  return args.hasEnoughData ? 'pattern' : 'indicative'
}

function getManagementState(args: {
  averageSignal: number | null
  stayIntent: number | null
  hasMinDisplay: boolean
}): LeadershipManagementState {
  if (!args.hasMinDisplay || args.averageSignal === null) return 'insufficient_management_read'

  const lowDirection = typeof args.stayIntent === 'number' && args.stayIntent < LOW_DIRECTION_THRESHOLD
  const supportiveDirection = typeof args.stayIntent === 'number' && args.stayIntent >= HIGH_DIRECTION_THRESHOLD

  if (args.averageSignal >= HIGH_SIGNAL_THRESHOLD) return 'high_attention_management_context'
  if (args.averageSignal >= 6.2 && lowDirection) return 'high_attention_management_context'
  if (args.averageSignal < LOW_SIGNAL_THRESHOLD && supportiveDirection) return 'stable_management_context'
  if (args.averageSignal < LOW_SIGNAL_THRESHOLD && !lowDirection) return 'stable_management_context'
  return 'attention_management_context'
}

function getManagementBandOverride(
  managementState: LeadershipManagementState,
): LeadershipManagementBand {
  if (managementState === 'stable_management_context') return 'LAAG'
  if (managementState === 'high_attention_management_context') return 'HOOG'
  return 'MIDDEN'
}

function getDirectionRead(args: {
  stayIntent: number | null
  managementState: LeadershipManagementState
}): Pick<LeadershipInterpretation, 'directionValue' | 'directionBody' | 'directionTone'> {
  if (typeof args.stayIntent !== 'number') {
    return {
      directionValue: 'Nog niet zichtbaar',
      directionBody: 'De managementrichtingsvraag wordt zichtbaar zodra er responses zijn.',
      directionTone: 'blue',
    }
  }

  if (args.stayIntent < LOW_DIRECTION_THRESHOLD) {
    return {
      directionValue: `${args.stayIntent.toFixed(1)}/10`,
      directionBody:
        args.managementState === 'high_attention_management_context'
          ? 'De managementrichtingsvraag versterkt dit leadershipbeeld: medewerkers ervaren hier weinig richting of werkbaarheid. Gebruik dit als extra context, niet als predictor of named leader claim.'
          : 'De managementrichtingsvraag legt extra druk op deze managementread. Gebruik dit als nuance voor een eerste verificatie, niet als losstaand bewijs.',
      directionTone: 'amber',
    }
  }

  if (args.stayIntent >= HIGH_DIRECTION_THRESHOLD) {
    return {
      directionValue: `${args.stayIntent.toFixed(1)}/10`,
      directionBody:
        args.managementState === 'stable_management_context'
          ? 'De managementrichtingsvraag ondersteunt een stabieler managementbeeld, maar bewijst geen leiderschapskwaliteit of latere performance-uitkomst.'
          : 'De managementrichtingsvraag nuanceert dit beeld in positievere richting, zonder de noodzaak van managementduiding volledig weg te nemen.',
      directionTone: args.managementState === 'stable_management_context' ? 'emerald' : 'blue',
    }
  }

  return {
    directionValue: `${args.stayIntent.toFixed(1)}/10`,
    directionBody: 'De managementrichtingsvraag leest mee als aanvullende context bij deze Leadership Scan, zonder de hoofdread zelfstandig te kantelen.',
    directionTone: 'blue',
  }
}

function getPlaybook(args: {
  topFactorKey: string | null
  managementBandOverride: LeadershipManagementBand
}): ActionPlaybook | null {
  if (args.topFactorKey === null) return null
  return (
    (LEADERSHIP_ACTION_PLAYBOOKS[args.topFactorKey]?.[
      args.managementBandOverride
    ] as ActionPlaybook | undefined) ?? null
  )
}

function buildLeadershipInterpretation(args: {
  managementState: LeadershipManagementState
  strength: LeadershipReadStrength
  topFactorKey: string | null
  topFactorLabel: string
  secondFactorLabel: string | null
  stayIntent: number | null
}): LeadershipInterpretation {
  const managementBandOverride = getManagementBandOverride(args.managementState)
  const playbook = getPlaybook({
    topFactorKey: args.topFactorKey,
    managementBandOverride,
  })
  const directionRead = getDirectionRead({
    stayIntent: args.stayIntent,
    managementState: args.managementState,
  })
  const secondFactorBody = args.secondFactorLabel
    ? `${args.secondFactorLabel.toLowerCase()} lees je mee als tweede contextlaag.`
    : 'Lees de managementrichtingsvraag mee als tweede contextlaag.'
  const contextBody =
    args.strength === 'pattern'
      ? 'Leadership Scan blijft een geaggregeerde managementsnapshot van deze campaign. Named leaders, hierarchy en 360-logica blijven buiten scope.'
      : 'Leadership Scan is vanaf 5 responses indicatief leesbaar, maar blijft methodisch voorzichtig totdat er minimaal 10 responses binnen zijn.'

  if (args.managementState === 'stable_management_context') {
    return {
      managementState: args.managementState,
      managementBandOverride,
      managementReadValue: args.strength === 'pattern' ? 'Overwegend stabiel' : 'Indicatief stabiel',
      managementReadBody:
        args.strength === 'pattern'
          ? `Deze Leadership Scan oogt overwegend stabiel. ${args.topFactorLabel} is nu vooral een borgspoor voor de eerstvolgende managementreview.`
          : `Deze Leadership Scan oogt voorlopig stabiel. ${args.topFactorLabel} is nu vooral een borgspoor, maar behandel dit nog als indicatieve managementread totdat er 10 responses zijn.`,
      managementTone: 'emerald',
      contextValue: args.strength === 'pattern' ? 'Groepsread' : 'Indicatieve groepsread',
      contextBody,
      directionValue: directionRead.directionValue,
      directionBody: directionRead.directionBody,
      directionTone: directionRead.directionTone,
      boundaryValue: 'Geen quality-claim',
      boundaryBody:
        'Gebruik dit stabiele leadershipbeeld niet als bewijs van individuele leiderschapskwaliteit, named leader kwaliteit of performance. Het blijft een group-level managementread.',
      profileValue: args.strength === 'pattern' ? 'Borggerichte managementread' : 'Indicatieve managementread',
      profileBody:
        'Leadership Scan is bedoeld als geaggregeerde managementcontext-read: compacte groepssnapshot, eerste borgspoor en expliciete boundary tegen individuele claims.',
      primaryQuestionTitle: 'Eerste borgvraag',
      primaryQuestionBody: `Wat moet er nu expliciet behouden blijven rond ${args.topFactorLabel.toLowerCase()} zodat dit stabiele managementbeeld ook in de volgende review overeind blijft?`,
      nextStepTitle: 'Beleg borging nu',
      nextStepBody:
        playbook !== null
          ? `Gebruik ${playbook.owner.toLowerCase()} om vast te leggen wat in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven.`
          : `Gebruik HR en een passende MT-sponsor om vast te leggen wat in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven.`,
      focusSectionIntro:
        'Gebruik de vragen en playbooks hieronder nu vooral om te borgen wat in de huidige managementcontext werkt, zonder daar een bredere leiderschapsclaim van te maken.',
      followThroughTitle: 'Van Leadership Scan naar borgreview',
      followThroughIntro:
        'Bij een stabiel leadershipbeeld zit de waarde in een compacte borgroute: benoem wat werkt, leg vast wie het bewaakt en spreek een bounded reviewmoment af.',
      priorityBody: `${args.topFactorLabel} is nu vooral een borgspoor voor deze managementcontext.`,
      firstConversationBody:
        playbook?.validate ??
        `Gebruik een korte managementhuddle om te bevestigen wat in ${args.topFactorLabel.toLowerCase()} nu zichtbaar werkt en behouden moet blijven.`,
      ownerValue: playbook?.owner ?? 'HR lead met MT-sponsor',
      ownerBody:
        playbook !== null
          ? `Voorgestelde eerste eigenaar: ${playbook.owner}. ${playbook.validate}`
          : `Voorgestelde eerste eigenaar: HR lead met passende MT-sponsor. Gebruik deze combinatie om te bewaken wat in ${args.topFactorLabel.toLowerCase()} nu overeind moet blijven.`,
      firstActionValue: 'Borgactie nu',
      firstActionBody:
        playbook?.actions[0] ??
        `Leg vast welke managementroutine of werkafspraak in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven.`,
      reviewBoundaryBody:
        playbook?.review ??
        'Gebruik een volgende review alleen als bounded bevestiging dat deze stabiele managementcontext overeind blijft.',
      escalationBoundaryBody:
        'Schaal niet op naar named leaders, 360 of TeamScan-logica zolang de vraag nog vooral gaat over het behouden van een stabiele managementcontext.',
      decisionItems: [
        playbook?.decision ??
          `Beslis wat in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven.`,
        secondFactorBody,
      ],
      scopeItems: [
        'Lees dit niet als named leader oordeel, manager ranking of performance-indicator.',
        'Gebruik een stabiele Leadership Scan niet als reden om managementreflectie of bounded review over te slaan.',
      ],
    }
  }

  if (args.managementState === 'high_attention_management_context') {
    return {
      managementState: args.managementState,
      managementBandOverride,
      managementReadValue: 'Scherp aandachtssignaal',
      managementReadBody:
        args.strength === 'pattern'
          ? `Deze Leadership Scan laat een scherp managementcontextsignaal zien. ${args.topFactorLabel} vraagt nu de eerste verificatie of correctie.`
          : `Deze Leadership Scan laat al een scherp managementcontextsignaal zien, maar blijft indicatief totdat er minimaal 10 responses zijn. ${args.topFactorLabel} vraagt nu wel direct de eerste managementread.`,
      managementTone: 'amber',
      contextValue: args.strength === 'pattern' ? 'Groepsread' : 'Indicatieve groepsread',
      contextBody,
      directionValue: directionRead.directionValue,
      directionBody: directionRead.directionBody,
      directionTone: directionRead.directionTone,
      boundaryValue: 'Geen named leaders',
      boundaryBody:
        'Zelfs bij een scherp attention-signaal blijft Leadership Scan group-level only. Gebruik dit niet als named leader oordeel, performanceclaim of bewijs dat causaliteit al vaststaat.',
      profileValue: args.strength === 'pattern' ? 'Corrigerende managementread' : 'Indicatieve corrigerende read',
      profileBody:
        'Leadership Scan blijft een compacte managementcontext-read: scherp genoeg voor een eerste verificatie of correctie, maar niet voor individuele claims of hierarchy-output.',
      primaryQuestionTitle: 'Eerste correctievraag',
      primaryQuestionBody: `Wat moet nu als eerste worden geverifieerd of gecorrigeerd rond ${args.topFactorLabel.toLowerCase()} zodat dit managementsignaal niet diffuus blijft?`,
      nextStepTitle: 'Beleg correctie en review',
      nextStepBody:
        playbook !== null
          ? `${playbook.owner} trekt nu dit managementspoor. ${playbook.actions[0]}`
          : `Gebruik HR en een passende MT-sponsor om nu een kleine, zichtbare correctie rond ${args.topFactorLabel.toLowerCase()} te beleggen.`,
      focusSectionIntro:
        'Gebruik de vragen en playbooks hieronder om van dit managementsignaal snel naar een kleine, zichtbare correctie met expliciete owner en bounded review te gaan.',
      followThroughTitle: 'Van Leadership Scan naar eerste managementcorrectie',
      followThroughIntro:
        'De waarde van een scherp leadershipsignaal zit hier in snelle en begrensde opvolging: eerst duiden, dan een kleine correctie, daarna bewust opnieuw toetsen.',
      priorityBody: `${args.topFactorLabel} is nu het eerste corrigerende managementspoor voor deze campaign.`,
      firstConversationBody:
        playbook?.validate ??
        `Gebruik binnen twee weken een gerichte managementhuddle om te toetsen wat ${args.topFactorLabel.toLowerCase()} nu het sterkst onder druk zet.`,
      ownerValue: playbook?.owner ?? 'HR lead met MT-sponsor',
      ownerBody:
        playbook !== null
          ? `Voorgestelde eerste eigenaar: ${playbook.owner}. ${playbook.validate}`
          : `Voorgestelde eerste eigenaar: HR lead met passende MT-sponsor. Gebruik deze combinatie om de eerste verificatie of correctie begrensd te trekken.`,
      firstActionValue: 'Correctie nu',
      firstActionBody:
        playbook?.actions[0] ??
        `Kies een beperkte, zichtbare correctie rond ${args.topFactorLabel.toLowerCase()} die binnen 30 dagen merkbaar moet worden.`,
      reviewBoundaryBody:
        playbook?.review ??
        'Gebruik een volgende review alleen als bounded vervolg nadat de eerste correctie expliciet is belegd.',
      escalationBoundaryBody:
        'Open geen named leaders, hierarchy of 360-logica zolang deze wave alleen een geaggregeerde managementread draagt.',
      decisionItems: [
        playbook?.decision ??
          `Beslis of ${args.topFactorLabel.toLowerCase()} nu eerst een kleine correctie of een gerichte verificatie vraagt.`,
        secondFactorBody,
      ],
      scopeItems: [
        'Lees dit signaal niet als named leader bewijs of prestatieoordeel.',
        'Maak van een scherp signaal nog geen TeamScan, 360 of hierarchy-uitbreiding.',
      ],
    }
  }

  return {
    managementState: args.managementState,
    managementBandOverride,
    managementReadValue: args.strength === 'pattern' ? 'Actief aandachtspunt' : 'Indicatief aandachtspunt',
    managementReadBody:
      args.strength === 'pattern'
        ? `Deze Leadership Scan is leesbaar maar gemengd. ${args.topFactorLabel} vraagt nu de eerste managementhuddle zonder dat dit al een bredere leiderschapsclaim wordt.`
        : `Deze Leadership Scan is leesbaar als eerste aandachtsspoor, maar blijft indicatief totdat er minimaal 10 responses zijn. ${args.topFactorLabel} verdient nu wel de eerste managementread.`,
    managementTone: 'blue',
    contextValue: args.strength === 'pattern' ? 'Groepsread' : 'Indicatieve groepsread',
    contextBody,
    directionValue: directionRead.directionValue,
    directionBody: directionRead.directionBody,
    directionTone: directionRead.directionTone,
    boundaryValue: 'Geen TeamScan-claim',
    boundaryBody:
      'Leadership Scan lokaliseert niet welke afdeling of leider het probleem “is”. Het blijft een geaggregeerde managementcontext-read, niet een department-first of named leader product.',
    profileValue: args.strength === 'pattern' ? 'Managementcontext-read' : 'Indicatieve managementcontext-read',
    profileBody:
      'Leadership Scan is bedoeld als compacte managementsnapshot: actuele groepsread, eerste managementspoor en een expliciet begrensde vervolgstap zonder hierarchy of named leader output.',
    primaryQuestionTitle: 'Eerste managementvraag',
    primaryQuestionBody: `Welk gesprek of welke kleine correctie rond ${args.topFactorLabel.toLowerCase()} helpt nu het meest om dit managementbeeld scherper te begrijpen of te verbeteren?`,
    nextStepTitle: 'Beleg eerste verificatie',
    nextStepBody:
      playbook !== null
        ? `${playbook.owner} trekt nu het eerste managementspoor. ${playbook.actions[0]}`
        : `Gebruik HR en een passende MT-sponsor om ${args.topFactorLabel.toLowerCase()} nu eerst begrensd te verifieren of te corrigeren.`,
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van dit gemengde leadershipbeeld naar een begrensde managementhuddle en eerste verificatie of correctie te gaan.',
    followThroughTitle: 'Van Leadership Scan naar managementhuddle',
    followThroughIntro:
      'De waarde van Leadership Scan zit hier in snelle en begrensde opvolging: eerst duiden, dan verifieren of corrigeren, en daarna expliciet kiezen of bredere diagnose logischer is.',
    priorityBody: `${args.topFactorLabel} is nu het eerste managementspoor voor deze campaign.`,
    firstConversationBody:
      playbook?.validate ??
      `Gebruik een korte managementhuddle om te toetsen wat ${args.topFactorLabel.toLowerCase()} in deze context nu precies vraagt.`,
    ownerValue: playbook?.owner ?? 'HR lead',
    ownerBody:
      playbook !== null
        ? `Voorgestelde eerste eigenaar: ${playbook.owner}. ${playbook.validate}`
        : `Voorgestelde eerste eigenaar: HR lead met passende MT-sponsor. Gebruik deze combinatie om de eerste bounded verificatie te trekken.`,
    firstActionValue: 'Begrensde actie',
    firstActionBody:
      playbook?.actions[0] ??
      `Kies een kleine, zichtbare correctie of extra verduidelijking rond ${args.topFactorLabel.toLowerCase()} die in de volgende review toetsbaar terugkomt.`,
    reviewBoundaryBody:
      playbook?.review ??
      'Gebruik een volgende review alleen als bounded vervolg nadat de eerste verificatie of correctie expliciet is belegd.',
    escalationBoundaryBody:
      'Maak deze managementread niet groter dan nodig; als de echte vraag lokalere of bredere diagnose vraagt, zeg dat expliciet in plaats van Leadership Scan te overrekken.',
    decisionItems: [
      playbook?.decision ??
        `Beslis of ${args.topFactorLabel.toLowerCase()} nu een kleine correctie vraagt of eerst gerichte verificatie in gesprekken.`,
      secondFactorBody,
    ],
    scopeItems: [
      'Lees dit niet als named leader beoordeling, manager ranking of evidence van individuele leiderschapskwaliteit.',
      'Gebruik de managementrichtingsvraag als nuance, niet als zelfstandige predictor.',
    ],
  }
}

export function buildLeadershipDashboardViewModel(args: {
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
  const topFactorKey = topFactors[0]?.factor ?? null
  const topFactorLabel = topFactors[0]
    ? FACTOR_LABELS[topFactors[0].factor] ?? topFactors[0].factor
    : 'managementcontext'
  const secondFactorLabel = topFactors[1]
    ? FACTOR_LABELS[topFactors[1].factor] ?? topFactors[1].factor
    : null
  const strength = getReadStrength({
    hasMinDisplay: args.hasMinDisplay,
    hasEnoughData: args.hasEnoughData,
  })
  const managementState = getManagementState({
    averageSignal: args.averageSignal,
    stayIntent: args.stayIntent,
    hasMinDisplay: args.hasMinDisplay,
  })

  if (strength === 'insufficient' || managementState === 'insufficient_management_read') {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [
        {
          title: 'Managementread nu',
          value: 'Nog geen veilige managementread',
          body: 'Er zijn nog te weinig responses om Leadership Scan als bruikbare groepsread te openen.',
          tone: 'amber',
        },
        {
          title: 'Boundary',
          value: 'Group-level only',
          body: 'Leadership Scan blijft in deze wave bewust op groepsniveau. Named leaders of individuele duiding blijven dicht.',
          tone: 'blue',
        },
        {
          title: 'Volgende stap',
          value: 'Respons opbouwen',
          body:
            args.pendingCount > 0
              ? `Nodig eerst de resterende ${args.pendingCount} respondent(en) uit of stuur een reminder.`
              : 'Bouw eerst genoeg responses op voor een veilige managementsnapshot.',
          tone: 'blue',
        },
      ],
      managementBlocks: [],
      profileCards: [
        {
          title: 'Leeswijze',
          value: 'Nog in opbouw',
          body: 'Leadership Scan wordt pas bruikbaar zodra er genoeg groepsinput is om managementcontext veilig te lezen.',
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Nog geen managementread',
        body:
          args.pendingCount > 0
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste veilige Leadership Scan-read te openen?`
            : 'Welke extra responses zijn nog nodig voordat deze campaign als managementread gebruikt kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body: 'Gebruik Leadership Scan nog niet als managementinput totdat er genoeg groepsresponses zijn.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt Leadership Scan vooral om te kiezen welke managementcontext eerst duiding of verificatie vraagt.',
      followThroughTitle: 'Van eerste snapshot naar managementhuddle',
      followThroughIntro:
        'De vaste managementroute verschijnt zodra Leadership Scan veilig genoeg is om als groepsread te openen.',
      followThroughCards: [],
      managementBandOverride: null,
    }
  }

  const interpretation = buildLeadershipInterpretation({
    managementState,
    strength,
    topFactorKey,
    topFactorLabel,
    secondFactorLabel,
    stayIntent: args.stayIntent,
  })

  return {
    signaalbandenText: SIGNAL_BANDS_TEXT,
    topSummaryCards: [
      {
        title: 'Managementread nu',
        value: interpretation.managementReadValue,
        body: interpretation.managementReadBody,
        tone: interpretation.managementTone,
      },
      {
        title: 'Context',
        value: interpretation.contextValue,
        body: interpretation.contextBody,
        tone: 'blue',
      },
      {
        title: 'Primair managementspoor',
        value: topFactorLabel,
        body: secondFactorLabel
          ? `${topFactorLabel} staat nu voorop; ${secondFactorLabel.toLowerCase()} lees je mee als tweede contextlaag.`
          : `${topFactorLabel} vormt nu het eerste managementspoor voor deze Leadership Scan.`,
        tone: 'blue',
      },
      {
        title: 'Richting nu',
        value: interpretation.directionValue,
        body: interpretation.directionBody,
        tone: interpretation.directionTone,
      },
      {
        title: 'Eerste eigenaar',
        value: interpretation.ownerValue,
        body: interpretation.ownerBody,
        tone: 'emerald',
      },
      {
        title: 'Eerste actie',
        value: interpretation.firstActionValue,
        body: interpretation.firstActionBody,
        tone: managementState === 'stable_management_context' ? 'emerald' : 'amber',
      },
      {
        title: 'Boundary',
        value: interpretation.boundaryValue,
        body: interpretation.boundaryBody,
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Hoe lees je dit managementbeeld nu?',
        intro: interpretation.managementReadBody,
        items: [
          managementState === 'stable_management_context'
            ? `${topFactorLabel} is nu vooral een borgspoor.`
            : `${topFactorLabel} is nu het eerste managementspoor.`,
          secondFactorLabel
            ? `${secondFactorLabel} lees je mee als tweede contextlaag.`
            : 'Lees de managementrichtingsvraag mee als tweede contextlaag.',
        ],
        tone: 'blue',
      },
      {
        title: 'Welk besluit hoort nu eerst?',
        items: interpretation.decisionItems,
        tone: managementState === 'high_attention_management_context' ? 'amber' : 'blue',
      },
      {
        title: 'Wie trekt dit en waar ligt de grens?',
        items: [
          `Eerste eigenaar: ${interpretation.ownerValue}.`,
          interpretation.reviewBoundaryBody,
          interpretation.escalationBoundaryBody,
        ],
        tone: 'emerald',
      },
      {
        title: 'Wat blijft bewust begrensd?',
        items: interpretation.scopeItems,
        tone: 'amber',
      },
    ],
    profileCards: [
      {
        title: 'Leeswijze',
        value: interpretation.profileValue,
        body: interpretation.profileBody,
        tone: 'blue',
      },
    ],
    primaryQuestion: {
      title: interpretation.primaryQuestionTitle,
      body: interpretation.primaryQuestionBody,
      tone: managementState === 'high_attention_management_context' ? 'amber' : 'blue',
    },
    nextStep: {
      title: interpretation.nextStepTitle,
      body: interpretation.nextStepBody,
      tone: managementState === 'stable_management_context' ? 'emerald' : 'amber',
    },
    focusSectionIntro: interpretation.focusSectionIntro,
    followThroughTitle: interpretation.followThroughTitle,
    followThroughIntro: interpretation.followThroughIntro,
    followThroughCards: [
      {
        title: 'Prioriteit nu',
        body: interpretation.priorityBody,
        tone: 'blue',
      },
      {
        title: 'Eerste gesprek',
        body: interpretation.firstConversationBody,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        body: interpretation.ownerBody,
        tone: 'emerald',
      },
      {
        title: 'Eerste actie',
        body: interpretation.firstActionBody,
        tone: managementState === 'stable_management_context' ? 'emerald' : 'amber',
      },
      {
        title: 'Reviewgrens',
        body: interpretation.reviewBoundaryBody,
        tone: 'emerald',
      },
      {
        title: 'Wanneer niet opschalen',
        body: interpretation.escalationBoundaryBody,
        tone: 'amber',
      },
    ],
    managementBandOverride: interpretation.managementBandOverride,
  }
}
