import type { SupabaseClient } from '@supabase/supabase-js'
import type { MemberRole } from '@/lib/types'

export type CampaignAuditActionKey =
  | 'import_respondents'
  | 'launch_invites'
  | 'send_reminders'
  | 'grant_client_access'
  | 'delivery_lifecycle_changed'
  | 'delivery_checkpoint_confirmed'

export type CampaignAuditOutcome = 'completed' | 'blocked'
export type CampaignAuditActorRole = MemberRole | 'verisight_admin' | 'unknown'

export const CAMPAIGN_AUDIT_ACTIONS: Record<
  CampaignAuditActionKey,
  { actionLabel: string; ownerLabel: string }
> = {
  import_respondents: {
    actionLabel: 'Deelnemersimport',
    ownerLabel: 'Klant owner',
  },
  launch_invites: {
    actionLabel: 'Uitnodigingen gestart',
    ownerLabel: 'Klant owner',
  },
  send_reminders: {
    actionLabel: 'Reminder verstuurd',
    ownerLabel: 'Klant owner',
  },
  grant_client_access: {
    actionLabel: 'Klanttoegang bijgewerkt',
    ownerLabel: 'Loep',
  },
  delivery_lifecycle_changed: {
    actionLabel: 'Uitvoerstatus bijgewerkt',
    ownerLabel: 'Loep',
  },
  delivery_checkpoint_confirmed: {
    actionLabel: 'Uitvoercheck bevestigd',
    ownerLabel: 'Loep',
  },
}

export interface CampaignAuditEventRecord {
  id?: string
  action_key: CampaignAuditActionKey
  outcome: CampaignAuditOutcome
  action_label: string
  owner_label: string
  actor_role: string | null
  actor_label: string | null
  summary: string
  metadata: Record<string, unknown>
  created_at?: string
}

function getDefaultActorLabel(role: CampaignAuditActorRole | null | undefined) {
  switch (role) {
    case 'owner':
      return 'Klant owner'
    case 'viewer':
      return 'Viewer'
    case 'member':
      return 'Member'
    case 'verisight_admin':
      return 'Loep beheer'
    default:
      return 'Onbekende actor'
  }
}

export function buildCampaignAuditEvent(args: {
  action: CampaignAuditActionKey
  outcome: CampaignAuditOutcome
  actorRole: CampaignAuditActorRole | null | undefined
  actorLabel?: string | null
  summary: string
  metadata?: Record<string, unknown>
}) {
  const action = CAMPAIGN_AUDIT_ACTIONS[args.action]

  return {
    action_key: args.action,
    outcome: args.outcome,
    action_label: action.actionLabel,
    owner_label: action.ownerLabel,
    actor_role: args.actorRole ?? null,
    actor_label: args.actorLabel?.trim() || getDefaultActorLabel(args.actorRole),
    summary: args.summary,
    metadata: args.metadata ?? {},
  } satisfies CampaignAuditEventRecord
}

export function formatCampaignAuditHeadline(event: Pick<CampaignAuditEventRecord, 'action_label' | 'outcome'>) {
  return `${event.outcome === 'blocked' ? 'Geblokkeerd' : 'Uitgevoerd'} - ${event.action_label}`
}

export async function insertCampaignAuditEvent(args: {
  supabase: Pick<SupabaseClient, 'from'>
  organizationId: string
  campaignId: string
  actorUserId?: string | null
  action: CampaignAuditActionKey
  outcome: CampaignAuditOutcome
  actorRole: CampaignAuditActorRole | null | undefined
  actorLabel?: string | null
  summary: string
  metadata?: Record<string, unknown>
}) {
  const payload = buildCampaignAuditEvent({
    action: args.action,
    outcome: args.outcome,
    actorRole: args.actorRole,
    actorLabel: args.actorLabel,
    summary: args.summary,
    metadata: args.metadata,
  })

  const { error } = await args.supabase.from('campaign_action_audit_events').insert({
    organization_id: args.organizationId,
    campaign_id: args.campaignId,
    actor_user_id: args.actorUserId ?? null,
    ...payload,
  })

  return { error }
}
