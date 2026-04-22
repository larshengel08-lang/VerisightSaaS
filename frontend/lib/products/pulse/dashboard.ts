import type { DashboardViewModel } from '@/lib/products/shared/types'
import { FACTOR_LABELS } from '@/lib/types'

const SIGNAL_BANDS_TEXT =
  'Laag, midden en hoog pulsignaal laten alleen zien hoe scherp de huidige Pulse als groepsread opent. Gebruik deze banding samen met de vorige vergelijkbare Pulse waar die veilig leesbaar is, niet als trendbewijs of individuele score.'

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
            ? `Welke ${args.pendingCount} respondent(en) ontbreken nog om een eerste bruikbare Pulse-read te openen?`
            : 'Welke extra responses zijn nog nodig voordat deze Pulse veilig als groepsread gelezen kan worden?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst respons opbouwen',
        body:
          args.pendingCount > 0
            ? `Stuur eerst de resterende ${args.pendingCount} respondent(en) een reminder. Pulse wordt pas bruikbaar zodra er genoeg groepsinput is.`
            : 'Gebruik deze Pulse nog niet als managementread. Bouw eerst genoeg responses op voor veilige groepsduiding.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Zodra er genoeg responses zijn helpt Pulse vooral om sneller te kiezen welk werkspoor nu review of bijsturing vraagt.',
      followThroughTitle: 'Van eerste read naar review',
      followThroughIntro:
        'De vaste vervolgroute verschijnt zodra Pulse veilig genoeg is om als compacte groepsread te openen.',
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
        body: `Gebruik ${topFactorLabel.toLowerCase()} alvast als eerste gesprekshaak, maar behandel deze Pulse nog als indicatieve groepsread totdat minimaal 10 responses binnen zijn.`,
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik de vragen hieronder nu vooral om te bepalen welke beperkte review of koerscorrectie als eerste logisch is.',
      followThroughTitle: 'Van eerste read naar review',
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
          body: 'Herlees deze Pulse zodra minimaal 10 responses binnen zijn of de eerste correctie zichtbaar is.',
          tone: 'amber',
        },
      ],
    }
  }

  const signalRead =
    signalState === 'hoog'
      ? `Deze Pulse opent als scherp reviewsignaal. ${topFactorLabel} vraagt nu zichtbare bespreking of bijsturing.`
      : signalState === 'midden'
        ? `Deze Pulse opent als compact reviewsignaal. ${topFactorLabel} verdient nu de eerste managementreview.`
        : `Deze Pulse oogt overwegend stabiel. Gebruik vooral ${topFactorLabel.toLowerCase()} als eerste monitoringsspoor om vast te houden wat werkt.`

  const reviewDirection = secondFactorLabel
    ? `${topFactorLabel} en ${secondFactorLabel.toLowerCase()} vormen samen de compacte reviewvraag van deze cycle.`
    : `${topFactorLabel} vormt de compacte reviewvraag van deze cycle.`
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
            ? 'Directe herijking nodig'
            : signalState === 'midden'
              ? 'Compact reviewsignaal'
              : 'Overwegend stabiel',
        body: signalRead,
        tone: signalState === 'hoog' ? 'amber' : signalState === 'laag' ? 'emerald' : 'blue',
      },
      {
        title: 'Eerste reviewspoor',
        value: topFactorLabel,
        body: reviewDirection,
        tone: 'blue',
      },
      {
        title: 'Eerste eigenaar',
        value: 'HR + leidinggevende',
        body: 'Beleg deze herijking eerst bij HR met de betrokken leidinggevende en houd de route klein totdat een bredere escalatie echt nodig blijkt.',
        tone: 'emerald',
      },
      {
        title: 'Reviewmoment',
        value: '30-45 dagen',
        body: `${repeatMotionText} Gebruik de vorige vergelijkbare Pulse alleen als bounded hercheck en niet als brede trendlaag.`,
        tone: signalState === 'hoog' ? 'amber' : 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Wat vraagt nu directe aandacht?',
        intro: signalRead,
        items: [
          `${topFactorLabel} is nu het eerste werkspoor.`,
          secondFactorLabel ? `${secondFactorLabel} is het tweede spoor om mee te lezen.` : 'Lees dit samen met de korte werkbelevingscheck.',
        ],
        tone: 'blue',
      },
      {
        title: 'Wat moet nu worden herijkt?',
        items: [
          `Kies rond ${topFactorLabel.toLowerCase()} nu één compacte herijking in plaats van een brede vervolgroute.`,
          'Beleg direct de eigenaar en zet een bounded hercheck klaar voor de eerstvolgende managementcheck.',
        ],
        tone: 'amber',
      },
    ],
    profileCards: [
      {
        title: 'Leeswijze',
        value: 'Reviewlaag',
        body: 'Pulse is bedoeld als compacte managementhandoff: actuele groepsread, begrensde vergelijking met de vorige vergelijkbare Pulse en een expliciete bounded hercheck.',
        tone: 'blue',
      },
    ],
    primaryQuestion: {
      title: 'Eerste managementvraag',
      body: `Welke compacte review- of herijkingsvraag vraagt nu direct aandacht rond ${topFactorLabel.toLowerCase()}?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Beleg herijking',
      body: `Gebruik ${topFactorLabel.toLowerCase()} als eerste reviewspoor, kies één compacte herijking en spreek direct af wanneer de bounded hercheck plaatsvindt.`,
      tone: signalState === 'hoog' ? 'amber' : 'emerald',
    },
    focusSectionIntro:
      'Gebruik de vragen en playbooks hieronder om van een Pulse-read direct naar een beperkte herijking en bounded hercheck te gaan.',
    followThroughTitle: 'Van herijking naar bounded hercheck',
    followThroughIntro:
      'De waarde van Pulse zit in een korte vervolgroute: eerst kiezen, dan herijken, dan bewust opnieuw kijken.',
    followThroughCards: [
      {
        title: 'Eerste gesprek',
        body: `Bespreek binnen 2 weken wat ${topFactorLabel.toLowerCase()} op dit moment precies onder druk zet of juist stabiel houdt.`,
        tone: 'blue',
      },
      {
        title: 'Eerste stap',
        body: 'Kies een kleine, zichtbare correctie die binnen 30 dagen merkbaar moet zijn.',
        tone: 'amber',
      },
      {
        title: 'Eerste eigenaar',
        body: 'HR met betrokken leidinggevende.',
        tone: 'emerald',
      },
      {
        title: 'Reviewmoment',
        body: 'Plan direct een hercheck binnen 30-45 dagen en gebruik een volgende Pulse alleen als bounded check op de gekozen correctie.',
        tone: 'emerald',
      },
    ],
  }
}
