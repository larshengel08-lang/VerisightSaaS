export type CultureAssessmentDomainId =
  | 'engagement_involvement'
  | 'trust_psychological_safety'
  | 'leadership_direction'
  | 'collaboration_alignment'
  | 'workload_capacity'
  | 'autonomy_role_clarity'
  | 'growth_development'
  | 'change_readiness'
  | 'reward_conditions'
  | 'organizational_connection_intent'

type ScoreDirection =
  | 'higher_is_more_positive'
  | 'higher_is_more_supportive'
  | 'higher_is_more_sustainable'

type VisibilityRole = 'executive' | 'hr_partner' | 'business_unit_lead' | 'manager_limited' | 'admin'

export const CULTURE_ASSESSMENT_CULTURE_INDEX_COPY =
  'De Loep Culture Index is een navigatiesignaal voor het organisatiebeeld. De index is geen eindoordeel over cultuur, geen individuele beoordeling en geen bewijs van oorzaak-gevolg. Lees de index altijd samen met domeinen, segmentpatronen, responsbasis en governancegrenzen.'

export const CULTURE_ASSESSMENT_DOMAIN_MODEL: Array<{
  id: CultureAssessmentDomainId
  label_nl: string
  label_en: string
  short_description: string
  score_direction: ScoreDirection
  visible_in_executive_view: boolean
  visible_in_hr_view: boolean
}> = [
  {
    id: 'engagement_involvement',
    label_nl: 'Engagement en betrokkenheid',
    label_en: 'Engagement and involvement',
    short_description: 'Laat zien in welke mate medewerkers zich actief betrokken voelen bij werk en organisatie.',
    score_direction: 'higher_is_more_positive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'trust_psychological_safety',
    label_nl: 'Vertrouwen en psychologische veiligheid',
    label_en: 'Trust and psychological safety',
    short_description: 'Toont of vertrouwen, bespreekbaarheid en veilige tegenspraak voldoende aanwezig zijn.',
    score_direction: 'higher_is_more_supportive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'leadership_direction',
    label_nl: 'Leiderschap en richting',
    label_en: 'Leadership and direction',
    short_description: 'Maakt zichtbaar of richting, beschikbaarheid en bestuurlijke sturing helder genoeg worden ervaren.',
    score_direction: 'higher_is_more_supportive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'collaboration_alignment',
    label_nl: 'Samenwerking en alignment',
    label_en: 'Collaboration and alignment',
    short_description: 'Laat zien of samenwerking tussen teams en lagen voldoende aansluit op de organisatierichting.',
    score_direction: 'higher_is_more_positive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'workload_capacity',
    label_nl: 'Werkdruk en draagkracht',
    label_en: 'Workload and capacity',
    short_description: 'Toont of werkdruk, herstel en uitvoerbaarheid nog binnen een houdbare bandbreedte vallen.',
    score_direction: 'higher_is_more_sustainable',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'autonomy_role_clarity',
    label_nl: 'Autonomie en rolhelderheid',
    label_en: 'Autonomy and role clarity',
    short_description: 'Maakt zichtbaar of medewerkers genoeg ruimte en duidelijkheid ervaren om hun werk goed te doen.',
    score_direction: 'higher_is_more_supportive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'growth_development',
    label_nl: 'Groei en ontwikkeling',
    label_en: 'Growth and development',
    short_description: 'Laat zien of perspectief, ontwikkeling en zicht op groei voldoende aanwezig zijn.',
    score_direction: 'higher_is_more_positive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'change_readiness',
    label_nl: 'Veranderbereidheid',
    label_en: 'Change readiness',
    short_description: 'Toont of de organisatie ruimte en bereidheid ervaart om beweging en verandering te dragen.',
    score_direction: 'higher_is_more_supportive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'reward_conditions',
    label_nl: 'Beloning en voorwaarden',
    label_en: 'Reward and conditions',
    short_description: 'Laat zien hoe eerlijk, passend en uitlegbaar beloning en voorwaarden worden ervaren.',
    score_direction: 'higher_is_more_positive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
  {
    id: 'organizational_connection_intent',
    label_nl: 'Organisatieverbinding en intentie',
    label_en: 'Organizational connection and intent',
    short_description: 'Maakt zichtbaar hoe sterk verbondenheid, trots en intentie richting de organisatie worden ervaren.',
    score_direction: 'higher_is_more_positive',
    visible_in_executive_view: true,
    visible_in_hr_view: true,
  },
]

export const CULTURE_ASSESSMENT_CONTRACT = {
  thresholds: {
    organizationMinN: 30,
    locationMinN: 10,
    departmentMinN: 10,
    teamMinN: 8,
    functionGroupMinN: 10,
    managerNamedMinN: 15,
    openTextClusterMinN: 5,
    patternAnalysisMinN: 30,
    segmentComparisonMinN: 10,
  },
  namedManagerLayer: {
    defaultState: 'locked',
    visibleByDefault: false,
  },
  canonicalBlockOrder: [
    'response_basis',
    'executive_culture_read',
    'culture_index',
    'board_attention_points',
    'domain_view',
    'pattern_view',
    'segment_contrasts',
    'deepening_layers',
    'open_signals',
    'board_read_follow_on',
    'report_export_methodology',
  ],
  visibilityRules: {
    executive: ['response_basis', 'executive_culture_read', 'culture_index', 'board_attention_points', 'domain_view'],
    hr_partner: [
      'response_basis',
      'executive_culture_read',
      'culture_index',
      'board_attention_points',
      'domain_view',
      'pattern_view',
      'segment_contrasts',
      'deepening_layers',
      'open_signals',
      'report_export_methodology',
    ],
    business_unit_lead: ['response_basis', 'domain_view', 'segment_contrasts'],
    manager_limited: ['response_basis', 'domain_view'],
    admin: ['response_basis', 'deepening_layers', 'report_export_methodology'],
  } satisfies Record<VisibilityRole, string[]>,
  stateMapping: {
    collecting_responses: {
      userMessage: 'Responses komen nog binnen; het executive culture read opent zodra de minimumrespons veilig gehaald is.',
      primaryAction: 'Bouw responsbasis verder op',
      privacyReasonRequired: false,
    },
    insufficient_response: {
      userMessage: 'Nog niet genoeg respons voor veilige executive weergave.',
      primaryAction: 'Wacht op extra respons of stuur reminders',
      privacyReasonRequired: true,
    },
    results_available: {
      userMessage: 'Resultaten zijn beschikbaar binnen de geldende governancegrenzen.',
      primaryAction: 'Lees index, domeinen en segmentpatronen samen',
      privacyReasonRequired: false,
    },
    segment_suppressed: {
      userMessage: 'Een of meer segmenten blijven verborgen onder de minimum-n grens.',
      primaryAction: 'Gebruik alleen veilige aggregatielagen',
      privacyReasonRequired: true,
    },
    manager_layer_locked: {
      userMessage: 'Named manager detail blijft standaard gesloten.',
      primaryAction: 'Werk vanuit geaggregeerde lagen',
      privacyReasonRequired: true,
    },
    open_text_disabled: {
      userMessage: 'Open tekst is niet geactiveerd voor deze baseline.',
      primaryAction: 'Werk vanuit gesloten vraaglagen',
      privacyReasonRequired: false,
    },
    open_text_suppressed: {
      userMessage: 'Open tekst blijft verborgen tot veilige clustering mogelijk is.',
      primaryAction: 'Gebruik eerst de domein- en patroonlezing',
      privacyReasonRequired: true,
    },
    report_generating: {
      userMessage: 'Het boardrapport wordt voorbereid.',
      primaryAction: 'Wacht op rapportgeneratie',
      privacyReasonRequired: false,
    },
    report_available: {
      userMessage: 'Boardrapport en governed exports zijn beschikbaar.',
      primaryAction: 'Open rapport of HR-bijlage',
      privacyReasonRequired: false,
    },
    benchmark_not_available: {
      userMessage: 'Benchmarking blijft in v1 bewust niet actief.',
      primaryAction: 'Lees het eigen organisatiebeeld zonder benchmark',
      privacyReasonRequired: false,
    },
  },
  exports: {
    boardReportPdf: true,
    hrAppendixPdf: true,
    segmentSummaryExport: true,
    openTextAppendixWhenEnabled: true,
    noIndividualDataExport: true,
  },
} as const
