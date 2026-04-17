import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog pulsignal geven alleen de scherpte van deze huidige cycle weer. Gebruik deze banding als reviewhulp op groepsniveau, samen met de vorige vergelijkbare Pulse waar die veilig leesbaar is, niet als trendbewijs of individuele score.'

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

export function buildPulseDashboardViewModel(args: {
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
  const topFactorLabel = topFactors[0] ? FACTOR_LABELS[topFactors[0].factor] ?? topFactors[0].factor : 'de actief gemeten werkfactor'
  const secondFactorLabel = topFactors[1] ? FACTOR_LABELS[topFactors[1].factor] ?? topFactors[1].factor : null
  const signalState = getSignalState(args.averageSignal)
  const stayIntentText =
    typeof args.stayIntent === 'number'
      ? `De huidige richtingsvraag staat op ${args.stayIntent.toFixed(1)}/10.`
      : 'De richtingsvraag wordt zichtbaar zodra er responses zijn.'

  if (!args.hasMinDisplay) {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [],
      primaryQuestion: {
        title: 'Eerste reviewvraag',
        body:
          args.pendingCount > 0
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste bruikbare Pulse-snapshot te lezen?`
            : 'Welke extra responses zijn nog nodig voordat deze Pulse veilig als groepssnapshot gelezen kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body:
          args.pendingCount > 0
            ? `Stuur eerst de resterende ${args.pendingCount} respondent(en) een reminder. Pulse wordt pas bruikbaar zodra er genoeg groepsinput is.`
            : 'Gebruik deze Pulse nog niet als managementreview. Bouw eerst genoeg responses op voor veilige groepsduiding.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt Pulse vooral om sneller te kiezen welk werkspoor nu review of bijsturing vraagt.',
      followThroughTitle: 'Van snapshot naar review',
      followThroughIntro:
        'De vaste reviewroute verschijnt zodra Pulse veilig genoeg is om als groepssnapshot te lezen.',
      followThroughCards: [],
    }
  }

  if (!args.hasEnoughData) {
    return {
      signaalbandenText: SIGNAL_BANDS_TEXT,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [],
      primaryQuestion: {
        title: 'Eerste reviewvraag',
        body: `Lijkt ${topFactorLabel.toLowerCase()} nu het eerste spoor om te bespreken, of verschuift dat beeld nog zodra de groep vollediger is?`,
        tone: 'blue',
      },
      nextStep: {
        title: 'Voorzichtig reviewen',
        body: `Gebruik ${topFactorLabel.toLowerCase()} alvast als eerste gesprekshaak, maar behandel deze Pulse nog als indicatieve momentopname totdat minimaal 10 responses binnen zijn.`,
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik de vragen hieronder nu vooral om te bepalen welke beperkte review of koerscorrectie als eerste logisch is.',
      followThroughTitle: 'Van snapshot naar review',
      followThroughIntro:
        'Bij een indicatieve Pulse blijft de route bewust compact: kies een eerste reviewspoor, eigenaar en checkmoment, maar claim nog geen hard patroon.',
      followThroughCards: [
        {
          title: 'Prioriteit nu',
          body: `${topFactorLabel} is voorlopig het eerste spoor om te reviewen.`,
          tone: 'blue',
        },
        {
          title: 'Eerste gesprek',
          body: `Gebruik een kort management- of teamgesprek om te toetsen wat ${topFactorLabel.toLowerCase()} nu precies vraagt.`,
          tone: 'blue',
        },
        {
          title: 'Eerste eigenaar',
          body: 'HR met betrokken leidinggevende.',
          tone: 'emerald',
        },
        {
          title: 'Reviewmoment',
          body: 'Herlees deze snapshot zodra minimaal 10 responses binnen zijn of de eerste correctie zichtbaar is.',
          tone: 'amber',
        },
      ],
    }
  }

  const signalRead =
    signalState === 'hoog'
      ? `Deze Pulse laat een scherp reviewsignaal zien. ${topFactorLabel} vraagt nu zichtbare bespreking of bijsturing.`
      : signalState === 'midden'
        ? `Deze Pulse laat een gemengd maar duidelijk aandachtssignaal zien. ${topFactorLabel} verdient nu de eerste managementreview.`
        : `Deze Pulse oogt overwegend stabiel. Gebruik vooral ${topFactorLabel.toLowerCase()} als monitoringsspoor om vast te houden wat werkt.`

  const reviewDirection = secondFactorLabel
    ? `${topFactorLabel} en ${secondFactorLabel.toLowerCase()} vormen samen de eerste reviewrichting voor deze cycle.`
    : `${topFactorLabel} vormt de eerste reviewrichting voor deze cycle.`
  const repeatMotionText =
    signalState === 'hoog'
      ? 'Doe een volgende Pulse pas nadat een concrete correctie of ontlasting zichtbaar is gestart.'
      : signalState === 'midden'
        ? 'Gebruik een volgende Pulse als bounded hercheck zodra de eerste managementcorrectie expliciet is belegd.'
        : 'Gebruik een volgende Pulse om te toetsen of deze stabiliteit echt standhoudt na de gekozen opvolging.'

  return {
    signaalbandenText: SIGNAL_BANDS_TEXT,
    topSummaryCards: [
      {
        title: 'Managementread nu',
        value:
          signalState === 'hoog'
            ? 'Scherp reviewsignaal'
            : signalState === 'midden'
              ? 'Aandachtssignaal'
              : 'Overwegend stabiel',
        body: signalRead,
        tone: signalState === 'hoog' ? 'amber' : signalState === 'laag' ? 'emerald' : 'blue',
      },
      {
        title: 'Primair werkspoor',
        value: topFactorLabel,
        body: reviewDirection,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        value: 'HR + leidinggevende',
        body: 'Beleg deze Pulse eerst bij HR met de betrokken leidinggevende. Gebruik pas daarna een bredere sponsor- of MT-escalatie als het spoor dat echt vraagt.',
        tone: 'emerald',
      },
      {
        title: 'Volgende check',
        value: '30-45 dagen',
        body: repeatMotionText,
        tone: signalState === 'hoog' ? 'amber' : 'blue',
      },
      {
        title: 'Richting nu',
        value: typeof args.stayIntent === 'number' ? `${args.stayIntent.toFixed(1)}/10` : 'Nog niet zichtbaar',
        body: stayIntentText,
        tone: typeof args.stayIntent === 'number' && args.stayIntent < 5.5 ? 'amber' : 'emerald',
      },
      {
        title: 'Boundary',
        value: 'Begrensde vergelijking',
        body: 'Gebruik deze Pulse als bounded reviewlaag. Vergelijking over tijd tonen we alleen met de vorige vergelijkbare Pulse en voldoende data, niet als breed effectbewijs.',
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat vraagt nu directe review?',
        intro: signalRead,
        items: [
          `${topFactorLabel} is nu het eerste werkspoor.`,
          secondFactorLabel ? `${secondFactorLabel} is het tweede spoor om mee te lezen.` : 'Lees dit samen met de korte werkbelevingscheck.',
        ],
        tone: 'blue',
      },
      {
        title: 'Welk besluit hoort nu eerst?',
        items: [
          `Beslis of ${topFactorLabel.toLowerCase()} nu een korte correctie vraagt of eerst een gerichte teamreview.`,
          'Kies een kleine, zichtbare volgende stap die in de komende 30-45 dagen opnieuw bekeken kan worden.',
        ],
        tone: 'amber',
      },
      {
        title: 'Wie trekt dit en wanneer kijk je opnieuw?',
        items: [
          'Eerste eigenaar: HR met betrokken leidinggevende.',
          'Leg direct een reviewmoment vast voor de eerstvolgende managementcheck en gebruik een volgende Pulse alleen als bounded hercheck.',
        ],
        tone: 'emerald',
      },
    ],
    profileCards: [
      {
        title: 'Leeswijze',
        value: 'Reviewlaag',
        body: 'Pulse is bedoeld als compacte managementhandoff: actuele snapshot, begrensde vergelijking met de vorige Pulse en een expliciete eerstvolgende check.',
        tone: 'blue',
      },
    ],
    primaryQuestion: {
      title: 'Eerste managementvraag',
      body: `Wat moet er nu als eerste gebeuren rond ${topFactorLabel.toLowerCase()} zodat de volgende Pulse-cycle een zichtbaar beter of stabieler beeld kan laten zien?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Beleg correctie en hercheck',
      body: `Gebruik ${topFactorLabel.toLowerCase()} als eerste reviewspoor, beleg direct de eigenaar en spreek nu al af wanneer je deze correctie opnieuw checkt met een managementreview of volgende Pulse.`,
      tone: signalState === 'hoog' ? 'amber' : 'emerald',
    },
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van een Pulse-read direct naar een beperkte maar expliciete correctie- en hercheckroute te gaan.',
    followThroughTitle: 'Van Pulse-snapshot naar actie',
    followThroughIntro:
      'De waarde van Pulse zit in een snelle en begrensde follow-up: eerst kiezen, dan corrigeren, dan bewust opnieuw kijken.',
    followThroughCards: [
      {
        title: 'Prioriteit nu',
        body: `${topFactorLabel} is het eerste spoor voor deze cycle.`,
        tone: 'blue',
      },
      {
        title: 'Eerste gesprek',
        body: `Bespreek binnen 2 weken wat ${topFactorLabel.toLowerCase()} op dit moment precies onder druk zet of juist stabiel houdt.`,
        tone: 'blue',
      },
      {
        title: 'Wie moet aan tafel',
        body: 'HR, betrokken leidinggevende en waar nodig de sponsor van het actieplan.',
        tone: 'amber',
      },
      {
        title: 'Eerste eigenaar',
        body: 'HR met betrokken leidinggevende.',
        tone: 'emerald',
      },
      {
        title: 'Eerste actie',
        body: 'Kies een kleine, zichtbare correctie die binnen 30 dagen merkbaar moet zijn.',
        tone: 'amber',
      },
      {
        title: 'Reviewmoment',
        body: 'Plan direct een hercheck binnen 30-45 dagen en gebruik een volgende Pulse alleen als bounded check op de gekozen correctie.',
        tone: 'emerald',
      },
      {
        title: 'Wanneer geen nieuwe Pulse',
        body: 'Ga niet automatisch door naar nog een Pulse als de vraag eerst bredere diagnose, extra verificatie of lokalisatie vraagt.',
        tone: 'amber',
      },
    ],
  }
}
