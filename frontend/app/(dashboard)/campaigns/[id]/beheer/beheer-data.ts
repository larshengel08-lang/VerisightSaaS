import type { SupabaseClient } from '@supabase/supabase-js'
import { buildGuidedSelfServeState, deriveGuidedSelfServeDiscipline } from '@/lib/guided-self-serve'
import { getDeliveryModeLabel } from '@/lib/implementation-readiness'
import {
  buildDeliveryAutoSignals,
  buildDeliveryGovernanceSnapshot,
  type CampaignDeliveryCheckpoint,
  type CampaignDeliveryRecord,
  type DeliveryLifecycleStage,
} from '@/lib/ops-delivery'
import { FIRST_DASHBOARD_THRESHOLD, FIRST_INSIGHT_THRESHOLD } from '@/lib/response-activation'
import {
  SCAN_TYPE_LABELS,
  type Campaign,
  type CampaignStats,
  hasCampaignAddOn,
  type MemberRole,
  type Respondent,
  type ScanType,
} from '@/lib/types'
import type { CampaignAuditEventRecord } from '@/lib/campaign-audit'
import { getCustomerActionPermission } from '@/lib/customer-permissions'

type SupabaseLike = Pick<SupabaseClient, 'from'>
type GuidedSelfServePhase = ReturnType<typeof buildGuidedSelfServeState>['phase']

export type RouteBeheerLifecycleStep = {
  key: 'setup' | 'doelgroep' | 'uitnodigingen' | 'respons' | 'output' | 'afgerond'
  label: string
  status: 'done' | 'current' | 'pending'
  sublabel: string
}

export type HrRouteBeheerPhaseKey =
  | 'doelgroep'
  | 'communicatie'
  | 'live'
  | 'output'
  | 'afronding'

export type HrRouteBeheerPhaseStatus = 'done' | 'current' | 'open'

export interface HrRouteBeheerActionLink {
  label: string
  href: string
}

export interface HrRouteBeheerPhaseSummary {
  key: HrRouteBeheerPhaseKey
  label: string
  status: HrRouteBeheerPhaseStatus
  body: string
  link: HrRouteBeheerActionLink | null
}

export interface HrRouteBeheerPhaseDetail {
  key: HrRouteBeheerPhaseKey
  label: string
  status: HrRouteBeheerPhaseStatus
  body: string
  items: Array<{ label: string; value: string }>
  links: HrRouteBeheerActionLink[]
}

export interface HrRouteBeheerNowDoing {
  label: 'Nu doen'
  phaseKey: HrRouteBeheerPhaseKey
  title: string
  body: string
  href: string
}

export interface RouteBeheerPageData {
  campaignId: string
  campaignName: string
  organizationName: string | null
  scanType: ScanType
  scanTypeLabel: string
  deliveryModeLabel: string | null
  routePeriodLabel: string
  isActive: boolean
  statusBadgeLabel: string
  statusBadgeTone: 'emerald' | 'amber' | 'slate'
  lastActivityAt: string | null
  launchDate: string | null
  totalInvited: number
  totalCompleted: number
  pendingCount: number
  completionRatePct: number | null
  invitesNotSent: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  readabilityLabel: string
  readabilityBody: string
  nextActionTitle: string | null
  nextActionBody: string | null
  blockers: string[]
  lifecycleStage: DeliveryLifecycleStage | null
  lifecycleSteps: RouteBeheerLifecycleStep[]
  nowDoing: HrRouteBeheerNowDoing | null
  phaseSummaries: HrRouteBeheerPhaseSummary[]
  phaseDetails: HrRouteBeheerPhaseDetail[]
  outputSummary: {
    dashboardReady: boolean
    reportReady: boolean
    dashboardHref: string
    reportHref: string | null
    label: string
  }
  respondentCount: number
  routeSettingsLabel: string
  routeSettingsBody: string
  outputStatusLabel: string
  latestAuditSummary: string | null
  reportAvailable: boolean
  canExecuteCampaign: boolean
  canManageCampaign: boolean
  membershipRole: MemberRole | null
  selfServe: {
    deliveryMode: Campaign['delivery_mode']
    importReady: boolean
    hasSegmentDeepDive: boolean
    importQaConfirmed: boolean
    launchTimingConfirmed: boolean
    communicationReady: boolean
    remindableCount: number
    unsentRespondents: Array<{ token: string; email: string | null }>
    launchConfirmedAt: string | null
    participantCommsConfig: unknown
    reminderConfig: unknown
  }
}

