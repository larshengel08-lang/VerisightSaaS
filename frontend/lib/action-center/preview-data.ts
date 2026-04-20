import type {
  ManagementActionDepartmentOwnerDefault,
  ManagementActionRecord,
  ManagementActionReviewRecord,
  ManagementActionUpdateRecord,
} from '@/lib/management-actions'
import type { MtoDepartmentReadItem } from '@/lib/products/mto/department-intelligence'
import type { MemberRole } from '@/lib/types'

export interface ActionCenterPreviewData {
  organizationId: string
  campaignId: string
  currentViewerRole: MemberRole
  currentUserEmail: string
  canManageCampaign: boolean
  readOnly: boolean
  departmentReads: MtoDepartmentReadItem[]
  actions: ManagementActionRecord[]
  updates: ManagementActionUpdateRecord[]
  reviews: ManagementActionReviewRecord[]
  ownerDefaults: ManagementActionDepartmentOwnerDefault[]
}

const organizationId = 'preview-org-verisight'
const campaignId = 'preview-campaign-mto'

const departmentReads: MtoDepartmentReadItem[] = [
  {
    segmentType: 'department',
    segmentLabel: 'Operations',
    factorKey: 'workload',
    factorLabel: 'Werkbelasting',
    n: 26,
    avgSignal: 7.4,
    deltaVsOrg: 1.3,
    signalValue: 7.9,
    title: 'Werkdruk vraagt een direct, afdelingsgebonden verbeterpad',
    decision:
      'Het afdelingsbeeld wijst op structurele overbelasting. Open een begrensd verbetertraject met expliciete eigenaar, eerste review en heldere observaties uit de lijn.',
    validate: 'Bevestig of piekbelasting, bezetting en prioritering tegelijk spelen voordat je de interventie verbreedt.',
    owner: 'Operations manager',
    actions: [
      'Maak prioriteiten expliciet voor de komende zes weken.',
      'Beoordeel piekbelasting per teamblok.',
      'Leg vast wanneer HR en leidinggevende opnieuw reviewen.',
    ],
    caution: 'Voorkom dat losse incidenten worden aangezien voor het volledige patroon.',
    review: 'Review binnen drie weken op werkdruksignalen, uitvoerbaarheid en eerste teamrespons.',
    handoffBody:
      'Gebruik Operations als bounded afdelingstraject: koppel actie aan het thema, maak eigenaarschap concreet en houd follow-through zichtbaar.',
    stayIntentAverage: 6.2,
  },
  {
    segmentType: 'department',
    segmentLabel: 'Customer Success',
    factorKey: 'leadership',
    factorLabel: 'Leiderschap',
    n: 18,
    avgSignal: 6.8,
    deltaVsOrg: 0.8,
    signalValue: 6.6,
    title: 'Leiderschapssignaal vraagt een expliciet verbeterdossier',
    decision:
      'Customer Success laat zien dat managementduiding en verwachtingshelderheid niet scherp genoeg landen. Maak de route zichtbaar per thema en review consequent.',
    validate: 'Check of het vooral gaat om ritme, communicatie of rolhelderheid vanuit leidinggevenden.',
    owner: 'CS lead',
    actions: [
      'Maak managementverwachtingen expliciet voor de komende sprint.',
      'Verzamel observaties uit 1-op-1’s en teamritmes.',
      'Plan een reviewmoment met HR en afdelingslead.',
    ],
    caution: 'Zorg dat leiderschap niet te snel wordt vertaald naar alleen communicatiecopy.',
    review: 'Review binnen vier weken op waargenomen duidelijkheid en teamreactie.',
    handoffBody:
      'Gebruik Customer Success als bounded afdelingstraject: maak zichtbaar welke managementactie bij dit thema hoort en welke review nodig is.',
    stayIntentAverage: 6.9,
  },
  {
    segmentType: 'department',
    segmentLabel: 'Engineering',
    factorKey: 'growth',
    factorLabel: 'Groeiperspectief',
    n: 22,
    avgSignal: 6.1,
    deltaVsOrg: 0.4,
    signalValue: 5.7,
    title: 'Groeiperspectief vraagt richting, maar het dossier blijft beheerst',
    decision:
      'Engineering ziet ruimte voor gerichtere ontwikkelduiding. Het thema vraagt opvolging, maar de bestaande acties lopen beheerst en hoeven niet te worden verbreed.',
    validate: 'Toets of het vooral gaat om loopbaanbeeld, senioriteitspaden of ontwikkelgesprekken.',
    owner: 'Engineering manager',
    actions: [
      'Maak ontwikkelpad zichtbaar per rolcluster.',
      'Controleer of afspraken uit ontwikkelgesprekken terugkomen in teamritmes.',
    ],
    caution: 'Voorkom een brede HR-programmareactie voordat het lokale patroon helder is.',
    review: 'Review over vijf weken op waargenomen duidelijkheid in ontwikkelperspectief.',
    handoffBody:
      'Gebruik Engineering als bounded afdelingstraject: hou de lijn compact en laat effectcheck volgen op het volgende reviewmoment.',
    stayIntentAverage: 7.3,
  },
]

