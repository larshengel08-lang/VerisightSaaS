export type ContactRouteInterest =
  | 'exitscan'
  | 'retentiescan'
  | 'onboarding'
  | 'combinatie'
  | 'leadership'
  | 'teamscan'
  | 'nog-onzeker'

type ContactRouteOption = {
  value: ContactRouteInterest
  label: string
  description: string
  firstStepLabel: string
}

export const CONTACT_ROUTE_OPTIONS: ContactRouteOption[] = [
  {
    value: 'exitscan',
    label: 'ExitScan',
    description: 'We willen vertrek achteraf beter duiden.',
    firstStepLabel: 'ExitScan Baseline',
  },
  {
    value: 'retentiescan',
    label: 'RetentieScan',
    description: 'We willen eerder zien waar behoud onder druk staat.',
    firstStepLabel: 'RetentieScan Baseline',
  },
  {
    value: 'onboarding',
    label: 'Onboarding 30-60-90',
    description: 'De primaire vraag gaat over nieuwe medewerkers, vroege landing en eerste lifecycle-frictie.',
    firstStepLabel: 'een begrensde onboarding-checkpoint peer-route',
  },
  {
    value: 'combinatie',
    label: 'Combinatie',
    description: 'Alleen wanneer vertrekduiding en behoudsvraag allebei bestuurlijk tegelijk spelen.',
    firstStepLabel: 'een gefaseerde combinatieroute',
  },
  {
    value: 'leadership',
    label: 'Leadership Scan',
    description: 'Na een bestaand people-signaal willen we bepalen welke managementcontext eerst duiding vraagt.',
    firstStepLabel: 'een bounded Leadership Scan follow-on route na een bestaand signaal',
  },
  {
    value: 'nog-onzeker',
    label: 'Nog niet zeker',
    description: 'We willen eerst de juiste route bepalen.',
    firstStepLabel: 'de logischste eerste route',
  },
] as const

const LEGACY_CONTACT_ROUTE_OPTIONS: ContactRouteOption[] = [
  {
    value: 'teamscan',
    label: 'TeamScan',
    description: 'Na een breder signaal willen we lokaal bepalen waar eerst verificatie nodig is.',
    firstStepLabel: 'een bounded TeamScan follow-on route na een bestaand signaal',
  },
] as const

export const CONTACT_DESIRED_TIMING_OPTIONS = [
  {
    value: 'zo-snel-mogelijk',
    label: 'Zo snel mogelijk',
    description: 'Er is nu al urgentie rond uitstroom of behoud.',
  },
  {
    value: 'deze-maand',
    label: 'Deze maand',
    description: 'We willen op korte termijn een eerste traject starten.',
  },
  {
    value: 'dit-kwartaal',
    label: 'Dit kwartaal',
    description: 'We verkennen nu de eerstvolgende logische stap.',
  },
  {
    value: 'orienterend',
    label: 'Orienterend',
    description: 'We willen eerst richting, aanpak en fit toetsen.',
  },
] as const

export type ContactDesiredTiming = (typeof CONTACT_DESIRED_TIMING_OPTIONS)[number]['value']
export type PrimaryContactRouteInterest = Extract<
  ContactRouteInterest,
  'exitscan' | 'retentiescan' | 'onboarding' | 'combinatie'
>
export type FollowOnContactRouteInterest = Extract<ContactRouteInterest, 'teamscan' | 'leadership'>
export type ContactQualificationStatus =
  | 'core_default'
  | 'retention_primary'
  | 'onboarding_peer_primary'
  | 'combination_candidate'
  | 'bounded_follow_on_review'
  | 'follow_on_reframe'
  | 'uncertain_core_review'

type BuildContactHrefOptions = {
  routeInterest?: ContactRouteInterest
  ctaSource?: string
  desiredTiming?: ContactDesiredTiming
}

type ContactQualificationInput = {
  routeInterest?: string | null | undefined
  desiredTiming?: string | null | undefined
  currentQuestion?: string | null | undefined
}

export type ContactQualificationGuidance = {
  status: ContactQualificationStatus
  recommendedRoute: PrimaryContactRouteInterest
  followOnCandidateRoute: FollowOnContactRouteInterest | null
  headline: string
  detail: string
  operatorSummary: string
}