export type RouteBeeheerPageData = RouteBeheerPageData

const LIFECYCLE_STEP_ORDER: Array<RouteBeheerLifecycleStep['key']> = [
  'setup',
  'doelgroep',
  'uitnodigingen',
  'respons',
  'output',
  'afgerond',
]

const LIFECYCLE_LABELS: Record<RouteBeheerLifecycleStep['key'], string> = {
  setup: 'Setup',
  doelgroep: 'Doelgroep',
  uitnodigingen: 'Uitnodigingen',
  respons: 'Respons',
  output: 'Output',
  afgerond: 'Afgerond',
}

const HR_ROUTE_PHASE_ORDER: HrRouteBeheerPhaseKey[] = [
  'doelgroep',
  'communicatie',
  'live',
  'output',
  'afronding',
]

const HR_ROUTE_PHASE_LABELS: Record<HrRouteBeheerPhaseKey, string> = {
  doelgroep: 'Doelgroep klaarzetten',
  communicatie: 'Communicatie instellen',
  live: 'Live zetten & volgen',
  output: 'Output beoordelen',
  afronding: 'Afronden & controleren',
}

export function formatRoutePeriodLabel(campaignName: string, createdAt: string) {
  const quarterMatch = campaignName.match(/Q[1-4]\s?\d{4}/i)
  if (quarterMatch) return quarterMatch[0].replace(/\s+/, ' ')

  try {
    return new Intl.DateTimeFormat('nl-NL', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(createdAt))
  } catch {
    return createdAt
  }
}

export function getRouteBeheerLifecycleIndex(stage: DeliveryLifecycleStage | null | undefined) {
  switch (stage) {
    case 'setup_in_progress':
      return 0
    case 'import_cleared':
      return 1
    case 'invites_live':
    case 'client_activation_pending':
      return 2
    case 'client_activation_confirmed':
    case 'first_value_reached':
      return 3
    case 'first_management_use':
    case 'follow_up_decided':
      return 4
    case 'learning_closed':
      return 5
    default:
      return 0
  }
}

function getLifecycleSublabel(args: {
  key: RouteBeheerLifecycleStep['key']
  status: 'done' | 'current' | 'pending'
  isActive: boolean
  hasMinDisplay: boolean
  hasEnoughData: boolean
}) {
  if (args.status === 'pending') return 'Nog niet'
  if (args.status === 'done') return 'Voltooid'

  switch (args.key) {
    case 'setup':
      return 'Loopt'
    case 'doelgroep':
      return 'Klaar'
    case 'uitnodigingen':
      return args.isActive ? 'Live' : 'Nog niet'
    case 'respons':
      return args.hasEnoughData ? 'Leesbaar' : args.hasMinDisplay ? 'Indicatief' : 'Loopt'
    case 'output':
      return args.hasMinDisplay ? 'Beschikbaar' : 'Nog niet'
    case 'afgerond':
      return 'Afgerond'
    default:
      return 'Nog niet'
  }
}

