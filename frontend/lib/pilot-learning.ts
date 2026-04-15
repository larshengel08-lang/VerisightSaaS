import {
  getContactDesiredTimingLabel,
  getContactRouteLabel,
  type ContactDesiredTiming,
  type ContactRouteInterest,
} from '@/lib/contact-funnel'
import type { CampaignStats, DeliveryMode, ScanType } from '@/lib/types'

export type LearningTriageStatus = 'nieuw' | 'bevestigd' | 'geparkeerd' | 'uitgevoerd' | 'verworpen'
export type LearningCheckpointKey =
  | 'lead_route_hypothesis'
  | 'implementation_intake'
  | 'launch_output'
  | 'first_management_use'
  | 'follow_up_review'
export type LearningDestinationArea = 'product' | 'report' | 'onboarding' | 'sales' | 'operations'
export type LearningStrength =
  | 'incidentele_observatie'
  | 'terugkerend_patroon'
  | 'direct_uitvoerbare_verbetering'

export interface ContactRequestRecord {
  id: string
  name: string
  work_email: string
  organization: string
  employee_count: string
  route_interest: ContactRouteInterest | null
  cta_source: string | null
  desired_timing: ContactDesiredTiming | null
  current_question: string
  notification_sent: boolean
  notification_error: string | null
  created_at: string
}

