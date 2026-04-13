import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

const FACTOR_VALIDATION_HINTS: Record<string, string> = {
  leadership: 'Toets of het vooral gaat om autonomie-ondersteuning, feedback of vertrouwen in de directe leidinggevende.',
  culture:
    'Controleer of het beeld vooral draait om psychologische veiligheid, cultuurfit of spanningen in samenwerking.',
  growth: 'Valideer of medewerkers vooral ontwikkelruimte, loopbaanperspectief of zicht op een volgende stap missen.',
  compensation:
    'Check of het pijnpunt zit in beloningshoogte, transparantie over groei of de passendheid van voorwaarden.',
  workload: 'Breng in kaart of de druk structureel is of vooral piekgebonden en waar herstel of regelruimte ontbreekt.',
  role_clarity:
    'Toets waar prioriteiten, beslisruimte of tegenstrijdige verwachtingen nu het meeste frictie geven.',
}

const FACTOR_ACTION_HINTS: Record<string, string> = {
  leadership: 'Start binnen 30 dagen gerichte managercheck-ins en maak autonomie-ondersteuning expliciet in gesprekken.',
  culture: 'Plan een teamdialoog over veiligheid en samenwerking en leg vast welk gedrag expliciet moet veranderen.',
  growth: 'Maak groeipaden en interne kansen zichtbaar en voeg een kort ontwikkelgesprek toe aan de eerstvolgende cyclus.',
  compensation:
    'Herijk de uitleg over beloning en voorwaarden en bepaal of er een gerichte markt- of fairnesscheck nodig is.',
  workload: 'Kies 1-2 teams voor een werklastreview en spreek direct af welke taken, pieken of prioriteiten omlaag gaan.',
  role_clarity: 'Breng prioriteiten en rolafspraken terug tot een helder werkdocument per team of rol.',
}

function deriveSignalProfile(
  riskScore: number | null,
  engagement: number | null,
  turnoverIntention: number | null,
  stayIntent: number | null,
) {
  if (riskScore === null) return 'vroegsignaal'

  const engagementLow = engagement !== null && engagement < 5.5
  const turnoverHigh = turnoverIntention !== null && turnoverIntention >= 5.5
  const stayLow = stayIntent !== null && stayIntent < 5.5

  if (riskScore >= 7 && (engagementLow || turnoverHigh || stayLow)) return 'scherp_aandachtssignaal'
  if (turnoverHigh && stayLow) return 'vertrekdenken_zichtbaar'
  if (riskScore >= 4.5 || engagementLow || stayLow) return 'vroegsignaal'
  return 'overwegend_stabiel'
}

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

function buildProfileCards(args: {
  averageSignal: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
}) {
  const profiles: DashboardViewModel['profileCards'] = []
  const { averageSignal, engagement, turnoverIntention, stayIntent } = args

  const engagementLow = engagement !== null && engagement < 5.5
  const turnoverHigh = turnoverIntention !== null && turnoverIntention >= 5.5
  const stayLow = stayIntent !== null && stayIntent < 5.5
  const signalHigh = averageSignal !== null && averageSignal >= 5.5
  const signalLow = averageSignal !== null && averageSignal < 4.5

  if (turnoverHigh && stayLow && (signalHigh || engagementLow)) {
    profiles.push({
      title: 'Risicoprofiel',
      value: 'Acuut behoudssignaal',
      body: 'Hoge vertrekintentie en lage stay-intent vallen samen met werkfactoren of bevlogenheid die onder druk staan. Dit vraagt snelle verificatie en gerichte opvolging.',
      tone: 'amber',
    })
  } else if (signalHigh && !turnoverHigh && stayLow) {
    profiles.push({
      title: 'Risicoprofiel',
      value: 'Stille behoudsdruk',
      body: 'De werkfactoren geven al duidelijk spanning, terwijl expliciet vertrekdenken nog minder zichtbaar is. Dit is typisch een vroegsignaal dat snel prioritering vraagt.',
      tone: 'blue',
    })
  } else if (engagementLow && !turnoverHigh && !stayLow) {
    profiles.push({
      title: 'Risicoprofiel',
      value: 'Vermoeid maar nog verbonden',
      body: 'De energie staat onder druk, maar stay-intent en vertrekintentie wijzen nog niet op acute uitstroom. Hier ligt de meeste winst vaak in herstel, werkdruk en prioriteiten.',
      tone: 'blue',
    })
  } else if (signalLow && !engagementLow && !turnoverHigh && !stayLow) {
    profiles.push({
      title: 'Risicoprofiel',
      value: 'Overwegend stabiel',
      body: 'De combinatie van werkfactoren en behoudssignalen oogt gezond. Blijf vooral de laagst scorende factoren monitoren en leg vast wat je wilt behouden.',
      tone: 'emerald',
    })
  } else {
    profiles.push({
      title: 'Risicoprofiel',
      value: 'Gemengd beeld',
      body: 'De signalen wijzen niet allemaal dezelfde kant op. Dat maakt segmentvergelijking en verificatie belangrijker dan snelle conclusies.',
      tone: 'blue',
    })
  }

  if (signalHigh && engagementLow) {
    profiles.push({
      title: 'Aanvullend profiel',
      value: 'Werkbeleving onder druk',
      body: 'Lage bevlogenheid in combinatie met hogere werkfrictie maakt de kans groter dat teams afhaken voordat dat in expliciete vertrekintentie zichtbaar wordt.',
      tone: 'amber',
    })
  }

  return profiles.slice(0, 2)
}