export function buildRouteBeheerLifecycleSteps(args: {
  stage: DeliveryLifecycleStage | null | undefined
  isActive: boolean
  hasMinDisplay: boolean
  hasEnoughData: boolean
}) {
  const currentIndex = getRouteBeheerLifecycleIndex(args.stage)

  return LIFECYCLE_STEP_ORDER.map((key, index) => {
    const status = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending'

    return {
      key,
      label: LIFECYCLE_LABELS[key],
      status,
      sublabel: getLifecycleSublabel({
        key,
        status,
        isActive: args.isActive,
        hasMinDisplay: args.hasMinDisplay,
        hasEnoughData: args.hasEnoughData,
      }),
    } satisfies RouteBeheerLifecycleStep
  })
}

export function getLatestActivityTimestamp(
  auditEvents: CampaignAuditEventRecord[],
  deliveryUpdatedAt: string | null | undefined,
) {
  const auditAt = auditEvents[0]?.created_at ?? null
  const candidates = [auditAt, deliveryUpdatedAt ?? null].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )

  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce((latest, candidate) => {
    if (!latest) return candidate
    const latestDate = new Date(latest).getTime()
    const candidateDate = new Date(candidate).getTime()
    if (Number.isNaN(latestDate) || Number.isNaN(candidateDate)) {
      return latest
    }
    return candidateDate > latestDate ? candidate : latest
  }, candidates[0] ?? null)
}

export function formatLatestActivityLabel(value: string | null) {
  if (!value) return 'Niet beschikbaar'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Niet beschikbaar'
  }

  const now = new Date()
  const sameDay =
    parsed.getFullYear() === now.getFullYear() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getDate() === now.getDate()

  return sameDay
    ? `Laatste activiteit: vandaag om ${new Intl.DateTimeFormat('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Amsterdam',
      }).format(parsed)}`
    : `Laatste activiteit: ${new Intl.DateTimeFormat('nl-NL', {
        day: '2-digit',
        month: 'short',
        timeZone: 'Europe/Amsterdam',
      }).format(parsed)}`
}

function getReadabilityPresentation(totalCompleted: number) {
  if (totalCompleted >= FIRST_INSIGHT_THRESHOLD) {
    return {
      label: 'Leesbaar',
      body: 'Dashboard en rapport zijn nu veilig leesbaar voor eerste outputgebruik.',
    }
  }

  if (totalCompleted >= FIRST_DASHBOARD_THRESHOLD) {
    return {
      label: 'Indicatief beeld',
      body: 'Dashboard en rapport zijn zichtbaar, maar de responsbasis blijft nog compact.',
    }
  }

  return {
    label: 'Nog niet leesbaar',
    body: 'Nog onvoldoende responses voor een veilige eerste dashboardread.',
  }
}

function getStatusBadgeLabel(args: {
  isActive: boolean
  invitesNotSent: number
}) {
  if (!args.isActive) {
    return { label: 'Gesloten', tone: 'slate' as const }
  }

  if (args.invitesNotSent > 0) {
    return { label: 'Uitnodigingen nog niet gestart', tone: 'amber' as const }
  }

  return { label: 'Live', tone: 'emerald' as const }
}

function getLaunchValue(args: { isActive: boolean; launchDate: string | null }) {
  if (!args.isActive) return 'Gesloten'
  if (!args.launchDate) return 'Nog niet gestart'

  try {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(args.launchDate))
  } catch {
    return args.launchDate
  }
}

function getRouteSettingsBody(args: {
  launchDate: string | null
  createdAt: string
}) {
  const sourceDate = args.launchDate ?? args.createdAt
  try {
    return `Startdatum: ${new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Amsterdam',
    }).format(new Date(sourceDate))}`
  } catch {
    return 'Startdatum: Niet beschikbaar'
  }
}

function filterOperationalBlockers(snapshot: ReturnType<typeof buildDeliveryGovernanceSnapshot>) {
  return [
    ...snapshot.globalBlockers,
    ...snapshot.intakeBlockers,
    ...snapshot.importBlockers,
    ...snapshot.inviteBlockers,
    ...snapshot.launchControlBlockers,
    ...snapshot.activationBlockers,
    ...snapshot.firstValueBlockers,
    ...snapshot.reportDeliveryBlockers,
  ].filter((item, index, items) => item.trim().length > 0 && items.indexOf(item) === index)
}

