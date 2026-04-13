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

export function buildExitDashboardViewModel(args: {
  signalLabelLower: string
  averageSignal: number | null
  strongWorkSignalRate: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
  hasEnoughData: boolean
  factorAverages: Record<string, number>
}): DashboardViewModel {
  if (!args.hasEnoughData) {
    return {
      signaalbandenText:
        `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen wat eerst besproken of gevalideerd moet worden.`,
      supplementalCards: [],
      managementBlocks: [],
      profileCards: [],
    }
  }

  const topFactors = getTopFactors(args.factorAverages)
  const factorLabels = topFactors.map(({ factor }) => FACTOR_LABELS[factor] ?? factor)
  const strongSignalRate = args.strongWorkSignalRate
  const averageSignal = args.averageSignal
  const hasBroadWorkSignal = strongSignalRate !== null && strongSignalRate >= 50
  const signalPressure = averageSignal !== null && averageSignal >= 5.5

  const profileCards: DashboardViewModel['profileCards'] = []
  if (signalPressure && hasBroadWorkSignal) {
    profileCards.push({
      title: 'Exit-profiel',
      value: 'Breed beïnvloedbaar patroon',
      body: 'Vertrek lijkt niet alleen incidentgedreven. De combinatie van hogere frictie en sterk werksignaal wijst op werkfactoren die management actief kan beïnvloeden.',
      tone: 'amber',
    })
  } else if (signalPressure) {
    profileCards.push({
      title: 'Exit-profiel',
      value: 'Frictie zichtbaar, oorzaak nog gemengd',
      body: 'Er is duidelijke frictie, maar het beeld vraagt nog toetsing op teamniveau en in open antwoorden voordat je brede conclusies trekt.',
      tone: 'blue',
    })
  } else {
    profileCards.push({
      title: 'Exit-profiel',
      value: 'Relatief beperkt werksignaal',
      body: 'De gemiddelde exitfrictie blijft relatief beperkt. Kijk vooral of enkele factoren of teams nog wel duidelijk afwijken.',
      tone: 'emerald',
    })
  }

  return {
    signaalbandenText:
      `Laag, midden en hoog laten zien hoeveel aandacht een ${args.signalLabelLower} vraagt. Ze helpen HR en MT bepalen wat eerst besproken of gevalideerd moet worden.`,
    supplementalCards: [
      {
        title: 'Sterk werksignaal',
        value: strongSignalRate !== null ? `${strongSignalRate}%` : '–',
        body: 'Geeft aan welk deel van de vertrekkers vooral antwoorden gaf die wijzen op beïnvloedbare werkfactoren. Gebruik dit als managementsignaal, niet als bewijs van één oorzaak.',
        tone: hasBroadWorkSignal ? 'amber' : 'blue',
      },
      {
        title: 'Topfocus voor management',
        value: factorLabels[0] ?? 'Nog geen patroon',
        body: factorLabels.length > 1
          ? `${factorLabels[0]} en ${factorLabels[1]} geven nu het scherpste exitbeeld. Start daar de eerstvolgende verificatie.`
          : 'Gebruik de laagst scorende organisatiefactor om het eerste managementgesprek te richten.',
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat gebeurde er waarschijnlijk?',
        intro:
          factorLabels.length > 0
            ? `De scherpste signalen zitten nu vooral in ${factorLabels.join(' en ')}. Dat maakt deze factoren het meest waarschijnlijk relevant in het vertrekverhaal.`
            : 'Gebruik de sterkste organisatiefactoren en open antwoorden om het vertrekverhaal scherper te maken.',
        items: [
          'Gebruik factorpatronen om te bepalen waar vertrek het meest beïnvloedbaar lijkt.',
          'Lees open antwoorden en teamsignalen mee voordat je tot één hoofdoorzaak besluit.',
        ],
        tone: 'blue',
      },
      {
        title: 'Wat moet je eerst valideren?',
        items: [
          factorLabels[0]
            ? `Toets in welke teams ${factorLabels[0].toLowerCase()} het vaakst terugkomt in gesprekken of open antwoorden.`
            : 'Toets eerst in welke teams de frictie het sterkst oploopt.',
          'Controleer of het patroon breed speelt of vooral geconcentreerd is in enkele teams of leidinggevende contexten.',
          'Maak onderscheid tussen beïnvloedbare werkfactoren en externe/persoonlijke vertrekredenen.',
        ],
        tone: 'amber',
      },
      {
        title: 'Welke acties zijn logisch?',
        items: [
          'Kies één managementgesprek per topfactor en maak direct duidelijk welke hypothese je wilt toetsen.',
          'Gebruik het rapport om 30-90 dagenmaatregelen te kiezen in plaats van alleen een terugblik te geven.',
          'Leg vast welke thema’s je in de volgende exitbatch opnieuw wilt monitoren.',
        ],
        tone: 'emerald',
      },
    ],
    profileCards,
  }
}