const ownerDefaults: ManagementActionDepartmentOwnerDefault[] = [
  {
    id: 'owner-operations',
    organization_id: organizationId,
    department: 'Operations',
    owner_label: 'Eva de Vries',
    owner_email: 'eva.operations@verisight-preview.nl',
  },
  {
    id: 'owner-cs',
    organization_id: organizationId,
    department: 'Customer Success',
    owner_label: 'Lars Jansen',
    owner_email: 'lars.cs@verisight-preview.nl',
  },
  {
    id: 'owner-engineering',
    organization_id: organizationId,
    department: 'Engineering',
    owner_label: 'Noor Bakker',
    owner_email: 'noor.eng@verisight-preview.nl',
  },
]

const actions: ManagementActionRecord[] = [
  {
    id: 'action-operations-workload',
    organization_id: organizationId,
    campaign_id: campaignId,
    source_product: 'mto',
    source_scope_type: 'department',
    source_scope_key: 'department:operations',
    source_scope_label: 'Operations',
    source_read_stage: 'mto_closed_improvement_loop',
    source_factor_key: 'workload',
    source_factor_label: 'Werkbelasting',
    source_signal_value: 7.9,
    source_question_key: 'workload-priority',
    source_question_label: 'Ik weet welke prioriteiten echt eerst gaan.',
    title: 'Herijk prioriteiten en bezettingsdruk in Operations',
    decision_context:
      'De MTO-read laat zien dat werkbelasting en prioritering samen opspelen. Dit dossier koppelt het thema aan één duidelijke managementroute.',
    expected_outcome:
      'Teamleads en operatie weten welke prioriteiten eerst gaan en ervaren minder escalatie door overbelasting.',
    measured_outcome: null,
    blocker_note: 'Capaciteitsbesluit voor twee open rollen is nog niet genomen.',
    last_review_outcome: 'continue',
    status: 'in_review',
    owner_label: 'Eva de Vries',
    owner_email: 'eva.operations@verisight-preview.nl',
    due_date: '2026-05-10',
    review_date: '2026-04-22',
    created_by: 'preview@verisight.nl',
    updated_by: 'preview@verisight.nl',
    created_at: '2026-04-01T08:30:00.000Z',
    updated_at: '2026-04-16T09:00:00.000Z',
  },
  {
    id: 'action-cs-leadership',
    organization_id: organizationId,
    campaign_id: campaignId,
    source_product: 'mto',
    source_scope_type: 'department',
    source_scope_key: 'department:customer-success',
    source_scope_label: 'Customer Success',
    source_read_stage: 'mto_closed_improvement_loop',
    source_factor_key: 'leadership',
    source_factor_label: 'Leiderschap',
    source_signal_value: 6.6,
    source_question_key: null,
    source_question_label: null,
    title: 'Maak leiderschapsritme en verwachtingen expliciet in Customer Success',
    decision_context:
      'Het dossier volgt op signalen rond duidelijkheid, ritme en managementaanspreekbaarheid in Customer Success.',
    expected_outcome:
      'Leidinggevenden geven consistenter richting en medewerkers ervaren meer voorspelbaarheid in besluiten.',
    measured_outcome: null,
    blocker_note: null,
    last_review_outcome: null,
    status: 'assigned',
    owner_label: 'Lars Jansen',
    owner_email: 'lars.cs@verisight-preview.nl',
    due_date: '2026-05-15',
    review_date: '2026-04-29',
    created_by: 'preview@verisight.nl',
    updated_by: 'preview@verisight.nl',
    created_at: '2026-04-05T10:00:00.000Z',
    updated_at: '2026-04-11T14:20:00.000Z',
  },
  {
    id: 'action-engineering-growth',
    organization_id: organizationId,
    campaign_id: campaignId,
    source_product: 'mto',
    source_scope_type: 'department',
    source_scope_key: 'department:engineering',
    source_scope_label: 'Engineering',
    source_read_stage: 'mto_closed_improvement_loop',
    source_factor_key: 'growth',
    source_factor_label: 'Groeiperspectief',
    source_signal_value: 5.7,
    source_question_key: 'growth-development',
    source_question_label: 'Ik zie een concreet ontwikkelpad voor mijn rol.',
    title: 'Maak ontwikkelpaden zichtbaar voor Engineering',
    decision_context:
      'Engineering vraagt geen crisisaanpak, maar wel een consistente managementroute rond groeiperspectief.',
    expected_outcome:
      'Teams herkennen hun groeipad beter en ontwikkelgesprekken leiden tot concretere vervolgafspraken.',
    measured_outcome: 'Eerste teamreacties zijn positiever, maar follow-up blijft nodig in het volgende ritme.',
    blocker_note: null,
    last_review_outcome: 'follow_up_needed',
    status: 'follow_up_needed',
    owner_label: 'Noor Bakker',
    owner_email: 'noor.eng@verisight-preview.nl',
    due_date: '2026-05-24',
    review_date: '2026-04-18',
    created_by: 'preview@verisight.nl',
    updated_by: 'preview@verisight.nl',
    created_at: '2026-03-29T07:45:00.000Z',
    updated_at: '2026-04-02T09:30:00.000Z',
  },
]