const routeOptionMap = new Map([...CONTACT_ROUTE_OPTIONS, ...LEGACY_CONTACT_ROUTE_OPTIONS].map((option) => [option.value, option]))
const timingOptionMap = new Map(CONTACT_DESIRED_TIMING_OPTIONS.map((option) => [option.value, option]))
const followOnRoutes = new Set<FollowOnContactRouteInterest>(['teamscan', 'leadership'])

const EXIT_SIGNAL_KEYWORDS = [
  'exit',
  'vertrek',
  'uitstroom',
  'vertrekreden',
  'vertrekredenen',
  'leaver',
  'achteraf',
]

const RETENTION_SIGNAL_KEYWORDS = [
  'retentie',
  'behoud',
  'behouden',
  'vroegsignaal',
  'vroeg signaal',
  'stay',
  'blijven',
  'verloop voorkomen',
]

const TEAM_SIGNAL_KEYWORDS = ['team', 'teams', 'afdeling', 'afdelingen', 'lokaal', 'leidingcontext']
const ONBOARDING_SIGNAL_KEYWORDS = [
  'onboarding',
  'nieuwe medewerker',
  'nieuwe medewerkers',
  'landing',
  'instroom',
  'eerste 30',
  'eerste 60',
  'eerste 90',
  'eerste weken',
]
const LEADERSHIP_SIGNAL_KEYWORDS = ['leadership', 'leiderschap', 'leiding', 'managementcontext', 'managementlaag']
const FOLLOW_ON_EVIDENCE_KEYWORDS = [
  'bestaand signaal',
  'eerste signaal',
  'baseline',
  'bestaand beeld',
  'vervolg',
  'verdieping',
  'opvolging',
  'review',
  'na een',
  'na het',
  'na de',
]

export function isContactRouteInterest(value: string | null | undefined): value is ContactRouteInterest {
  return !!value && routeOptionMap.has(value as ContactRouteInterest)
}

export function isContactDesiredTiming(value: string | null | undefined): value is ContactDesiredTiming {
  return !!value && timingOptionMap.has(value as ContactDesiredTiming)
}

export function normalizeContactRouteInterest(value: string | null | undefined): ContactRouteInterest {
  if (isContactRouteInterest(value)) {
    return value
  }
  return 'exitscan'
}

export function normalizeContactDesiredTiming(value: string | null | undefined): ContactDesiredTiming {
  if (isContactDesiredTiming(value)) {
    return value
  }
  return 'orienterend'
}

export function inferRouteInterestFromSource(source: string | null | undefined): ContactRouteInterest {
  const normalizedSource = (source ?? '').toLowerCase()
  if (normalizedSource.includes('retentie')) {
    return 'retentiescan'
  }
  if (normalizedSource.includes('combin')) {
    return 'combinatie'
  }
  if (normalizedSource.includes('team')) {
    return 'teamscan'
  }
  if (normalizedSource.includes('onboarding')) {
    return 'onboarding'
  }
  if (normalizedSource.includes('leadership')) {
    return 'leadership'
  }
  if (normalizedSource.includes('onzeker')) {
    return 'nog-onzeker'
  }
  return 'exitscan'
}

export function getContactRouteLabel(value: string | null | undefined) {
  return routeOptionMap.get(normalizeContactRouteInterest(value))?.label ?? 'ExitScan'
}

export function getContactDesiredTimingLabel(value: string | null | undefined) {
  return timingOptionMap.get(normalizeContactDesiredTiming(value))?.label ?? 'Orienterend'
}

export function getContactFirstStepLabel(value: string | null | undefined) {
  return routeOptionMap.get(normalizeContactRouteInterest(value))?.firstStepLabel ?? 'ExitScan Baseline'
}

export function normalizeContactCtaSource(value: string | null | undefined) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized.length > 0 ? normalized.slice(0, 120) : 'website_primary_cta'
}

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function detectFollowOnCandidateRoute(text: string): FollowOnContactRouteInterest | null {
  if (includesAnyKeyword(text, TEAM_SIGNAL_KEYWORDS)) {
    return 'teamscan'
  }
  if (includesAnyKeyword(text, LEADERSHIP_SIGNAL_KEYWORDS)) {
    return 'leadership'
  }
  return null
}