export function buildRetentionDashboardViewModel(args: {
  signalLabelLower: string
  averageSignal: number | null
  strongWorkSignalRate: number | null
  engagement: number | null
  turnoverIntention: number | null
  stayIntent: number | null
  hasEnoughData: boolean
  factorAverages: Record<string, number>
}): DashboardViewModel {
  const topFactors = getTopFactors(args.factorAverages)
  const averageSignal = args.averageSignal ??
    (Object.keys(args.factorAverages).length > 0
      ? Object.values(args.factorAverages).reduce((sum, score) => sum + (11 - score), 0) / Object.keys(args.factorAverages).length
      : null)
  const signalProfile = deriveSignalProfile(
    averageSignal,
    args.engagement,
    args.turnoverIntention,
    args.stayIntent,
  )

  if (!args.hasEnoughData) {
    return {
      signaalbandenText:
        'Laag, verhoogd en sterk aandachtssignaal laten zien hoeveel verificatie en opvolging een patroon vraagt. Ze helpen HR en MT bepalen wat eerst besproken of verdiept moet worden.',
      supplementalCards: [],
      managementBlocks: [],
      profileCards: [],
    }
  }

  const topFactorLabels = topFactors.map(({ factor }) => FACTOR_LABELS[factor] ?? factor)
  const profileText =
    signalProfile === 'scherp_aandachtssignaal'
      ? 'Meerdere behoudssignalen wijzen dezelfde kant op: dit vraagt snelle verificatie in de groepen waar de laagste werkfactoren samenkomen.'
      : signalProfile === 'vertrekdenken_zichtbaar'
        ? 'Expliciet vertrekdenken is zichtbaar. Toets snel of dit vooral geconcentreerd zit in bepaalde teams, rollen of leidinggevende contexten.'
        : signalProfile === 'overwegend_stabiel'
          ? 'Het totaalbeeld oogt overwegend stabiel, maar de laagst scorende werkfactoren bepalen nog steeds waar aandacht het meeste oplevert.'
          : 'Er is een vroegsignaal zichtbaar: nog geen harde vertrekclaim, maar wel genoeg reden om de zwakste werkfactoren gericht te valideren.'

  const validationItems = topFactors.map(
    ({ factor }) => FACTOR_VALIDATION_HINTS[factor] ?? `Valideer scherper wat er speelt binnen ${FACTOR_LABELS[factor] ?? factor}.`,
  )
  if (args.turnoverIntention !== null && args.turnoverIntention >= 5.5) {
    validationItems.push('Toets expliciet in welke teams vertrekdenken nu het meest zichtbaar lijkt en welk gesprek daar nog ontbreekt.')
  }

  const actionItems = topFactors.map(
    ({ factor }) => FACTOR_ACTION_HINTS[factor] ?? `Werk voor ${FACTOR_LABELS[factor] ?? factor} één concrete 30-90 dagenactie uit.`,
  )
  actionItems.push('Plan nu al een vervolgmeting of evaluatiemoment, zodat acties niet los komen te staan van het volgende gesprek.')

  return {
    signaalbandenText:
      'Laag, verhoogd en sterk aandachtssignaal laten zien hoeveel verificatie en opvolging een patroon vraagt. Ze helpen HR en MT bepalen wat eerst besproken of verdiept moet worden.',
    supplementalCards: [
      {
        title: 'Gemiddelde vertrekintentie',
        value: args.turnoverIntention !== null ? `${args.turnoverIntention.toFixed(1)}/10` : '–',
        body: 'Hogere scores wijzen op een sterker signaal dat medewerkers nadenken over vertrek. Gebruik dit als groepssignaal, niet als individuele voorspelling.',
        tone: 'blue',
      },
      {
        title: 'Gemiddelde stay-intent',
        value: args.stayIntent !== null ? `${args.stayIntent.toFixed(1)}/10` : '–',
        body: 'Hogere scores wijzen op een sterkere expliciete bereidheid om te blijven. Lees dit altijd samen met werkfactoren, bevlogenheid en vertrekintentie.',
        tone: 'emerald',
      },
      {
        title: 'Managementduiding',
        value: '',
        body: 'Lees retentiesignaal, bevlogenheid, stay-intent en vertrekintentie samen. Juist de combinatie bepaalt of je vooral een vroegsignaal ziet of een scherper aandachtspunt dat sneller opvolging vraagt.',
        tone: 'emerald',
      },
    ],
    managementBlocks: [
      {
        title: 'Waar zit het risico nu het duidelijkst?',
        intro:
          topFactorLabels.length > 0
            ? `${profileText} Op dit moment zitten de scherpste signalen vooral in ${topFactorLabels.join(' en ')}.`
            : profileText,
        items: topFactorLabels.length > 0 ? topFactorLabels.map((label) => `${label} vraagt nu de meeste bestuurlijke aandacht.`) : [profileText],
        tone: 'blue',
      },
      {
        title: 'Wat moet je eerst valideren?',
        items: validationItems.slice(0, 3),
        tone: 'amber',
      },
      {
        title: 'Welke acties zijn logisch in 30-90 dagen?',
        items: actionItems.slice(0, 3),
        tone: 'emerald',
      },
    ],
    profileCards: buildProfileCards({
      averageSignal,
      engagement: args.engagement,
      turnoverIntention: args.turnoverIntention,
      stayIntent: args.stayIntent,
    }),
  }
}
