import type { CultureAssessmentDomainId } from '@/lib/products/culture_assessment/contract'

export type CultureAssessmentScaleId = 'agreement_5pt'

export type CultureAssessmentQuestionnaireItem = {
  id: string
  domainId: CultureAssessmentDomainId
  prompt_nl: string
  scaleId: CultureAssessmentScaleId
  reverseScored: boolean
}

export const CULTURE_ASSESSMENT_RESPONSE_SCALES = {
  agreement_5pt: {
    min: 1,
    max: 5,
    labels_nl: ['Helemaal oneens', 'Eerder oneens', 'Neutraal / gemengd', 'Eerder eens', 'Helemaal eens'],
    labels_en: ['Strongly disagree', 'Disagree', 'Neutral / mixed', 'Agree', 'Strongly agree'],
  },
} as const

export const CULTURE_ASSESSMENT_TARGET_COMPLETION = {
  targetMinutes: 12,
  maxMinutes: 14,
} as const

export const CULTURE_ASSESSMENT_MIN_VALID_RESPONSE_RULES = {
  minimumClosedItemsAnswered: 32,
  minimumAnsweredItemsPerDomain: 3,
  minimumValidDomains: 8,
  openTextOptional: true,
} as const

export const CULTURE_ASSESSMENT_DOMAIN_MIN_ITEM_COUNT: Record<CultureAssessmentDomainId, number> = {
  engagement_involvement: 4,
  trust_psychological_safety: 4,
  leadership_direction: 4,
  collaboration_alignment: 4,
  workload_capacity: 4,
  autonomy_role_clarity: 4,
  growth_development: 4,
  change_readiness: 4,
  reward_conditions: 4,
  organizational_connection_intent: 4,
}

