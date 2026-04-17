import type { ScanType } from '@/lib/types'

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
  { value: 'blocked', label: 'Blocked' },
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

export function buildDeliveryCheckpointMap(checkpoints: CampaignDeliveryCheckpoint[]) {
  return Object.fromEntries(
    checkpoints.map((checkpoint) => [checkpoint.checkpoint_key, checkpoint]),
  ) as Partial<Record<DeliveryCheckpointKey, CampaignDeliveryCheckpoint>>
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
      totalInvited > 0
        ? {
            autoState: 'warning',
            summary:
              totalInvited === 1
                ? '1 respondent staat in de campaign. Bevestig handmatig dat preview, metadata en importkeuze zijn gecontroleerd.'
                : `${totalInvited} respondenten staan in de campaign. Bevestig handmatig dat preview, metadata en importkeuze zijn gecontroleerd.`,
          }
        : {
            autoState: 'not_ready',
            summary: 'Nog geen respondenten geïmporteerd.',
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
  })
  const inviteBlockers = collectCheckpointBlockers({
    checkpoint: checkpointMap.invite_readiness,
    autoSignal: args.autoSignals.invite_readiness,
    pendingMessage: 'Invite readiness is nog niet expliciet bevestigd.',
  })
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
    dedupeMessages([...globalBlockers, ...intakeBlockers, ...importBlockers, ...inviteBlockers]).length === 0
  const activationReady = dedupeMessages([...globalBlockers, ...intakeBlockers, ...importBlockers, ...inviteBlockers, ...activationBlockers]).length === 0
  const firstValueReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...inviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
  ]).length === 0
  const reportDeliveryReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...inviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
  ]).length === 0
  const managementUseReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...inviteBlockers,
    ...activationBlockers,
    ...firstValueBlockers,
    ...reportDeliveryBlockers,
    ...managementUseBlockers,
  ]).length === 0
  const followUpReady = dedupeMessages([
    ...globalBlockers,
    ...intakeBlockers,
    ...importBlockers,
    ...inviteBlockers,
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
    ...inviteBlockers,
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
    inviteBlockers,
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