export function getContactQualificationGuidance({
  routeInterest,
  desiredTiming,
  currentQuestion,
}: ContactQualificationInput): ContactQualificationGuidance {
  const normalizedRoute = normalizeContactRouteInterest(routeInterest)
  const normalizedTiming = normalizeContactDesiredTiming(desiredTiming)
  const normalizedQuestion = (currentQuestion ?? '').trim().toLowerCase()
  const hasExitSignal = includesAnyKeyword(normalizedQuestion, EXIT_SIGNAL_KEYWORDS)
  const hasRetentionSignal = includesAnyKeyword(normalizedQuestion, RETENTION_SIGNAL_KEYWORDS)
  const followOnEvidence = includesAnyKeyword(normalizedQuestion, FOLLOW_ON_EVIDENCE_KEYWORDS)
  const explicitFollowOnCandidate = followOnRoutes.has(normalizedRoute as FollowOnContactRouteInterest)
    ? (normalizedRoute as FollowOnContactRouteInterest)
    : null
  const inferredFollowOnCandidate = detectFollowOnCandidateRoute(normalizedQuestion)
  const followOnCandidateRoute = explicitFollowOnCandidate ?? inferredFollowOnCandidate

  const hasOnboardingSignal = includesAnyKeyword(normalizedQuestion, ONBOARDING_SIGNAL_KEYWORDS)
  let recommendedRoute: PrimaryContactRouteInterest = 'exitscan'
  if (hasExitSignal && hasRetentionSignal) {
    recommendedRoute = 'combinatie'
  } else if (hasRetentionSignal && !hasExitSignal) {
    recommendedRoute = 'retentiescan'
  } else if (hasOnboardingSignal && !hasExitSignal && !hasRetentionSignal) {
    recommendedRoute = 'onboarding'
  } else if (normalizedRoute === 'onboarding') {
    recommendedRoute = 'onboarding'
  } else if (normalizedRoute === 'retentiescan') {
    recommendedRoute = 'retentiescan'
  } else if (normalizedRoute === 'combinatie') {
    recommendedRoute = 'combinatie'
  }

  if (followOnCandidateRoute && followOnEvidence) {
    return {
      status: 'bounded_follow_on_review',
      recommendedRoute,
      followOnCandidateRoute,
      headline: `${getContactRouteLabel(followOnCandidateRoute)} blijft een bounded vervolgrichting.`,
      detail: `We behandelen dit pas als logische vervolgstap nadat intake bevestigt dat er al een bestaand signaal, baseline of eerdere managementread staat. Tot die bevestiging blijft ${getContactRouteLabel(recommendedRoute)} de veiligste eerste routekaderschets.`,
      operatorSummary: `${getContactRouteLabel(followOnCandidateRoute)} is genoemd als bounded follow-on route; verifieer bestaand signaal en toets eerst of ${getContactRouteLabel(recommendedRoute)} al stevig staat.`,
    }
  }

  if (followOnCandidateRoute) {
    return {
      status: 'follow_on_reframe',
      recommendedRoute,
      followOnCandidateRoute,
      headline: `${getContactRouteLabel(followOnCandidateRoute)} openen we niet als vlakke eerste intake-route.`,
      detail: `Zonder expliciet bestaand signaal of eerdere baseline vernauwen we deze aanvraag eerst richting ${getContactRouteLabel(recommendedRoute)}. Daarna bepalen we pas of ${getContactRouteLabel(followOnCandidateRoute)} echt logisch is als bounded vervolgroute.`,
      operatorSummary: `${getContactRouteLabel(followOnCandidateRoute)} is nog te vroeg als eerste route; vernauw de intake eerst richting ${getContactRouteLabel(recommendedRoute)} en leg daarna pas een eventuele follow-on vast.`,
    }
  }

  if (recommendedRoute === 'combinatie') {
    return {
      status: 'combination_candidate',
      recommendedRoute,
      followOnCandidateRoute: null,
      headline: 'Combinatie is alleen logisch als beide kernvragen echt tegelijk spelen.',
      detail: `De huidige vraag wijst zowel op vertrekduiding via Frictiescore als op vroeg behoudssignaal via Retentiesignaal. Daarom mag een gefaseerde combinatieroute in intake getoetst worden, maar alleen als beide managementvragen echt actief zijn en niet als losse bundel.`,
      operatorSummary:
        'Dubbele kernvraag zichtbaar; toets of Frictiescore en vroeg Retentiesignaal echt allebei direct nodig zijn voordat combinatie wordt bevestigd.',
    }
  }

  if (recommendedRoute === 'retentiescan') {
    return {
      status: 'retention_primary',
      recommendedRoute,
      followOnCandidateRoute: null,
      headline: 'RetentieScan lijkt nu de logische eerste route.',
      detail: `De vraag leest als een vroeg behoudsvraagstuk rond Retentiesignaal op groepsniveau. Daardoor mag RetentieScan in intake als eerste route worden getoetst, met ${normalizedTiming === 'zo-snel-mogelijk' ? 'hoge urgentie' : 'bounded eerste verificatie'} als uitgangspunt.`,
      operatorSummary:
        'Vroege behoudsvraag zichtbaar; toets RetentieScan via Retentiesignaal als primaire route en bevestig dat het niet alsnog vooral om vertrekduiding achteraf gaat.',
    }
  }

  if (recommendedRoute === 'onboarding') {
    return {
      status: 'onboarding_peer_primary',
      recommendedRoute,
      followOnCandidateRoute: null,
      headline: 'Onboarding 30-60-90 mag hier als begrensde peer-route worden getoetst.',
      detail: 'De vraag leest als een expliciete lifecycle-vraag rond nieuwe medewerkers en vroege landing. Daarom mag Onboarding 30-60-90 als eerste route worden getoetst, maar alleen als assisted single-checkpoint route met duidelijke owner, eerste actie en reviewgrens.',
      operatorSummary:
        'Expliciete lifecycle-vraag zichtbaar; toets Onboarding 30-60-90 als begrensde peer-route en bewaak dat het geen brede journey-suite of standaard vervolgdefault wordt.',
    }
  }

  if (normalizedRoute === 'nog-onzeker') {
    return {
      status: 'uncertain_core_review',
      recommendedRoute,
      followOnCandidateRoute: null,
      headline: `${getContactRouteLabel(recommendedRoute)} is nu de veiligste eerste routehypothese.`,
      detail: `De keuze stond nog open. Op basis van de huidige intake vernauwen we daarom eerst richting ${getContactRouteLabel(recommendedRoute)} en maken we van 'nog niet zeker' geen eindstation.`,
      operatorSummary: `'Nog niet zeker' blijft niet openstaan; vernauw de intake actief richting ${getContactRouteLabel(recommendedRoute)} en bevestig daarna pas de route.`,
    }
  }

  return {
    status: 'core_default',
    recommendedRoute,
    followOnCandidateRoute: null,
    headline: `${getContactRouteLabel(recommendedRoute)} blijft de logische eerste route.`,
    detail: `De huidige intake geeft nog geen reden om van de standaard first-buy logica af te wijken. Daarom behandelen we ${getContactRouteLabel(recommendedRoute)} als eerste route en schuiven we vervolgroutes of combinaties pas later naar voren als de intake dat echt onderbouwt.`,
    operatorSummary: `Behoud de first-buy start: behandel ${getContactRouteLabel(recommendedRoute)} als eerste route tenzij intake expliciet een sterkere uitzondering onderbouwt.`,
  }
}

export function buildContactHref({
  routeInterest = 'exitscan',
  ctaSource = 'website_primary_cta',
  desiredTiming,
}: BuildContactHrefOptions = {}) {
  const params = new URLSearchParams()
  params.set('route_interest', routeInterest)
  params.set('cta_source', normalizeContactCtaSource(ctaSource))
  if (desiredTiming) {
    params.set('desired_timing', desiredTiming)
  }
  return `/?${params.toString()}#kennismaking`
}
