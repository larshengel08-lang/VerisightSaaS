import type { ScanType } from '@/lib/types'
import { buildLaunchControlState } from '@/lib/launch-controls'

export type DeliveryLifecycleStage =
  | 'setup_in_progress'
  | 'import_cleared'
  | 'invites_live'
  | 'client_activation_pending'
  | 'client_activation_confirmed'
  | 'first_value_reached'
  | 'first_management_use'
  | 'follow_up_decided'
  | 'learning_closed'

export type DeliveryExceptionStatus =
  | 'none'
  | 'blocked'
  | 'needs_operator_recovery'
  | 'awaiting_client_input'
  | 'awaiting_external_delivery'

export type DeliveryCheckpointKey =
  | 'implementation_intake'
  | 'import_qa'
  | 'invite_readiness'
  | 'client_activation'
  | 'first_value'
  | 'report_delivery'
  | 'first_management_use'

export type DeliveryAutoState = 'unknown' | 'not_ready' | 'warning' | 'ready'
export type DeliveryManualState = 'pending' | 'confirmed' | 'not_applicable'

export interface CampaignDeliveryRecord {
  id: string
  organization_id: string
  campaign_id: string
  contact_request_id: string | null
  lifecycle_stage: DeliveryLifecycleStage
  exception_status: DeliveryExceptionStatus
  operator_owner: string | null
  next_step: string | null
  operator_notes: string | null
  customer_handoff_note: string | null
  launch_date: string | null
  launch_confirmed_at: string | null
  participant_comms_config: unknown
  reminder_config: unknown
  first_management_use_confirmed_at: string | null
  follow_up_decided_at: string | null
  learning_closed_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignDeliveryCheckpoint {
  id: string
  delivery_record_id: string
  checkpoint_key: DeliveryCheckpointKey
  auto_state: DeliveryAutoState
  manual_state: DeliveryManualState
  exception_status: DeliveryExceptionStatus
  last_auto_summary: string | null
  operator_note: string | null
  created_at: string
  updated_at: string
}

export type DeliveryRecordGovernanceContext = Pick<
  CampaignDeliveryRecord,
  | 'contact_request_id'
  | 'lifecycle_stage'
  | 'exception_status'
  | 'launch_date'
  | 'launch_confirmed_at'
  | 'participant_comms_config'
  | 'reminder_config'
  | 'first_management_use_confirmed_at'
  | 'follow_up_decided_at'
  | 'learning_closed_at'
>

type DeliveryAutoSignal = {
  autoState: DeliveryAutoState
  summary: string
}

export type DeliveryGovernanceSnapshot = {
  checkpointMap: Partial<Record<DeliveryCheckpointKey, CampaignDeliveryCheckpoint>>
  globalBlockers: string[]
  intakeBlockers: string[]
  importBlockers: string[]
  inviteBlockers: string[]
  launchControlBlockers: string[]
  activationBlockers: string[]
  firstValueBlockers: string[]
  reportDeliveryBlockers: string[]
  managementUseBlockers: string[]
  followUpBlockers: string[]
  learningCloseoutBlockers: string[]
  launchReady: boolean
  activationReady: boolean
  firstValueReady: boolean
  reportDeliveryReady: boolean
  managementUseReady: boolean
  followUpReady: boolean
  learningCloseoutReady: boolean
}

export type DeliveryOperatingRole = {
  title: string
  owner: string
  responsibility: string
}

export type DeliveryManagementUseStep = {
  title: string
  detail: string
}

export type DeliveryFollowUpOutcome = {
  title: string
  fit: string
  detail: string
}

export type DeliveryExceptionRule = {
  status: Exclude<DeliveryExceptionStatus, 'none'>
  title: string
  owner: string
  responseWindow: string
  escalationRule: string
}

export type DeliveryWeeklyReviewRule = {
  title: string
  detail: string
}

export type DeliveryOperatingGuide = {
  roles: DeliveryOperatingRole[]
  managementUseSteps: DeliveryManagementUseStep[]
  followUpOutcomes: DeliveryFollowUpOutcome[]
  exceptionRules: DeliveryExceptionRule[]
  weeklyReviewRules: DeliveryWeeklyReviewRule[]
}

type DeliveryAutoSignalArgs = {
  scanType: ScanType
  linkedLeadPresent: boolean
  totalInvited: number
  totalCompleted: number
  invitesNotSent: number
  incompleteScores: number
  hasMinDisplay: boolean
  hasEnoughData: boolean
  activeClientAccessCount: number
  pendingClientInviteCount: number
  importReady: boolean | null
}

export const DELIVERY_LIFECYCLE_OPTIONS: Array<{ value: DeliveryLifecycleStage; label: string }> = [
  { value: 'setup_in_progress', label: 'Setup in uitvoering' },
  { value: 'import_cleared', label: 'Import vrijgegeven' },
  { value: 'invites_live', label: 'Invites live' },
  { value: 'client_activation_pending', label: 'Klantactivatie loopt' },
  { value: 'client_activation_confirmed', label: 'Klantactivatie bevestigd' },
  { value: 'first_value_reached', label: 'First value bereikt' },
  { value: 'first_management_use', label: 'Eerste managementgebruik' },
  { value: 'follow_up_decided', label: 'Follow-up besloten' },
  { value: 'learning_closed', label: 'Learning gesloten' },
] as const

export const DELIVERY_EXCEPTION_OPTIONS: Array<{ value: DeliveryExceptionStatus; label: string }> = [
  { value: 'none', label: 'Geen exception' },
  { value: 'blocked', label: 'Geblokkeerd' },
  { value: 'needs_operator_recovery', label: 'Operator recovery nodig' },
  { value: 'awaiting_client_input', label: 'Wacht op klantinput' },
  { value: 'awaiting_external_delivery', label: 'Wacht op externe delivery' },
] as const

export const DELIVERY_MANUAL_STATE_OPTIONS: Array<{ value: DeliveryManualState; label: string }> = [
  { value: 'pending', label: 'Nog bevestigen' },
  { value: 'confirmed', label: 'Bevestigd' },
  { value: 'not_applicable', label: 'Niet van toepassing' },
] as const

export const DELIVERY_CHECKPOINT_DEFINITIONS: Array<{
  key: DeliveryCheckpointKey
  title: string
  description: string
}> = [
  {
    key: 'implementation_intake',
    title: 'Implementation intake',
    description: 'Route, timing, doelgroep, metadata en eerste managementdoel zijn expliciet bevestigd.',
  },
  {
    key: 'import_qa',
    title: 'Import QA',
    description: 'Bestand, preview, metadata en importkeuze zijn gecontroleerd voor definitieve uitvoering.',
  },
  {
    key: 'invite_readiness',
    title: 'Invite readiness',
    description: 'Respondentuitnodigingen zijn bewust vrijgegeven en de mailflow is operationeel klaar.',
  },
  {
    key: 'client_activation',
    title: 'Klantactivatie',
    description: 'De klant heeft dashboardtoegang of een lopende activatie die actief wordt begeleid.',
  },
  {
    key: 'first_value',
    title: 'First value readiness',
    description: 'De campagne heeft genoeg bruikbare output om eerste managementwaarde veilig te dragen.',
  },
  {
    key: 'report_delivery',
    title: 'Report delivery',
    description: 'Rapportdownload en managementuitleg zijn expliciet gecontroleerd en opgeleverd.',
  },
  {
    key: 'first_management_use',
    title: 'Eerste managementgebruik',
    description: 'Dashboard of rapport is echt gebruikt voor prioriteit, eigenaar en vervolgstap.',
  },
] as const

const DELIVERY_LIFECYCLE_ORDER: DeliveryLifecycleStage[] = [
  'setup_in_progress',
  'import_cleared',
  'invites_live',
  'client_activation_pending',
  'client_activation_confirmed',
  'first_value_reached',
  'first_management_use',
  'follow_up_decided',
  'learning_closed',
]

export function getDeliveryLifecycleLabel(value: DeliveryLifecycleStage | null | undefined) {
  return DELIVERY_LIFECYCLE_OPTIONS.find((option) => option.value === value)?.label ?? 'Setup in uitvoering'
}

export function getDeliveryExceptionLabel(value: DeliveryExceptionStatus | null | undefined) {
  return DELIVERY_EXCEPTION_OPTIONS.find((option) => option.value === value)?.label ?? 'Geen exception'
}

export function getDeliveryManualStateLabel(value: DeliveryManualState | null | undefined) {
  return DELIVERY_MANUAL_STATE_OPTIONS.find((option) => option.value === value)?.label ?? 'Nog bevestigen'
}

export function getDeliveryCheckpointTitle(key: DeliveryCheckpointKey) {
  return DELIVERY_CHECKPOINT_DEFINITIONS.find((definition) => definition.key === key)?.title ?? key
}

export function getDeliveryAutoStateLabel(value: DeliveryAutoState) {
  switch (value) {
    case 'ready':
      return 'Auto gereed'
    case 'warning':
      return 'Handmatige check nodig'
    case 'not_ready':
      return 'Nog niet klaar'
    case 'unknown':
    default:
      return 'Nog geen autosignaal'
  }
}

export function isDeliveryLifecycleAtLeast(
  current: DeliveryLifecycleStage | null | undefined,
  target: DeliveryLifecycleStage,
) {
  if (!current) return false
  return DELIVERY_LIFECYCLE_ORDER.indexOf(current) >= DELIVERY_LIFECYCLE_ORDER.indexOf(target)
}

export function buildDeliveryCheckpointMap(checkpoints: CampaignDeliveryCheckpoint[]) {
  return Object.fromEntries(
    checkpoints.map((checkpoint) => [checkpoint.checkpoint_key, checkpoint]),
  ) as Partial<Record<DeliveryCheckpointKey, CampaignDeliveryCheckpoint>>
}

export function getDeliveryOperatingGuide(scanType: ScanType): DeliveryOperatingGuide {
  const sharedRoles: DeliveryOperatingRole[] = [
    {
      title: 'Delivery-owner',
      owner: 'Loep delivery',
      responsibility: 'Bewaakt launch discipline, deliverystart, open blockers en de eerstvolgende stap.',
    },
    {
      title: 'Management-use confirmer',
      owner:
        scanType === 'exit' || scanType === 'retention'
          ? 'Klant sponsor of HR-owner'
          : 'Klant owner van de bounded route',
      responsibility: 'Bevestigt dat output echt in een eerste managementgesprek is gebruikt en dat eigenaar, eerste stap en reviewdatum expliciet zijn.',
    },
    {
      title: 'Follow-up beslisser',
      owner: 'Loep + klant owner',
      responsibility: 'Kiest bewust of de route doorgaat, bounded vervolgt, verdiept, pauzeert of stopt.',
    },
  ]

  const managementUseSteps: DeliveryManagementUseStep[] = [
    {
      title: 'Leg de eerste managementvraag vast',
      detail:
        scanType === 'onboarding'
          ? 'Maak expliciet waar de vroege landing nu stokt en welk checkpointspoor eerst aandacht vraagt.'
          : scanType === 'leadership'
            ? 'Maak expliciet welke managementcontext nu eerst een begrensde check of correctie vraagt.'
            : scanType === 'pulse'
              ? 'Maak expliciet welke review- of herijkingsvraag nu eerst aandacht vraagt.'
              : scanType === 'retention'
                ? 'Maak expliciet waar behoud nu onder druk staat en welk verificatiespoor eerst telt.'
                : 'Maak expliciet welk vertrek- of verbeterpatroon nu als eerste managementvraag telt.',
    },
    {
      title: 'Bevestig eigenaar en eerste stap',
      detail: 'Leg vast wie de eigenaar is, welke kleine toetsbare stap nu start en wat nog niet besloten is.',
    },
    {
      title: 'Zet reviewdatum en terugkoppeling',
      detail: 'Management use telt pas echt als een reviewmoment en verwachte terugkoppeling expliciet zijn vastgelegd.',
    },
  ]

  const followUpOutcomes: DeliveryFollowUpOutcome[] =
    scanType === 'onboarding'
      ? [
          {
            title: 'Doorgaan op hetzelfde checkpointspoor',
            fit: 'Alleen na expliciete eerste borg- of correctiestap',
            detail: 'Gebruik dit pas als eigenaar, eerste stap en vervolgmoment al vaststaan. Onboarding blijft hierbij een bounded checkpoint-route, geen journey-suite.',
          },
          {
            title: 'Bounded vervolg',
            fit: 'Alleen bij logische volgende checkpointread',
            detail: 'Kies dit alleen wanneer dezelfde instroomvraag later opnieuw getoetst moet worden zonder bredere lifecycle-uitbouw.',
          },
          {
            title: 'Stop of ga naar andere route',
            fit: 'Bij andere managementvraag',
            detail: 'Schakel pas door als de vraag inmiddels eerder over behoud, retrospectieve duiding of lokale lokalisatie gaat dan over vroege landing.',
          },
        ]
      : scanType === 'leadership'
        ? [
            {
              title: 'Doorgaan met bounded verificatie',
              fit: 'Alleen na expliciete eerste correctie',
              detail: 'Gebruik dit wanneer dezelfde managementcontext later opnieuw begrensd getoetst moet worden.',
            },
            {
              title: 'Verdiepen zonder named leaders',
              fit: 'Alleen bij scherpere groepsvraag',
              detail: 'Verdiep alleen zolang de route group-level blijft en niet afglijdt naar 360-, named-leader- of performance-logica.',
            },
            {
              title: 'Stop of ga terug naar bredere duiding',
              fit: 'Bij andere managementvraag',
              detail: 'Gebruik dit wanneer de contextvraag eigenlijk een bredere people-route of een andere productscope vraagt.',
            },
          ]
        : scanType === 'pulse'
          ? [
              {
                title: 'Doorgaan met bounded hercheck',
                fit: 'Alleen na zichtbare kleine correctie',
                detail: 'Gebruik dit wanneer de eerste review al heeft geleid tot een eigenaar, kleine bijsturing en afgesproken hercheck.',
              },
              {
                title: 'Verdiepen naar bredere duiding',
                fit: 'Alleen als reviewvraag te groot wordt',
                detail: 'Gebruik dit wanneer dezelfde signalen niet meer als compacte reviewvraag leesbaar blijven.',
              },
              {
                title: 'Pauzeren of stoppen',
                fit: 'Bij voldoende stabilisatie of te smalle basis',
                detail: 'Houd Pulse compact en kies bewust voor stop of later opnieuw openen in plaats van automatische ritme-uitbreiding.',
              },
            ]
          : [
              {
                title: 'Doorgaan op dezelfde route',
                fit: 'Standaard na eerste managementuse',
                detail: 'Gebruik dit als dezelfde managementvraag een logische vervolgmeting of verdere uitvoering vraagt.',
              },
              {
                title: 'Bounded vervolg of verdieping',
                fit: 'Alleen bij expliciete aanvullende vraag',
                detail: 'Kies dit wanneer dezelfde route blijft, maar een extra verdiepingslaag of bounded vervolg bewust is gekozen.',
              },
              {
                title: 'Pauzeren of stoppen',
                fit: 'Bij afgeronde eerste actie of andere routevraag',
                detail: 'Gebruik dit wanneer de eerste managementactie staat en een volgende stap pas later of via een ander product logisch wordt.',
              },
            ]

  const exceptionRules: DeliveryExceptionRule[] = [
    {
      status: 'blocked',
      title: 'Geblokkeerd',
      owner: 'Delivery-owner',
      responseWindow: 'Zelfde werkdag triage',
      escalationRule: 'Escaleer bestuurlijk zodra de blokkade launch, first value of management use direct tegenhoudt.',
    },
    {
      status: 'needs_operator_recovery',
      title: 'Operator recovery nodig',
      owner: 'Loep delivery',
      responseWindow: 'Binnen 1 werkdag herstelpad',
      escalationRule: 'Escaleer als herstel niet binnen het afgesproken reviewmoment of de eerstvolgende deliverystap kan landen.',
    },
    {
      status: 'awaiting_client_input',
      title: 'Wacht op klantinput',
      owner: 'Klant owner + delivery-owner',
      responseWindow: 'Binnen 2 werkdagen opvolgen',
      escalationRule: 'Escaleer als ontbrekende input first value, report delivery of follow-upbesluit blijft blokkeren.',
    },
    {
      status: 'awaiting_external_delivery',
      title: 'Wacht op externe delivery',
      owner: 'Delivery-owner',
      responseWindow: 'Binnen 1 werkdag statusupdate',
      escalationRule: 'Escaleer zodra externe afhankelijkheid het afgesproken launch- of reviewmoment in gevaar brengt.',
    },
  ]

  const weeklyReviewRules: DeliveryWeeklyReviewRule[] = [
    {
      title: 'Open launch- en activationblockers',
      detail: 'Bekijk wekelijks alle dossiers met open intake-, import-, invite- of activatieblokkades en leg de eerstvolgende stap opnieuw vast.',
    },
    {
      title: 'Management use zonder follow-up',
      detail: 'Bekijk wekelijks alle dossiers waar first management use al bevestigd is, maar follow-up nog niet expliciet is besloten.',
    },
    {
      title: 'Verouderde bounded routes',
      detail: 'Heropen dossiers waarvan reviewdatum, volgende stap of owner ontbreekt, zodat bounded routes niet stilzwijgend als gezond blijven ogen.',
    },
  ]

  return {
    roles: sharedRoles,
    managementUseSteps,
    followUpOutcomes,
    exceptionRules,
    weeklyReviewRules,
  }
}

export function buildDeliveryAutoSignals({
  scanType,
  linkedLeadPresent,
  totalInvited,
  totalCompleted,
  invitesNotSent,
  incompleteScores,
  hasMinDisplay,
  hasEnoughData,
  activeClientAccessCount,
  pendingClientInviteCount,
  importReady,
}: DeliveryAutoSignalArgs): Record<DeliveryCheckpointKey, DeliveryAutoSignal> {
  return {
    implementation_intake: linkedLeadPresent
      ? {
          autoState: 'ready',
          summary: 'Er is een gekoppelde lead of handoff-context zichtbaar voor deze campaign.',
        }
      : {
          autoState: totalInvited > 0 ? 'warning' : 'unknown',
          summary: totalInvited > 0
            ? 'Campaign bestaat al, maar de intakeharde handoff is nog niet expliciet gekoppeld.'
            : 'Nog geen gekoppelde lead of intakeharde handoff zichtbaar.',
        },
    import_qa:
      importReady === true
        ? {
            autoState: 'ready',
            summary:
              totalInvited === 1
                ? 'Het deelnemersbestand is gecontroleerd en 1 deelnemer staat vrijgegeven voor launch.'
                : `Het deelnemersbestand is gecontroleerd en ${totalInvited} deelnemers staan vrijgegeven voor launch.`,
          }
        : importReady === false
          ? {
              autoState: 'not_ready',
              summary:
                totalInvited > 0
                  ? 'Het deelnemersbestand is nog niet vrijgegeven voor launch.'
                  : 'Nog geen gecontroleerd deelnemersbestand beschikbaar.',
            }
          : {
              autoState: 'unknown',
              summary: 'Importstatus is nog niet bekend.',
            },
    invite_readiness:
      totalInvited === 0
        ? {
            autoState: 'not_ready',
            summary: 'Zonder respondenten kan de inviteflow nog niet live.',
          }
        : invitesNotSent > 0
          ? {
              autoState: 'warning',
              summary: `${invitesNotSent} respondent(en) hebben nog geen uitnodiging ontvangen.`,
            }
          : {
              autoState: 'ready',
              summary: 'Alle respondenten hebben een uitnodiging of de route is bewust zonder open invitegaten.',
            },
    client_activation:
      activeClientAccessCount > 0
        ? {
            autoState: 'ready',
            summary: `${activeClientAccessCount} actieve klantaccount(s) gekoppeld aan deze organisatie.`,
          }
        : pendingClientInviteCount > 0
          ? {
              autoState: 'warning',
              summary: `${pendingClientInviteCount} klantinvite(s) wachten nog op activatie.`,
            }
          : {
              autoState: 'not_ready',
              summary: 'Nog geen klantdashboardtoegang of open activatie zichtbaar.',
            },
    first_value:
      incompleteScores > 0
        ? {
            autoState: 'warning',
            summary: `${incompleteScores} response(s) bevatten nog onvolledige scoredata.`,
          }
        : hasEnoughData
          ? {
              autoState: 'ready',
              summary: `${totalCompleted} responses geven een stevig genoeg patroonbeeld voor first value.`,
            }
          : hasMinDisplay
            ? {
                autoState: 'warning',
                summary: `${totalCompleted} responses geven al een indicatief beeld, maar nog geen stevig patroonniveau.`,
              }
            : {
                autoState: 'not_ready',
                summary:
                  scanType === 'retention'
                    ? 'RetentieScan zit nog onder de veilige first-value drempel van 5 responses.'
                    : 'ExitScan zit nog onder de veilige first-value drempel van 5 responses.',
              },
    report_delivery:
      incompleteScores > 0
        ? {
            autoState: 'warning',
            summary: 'Rapportcontrole vraagt eerst herstel van incomplete scoredata.',
          }
        : hasMinDisplay
          ? {
              autoState: 'warning',
              summary: 'Rapport kan nu operationeel worden gecontroleerd, maar expliciete opleverbevestiging blijft handmatig.',
            }
          : {
              autoState: 'not_ready',
              summary: 'Wacht met rapportdelivery tot er minimaal 5 bruikbare responses zijn.',
            },
    first_management_use:
      activeClientAccessCount > 0
        ? {
            autoState: 'warning',
            summary: 'Klanttoegang is actief; bevestig nu nog handmatig of eerste managementgebruik echt heeft plaatsgevonden.',
          }
        : pendingClientInviteCount > 0
          ? {
              autoState: 'warning',
              summary: 'Er loopt al een klantactivatie, maar eerste managementgebruik is nog niet bevestigd.',
            }
          : {
              autoState: 'not_ready',
              summary: 'Eerste managementgebruik ligt nog niet voor de hand zonder klantactivatie.',
            },
  }
}

export function checkpointCountsAsConfirmed(checkpoint: CampaignDeliveryCheckpoint | undefined) {
  return checkpoint?.manual_state === 'confirmed' || checkpoint?.manual_state === 'not_applicable'
}

function dedupeMessages(items: string[]) {
  return Array.from(new Set(items.filter((item) => item.trim().length > 0)))
}

function collectCheckpointBlockers(args: {
  checkpoint: CampaignDeliveryCheckpoint | undefined
  autoSignal: DeliveryAutoSignal
  pendingMessage: string
  requireReadyAutoState?: boolean
}) {
  const items: string[] = []

  if (!checkpointCountsAsConfirmed(args.checkpoint)) {
    items.push(args.pendingMessage)
  }

  if (args.requireReadyAutoState) {
    if (args.autoSignal.autoState !== 'ready') {
      items.push(args.autoSignal.summary)
    }
  } else if (args.autoSignal.autoState === 'not_ready') {
    items.push(args.autoSignal.summary)
  }

  if (args.checkpoint?.exception_status && args.checkpoint.exception_status !== 'none') {
    items.push(`Checkpoint-exception open: ${getDeliveryExceptionLabel(args.checkpoint.exception_status)}.`)
  }

  return dedupeMessages(items)
}

export function buildDeliveryGovernanceSnapshot(args: {
  scanType: ScanType
  record: DeliveryRecordGovernanceContext | null
  checkpoints: CampaignDeliveryCheckpoint[]
  autoSignals: Record<DeliveryCheckpointKey, DeliveryAutoSignal>
  hasLearningCloseoutEvidence?: boolean
}) {
  const checkpointMap = buildDeliveryCheckpointMap(args.checkpoints)
  const globalBlockers =
    args.record?.exception_status && args.record.exception_status !== 'none'
      ? [`Open delivery-exception: ${getDeliveryExceptionLabel(args.record.exception_status)}.`]
      : []

  const intakeBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.implementation_intake,
    autoSignal: args.autoSignals.implementation_intake,
    pendingMessage: 'Implementation intake is nog niet expliciet bevestigd.',
  })
  const importBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.import_qa,
    autoSignal: args.autoSignals.import_qa,
    pendingMessage: 'Import QA is nog niet expliciet bevestigd.',
    requireReadyAutoState: true,
  })
  const inviteBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.invite_readiness,
    autoSignal: args.autoSignals.invite_readiness,
    pendingMessage: 'Invite readiness is nog niet expliciet bevestigd.',
  })
  const launchControlBlockers = buildLaunchControlState({
    launchDate: args.record?.launch_date ?? null,
    participantCommsConfig: args.record?.participant_comms_config ?? null,
    reminderConfig: args.record?.reminder_config ?? null,
    launchConfirmedAt: args.record?.launch_confirmed_at ?? null,
  }).blockers
  const launchInviteBlockers = dedupeMessages([...inviteBlockers, ...launchControlBlockers])
  const activationBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.client_activation,
    autoSignal: args.autoSignals.client_activation,
    pendingMessage: 'Klantactivatie is nog niet expliciet bevestigd.',
    requireReadyAutoState: true,
  })
  const firstValueBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.first_value,
    autoSignal: args.autoSignals.first_value,
    pendingMessage: 'First value is nog niet expliciet bevestigd.',
    requireReadyAutoState: true,
  })
  const reportDeliveryBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.report_delivery,
    autoSignal: args.autoSignals.report_delivery,
    pendingMessage:
      args.scanType === 'exit' || args.scanType === 'retention'
        ? 'Rapportdelivery is nog niet expliciet bevestigd.'
        : 'Management-output delivery is nog niet expliciet bevestigd.',
  })
  const managementUseBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.first_management_use,
    autoSignal: args.autoSignals.first_management_use,
    pendingMessage: 'Eerste managementgebruik is nog niet expliciet bevestigd.',
  })
  const followUpBlockers =
    args.record?.follow_up_decided_at || args.record?.lifecycle_stage === 'follow_up_decided' || args.record?.lifecycle_stage === 'learning_closed'
      ? []
      : ['Follow-up is nog niet expliciet besloten.']
  const learningCloseoutBlockers = dedupeMessages([
    ...followUpBlockers,
    ...(args.hasLearningCloseoutEvidence === false
      ? ['Learning closure mist nog expliciete review- of vervolgbewijslaag.']
      : []),
  ])

  const launchReady =
    dedupeMessages([...globalBlockers, ...intakeBlockers, ...importBlockers, ...launchInviteBlockers]).length === 0
  const activationReady = dedupeMessages([...globalBlockers, ...intakeBlockers, ...importBlockers, ...launchInviteBlockers, ...activationBlockers]).length === 0
  const firstValueReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...launchInviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
  ]).length === 0
  const reportDeliveryReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...launchInviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
  ]).length === 0
  const managementUseReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...launchInviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
    ...managementUseBlockers,
  ]).length === 0
  const followUpReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...launchInviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
    ...managementUseBlockers,
    ...followUpBlockers,
  ]).length === 0
  const learningCloseoutReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...launchInviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
    ...managementUseBlockers,
    ...learningCloseoutBlockers,
  ]).length === 0

  return {
    checkpointMap,
    globalBlockers,
    intakeBlockers,
    importBlockers,
    inviteBlockers: launchInviteBlockers,
    launchControlBlockers,
    activationBlockers,
    firstValueBlockers,
    reportDeliveryBlockers,
    managementUseBlockers,
    followUpBlockers,
    learningCloseoutBlockers,
    launchReady,
    activationReady,
    firstValueReady,
    reportDeliveryReady,
    managementUseReady,
    followUpReady,
    learningCloseoutReady,
  } satisfies DeliveryGovernanceSnapshot
}

