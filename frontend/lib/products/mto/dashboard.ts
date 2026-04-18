import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog MTO-signaal geven alleen de scherpte van het huidige brede organisatiethema weer. Gebruik deze banding als geaggregeerde hoofdread op groepsniveau, niet als rapport- of actielogclaim.'

function getTopFactors(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .map(([factor, score]) => ({
      factor,
      score,
      signalValue: 11 - score,
      label: FACTOR_LABELS[factor] ?? factor,
    }))
    .sort((left, right) => right.signalValue - left.signalValue)
    .slice(0, 3)
}

function getBand(averageSignal: number | null) {
  if (averageSignal === null) return null
  if (averageSignal >= 7) return 'HOOG'
  if (averageSignal >= 4.5) return 'MIDDEN'
  return 'LAAG'
}

export function buildMtoDashboardViewModel(args: {
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
  if (!args.hasMinDisplay) {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [
        {
          title: 'Brede read nu',
          value: 'Nog geen veilige MTO-read',
          body: 'Er zijn nog te weinig responses om MTO als bruikbare brede organisatieread te openen.',
          tone: 'amber',
        },
        {
          title: 'Boundary',
          value: 'Group-level only',
          body: 'MTO blijft in deze wave bewust een geaggregeerde hoofdread zonder rapport- of actionlaag.',
          tone: 'blue',
        },
        {
          title: 'Volgende stap',
          value: 'Respons opbouwen',
          body:
            args.pendingCount > 0
              ? `Nodig eerst de resterende ${args.pendingCount} respondent(en) uit of stuur een reminder.`
              : 'Bouw eerst genoeg responses op voor een veilige brede organisatieread.',
          tone: 'blue',
        },
      ],
      managementBlocks: [],
      profileCards: [
        {
          title: 'Leeswijze',
          value: 'Nog in opbouw',
          body: 'MTO wordt pas bruikbaar zodra er genoeg groepsinput is om een eerste brede hoofdmeting veilig te lezen.',
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Nog geen brede MTO-read',
        body:
          args.pendingCount > 0
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste veilige brede organisatieread te openen?`
            : 'Welke extra responses zijn nog nodig voordat deze campaign als brede hoofdread gebruikt kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body: 'Gebruik MTO nog niet als managementinput totdat er genoeg groepsresponses zijn.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt MTO vooral om te bepalen welke brede thema’s nu als eerste organisatieread prioriteit vragen.',
      followThroughTitle: 'Van eerste hoofdread naar eerste organisatiestap',
      followThroughIntro:
        'De vaste vervolglijn verschijnt zodra MTO veilig genoeg is om als brede hoofdmeting te openen.',
      followThroughCards: [],
      managementBandOverride: null,
    }
  }

  const band = getBand(args.averageSignal)
  const topFactors = getTopFactors(args.factorAverages)
  const topFactorLabel = topFactors[0]?.label ?? 'Nog geen topprioriteit'
  const secondFactorLabel = topFactors[1]?.label ?? null
  const thirdFactorLabel = topFactors[2]?.label ?? null
  const stayIntentValue = typeof args.stayIntent === 'number' ? `${args.stayIntent.toFixed(1)}/10` : 'Nog niet zichtbaar'

  return {
    signaalbandenText: SIGNAL_BANDS_TEXT,
    topSummaryCards: [
      {
        title: 'Brede read nu',
        value: 'Brede hoofdmeting actief',
        body: 'MTO opent in deze wave een eerste brede organisatieread op groepsniveau: welke brede thema’s vragen nu als eerste duiding?',
        tone: band === 'HOOG' ? 'amber' : 'blue',
      },
      {
        title: 'Boundary',
        value: 'Group-level only',
        body: 'MTO blijft in deze wave een geaggregeerde hoofdread zonder formele rapportlaag of action logging.',
        tone: 'blue',
      },
      {
        title: 'Topprioriteit',
        value: topFactorLabel,
        body: secondFactorLabel
          ? `${topFactorLabel} staat nu voorop; ${secondFactorLabel.toLowerCase()} lees je mee als tweede brede themalaag.`
          : `${topFactorLabel} vormt nu het eerste brede thema in deze MTO-read.`,
        tone: 'blue',
      },
      {
        title: 'Brede richting',
        value: stayIntentValue,
        body: 'Gebruik de richtingsvraag als extra context bij de eerste brede organisatieread, niet als los oordeel.',
        tone: typeof args.stayIntent === 'number' && args.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
      {
        title: 'Segmentverrijking',
        value: 'Optioneel later',
        body: 'Department en role_level mogen later verrijken, maar dragen in deze wave nog niet de hoofduitleg.',
        tone: 'blue',
      },
      {
        title: 'Boundary',
        value: 'Geen reportlaag',
        body: 'Formele rapportage hoort pas in een latere wave. Deze foundation slice levert nu alleen de eerste brede read.',
        tone: 'amber',
      },
      {
        title: 'Boundary',
        value: 'Geen action log',
        body: 'Action logging blijft in deze wave expliciet dicht; de read stopt nu bij eerste duiding en begrenzing.',
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Hoe lees je deze brede MTO nu?',
        intro:
          band === 'HOOG'
            ? `Deze MTO laat een scherp breed organisatiethema zien rond ${topFactorLabel.toLowerCase()}.`
            : `Deze MTO opent een eerste brede organisatieread waarin ${topFactorLabel.toLowerCase()} nu voorop staat.`,
        items: [
          `${topFactorLabel} is nu het eerste organisatiethema voor managementduiding.`,
          secondFactorLabel ? `${secondFactorLabel} lees je mee als tweede brede themalaag.` : 'Gebruik de richtingsvraag als tweede brede contextlaag.',
          thirdFactorLabel ? `${thirdFactorLabel} blijft in beeld als derde brede prioriteit.` : 'Houd de derde prioriteit bewust bounded in deze wave.',
        ],
        tone: 'blue',
      },
      {
        title: 'Welk besluit hoort nu eerst?',
        items: [
          `Beslis of ${topFactorLabel.toLowerCase()} nu vooral een eerste managementhuddle of al een kleine begrensde correctie vraagt.`,
          'Bepaal welke brede managementvraag als eerste expliciet beantwoord moet worden.',
        ],
        tone: band === 'HOOG' ? 'amber' : 'blue',
      },
      {
        title: 'Wie trekt dit en hoe begrens je het?',
        items: [
          'Eerste eigenaar: HR lead met MT-sponsor.',
          'Leg vast welke eerste brede managementhuddle deze read moet openen.',
          'Beperk de eerste stap tot een bounded organisatieread zonder nieuwe platformlaag.',
          'Plan direct een reviewmoment voor de eerstvolgende wave-waardige verdiepingsvraag.',
        ],
        tone: 'emerald',
      },
      {
        title: 'Wat mag deze wave nog niet worden?',
        items: [
          'Maak van deze read nog geen rapportlaag of formele rapportvervanger.',
          'Open nog geen action log, workflowlaag of brede operatorsuite.',
          'Gebruik MTO nog niet als publieke hoofdroute of suitevervanging.',
        ],
        tone: 'amber',
      },
    ],
    profileCards: [
      {
        title: 'Leeswijze',
        value: 'Brede hoofdmeting',
        body: 'MTO is in deze wave een interne hoofdmeting op groepsniveau: een eerste brede organisatieread die thema’s prioriteert zonder al een report- of actionlaag te openen.',
        tone: 'blue',
      },
      {
        title: 'Handoffvorm',
        value: 'Read -> owner -> bounded next step',
        body: 'Deze foundation wave maakt MTO bestuurlijk bruikbaar door eerste brede read, eerste eigenaar en eerste begrensde vervolgstap in dezelfde lijn te zetten.',
        tone: 'emerald',
      },
    ],
    primaryQuestion: {
      title: 'Eerste managementvraag',
      body: `Welke brede managementvraag over ${topFactorLabel.toLowerCase()} moet nu als eerste expliciet worden beantwoord voordat verdere verdieping logisch wordt?`,
      tone: band === 'HOOG' ? 'amber' : 'blue',
    },
    nextStep: {
      title: 'Beleg eerste organisatieread',
      body: `Gebruik ${topFactorLabel.toLowerCase()} als eerste organisatiethema, beleg een eerste eigenaar en houd de vervolgstap bewust bounded tot deze foundation wave.`,
      tone: band === 'LAAG' ? 'emerald' : 'amber',
    },
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van deze eerste brede hoofdmeting naar een duidelijke eerste organisatieread te gaan, zonder report- of actionlaag te openen.',
    followThroughTitle: 'Van brede MTO-read naar eerste bounded vervolgstap',
    followThroughIntro:
      'De waarde van deze wave zit in een duidelijke eerste organisatieread: prioriteit, eigenaar, begrensde eerste stap en een expliciet reviewmoment.',
    followThroughCards: [
      {
        title: 'Prioriteit nu',
        body: `${topFactorLabel} is nu het eerste brede organisatiethema voor managementduiding.`,
        tone: 'blue',
      },
      {
        title: 'Eerste managementhuddle',
        body: `Gebruik een eerste managementhuddle om te toetsen wat ${topFactorLabel.toLowerCase()} nu precies vraagt op organisatieniveau.`,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        body: 'Beleg HR lead met MT-sponsor als eerste eigenaar van deze brede read.',
        tone: 'emerald',
      },
      {
        title: 'Eerste begrensde stap',
        body: 'Kies een kleine, duidelijke vervolgstap die past bij een foundation read en nog geen report- of actionlaag opent.',
        tone: band === 'LAAG' ? 'emerald' : 'amber',
      },
      {
        title: 'Reviewgrens',
        body: 'Plan direct een bounded review om te bepalen of verdieping in dashboarddiepte of managementread logisch wordt.',
        tone: 'emerald',
      },
      {
        title: 'Wat nog dicht blijft',
        body: 'Rapportage, action logging en publieke activatie blijven dicht tot latere waves.',
        tone: 'amber',
      },
    ],
    managementBandOverride: band,
  }
}