export function mapGuidedPhaseToHrRoutePhase(phase: GuidedSelfServePhase): HrRouteBeheerPhaseKey {
  switch (phase) {
    case 'participant_data_required':
    case 'import_validation_required':
      return 'doelgroep'
    case 'launch_date_required':
    case 'communication_ready':
    case 'ready_to_invite':
      return 'communicatie'
    case 'survey_running':
      return 'live'
    case 'dashboard_active':
    case 'first_next_step_available':
      return 'output'
    case 'closed':
      return 'afronding'
    default:
      return 'doelgroep'
  }
}

function getHrRouteBeheerPhaseStatus(
  key: HrRouteBeheerPhaseKey,
  currentPhase: HrRouteBeheerPhaseKey,
): HrRouteBeheerPhaseStatus {
  const currentIndex = HR_ROUTE_PHASE_ORDER.indexOf(currentPhase)
  const phaseIndex = HR_ROUTE_PHASE_ORDER.indexOf(key)

  if (phaseIndex < currentIndex) return 'done'
  if (phaseIndex === currentIndex) return 'current'
  return 'open'
}

export function getRouteBeheerPhaseHref(campaignId: string, phaseKey: HrRouteBeheerPhaseKey) {
  return `/campaigns/${campaignId}/beheer?fase=${phaseKey}#fase-detail`
}

export function getRouteBeheerPhaseDetailHref(
  campaignId: string,
  phaseKey: HrRouteBeheerPhaseKey,
) {
  const detailAnchorByPhase: Record<HrRouteBeheerPhaseKey, string> = {
    doelgroep: 'deelnemers-en-importstatus',
    communicatie: 'route-instellingen',
    live: 'uitnodigingen-en-respons',
    output: 'dashboard-rapportstatus',
    afronding: 'status-en-logboek',
  }

  return `/campaigns/${campaignId}/beheer?fase=${phaseKey}#${detailAnchorByPhase[phaseKey]}`
}

export function buildHrRouteBeheerNowDoing(
  args: {
    guidedState: Pick<ReturnType<typeof buildGuidedSelfServeState>, 'phase' | 'nextAction'>
    campaignId: string
  },
): HrRouteBeheerNowDoing {
  const phaseKey = mapGuidedPhaseToHrRoutePhase(args.guidedState.phase)

  return {
    label: 'Nu doen',
    phaseKey,
    title: args.guidedState.nextAction.title,
    body: args.guidedState.nextAction.body,
    href:
      phaseKey === 'output'
        ? `/campaigns/${args.campaignId}`
        : phaseKey === 'afronding'
          ? getRouteBeheerPhaseDetailHref(args.campaignId, phaseKey)
          : getRouteBeheerPhaseDetailHref(args.campaignId, phaseKey),
  }
}

export function buildHrRouteBeheerPhaseSummary(args: {
  key: HrRouteBeheerPhaseKey
  status: HrRouteBeheerPhaseStatus
  campaignId: string
  respondentCount: number
  totalCompleted: number
  totalInvited: number
  outputSummary: RouteBeheerPageData['outputSummary']
}) {
  switch (args.key) {
    case 'doelgroep':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Deelnemers en importstatus',
        link: {
          label: 'Bekijk fase',
          href: getRouteBeheerPhaseHref(args.campaignId, args.key),
        },
      } satisfies HrRouteBeheerPhaseSummary
    case 'communicatie':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Route en startdatum',
        link: {
          label: 'Bekijk fase',
          href: getRouteBeheerPhaseHref(args.campaignId, args.key),
        },
      } satisfies HrRouteBeheerPhaseSummary
    case 'live':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Uitnodigingen en respons',
        link: {
          label: 'Bekijk fase',
          href: getRouteBeheerPhaseHref(args.campaignId, args.key),
        },
      } satisfies HrRouteBeheerPhaseSummary
    case 'output':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: args.outputSummary.label,
        link: {
          label: 'Bekijk fase',
          href: getRouteBeheerPhaseHref(args.campaignId, args.key),
        },
      } satisfies HrRouteBeheerPhaseSummary
    case 'afronding':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Status en logboek',
        link: {
          label: 'Bekijk fase',
          href: getRouteBeheerPhaseHref(args.campaignId, args.key),
        },
      } satisfies HrRouteBeheerPhaseSummary
    default:
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: '',
        link: null,
      } satisfies HrRouteBeheerPhaseSummary
  }
}