export function buildDeliveryDisciplineWarnings(args: {
  record: CampaignDeliveryRecord | null
  linkedLeadPresent: boolean
  invitesNotSent: number
  pendingClientInviteCount: number
  incompleteScores: number
  activeClientAccessCount: number
  totalCompleted: number
  hasEnoughData: boolean
  governanceBlockers: string[]
  linkedLearningDossierCount?: number
  learningCloseoutEvidenceCount?: number
}) {
  const items: string[] = []

  if (!args.linkedLeadPresent) {
    items.push('De sales-to-delivery handoff is nog niet expliciet gekoppeld aan deze campaign.')
  }
  if (!args.record?.operator_owner?.trim()) {
    items.push('Er is nog geen expliciete delivery-owner vastgelegd voor deze campaign.')
  }
  if (args.invitesNotSent > 0) {
    items.push(`${args.invitesNotSent} respondent(en) hebben nog geen invite ontvangen of verzendbevestiging.`)
  }
  if (args.pendingClientInviteCount > 0 && args.activeClientAccessCount === 0) {
    items.push(`${args.pendingClientInviteCount} klantinvite(s) wachten nog op activatie.`)
  }
  if (args.incompleteScores > 0) {
    items.push(`${args.incompleteScores} opgeslagen responses hebben nog incomplete scoredata.`)
  }
  if (args.totalCompleted >= 5 && !args.hasEnoughData) {
    items.push('De campaign heeft een indicatief first-value beeld, maar nog geen stevig patroonniveau.')
  }
  if (args.record?.exception_status && args.record.exception_status !== 'none') {
    items.push(`Open exception: ${getDeliveryExceptionLabel(args.record.exception_status)}.`)
  }
  if (
    args.record &&
    isDeliveryLifecycleAtLeast(args.record.lifecycle_stage, 'client_activation_confirmed') &&
    !args.record.next_step?.trim()
  ) {
    items.push('Na klantactivatie ontbreekt nog een expliciete volgende stap voor delivery.')
  }
  if (
    args.record &&
    isDeliveryLifecycleAtLeast(args.record.lifecycle_stage, 'first_value_reached') &&
    !args.record.customer_handoff_note?.trim()
  ) {
    items.push('First value staat verder dan setup, maar de klant-handoff naar management use is nog niet expliciet vastgelegd.')
  }
  if (
    args.record &&
    isDeliveryLifecycleAtLeast(args.record.lifecycle_stage, 'first_management_use') &&
    !args.record.first_management_use_confirmed_at
  ) {
    items.push('Lifecycle staat al op of voorbij eerste management use, maar de bevestigingsdatum ontbreekt nog.')
  }
  if (
    args.record &&
    isDeliveryLifecycleAtLeast(args.record.lifecycle_stage, 'follow_up_decided') &&
    !args.record.follow_up_decided_at
  ) {
    items.push('Follow-up staat bestuurlijk verder, maar er is nog geen expliciete follow-upbeslissing gedateerd vastgelegd.')
  }
  if (
    args.record?.lifecycle_stage === 'learning_closed' &&
    (args.linkedLearningDossierCount ?? 0) > 0 &&
    (args.learningCloseoutEvidenceCount ?? 0) === 0
  ) {
    items.push('Learning staat op gesloten, maar expliciete review-, vervolg- of stopevidence ontbreekt nog.')
  }

  items.push(...args.governanceBlockers)

  return dedupeMessages(items)
}