export const CULTURE_ASSESSMENT_QUESTIONNAIRE_ITEMS: CultureAssessmentQuestionnaireItem[] = [
  { id: 'CA01', domainId: 'engagement_involvement', prompt_nl: 'Ik zet mij actief in om mijn werk goed en zorgvuldig te doen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA02', domainId: 'engagement_involvement', prompt_nl: 'Mijn werk geeft mij meestal energie om betrokken te blijven.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA03', domainId: 'engagement_involvement', prompt_nl: 'Ik voel mij verantwoordelijk voor het gezamenlijke resultaat.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA04', domainId: 'engagement_involvement', prompt_nl: 'Ik zie in mijn werk weinig reden om extra inzet te tonen.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA05', domainId: 'trust_psychological_safety', prompt_nl: 'Ik kan zorgen of fouten hier bespreekbaar maken zonder onnodig risico te voelen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA06', domainId: 'trust_psychological_safety', prompt_nl: 'Mensen luisteren hier serieus naar een afwijkend geluid.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA07', domainId: 'trust_psychological_safety', prompt_nl: 'Ik ervaar voldoende vertrouwen tussen collega’s en leiding.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA08', domainId: 'trust_psychological_safety', prompt_nl: 'Ik houd belangrijke zorgen hier liever voor mezelf.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA09', domainId: 'leadership_direction', prompt_nl: 'De organisatie geeft mij voldoende duidelijke richting over wat nu belangrijk is.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA10', domainId: 'leadership_direction', prompt_nl: 'Besluiten van leiding of directie zijn voor mij meestal goed te volgen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA11', domainId: 'leadership_direction', prompt_nl: 'Ik weet voldoende waar de organisatie naartoe wil bewegen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA12', domainId: 'leadership_direction', prompt_nl: 'Besluiten van bovenaf voelen voor mij vaak onduidelijk of tegenstrijdig.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA13', domainId: 'collaboration_alignment', prompt_nl: 'Samenwerking tussen teams of onderdelen werkt voor mijn werk meestal goed.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA14', domainId: 'collaboration_alignment', prompt_nl: 'Afspraken tussen teams worden meestal nagekomen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA15', domainId: 'collaboration_alignment', prompt_nl: 'Ik ervaar voldoende afstemming tussen wat verschillende onderdelen van elkaar vragen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA16', domainId: 'collaboration_alignment', prompt_nl: 'Samenwerking tussen teams kost ons onnodig veel energie.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA17', domainId: 'workload_capacity', prompt_nl: 'Mijn werk is in de praktijk meestal goed vol te houden.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA18', domainId: 'workload_capacity', prompt_nl: 'Ik heb meestal genoeg ruimte om mijn werk goed af te ronden.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA19', domainId: 'workload_capacity', prompt_nl: 'Ik kan mijn werk meestal doen zonder dat herstel structureel in de knel komt.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA20', domainId: 'workload_capacity', prompt_nl: 'Mijn werkdruk is meestal niet lang vol te houden.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA21', domainId: 'autonomy_role_clarity', prompt_nl: 'Ik weet goed wat er in mijn rol van mij verwacht wordt.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA22', domainId: 'autonomy_role_clarity', prompt_nl: 'Ik heb voldoende ruimte om mijn werk op een passende manier uit te voeren.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA23', domainId: 'autonomy_role_clarity', prompt_nl: 'Taken, verantwoordelijkheden en beslissingsruimte zijn voor mij meestal helder.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA24', domainId: 'autonomy_role_clarity', prompt_nl: 'Ik moet te vaak zelf uitzoeken wat precies van mij verwacht wordt.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA25', domainId: 'growth_development', prompt_nl: 'Ik zie voldoende mogelijkheden om mij in mijn werk verder te ontwikkelen.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA26', domainId: 'growth_development', prompt_nl: 'Ik krijg feedback die mij helpt beter te worden in mijn werk.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA27', domainId: 'growth_development', prompt_nl: 'Ik ervaar voldoende perspectief om in deze organisatie te groeien.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA28', domainId: 'growth_development', prompt_nl: 'Ik zie voor mezelf weinig ontwikkelperspectief binnen deze organisatie.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA29', domainId: 'change_readiness', prompt_nl: 'De organisatie kan veranderingen meestal werkbaar vertalen naar de praktijk.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA30', domainId: 'change_readiness', prompt_nl: 'Ik ervaar voldoende ruimte om mee te bewegen met verandering.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA31', domainId: 'change_readiness', prompt_nl: 'Veranderingen worden meestal duidelijk genoeg uitgelegd om ermee te kunnen werken.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA32', domainId: 'change_readiness', prompt_nl: 'Veranderingen voelen hier vaak als extra last zonder duidelijke richting.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA33', domainId: 'reward_conditions', prompt_nl: 'De voorwaarden om mijn werk goed te doen zijn meestal op orde.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA34', domainId: 'reward_conditions', prompt_nl: 'Beloning en waardering voelen voor mij in hoofdlijnen eerlijk.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA35', domainId: 'reward_conditions', prompt_nl: 'De organisatie biedt mij voorwaarden die passen bij wat het werk vraagt.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA36', domainId: 'reward_conditions', prompt_nl: 'Beloning en voorwaarden voelen voor mij niet in verhouding tot wat er gevraagd wordt.', scaleId: 'agreement_5pt', reverseScored: true },

  { id: 'CA37', domainId: 'organizational_connection_intent', prompt_nl: 'Ik voel mij verbonden met deze organisatie.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA38', domainId: 'organizational_connection_intent', prompt_nl: 'Ik ben er trots op om voor deze organisatie te werken.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA39', domainId: 'organizational_connection_intent', prompt_nl: 'Ik kan mij goed vinden in waar deze organisatie voor staat.', scaleId: 'agreement_5pt', reverseScored: false },
  { id: 'CA40', domainId: 'organizational_connection_intent', prompt_nl: 'Ik kan me moeilijk voorstellen dat ik hier over een jaar nog graag werk.', scaleId: 'agreement_5pt', reverseScored: true },
]

export const CULTURE_ASSESSMENT_SCORING_LOCK = {
  scaleId: 'agreement_5pt' as const,
  normalizedOutputScale: '0_to_10' as const,
  domainScoreMethod: 'mean_of_answered_items_after_reverse_scoring' as const,
  cultureIndexMethod: 'mean_of_valid_domain_scores' as const,
  reverseScoringMethod: 'agreement_5pt_inversion' as const,
  requiresMinimumValidRules: true,
} as const

export const CULTURE_ASSESSMENT_BOARD_ATTENTION_LOGIC = {
  inputs: ['domain_scores', 'segment_spread', 'response_coverage', 'contrast_strength', 'recurring_theme_pairs', 'safe_open_text_clusters'],
  outputs: ['attention_points_max_5', 'priority_reason', 'confidence_label', 'what_to_verify_next'],
  forbiddenOutputs: ['causal_diagnosis', 'automatic_intervention_advice', 'manager_blame'],
  confidenceLabels: ['hoog', 'midden', 'voorzichtig'],
} as const