const updates: ManagementActionUpdateRecord[] = [
  {
    id: 'update-operations-1',
    action_id: 'action-operations-workload',
    note: 'Weekstart versimpeld en top-3 prioriteiten per dagdeel zichtbaar gemaakt.',
    status_snapshot: 'in_progress',
    created_by: 'preview@verisight.nl',
    created_by_email: 'preview@verisight.nl',
    created_at: '2026-04-07T09:15:00.000Z',
  },
  {
    id: 'update-operations-2',
    action_id: 'action-operations-workload',
    note: 'Bezettingsbesluit staat nog open; review blijft daarom op korte termijn nodig.',
    status_snapshot: 'in_review',
    created_by: 'preview@verisight.nl',
    created_by_email: 'preview@verisight.nl',
    created_at: '2026-04-16T09:00:00.000Z',
  },
  {
    id: 'update-cs-1',
    action_id: 'action-cs-leadership',
    note: 'Nieuwe weekritmes en expliciet managementslot voorbereid voor het teamoverleg.',
    status_snapshot: 'assigned',
    created_by: 'preview@verisight.nl',
    created_by_email: 'preview@verisight.nl',
    created_at: '2026-04-11T14:20:00.000Z',
  },
  {
    id: 'update-engineering-1',
    action_id: 'action-engineering-growth',
    note: 'Ontwikkelpaden gedeeld, maar effectcheck wijst nog op behoefte aan vervolgactie.',
    status_snapshot: 'follow_up_needed',
    created_by: 'preview@verisight.nl',
    created_by_email: 'preview@verisight.nl',
    created_at: '2026-04-02T09:30:00.000Z',
  },
]

const reviews: ManagementActionReviewRecord[] = [
  {
    id: 'review-operations-1',
    action_id: 'action-operations-workload',
    summary: 'Prioriteiten zijn scherper, maar zonder capaciteitsbesluit blijft de druk te hoog.',
    outcome: 'continue',
    next_review_date: '2026-04-22',
    created_by: 'preview@verisight.nl',
    created_at: '2026-04-16T09:00:00.000Z',
  },
  {
    id: 'review-engineering-1',
    action_id: 'action-engineering-growth',
    summary: 'Het team ziet meer duidelijkheid, maar vraagt om een volgende, concretere ontwikkelslag.',
    outcome: 'follow_up_needed',
    next_review_date: '2026-05-06',
    created_by: 'preview@verisight.nl',
    created_at: '2026-04-10T08:45:00.000Z',
  },
]

export function getActionCenterPreviewData(): ActionCenterPreviewData {
  return {
    organizationId,
    campaignId,
    currentViewerRole: 'member',
    currentUserEmail: 'preview@verisight.nl',
    canManageCampaign: false,
    readOnly: true,
    departmentReads,
    actions,
    updates,
    reviews,
    ownerDefaults,
  }
}
