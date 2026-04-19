import type { DeliveryMode, ScanType } from '@/lib/types'

export type CustomerExpansionRouteKey =
  | 'retention_rhythm'
  | 'compact_follow_up'
  | 'pulse'
  | 'segment_deep_dive'
  | 'teamscan'

export type CustomerExpansionStatus = 'aanbevolen' | 'te_overwegen' | 'nu_niet'
export type CustomerExpansionConfidence = 'hoog' | 'middel' | 'laag'
export type CustomerExpansionReadiness = 'not_ready' | 'ready' | 'already_decided'

export type CustomerExpansionInput = {
  scanType: ScanType
  deliveryMode: DeliveryMode | null
  responsesLength: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  firstManagementUseConfirmed: boolean
  followUpAlreadyDecided: boolean
  reviewMoment: string | null
  firstActionTaken: string | null
  managementActionOutcome: string | null
  nextRouteRecorded: string | null
  hasSegmentDeepDive: boolean
  eligibleDepartmentGroupCount: number
}

export type CustomerExpansionSuggestion = {
  routeKey: CustomerExpansionRouteKey
  label: string
  status: CustomerExpansionStatus
  confidence: CustomerExpansionConfidence
  rationale: string
  guardrail: string
  applyLabel: string
}

export type CustomerExpansionResult = {
  readiness: CustomerExpansionReadiness
  title: string
  summary: string
  blockers: string[]
  primaryRouteKey: CustomerExpansionRouteKey | null
  suggestions: CustomerExpansionSuggestion[]
}

type DepartmentCarrier = {
  respondents?: {
    department?: string | null
  } | null
}

const ROUTE_LABELS: Record<CustomerExpansionRouteKey, string> = {
  retention_rhythm: 'RetentieScan ritme',
  compact_follow_up: 'Compacte vervolgmeting',
  pulse: 'Pulse',
  segment_deep_dive: 'Segment Deep Dive',
  teamscan: 'TeamScan',
}

const ROUTE_ORDER: Record<ScanType, CustomerExpansionRouteKey[]> = {
  exit: ['pulse', 'segment_deep_dive', 'teamscan'],
  retention: ['retention_rhythm', 'compact_follow_up', 'pulse', 'segment_deep_dive', 'teamscan'],
  pulse: ['compact_follow_up', 'segment_deep_dive', 'teamscan'],
  team: ['compact_follow_up', 'pulse', 'segment_deep_dive'],
  onboarding: ['compact_follow_up', 'pulse', 'segment_deep_dive'],
  leadership: ['compact_follow_up', 'pulse', 'segment_deep_dive'],
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim())
}

function createSuggestion(
  routeKey: CustomerExpansionRouteKey,
  status: CustomerExpansionStatus,
  confidence: CustomerExpansionConfidence,
  rationale: string,
  guardrail: string,
): CustomerExpansionSuggestion {
  return {
    routeKey,
    label: ROUTE_LABELS[routeKey],
    status,
    confidence,
    rationale,
    guardrail,
    applyLabel: ROUTE_LABELS[routeKey],
  }
}

function buildRetentionRhythmSuggestion(input: CustomerExpansionInput, hasDecisionContext: boolean) {
  if (input.scanType !== 'retention') {
    return null
  }

  if (hasDecisionContext) {
    return createSuggestion(
      'retention_rhythm',
      'aanbevolen',
      'hoog',
      'De huidige route is al RetentieScan en review, eerste actie en managementuitkomst zijn voldoende scherp om nu een ritmische vervolgvorm te dragen.',
      'Gebruik dit als vervolg binnen dezelfde core route, niet als nieuwe productpush.',
    )
  }

  return createSuggestion(
    'retention_rhythm',
    'te_overwegen',
    'middel',
    'RetentieScan ritme blijft inhoudelijk de logische vervolglaag, maar zonder expliciet reviewmoment of eerste actie is een compactere bounded follow-up nog veiliger.',
    'Promoveer nog geen vol ritmebesluit zolang review en eerste actie niet expliciet zijn gemaakt.',
  )
}

function buildCompactFollowUpSuggestion(input: CustomerExpansionInput, hasDecisionContext: boolean) {
  if (input.scanType === 'exit') {
    return null
  }

  if (input.scanType === 'retention' && !hasDecisionContext) {
    return createSuggestion(
      'compact_follow_up',
      'aanbevolen',
      'middel',
      'De retentionroute heeft al genoeg basis voor een bounded hercheck, maar nog niet genoeg expliciete reviewlogica voor een hard ritmebesluit.',
      'Houd dit kleiner dan een vol ritme of nieuwe productverschuiving.',
    )
  }

  return createSuggestion(
    'compact_follow_up',
    'te_overwegen',
    hasDecisionContext ? 'middel' : 'laag',
    'Een compacte vervolgmeting past wanneer de volgende stap vooral een bounded review of hercheck is en geen bredere routeverzwaring vraagt.',
    'Gebruik dit als bounded vervolg, niet als vervanging van een sterkere core-follow-up waar die al duidelijk is.',
  )
}

function buildPulseSuggestion(input: CustomerExpansionInput, hasDecisionContext: boolean) {
  if (input.scanType === 'pulse') {
    return null
  }

  return createSuggestion(
    'pulse',
    hasDecisionContext ? 'te_overwegen' : 'nu_niet',
    hasDecisionContext ? 'middel' : 'laag',
    hasDecisionContext
      ? 'Pulse is verdedigbaar als bounded reviewlaag nadat eerste waarde en eerste actie al zijn geland.'
      : 'Pulse is nu nog te vroeg omdat de bounded reviewvraag nog niet expliciet genoeg is vastgelegd.',
    'Laat Pulse nooit concurreren met een sterkere core-follow-up of bredere herdiagnose.',
  )
}