export function validateDeliveryLifecycleTransition(args: {
  scanType: ScanType
  currentStage: DeliveryLifecycleStage
  targetStage: DeliveryLifecycleStage
  record: DeliveryRecordGovernanceContext | null
  checkpoints: CampaignDeliveryCheckpoint[]
  autoSignals: Record<DeliveryCheckpointKey, DeliveryAutoSignal>
  hasLearningCloseoutEvidence?: boolean
}) {
  const currentIndex = DELIVERY_LIFECYCLE_ORDER.indexOf(args.currentStage)
  const targetIndex = DELIVERY_LIFECYCLE_ORDER.indexOf(args.targetStage)

  if (targetIndex <= currentIndex) {
    return { allowed: true, blockers: [] as string[] }
  }

  const governance = buildDeliveryGovernanceSnapshot({
    scanType: args.scanType,
    record: args.record,
    checkpoints: args.checkpoints,
    autoSignals: args.autoSignals,
    hasLearningCloseoutEvidence: args.hasLearningCloseoutEvidence,
  })

  const blockers =
    args.targetStage === 'import_cleared'
      ? dedupeMessages([...governance.globalBlockers, ...governance.intakeBlockers])
      : args.targetStage === 'invites_live' || args.targetStage === 'client_activation_pending'
        ? dedupeMessages([
            ...governance.globalBlockers,
            ...governance.intakeBlockers,
            ...governance.importBlockers,
            ...governance.inviteBlockers,
          ])
        : args.targetStage === 'client_activation_confirmed'
          ? dedupeMessages([
              ...governance.globalBlockers,
              ...governance.intakeBlockers,
              ...governance.importBlockers,
              ...governance.inviteBlockers,
              ...governance.activationBlockers,
            ])
          : args.targetStage === 'first_value_reached'
            ? dedupeMessages([
                ...governance.globalBlockers,
                ...governance.intakeBlockers,
                ...governance.importBlockers,
                ...governance.inviteBlockers,
                ...governance.activationBlockers,
                ...governance.firstValueBlockers,
              ])
            : args.targetStage === 'first_management_use'
              ? dedupeMessages([
                  ...governance.globalBlockers,
                  ...governance.intakeBlockers,
                  ...governance.importBlockers,
                  ...governance.inviteBlockers,
                  ...governance.activationBlockers,
                  ...governance.firstValueBlockers,
                  ...governance.reportDeliveryBlockers,
                  ...governance.managementUseBlockers,
                ])
              : args.targetStage === 'follow_up_decided'
                ? dedupeMessages([
                    ...governance.globalBlockers,
                    ...governance.intakeBlockers,
                    ...governance.importBlockers,
                    ...governance.inviteBlockers,
                    ...governance.activationBlockers,
                    ...governance.firstValueBlockers,
                    ...governance.reportDeliveryBlockers,
                    ...governance.managementUseBlockers,
                  ])
                : dedupeMessages([
                    ...governance.globalBlockers,
                    ...governance.intakeBlockers,
                    ...governance.importBlockers,
                    ...governance.inviteBlockers,
                    ...governance.activationBlockers,
                    ...governance.firstValueBlockers,
                    ...governance.reportDeliveryBlockers,
                    ...governance.managementUseBlockers,
                    ...governance.learningCloseoutBlockers,
                  ])

  return {
    allowed: blockers.length === 0,
    blockers,
    governance,
  }
}

