import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog MTO-signaal geven alleen de scherpte van het huidige brede organisatiethema weer. Gebruik deze banding als geaggregeerde hoofdread op groepsniveau, niet als rapport- of actielogclaim.'

type MtoInterpretationState =
  | 'insufficient_broad_read'
  | 'indicative_broad_read'
  | 'stable_broad_read'
  | 'attention_broad_read'
  | 'high_attention_broad_read'

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

function getInterpretationState(args: {
  averageSignal: number | null
  stayIntent: number | null
  hasEnoughData: boolean
  hasMinDisplay: boolean
}): MtoInterpretationState {
  if (!args.hasMinDisplay || args.averageSignal === null) return 'insufficient_broad_read'
  if (!args.hasEnoughData) return 'indicative_broad_read'

  const stayIntent = typeof args.stayIntent === 'number' ? args.stayIntent : 6

  if (args.averageSignal >= 7.5 || (args.averageSignal >= 7 && stayIntent < 5.5) || stayIntent < 4.8) {
    return 'high_attention_broad_read'
  }

  if (args.averageSignal >= 5.5 || stayIntent < 5.8) {
    return 'attention_broad_read'
  }

  return 'stable_broad_read'
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
  const interpretationState = getInterpretationState(args)

  if (interpretationState === 'insufficient_broad_read') {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      interpretationState,
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
        "Zodra er genoeg responses zijn helpt MTO vooral om te bepalen welke brede thema's nu als eerste organisatieread prioriteit vragen.",
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

  if (interpretationState === 'indicative_broad_read') {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      interpretationState,
      topSummaryCards: [
        {
          title: 'Brede read nu',
          value: 'Indicatieve hoofdmeting',
          body: 'MTO laat al een eerste brede organisatierichting zien, maar het patroon is nog niet stevig genoeg voor een harde hoofdread.',
          tone: 'amber',
        },
        {
          title: 'Boundary',
          value: 'Group-level only',
          body: 'MTO blijft nog steeds een geaggregeerde hoofdread zonder rapport- of actionlaag.',
          tone: 'blue',
        },
        {
          title: 'Interpretatie',
          value: 'Nog indicatief',
          body: 'Lees dit nu vooral als eerste brede richting, niet als stevig patroon of formele managementclaim.',
          tone: 'amber',
        },
        {
          title: 'Topprioriteit',
          value: topFactorLabel,
          body: 'Gebruik dit als eerste gesprekshaak zolang de patroonsterkte nog in opbouw is.',
          tone: 'blue',
        },
      ],
      managementBlocks: [
        {
          title: 'Hoe lees je deze indicatieve MTO?',
          intro: `Gebruik ${topFactorLabel.toLowerCase()} als eerste brede richting, maar houd de duiding voorlopig licht.`,
          items: [
            'Lees dit als eerste organisatierichting, niet als stevige patroonread.',
            secondFactorLabel ? `${secondFactorLabel} blijft een meelezende tweede hypothese.` : 'Gebruik de richtingsvraag alleen als ondersteunende context.',
            'Wacht met zwaardere claims tot minimaal 10 responses binnen zijn.',
          ],
          tone: 'amber',
        },
        {
          title: 'Welke bestuurlijke keuze hoort nu?',
          items: [
            `Kies of ${topFactorLabel.toLowerCase()} nu al een eerste brede managementvraag opent.`,
            'Houd de vervolgstap klein en gericht op patroonversterking, niet op brede interventie.',
          ],
          tone: 'blue',
        },
        {
          title: 'Wat blijft dicht?',
          items: [
            'Open nog geen rapportlaag of formele managementsamenvatting.',
            'Leg nog geen action log of bredere opvolgworkflow vast.',
            'Gebruik deze read nog niet als publiek of commercieel hoofdmodel.',
          ],
          tone: 'amber',
        },
      ],
      profileCards: [
        {
          title: 'Leeswijze',
          value: 'Indicatieve hoofdmeting',
          body: 'MTO laat hier al een eerste hoofdmeting zien, maar de huidige read blijft nog nadrukkelijk indicatief.',
          tone: 'blue',
        },
      ],
      primaryQuestion: {
        title: 'Welke brede vraag tekent zich af?',
        body: `Welke eerste brede managementvraag over ${topFactorLabel.toLowerCase()} tekent zich nu af, zonder die al als vast patroon te behandelen?`,
        tone: 'amber',
      },
      nextStep: {
        title: 'Nog geen stevige patroonread',
        body: 'Gebruik de huidige read voor eerste richting, maar bouw nu eerst patroonsterkte op voordat een stevigere hoofdmetingclaim volgt.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik de vragen hieronder vooral om eerste richting te kiezen. De echte pattern strength van MTO moet in deze fase nog verder opbouwen.',
      followThroughTitle: 'Van indicatieve read naar stevige hoofdmeting',
      followThroughIntro:
        'De eerstvolgende winst zit nu in patroonsterkte opbouwen, niet in bredere scope openen.',
      followThroughCards: [
        {
          title: 'Bouw eerst patroonsterkte op',
          body: 'Werk eerst toe naar voldoende respons voordat deze read zwaarder bestuurlijk wordt ingezet.',
          tone: 'amber',
        },
        {
          title: 'Gebruik topfactor als gesprekshaak',
          body: `${topFactorLabel} mag nu al helpen om de eerste brede vraag te formuleren.`,
          tone: 'blue',
        },
        {
          title: 'Houd rapport en action log dicht',
          body: 'Ook bij eerste richting blijft MTO in deze wave nog bewust zonder rapport- of actionlaag.',
          tone: 'blue',
        },
      ],
      managementBandOverride: band,
    }
  }

  const isHighAttention = interpretationState === 'high_attention_broad_read'
  const isStable = interpretationState === 'stable_broad_read'
  const readValue = isHighAttention
    ? 'Scherpe hoofdmeting'
    : isStable
      ? 'Stabiele hoofdmeting'
      : 'Actieve hoofdmeting'
  const interpretationValue = isHighAttention
    ? 'Scherp aandachtspunt'
    : isStable
      ? 'Stabiel groepsbeeld'
      : 'Actief aandachtspunt'
  const readTone = isHighAttention ? 'amber' : isStable ? 'emerald' : 'blue'
  const primaryQuestionTitle = isHighAttention
    ? 'Welke brede oorzaak vraagt nu eerst verificatie?'
    : isStable
      ? 'Welke brede borgvraag verdient nu eerst aandacht?'
      : 'Eerste managementvraag'
  const nextStepTitle = isHighAttention
    ? 'Prioriteer eerste organisatiehuddle'
    : isStable
      ? 'Borg brede hoofdread'
      : 'Beleg eerste organisatieread'
  const managementIntroTitle = isHighAttention
    ? 'Hoe lees je deze scherpe MTO?'
    : isStable
      ? 'Hoe lees je deze stabiele MTO?'
      : 'Hoe lees je deze actieve MTO?'

  return {
    signaalbandenText: SIGNAL_BANDS_TEXT,
    interpretationState,
    topSummaryCards: isHighAttention
      ? [
          {
            title: 'Brede read nu',
            value: readValue,
            body: `MTO laat nu een scherp breed organisatiethema zien rond ${topFactorLabel.toLowerCase()}.`,
            tone: readTone,
          },
          {
            title: 'Boundary',
            value: 'Group-level only',
            body: 'MTO blijft in deze wave een geaggregeerde hoofdread zonder formele rapportlaag of action logging.',
            tone: 'blue',
          },
          {
            title: 'Interpretatie',
            value: interpretationValue,
            body: 'Deze combinatie van hoog signaal en zwakkere richting vraagt eerst verificatie en scherpe bestuurlijke begrenzing.',
            tone: 'amber',
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
            title: 'Boundary',
            value: 'Geen reportlaag',
            body: 'Formele rapportage hoort pas in een latere wave. Deze verdieping levert nu alleen scherpere managementduiding.',
            tone: 'amber',
          },
          {
            title: 'Boundary',
            value: 'Geen action log',
            body: 'Action logging blijft expliciet dicht; deze wave stopt nog steeds bij duiding, prioritering en begrenzing.',
            tone: 'blue',
          },
        ]
      : [
          {
            title: 'Brede read nu',
            value: readValue,
            body: isStable
              ? 'MTO opent een stabieler breed organisatiebeeld dat vooral borging en prioritering vraagt.'
              : "MTO opent in deze wave een eerste brede organisatieread op groepsniveau: welke brede thema's vragen nu als eerste duiding?",
            tone: readTone,
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
            title: 'Interpretatie',
            value: interpretationValue,
            body: isStable
              ? 'Lees dit als een bredere hoofdmeting die vooral borging en bewuste prioritering vraagt.'
              : 'Lees dit als een brede hoofdmeting die nu al duidelijk aandacht vraagt, maar nog niet verder mag uitschuiven naar rapport of action log.',
            tone: readTone,
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
        title: managementIntroTitle,
        intro: isHighAttention
          ? `Deze MTO laat een scherp breed organisatiethema zien rond ${topFactorLabel.toLowerCase()}.`
          : isStable
            ? `Deze MTO laat een stabieler breed organisatiebeeld zien waarin ${topFactorLabel.toLowerCase()} nu voorop staat.`
            : `Deze MTO opent een actieve brede organisatieread waarin ${topFactorLabel.toLowerCase()} nu voorop staat.`,
        items: [
          `${topFactorLabel} is nu het eerste organisatiethema voor managementduiding.`,
          secondFactorLabel ? `${secondFactorLabel} lees je mee als tweede brede themalaag.` : 'Gebruik de richtingsvraag als tweede brede contextlaag.',
          thirdFactorLabel ? `${thirdFactorLabel} blijft in beeld als derde brede prioriteit.` : 'Houd de derde prioriteit bewust bounded in deze wave.',
        ],
        tone: readTone,
      },
      {
        title: 'Welk besluit hoort nu eerst?',
        items: [
          isHighAttention
            ? `Beslis of ${topFactorLabel.toLowerCase()} nu eerst een scherpe managementverificatie of een kleine begrensde correctie vraagt.`
            : isStable
              ? `Beslis hoe ${topFactorLabel.toLowerCase()} nu het best geborgd of rustig verdiept wordt.`
              : `Beslis of ${topFactorLabel.toLowerCase()} nu vooral een eerste managementhuddle of al een kleine begrensde correctie vraagt.`,
          'Bepaal welke brede managementvraag als eerste expliciet beantwoord moet worden.',
        ],
        tone: isHighAttention ? 'amber' : 'blue',
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
        value: isHighAttention ? 'Scherpe hoofdmeting' : isStable ? 'Stabiele hoofdmeting' : 'Brede hoofdmeting',
        body: 'MTO is in deze wave een interne hoofdmeting op groepsniveau: een brede organisatieread die thema\'s prioriteert zonder al een report- of actionlaag te openen.',
        tone: 'blue',
      },
      {
        title: 'Handoffvorm',
        value: 'Read -> owner -> bounded next step',
        body: 'Deze wave maakt MTO bestuurlijk bruikbaar door brede read, eerste eigenaar en eerste begrensde vervolgstap in dezelfde lijn te zetten.',
        tone: 'emerald',
      },
    ],
    primaryQuestion: {
      title: primaryQuestionTitle,
      body: isHighAttention
        ? `Welke brede oorzaak achter ${topFactorLabel.toLowerCase()} moet nu eerst expliciet worden geverifieerd voordat verdere verbreding logisch wordt?`
        : isStable
          ? `Welke brede borg- of verdiepingsvraag rond ${topFactorLabel.toLowerCase()} verdient nu als eerste rustige aandacht?`
          : `Welke brede managementvraag over ${topFactorLabel.toLowerCase()} moet nu als eerste expliciet worden beantwoord voordat verdere verdieping logisch wordt?`,
      tone: isHighAttention ? 'amber' : 'blue',
    },
    nextStep: {
      title: nextStepTitle,
      body: isHighAttention
        ? `Gebruik ${topFactorLabel.toLowerCase()} om nu een eerste scherpe organisatiehuddle te prioriteren en begrens de vervolgstap expliciet.`
        : isStable
          ? `Gebruik ${topFactorLabel.toLowerCase()} om een eerste borg- of rustige verdiepingsstap te kiezen zonder de scope open te trekken.`
          : `Gebruik ${topFactorLabel.toLowerCase()} als eerste organisatiethema, beleg een eerste eigenaar en houd de vervolgstap bewust bounded tot deze wave.`,
      tone: isStable ? 'emerald' : 'amber',
    },
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van deze brede hoofdmeting naar een duidelijke eerste organisatieread te gaan, zonder report- of actionlaag te openen.',
    followThroughTitle: 'Van brede MTO-read naar eerste bounded vervolgstap',
    followThroughIntro: isStable
      ? 'De waarde van deze wave zit nu in bewuste borging, prioritering en een heldere reviewgrens.'
      : 'De waarde van deze wave zit in een duidelijke eerste organisatieread: prioriteit, eigenaar, begrensde eerste stap en een expliciet reviewmoment.',
    followThroughCards: isStable
      ? [
          {
            title: 'Borg de hoofdmeting',
            body: `${topFactorLabel} vraagt nu vooral borging en een rustige eerste managementlijn.`,
            tone: 'emerald',
          },
          {
            title: 'Houd de vervolgstap klein',
            body: 'Kies een begrensde eerste stap die de brede read ondersteunt zonder extra systeemlaag te openen.',
            tone: 'blue',
          },
          {
            title: 'Review bewust opnieuw',
            body: 'Plan een reviewmoment om te bepalen of MTO later meer dashboarddiepte of juist alleen borging nodig heeft.',
            tone: 'blue',
          },
        ]
      : [
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
            tone: isHighAttention ? 'amber' : band === 'LAAG' ? 'emerald' : 'amber',
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
