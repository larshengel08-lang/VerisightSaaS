export const CONTACT_ROUTE_OPTIONS = [
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
    value: 'teamscan',
    label: 'TeamScan',
    description: 'We willen lokaal bepalen waar eerst verificatie of gesprek nodig is.',
    firstStepLabel: 'een bounded TeamScan follow-on route',
  },
  {
    value: 'onboarding',
    label: 'Onboarding 30-60-90',
    description: 'We willen vroeg zien hoe nieuwe medewerkers in een checkpoint landen.',
    firstStepLabel: 'een bounded onboarding follow-on route',
  },
  {
    value: 'leadership',
    label: 'Leadership Scan',
    description: 'We willen bepalen welke managementcontext nu eerst duiding of verificatie vraagt.',
    firstStepLabel: 'een bounded Leadership Scan follow-on route',
  },
  {
    value: 'combinatie',
    label: 'Combinatie',
    description: 'We willen beide vragen bewust naast elkaar organiseren.',
    firstStepLabel: 'een gefaseerde combinatieroute',
  },
  {
    value: 'nog-onzeker',
    label: 'Nog niet zeker',
    description: 'We willen eerst de juiste route bepalen.',
    firstStepLabel: 'de logischste eerste route',
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

export type ContactRouteInterest = (typeof CONTACT_ROUTE_OPTIONS)[number]['value']
export type ContactDesiredTiming = (typeof CONTACT_DESIRED_TIMING_OPTIONS)[number]['value']

type BuildContactHrefOptions = {
  routeInterest?: ContactRouteInterest
  ctaSource?: string
  desiredTiming?: ContactDesiredTiming
}

const routeOptionMap = new Map(CONTACT_ROUTE_OPTIONS.map((option) => [option.value, option]))
const timingOptionMap = new Map(CONTACT_DESIRED_TIMING_OPTIONS.map((option) => [option.value, option]))

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
