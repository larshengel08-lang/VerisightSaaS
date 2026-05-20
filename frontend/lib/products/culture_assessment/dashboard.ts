import type { DashboardViewModel } from '@/lib/products/shared/types'

import {
  CULTURE_ASSESSMENT_CONTRACT,
  CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
  CULTURE_ASSESSMENT_DOMAIN_MODEL,
  type CultureAssessmentDomainId,
} from '@/lib/products/culture_assessment/contract'

const DOMAIN_LABELS = Object.fromEntries(
  CULTURE_ASSESSMENT_DOMAIN_MODEL.map((domain) => [domain.id, domain.label_nl]),
) as Record<CultureAssessmentDomainId, string>

function getLowestScoringDomains(factorAverages: Record<string, number>) {
  return Object.entries(factorAverages)
    .filter((entry): entry is [CultureAssessmentDomainId, number] =>
      CULTURE_ASSESSMENT_DOMAIN_MODEL.some((domain) => domain.id === entry[0]),
    )
    .sort((left, right) => left[1] - right[1])
    .slice(0, 3)
    .map(([domainId, score]) => ({
      domainId,
      label: DOMAIN_LABELS[domainId],
      score,
    }))
}

function formatScore(value: number | null) {
  return typeof value === 'number' ? `${value.toFixed(1)}/10` : 'Nog niet zichtbaar'
}

