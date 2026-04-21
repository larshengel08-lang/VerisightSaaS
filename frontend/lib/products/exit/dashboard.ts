import { EXIT_ACTION_PLAYBOOKS } from '@/lib/products/exit/action-playbooks'
import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

function getTopFactors(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .map(([factor, score]) => ({
      factor,
      score,
      signalValue: 11 - score,
    }))
    .sort((a, b) => b.signalValue - a.signalValue)
    .slice(0, 2)
}

function describeSignalVisibility(score: number | null) {
  if (score === null) {
    return {
      label: 'Nog geen signaal',
      body: 'Zodra antwoorden binnen zijn laat ExitScan zien of twijfels vooraf zichtbaar of bespreekbaar waren.',
    }
  }

  if (score >= 4) {
    return {
      label: 'Signalen waren zichtbaar',
      body: 'Vertrek kwam niet volledig uit de lucht vallen. Toets vooral waar signalen wel op tafel lagen, maar te weinig zijn opgepakt.',
    }
  }

  if (score >= 3) {
    return {
      label: 'Signalen waren deels zichtbaar',
      body: 'Er waren aanwijzingen, maar nog geen scherp of breed gesprek. Gebruik dit om te bepalen waar opvolging tussen wal en schip viel.',
    }
  }

  return {
    label: 'Signalen bleven onder de radar',
    body: 'Twijfel of vertrek was vooraf beperkt zichtbaar. Gebruik dit om te onderzoeken waar het gesprek te laat of niet veilig genoeg op gang kwam.',
  }
}

function getLeadingPlaybook(factor: string | null, signalValue: number | null) {
  if (!factor || signalValue === null) return null
  const band = signalValue >= 7 ? 'HOOG' : signalValue >= 4.5 ? 'MIDDEN' : 'LAAG'
  return EXIT_ACTION_PLAYBOOKS[factor]?.[band] ?? null
}

function getExitReviewMoment(topFactorLabel: string, signalVisibilityAverage: number | null | undefined) {
  if (typeof signalVisibilityAverage === 'number' && signalVisibilityAverage < 3) {
    return `Plan binnen 6-8 weken een MT-review op ${topFactorLabel.toLowerCase()}, eerdere signalering en de eerste verbeteractie.`
  }
  return `Plan binnen 60-90 dagen een MT-review om te toetsen of ${topFactorLabel.toLowerCase()} minder terugkomt in gesprekken, signalen en de volgende exitbatch.`
}