function buildHrRouteBeheerPhaseDetail(args: {
  key: HrRouteBeheerPhaseKey
  status: HrRouteBeheerPhaseStatus
  campaignId: string
  routeSettingsLabel: string
  routeSettingsBody: string
  respondentCount: number
  totalCompleted: number
  totalInvited: number
  pendingCount: number
  outputSummary: RouteBeheerPageData['outputSummary']
  outputStatusLabel: string
  readabilityBody: string
  isActive: boolean
  latestAuditSummary: string | null
}) {
  switch (args.key) {
    case 'doelgroep':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Deelnemers en importstatus',
        items: [{ label: 'Geimporteerd', value: `${args.respondentCount} deelnemers` }],
        links: [
          {
            label: 'Open doelgroep',
            href: getRouteBeheerPhaseDetailHref(args.campaignId, args.key),
          },
        ],
      } satisfies HrRouteBeheerPhaseDetail
    case 'communicatie':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Route en startdatum',
        items: [
          { label: 'Route', value: args.routeSettingsLabel },
          { label: 'Startdatum', value: args.routeSettingsBody.replace('Startdatum: ', '') },
        ],
        links: [
          { label: 'Bekijk instellingen', href: getRouteBeheerPhaseDetailHref(args.campaignId, args.key) },
        ],
      } satisfies HrRouteBeheerPhaseDetail
    case 'live':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Uitnodigingen en respons',
        items: [
          { label: 'Respons', value: `${args.totalCompleted}/${args.totalInvited} ingevuld` },
          { label: 'Openstaand', value: `${args.pendingCount}` },
        ],
        links: [
          { label: 'Open uitnodigingen', href: getRouteBeheerPhaseDetailHref(args.campaignId, args.key) },
        ],
      } satisfies HrRouteBeheerPhaseDetail
    case 'output':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Dashboard / rapportstatus',
        items: [
          { label: 'Status', value: args.outputStatusLabel },
          { label: 'Dashboard', value: args.outputSummary.dashboardReady ? 'Beschikbaar' : 'Nog niet' },
          { label: 'Rapport', value: args.outputSummary.reportReady ? 'Beschikbaar' : 'Nog niet' },
        ],
        links: [
          { label: 'Open dashboard', href: args.outputSummary.dashboardHref },
          ...(args.outputSummary.reportHref
            ? [{ label: 'Open rapporten', href: args.outputSummary.reportHref }]
            : []),
        ],
      } satisfies HrRouteBeheerPhaseDetail
    case 'afronding':
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: 'Status en logboek',
        items: [{ label: 'Laatste logregel', value: args.latestAuditSummary ?? 'Geen activiteit' }],
        links: [
          {
            label: 'Bekijk logboek',
            href: getRouteBeheerPhaseDetailHref(args.campaignId, args.key),
          },
        ],
      } satisfies HrRouteBeheerPhaseDetail
    default:
      return {
        key: args.key,
        label: HR_ROUTE_PHASE_LABELS[args.key],
        status: args.status,
        body: '',
        items: [],
        links: [],
      } satisfies HrRouteBeheerPhaseDetail
  }
}

