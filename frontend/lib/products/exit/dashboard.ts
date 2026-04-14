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
  const factorLabels = topFactors.map(({ factor }) => FACTOR_LABELS[factor] ?? factor)
  const topFactorLabel = factorLabels[0] ?? 'de topfactor'
  const topExitReasonLabel = args.topExitReasonLabel ?? 'Nog geen duidelijke hoofdreden'
  const topContributingReasonLabel = args.topContributingReasonLabel
  const visibility = describeSignalVisibility(args.signalVisibilityAverage ?? null)
  const strongSignalRate = args.strongWorkSignalRate
  const averageSignal = args.averageSignal
  const hasBroadWorkSignal = strongSignalRate !== null && strongSignalRate >= 50
  const signalPressure = averageSignal !== null && averageSignal >= 5.5

  if (!args.hasMinDisplay) {
    return {
      signaalbandenText:
        `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
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
    }
  }

  if (!args.hasEnoughData) {
    return {
      signaalbandenText:
        `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
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
            ? `Gebruik ${topFactorLabel.toLowerCase()} als eerste gesprekshaak, maar behandel deze batch nog als indicatief totdat minimaal 10 responses binnen zijn.`
            : 'Gebruik de eerste signalen om vervolgvragen te kiezen, niet om al harde managementconclusies te trekken.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik deze laag nu vooral om de juiste verificatievragen klaar te zetten voor zodra het patroon steviger wordt.',
    }
  }

  const profileCards: DashboardViewModel['profileCards'] = []
  if (signalPressure && hasBroadWorkSignal) {
    profileCards.push({
      title: 'Vertrekprofiel',
      value: 'Breed werkgerelateerd vertrekbeeld',
      body: `${topExitReasonLabel} komt relatief vaak terug en valt samen met een bredere werkfrictie. Dat maakt dit vooral bruikbaar als managementsignaal voor prioritering en gesprek.`,
      tone: 'amber',
    })
  } else if (signalPressure) {
    profileCards.push({
      title: 'Vertrekprofiel',
      value: 'Frictie zichtbaar, vertrekbeeld nog gemengd',
      body: `${topExitReasonLabel} komt terug, maar het patroon vraagt nog toetsing op teamniveau en in open antwoorden voordat je brede conclusies trekt.`,
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
      `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen welk vertrekbeeld eerst verificatie nodig heeft.`,
    topSummaryCards: [
      {
        title: 'Sterk werksignaal',
        value: strongSignalRate !== null ? `${strongSignalRate}%` : '–',
        body: 'Geeft aan welk deel van de vertrekkers antwoorden gaf die relatief sterk wijzen op beïnvloedbare werkfactoren. Gebruik dit als managementsignaal, niet als bewijs van één oorzaak.',
        tone: hasBroadWorkSignal ? 'amber' : 'blue',
      },
      {
        title: 'Meest genoemde hoofdreden',
        value: topExitReasonLabel,
        body: topContributingReasonLabel
          ? `${topContributingReasonLabel} komt daarnaast vaak mee als extra vertrekcontext. Lees hoofdreden en meespelende factor altijd samen.`
          : 'Gebruik deze hoofdreden als vertrekhaak, maar toets daarna pas welke werkfactoren er bestuurlijk echt onder liggen.',
        tone: 'blue',
      },
      {
        title: 'Eerdere signalering',
        value: typeof args.signalVisibilityAverage === 'number' ? `${args.signalVisibilityAverage.toFixed(1)}/5` : '–',
        body: visibility.body,
        tone: typeof args.signalVisibilityAverage === 'number' && args.signalVisibilityAverage < 3 ? 'amber' : 'emerald',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat voor vertrekbeeld zie je nu?',
        intro:
          factorLabels.length > 0
            ? `${topExitReasonLabel} komt het vaakst terug. De scherpste werkfactoren zitten nu vooral in ${factorLabels.join(' en ')}.`
            : `${topExitReasonLabel} komt nu het vaakst terug in deze batch.`,
        items: [
          'Lees vertrekredenen, werkfactoren en werksignaal altijd als één verhaal op groepsniveau.',
          topContributingReasonLabel
            ? `${topContributingReasonLabel} is een belangrijke meespelende factor in het vertrekverhaal.`
            : 'Gebruik meespelende factoren vooral om het vertrekverhaal verder te verfijnen.',
        ],
        tone: 'blue',
      },
      {
        title: 'Wat moet je eerst valideren?',
        items: [
          factorLabels[0]
            ? `Toets in welke teams ${factorLabels[0].toLowerCase()} het vaakst terugkomt in gesprekken of open antwoorden.`
            : 'Toets eerst in welke teams de frictie het sterkst oploopt.',
          'Controleer of het vertrekbeeld breed speelt of vooral geconcentreerd is in enkele teams, rollen of leidinggevende contexten.',
          typeof args.signalVisibilityAverage === 'number' && args.signalVisibilityAverage < 3
            ? 'Onderzoek waar signalen te laat zichtbaar werden of te lastig bespreekbaar waren.'
            : 'Onderzoek waar zichtbare signalen wel op tafel lagen, maar nog niet tijdig zijn opgepakt.',
        ],
        tone: 'amber',
      },
      {
        title: 'Welke acties zijn logisch?',
        items: [
          'Kies één managementgesprek per topfactor en maak expliciet welke hypothese je wilt toetsen.',
          'Gebruik het rapport om 30-90 dagenmaatregelen te kiezen in plaats van alleen een terugblik te geven.',
          'Leg vast welke vertrekredenen, werkfactoren en signalen je in de volgende exitbatch bewust opnieuw wilt volgen.',
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
          : `Welk deel van ${topExitReasonLabel.toLowerCase()} lijkt echt samen te vallen met ${topFactorLabel.toLowerCase()} en dus met beïnvloedbare werkfrictie?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Eerst valideren, dan verbeteren',
      body:
        typeof args.signalVisibilityAverage === 'number' && args.signalVisibilityAverage < 3
          ? `Gebruik ${topFactorLabel.toLowerCase()} en eerdere signalering als eerste gespreksspoor: waar kwam twijfel te laat boven tafel en welke 30-90 dagenactie hoort daarbij?`
          : `Gebruik ${topFactorLabel.toLowerCase()} en het werksignaal om één gericht managementgesprek te voeren en daar direct een 30-90 dagenverbeteractie aan te koppelen.`,
      tone: hasBroadWorkSignal ? 'amber' : 'emerald',
    },
    focusSectionIntro:
      'Start met vertrekduiding die zowel bestuurlijk relevant als beïnvloedbaar lijkt. Gebruik de vragen hieronder om eerst te toetsen en daarna pas te verbeteren.',
  }
}
