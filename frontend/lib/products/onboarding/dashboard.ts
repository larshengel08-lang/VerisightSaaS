import type { ActionPlaybook, DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'
import { ONBOARDING_ACTION_PLAYBOOKS } from './action-playbooks'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog onboardingsignaal geven alleen de scherpte van het huidige checkpointsignaal weer. Gebruik deze banding als vroege managementhulp op groepsniveau, niet als individuele beoordeling, performance-oordeel of bewijs van een latere onboardinguitkomst.'

const LOW_SIGNAL_THRESHOLD = 4.5
const HIGH_SIGNAL_THRESHOLD = 7
const LOW_DIRECTION_THRESHOLD = 5.5
const HIGH_DIRECTION_THRESHOLD = 6.5

type OnboardingCheckpointState =
  | 'insufficient_checkpoint'
  | 'stable_checkpoint'
  | 'attention_checkpoint'
  | 'high_attention_checkpoint'

type OnboardingCheckpointStrength = 'insufficient' | 'indicative' | 'pattern'
type OnboardingManagementBand = 'HOOG' | 'MIDDEN' | 'LAAG'

type OnboardingHandoffSupport = {
  managementBandOverride: OnboardingManagementBand
  ownerValue: string
  ownerBody: string
  firstActionValue: string
  firstActionBody: string
  reviewBoundaryBody: string
  escalationBoundaryBody: string
  conversationBody: string
  decisionBody: string
  operatorBody: string
  broaderDiagnosisBody: string
}

type OnboardingCheckpointInterpretation = {
  checkpointState: OnboardingCheckpointState
  managementBandOverride: OnboardingManagementBand
  managementReadValue: string
  managementReadBody: string
  managementTone: 'amber' | 'blue' | 'emerald'
  checkpointValue: string
  checkpointBody: string
  directionValue: string
  directionBody: string
  directionTone: 'amber' | 'blue' | 'emerald'
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
  conversationBody: string
  ownerValue: string
  ownerBody: string
  firstActionValue: string
  firstActionBody: string
  reviewBoundaryBody: string
  escalationBoundaryBody: string
  operatorBody: string
  broaderDiagnosisBody: string
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

function getCheckpointStrength(args: { hasMinDisplay: boolean; hasEnoughData: boolean }): OnboardingCheckpointStrength {
  if (!args.hasMinDisplay) return 'insufficient'
  return args.hasEnoughData ? 'pattern' : 'indicative'
}

function getCheckpointState(args: {
  averageSignal: number | null
  stayIntent: number | null
  hasMinDisplay: boolean
}): OnboardingCheckpointState {
  if (!args.hasMinDisplay || args.averageSignal === null) return 'insufficient_checkpoint'

  const lowDirection = typeof args.stayIntent === 'number' && args.stayIntent < LOW_DIRECTION_THRESHOLD
  const supportiveDirection = typeof args.stayIntent === 'number' && args.stayIntent >= HIGH_DIRECTION_THRESHOLD

  if (args.averageSignal >= HIGH_SIGNAL_THRESHOLD) return 'high_attention_checkpoint'
  if (args.averageSignal >= 6.2 && lowDirection) return 'high_attention_checkpoint'
  if (args.averageSignal < LOW_SIGNAL_THRESHOLD && supportiveDirection) return 'stable_checkpoint'
  if (args.averageSignal < LOW_SIGNAL_THRESHOLD && !lowDirection) return 'stable_checkpoint'
  return 'attention_checkpoint'
}

function getManagementBandOverride(checkpointState: OnboardingCheckpointState): OnboardingManagementBand {
  if (checkpointState === 'stable_checkpoint') return 'LAAG'
  if (checkpointState === 'high_attention_checkpoint') return 'HOOG'
  return 'MIDDEN'
}

function getDirectionRead(args: {
  stayIntent: number | null
  checkpointState: OnboardingCheckpointState
}): Pick<OnboardingCheckpointInterpretation, 'directionValue' | 'directionBody' | 'directionTone'> {
  if (typeof args.stayIntent !== 'number') {
    return {
      directionValue: 'Nog niet zichtbaar',
      directionBody: 'De checkpoint-richtingsvraag wordt zichtbaar zodra er responses zijn.',
      directionTone: 'blue',
    }
  }

  if (args.stayIntent < LOW_DIRECTION_THRESHOLD) {
    return {
      directionValue: `${args.stayIntent.toFixed(1)}/10`,
      directionBody:
        args.checkpointState === 'high_attention_checkpoint'
          ? 'De richtingsvraag versterkt dit vroege aandachtssignaal: nieuwe medewerkers ervaren in deze fase nog te weinig houvast of perspectief. Gebruik dit als extra context, niet als voorspelling.'
          : 'De richtingsvraag legt extra druk op deze landingsread. Gebruik dit als signaal voor nadere duiding, niet als losstaande voorspeller van latere uitkomst.',
      directionTone: 'amber',
    }
  }

  if (args.stayIntent >= HIGH_DIRECTION_THRESHOLD) {
    return {
      directionValue: `${args.stayIntent.toFixed(1)}/10`,
      directionBody:
        args.checkpointState === 'stable_checkpoint'
          ? 'De richtingsvraag ondersteunt een stabieler beeld van de vroege landing, maar bewijst nog geen latere onboardinguitkomst of volledige route-uitkomst.'
          : 'De richtingsvraag ondersteunt dat dit checkpoint nog niet volledig onder druk staat. Gebruik dit als nuance bij de eerste managementread, niet als vrijbrief.',
      directionTone: args.checkpointState === 'stable_checkpoint' ? 'emerald' : 'blue',
    }
  }

  return {
    directionValue: `${args.stayIntent.toFixed(1)}/10`,
    directionBody:
      'De richtingsvraag leest mee als aanvullende context bij dit checkpoint, zonder de hoofdread zelfstandig te kantelen.',
    directionTone: 'blue',
  }
}

function getPlaybookSupport(args: {
  checkpointState: OnboardingCheckpointState
  topFactorKey: string | null
  topFactorLabel: string
}): OnboardingHandoffSupport {
  const managementBandOverride = getManagementBandOverride(args.checkpointState)
  const playbook =
    args.topFactorKey !== null
      ? (ONBOARDING_ACTION_PLAYBOOKS[args.topFactorKey]?.[managementBandOverride] as ActionPlaybook | undefined) ?? null
      : null

  if (args.checkpointState === 'stable_checkpoint') {
    return {
      managementBandOverride,
      ownerValue: 'HR + onboarding-owner',
      ownerBody:
        playbook !== null
          ? `Voorgestelde eerste eigenaar: HR + onboarding-owner. Lees ${playbook.owner.toLowerCase()} mee om te toetsen wat in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven.`
          : `Voorgestelde eerste eigenaar: HR + onboarding-owner. Toets welk deel van ${args.topFactorLabel.toLowerCase()} nu expliciet behouden moet blijven voor de volgende instroomgroep.`,
      firstActionValue: 'Borgactie nu',
      firstActionBody:
        playbook !== null
          ? `Borgactie: ${playbook.actions[0]}`
          : `Borgactie: leg vast wat in ${args.topFactorLabel.toLowerCase()} nu zichtbaar werkt en welke beperkte borgactie dit tot het volgende checkpoint bewust gelijk houdt.`,
      reviewBoundaryBody:
        playbook?.review ??
        'Gebruik een later checkpoint alleen als bounded bevestiging dat deze stabiele landing overeind blijft; maak er geen automatische journeystap van.',
      escalationBoundaryBody:
        'Schaal niet automatisch op naar bredere duiding of extra productvorm zolang de vraag nog vooral gaat over het behouden van een stabiele startervaring.',
      conversationBody:
        playbook?.validate ??
        `Gebruik een korte managementhuddle om te bevestigen wat in ${args.topFactorLabel.toLowerCase()} nu al goed werkt en bewust behouden moet blijven.`,
      decisionBody:
        playbook?.decision ??
        `Beslis wat in ${args.topFactorLabel.toLowerCase()} nu expliciet behouden of bevestigd moet blijven voor het volgende checkpoint.`,
      operatorBody:
        `Leg vast wie de borgactie werkelijk uitvoert, welke signalen op het volgende checkpoint gelijk moeten blijven en wanneer HR weer actief meeleest.`,
      broaderDiagnosisBody:
        'Schaal niet op naar bredere duiding zolang de vraag nog vooral gaat over het behouden van een stabiele startervaring binnen dit checkpoint.',
    }
  }

  if (args.checkpointState === 'high_attention_checkpoint') {
    return {
      managementBandOverride,
      ownerValue: playbook?.owner ?? 'HR + leidinggevende',
      ownerBody:
        playbook !== null
          ? `Voorgestelde eerste eigenaar: ${playbook.owner}. ${playbook.validate}`
          : `Voorgestelde eerste eigenaar: HR met betrokken leidinggevende. Toets waar ${args.topFactorLabel.toLowerCase()} nu direct zichtbare steun of correctie vraagt.`,
      firstActionValue: 'Correctie nu',
      firstActionBody:
        playbook?.actions[0] ??
        `Beleg nu een kleine, zichtbare correctie rond ${args.topFactorLabel.toLowerCase()} en maak expliciet wat op het volgende checkpoint merkbaar beter moet zijn.`,
      reviewBoundaryBody:
        playbook?.review ??
        'Gebruik een later checkpoint alleen als bounded vervolgmeting nadat de eerste correctie expliciet is belegd.',
      escalationBoundaryBody:
        'Ga niet automatisch naar brede journey-, uitkomst- of performanceclaims; gebruik eerst deze managementhuddle om de eerste corrigerende stap te begrenzen.',
      conversationBody:
        playbook?.validate ??
        `Gebruik binnen twee weken een gerichte managementhuddle om te toetsen wat ${args.topFactorLabel.toLowerCase()} in deze fase het sterkst onder druk zet.`,
      decisionBody:
        playbook?.decision ??
        `Beslis of ${args.topFactorLabel.toLowerCase()} nu eerst een kleine correctie of een expliciete verificatie in gesprekken vraagt.`,
      operatorBody:
        `Leg vast wie de corrigerende stap trekt, welke zichtbare verandering voor nieuwe medewerkers merkbaar moet zijn en wanneer HR opnieuw reviewt.`,
      broaderDiagnosisBody:
        'Ga pas terug naar bredere duiding als de vraag groter blijkt dan dit checkpoint of als de eerste correctie te weinig grip geeft.',
    }
  }

  return {
    managementBandOverride,
    ownerValue: playbook?.owner ?? 'HR + leidinggevende',
    ownerBody:
      playbook !== null
        ? `Voorgestelde eerste eigenaar: ${playbook.owner}. ${playbook.validate}`
        : `Voorgestelde eerste eigenaar: HR met betrokken leidinggevende. Gebruik deze rol om ${args.topFactorLabel.toLowerCase()} nu eerst begrensd te verifieren of corrigeren.`,
    firstActionValue: 'Begrensde actie',
    firstActionBody:
      playbook?.actions[0] ??
      `Kies een kleine, zichtbare correctie of extra verduidelijking rond ${args.topFactorLabel.toLowerCase()} die op het volgende checkpoint toetsbaar terugkomt.`,
    reviewBoundaryBody:
      playbook?.review ??
      'Gebruik een volgend checkpoint alleen als bounded vervolg nadat de eerste correctie of verificatie expliciet is belegd.',
    escalationBoundaryBody:
      'Maak deze landingsread niet automatisch groter dan nodig; als de vraag eerst bredere duiding vraagt, zeg dat expliciet in plaats van onboarding te overrekken.',
    conversationBody:
      playbook?.validate ??
      `Gebruik een korte managementhuddle om te toetsen wat ${args.topFactorLabel.toLowerCase()} in deze fase nu precies vraagt.`,
    decisionBody:
      playbook?.decision ??
      `Beslis of ${args.topFactorLabel.toLowerCase()} nu een kleine correctie vraagt of eerst een gerichte verificatie in gesprekken.`,
    operatorBody:
      `Leg vast wie het eerstvolgende gesprek voorbereidt, welke kleine correctie of verificatie nu echt eigenaarschap krijgt en hoe je voorkomt dat dit checkpoint open blijft hangen.`,
    broaderDiagnosisBody:
      'Schakel terug naar bredere duiding als de vraag niet meer past binnen een enkele onboardingcorrectie of als een later checkpoint eerst geen extra duidelijkheid gaat geven.',
  }
}

function buildOnboardingInterpretation(args: {
  checkpointState: OnboardingCheckpointState
  strength: OnboardingCheckpointStrength
  topFactorKey: string | null
  topFactorLabel: string
  secondFactorLabel: string | null
  stayIntent: number | null
}): OnboardingCheckpointInterpretation {
  const directionRead = getDirectionRead({
    stayIntent: args.stayIntent,
    checkpointState: args.checkpointState,
  })
  const handoff = getPlaybookSupport({
    checkpointState: args.checkpointState,
    topFactorKey: args.topFactorKey,
    topFactorLabel: args.topFactorLabel,
  })

  const secondaryFactorText = args.secondFactorLabel
    ? `${args.secondFactorLabel.toLowerCase()} lees je mee als tweede contextlaag.`
    : 'Lees dit samen met de checkpoint-richtingsvraag als tweede contextlaag.'
  const checkpointBody =
    args.strength === 'pattern'
      ? 'Deze wave leest precies een checkpoint per campaign. Vergelijking tussen 30, 60 en 90 dagen hoort pas in latere waves.'
      : 'Dit checkpoint is vanaf 5 responses leesbaar als eerste groepsrichting, maar blijft indicatief totdat er minimaal 10 responses binnen zijn.'

  if (args.checkpointState === 'stable_checkpoint') {
    return {
      checkpointState: args.checkpointState,
      managementBandOverride: handoff.managementBandOverride,
      managementReadValue: args.strength === 'pattern' ? 'Overwegend stabiel' : 'Indicatief stabiel',
      managementReadBody:
        args.strength === 'pattern'
          ? `Dit checkpoint oogt overwegend stabiel. ${args.topFactorLabel} blijft nu het eerste borgspoor voor een expliciete managementhuddle.`
          : `Dit checkpoint oogt voorlopig overwegend stabiel. ${args.topFactorLabel} is nu vooral een borgspoor, maar behandel dit nog als eerste groepsrichting totdat er 10 responses zijn.`,
      managementTone: 'emerald',
      checkpointValue: args.strength === 'pattern' ? 'Enkel meetmoment' : 'Indicatief checkpoint',
      checkpointBody,
      directionValue: directionRead.directionValue,
      directionBody: directionRead.directionBody,
      directionTone: directionRead.directionTone,
      boundaryValue: args.strength === 'pattern' ? 'Geen journey-claim' : 'Nog geen patroonclaim',
      boundaryBody:
        'Gebruik deze landingsread als bounded checkpointlaag. Dit is geen performance-read, geen later uitkomstmodel en nog geen volledige 30-60-90 journey.',
      profileValue: args.strength === 'pattern' ? 'Stabiele landingsduiding' : 'Indicatieve landingsduiding',
      profileBody:
        'Onboarding is bedoeld als compacte managementhandoff van dit ene meetmoment: actuele groepsread, eerste borgspoor, eerste eigenaar en een expliciet begrensde review. Lees dit als single-checkpoint lifecycle triage, niet als journey-engine of client onboarding-route.',
      primaryQuestionTitle: 'Eerste borgvraag',
      primaryQuestionBody: `Wat moet er nu expliciet behouden of bevestigd worden rond ${args.topFactorLabel.toLowerCase()} zodat het volgende checkpoint dezelfde stabiele landing laat zien?`,
      nextStepTitle: 'Beleg borging nu',
      nextStepBody: `${handoff.ownerValue} bewaakt nu het borgspoor. ${handoff.firstActionBody}`,
      focusSectionIntro:
        'Gebruik de vragen en playbooks hieronder nu vooral om scherp te krijgen wat in deze vroege fase al werkt, wie dat bewaakt en welke beperkte borgactie expliciet moet blijven staan.',
      followThroughTitle: 'Route en actie',
      followThroughIntro:
        'Bij een stabiel checkpoint zit de managementwaarde in een compacte handoff: benoem wat werkt, leg de eerste eigenaar vast en spreek een bounded reviewmoment af.',
      priorityBody: `${args.topFactorLabel} is nu vooral een borgspoor voor deze landingsduiding.`,
      conversationBody: handoff.conversationBody,
      ownerValue: handoff.ownerValue,
      ownerBody: handoff.ownerBody,
      firstActionValue: handoff.firstActionValue,
      firstActionBody: handoff.firstActionBody,
      reviewBoundaryBody: handoff.reviewBoundaryBody,
      escalationBoundaryBody: handoff.escalationBoundaryBody,
      operatorBody: handoff.operatorBody,
      broaderDiagnosisBody: handoff.broaderDiagnosisBody,
      decisionItems: [
        handoff.decisionBody,
        secondaryFactorText,
      ],
      scopeItems: [
        'Lees dit checkpoint niet als individuele beoordeling of manageroordeel.',
        'Claim nog geen volledige 30-60-90 route of latere onboardinguitkomst.',
      ],
    }
  }

  if (args.checkpointState === 'high_attention_checkpoint') {
    return {
      checkpointState: args.checkpointState,
      managementBandOverride: handoff.managementBandOverride,
      managementReadValue: 'Scherp vroegsignaal',
      managementReadBody:
        args.strength === 'pattern'
          ? `Dit checkpoint laat een scherp vroeg aandachtssignaal zien. ${args.topFactorLabel} vraagt nu een expliciete eerste managementhuddle, eigenaar en kleine correctie.`
          : `Dit checkpoint laat al een scherp vroeg aandachtssignaal zien, maar blijft nog indicatief totdat er minimaal 10 responses zijn. ${args.topFactorLabel} vraagt nu wel direct de eerste managementread.`,
      managementTone: 'amber',
      checkpointValue: args.strength === 'pattern' ? 'Enkel meetmoment' : 'Indicatief checkpoint',
      checkpointBody,
      directionValue: directionRead.directionValue,
      directionBody: directionRead.directionBody,
      directionTone: directionRead.directionTone,
      boundaryValue: args.strength === 'pattern' ? 'Geen predictorclaim' : 'Nog geen patroonclaim',
      boundaryBody:
        'Zelfs bij een scherp vroegsignaal blijft onboarding een managementread van vroege landing op groepsniveau. Gebruik dit niet als individuele benchmark, geen individuele voorspelling, performance-oordeel of complete journey-read.',
      profileValue: args.strength === 'pattern' ? 'Vroege landingsduiding' : 'Indicatieve landingsduiding',
      profileBody:
        'Onboarding blijft een vroege managementread van dit ene meetmoment: scherp genoeg voor een eerste corrigerende stap, maar nog geen journey-engine, client onboarding-route of later uitkomstmodel.',
      primaryQuestionTitle: 'Eerste correctievraag',
      primaryQuestionBody: `Wat moet er nu als eerste gecorrigeerd of expliciet geverifieerd worden rond ${args.topFactorLabel.toLowerCase()} zodat dit aandachtsspoor niet doorschuift naar het volgende checkpoint?`,
      nextStepTitle: 'Beleg correctie en review',
      nextStepBody: `${handoff.ownerValue} trekt nu het checkpointspoor. ${handoff.firstActionBody}`,
      focusSectionIntro:
        'Gebruik de vragen en playbooks hieronder om van dit vroege aandachtssignaal snel naar een kleine, zichtbare correctie met expliciete eigenaar en bounded review te gaan.',
      followThroughTitle: 'Route en actie',
      followThroughIntro:
        'De waarde van een scherp checkpoint zit hier in snelle begrensde opvolging: eerst duiden, dan een kleine zichtbare correctie, en pas daarna bewust opnieuw meten.',
      priorityBody: `${args.topFactorLabel} is nu het eerste corrigerende werkspoor voor dit checkpoint.`,
      conversationBody: handoff.conversationBody,
      ownerValue: handoff.ownerValue,
      ownerBody: handoff.ownerBody,
      firstActionValue: handoff.firstActionValue,
      firstActionBody: handoff.firstActionBody,
      reviewBoundaryBody: handoff.reviewBoundaryBody,
      escalationBoundaryBody: handoff.escalationBoundaryBody,
      operatorBody: handoff.operatorBody,
      broaderDiagnosisBody: handoff.broaderDiagnosisBody,
      decisionItems: [
        handoff.decisionBody,
        secondaryFactorText,
      ],
      scopeItems: [
        'Lees dit signaal niet als bewijs van latere uitstroom of persoonlijk falen.',
        'Gebruik een later checkpoint pas nadat de eerste correctie expliciet is belegd.',
      ],
    }
  }

  return {
    checkpointState: args.checkpointState,
    managementBandOverride: handoff.managementBandOverride,
    managementReadValue: args.strength === 'pattern' ? 'Gemengd aandachtspunt' : 'Indicatief aandachtspunt',
    managementReadBody:
      args.strength === 'pattern'
        ? `Dit checkpoint is leesbaar maar gemengd. ${args.topFactorLabel} vraagt nu de eerste managementhuddle, zonder dat dit al een bredere journeyclaim wordt.`
        : `Dit checkpoint is al leesbaar als eerste aandachtsspoor, maar blijft nog indicatief totdat er minimaal 10 responses zijn. ${args.topFactorLabel} verdient nu wel de eerste managementread.`,
    managementTone: 'blue',
    checkpointValue: args.strength === 'pattern' ? 'Enkel meetmoment' : 'Indicatief checkpoint',
    checkpointBody,
    directionValue: directionRead.directionValue,
    directionBody: directionRead.directionBody,
    directionTone: directionRead.directionTone,
    boundaryValue: args.strength === 'pattern' ? 'Geen journey-claim' : 'Nog geen patroonclaim',
    boundaryBody:
      'Gebruik deze landingsread als begrensde checkpointlaag. Dit is geen performance-instrument, geen later uitkomstmodel en nog geen volledige 30-60-90 journey.',
    profileValue: args.strength === 'pattern' ? 'Vroege landingsduiding' : 'Indicatieve landingsduiding',
    profileBody:
      'Onboarding is bedoeld als compacte managementread van dit ene meetmoment: actuele groepsread, eerste werkspoor, eerste eigenaar en een expliciet begrensde volgende check. Lees dit als single-checkpoint lifecycle triage, niet als journey-engine of client onboarding-route.',
    primaryQuestionTitle: 'Eerste managementvraag',
    primaryQuestionBody: `Welk beperkt gesprek of welke kleine correctie rond ${args.topFactorLabel.toLowerCase()} helpt nu het meest om dit checkpoint op een volgend meetmoment scherper te begrijpen of te verbeteren?`,
    nextStepTitle: 'Beleg eerste checkpointactie',
    nextStepBody: `${handoff.ownerValue} trekt nu het checkpointspoor. ${handoff.firstActionBody}`,
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van een gemengd checkpoint direct naar een beperkte maar expliciete correctie- of verificatierichting met owner en reviewgrens te gaan.',
    followThroughTitle: 'Route en actie',
    followThroughIntro:
      'De waarde van onboarding zit hier in een snelle en begrensde follow-up: eerst duiden, dan een kleine correctie, dan bewust op een later checkpoint opnieuw kijken.',
    priorityBody: `${args.topFactorLabel} is nu het eerste werkspoor voor deze landingsduiding.`,
    conversationBody: handoff.conversationBody,
    ownerValue: handoff.ownerValue,
    ownerBody: handoff.ownerBody,
    firstActionValue: handoff.firstActionValue,
    firstActionBody: handoff.firstActionBody,
    reviewBoundaryBody: handoff.reviewBoundaryBody,
    escalationBoundaryBody: handoff.escalationBoundaryBody,
    operatorBody: handoff.operatorBody,
    broaderDiagnosisBody: handoff.broaderDiagnosisBody,
    decisionItems: [
      handoff.decisionBody,
      secondaryFactorText,
    ],
    scopeItems: [
      'Lees dit checkpoint niet als volledige 30-60-90 route of latere onboardinguitkomst.',
      'Gebruik de richtingsvraag als nuance, niet als zelfstandige predictor.',
    ],
  }
}

export function buildOnboardingDashboardViewModel(args: {
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
  const topFactorLabel = topFactors[0] ? FACTOR_LABELS[topFactors[0].factor] ?? topFactors[0].factor : 'de vroege werkcontext'
  const secondFactorLabel = topFactors[1] ? FACTOR_LABELS[topFactors[1].factor] ?? topFactors[1].factor : null
  const strength = getCheckpointStrength({
    hasMinDisplay: args.hasMinDisplay,
    hasEnoughData: args.hasEnoughData,
  })
  const checkpointState = getCheckpointState({
    averageSignal: args.averageSignal,
    stayIntent: args.stayIntent,
    hasMinDisplay: args.hasMinDisplay,
  })

  if (strength === 'insufficient' || checkpointState === 'insufficient_checkpoint') {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [
        {
          title: 'Wat speelt nu',
          value: 'Nog geen veilige managementread',
          body: 'Er zijn nog te weinig responses om dit onboardingcheckpoint als bruikbare groepsread te openen.',
          tone: 'amber',
        },
        {
          title: 'Waarom telt dit nu',
          value: 'Te weinig responses',
          body: 'Vanaf 5 responses ontstaat een eerste indicatieve managementread. Tot die tijd blijft onboarding vooral een responsopbouwfase.',
          tone: 'blue',
        },
        {
          title: 'Leesgrens',
          value: 'Nog geen groepsread',
          body: 'Gebruik dit nog niet als managementread, journeyclaim of individuele beoordeling van nieuwe medewerkers.',
          tone: 'blue',
        },
      ],
      managementBlocks: [],
      profileCards: [
        {
          title: 'Leeswijze',
          value: 'Respons opbouwen',
          body: 'Onboarding is pas leesbaar zodra er genoeg groepsinput is om dit checkpoint veilig als managementread te openen.',
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Nog geen veilige managementread',
        body:
          args.pendingCount > 0
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste veilige onboarding-managementread te kunnen openen?`
            : 'Welke extra responses zijn nog nodig voordat dit checkpoint veilig als groepsread gebruikt kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body:
          args.pendingCount > 0
            ? `Stuur eerst de resterende ${args.pendingCount} respondent(en) een reminder. Onboarding wordt pas bruikbaar zodra er genoeg groepsinput is.`
            : 'Gebruik dit checkpoint nog niet als managementread. Bouw eerst genoeg responses op voor veilige groepsduiding.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt onboarding vooral om sneller te kiezen welke vroege succes- of frictiefactor nu de eerste managementvraag vraagt.',
      followThroughTitle: 'Route en actie',
      followThroughIntro:
        'De vaste onboardingroute verschijnt zodra dit checkpoint veilig genoeg is om als managementread te openen.',
      followThroughCards: [],
      managementBandOverride: null,
    }
  }

  const interpretation = buildOnboardingInterpretation({
    checkpointState,
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
        title: 'Wat speelt nu',
        value: interpretation.managementReadValue,
        body: interpretation.managementReadBody,
        tone: interpretation.managementTone,
      },
      {
        title: 'Waarom telt dit nu',
        value: interpretation.checkpointValue,
        body: interpretation.checkpointBody,
        tone: 'blue',
      },
      {
        title: 'Eerste werkspoor',
        value: topFactorLabel,
        body: secondFactorLabel
          ? `${topFactorLabel} staat nu voorop; ${secondFactorLabel.toLowerCase()} lees je mee als tweede contextlaag.`
          : `${topFactorLabel} vormt nu het eerste spoor voor deze landingsduiding.`,
        tone: 'blue',
      },
      {
        title: 'Richting in deze fase',
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
        title: 'Eerste stap',
        value: interpretation.firstActionValue,
        body: interpretation.firstActionBody,
        tone: checkpointState === 'stable_checkpoint' ? 'emerald' : 'amber',
      },
      {
        title: 'Leesgrens',
        value: interpretation.boundaryValue,
        body: interpretation.boundaryBody,
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Signaalinterpretatie',
        intro: interpretation.managementReadBody,
        items: [
          checkpointState === 'stable_checkpoint'
            ? `${topFactorLabel} is nu vooral het eerste borgspoor.`
            : `${topFactorLabel} is nu het eerste werkspoor.`,
          secondFactorLabel
            ? `${secondFactorLabel} lees je mee als tweede contextlaag.`
            : 'Lees de checkpoint-richtingsvraag mee als tweede contextlaag.',
        ],
        tone: 'blue',
      },
      {
        title: 'Bestuurlijke weging',
        items: interpretation.decisionItems,
        tone: checkpointState === 'high_attention_checkpoint' ? 'amber' : 'blue',
      },
      {
        title: 'Owner, actie en review',
        items: [
          `Eerste eigenaar: ${interpretation.ownerValue}.`,
          interpretation.operatorBody,
          interpretation.reviewBoundaryBody,
        ],
        tone: 'emerald',
      },
      {
        title: 'Leesgrens en opschaling',
        items: [
          interpretation.escalationBoundaryBody,
          interpretation.broaderDiagnosisBody,
        ],
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
      {
        title: 'Handoffvorm',
        value: 'Bestuurlijke handoff',
        body: 'Deze route is pas een volwassen managementinstrument als landingsduiding, eerste eigenaar, eerste stap en reviewgrens als één bestuurlijke handoff worden gelezen.',
        tone: checkpointState === 'stable_checkpoint' ? 'emerald' : 'blue',
      },
    ],
    primaryQuestion: {
      title: interpretation.primaryQuestionTitle,
      body: interpretation.primaryQuestionBody,
      tone: checkpointState === 'high_attention_checkpoint' ? 'amber' : 'blue',
    },
    nextStep: {
      title: interpretation.nextStepTitle,
      body: interpretation.nextStepBody,
      tone: checkpointState === 'stable_checkpoint' ? 'emerald' : 'amber',
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
        body: interpretation.conversationBody,
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
        tone: checkpointState === 'stable_checkpoint' ? 'emerald' : 'amber',
      },
      {
        title: 'Reviewgrens',
        body: interpretation.reviewBoundaryBody,
        tone: 'emerald',
      },
      {
        title: 'Wanneer terug naar bredere duiding',
        body: interpretation.broaderDiagnosisBody,
        tone: 'amber',
      },
    ],
    managementBandOverride: interpretation.managementBandOverride,
  }
}