function buildSegmentDeepDiveSuggestion(input: CustomerExpansionInput, hasDecisionContext: boolean) {
  if (!input.hasEnoughData || !input.hasSegmentDeepDive) {
    return createSuggestion(
      'segment_deep_dive',
      'nu_niet',
      'laag',
      'Segment Deep Dive vraagt zowel stevige responsbasis als expliciete segmentgrond; die basis is nu nog niet sterk genoeg zichtbaar.',
      'Geen segmentverdieping zonder voldoende n en metadata-geschiktheid.',
    )
  }

  return createSuggestion(
    'segment_deep_dive',
    hasDecisionContext ? 'te_overwegen' : 'nu_niet',
    hasDecisionContext ? 'middel' : 'laag',
    'De route heeft genoeg data en segmentbasis om verdieping te overwegen zodra de managementvraag expliciet segmentduiding vraagt.',
    'Behandel dit als verdieping, niet als nieuwe hoofdroute.',
  )
}

function buildTeamScanSuggestion(input: CustomerExpansionInput, hasDecisionContext: boolean) {
  if (input.eligibleDepartmentGroupCount <= 0) {
    return createSuggestion(
      'teamscan',
      'nu_niet',
      'laag',
      'TeamScan vraagt lokale verificatiegrond en genoeg bruikbare afdelingsgroepen; die basis is nu niet zichtbaar.',
      'Geen TeamScan zonder eerlijke lokale metadata- en n-basis.',
    )
  }

  return createSuggestion(
    'teamscan',
    hasDecisionContext ? 'te_overwegen' : 'nu_niet',
    hasDecisionContext ? 'middel' : 'laag',
    `Er zijn ${input.eligibleDepartmentGroupCount} lokale groep(en) die een bounded verificatie-route aannemelijk maken zodra de managementvraag echt lokaal wordt.`,
    'Houd TeamScan bounded en gebruik het niet als brede teamsuite of vervangende hoofdroute.',
  )
}

function sortSuggestions(scanType: ScanType, suggestions: CustomerExpansionSuggestion[]) {
  const order = ROUTE_ORDER[scanType]
  return [...suggestions].sort(
    (left, right) => order.indexOf(left.routeKey) - order.indexOf(right.routeKey),
  )
}

function getPrimaryRouteKey(suggestions: CustomerExpansionSuggestion[]) {
  return (
    suggestions.find((suggestion) => suggestion.status === 'aanbevolen')?.routeKey ??
    suggestions.find((suggestion) => suggestion.status === 'te_overwegen')?.routeKey ??
    null
  )
}

export function countEligibleDepartmentGroups(items: DepartmentCarrier[]) {
  const counts = new Map<string, number>()

  for (const item of items) {
    const department = item.respondents?.department?.trim()
    if (!department) continue
    counts.set(department, (counts.get(department) ?? 0) + 1)
  }

  return Array.from(counts.values()).filter((count) => count >= 5).length
}

export function buildCustomerExpansionResult(input: CustomerExpansionInput): CustomerExpansionResult {
  const hasDecisionContext =
    hasText(input.reviewMoment) ||
    hasText(input.firstActionTaken) ||
    hasText(input.managementActionOutcome)

  const suggestions = sortSuggestions(
    input.scanType,
    [
      buildRetentionRhythmSuggestion(input, hasDecisionContext),
      buildCompactFollowUpSuggestion(input, hasDecisionContext),
      buildPulseSuggestion(input, hasDecisionContext),
      buildSegmentDeepDiveSuggestion(input, hasDecisionContext),
      buildTeamScanSuggestion(input, hasDecisionContext),
    ].filter((suggestion): suggestion is CustomerExpansionSuggestion => Boolean(suggestion)),
  )

  if (!input.firstManagementUseConfirmed) {
    return {
      readiness: 'not_ready',
      title: 'Nog niet klaar voor vervolgbesluit',
      summary:
        'Bevestig eerst dat dashboard of rapport echt is gebruikt voor eerste managementwaarde, eerste eigenaar en eerste actie. Pas daarna hoort een vervolgrichting in beeld te komen.',
      blockers: ['First management use is nog niet bevestigd.'],
      primaryRouteKey: null,
      suggestions: suggestions.map((suggestion) => ({
        ...suggestion,
        status: 'nu_niet',
        confidence: 'laag',
      })),
    }
  }

  const primaryRouteKey = getPrimaryRouteKey(suggestions)
  const primaryLabel = primaryRouteKey ? ROUTE_LABELS[primaryRouteKey] : null

  if (input.followUpAlreadyDecided) {
    const decidedLabel = input.nextRouteRecorded?.trim() || primaryLabel || 'de eerder gekozen follow-up'
    return {
      readiness: 'already_decided',
      title: 'Vervolg al vastgelegd',
      summary: `Deze campaign heeft al een vastgelegde vervolgrichting: ${decidedLabel}. Gebruik de suggester nu vooral als guardrail-check en niet als nieuwe push.`,
      blockers: [],
      primaryRouteKey,
      suggestions,
    }
  }

  return {
    readiness: 'ready',
    title: primaryLabel ? `${primaryLabel} ligt nu het meest voor de hand` : 'Geen harde vervolgrichting',
    summary: primaryLabel
      ? `De huidige lifecycle- en routecontext ondersteunt vooral ${primaryLabel} als eerstvolgende stap. De overige kaarten blijven bewust begrensd zodat bounded routes niet zwaarder voelen dan de producttruth draagt.`
      : 'Er is nog geen harde vervolgrichting. Houd de huidige route en reviewlogica eerst expliciet voordat een volgende stap wordt gekozen.',
    blockers: [],
    primaryRouteKey,
    suggestions,
  }
}