export async function fetchRouteBeheerData(args: {
  campaignId: string
  supabase: SupabaseLike
  userId: string
}) {
  const { campaignId, supabase, userId } = args
  const { data: statsRow } = await supabase
    .from('campaign_stats')
    .select('*')
    .eq('campaign_id', campaignId)
    .single()

  if (!statsRow) {
    return null
  }

  const stats = statsRow as CampaignStats

  const [
    { data: profile },
    { data: membership },
    { data: organization },
    { data: campaignMeta },
    { count: activeClientAccessCount },
    { count: pendingClientInviteCount },
    { data: deliveryRecordRaw },
    { data: respondentsRaw },
    { data: responsesRaw },
    { data: auditEventsRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('is_verisight_admin').eq('id', userId).maybeSingle(),
    supabase
      .from('org_members')
      .select('role')
      .eq('org_id', stats.organization_id)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('organizations').select('name').eq('id', stats.organization_id).maybeSingle(),
    supabase
      .from('campaigns')
      .select('delivery_mode, created_at, enabled_modules')
      .eq('id', campaignId)
      .maybeSingle(),
    supabase
      .from('org_members')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', stats.organization_id)
      .in('role', ['viewer', 'member']),
    supabase
      .from('org_invites')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', stats.organization_id)
      .is('accepted_at', null),
    supabase.from('campaign_delivery_records').select('*').eq('campaign_id', campaignId).maybeSingle(),
    supabase
      .from('respondents')
      .select('id, token, email, sent_at, completed, completed_at')
      .eq('campaign_id', campaignId)
      .order('completed_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('survey_responses')
      .select('id, org_scores, sdt_scores, respondents!inner(campaign_id)')
      .eq('respondents.campaign_id', campaignId),
    supabase
      .from('campaign_action_audit_events')
      .select('id, action_key, outcome, action_label, owner_label, actor_role, actor_label, summary, metadata, created_at')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const memberRole = (membership?.role ?? null) as MemberRole | null
  const isVerisightAdmin = profile?.is_verisight_admin === true
  const canManageCampaign =
    isVerisightAdmin || getCustomerActionPermission(memberRole, 'review_launch')
  const canExecuteCampaign =
    isVerisightAdmin ||
    getCustomerActionPermission(memberRole, 'import_respondents') ||
    getCustomerActionPermission(memberRole, 'launch_invites') ||
    getCustomerActionPermission(memberRole, 'send_reminders')

  const deliveryRecord = (deliveryRecordRaw ?? null) as CampaignDeliveryRecord | null
  const { data: deliveryCheckpointsRaw } = deliveryRecord
    ? await supabase
        .from('campaign_delivery_checkpoints')
        .select('*')
        .eq('delivery_record_id', deliveryRecord.id)
        .order('created_at', { ascending: true })
    : { data: [] }
  const deliveryCheckpoints = (deliveryCheckpointsRaw ?? []) as CampaignDeliveryCheckpoint[]

  const respondents = (respondentsRaw ?? []) as Pick<
    Respondent,
    'id' | 'token' | 'email' | 'sent_at' | 'completed' | 'completed_at'
  >[]
  const responseRows = (responsesRaw ?? []) as Array<{ id: string; org_scores: unknown; sdt_scores: unknown }>
  const auditEvents = (auditEventsRaw ?? []) as CampaignAuditEventRecord[]
  const campaign = (campaignMeta ?? null) as Pick<
    Campaign,
    'delivery_mode' | 'created_at' | 'enabled_modules'
  > | null

  const pendingCount = stats.total_invited - stats.total_completed
  const invitesNotSent = respondents.filter((respondent) => !respondent.sent_at && !respondent.completed).length
  const remindableRespondents = respondents.filter(
    (respondent) => !respondent.completed && typeof respondent.email === 'string' && respondent.email.trim().length > 0,
  )
  const unsentRespondents = respondents
    .filter(
      (respondent) =>
        !respondent.sent_at &&
        !respondent.completed &&
        typeof respondent.email === 'string' &&
        respondent.email.trim().length > 0,
    )
    .map((respondent) => ({ token: respondent.token, email: respondent.email }))
  const incompleteScores = responseRows.filter(
    (response) => !response.org_scores || !response.sdt_scores,
  ).length
  const hasMinDisplay = responseRows.length >= FIRST_DASHBOARD_THRESHOLD
  const hasEnoughData = responseRows.length >= FIRST_INSIGHT_THRESHOLD
  const importQaCheckpoint = deliveryCheckpoints.find((checkpoint) => checkpoint.checkpoint_key === 'import_qa')
  const importReady = importQaCheckpoint ? importQaCheckpoint.auto_state === 'ready' : null

  const guidedSetupDiscipline = deriveGuidedSelfServeDiscipline(
    deliveryCheckpoints
      .filter(
        (
          checkpoint,
        ): checkpoint is CampaignDeliveryCheckpoint & {
          checkpoint_key: 'implementation_intake' | 'import_qa' | 'invite_readiness'
        } =>
          checkpoint.checkpoint_key === 'implementation_intake' ||
          checkpoint.checkpoint_key === 'import_qa' ||
          checkpoint.checkpoint_key === 'invite_readiness',
      )
      .map((checkpoint) => ({
        checkpointKey: checkpoint.checkpoint_key,
        manualState: checkpoint.manual_state,
      })),
  )

  const autoSignals = buildDeliveryAutoSignals({
    scanType: stats.scan_type,
    linkedLeadPresent: Boolean(deliveryRecord?.contact_request_id),
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    invitesNotSent,
    incompleteScores,
    hasMinDisplay,
    hasEnoughData,
    activeClientAccessCount: activeClientAccessCount ?? 0,
    pendingClientInviteCount: pendingClientInviteCount ?? 0,
    importReady,
  })
  const governance = buildDeliveryGovernanceSnapshot({
    scanType: stats.scan_type,
    record: deliveryRecord,
    checkpoints: deliveryCheckpoints,
    autoSignals,
  })
  const guidedState = buildGuidedSelfServeState({
    isActive: stats.is_active,
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    invitesNotSent,
    hasMinDisplay,
    hasEnoughData,
    importQaConfirmed: guidedSetupDiscipline.importQaConfirmed,
    launchTimingConfirmed: guidedSetupDiscipline.launchTimingConfirmed,
    communicationReady: guidedSetupDiscipline.communicationReady,
    importReady: importReady ?? undefined,
  })
  const readability = getReadabilityPresentation(responseRows.length)
  const statusBadge = getStatusBadgeLabel({
    isActive: stats.is_active,
    invitesNotSent,
  })
  const lastActivityAt = getLatestActivityTimestamp(auditEvents, deliveryRecord?.updated_at)
  const lifecycleStage = deliveryRecord?.lifecycle_stage ?? null
  const routePeriodLabel = formatRoutePeriodLabel(stats.campaign_name, stats.created_at)
  const deliveryModeLabel =
    campaign?.delivery_mode != null
      ? getDeliveryModeLabel(campaign.delivery_mode, stats.scan_type)
      : null

  const routeSettingsLabel = [
    SCAN_TYPE_LABELS[stats.scan_type] ?? 'Onbekend scantype',
    deliveryModeLabel,
    routePeriodLabel,
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' / ')
  const routeSettingsBody = getRouteSettingsBody({
    launchDate: deliveryRecord?.launch_date ?? deliveryRecord?.launch_confirmed_at ?? null,
    createdAt: campaign?.created_at ?? stats.created_at,
  })
  const outputSummary = {
    dashboardReady: hasMinDisplay,
    reportReady: hasMinDisplay,
    dashboardHref: `/campaigns/${campaignId}`,
    reportHref: null,
    label: 'Dashboard / rapportstatus',
  } satisfies RouteBeheerPageData['outputSummary']
  const currentHrPhase = mapGuidedPhaseToHrRoutePhase(guidedState.phase)
  const nowDoing = buildHrRouteBeheerNowDoing({ guidedState, campaignId })
  const phaseSummaries = HR_ROUTE_PHASE_ORDER.map((key) =>
    buildHrRouteBeheerPhaseSummary({
      key,
      status: getHrRouteBeheerPhaseStatus(key, currentHrPhase),
      campaignId,
      respondentCount: respondents.length,
      totalCompleted: stats.total_completed,
      totalInvited: stats.total_invited,
      outputSummary,
    }),
  )
  const phaseDetails = HR_ROUTE_PHASE_ORDER.map((key) =>
    buildHrRouteBeheerPhaseDetail({
      key,
      status: getHrRouteBeheerPhaseStatus(key, currentHrPhase),
      campaignId,
      routeSettingsLabel,
      routeSettingsBody,
      respondentCount: respondents.length,
      totalCompleted: stats.total_completed,
      totalInvited: stats.total_invited,
      pendingCount,
      outputSummary,
      outputStatusLabel: outputSummary.label,
      readabilityBody: readability.body,
      isActive: stats.is_active,
      latestAuditSummary: auditEvents[0]?.summary ?? null,
    }),
  )

  return {
    campaignId,
    campaignName: stats.campaign_name,
    organizationName: organization?.name ?? null,
    scanType: stats.scan_type,
    scanTypeLabel: SCAN_TYPE_LABELS[stats.scan_type] ?? 'Onbekend scantype',
    deliveryModeLabel,
    routePeriodLabel,
    isActive: stats.is_active,
    statusBadgeLabel: statusBadge.label,
    statusBadgeTone: statusBadge.tone,
    lastActivityAt,
    launchDate: deliveryRecord?.launch_date ?? deliveryRecord?.launch_confirmed_at ?? null,
    totalInvited: stats.total_invited,
    totalCompleted: stats.total_completed,
    pendingCount,
    completionRatePct:
      typeof stats.completion_rate_pct === 'number' ? stats.completion_rate_pct : null,
    invitesNotSent,
    hasMinDisplay,
    hasEnoughData,
    readabilityLabel: readability.label,
    readabilityBody: readability.body,
    nextActionTitle: guidedState.nextAction.title,
    nextActionBody: guidedState.nextAction.body,
    blockers: filterOperationalBlockers(governance),
    lifecycleStage,
    lifecycleSteps: buildRouteBeheerLifecycleSteps({
      stage: lifecycleStage,
      isActive: stats.is_active,
      hasMinDisplay,
      hasEnoughData,
    }),
    nowDoing,
    phaseSummaries,
    phaseDetails,
    // Keep this compact and always visible. Richer output explanation stays owned by the output phase detail.
    outputSummary,
    respondentCount: respondents.length,
    routeSettingsLabel,
    routeSettingsBody,
    outputStatusLabel: outputSummary.label,
    latestAuditSummary: auditEvents[0]?.summary ?? null,
    reportAvailable: hasMinDisplay,
    canExecuteCampaign,
    canManageCampaign,
    membershipRole: memberRole,
    selfServe: {
      deliveryMode: campaign?.delivery_mode ?? null,
      importReady: importReady === true,
      hasSegmentDeepDive: hasCampaignAddOn(campaign, 'segment_deep_dive'),
      importQaConfirmed: guidedSetupDiscipline.importQaConfirmed,
      launchTimingConfirmed: guidedSetupDiscipline.launchTimingConfirmed,
      communicationReady: guidedSetupDiscipline.communicationReady,
      remindableCount: remindableRespondents.length,
      unsentRespondents,
      launchConfirmedAt: deliveryRecord?.launch_confirmed_at ?? null,
      participantCommsConfig: deliveryRecord?.participant_comms_config ?? null,
      reminderConfig: deliveryRecord?.reminder_config ?? null,
    },
  } satisfies RouteBeheerPageData
}

export function getLaunchCardValue(data: Pick<RouteBeheerPageData, 'isActive' | 'launchDate'>) {
  return getLaunchValue(data)
}