export function buildExitDashboardViewModel(args: {
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
  const leadFactor = topFactors[0] ?? null
  const factorLabels = topFactors.map(({ factor }) => FACTOR_LABELS[factor] ?? factor)
  const topFactorLabel = factorLabels[0] ?? 'de topfactor'
  const topExitReasonLabel = args.topExitReasonLabel ?? 'Nog geen duidelijke hoofdreden'
  const topContributingReasonLabel = args.topContributingReasonLabel
  const visibility = describeSignalVisibility(args.signalVisibilityAverage ?? null)
  const strongSignalRate = args.strongWorkSignalRate
  const averageSignal = args.averageSignal
  const hasBroadWorkSignal = strongSignalRate !== null && strongSignalRate >= 50
  const signalPressure = averageSignal !== null && averageSignal >= 5.5
  const leadingPlaybook = getLeadingPlaybook(leadFactor?.factor ?? null, leadFactor?.signalValue ?? null)
  const firstDecision =
    leadingPlaybook?.decision ??
    `Kies eerst of ${topFactorLabel.toLowerCase()} vooral een teamspoor, leidinggevend spoor of breder managementthema is.`
  const firstOwner = leadingPlaybook?.owner ?? 'HR business partner met betrokken leidinggevende'
  const firstAction =
    leadingPlaybook?.actions[0] ??
    `Vertaal ${topFactorLabel.toLowerCase()} binnen 30 dagen naar een eerste gerichte verbeteractie met duidelijke eigenaar.`
  const firstConversation = `Voer eerst een managementgesprek over hoe ${topFactorLabel.toLowerCase()} terugkomt in vertrekduiding, teamcontext en eerdere signalering.`
  const participants =
    'HR, betrokken leidinggevende en sponsor of MT-lid dat het eerste managementspoor moet wegen.'
  const reviewMoment = getExitReviewMoment(topFactorLabel, args.signalVisibilityAverage)
  const boardroomRelevance = hasBroadWorkSignal
    ? `Een breed werksignaal rond ${topFactorLabel.toLowerCase()} maakt dit relevant voor sponsor, MT en directie: hier zit beinvloedbare organisatiefrictie die je niet alleen als HR-nazorg wilt lezen.`
    : `Ook zonder breed werksignaal is ${topFactorLabel.toLowerCase()} scherp genoeg om bestuurlijk te wegen welk spoor nu eerst verificatie en eigenaarschap vraagt.`
  const boardroomWatchout =
    'Gebruik ExitScan om sneller te wegen welk managementspoor eerst telt, niet om achteraf de ene oorzaak van vertrek te bewijzen of een ROI-garantie te suggereren.'

  if (!args.hasMinDisplay) {
    return {
      signaalbandenText:
        `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR, sponsor en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [],
      primaryQuestion: {
        title: 'Eerste managementvraag',
        body:
          args.pendingCount > 0
            ? `Welke respondenten ontbreken nog om een eerste veilig vertrekbeeld op te bouwen? Met minder dan 5 responses blijft ExitScan bewust terughoudend.`
            : 'Welke extra responses zijn nog nodig voordat vertrekduiding veilig op groepsniveau kan worden gelezen?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body:
          args.pendingCount > 0
            ? `Stuur eerst de resterende ${args.pendingCount} respondent(en) een reminder of uitnodiging. Daarna kan ExitScan pas verschuiven van operationele monitoring naar vertrekduiding.`
            : 'Gebruik deze campagne nog niet als managementinput. Bouw eerst voldoende responses op voor veilige groepsduiding.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik focusvragen pas nadat er genoeg responses zijn om vertrekpatronen als groepsbeeld te lezen.',
      followThroughTitle: 'Van rapport naar managementactie',
      followThroughIntro:
        'De vaste vervolgrouting verschijnt zodra er genoeg responses zijn om vertrekduiding veilig als managementinput te gebruiken.',
      followThroughCards: [],
    }
  }

  if (!args.hasEnoughData) {
    return {
      signaalbandenText:
        `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR, sponsor en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [],
      primaryQuestion: {
        title: 'Eerste managementvraag',
        body:
          factorLabels.length > 0
            ? `Lijkt ${topFactorLabel.toLowerCase()} al het eerste vertrekhaakje, of verschuift dat beeld nog zodra meer responses binnenkomen?`
            : 'Welk vertrekbeeld tekent zich voorzichtig af, zonder het nu al als vast patroon te behandelen?',
        tone: 'blue',
      },
      nextStep: {
        title: 'Voorzichtig duiden',
        body:
          factorLabels.length > 0
            ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste gesprekshaak, maar behandel deze batch nog als indicatief totdat minimaal 10 responses binnen zijn en je een eerste eigenaar kunt beleggen.`
            : 'Gebruik de eerste signalen om vervolgvragen te kiezen, niet om al harde managementconclusies te trekken.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik deze laag nu vooral om de juiste verificatievragen klaar te zetten voor zodra het patroon steviger wordt.',
      followThroughTitle: 'Van rapport naar managementactie',
      followThroughIntro:
        'Bij een indicatief beeld blijft deze route nog bewust compact: bereid wel al het eerste gesprek, de eerste eigenaar en het reviewmoment voor.',
      followThroughCards: [
        {
          title: 'Prioriteit nu',
          body: `Gebruik ${topFactorLabel.toLowerCase()} voorlopig als eerste vertrekspoor, maar behandel de uitkomst nog als indicatief.`,
          tone: 'blue',
        },
        {
          title: 'Eerste gesprek',
          body: `Voer een beperkt verificatiegesprek over ${topFactorLabel.toLowerCase()} en wacht met brede conclusies tot het patroon steviger is.`,
          tone: 'blue',
        },
        {
          title: 'Wie moet aan tafel',
          body: 'HR en de meest betrokken leidinggevende; sponsor of MT sluit aan zodra het patroon steviger wordt.',
          tone: 'amber',
        },
        {
          title: 'Eerste eigenaar',
          body: firstOwner,
          tone: 'emerald',
        },
        {
          title: 'Eerste actie',
          body: 'Kies nog geen breed programma; bereid alleen de eerste gerichte verbeteractie of verificatiestap voor.',
          tone: 'amber',
        },
        {
          title: 'Reviewmoment',
          body: 'Herlees deze route zodra minimaal 10 responses binnen zijn en leg dan pas het vaste 60-90 dagen reviewmoment vast.',
          tone: 'emerald',
        },
      ],
    }
  }

  const profileCards: DashboardViewModel['profileCards'] = []
  if (signalPressure && hasBroadWorkSignal) {
    profileCards.push({
      title: 'Vertrekprofiel',
      value: 'Breed werkgerelateerd vertrekbeeld',
      body: `De Frictiescore opent hier met een breed werkgerelateerd vertrekbeeld. ${topExitReasonLabel} komt relatief vaak terug en werkfrictie helpt duiden waar management eerst moet prioriteren en doorvragen.`,
      tone: 'amber',
    })
  } else if (signalPressure) {
    profileCards.push({
      title: 'Vertrekprofiel',
      value: 'Frictie zichtbaar, vertrekbeeld nog gemengd',
      body: `De Frictiescore laat al frictie zien. ${topExitReasonLabel} komt terug, maar werkfrictie vraagt nog toetsing op teamniveau en in open antwoorden voordat je brede conclusies trekt.`,
      tone: 'blue',
    })
  } else {
    profileCards.push({
      title: 'Vertrekprofiel',
      value: 'Beperkter werksignaal',
      body: 'De gemiddelde exitfrictie blijft relatief beperkt. Kijk vooral of enkele factoren, teams of vertrekredenen toch duidelijk afwijken.',
      tone: 'emerald',
    })
  }

  profileCards.push({
    title: 'Eerdere signalering',
    value: visibility.label,
    body: visibility.body,
    tone: typeof args.signalVisibilityAverage === 'number' && args.signalVisibilityAverage < 3 ? 'amber' : 'blue',
  })

  return {
    signaalbandenText:
      `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR, sponsor en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
    topSummaryCards: [
      {
        title: 'Frictiescore nu',
        value: averageSignal !== null ? `${averageSignal.toFixed(1)}/10` : '-',
        body: topContributingReasonLabel
          ? `Frictiescore opent dit vertrekbeeld. ${topContributingReasonLabel} kleurt mee, terwijl werkfrictie helpt duiden welke laag er bestuurlijk onder ligt.`
          : 'Frictiescore opent dit vertrekbeeld. Gebruik werkfrictie daarna als verklarende laag om te toetsen welke factoren er bestuurlijk onder liggen.',
        tone: hasBroadWorkSignal ? 'amber' : 'blue',
      },
      {
        title: 'Waarom telt dit nu',
        value: strongSignalRate !== null ? `${strongSignalRate}% werksignaal` : 'Bestuurlijke relevantie',
        body: boardroomRelevance,
        tone: 'blue',
      },
      {
        title: 'Eerste besluit',
        value: topFactorLabel,
        body: firstDecision,
        tone: 'amber',
      },
      {
        title: 'Eerste eigenaar',
        value: firstOwner,
        body: 'Beleg direct wie het eerste verificatiespoor trekt, zodat vertrekduiding niet blijft hangen in alleen analyse of gesprek.',
        tone: 'emerald',
      },
      {
        title: 'Wat niet concluderen',
        value: 'Geen diagnose',
        body: boardroomWatchout,
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat speelt nu?',
        intro:
          factorLabels.length > 0
            ? `${topExitReasonLabel} komt het vaakst terug. De scherpste werkfactoren zitten nu vooral in ${factorLabels.join(' en ')}.`
            : `${topExitReasonLabel} komt nu het vaakst terug in deze batch.`,
        items: [
          'Open met Frictiescore en lees werkfrictie daarna als verklarende laag in het verhaal op groepsniveau.',
          topContributingReasonLabel
            ? `${topContributingReasonLabel} is een belangrijke meespelende factor in het vertrekverhaal.`
            : 'Gebruik meespelende factoren vooral om het vertrekverhaal verder te verfijnen.',
        ],
        tone: 'blue',
      },
      {
        title: 'Welk besluit hoort nu eerst?',
        items: [
          firstDecision,
          factorLabels[0]
            ? `Toets daarna in welke teams ${factorLabels[0].toLowerCase()} het vaakst terugkomt in gesprekken of open antwoorden.`
            : 'Toets daarna in welke teams de frictie het sterkst oploopt.',
          'Beperk de eerste ronde tot een gekozen managementspoor in plaats van meerdere brede verbeteragenda’s.',
        ],
        tone: 'amber',
      },
      {
        title: 'Wie trekt dit spoor en wat gebeurt er nu?',
        items: [
          `Eerste eigenaar: ${firstOwner}.`,
          firstAction,
          'Leg vast welk signaal, welke hypothese en welke 30-90 dagenactie je in de volgende exitbatch bewust opnieuw wilt volgen.',
        ],
        tone: 'emerald',
      },
    ],
    profileCards: profileCards.slice(0, 2),
    primaryQuestion: {
      title: 'Eerste managementvraag',
      body:
        topContributingReasonLabel
          ? `Wijst ${topExitReasonLabel.toLowerCase()} vooral op een breed werkgerelateerd vertrekbeeld, of maakt ${topContributingReasonLabel.toLowerCase()} duidelijk waar management eerst dieper moet toetsen?`
          : `Welk deel van ${topExitReasonLabel.toLowerCase()} lijkt echt samen te vallen met ${topFactorLabel.toLowerCase()} en dus met beinvloedbare werkfrictie?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Eerst valideren, dan verbeteren',
      body:
        typeof args.signalVisibilityAverage === 'number' && args.signalVisibilityAverage < 3
          ? `Gebruik Frictiescore als openingssignaal, toets via ${topFactorLabel.toLowerCase()} en eerdere signalering waar werkfrictie het sterkst meespeelt, beleg ${firstOwner.toLowerCase()} als eigenaar en kies daarna direct welke 30-90 dagenactie eerst telt.`
          : `Gebruik Frictiescore als openingssignaal en ${topFactorLabel.toLowerCase()} als eerste werkfrictiespoor om een gericht managementgesprek te voeren, ${firstOwner.toLowerCase()} als eerste eigenaar te beleggen en direct de eerste 30-90 dagenverbeteractie te kiezen.`,
      tone: hasBroadWorkSignal ? 'amber' : 'emerald',
    },
    focusSectionIntro:
      'Start met vertrekduiding die zowel bestuurlijk relevant als beinvloedbaar lijkt. Gebruik de vragen en routes hieronder om eerst te toetsen, daarna te kiezen en vervolgens expliciet te beleggen.',
    followThroughTitle: 'Van vertrekduiding naar managementactie',
    followThroughIntro:
      'Gebruik deze route om het rapport niet als eindpunt te lezen, maar als start van een eerste managementsessie met expliciete keuze, eigenaar, actie en reviewmoment.',
    followThroughCards: [
      {
        title: 'Prioriteit nu',
        body: `${topFactorLabel} is nu het eerste vertrekspoor om bestuurlijk te wegen.`,
        tone: 'blue',
      },
      {
        title: 'Eerste gesprek',
        body: firstConversation,
        tone: 'blue',
      },
      {
        title: 'Wie moet aan tafel',
        body: participants,
        tone: 'amber',
      },
      {
        title: 'Eerste eigenaar',
        body: firstOwner,
        tone: 'emerald',
      },
      {
        title: 'Eerste actie',
        body: firstAction,
        tone: 'amber',
      },
      {
        title: 'Reviewmoment',
        body: reviewMoment,
        tone: 'emerald',
      },
    ],
  }
}