export function validateDeliveryCheckpointUpdate(args: {
  checkpointKey: DeliveryCheckpointKey
  manualState: DeliveryManualState
  exceptionStatus: DeliveryExceptionStatus
  autoState: DeliveryAutoState
  operatorNote: string | null | undefined
}) {
  const note = args.operatorNote?.trim() ?? ''

  if (args.exceptionStatus !== 'none' && note.length === 0) {
    return 'Een checkpoint met open exception vraagt een operator-note.'
  }

  if (args.manualState === 'not_applicable' && note.length === 0) {
    return 'Gebruik alleen "niet van toepassing" met een expliciete operator-note.'
  }

  if (args.manualState === 'confirmed' && args.autoState === 'not_ready' && note.length === 0) {
    return 'Bevestigen tegen een "nog niet klaar" autosignaal vraagt een expliciete operator-note.'
  }

  if (args.manualState === 'confirmed' && args.autoState === 'warning' && note.length === 0) {
    return 'Bevestigen tegen een warning-autosignaal vraagt een expliciete operator-note.'
  }

  return null
}

export function buildDeliveryOpsSummary(args: {
  scanType: ScanType
  record: DeliveryRecordGovernanceContext | null
  checkpoints: CampaignDeliveryCheckpoint[]
  autoSignals: Record<DeliveryCheckpointKey, DeliveryAutoSignal>
  hasLearningCloseoutEvidence?: boolean
}) {
  const governance = buildDeliveryGovernanceSnapshot({
    scanType: args.scanType,
    record: args.record,
    checkpoints: args.checkpoints,
    autoSignals: args.autoSignals,
    hasLearningCloseoutEvidence: args.hasLearningCloseoutEvidence,
  })
  const checkpointMap = governance.checkpointMap

  return {
    launchStatus: governance.launchReady
      ? 'Launch-ready'
      : governance.intakeBlockers.length === 0
        ? 'Launchdiscipline nog open'
        : 'Launch nog niet rond',
    launchTone: governance.launchReady ? 'emerald' : governance.inviteBlockers.length > 0 || governance.importBlockers.length > 0 ? 'amber' : 'slate',
    firstValueStatus: governance.firstValueReady
      ? 'First value bevestigd'
      : args.autoSignals.first_value.autoState === 'warning'
        ? 'First value nog indicatief'
        : 'First value nog in opbouw',
    firstValueTone: governance.firstValueReady ? 'emerald' : args.autoSignals.first_value.autoState === 'warning' ? 'amber' : 'slate',
    adoptionStatus: governance.managementUseReady
      ? 'Eerste managementgebruik bevestigd'
      : governance.reportDeliveryReady
        ? 'Managementgebruik nog bevestigen'
        : 'Nog geen managementgebruik',
    adoptionTone: governance.managementUseReady ? 'emerald' : governance.reportDeliveryReady ? 'amber' : 'slate',
    followUpStatus:
      governance.learningCloseoutReady
        ? 'Learning klaar voor closeout'
        : governance.followUpReady
          ? 'Follow-up besloten'
          : 'Follow-up nog open',
    followUpTone:
      governance.learningCloseoutReady || args.record?.lifecycle_stage === 'learning_closed'
        ? 'emerald'
        : governance.followUpReady
          ? 'blue'
          : 'slate',
    learningClosed: args.record?.lifecycle_stage === 'learning_closed',
    checkpointMap,
    governance,
  } as const
}