export interface PilotLearningDossier {
  id: string
  organization_id: string | null
  campaign_id: string | null
  contact_request_id: string | null
  title: string
  route_interest: ContactRouteInterest
  scan_type: ScanType | null
  delivery_mode: DeliveryMode | null
  triage_status: LearningTriageStatus
  lead_contact_name: string | null
  lead_organization_name: string | null
  lead_work_email: string | null
  lead_employee_count: string | null
  buyer_question: string | null
  expected_first_value: string | null
  buying_reason: string | null
  trust_friction: string | null
  implementation_risk: string | null
  adoption_outcome: string | null
  management_action_outcome: string | null
  next_route: string | null
  stop_reason: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface PilotLearningCheckpoint {
  id: string
  dossier_id: string
  checkpoint_key: LearningCheckpointKey
  owner_label: string
  status: LearningTriageStatus
  objective_signal_notes: string | null
  qualitative_notes: string | null
  interpreted_observation: string | null
  confirmed_lesson: string | null
  lesson_strength: LearningStrength
  destination_areas: LearningDestinationArea[]
  created_at: string
  updated_at: string
}

export type LearningCheckpointDefinition = {
  key: LearningCheckpointKey
  title: string
  owner: string
  description: string
}

export const LEARNING_CHECKPOINT_DEFINITIONS: LearningCheckpointDefinition[] = [
  {
    key: 'lead_route_hypothesis',
    title: 'Lead en routehypothese',
    owner: 'Founder / Verisight',
    description: 'Leg vast welke route, timing en eerste buyer-vraag nu het meest waarschijnlijk zijn.',
  },
  {
    key: 'implementation_intake',
    title: 'Implementation intake',
    owner: 'Verisight',
    description: 'Gebruik intake, metadata en setupfrictie als eerste delivery- en onboardingles.',
  },
  {
    key: 'launch_output',
    title: 'Launch en eerste output',
    owner: 'Verisight',
    description: 'Toets time-to-first-value, response-opbouw en of de eerste output echt bruikbaar wordt.',
  },
  {
    key: 'first_management_use',
    title: 'Eerste managementgebruik',
    owner: 'Klant + Verisight',
    description: 'Leg vast of dashboard en rapport echt leiden tot eerste vraag, eigenaar, actie en reviewmoment.',
  },
  {
    key: 'follow_up_review',
    title: '30-90 dagen review',
    owner: 'Verisight',
    description: 'Capture vervolgactie, vervolgmeting, uitbreidingskans of expliciete stopreden.',
  },
] as const

export const LEARNING_TRIAGE_STATUS_OPTIONS: Array<{ value: LearningTriageStatus; label: string }> = [
  { value: 'nieuw', label: 'Nieuw' },
  { value: 'bevestigd', label: 'Bevestigd' },
  { value: 'geparkeerd', label: 'Geparkeerd' },
  { value: 'uitgevoerd', label: 'Uitgevoerd' },
  { value: 'verworpen', label: 'Verworpen' },
]

export const LEARNING_DESTINATION_OPTIONS: Array<{ value: LearningDestinationArea; label: string }> = [
  { value: 'product', label: 'Product' },
  { value: 'report', label: 'Report' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'sales', label: 'Sales' },
  { value: 'operations', label: 'Operations' },
]

export const LEARNING_STRENGTH_OPTIONS: Array<{ value: LearningStrength; label: string }> = [
  { value: 'incidentele_observatie', label: 'Incidentele observatie' },
  { value: 'terugkerend_patroon', label: 'Terugkerend patroon' },
  { value: 'direct_uitvoerbare_verbetering', label: 'Direct uitvoerbare verbetering' },
]

export const LEARNING_ROUTE_OPTIONS: Array<{ value: ContactRouteInterest; label: string }> = [
  { value: 'exitscan', label: 'ExitScan' },
  { value: 'retentiescan', label: 'RetentieScan' },
  { value: 'combinatie', label: 'Combinatie' },
  { value: 'nog-onzeker', label: 'Nog niet zeker' },
]

export function getCheckpointDefinition(key: LearningCheckpointKey) {
  return LEARNING_CHECKPOINT_DEFINITIONS.find((definition) => definition.key === key) ?? null
}

export function createDefaultLearningCheckpoints() {
  return LEARNING_CHECKPOINT_DEFINITIONS.map((definition) => ({
    checkpoint_key: definition.key,
    owner_label: definition.owner,
    status: 'nieuw' as LearningTriageStatus,
    lesson_strength: 'incidentele_observatie' as LearningStrength,
    destination_areas: [] as LearningDestinationArea[],
  }))
}

export function getLearningStatusLabel(value: LearningTriageStatus) {
  return LEARNING_TRIAGE_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? 'Nieuw'
}

export function getLearningStrengthLabel(value: LearningStrength) {
  return LEARNING_STRENGTH_OPTIONS.find((option) => option.value === value)?.label ?? 'Incidentele observatie'
}

export function getSuggestedLearningDossierTitle(args: {
  routeInterest: ContactRouteInterest
  campaignName?: string | null
  organizationName?: string | null
}) {
  if (args.campaignName) {
    return `Pilotlearning - ${args.campaignName}`
  }

  if (args.organizationName) {
    return `Pilotlearning - ${args.organizationName}`
  }

  return `Pilotlearning - ${getContactRouteLabel(args.routeInterest)}`
}

type ObjectiveSignalArgs = {
  checkpointKey: LearningCheckpointKey
  dossier: Pick<
    PilotLearningDossier,
    | 'route_interest'
    | 'delivery_mode'
    | 'scan_type'
    | 'expected_first_value'
    | 'next_route'
    | 'stop_reason'
    | 'management_action_outcome'
    | 'adoption_outcome'
    | 'trust_friction'
  >
  contactRequest?: ContactRequestRecord | null
  campaignStats?: CampaignStats | null
  activeClientAccessCount?: number
  pendingClientInviteCount?: number
}

export function buildLearningObjectiveSignals({
  checkpointKey,
  dossier,
  contactRequest,
  campaignStats,
  activeClientAccessCount = 0,
  pendingClientInviteCount = 0,
}: ObjectiveSignalArgs) {
  const items: string[] = []

  if (checkpointKey === 'lead_route_hypothesis') {
    items.push(`Route: ${getContactRouteLabel(dossier.route_interest)}.`)
    if (contactRequest?.desired_timing) {
      items.push(`Timing: ${getContactDesiredTimingLabel(contactRequest.desired_timing)}.`)
    }
    if (contactRequest?.cta_source) {
      items.push(`CTA-bron: ${contactRequest.cta_source}.`)
    }
    items.push(
      contactRequest?.notification_sent
        ? 'Leadnotificatie is succesvol afgeleverd.'
        : 'Lead is opgeslagen zonder bevestigde notificatie-aflevering.',
    )
  }

  if (checkpointKey === 'implementation_intake') {
    if (dossier.scan_type) {
      items.push(`Scantype: ${dossier.scan_type === 'exit' ? 'ExitScan' : 'RetentieScan'}.`)
    }
    if (dossier.delivery_mode) {
      items.push(`Implementatieroute: ${dossier.delivery_mode === 'live' ? 'Live / vervolgroute' : 'Baseline'}.`)
    }
    if (campaignStats) {
      items.push(`Campaign bestaat en telt ${campaignStats.total_invited} respondent(en) in de huidige setup.`)
    }
  }

  if (checkpointKey === 'launch_output') {
    if (campaignStats) {
      items.push(`Respons: ${campaignStats.total_completed}/${campaignStats.total_invited || 0} (${campaignStats.completion_rate_pct ?? 0}%).`)
      if (campaignStats.total_completed >= 10) {
        items.push('Pattern-level drempel bereikt: eerste managementduiding mag steviger worden.')
      } else if (campaignStats.total_completed >= 5) {
        items.push('Indicatieve drempel bereikt: detailweergave is bruikbaar, maar nog niet stevig genoeg voor brede patroonclaims.')
      } else {
        items.push('Nog onder de first-value drempel van 5 responses.')
      }
    }
    if (pendingClientInviteCount > 0) {
      items.push(`${pendingClientInviteCount} klantinvite(s) wachten nog op activatie.`)
    }
  }

  if (checkpointKey === 'first_management_use') {
    if (campaignStats) {
      items.push(
        campaignStats.total_completed >= 10
          ? 'Campaign heeft genoeg responses voor een stevige eerste managementread.'
          : 'Campaign zit nog in een vroege read-fase; check extra scherp hoe voorzichtig de output is gelezen.',
      )
    }
    items.push(
      activeClientAccessCount > 0
        ? `${activeClientAccessCount} actieve klantaccount(s) gekoppeld.`
        : 'Nog geen bevestigde klantdashboardtoegang zichtbaar.',
    )
    if (dossier.management_action_outcome) {
      items.push('Er is al een managementactie-uitkomst of eerste eigenaar vastgelegd in het dossier.')
    }
  }

  if (checkpointKey === 'follow_up_review') {
    if (dossier.next_route) {
      items.push(`Vervolgroute: ${dossier.next_route}.`)
    }
    if (dossier.stop_reason) {
      items.push(`Stopreden vastgelegd: ${dossier.stop_reason}.`)
    }
    if (dossier.adoption_outcome) {
      items.push('Adoptionuitkomst is expliciet vastgelegd.')
    }
  }

  if (items.length === 0 && dossier.expected_first_value) {
    items.push(`Verwachte eerste waarde: ${dossier.expected_first_value}.`)
  }

  if (items.length === 0 && dossier.trust_friction) {
    items.push('Er is al een trust- of koopfrictie vastgelegd in het dossier.')
  }

  return items
}
