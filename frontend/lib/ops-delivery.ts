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

type DeliveryAutoSignal = {
  autoState: DeliveryAutoState
  summary: string
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

function checkpointIsConfirmed(checkpoint: CampaignDeliveryCheckpoint | undefined) {
  return checkpoint?.manual_state === 'confirmed' || checkpoint?.manual_state === 'not_applicable'
}

export function buildDeliveryOpsSummary(args: {
  record: CampaignDeliveryRecord | null
  checkpoints: CampaignDeliveryCheckpoint[]
  autoSignals: Record<DeliveryCheckpointKey, DeliveryAutoSignal>
}) {
  const checkpointMap = Object.fromEntries(
    args.checkpoints.map((checkpoint) => [checkpoint.checkpoint_key, checkpoint]),
  ) as Partial<Record<DeliveryCheckpointKey, CampaignDeliveryCheckpoint>>

  const launchConfirmed =
    checkpointIsConfirmed(checkpointMap.implementation_intake) &&
    checkpointIsConfirmed(checkpointMap.import_qa) &&
    args.autoSignals.invite_readiness.autoState === 'ready'
  const launchReady = launchConfirmed && checkpointIsConfirmed(checkpointMap.client_activation)
  const adoptionConfirmed = checkpointIsConfirmed(checkpointMap.first_management_use)

  return {
    launchStatus: launchReady ? 'Launch-ready' : launchConfirmed ? 'Bijna launch-ready' : 'Launch nog niet rond',
    launchTone: launchReady ? 'emerald' : launchConfirmed ? 'amber' : 'slate',
    firstValueStatus:
      args.autoSignals.first_value.autoState === 'ready'
        ? checkpointIsConfirmed(checkpointMap.report_delivery)
          ? 'First value bevestigd'
          : 'First value inhoudelijk klaar'
        : args.autoSignals.first_value.autoState === 'warning'
          ? 'Indicatief first value'
          : 'First value nog in opbouw',
    firstValueTone:
      args.autoSignals.first_value.autoState === 'ready'
        ? 'emerald'
        : args.autoSignals.first_value.autoState === 'warning'
          ? 'amber'
          : 'slate',
    adoptionStatus: adoptionConfirmed
      ? 'Eerste managementgebruik bevestigd'
      : args.autoSignals.first_management_use.autoState === 'warning'
        ? 'Managementgebruik nog bevestigen'
        : 'Nog geen managementgebruik',
    adoptionTone: adoptionConfirmed ? 'emerald' : args.autoSignals.first_management_use.autoState === 'warning' ? 'amber' : 'slate',
    followUpStatus:
      args.record?.lifecycle_stage === 'follow_up_decided' || args.record?.lifecycle_stage === 'learning_closed'
        ? 'Follow-up besloten'
        : 'Follow-up nog open',
    followUpTone:
      args.record?.lifecycle_stage === 'follow_up_decided' || args.record?.lifecycle_stage === 'learning_closed'
        ? 'emerald'
        : 'slate',
    learningClosed: args.record?.lifecycle_stage === 'learning_closed',
    checkpointMap,
  } as const
}