export function buildCultureAssessmentDashboardViewModel(args: {
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
  const lowestDomains = getLowestScoringDomains(args.factorAverages)
  const firstAttentionLabel = lowestDomains[0]?.label ?? 'het totale domeinbeeld'
  const secondAttentionLabel = lowestDomains[1]?.label ?? null

  if (!args.hasMinDisplay) {
    return {
      signaalbandenText: CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
      topSummaryCards: [],
      managementBlocks: [],
      profileCards: [],
      primaryQuestion: {
        title: 'Bestuurlijke eerste vraag',
        body:
          args.pendingCount > 0
            ? `Welke extra respons is nog nodig voordat een eerste veilig organisatiebeeld zichtbaar wordt voor board en HR? Nog ${args.pendingCount} respons ontbreekt richting de minimale executive basis.`
            : 'Welke extra respons is nog nodig voordat een eerste veilig organisatiebeeld zichtbaar wordt voor board en HR?',
        tone: 'amber',
      },
      nextStep: {
        title: 'Eerst meetdekking opbouwen',
        body: `De executive laag opent pas vanaf minimaal ${CULTURE_ASSESSMENT_CONTRACT.thresholds.organizationMinN} responses op organisatieniveau.`,
        tone: 'amber',
      },
      focusSectionIntro:
        'De eerste bestuurlijke lezing verschijnt pas zodra de responsbasis veilig genoeg is voor organisatiebrede weergave.',
      followThroughTitle: 'Governance eerst',
      followThroughIntro:
        'Zonder veilige responsbasis opent deze route nog geen executive culture read, segmentcontrast of drilldown.',
      followThroughCards: [
        {
          title: 'Minimum-n',
          body: `Organisatieniveau opent vanaf ${CULTURE_ASSESSMENT_CONTRACT.thresholds.organizationMinN}; kleinere lagen volgen pas boven hun eigen grens.`,
          tone: 'amber',
        },
      ],
      managementBandOverride: null,
    }
  }

  if (!args.hasEnoughData) {
    return {
      signaalbandenText: CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
      topSummaryCards: [
        {
          title: 'Responsbasis',
          value: 'Indicatief',
          body: 'De eerste executive lezing is zichtbaar, maar segment- en patroonuitleg blijft nog voorzichtig door de beperkte breedte van de respons.',
          tone: 'amber',
        },
      ],
      managementBlocks: [
        {
          title: 'Voorzichtige eerste lezing',
          intro: 'Gebruik dit beeld om eerste bestuurlijke aandacht te ordenen, niet om definitieve conclusies te trekken.',
          items: [
            `${firstAttentionLabel} valt nu het eerst op in de beperkte responsbasis.`,
            'Segmentcontrasten en open signalen blijven nog beperkt of onderdrukt zolang meetdekking niet volledig genoeg is.',
          ],
          tone: 'amber',
        },
      ],
      profileCards: [],
      primaryQuestion: {
        title: 'Bestuurlijke eerste vraag',
        body: `Welk eerste organisatiepatroon rond ${firstAttentionLabel.toLowerCase()} vraagt nu al bestuurlijke aandacht, zonder het voorlopige beeld te overschatten?`,
        tone: 'blue',
      },
      nextStep: {
        title: 'Responsbasis verdiepen',
        body: 'Vergroot eerst de meetdekking voordat segmentvergelijking of governed drilldown wordt opengesteld.',
        tone: 'amber',
      },
      focusSectionIntro:
        'Gebruik de eerste lezing om board en HR voor te bereiden op de zwaardere baseline-read zodra de responsbasis steviger staat.',
      followThroughTitle: 'Van eerste read naar volledige baseline',
      followThroughIntro:
        'Zodra de bredere census binnen is, verschuift de route van indicatief beeld naar volledige executive baseline.',
      followThroughCards: [
        {
          title: 'Board read later',
          body: 'Plan de board-read pas wanneer de organisatiebasis stabiel genoeg is om patronen echt naast elkaar te leggen.',
          tone: 'blue',
        },
      ],
      managementBandOverride: null,
    }
  }

  const attentionSummary = secondAttentionLabel
    ? `${firstAttentionLabel} en ${secondAttentionLabel.toLowerCase()} vragen als eerste bestuurlijke aandacht in samenhang.`
    : `${firstAttentionLabel} vraagt als eerste bestuurlijke aandacht in het huidige organisatiebeeld.`

  return {
    signaalbandenText: CULTURE_ASSESSMENT_CULTURE_INDEX_COPY,
    topSummaryCards: [
      {
        title: 'Loep Culture Index',
        value: formatScore(args.averageSignal),
        body: 'Lees deze index als navigatiesignaal boven een breder cultuur- en engagementbeeld, nooit als totaaloordeel.',
        tone: 'blue',
      },
      {
        title: 'Eerste aandacht',
        value: firstAttentionLabel,
        body: attentionSummary,
        tone: 'amber',
      },
      {
        title: 'Engagementlaag',
        value: formatScore(args.engagement),
        body: 'Engagement blijft een belangrijk domein, maar niet de volledige samenvatting van het organisatiebeeld.',
        tone: 'emerald',
      },
      {
        title: 'Governed drilldown',
        value: 'Veilig begrensd',
        body: `Segmentvergelijking opent alleen boven veilige drempels; named manager detail blijft standaard ${CULTURE_ASSESSMENT_CONTRACT.namedManagerLayer.defaultState}.`,
        tone: 'blue',
      },
    ],
    managementBlocks: [
      {
        title: 'Welke brede patronen vragen aandacht?',
        intro: 'Gebruik de eerste lezing om te bepalen waar de meeste spanning of spreiding zichtbaar wordt, zonder scoreduiding als eindconclusie.',
        items: [
          `${firstAttentionLabel} valt nu als eerste op in het domeinbeeld.`,
          secondAttentionLabel
            ? `${secondAttentionLabel} loopt daar direct naast als tweede bestuurlijke lezing.`
            : 'Gebruik de aanvullende domeinen om te toetsen of dit patroon lokaal of breder terugkomt.',
        ],
        tone: 'blue',
      },
      {
        title: 'Welke verschillen zijn bestuurlijk relevant?',
        items: [
          'Zoek eerst naar contrasten tussen organisatieonderdelen, niet naar individuele of managervergelijkingen.',
          'Open verdiepend segmentbeeld alleen binnen veilige aggregatielagen en boven de geldende thresholds.',
        ],
        tone: 'amber',
      },
      {
        title: 'Hoe lees je dit veilig?',
        items: [
          'Gebruik de index samen met domeinen, segmentpatronen, responsbasis en suppressieregels.',
          'Houd named manager detail en benchmarklogica gesloten in deze v1-baseline.',
        ],
        tone: 'emerald',
      },
    ],
    profileCards: [
      {
        title: 'Leesmodus',
        value: 'Executive culture read',
        body: 'Board en HR lezen eerst het organisatiebeeld, daarna pas domeinen, segmentcontrasten en governed drilldown.',
        tone: 'blue',
      },
      {
        title: 'Open signalen',
        value: 'Optioneel',
        body: `Open tekst is alleen beschikbaar als die veilig geclusterd kan worden vanaf ${CULTURE_ASSESSMENT_CONTRACT.thresholds.openTextClusterMinN} signalen.`,
        tone: 'emerald',
      },
    ],
    primaryQuestion: {
      title: 'Bestuurlijke eerste vraag',
      body: `Welke brede cultuur- en engagementpatronen vragen op organisatieniveau bestuurlijke aandacht, en waar zitten de belangrijkste verschillen tussen onderdelen van de organisatie rond ${firstAttentionLabel.toLowerCase()}?`,
      tone: 'blue',
    },
    nextStep: {
      title: 'Board-read voorbereiden',
      body: 'Orden eerst executive aandachtspunten, daarna segmentcontrasten en pas daarna governed verdiepingslagen voor HR of onderdelen.',
      tone: 'emerald',
    },
    focusSectionIntro:
      'Gebruik de focusvragen en playbooks hieronder om het boardgesprek descriptief, patroon-gedreven en binnen governancegrenzen te houden.',
    followThroughTitle: 'Van executive read naar vervolgritme',
    followThroughIntro:
      'De baseline eindigt in board-read en governed vervolgkeuzes. Pulse kan daarna volgen als apart reviewritme, maar hoort niet in de baseline zelf.',
    followThroughCards: [
      {
        title: 'Board-overview',
        body: 'Begin met responsbasis, index en eerste aandachtspunten voordat je de diepere lagen opent.',
        tone: 'blue',
      },
      {
        title: 'Governed segmentread',
        body: 'Gebruik segmentcontrasten om spreiding zichtbaar te maken, niet om onderdelen of managers te rangschikken.',
        tone: 'amber',
      },
      {
        title: 'Vervolg na baseline',
        body: 'Kies pas na de board-read tussen geen onmiddellijke vervolgrichting, deeper governed work, een bounded Pulse-follow-on of een andere Loep-route zoals RetentieScan of ExitScan als de vervolgvraag echt smaller is.',
        tone: 'emerald',
      },
    ],
    managementBandOverride: null,
  }
}
